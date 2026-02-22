import { trpc } from "@/lib/trpc";

export function useSiteConfig() {
  const { data: config, isLoading } = trpc.siteConfig.get.useQuery();

  return {
    config,
    isLoading,
    font: config?.siteFont || "inter",
  };
}
