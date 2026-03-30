import { useTournamentsData } from "@/hooks/use-tournaments-data";
import { FilterBar } from "@/components/FilterBar";
import { TournamentCard } from "@/components/TournamentCard";
import { useMemo } from "react";
import { CalendarX } from "lucide-react";
import { motion } from "framer-motion";

export default function Schedule() {
  const { tournaments, allTournaments, myListIds, toggleSaved, filters, isLoading } = useTournamentsData();

  const sortedTournaments = useMemo(() => {
    return [...tournaments].sort((a, b) => {
      const dateA = a.date || "";
      const dateB = b.date || "";
      if (dateA !== dateB) return dateA.localeCompare(dateB);
      return (a.time || "").localeCompare(b.time || "");
    });
  }, [tournaments]);

  const isFiltered = filters.activeFilterCount > 0 || filters.search.length > 0;

  return (
    <div className="min-h-screen pb-24 flex flex-col">
      <div className="relative pt-8 pb-4 px-4">
        <h1 className="text-2xl md:text-3xl font-display text-center text-gradient-gold">
          Summer Series 2026
        </h1>
        <p className="text-center text-muted-foreground mt-0.5 text-xs">
          Las Vegas &middot; WSOP &middot; Wynn &middot; Orleans
        </p>
      </div>

      <FilterBar {...filters} />

      {isFiltered && !isLoading && (
        <div className="text-center py-2 text-xs text-muted-foreground bg-secondary/30 border-b border-border/30">
          {tournaments.length} of {allTournaments.length} events
        </div>
      )}

      <main className="flex-1 max-w-2xl mx-auto w-full">
        {isLoading ? (
          <div className="px-4 py-6 space-y-4">
            {[1, 2, 3, 4, 5].map(i => (
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
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="flex flex-col items-center justify-center py-16 text-center px-4"
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
          <div className="bg-card/40">
            {sortedTournaments.map(tournament => (
              <TournamentCard
                key={tournament.id}
                tournament={tournament}
                isSaved={myListIds.includes(tournament.id)}
                onToggleSave={() => toggleSaved(tournament.id)}
              />
            ))}
          </div>
        )}
      </main>
    </div>
  );
}
