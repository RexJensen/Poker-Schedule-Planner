import { useState, useMemo, useCallback } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { 
  useGetTournaments, 
  useGetMyList, 
  useUpdateMyList,
  getGetMyListQueryKey 
} from "@workspace/api-client-react";

export type BuyinRange = "Under $1,500" | "$1,500-$4,999" | "$5K-$9,999" | "$10K-$99,999" | "$100K+";

export const BUYIN_RANGE_BOUNDS: Record<BuyinRange, [number | null, number | null]> = {
  "Under $1,500": [null, 1499],
  "$1,500-$4,999": [1500, 4999],
  "$5K-$9,999": [5000, 9999],
  "$10K-$99,999": [10000, 99999],
  "$100K+": [100000, null],
};

export const BUYIN_RANGE_OPTIONS: BuyinRange[] = ["Under $1,500", "$1,500-$4,999", "$5K-$9,999", "$10K-$99,999", "$100K+"];

export interface CustomBuyinRange {
  min: number | null;
  max: number | null;
}

function matchesAmount(amount: number, min: number | null, max: number | null): boolean {
  if (min !== null && amount < min) return false;
  if (max !== null && amount > max) return false;
  return true;
}

export function useTournamentsData() {
  const queryClient = useQueryClient();
  
  const { data: tournaments = [], isLoading: isLoadingTournaments } = useGetTournaments();
  const { data: myListIds = [], isLoading: isLoadingList } = useGetMyList();
  
  const updateListMutation = useUpdateMyList({
    mutation: {
      onMutate: async ({ data }) => {
        await queryClient.cancelQueries({ queryKey: getGetMyListQueryKey() });
        const previousList = queryClient.getQueryData<string[]>(getGetMyListQueryKey());
        queryClient.setQueryData<string[]>(getGetMyListQueryKey(), data.ids);
        return { previousList };
      },
      onError: (_err, _variables, context) => {
        if (context?.previousList) {
          queryClient.setQueryData(getGetMyListQueryKey(), context.previousList);
        }
      },
      onSettled: () => {
        queryClient.invalidateQueries({ queryKey: getGetMyListQueryKey() });
      }
    }
  });

  const toggleSaved = useCallback((id: string) => {
    const isCurrentlySaved = myListIds.includes(id);
    const newIds = isCurrentlySaved 
      ? myListIds.filter(savedId => savedId !== id)
      : [...myListIds, id];
      
    updateListMutation.mutate({ data: { ids: newIds } });
  }, [myListIds, updateListMutation]);

  const [search, setSearch] = useState("");
  const [seriesFilter, setSeriesFilter] = useState<string>("All");
  const [gameFilter, setGameFilter] = useState<string>("All");
  const [buyinFilters, setBuyinFilters] = useState<Set<BuyinRange>>(new Set());
  const [customBuyin, setCustomBuyin] = useState<CustomBuyinRange>({ min: null, max: null });

  const hasCustomBuyin = customBuyin.min !== null || customBuyin.max !== null;

  const toggleBuyinFilter = useCallback((range: BuyinRange) => {
    setBuyinFilters(prev => {
      const next = new Set(prev);
      if (next.has(range)) {
        next.delete(range);
      } else {
        next.add(range);
      }
      return next;
    });
  }, []);

  const activeFilterCount = useMemo(() => {
    let count = 0;
    if (seriesFilter !== "All") count++;
    if (gameFilter !== "All") count++;
    if (buyinFilters.size > 0 || hasCustomBuyin) count++;
    return count;
  }, [seriesFilter, gameFilter, buyinFilters, hasCustomBuyin]);

  const clearAllFilters = useCallback(() => {
    setSeriesFilter("All");
    setGameFilter("All");
    setBuyinFilters(new Set());
    setCustomBuyin({ min: null, max: null });
    setSearch("");
  }, []);

  const filteredTournaments = useMemo(() => {
    return tournaments.filter(t => {
      if (seriesFilter !== "All" && t.series !== seriesFilter) return false;
      
      if (gameFilter !== "All") {
        const type = (t.gameType || "").toUpperCase();
        const event = (t.event || "").toUpperCase();
        if (gameFilter === "NLH") {
          if (!type.includes("NO-LIMIT HOLD") && !type.includes("NLH") && !event.includes("NLH") && !event.includes("NO-LIMIT HOLD")) return false;
        } else if (gameFilter === "PLO") {
          if (!type.includes("OMAHA") && !type.includes("PLO") && !event.includes("OMAHA") && !event.includes("PLO")) return false;
        } else if (gameFilter === "Mixed") {
          if (!type.includes("HORSE") && !type.includes("MIX") && !type.includes("8-GAME") && !event.includes("HORSE") && !event.includes("MIX") && !event.includes("8-GAME") && !event.includes("DEALER")) return false;
        }
      }

      const hasBuyinFilter = buyinFilters.size > 0 || hasCustomBuyin;
      if (hasBuyinFilter) {
        const amount = t.entryAmount;
        if (amount == null) return false;
        let matchesAny = false;
        for (const range of buyinFilters) {
          const [min, max] = BUYIN_RANGE_BOUNDS[range];
          if (matchesAmount(amount, min, max)) {
            matchesAny = true;
            break;
          }
        }
        if (!matchesAny && hasCustomBuyin) {
          matchesAny = matchesAmount(amount, customBuyin.min, customBuyin.max);
        }
        if (!matchesAny) return false;
      }

      if (search) {
        const q = search.toLowerCase();
        const eventMatch = t.event?.toLowerCase().includes(q);
        const formatMatch = t.format?.toLowerCase().includes(q);
        const gameMatch = t.gameType?.toLowerCase().includes(q);
        if (!eventMatch && !formatMatch && !gameMatch) return false;
      }

      return true;
    });
  }, [tournaments, search, seriesFilter, gameFilter, buyinFilters, customBuyin, hasCustomBuyin]);

  const myTournaments = useMemo(() => {
    return tournaments.filter(t => myListIds.includes(t.id));
  }, [tournaments, myListIds]);

  const budgetStats = useMemo(() => {
    let totalBuyIn = 0;
    myTournaments.forEach(t => {
      if (t.entryAmount) totalBuyIn += t.entryAmount;
    });
    return { totalBuyIn, eventCount: myTournaments.length };
  }, [myTournaments]);

  return {
    tournaments: filteredTournaments,
    allTournaments: tournaments,
    myTournaments,
    myListIds,
    isLoading: isLoadingTournaments || isLoadingList,
    toggleSaved,
    filters: {
      search, setSearch,
      seriesFilter, setSeriesFilter,
      gameFilter, setGameFilter,
      buyinFilters, toggleBuyinFilter,
      customBuyin, setCustomBuyin,
      activeFilterCount,
      clearAllFilters,
    },
    budgetStats
  };
}
