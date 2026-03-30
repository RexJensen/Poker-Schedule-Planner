import { Router, type IRouter } from "express";
import { db, myListTable } from "@workspace/db";
import { eq } from "drizzle-orm";
import { wynnTournaments } from "../data/wynn.js";
import { wsopTournaments } from "../data/wsop.js";

const router: IRouter = Router();

const allTournaments = [...wynnTournaments, ...wsopTournaments].sort((a, b) => {
  if (a.date !== b.date) return a.date.localeCompare(b.date);
  return a.time.localeCompare(b.time);
});

router.get("/", (req, res) => {
  let results = allTournaments;

  const { series, date, minEntry, maxEntry, gameType } = req.query as Record<string, string>;

  if (series && series !== "All") {
    results = results.filter((t) => t.series === series);
  }
  if (date) {
    results = results.filter((t) => t.date === date);
  }
  if (minEntry) {
    const min = parseFloat(minEntry);
    results = results.filter((t) => t.entryAmount !== null && t.entryAmount >= min);
  }
  if (maxEntry) {
    const max = parseFloat(maxEntry);
    results = results.filter((t) => t.entryAmount === null || t.entryAmount <= max);
  }
  if (gameType && gameType !== "All") {
    results = results.filter((t) => t.gameType === gameType);
  }

  res.json(results);
});

router.get("/my-list", async (req, res) => {
  try {
    const items = await db.select().from(myListTable);
    res.json(items.map((i) => i.id));
  } catch {
    res.json([]);
  }
});

router.put("/my-list", async (req, res) => {
  const { ids } = req.body as { ids: string[] };

  if (!Array.isArray(ids)) {
    res.status(400).json({ error: "ids must be an array" });
    return;
  }

  try {
    await db.delete(myListTable);
    if (ids.length > 0) {
      await db.insert(myListTable).values(ids.map((id) => ({ id })));
    }
    res.json(ids);
  } catch (err) {
    req.log.error({ err }, "Failed to update my list");
    res.status(500).json({ error: "Failed to update list" });
  }
});

export default router;
