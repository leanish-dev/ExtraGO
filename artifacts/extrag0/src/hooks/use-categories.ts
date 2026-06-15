import { useQuery } from "@tanstack/react-query";
import { apiFetch } from "@/lib/api-fetch";
import { CATEGORIES as STATIC_CATEGORIES } from "@/lib/categories";

interface GovernanceCategory {
  id: number;
  name: string;
  slug: string;
  icon?: string | null;
  color?: string | null;
  status: string;
  displayOrder?: number | null;
}

/**
 * useCategories — returns the governance-managed category list.
 * Falls back to the static CATEGORIES array when the DB table is empty
 * or the request fails, ensuring the platform always has a usable list.
 */
export function useCategories() {
  const { data, isLoading, isError } = useQuery<GovernanceCategory[]>({
    queryKey: ["governance-categories"],
    queryFn: () => apiFetch("/categories"),
    staleTime: 5 * 60 * 1000,
    retry: 1,
  });

  const liveNames: string[] =
    data && data.length > 0
      ? data.map((c) => c.name)
      : STATIC_CATEGORIES.map((c) => c.name);

  const liveEntries =
    data && data.length > 0
      ? data.map((c) => ({
          slug: c.slug,
          name: c.name,
          icon: c.icon ?? "",
          color: c.color ?? "#7CFC00",
          description: "",
          subspecialties: [] as string[],
        }))
      : STATIC_CATEGORIES;

  return {
    categories: liveEntries,
    categoryNames: liveNames,
    isLoading,
    isError,
  };
}
