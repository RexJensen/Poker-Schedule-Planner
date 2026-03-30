import { useState, useMemo, useCallback } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { 
  useGetTournaments, 
  useGetMyList, 
  useUpdateMyList,
  getGetMyListQueryKey 
} from "@workspace/api-client-react";

export type BuyinRange = "Under $500" | "$500-$1K" | "$1K-$5K" | "$5K-$10K" | "$10K+";

export const BUYIN_RANGE_BOUNDS: Record<BuyinRange, [number | null, number | null]> = {
  "Under $500": [null, 499],
  "$500-$1K": [500, 1000],
  "$1K-$5K": [1001, 5000],
  "$5K-$10K": [5001, 10000],
  "$10K+": [10001, null],
};

export const BUYIN_RANGE_OPTIONS: BuyinRange[] = ["Under $500", "$500-$1K", "$1K-$5K", "$5K-$10K", "$10K+"];

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
    if (buyinFilters.size > 0) count++;
    return count;
  }, [seriesFilter, gameFilter, buyinFilters]);

  const clearAllFilters = useCallback(() => {
    setSeriesFilter("All");
    setGameFilter("All");
    setBuyinFilters(new Set());
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

      if (buyinFilters.size > 0) {
        const amount = t.entryAmount;
        if (amount == null) return false;
        let matchesAny = false;
        for (const range of buyinFilters) {
          const [min, max] = BUYIN_RANGE_BOUNDS[range];
          if ((min === null || amount >= min) && (max === null || amount <= max)) {
            matchesAny = true;
            break;
          }
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
  }, [tournaments, search, seriesFilter, gameFilter, buyinFilters]);

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
      activeFilterCount,
      clearAllFilters,
    },
    budgetStats
  };
}
