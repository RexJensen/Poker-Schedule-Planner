import { Search, Filter, X } from "lucide-react";
import { useState } from "react";
import { AnimatePresence, motion } from "framer-motion";

interface FilterBarProps {
  search: string;
  setSearch: (v: string) => void;
  seriesFilter: string;
  setSeriesFilter: (v: string) => void;
  gameFilter: string;
  setGameFilter: (v: string) => void;
}

export function FilterBar({ search, setSearch, seriesFilter, setSeriesFilter, gameFilter, setGameFilter }: FilterBarProps) {
  const [showFilters, setShowFilters] = useState(false);

  return (
    <div className="sticky top-0 z-40 bg-background/80 backdrop-blur-xl border-b border-border p-4 shadow-sm">
      <div className="max-w-2xl mx-auto space-y-3">
        {/* Search Row */}
        <div className="flex gap-2">
          <div className="relative flex-1">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <Search className="h-5 w-5 text-muted-foreground" />
            </div>
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="block w-full pl-10 pr-3 py-3 rounded-xl bg-card border-border text-foreground placeholder-muted-foreground focus:ring-2 focus:ring-primary focus:border-primary sm:text-sm transition-all"
              placeholder="Search events, e.g. Main Event..."
            />
            {search && (
              <button 
                onClick={() => setSearch("")}
                className="absolute inset-y-0 right-0 pr-3 flex items-center"
              >
                <X className="h-4 w-4 text-muted-foreground hover:text-foreground" />
              </button>
            )}
          </div>
          <button
            onClick={() => setShowFilters(!showFilters)}
            className={`flex items-center justify-center p-3 rounded-xl border transition-all ${
              showFilters || seriesFilter !== "All" || gameFilter !== "All"
                ? "bg-primary/20 border-primary text-primary"
                : "bg-card border-border text-muted-foreground hover:bg-secondary"
            }`}
          >
            <Filter className="h-5 w-5" />
          </button>
        </div>

        {/* Expandable Filters */}
        <AnimatePresence>
          {showFilters && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: "auto", opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              className="overflow-hidden"
            >
              <div className="pt-2 space-y-4 pb-2">
                <div>
                  <label className="text-xs font-bold text-muted-foreground uppercase tracking-wider mb-2 block">
                    Series
                  </label>
                  <div className="flex flex-wrap gap-2">
                    {["All", "WSOP", "Wynn"].map(series => (
                      <button
                        key={series}
                        onClick={() => setSeriesFilter(series)}
                        className={`px-4 py-2 rounded-lg text-sm font-semibold transition-colors ${
                          seriesFilter === series
                            ? "bg-primary text-primary-foreground shadow-md shadow-primary/20"
                            : "bg-secondary text-secondary-foreground hover:bg-muted"
                        }`}
                      >
                        {series}
                      </button>
                    ))}
                  </div>
                </div>

                <div>
                  <label className="text-xs font-bold text-muted-foreground uppercase tracking-wider mb-2 block">
                    Game Type
                  </label>
                  <div className="flex flex-wrap gap-2">
                    {["All", "NLH", "PLO", "Mixed"].map(game => (
                      <button
                        key={game}
                        onClick={() => setGameFilter(game)}
                        className={`px-4 py-2 rounded-lg text-sm font-semibold transition-colors ${
                          gameFilter === game
                            ? "bg-primary text-primary-foreground shadow-md shadow-primary/20"
                            : "bg-secondary text-secondary-foreground hover:bg-muted"
                        }`}
                      >
                        {game}
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
