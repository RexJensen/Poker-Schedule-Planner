import { Router, type IRouter } from "express";
import healthRouter from "./health.js";
import tournamentsRouter from "./tournaments.js";

const router: IRouter = Router();

router.use(healthRouter);
router.use("/tournaments", tournamentsRouter);

export default router;
