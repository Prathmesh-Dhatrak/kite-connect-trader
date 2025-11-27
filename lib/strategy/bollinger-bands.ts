import { BaseStrategy, Candle, SignalResult, StrategyConfig } from "./base";

export class BollingerBandsStrategy extends BaseStrategy {
  constructor() {
    const config: StrategyConfig = {
      name: "Bollinger Bands",
      description:
        "Buy when price touches lower band, sell when it touches upper band",
      parameters: [
        {
          name: "period",
          label: "Period",
          type: "number",
          default: 15,
          min: 10,
          max: 50,
          step: 1,
          description: "Period for moving average and standard deviation",
        },
        {
          name: "std_dev",
          label: "Standard Deviation",
          type: "number",
          default: 1.8,
          min: 1,
          max: 3,
          step: 0.1,
          description: "Number of standard deviations for bands",
        },
      ],
    };
    super(config);
  }

  generateSignals(
    data: Candle[],
    params: Record<string, number>
  ): SignalResult[] {
    const period = params.period || 15;
    const stdDev = params.std_dev || 1.8;

    console.log("[BB_STRATEGY] Generating signals...");
    console.log("[BB_STRATEGY] Period:", period);
    console.log("[BB_STRATEGY] Std Dev:", stdDev);

    const closes = data.map((d) => d.close);
    const bands = this.calculateBollingerBands(closes, period, stdDev);

    const signals: SignalResult[] = [];
    const rawSignals: number[] = [];

    for (let i = 0; i < data.length; i++) {
      let signal = 0;

      if (i >= period - 1 && !isNaN(bands.lower[i]) && !isNaN(bands.upper[i])) {
        // Buy when price touches or goes below lower band
        if (closes[i] <= bands.lower[i]) {
          signal = 1;
        }
        // Sell when price touches or goes above upper band
        else if (closes[i] >= bands.upper[i]) {
          signal = 0;
        }
        // Hold previous position if in between
        else if (i > 0) {
          signal = rawSignals[i - 1];
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
          upper_band: bands.upper[i],
          middle_band: bands.middle[i],
          lower_band: bands.lower[i],
        },
      });
    }

    const buySignals = signals.filter((s) => s.position === 1).length;
    const sellSignals = signals.filter((s) => s.position === -1).length;

    console.log("[BB_STRATEGY] BUY signals:", buySignals);
    console.log("[BB_STRATEGY] SELL signals:", sellSignals);

    return signals;
  }
}
