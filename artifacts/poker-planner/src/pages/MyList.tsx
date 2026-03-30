import { useTournamentsData } from "@/hooks/use-tournaments-data";
import { TournamentCard } from "@/components/TournamentCard";
import { formatCurrency } from "@/lib/utils";
import { useMemo } from "react";
import { Star, DollarSign, CalendarDays } from "lucide-react";
import { motion } from "framer-motion";

export default function MyList() {
  const { myTournaments, myListIds, toggleSaved, budgetStats, isLoading } = useTournamentsData();

  const sortedTournaments = useMemo(() => {
    return [...myTournaments].sort((a, b) => {
      const dateA = a.date || "";
      const dateB = b.date || "";
      if (dateA !== dateB) return dateA.localeCompare(dateB);
      return (a.time || "").localeCompare(b.time || "");
    });
  }, [myTournaments]);

  return (
    <div className="min-h-screen pb-24 flex flex-col">
      <div className="pt-8 pb-4 px-4">
        <div className="max-w-2xl mx-auto">
          <h1 className="text-2xl font-display text-gradient-gold mb-4 text-center">
            My Schedule
          </h1>

          <div className="grid grid-cols-2 gap-3">
            <div className="bg-card/60 rounded-xl p-3 border border-border/40">
              <div className="flex items-center gap-1.5 mb-1">
                <DollarSign className="w-3.5 h-3.5 text-primary" />
                <span className="text-[10px] text-muted-foreground font-bold uppercase tracking-widest">
                  Total Buy-ins
                </span>
              </div>
              <p className="text-xl font-display text-gradient-gold">
                {formatCurrency(budgetStats.totalBuyIn)}
              </p>
            </div>

            <div className="bg-card/60 rounded-xl p-3 border border-border/40">
              <div className="flex items-center gap-1.5 mb-1">
                <CalendarDays className="w-3.5 h-3.5 text-primary" />
                <span className="text-[10px] text-muted-foreground font-bold uppercase tracking-widest">
                  Events
                </span>
              </div>
              <p className="text-xl font-display text-primary">
                {budgetStats.eventCount}
              </p>
            </div>
          </div>
        </div>
      </div>

      <main className="flex-1 max-w-2xl mx-auto w-full">
        {isLoading ? (
          <div className="px-4 py-4 space-y-3">
            {[1, 2].map(i => (
              <div key={i} className="flex gap-3 animate-pulse">
                <div className="w-[72px] h-20 bg-secondary/40 rounded" />
                <div className="flex-1 space-y-2 py-2">
                  <div className="h-4 bg-secondary/40 rounded w-3/4" />
                  <div className="h-3 bg-secondary/30 rounded w-1/2" />
                </div>
              </div>
            ))}
          </div>
        ) : sortedTournaments.length === 0 ? (
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex flex-col items-center justify-center py-16 text-center px-4"
          >
            <div className="w-16 h-16 rounded-full bg-card border border-dashed border-border/80 flex items-center justify-center mb-4">
              <Star className="w-7 h-7 text-muted-foreground" />
            </div>
            <h3 className="text-lg font-bold text-foreground mb-1 font-sans">No saved events yet</h3>
            <p className="text-sm text-muted-foreground max-w-xs leading-relaxed">
              Star tournaments from the schedule to build your personal lineup and track your budget.
            </p>
          </motion.div>
        ) : (
          <div className="bg-card/40">
            {sortedTournaments.map(tournament => (
              <TournamentCard
                key={tournament.id}
                tournament={tournament}
                isSaved={true}
                onToggleSave={() => toggleSaved(tournament.id)}
              />
            ))}
          </div>
        )}
      </main>
    </div>
  );
}
