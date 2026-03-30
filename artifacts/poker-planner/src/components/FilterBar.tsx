import { Search, SlidersHorizontal, X } from "lucide-react";
import { useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { cn } from "@/lib/utils";
import type { BuyinRange } from "@/hooks/use-tournaments-data";

interface FilterBarProps {
  search: string;
  setSearch: (v: string) => void;
  seriesFilter: string;
  setSeriesFilter: (v: string) => void;
  gameFilter: string;
  setGameFilter: (v: string) => void;
  buyinFilter: BuyinRange;
  setBuyinFilter: (v: BuyinRange) => void;
  activeFilterCount: number;
  clearAllFilters: () => void;
}

function FilterChip({ label, active, onClick }: { label: string; active: boolean; onClick: () => void }) {
  return (
    <button
      onClick={onClick}
      className={cn(
        "px-3.5 py-1.5 rounded-full text-xs font-semibold transition-all duration-200 whitespace-nowrap",
        active
          ? "bg-primary text-primary-foreground shadow-md shadow-primary/25"
          : "bg-secondary/80 text-secondary-foreground hover:bg-muted"
      )}
    >
      {label}
    </button>
  );
}

export function FilterBar({
  search, setSearch,
  seriesFilter, setSeriesFilter,
  gameFilter, setGameFilter,
  buyinFilter, setBuyinFilter,
  activeFilterCount,
  clearAllFilters,
}: FilterBarProps) {
  const [showFilters, setShowFilters] = useState(false);
  const hasAnyFilter = activeFilterCount > 0 || search.length > 0;

  return (
    <div className="sticky top-0 z-40 bg-background/85 backdrop-blur-xl border-b border-border/60 shadow-lg shadow-black/20">
      <div className="max-w-2xl mx-auto px-4 py-3 space-y-2">
        <div className="flex gap-2">
          <div className="relative flex-1">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <Search className="h-4 w-4 text-muted-foreground" />
            </div>
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="block w-full pl-9 pr-8 py-2.5 rounded-xl bg-card/80 border border-border text-sm text-foreground placeholder-muted-foreground focus:ring-2 focus:ring-primary/50 focus:border-primary/50 focus:outline-none transition-all"
              placeholder="Search events..."
            />
            {search && (
              <button 
                onClick={() => setSearch("")}
                className="absolute inset-y-0 right-0 pr-3 flex items-center"
              >
                <X className="h-3.5 w-3.5 text-muted-foreground hover:text-foreground transition-colors" />
              </button>
            )}
          </div>
          <button
            onClick={() => setShowFilters(!showFilters)}
            className={cn(
              "relative flex items-center justify-center w-11 rounded-xl border transition-all",
              showFilters || activeFilterCount > 0
                ? "bg-primary/15 border-primary/50 text-primary"
                : "bg-card/80 border-border text-muted-foreground hover:bg-secondary hover:text-foreground"
            )}
          >
            <SlidersHorizontal className="h-4 w-4" />
            {activeFilterCount > 0 && (
              <span className="absolute -top-1.5 -right-1.5 w-4.5 h-4.5 bg-primary text-primary-foreground text-[10px] font-bold rounded-full flex items-center justify-center shadow-lg shadow-primary/40">
                {activeFilterCount}
              </span>
            )}
          </button>
        </div>

        <AnimatePresence>
          {showFilters && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: "auto", opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              transition={{ duration: 0.2 }}
              className="overflow-hidden"
            >
              <div className="pt-1 pb-2 space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-muted-foreground uppercase tracking-widest">Filters</span>
                  {hasAnyFilter && (
                    <button
                      onClick={clearAllFilters}
                      className="text-xs text-primary font-semibold hover:underline"
                    >
                      Clear all
                    </button>
                  )}
                </div>

                <div>
                  <label className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest mb-1.5 block">
                    Series
                  </label>
                  <div className="flex flex-wrap gap-1.5">
                    {["All", "WSOP", "Wynn", "Orleans"].map(s => (
                      <FilterChip key={s} label={s} active={seriesFilter === s} onClick={() => setSeriesFilter(s)} />
                    ))}
                  </div>
                </div>

                <div>
                  <label className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest mb-1.5 block">
                    Game Type
                  </label>
                  <div className="flex flex-wrap gap-1.5">
                    {["All", "NLH", "PLO", "Mixed"].map(g => (
                      <FilterChip key={g} label={g} active={gameFilter === g} onClick={() => setGameFilter(g)} />
                    ))}
                  </div>
                </div>

                <div>
                  <label className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest mb-1.5 block">
                    Buy-in
                  </label>
                  <div className="flex flex-wrap gap-1.5">
                    {(["All", "Under $500", "$500-$1K", "$1K-$5K", "$5K-$10K", "$10K+"] as BuyinRange[]).map(b => (
                      <FilterChip key={b} label={b} active={buyinFilter === b} onClick={() => setBuyinFilter(b)} />
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
