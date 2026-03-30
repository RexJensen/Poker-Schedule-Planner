import { Search, SlidersHorizontal, X, ChevronDown } from "lucide-react";
import { useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { cn } from "@/lib/utils";
import type { BuyinRange, CustomBuyinRange } from "@/hooks/use-tournaments-data";
import { BUYIN_RANGE_OPTIONS } from "@/hooks/use-tournaments-data";

interface FilterBarProps {
  search: string;
  setSearch: (v: string) => void;
  seriesFilter: string;
  setSeriesFilter: (v: string) => void;
  gameFilter: string;
  setGameFilter: (v: string) => void;
  buyinFilters: Set<BuyinRange>;
  toggleBuyinFilter: (v: BuyinRange) => void;
  customBuyin: CustomBuyinRange;
  setCustomBuyin: (v: CustomBuyinRange) => void;
  activeFilterCount: number;
  clearAllFilters: () => void;
}

function FilterChip({ label, active, onClick }: { label: string; active: boolean; onClick: () => void }) {
  return (
    <button
      onClick={onClick}
      className={cn(
        "px-3 py-1.5 rounded-full text-xs font-semibold transition-all duration-200 whitespace-nowrap",
        active
          ? "bg-primary text-primary-foreground shadow-sm shadow-primary/25"
          : "bg-secondary/60 text-secondary-foreground hover:bg-muted"
      )}
    >
      {label}
    </button>
  );
}

function parseDollarInput(val: string): number | null {
  const cleaned = val.replace(/[$,\s]/g, "");
  if (cleaned === "") return null;
  const num = parseInt(cleaned, 10);
  return isNaN(num) ? null : num;
}

function formatDollarInput(val: number | null): string {
  if (val === null) return "";
  return val.toLocaleString("en-US");
}

function InlinePill({ label, value, isActive, onClick }: { label: string; value: string; isActive: boolean; onClick: () => void }) {
  return (
    <button
      onClick={onClick}
      className={cn(
        "flex items-center gap-1 px-3 py-1.5 rounded-full text-xs font-medium border transition-all",
        isActive
          ? "border-primary/50 bg-primary/10 text-primary"
          : "border-border/60 bg-card/60 text-foreground/80 hover:bg-card"
      )}
    >
      <span className="text-muted-foreground">{label}:</span>
      <span className="font-semibold">{value}</span>
      <ChevronDown className="w-3 h-3 text-muted-foreground" />
    </button>
  );
}

export function FilterBar({
  search, setSearch,
  seriesFilter, setSeriesFilter,
  gameFilter, setGameFilter,
  buyinFilters, toggleBuyinFilter,
  customBuyin, setCustomBuyin,
  activeFilterCount,
  clearAllFilters,
}: FilterBarProps) {
  const [openPanel, setOpenPanel] = useState<"series" | "game" | "buyin" | null>(null);
  const [showSearch, setShowSearch] = useState(false);
  const [showCustomRange, setShowCustomRange] = useState(false);
  const [customMinInput, setCustomMinInput] = useState("");
  const [customMaxInput, setCustomMaxInput] = useState("");
  const hasAnyFilter = activeFilterCount > 0 || search.length > 0;
  const hasCustomBuyin = customBuyin.min !== null || customBuyin.max !== null;

  const buyinLabel = buyinFilters.size === 0 && !hasCustomBuyin
    ? "All"
    : buyinFilters.size === 1 && !hasCustomBuyin
      ? [...buyinFilters][0]
      : `${buyinFilters.size + (hasCustomBuyin ? 1 : 0)} selected`;

  const togglePanel = (panel: "series" | "game" | "buyin") => {
    setOpenPanel(prev => prev === panel ? null : panel);
  };

  const applyCustomRange = () => {
    const min = parseDollarInput(customMinInput);
    const max = parseDollarInput(customMaxInput);
    setCustomBuyin({ min, max });
  };

  const clearCustomRange = () => {
    setCustomBuyin({ min: null, max: null });
    setCustomMinInput("");
    setCustomMaxInput("");
    setShowCustomRange(false);
  };

  return (
    <div className="sticky top-0 z-40 bg-background/90 backdrop-blur-xl border-b border-border/50">
      <div className="max-w-2xl mx-auto">
        <div className="flex items-center gap-2 px-4 py-2.5 overflow-x-auto scrollbar-hide">
          <InlinePill
            label="Series"
            value={seriesFilter}
            isActive={seriesFilter !== "All"}
            onClick={() => togglePanel("series")}
          />
          <InlinePill
            label="Games"
            value={gameFilter}
            isActive={gameFilter !== "All"}
            onClick={() => togglePanel("game")}
          />
          <InlinePill
            label="Buy-In"
            value={buyinLabel}
            isActive={buyinFilters.size > 0 || hasCustomBuyin}
            onClick={() => togglePanel("buyin")}
          />

          <div className="ml-auto flex items-center gap-1.5 shrink-0">
            {hasAnyFilter && (
              <button
                onClick={() => { clearAllFilters(); setOpenPanel(null); }}
                className="text-[10px] text-primary font-semibold hover:underline whitespace-nowrap"
              >
                Clear
              </button>
            )}
            <button
              onClick={() => { setShowSearch(!showSearch); setOpenPanel(null); }}
              className={cn(
                "p-1.5 rounded-lg transition-all",
                showSearch || search
                  ? "text-primary"
                  : "text-muted-foreground hover:text-foreground"
              )}
            >
              <Search className="w-4 h-4" />
            </button>
            <button
              onClick={() => setOpenPanel(openPanel ? null : "series")}
              className={cn(
                "p-1.5 rounded-lg transition-all",
                openPanel
                  ? "text-primary"
                  : "text-muted-foreground hover:text-foreground"
              )}
            >
              <SlidersHorizontal className="w-4 h-4" />
            </button>
          </div>
        </div>

        <AnimatePresence>
          {showSearch && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: "auto", opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              transition={{ duration: 0.15 }}
              className="overflow-hidden border-t border-border/30"
            >
              <div className="px-4 py-2">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                  <input
                    type="text"
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    autoFocus
                    className="w-full pl-9 pr-8 py-2 rounded-lg bg-card/80 border border-border text-sm text-foreground placeholder-muted-foreground focus:ring-1 focus:ring-primary/50 focus:border-primary/50 focus:outline-none transition-all"
                    placeholder="Search events..."
                  />
                  {search && (
                    <button onClick={() => setSearch("")} className="absolute right-3 top-1/2 -translate-y-1/2">
                      <X className="w-3.5 h-3.5 text-muted-foreground hover:text-foreground" />
                    </button>
                  )}
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        <AnimatePresence>
          {openPanel && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: "auto", opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              transition={{ duration: 0.15 }}
              className="overflow-hidden border-t border-border/30"
            >
              <div className="px-4 py-3">
                {openPanel === "series" && (
                  <div className="flex flex-wrap gap-1.5">
                    {["All", "WSOP", "Wynn", "Orleans"].map(s => (
                      <FilterChip key={s} label={s} active={seriesFilter === s} onClick={() => { setSeriesFilter(s); setOpenPanel(null); }} />
                    ))}
                  </div>
                )}

                {openPanel === "game" && (
                  <div className="flex flex-wrap gap-1.5">
                    {["All", "NLH", "PLO", "Mixed"].map(g => (
                      <FilterChip key={g} label={g} active={gameFilter === g} onClick={() => { setGameFilter(g); setOpenPanel(null); }} />
                    ))}
                  </div>
                )}

                {openPanel === "buyin" && (
                  <div className="space-y-2">
                    <div className="flex flex-wrap gap-1.5">
                      {BUYIN_RANGE_OPTIONS.map(b => (
                        <FilterChip key={b} label={b} active={buyinFilters.has(b)} onClick={() => toggleBuyinFilter(b)} />
                      ))}
                      <button
                        onClick={() => setShowCustomRange(!showCustomRange)}
                        className={cn(
                          "px-3 py-1.5 rounded-full text-xs font-semibold transition-all duration-200 whitespace-nowrap border border-dashed",
                          hasCustomBuyin
                            ? "bg-primary text-primary-foreground border-primary shadow-sm shadow-primary/25"
                            : showCustomRange
                              ? "bg-secondary text-foreground border-muted-foreground/40"
                              : "bg-transparent text-muted-foreground border-muted-foreground/30 hover:text-foreground"
                        )}
                      >
                        {hasCustomBuyin
                          ? `$${formatDollarInput(customBuyin.min) || "0"} – $${formatDollarInput(customBuyin.max) || "∞"}`
                          : "Custom"}
                      </button>
                    </div>

                    <AnimatePresence>
                      {showCustomRange && (
                        <motion.div
                          initial={{ height: 0, opacity: 0 }}
                          animate={{ height: "auto", opacity: 1 }}
                          exit={{ height: 0, opacity: 0 }}
                          transition={{ duration: 0.15 }}
                          className="overflow-hidden"
                        >
                          <div className="flex items-center gap-2 pt-1">
                            <div className="relative flex-1">
                              <span className="absolute inset-y-0 left-2.5 flex items-center text-muted-foreground text-xs">$</span>
                              <input
                                type="text"
                                inputMode="numeric"
                                placeholder="Min"
                                value={customMinInput}
                                onChange={(e) => setCustomMinInput(e.target.value.replace(/[^0-9]/g, ""))}
                                onBlur={applyCustomRange}
                                onKeyDown={(e) => e.key === "Enter" && applyCustomRange()}
                                className="w-full pl-6 pr-2 py-2 rounded-lg bg-card/80 border border-border text-xs text-foreground placeholder-muted-foreground focus:ring-1 focus:ring-primary/50 focus:outline-none"
                              />
                            </div>
                            <span className="text-muted-foreground text-xs">to</span>
                            <div className="relative flex-1">
                              <span className="absolute inset-y-0 left-2.5 flex items-center text-muted-foreground text-xs">$</span>
                              <input
                                type="text"
                                inputMode="numeric"
                                placeholder="Max"
                                value={customMaxInput}
                                onChange={(e) => setCustomMaxInput(e.target.value.replace(/[^0-9]/g, ""))}
                                onBlur={applyCustomRange}
                                onKeyDown={(e) => e.key === "Enter" && applyCustomRange()}
                                className="w-full pl-6 pr-2 py-2 rounded-lg bg-card/80 border border-border text-xs text-foreground placeholder-muted-foreground focus:ring-1 focus:ring-primary/50 focus:outline-none"
                              />
                            </div>
                            {hasCustomBuyin && (
                              <button onClick={clearCustomRange} className="p-1.5 rounded-lg text-muted-foreground hover:text-foreground">
                                <X className="w-3.5 h-3.5" />
                              </button>
                            )}
                          </div>
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </div>
                )}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
