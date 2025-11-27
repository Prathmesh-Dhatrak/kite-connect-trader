import { BaseStrategy } from "./base";
import { SMACrossoverStrategy } from "./sma-crossover";
import { RSIStrategy } from "./rsi";
import { MACDStrategy } from "./macd";
import { BollingerBandsStrategy } from "./bollinger-bands";

/**
 * Strategy Registry
 * Central place to register and retrieve all available trading strategies
 */
class StrategyRegistry {
  private strategies: Map<string, BaseStrategy>;

  constructor() {
    this.strategies = new Map();
    this.registerDefaultStrategies();
  }

  /**
   * Register built-in strategies
   */
  private registerDefaultStrategies() {
    this.register("sma_crossover", new SMACrossoverStrategy());
    this.register("rsi", new RSIStrategy());
    this.register("macd", new MACDStrategy());
    this.register("bollinger_bands", new BollingerBandsStrategy());
  }

  /**
   * Register a custom strategy
   */
  register(id: string, strategy: BaseStrategy): void {
    this.strategies.set(id, strategy);
    console.log(`[STRATEGY_REGISTRY] Registered strategy: ${id}`);
  }

  /**
   * Get a strategy by ID
   */
  get(id: string): BaseStrategy | undefined {
    return this.strategies.get(id);
  }

  /**
   * Get all available strategies
   */
  getAll(): Array<{ id: string; strategy: BaseStrategy }> {
    return Array.from(this.strategies.entries()).map(([id, strategy]) => ({
      id,
      strategy,
    }));
  }

  /**
   * Get all strategy configurations for UI
   */
  getAllConfigs(): Array<{ id: string; name: string; description: string }> {
    return this.getAll().map(({ id, strategy }) => {
      const config = strategy.getConfig();
      return {
        id,
        name: config.name,
        description: config.description,
      };
    });
  }

  /**
   * Check if a strategy exists
   */
  has(id: string): boolean {
    return this.strategies.has(id);
  }

  /**
   * Remove a strategy
   */
  unregister(id: string): boolean {
    return this.strategies.delete(id);
  }
}

// Export singleton instance
export const strategyRegistry = new StrategyRegistry();

// Export for type checking
export type { BaseStrategy };
