import { useTournamentsData } from "@/hooks/use-tournaments-data";
import { TournamentCard } from "@/components/TournamentCard";
import { formatCurrency } from "@/lib/utils";
import { format, parseISO } from "date-fns";
import { useMemo } from "react";
import { Star, DollarSign, CalendarDays } from "lucide-react";
import { motion } from "framer-motion";

export default function MyList() {
  const { myTournaments, myListIds, toggleSaved, budgetStats, isLoading } = useTournamentsData();

  const groupedTournaments = useMemo(() => {
    const groups: Record<string, typeof myTournaments> = {};
    
    const sorted = [...myTournaments].sort((a, b) => {
      const dateA = a.date || "";
      const dateB = b.date || "";
      if (dateA !== dateB) return dateA.localeCompare(dateB);
      return (a.time || "").localeCompare(b.time || "");
    });

    sorted.forEach(t => {
      const d = t.date || "TBD";
      if (!groups[d]) groups[d] = [];
      groups[d].push(t);
    });
    
    return groups;
  }, [myTournaments]);

  return (
    <div className="min-h-screen pb-28 flex flex-col">
      <div className="pt-10 pb-6 px-4">
        <div className="max-w-2xl mx-auto">
          <h1 className="text-3xl font-display text-gradient-gold mb-5 text-center">
            My Schedule
          </h1>
          
          <div className="grid grid-cols-2 gap-3">
            <div className="bg-card/80 rounded-2xl p-4 border border-border/60">
              <div className="flex items-center gap-2 mb-1">
                <DollarSign className="w-4 h-4 text-primary" />
                <span className="text-[10px] text-muted-foreground font-bold uppercase tracking-widest">
                  Total Buy-ins
                </span>
              </div>
              <p className="text-2xl font-display text-gradient-gold">
                {formatCurrency(budgetStats.totalBuyIn)}
              </p>
            </div>
            
            <div className="bg-card/80 rounded-2xl p-4 border border-border/60">
              <div className="flex items-center gap-2 mb-1">
                <CalendarDays className="w-4 h-4 text-primary" />
                <span className="text-[10px] text-muted-foreground font-bold uppercase tracking-widest">
                  Events
                </span>
              </div>
              <p className="text-2xl font-display text-primary">
                {budgetStats.eventCount}
              </p>
            </div>
          </div>
        </div>
      </div>

      <main className="flex-1 max-w-2xl mx-auto w-full px-4">
        {isLoading ? (
          <div className="space-y-3">
            <div className="h-28 bg-card/60 animate-pulse rounded-2xl" />
            <div className="h-28 bg-card/60 animate-pulse rounded-2xl" />
          </div>
        ) : myTournaments.length === 0 ? (
          <motion.div 
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex flex-col items-center justify-center py-16 text-center"
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
          <div className="space-y-8">
            {Object.entries(groupedTournaments).map(([dateStr, dayTournaments]) => {
              let displayDate = dateStr;
              try {
                const d = parseISO(dateStr);
                displayDate = format(d, "EEE, MMM do");
              } catch {}

              return (
                <section key={dateStr}>
                  <div className="flex items-center justify-between mb-3 px-1">
                    <h2 className="text-sm font-display text-primary uppercase tracking-widest font-bold">
                      {displayDate}
                    </h2>
                    <span className="text-[10px] text-muted-foreground font-medium">
                      {dayTournaments.length} event{dayTournaments.length !== 1 ? "s" : ""}
                    </span>
                  </div>
                  <div className="space-y-3">
                    {dayTournaments.map(tournament => (
                      <TournamentCard
                        key={tournament.id}
                        tournament={tournament}
                        isSaved={true}
                        onToggleSave={() => toggleSaved(tournament.id)}
                      />
                    ))}
                  </div>
                </section>
              );
            })}
          </div>
        )}
      </main>
    </div>
  );
}
