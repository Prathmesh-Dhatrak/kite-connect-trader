import { BaseStrategy, Candle, SignalResult, StrategyConfig } from "./base";

export class MACDStrategy extends BaseStrategy {
  constructor() {
    const config: StrategyConfig = {
      name: "MACD",
      description:
        "Buy when MACD line crosses above signal line, sell when it crosses below",
      parameters: [
        {
          name: "fast_period",
          label: "Fast Period",
          type: "number",
          default: 12,
          min: 5,
          max: 20,
          step: 1,
          description: "Fast EMA period",
        },
        {
          name: "slow_period",
          label: "Slow Period",
          type: "number",
          default: 26,
          min: 20,
          max: 50,
          step: 1,
          description: "Slow EMA period",
        },
        {
          name: "signal_period",
          label: "Signal Period",
          type: "number",
          default: 9,
          min: 5,
          max: 20,
          step: 1,
          description: "Signal line EMA period",
        },
      ],
    };
    super(config);
  }

  generateSignals(
    data: Candle[],
    params: Record<string, number>
  ): SignalResult[] {
    const fastPeriod = params.fast_period || 8;
    const slowPeriod = params.slow_period || 21;
    const signalPeriod = params.signal_period || 5;

    console.log("[MACD_STRATEGY] Generating signals...");
    console.log("[MACD_STRATEGY] Fast:", fastPeriod);
    console.log("[MACD_STRATEGY] Slow:", slowPeriod);
    console.log("[MACD_STRATEGY] Signal:", signalPeriod);

    const closes = data.map((d) => d.close);
    const macdData = this.calculateMACD(
      closes,
      fastPeriod,
      slowPeriod,
      signalPeriod
    );

    const signals: SignalResult[] = [];
    const rawSignals: number[] = [];

    for (let i = 0; i < data.length; i++) {
      let signal = 0;

      if (
        i >= slowPeriod &&
        !isNaN(macdData.macd[i]) &&
        !isNaN(macdData.signal[i])
      ) {
        signal = macdData.macd[i] > macdData.signal[i] ? 1 : 0;
      }

      rawSignals.push(signal);
    }

    const positions = this.positionsToSignals(rawSignals);

    for (let i = 0; i < data.length; i++) {
      signals.push({
        date: data[i].date,
        close: data[i].close,
        signal: rawSignals[i],
        position: positions[i],
        indicators: {
          macd: macdData.macd[i],
          macd_signal: macdData.signal[i],
          histogram: macdData.histogram[i],
        },
      });
    }

    const buySignals = signals.filter((s) => s.position === 1).length;
    const sellSignals = signals.filter((s) => s.position === -1).length;

    console.log("[MACD_STRATEGY] BUY signals:", buySignals);
    console.log("[MACD_STRATEGY] SELL signals:", sellSignals);

    return signals;
  }
}
