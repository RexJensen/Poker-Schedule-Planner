import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Star, Clock, Trophy, Zap, Crosshair, Plane, Coins, Info } from "lucide-react";
import { cn } from "@/lib/utils";
import type { Tournament } from "@workspace/api-client-react";
import { Badge } from "./ui/badge";

interface TournamentCardProps {
  tournament: Tournament;
  isSaved: boolean;
  onToggleSave: () => void;
}

export function TournamentCard({ tournament, isSaved, onToggleSave }: TournamentCardProps) {
  const [isExpanded, setIsExpanded] = useState(false);

  const seriesVariant = tournament.series?.toUpperCase().includes("WSOP") ? "wsop" : "wynn";
  const hasGuarantee = tournament.guarantee && tournament.guarantee.trim() !== "" && tournament.guarantee !== "N/A";

  return (
    <motion.div 
      layout
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, scale: 0.95 }}
      className={cn(
        "relative rounded-2xl overflow-hidden cursor-pointer",
        "bg-gradient-to-b from-card to-card/80",
        "border transition-all duration-300 shadow-lg",
        isExpanded ? "border-primary/40 shadow-primary/10" : "border-border hover:border-primary/20",
        isSaved && !isExpanded ? "border-primary/30" : ""
      )}
      onClick={() => setIsExpanded(!isExpanded)}
    >
      {/* Glow effect when saved */}
      {isSaved && (
        <div className="absolute -inset-1 bg-gradient-to-r from-primary/10 via-transparent to-primary/5 blur-xl -z-10 pointer-events-none" />
      )}

      <div className="p-4 relative z-10">
        <div className="flex justify-between items-start gap-3">
          <div className="flex-1 min-w-0">
            <div className="flex flex-wrap items-center gap-2 mb-2">
              <Badge variant={seriesVariant} className="uppercase tracking-wider font-display text-[10px]">
                {tournament.series} {tournament.eventNumber && `#${tournament.eventNumber}`}
              </Badge>
              <div className="flex items-center text-muted-foreground text-xs font-medium">
                <Clock className="w-3.5 h-3.5 mr-1 text-primary" />
                {tournament.time}
              </div>
            </div>
            
            <h3 className="text-base sm:text-lg font-bold text-foreground leading-tight line-clamp-2">
              {tournament.event}
            </h3>

            <div className="mt-3 flex items-end gap-4">
              <div>
                <p className="text-xs text-muted-foreground font-medium uppercase tracking-wider mb-0.5">Buy-in</p>
                <p className="text-lg font-display text-primary font-bold">
                  {tournament.entry || "N/A"}
                </p>
              </div>
              
              {hasGuarantee && (
                <div>
                  <p className="text-xs text-muted-foreground font-medium uppercase tracking-wider mb-0.5">Guarantee</p>
                  <p className="text-lg font-display text-gradient-gold font-bold">
                    {tournament.guarantee}
                  </p>
                </div>
              )}
            </div>
          </div>

          <button
            onClick={(e) => {
              e.stopPropagation();
              onToggleSave();
            }}
            className={cn(
              "shrink-0 p-3 rounded-xl border backdrop-blur-md transition-all duration-300",
              isSaved 
                ? "bg-primary/20 border-primary shadow-[0_0_15px_rgba(212,175,55,0.3)] text-primary" 
                : "bg-background/50 border-border text-muted-foreground hover:bg-secondary hover:text-foreground hover:border-muted-foreground/30"
            )}
          >
            <Star className={cn("w-6 h-6 transition-all", isSaved ? "fill-primary" : "")} />
          </button>
        </div>

        {/* Badges row for compact view */}
        <div className="mt-3 flex flex-wrap gap-1.5">
          {tournament.isMultiDay && <Badge variant="secondary"><Clock className="w-3 h-3 mr-1"/> Multi-Day</Badge>}
          {tournament.isTurbo && <Badge variant="secondary" className="bg-red-950/30 text-red-400 border-red-900/50"><Zap className="w-3 h-3 mr-1"/> Turbo</Badge>}
          {tournament.isBounty && <Badge variant="secondary" className="bg-emerald-950/30 text-emerald-400 border-emerald-900/50"><Crosshair className="w-3 h-3 mr-1"/> Bounty</Badge>}
          {tournament.isSatellite && <Badge variant="secondary" className="bg-blue-950/30 text-blue-400 border-blue-900/50"><Plane className="w-3 h-3 mr-1"/> Satellite</Badge>}
        </div>
      </div>

      {/* Expanded Details */}
      <AnimatePresence>
        {isExpanded && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            className="overflow-hidden bg-background/50 border-t border-border/50"
          >
            <div className="p-4 grid grid-cols-2 sm:grid-cols-4 gap-4">
              <div className="space-y-1">
                <div className="flex items-center text-xs text-muted-foreground">
                  <Coins className="w-3 h-3 mr-1.5" />
                  Starting Chips
                </div>
                <p className="font-semibold text-sm">{tournament.chips || "N/A"}</p>
              </div>
              
              <div className="space-y-1">
                <div className="flex items-center text-xs text-muted-foreground">
                  <Trophy className="w-3 h-3 mr-1.5" />
                  Levels
                </div>
                <p className="font-semibold text-sm">{tournament.levels || "N/A"}</p>
              </div>

              <div className="space-y-1">
                <div className="flex items-center text-xs text-muted-foreground">
                  <Clock className="w-3 h-3 mr-1.5" />
                  Late Reg
                </div>
                <p className="font-semibold text-sm">{tournament.lateReg || tournament.endOfReg || "N/A"}</p>
              </div>

              <div className="space-y-1">
                <div className="flex items-center text-xs text-muted-foreground">
                  <Info className="w-3 h-3 mr-1.5" />
                  Game Type
                </div>
                <p className="font-semibold text-sm">{tournament.gameType || "N/A"}</p>
              </div>
              
              {tournament.format && (
                <div className="col-span-2 sm:col-span-4 space-y-1 mt-2 pt-2 border-t border-border/30">
                  <div className="flex items-center text-xs text-muted-foreground">
                    Format Details
                  </div>
                  <p className="font-medium text-sm text-foreground/80">{tournament.format}</p>
                </div>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}
