import { CustomStrategyStorage } from "../custom-strategy-storage";

/**
 * Get all available strategies (built-in + custom) for client-side use
 * This combines server-fetched built-in strategies with localStorage custom strategies
 */
export async function getAllStrategies(): Promise<
  Array<{
    id: string;
    name: string;
    description: string;
    parameters: Record<
      string,
      { type: string; default: number | string; description: string }
    >;
    isCustom?: boolean;
  }>
> {
  console.log("[GET_ALL_STRATEGIES] Fetching strategies...");

  try {
    // Fetch built-in strategies from API
    const response = await fetch("/api/strategies");
    const data = await response.json();
    const builtInStrategies = data.strategies || [];

    console.log(
      `[GET_ALL_STRATEGIES] Loaded ${builtInStrategies.length} built-in strategies`
    );

    // Get custom strategies from localStorage
    const customStrategies = CustomStrategyStorage.getAll().map((strategy) => ({
      id: `custom_${strategy.id}`,
      name: strategy.name,
      description: strategy.description,
      parameters: {},
      isCustom: true,
    }));

    console.log(
      `[GET_ALL_STRATEGIES] Loaded ${customStrategies.length} custom strategies`
    );

    // Combine both
    const allStrategies = [...builtInStrategies, ...customStrategies];

    console.log(
      `[GET_ALL_STRATEGIES] Total strategies: ${allStrategies.length}`
    );

    return allStrategies;
  } catch (error) {
    console.error("[GET_ALL_STRATEGIES] Error fetching strategies:", error);
    return [];
  }
}
