import { useTournamentsData } from "@/hooks/use-tournaments-data";
import { TournamentCard } from "@/components/TournamentCard";
import { formatCurrency } from "@/lib/utils";
import { format, parseISO } from "date-fns";
import { useMemo } from "react";
import { StarOff, Wallet, Hash } from "lucide-react";
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
    <div className="min-h-screen pb-32 flex flex-col">
      <div className="pt-12 pb-8 px-4 bg-card/50 border-b border-border shadow-md">
        <div className="max-w-2xl mx-auto">
          <h1 className="text-3xl font-display text-foreground font-bold mb-6 flex items-center gap-3">
            <StarOff className="w-8 h-8 text-primary" /> 
            My Schedule
          </h1>
          
          <div className="grid grid-cols-2 gap-4">
            <div className="bg-background rounded-2xl p-5 border border-border shadow-inner relative overflow-hidden">
              <div className="absolute top-0 right-0 p-4 opacity-5">
                <Wallet className="w-16 h-16" />
              </div>
              <p className="text-sm text-muted-foreground font-bold uppercase tracking-wider mb-1">
                Total Buy-ins
              </p>
              <p className="text-3xl font-display text-gradient-gold">
                {formatCurrency(budgetStats.totalBuyIn)}
              </p>
            </div>
            
            <div className="bg-background rounded-2xl p-5 border border-border shadow-inner relative overflow-hidden">
              <div className="absolute top-0 right-0 p-4 opacity-5">
                <Hash className="w-16 h-16" />
              </div>
              <p className="text-sm text-muted-foreground font-bold uppercase tracking-wider mb-1">
                Events
              </p>
              <p className="text-3xl font-display text-primary">
                {budgetStats.eventCount}
              </p>
            </div>
          </div>
        </div>
      </div>

      <main className="flex-1 max-w-2xl mx-auto w-full px-4 mt-8">
        {isLoading ? (
          <div className="space-y-4">
            <div className="h-32 bg-card animate-pulse rounded-2xl" />
            <div className="h-32 bg-card animate-pulse rounded-2xl" />
          </div>
        ) : myTournaments.length === 0 ? (
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex flex-col items-center justify-center py-16 text-center"
          >
            <div className="w-24 h-24 rounded-full bg-card border-2 border-dashed border-border flex items-center justify-center mb-6">
              <StarOff className="w-10 h-10 text-muted-foreground" />
            </div>
            <h3 className="text-2xl font-display text-foreground mb-3">No Saved Events</h3>
            <p className="text-muted-foreground max-w-sm leading-relaxed">
              You haven't added any tournaments to your schedule yet. Go to the main schedule to star events you want to play.
            </p>
          </motion.div>
        ) : (
          <div className="space-y-10">
            {Object.entries(groupedTournaments).map(([dateStr, dayTournaments]) => {
              let displayDate = dateStr;
              try {
                const d = parseISO(dateStr);
                displayDate = format(d, "EEEE, MMMM do");
              } catch (e) {
                // fallback
              }

              return (
                <section key={dateStr}>
                  <h2 className="text-lg font-display text-primary uppercase tracking-widest font-bold mb-4 px-2">
                    {displayDate}
                  </h2>
                  <div className="space-y-4">
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
