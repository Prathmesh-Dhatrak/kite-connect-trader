import { BaseStrategy, Candle, SignalResult, StrategyConfig } from "./base";

export class RSIStrategy extends BaseStrategy {
  constructor() {
    const config: StrategyConfig = {
      name: "RSI",
      description:
        "Buy when RSI crosses below oversold level, sell when it crosses above overbought level",
      parameters: [
        {
          name: "rsi_period",
          label: "RSI Period",
          type: "number",
          default: 14,
          min: 5,
          max: 30,
          step: 1,
          description: "Period for RSI calculation",
        },
        {
          name: "oversold",
          label: "Oversold Level",
          type: "number",
          default: 30,
          min: 10,
          max: 40,
          step: 1,
          description: "RSI level considered oversold (buy signal)",
        },
        {
          name: "overbought",
          label: "Overbought Level",
          type: "number",
          default: 70,
          min: 60,
          max: 90,
          step: 1,
          description: "RSI level considered overbought (sell signal)",
        },
      ],
    };
    super(config);
  }

  generateSignals(
    data: Candle[],
    params: Record<string, number | string>
  ): SignalResult[] {
    const rsiPeriod = params.rsi_period || 14;
    const oversold = params.oversold || 30;
    const overbought = params.overbought || 70;

    console.log("[RSI_STRATEGY] Generating signals...");
    console.log("[RSI_STRATEGY] RSI Period:", rsiPeriod);
    console.log("[RSI_STRATEGY] Oversold:", oversold);
    console.log("[RSI_STRATEGY] Overbought:", overbought);

    const closes = data.map((d) => d.close);
    const rsi = this.calculateRSI(closes, rsiPeriod);

    const signals: SignalResult[] = [];
    const rawSignals: number[] = [];

    for (let i = 0; i < data.length; i++) {
      let signal = 0;

      if (i >= rsiPeriod && !isNaN(rsi[i])) {
        // Hold long position when RSI is between oversold and overbought
        if (rsi[i] < overbought && (i === 0 || rawSignals[i - 1] === 1)) {
          signal = 1;
        }
        // Exit when overbought
        else if (rsi[i] >= overbought) {
          signal = 0;
        }
        // Enter when oversold
        else if (rsi[i] <= oversold) {
          signal = 1;
        }
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
          rsi: rsi[i],
          oversold,
          overbought,
        },
      });
    }

    const buySignals = signals.filter((s) => s.position === 1).length;
    const sellSignals = signals.filter((s) => s.position === -1).length;

    console.log("[RSI_STRATEGY] BUY signals:", buySignals);
    console.log("[RSI_STRATEGY] SELL signals:", sellSignals);

    return signals;
  }
}
