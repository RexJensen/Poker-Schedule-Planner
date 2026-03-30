import { useTournamentsData } from "@/hooks/use-tournaments-data";
import { FilterBar } from "@/components/FilterBar";
import { TournamentCard } from "@/components/TournamentCard";
import { format, parseISO } from "date-fns";
import { useMemo } from "react";
import { CalendarX } from "lucide-react";
import { motion } from "framer-motion";

export default function Schedule() {
  const { tournaments, myListIds, toggleSaved, filters, isLoading } = useTournamentsData();

  // Group tournaments by date
  const groupedTournaments = useMemo(() => {
    const groups: Record<string, typeof tournaments> = {};
    
    // Sort chronologically first
    const sorted = [...tournaments].sort((a, b) => {
      const dateA = a.date || "";
      const dateB = b.date || "";
      if (dateA !== dateB) return dateA.localeCompare(dateB);
      // Rough time sort if dates are equal
      return (a.time || "").localeCompare(b.time || "");
    });

    sorted.forEach(t => {
      const d = t.date || "TBD";
      if (!groups[d]) groups[d] = [];
      groups[d].push(t);
    });
    
    return groups;
  }, [tournaments]);

  return (
    <div className="min-h-screen pb-32 flex flex-col">
      <div className="relative pt-12 pb-6 px-4 bg-gradient-to-b from-background to-background/0 z-10">
        <h1 className="text-4xl md:text-5xl font-display text-center text-gradient-gold">
          Summer Series
        </h1>
        <p className="text-center text-muted-foreground mt-2 font-medium">Plan your Vegas grind</p>
      </div>

      <FilterBar {...filters} />

      <main className="flex-1 max-w-2xl mx-auto w-full px-4 mt-6">
        {isLoading ? (
          <div className="space-y-8">
            {[1, 2, 3].map(i => (
              <div key={i} className="animate-pulse">
                <div className="h-6 w-32 bg-secondary rounded mb-4" />
                <div className="space-y-4">
                  <div className="h-32 bg-card rounded-2xl border border-border" />
                  <div className="h-32 bg-card rounded-2xl border border-border" />
                </div>
              </div>
            ))}
          </div>
        ) : tournaments.length === 0 ? (
          <motion.div 
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="flex flex-col items-center justify-center py-20 text-center"
          >
            <div className="w-20 h-20 bg-secondary rounded-full flex items-center justify-center mb-6 shadow-inner">
              <CalendarX className="w-10 h-10 text-muted-foreground" />
            </div>
            <h3 className="text-xl font-bold text-foreground mb-2">No tournaments found</h3>
            <p className="text-muted-foreground max-w-sm">
              Try adjusting your filters or search term to find what you're looking for.
            </p>
          </motion.div>
        ) : (
          <div className="space-y-10">
            {Object.entries(groupedTournaments).map(([dateStr, dayTournaments]) => {
              // Parse date for nice formatting
              let displayDate = dateStr;
              try {
                const d = parseISO(dateStr);
                displayDate = format(d, "EEEE, MMMM do");
              } catch (e) {
                // fallback
              }

              return (
                <section key={dateStr} className="relative">
                  <div className="sticky top-[88px] z-30 py-2 bg-background/90 backdrop-blur-md border-y border-border/50 mb-4 -mx-4 px-4 sm:rounded-xl sm:border-x sm:mx-0">
                    <h2 className="text-lg font-display text-primary uppercase tracking-widest font-bold">
                      {displayDate}
                    </h2>
                  </div>
                  
                  <div className="space-y-4">
                    {dayTournaments.map(tournament => (
                      <TournamentCard
                        key={tournament.id}
                        tournament={tournament}
                        isSaved={myListIds.includes(tournament.id)}
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
