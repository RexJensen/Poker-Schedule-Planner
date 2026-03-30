import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Star, Clock, Trophy, Zap, Crosshair, Plane, Coins } from "lucide-react";
import { cn } from "@/lib/utils";
import type { Tournament } from "@workspace/api-client-react";
import { format, parseISO } from "date-fns";

interface TournamentCardProps {
  tournament: Tournament;
  isSaved: boolean;
  onToggleSave: () => void;
}

function getSeriesColor(series: string | undefined) {
  const s = (series || "").toUpperCase();
  if (s.includes("WSOP")) return "bg-amber-600";
  if (s.includes("ORLEANS")) return "bg-rose-600";
  return "bg-sky-600";
}

function formatTime12(time: string | undefined): string {
  if (!time) return "";
  return time.replace(/\.\s*$/, "").replace(/\.M\./, "M");
}

export function TournamentCard({ tournament, isSaved, onToggleSave }: TournamentCardProps) {
  const [isExpanded, setIsExpanded] = useState(false);

  const hasGuarantee = tournament.guarantee && tournament.guarantee.trim() !== "" && tournament.guarantee !== "N/A";

  let monthDay = "";
  let dayOfWeek = "";
  try {
    const d = parseISO(tournament.date || "");
    monthDay = format(d, "MMM d");
    dayOfWeek = format(d, "EEE").toUpperCase();
  } catch {}

  const timeStr = formatTime12(tournament.time);

  const tags = [
    tournament.isMultiDay && { label: "Multi-Day", icon: Clock },
    tournament.isTurbo && { label: "Turbo", icon: Zap },
    tournament.isBounty && { label: "Bounty", icon: Crosshair },
    tournament.isSatellite && { label: "Satellite", icon: Plane },
  ].filter(Boolean) as { label: string; icon: typeof Clock }[];

  return (
    <div className="border-b border-border/40 last:border-b-0">
      <div
        className="flex cursor-pointer active:bg-white/[0.02] transition-colors"
        onClick={() => setIsExpanded(!isExpanded)}
      >
        <div className={cn(
          "w-[72px] shrink-0 flex flex-col items-center justify-center py-3 px-1 border-r border-border/30",
          getSeriesColor(tournament.series),
          "bg-opacity-15"
        )}>
          <span className="text-[11px] font-bold text-foreground/90 leading-tight">{monthDay}</span>
          <span className="text-[10px] font-bold text-primary tracking-wider">{dayOfWeek}</span>
          <span className="text-[10px] text-muted-foreground mt-0.5 leading-tight text-center">{timeStr}</span>
        </div>

        <div className="flex-1 min-w-0 py-3 px-3">
          <div className="flex items-start justify-between gap-2">
            <div className="flex-1 min-w-0">
              <h3 className="text-[13px] font-bold text-foreground leading-snug font-sans line-clamp-2">
                {tournament.eventNumber ? `#${tournament.eventNumber}: ` : ""}
                {tournament.event}
              </h3>

              <div className="flex items-center gap-3 mt-1.5 text-xs text-muted-foreground">
                <span>
                  Buy-In <span className="text-foreground font-semibold">{tournament.entry || "N/A"}</span>
                </span>
                {hasGuarantee && (
                  <span>
                    Prize <span className="text-gradient-gold font-semibold">{tournament.guarantee}</span>
                  </span>
                )}
              </div>

              {tags.length > 0 && (
                <div className="flex flex-wrap gap-1 mt-1.5">
                  {tags.map(tag => (
                    <span key={tag.label} className="inline-flex items-center gap-0.5 px-1.5 py-0.5 rounded text-[9px] font-semibold bg-secondary/60 text-muted-foreground">
                      <tag.icon className="w-2.5 h-2.5" />
                      {tag.label}
                    </span>
                  ))}
                </div>
              )}
            </div>

            <div className="flex items-center gap-2 shrink-0 pt-0.5">
              <span className={cn(
                "text-[9px] font-bold uppercase tracking-wider px-1.5 py-0.5 rounded",
                getSeriesColor(tournament.series),
                "bg-opacity-20 text-foreground/80"
              )}>
                {tournament.series}
              </span>
              <motion.button
                whileTap={{ scale: 0.85 }}
                onClick={(e) => {
                  e.stopPropagation();
                  onToggleSave();
                }}
                className={cn(
                  "p-1.5 rounded-lg transition-all duration-200",
                  isSaved
                    ? "text-primary"
                    : "text-muted-foreground/40 hover:text-muted-foreground"
                )}
              >
                <Star className={cn("w-5 h-5", isSaved ? "fill-primary" : "")} />
              </motion.button>
            </div>
          </div>
        </div>
      </div>

      <AnimatePresence>
        {isExpanded && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="overflow-hidden"
          >
            <div className="pl-[72px] pr-4 pb-3">
              <div className="border-t border-border/20 pt-2">
                <div className="grid grid-cols-2 gap-2">
                  <DetailRow label="Starting Chips" value={tournament.chips || "N/A"} />
                  <DetailRow label="Levels" value={tournament.levels || "N/A"} />
                  <DetailRow label="Late Reg" value={tournament.lateReg || tournament.endOfReg || "N/A"} />
                  <DetailRow label="Game Type" value={tournament.gameType || "N/A"} />
                </div>
                {tournament.format && (
                  <p className="mt-2 text-[11px] text-muted-foreground/70 leading-relaxed">
                    {tournament.format}
                  </p>
                )}
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

function DetailRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="text-[11px]">
      <span className="text-muted-foreground">{label}: </span>
      <span className="text-foreground/80 font-medium">{value}</span>
    </div>
  );
}
