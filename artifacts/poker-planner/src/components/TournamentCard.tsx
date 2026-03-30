import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Star, Clock, Trophy, Zap, Crosshair, Plane, Coins, ChevronDown } from "lucide-react";
import { cn, formatCurrency } from "@/lib/utils";
import type { Tournament } from "@workspace/api-client-react";
import { Badge } from "./ui/badge";

interface TournamentCardProps {
  tournament: Tournament;
  isSaved: boolean;
  onToggleSave: () => void;
}

export function TournamentCard({ tournament, isSaved, onToggleSave }: TournamentCardProps) {
  const [isExpanded, setIsExpanded] = useState(false);

  const seriesUpper = tournament.series?.toUpperCase() || "";
  const isWsop = seriesUpper.includes("WSOP");
  const isOrleans = seriesUpper.includes("ORLEANS");
  const hasGuarantee = tournament.guarantee && tournament.guarantee.trim() !== "" && tournament.guarantee !== "N/A";

  const tags = [
    tournament.isMultiDay && { label: "Multi-Day", icon: Clock, color: "bg-violet-950/40 text-violet-300 border-violet-800/40" },
    tournament.isTurbo && { label: "Turbo", icon: Zap, color: "bg-red-950/40 text-red-300 border-red-800/40" },
    tournament.isBounty && { label: "Bounty", icon: Crosshair, color: "bg-emerald-950/40 text-emerald-300 border-emerald-800/40" },
    tournament.isSatellite && { label: "Satellite", icon: Plane, color: "bg-sky-950/40 text-sky-300 border-sky-800/40" },
  ].filter(Boolean) as { label: string; icon: typeof Clock; color: string }[];

  return (
    <motion.div 
      layout
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      className={cn(
        "relative rounded-2xl overflow-hidden",
        "bg-card/90 backdrop-blur-sm",
        "border transition-all duration-200",
        isSaved ? "border-primary/30 shadow-[0_0_20px_-5px_rgba(212,175,55,0.15)]" : "border-border/60 hover:border-border",
      )}
    >
      <div 
        className="p-4 cursor-pointer active:bg-white/[0.02] transition-colors"
        onClick={() => setIsExpanded(!isExpanded)}
      >
        <div className="flex gap-3">
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 mb-1.5">
              <span className={cn(
                "inline-flex items-center px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider",
                isWsop 
                  ? "bg-amber-900/40 text-amber-300 border border-amber-700/30" 
                  : isOrleans
                    ? "bg-rose-900/40 text-rose-300 border border-rose-700/30"
                    : "bg-sky-900/40 text-sky-300 border border-sky-700/30"
              )}>
                {tournament.series}{tournament.eventNumber ? ` #${tournament.eventNumber}` : ""}
              </span>
              <span className="text-xs text-muted-foreground flex items-center gap-1">
                <Clock className="w-3 h-3" />
                {tournament.time}
              </span>
            </div>
            
            <h3 className="text-sm font-bold text-foreground leading-snug mb-2 line-clamp-2 font-sans">
              {tournament.event}
            </h3>

            <div className="flex items-baseline gap-3">
              <span className="text-base font-bold text-primary font-display">
                {tournament.entry || "N/A"}
              </span>
              {hasGuarantee && (
                <span className="text-xs text-muted-foreground">
                  GTD <span className="text-gradient-gold font-semibold">{tournament.guarantee}</span>
                </span>
              )}
            </div>

            {tags.length > 0 && (
              <div className="flex flex-wrap gap-1 mt-2">
                {tags.map(tag => (
                  <span key={tag.label} className={cn("inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-semibold border", tag.color)}>
                    <tag.icon className="w-2.5 h-2.5" />
                    {tag.label}
                  </span>
                ))}
              </div>
            )}
          </div>

          <div className="flex flex-col items-center gap-2 shrink-0">
            <motion.button
              whileTap={{ scale: 0.85 }}
              onClick={(e) => {
                e.stopPropagation();
                onToggleSave();
              }}
              className={cn(
                "p-2.5 rounded-xl border transition-all duration-200",
                isSaved 
                  ? "bg-primary/15 border-primary/40 text-primary shadow-[0_0_12px_-2px_rgba(212,175,55,0.3)]" 
                  : "bg-card border-border/60 text-muted-foreground hover:text-foreground hover:border-border"
              )}
            >
              <Star className={cn("w-5 h-5 transition-all", isSaved ? "fill-primary" : "")} />
            </motion.button>
            <ChevronDown className={cn(
              "w-4 h-4 text-muted-foreground transition-transform duration-200",
              isExpanded && "rotate-180"
            )} />
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
            <div className="px-4 pb-4 pt-1 border-t border-border/30">
              <div className="grid grid-cols-2 gap-3 text-sm">
                <DetailItem icon={Coins} label="Starting Chips" value={tournament.chips || "N/A"} />
                <DetailItem icon={Trophy} label="Levels" value={tournament.levels || "N/A"} />
                <DetailItem icon={Clock} label="Late Reg" value={tournament.lateReg || tournament.endOfReg || "N/A"} />
                <DetailItem icon={Clock} label="Game" value={tournament.gameType || "N/A"} />
              </div>
              {tournament.format && (
                <p className="mt-3 pt-3 border-t border-border/30 text-xs text-muted-foreground leading-relaxed">
                  {tournament.format}
                </p>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}

function DetailItem({ icon: Icon, label, value }: { icon: typeof Clock; label: string; value: string }) {
  return (
    <div>
      <div className="flex items-center gap-1 text-[10px] text-muted-foreground uppercase tracking-wider mb-0.5">
        <Icon className="w-3 h-3" />
        {label}
      </div>
      <p className="font-semibold text-xs text-foreground/90">{value}</p>
    </div>
  );
}
