/**
 * Custom Strategy Storage - LocalStorage based
 * Allows users to save and manage their custom trading strategies
 */

export interface CustomStrategyIndicator {
  type: "sma" | "ema" | "rsi" | "macd" | "bollinger" | "price";
  period?: number;
  params?: Record<string, number>;
}

export interface CustomStrategyCondition {
  id: string;
  indicator1: CustomStrategyIndicator;
  operator: ">" | "<" | ">=" | "<=" | "crosses_above" | "crosses_below";
  indicator2: CustomStrategyIndicator;
}

export interface CustomStrategyRule {
  type: "buy" | "sell";
  conditions: CustomStrategyCondition[];
  logic: "and" | "or"; // How to combine conditions
}

export interface CustomStrategy {
  id: string;
  name: string;
  description: string;
  buyRules: CustomStrategyRule[];
  sellRules: CustomStrategyRule[];
  parameters: Array<{
    name: string;
    label: string;
    type: "number";
    default: number;
    min: number;
    max: number;
    step: number;
  }>;
  createdAt: string;
  updatedAt: string;
}

const STORAGE_KEY = "kite_custom_strategies";

export class CustomStrategyStorage {
  /**
   * Get all custom strategies from localStorage
   */
  static getAll(): CustomStrategy[] {
    if (typeof window === "undefined") return [];

    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      return stored ? JSON.parse(stored) : [];
    } catch (error) {
      console.error("[CUSTOM_STRATEGY] Error loading strategies:", error);
      return [];
    }
  }

  /**
   * Get a single strategy by ID
   */
  static get(id: string): CustomStrategy | null {
    const strategies = this.getAll();
    return strategies.find((s) => s.id === id) || null;
  }

  /**
   * Save a new strategy
   */
  static save(
    strategy: Omit<CustomStrategy, "id" | "createdAt" | "updatedAt">
  ): CustomStrategy {
    const strategies = this.getAll();
    const newStrategy: CustomStrategy = {
      ...strategy,
      id: `custom_${Date.now()}_${Math.random().toString(36).substring(7)}`,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    strategies.push(newStrategy);
    this.saveAll(strategies);

    console.log("[CUSTOM_STRATEGY] Saved new strategy:", newStrategy.id);
    return newStrategy;
  }

  /**
   * Update an existing strategy
   */
  static update(
    id: string,
    updates: Partial<CustomStrategy>
  ): CustomStrategy | null {
    const strategies = this.getAll();
    const index = strategies.findIndex((s) => s.id === id);

    if (index === -1) {
      console.error("[CUSTOM_STRATEGY] Strategy not found:", id);
      return null;
    }

    strategies[index] = {
      ...strategies[index],
      ...updates,
      id, // Ensure ID doesn't change
      updatedAt: new Date().toISOString(),
    };

    this.saveAll(strategies);
    console.log("[CUSTOM_STRATEGY] Updated strategy:", id);
    return strategies[index];
  }

  /**
   * Delete a strategy
   */
  static delete(id: string): boolean {
    const strategies = this.getAll();
    const filtered = strategies.filter((s) => s.id !== id);

    if (filtered.length === strategies.length) {
      console.error("[CUSTOM_STRATEGY] Strategy not found:", id);
      return false;
    }

    this.saveAll(filtered);
    console.log("[CUSTOM_STRATEGY] Deleted strategy:", id);
    return true;
  }

  /**
   * Save all strategies to localStorage
   */
  private static saveAll(strategies: CustomStrategy[]): void {
    if (typeof window === "undefined") return;

    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(strategies));
    } catch (error) {
      console.error("[CUSTOM_STRATEGY] Error saving strategies:", error);
    }
  }

  /**
   * Clear all custom strategies
   */
  static clear(): void {
    if (typeof window === "undefined") return;
    localStorage.removeItem(STORAGE_KEY);
    console.log("[CUSTOM_STRATEGY] Cleared all strategies");
  }

  /**
   * Export strategies as JSON
   */
  static export(): string {
    return JSON.stringify(this.getAll(), null, 2);
  }

  /**
   * Import strategies from JSON
   */
  static import(json: string): boolean {
    try {
      const strategies = JSON.parse(json) as CustomStrategy[];

      // Validate structure
      if (!Array.isArray(strategies)) {
        throw new Error("Invalid format: expected array");
      }

      this.saveAll(strategies);
      console.log(
        "[CUSTOM_STRATEGY] Imported",
        strategies.length,
        "strategies"
      );
      return true;
    } catch (error) {
      console.error("[CUSTOM_STRATEGY] Error importing strategies:", error);
      return false;
    }
  }
}
