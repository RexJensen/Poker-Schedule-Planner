import { useState, useMemo, useEffect } from "react";
import { ChevronLeft, ChevronRight, Star, X } from "lucide-react";
import { cn } from "@/lib/utils";
import type { Tournament } from "@workspace/api-client-react";
import { format, parseISO, startOfMonth, endOfMonth, startOfWeek, endOfWeek, addDays, isSameMonth, isSameDay, addMonths, subMonths } from "date-fns";
import { AnimatePresence, motion } from "framer-motion";

interface CalendarViewProps {
  tournaments: Tournament[];
  myListIds: string[];
  onToggleSave: (id: string) => void;
}

function getSeriesDotColor(series: string | undefined) {
  const s = (series || "").toUpperCase();
  if (s.includes("WSOP")) return "bg-amber-500";
  if (s.includes("ORLEANS")) return "bg-rose-500";
  return "bg-sky-500";
}

function getSeriesBorderColor(series: string | undefined) {
  const s = (series || "").toUpperCase();
  if (s.includes("WSOP")) return "border-l-amber-500";
  if (s.includes("ORLEANS")) return "border-l-rose-500";
  return "border-l-sky-500";
}

function formatTime12(time: string | undefined): string {
  if (!time) return "";
  return time.replace(/\.\s*$/, "").replace(/\.M\./, "M");
}

