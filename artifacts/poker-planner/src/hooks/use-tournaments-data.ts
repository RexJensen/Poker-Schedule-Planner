import { useState, useMemo } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { 
  useGetTournaments, 
  useGetMyList, 
  useUpdateMyList,
  getGetMyListQueryKey 
} from "@workspace/api-client-react";
import type { Tournament } from "@workspace/api-client-react";

export function useTournamentsData() {
  const queryClient = useQueryClient();
  
  // Data Fetching
  const { data: tournaments = [], isLoading: isLoadingTournaments } = useGetTournaments();
  const { data: myListIds = [], isLoading: isLoadingList } = useGetMyList();
  
  // Mutations
  const updateListMutation = useUpdateMyList({
    mutation: {
      onMutate: async ({ data }) => {
        await queryClient.cancelQueries({ queryKey: getGetMyListQueryKey() });
        const previousList = queryClient.getQueryData<string[]>(getGetMyListQueryKey());
        queryClient.setQueryData<string[]>(getGetMyListQueryKey(), data.ids);
        return { previousList };
      },
      onError: (err, variables, context) => {
        if (context?.previousList) {
          queryClient.setQueryData(getGetMyListQueryKey(), context.previousList);
        }
      },
      onSettled: () => {
        queryClient.invalidateQueries({ queryKey: getGetMyListQueryKey() });
      }
    }
  });

  const toggleSaved = (id: string) => {
    const isCurrentlySaved = myListIds.includes(id);
    const newIds = isCurrentlySaved 
      ? myListIds.filter(savedId => savedId !== id)
      : [...myListIds, id];
      
    updateListMutation.mutate({ data: { ids: newIds } });
  };

  // Local Filter State
  const [search, setSearch] = useState("");
  const [seriesFilter, setSeriesFilter] = useState<string>("All");
  const [gameFilter, setGameFilter] = useState<string>("All");

  // Derived filtered data
  const filteredTournaments = useMemo(() => {
    return tournaments.filter(t => {
      if (seriesFilter !== "All" && t.series !== seriesFilter) return false;
      
      if (gameFilter !== "All") {
        const type = t.gameType?.toUpperCase() || "";
        if (gameFilter === "NLH" && !type.includes("NO-LIMIT HOLD'EM") && !type.includes("NLH")) return false;
        if (gameFilter === "PLO" && !type.includes("OMAHA") && !type.includes("PLO")) return false;
        if (gameFilter === "Mixed" && !type.includes("HORSE") && !type.includes("MIX") && !type.includes("8-GAME")) return false;
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
  }, [tournaments, search, seriesFilter, gameFilter]);

  // Derived budget info
  const myTournaments = useMemo(() => {
    return tournaments.filter(t => myListIds.includes(t.id));
  }, [tournaments, myListIds]);

  const budgetStats = useMemo(() => {
    let totalBuyIn = 0;
    let eventCount = myTournaments.length;
    
    myTournaments.forEach(t => {
      if (t.entryAmount) totalBuyIn += t.entryAmount;
    });

    return { totalBuyIn, eventCount };
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
      gameFilter, setGameFilter
    },
    budgetStats
  };
}
