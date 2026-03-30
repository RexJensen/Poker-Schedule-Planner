import { useTournamentsData } from "@/hooks/use-tournaments-data";
import { FilterBar } from "@/components/FilterBar";
import { TournamentCard } from "@/components/TournamentCard";
import { format, parseISO } from "date-fns";
import { useMemo } from "react";
import { CalendarX } from "lucide-react";
import { motion } from "framer-motion";

export default function Schedule() {
  const { tournaments, allTournaments, myListIds, toggleSaved, filters, isLoading } = useTournamentsData();

  const groupedTournaments = useMemo(() => {
    const groups: Record<string, typeof tournaments> = {};
    
    const sorted = [...tournaments].sort((a, b) => {
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
  }, [tournaments]);

  const isFiltered = filters.activeFilterCount > 0 || filters.search.length > 0;

  return (
    <div className="min-h-screen pb-28 flex flex-col">
      <div className="relative pt-10 pb-5 px-4">
        <h1 className="text-3xl md:text-4xl font-display text-center text-gradient-gold">
          Summer Series
        </h1>
        <p className="text-center text-muted-foreground mt-1 text-sm">
          Las Vegas 2026
        </p>
      </div>

      <FilterBar {...filters} />

      <main className="flex-1 max-w-2xl mx-auto w-full px-4 mt-4">
        {isFiltered && !isLoading && (
          <div className="mb-4 text-xs text-muted-foreground text-center">
            Showing <span className="text-foreground font-semibold">{tournaments.length}</span> of {allTournaments.length} events
          </div>
        )}

        {isLoading ? (
          <div className="space-y-6">
            {[1, 2, 3].map(i => (
              <div key={i} className="animate-pulse">
                <div className="h-5 w-28 bg-secondary rounded mb-3" />
                <div className="space-y-3">
                  <div className="h-28 bg-card/60 rounded-2xl border border-border/40" />
                  <div className="h-28 bg-card/60 rounded-2xl border border-border/40" />
                </div>
              </div>
            ))}
          </div>
        ) : tournaments.length === 0 ? (
          <motion.div 
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="flex flex-col items-center justify-center py-16 text-center"
          >
            <div className="w-16 h-16 bg-secondary/60 rounded-full flex items-center justify-center mb-4">
              <CalendarX className="w-8 h-8 text-muted-foreground" />
            </div>
            <h3 className="text-lg font-bold text-foreground mb-1 font-sans">No events match</h3>
            <p className="text-sm text-muted-foreground max-w-xs">
              Try adjusting your filters or search to find tournaments.
            </p>
            {isFiltered && (
              <button
                onClick={filters.clearAllFilters}
                className="mt-4 text-sm text-primary font-semibold hover:underline"
              >
                Clear all filters
              </button>
            )}
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
                  <div className="sticky top-[52px] z-30 py-2 -mx-4 px-4 bg-background/90 backdrop-blur-md">
                    <div className="flex items-center justify-between">
                      <h2 className="text-sm font-display text-primary uppercase tracking-widest font-bold">
                        {displayDate}
                      </h2>
                      <span className="text-[10px] text-muted-foreground font-medium">
                        {dayTournaments.length} event{dayTournaments.length !== 1 ? "s" : ""}
                      </span>
                    </div>
                  </div>
                  
                  <div className="space-y-3 mt-2">
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