export function CalendarView({ tournaments, myListIds, onToggleSave }: CalendarViewProps) {
  const [currentMonth, setCurrentMonth] = useState(() => {
    const dates = tournaments.map(t => t.date).filter(Boolean).sort();
    if (dates.length > 0) {
      return startOfMonth(parseISO(dates[0]));
    }
    return startOfMonth(new Date(2026, 5, 1));
  });
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);

  const tournamentsByDate = useMemo(() => {
    const map = new Map<string, Tournament[]>();
    for (const t of tournaments) {
      if (!t.date) continue;
      const key = t.date;
      if (!map.has(key)) map.set(key, []);
      map.get(key)!.push(t);
    }
    for (const [, arr] of map) {
      arr.sort((a, b) => (a.time || "").localeCompare(b.time || ""));
    }
    return map;
  }, [tournaments]);

  const calendarDays = useMemo(() => {
    const monthStart = startOfMonth(currentMonth);
    const monthEnd = endOfMonth(currentMonth);
    const calStart = startOfWeek(monthStart, { weekStartsOn: 0 });
    const calEnd = endOfWeek(monthEnd, { weekStartsOn: 0 });

    const days: Date[] = [];
    let day = calStart;
    while (day <= calEnd) {
      days.push(day);
      day = addDays(day, 1);
    }
    return days;
  }, [currentMonth]);

  const selectedTournaments = useMemo(() => {
    if (!selectedDate) return [];
    const key = format(selectedDate, "yyyy-MM-dd");
    return tournamentsByDate.get(key) || [];
  }, [selectedDate, tournamentsByDate]);

  useEffect(() => {
    if (selectedDate) {
      const key = format(selectedDate, "yyyy-MM-dd");
      if (!tournamentsByDate.has(key)) {
        setSelectedDate(null);
      }
    }
  }, [tournamentsByDate, selectedDate]);

  const dateRange = useMemo(() => {
    const dates = tournaments.map(t => t.date).filter(Boolean).sort();
    if (dates.length === 0) return { min: null, max: null };
    return { min: parseISO(dates[0]), max: parseISO(dates[dates.length - 1]) };
  }, [tournaments]);

  const canGoBack = dateRange.min ? startOfMonth(subMonths(currentMonth, 1)) >= startOfMonth(subMonths(dateRange.min, 1)) : true;
  const canGoForward = dateRange.max ? startOfMonth(addMonths(currentMonth, 1)) <= startOfMonth(addMonths(dateRange.max, 1)) : true;

  return (
    <div className="flex flex-col">
      <div className="flex items-center justify-between px-4 py-3">
        <button
          onClick={() => canGoBack && setCurrentMonth(subMonths(currentMonth, 1))}
          disabled={!canGoBack}
          className={cn(
            "p-2 rounded-lg transition-colors",
            canGoBack ? "text-foreground hover:bg-secondary/60 active:bg-secondary" : "text-muted-foreground/30"
          )}
        >
          <ChevronLeft className="w-5 h-5" />
        </button>
        <h2 className="text-lg font-display text-foreground">
          {format(currentMonth, "MMMM yyyy")}
        </h2>
        <button
          onClick={() => canGoForward && setCurrentMonth(addMonths(currentMonth, 1))}
          disabled={!canGoForward}
          className={cn(
            "p-2 rounded-lg transition-colors",
            canGoForward ? "text-foreground hover:bg-secondary/60 active:bg-secondary" : "text-muted-foreground/30"
          )}
        >
          <ChevronRight className="w-5 h-5" />
        </button>
      </div>

      <div className="grid grid-cols-7 px-2">
        {["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"].map(d => (
          <div key={d} className="text-center text-[10px] font-bold text-muted-foreground uppercase tracking-wider py-2">
            {d}
          </div>
        ))}
      </div>

      <div className="grid grid-cols-7 px-2 gap-px bg-border/20">
        {calendarDays.map((day, i) => {
          const dateKey = format(day, "yyyy-MM-dd");
          const dayTournaments = tournamentsByDate.get(dateKey) || [];
          const isCurrentMonth = isSameMonth(day, currentMonth);
          const isSelected = selectedDate && isSameDay(day, selectedDate);
          const isToday = isSameDay(day, new Date());
          const hasEvents = dayTournaments.length > 0;

          const uniqueSeries = [...new Set(dayTournaments.map(t => t.series))];

          return (
            <button
              key={i}
              onClick={() => {
                if (isSelected) {
                  setSelectedDate(null);
                } else if (hasEvents) {
                  setSelectedDate(day);
                }
              }}
              className={cn(
                "relative flex flex-col items-center py-1.5 min-h-[52px] bg-background transition-all",
                !isCurrentMonth && "opacity-30",
                (hasEvents || isSelected) && "cursor-pointer active:bg-secondary/60",
                !hasEvents && !isSelected && "cursor-default",
                isSelected && "bg-primary/10 ring-1 ring-primary/40"
              )}
            >
              <span className={cn(
                "text-xs font-medium w-6 h-6 flex items-center justify-center rounded-full",
                isToday && "bg-primary text-primary-foreground font-bold",
                isSelected && !isToday && "text-primary font-bold"
              )}>
                {format(day, "d")}
              </span>

              {hasEvents && (
                <div className="flex flex-col items-center gap-0.5 mt-0.5">
                  <div className="flex items-center gap-[2px]">
                    {uniqueSeries.slice(0, 3).map((series, si) => (
                      <span key={si} className={cn("w-[5px] h-[5px] rounded-full", getSeriesDotColor(series))} />
                    ))}
                  </div>
                  <span className="text-[9px] font-bold text-muted-foreground leading-none">
                    {dayTournaments.length}
                  </span>
                </div>
              )}
            </button>
          );
        })}
      </div>

      <AnimatePresence>
        {selectedDate && selectedTournaments.length > 0 && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="overflow-hidden"
          >
            <div className="border-t border-border/40 bg-card/40">
              <div className="flex items-center justify-between px-4 py-2.5 border-b border-border/30">
                <h3 className="text-sm font-bold text-foreground">
                  {format(selectedDate, "EEEE, MMMM d")}
                  <span className="ml-2 text-xs font-normal text-muted-foreground">
                    {selectedTournaments.length} event{selectedTournaments.length !== 1 ? "s" : ""}
                  </span>
                </h3>
                <button
                  onClick={() => setSelectedDate(null)}
                  className="p-1 rounded-lg text-muted-foreground hover:text-foreground"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              <div className="max-h-[40vh] overflow-y-auto">
                {selectedTournaments.map(t => {
                  const isSaved = myListIds.includes(t.id);
                  return (
                    <div
                      key={t.id}
                      className={cn(
                        "flex items-start gap-3 px-4 py-2.5 border-b border-border/20 last:border-b-0 border-l-2",
                        getSeriesBorderColor(t.series)
                      )}
                    >
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-0.5">
                          <span className="text-[10px] font-bold text-muted-foreground">
                            {formatTime12(t.time)}
                          </span>
                          <span className={cn(
                            "text-[8px] font-bold uppercase tracking-wider px-1.5 py-0.5 rounded",
                            getSeriesDotColor(t.series),
                            "bg-opacity-20 text-foreground/80"
                          )}>
                            {t.series}
                          </span>
                        </div>
                        <h4 className="text-[12px] font-semibold text-foreground leading-snug line-clamp-2">
                          {t.eventNumber ? `#${t.eventNumber}: ` : ""}
                          {t.event}
                        </h4>
                        <div className="flex items-center gap-3 mt-1 text-[11px] text-muted-foreground">
                          {t.entry && <span>{t.entry}</span>}
                          {t.guarantee && t.guarantee !== "N/A" && (
                            <span className="text-gradient-gold font-semibold">{t.guarantee}</span>
                          )}
                        </div>
                      </div>
                      <motion.button
                        whileTap={{ scale: 0.85 }}
                        onClick={() => onToggleSave(t.id)}
                        className={cn(
                          "p-1 rounded-lg transition-all duration-200 shrink-0 mt-1",
                          isSaved ? "text-primary" : "text-muted-foreground/40 hover:text-muted-foreground"
                        )}
                      >
                        <Star className={cn("w-4 h-4", isSaved ? "fill-primary" : "")} />
                      </motion.button>
                    </div>
                  );
                })}
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
