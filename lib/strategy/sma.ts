export interface SignalResult {
  date: string;
  close: number;
  short_mavg: number;
  long_mavg: number;
  signal: number;
  position: number;
}

export class SMACrossoverStrategy {
  private shortWindow: number;
  private longWindow: number;

  constructor(shortWindow: number = 5, longWindow: number = 20) {
    this.shortWindow = shortWindow;
    this.longWindow = longWindow;
  }

  generateSignals(data: any[]): SignalResult[] {
    console.log("[SMA_STRATEGY] Generating signals...");
    console.log("[SMA_STRATEGY] Input data points:", data.length);
    console.log("[SMA_STRATEGY] Short window:", this.shortWindow);
    console.log("[SMA_STRATEGY] Long window:", this.longWindow);

    // data is expected to be array of candles from Kite Connect
    // [{ date, open, high, low, close, volume }, ...]

    const closes = data.map((d) => d.close);
    const dates = data.map((d) => d.date);

    console.log(
      "[SMA_STRATEGY] Price range:",
      Math.min(...closes).toFixed(2),
      "to",
      Math.max(...closes).toFixed(2)
    );

    console.log("[SMA_STRATEGY] Calculating short SMA...");
    const shortMavg = this.calculateSMA(closes, this.shortWindow);
    console.log("[SMA_STRATEGY] Calculating long SMA...");
    const longMavg = this.calculateSMA(closes, this.longWindow);

    const signals: SignalResult[] = [];
    console.log("[SMA_STRATEGY] Building signal array...");

    for (let i = 0; i < data.length; i++) {
      let signal = 0;
      // Generate signal only after we have enough data for long window
      if (i >= this.longWindow) {
        if (shortMavg[i] > longMavg[i]) {
          signal = 1.0;
        } else {
          signal = 0.0;
        }
      }

      let position = 0;
      if (i > 0 && signals[i - 1]) {
        position = signal - signals[i - 1].signal;
        if (position !== 0) {
          console.log(
            "[SMA_STRATEGY] Position change at index",
            i,
            "(date:",
            dates[i] + "):",
            position === 1 ? "BUY" : "SELL"
          );
          console.log(
            "[SMA_STRATEGY] - Short SMA:",
            shortMavg[i].toFixed(2),
            "Long SMA:",
            longMavg[i].toFixed(2),
            "Price:",
            closes[i].toFixed(2)
          );
        }
      }

      signals.push({
        date: dates[i],
        close: closes[i],
        short_mavg: shortMavg[i],
        long_mavg: longMavg[i],
        signal,
        position,
      });
    }

    const buySignals = signals.filter((s) => s.position === 1.0).length;
    const sellSignals = signals.filter((s) => s.position === -1.0).length;
    console.log("[SMA_STRATEGY] ========== Strategy Summary ==========");
    console.log("[SMA_STRATEGY] Total signals generated:", signals.length);
    console.log("[SMA_STRATEGY] BUY signals:", buySignals);
    console.log("[SMA_STRATEGY] SELL signals:", sellSignals);

    if (signals.length > 50) {
      console.log("[SMA_STRATEGY] Sample data point [50]:");
      console.log("[SMA_STRATEGY] - Date:", signals[50].date);
      console.log("[SMA_STRATEGY] - Price:", signals[50].close.toFixed(2));
      console.log(
        "[SMA_STRATEGY] - Short SMA:",
        signals[50].short_mavg.toFixed(2)
      );
      console.log(
        "[SMA_STRATEGY] - Long SMA:",
        signals[50].long_mavg.toFixed(2)
      );
      console.log("[SMA_STRATEGY] - Signal:", signals[50].signal);
    }
    console.log("[SMA_STRATEGY] ====================================");

    return signals;
  }

  private calculateSMA(data: number[], window: number): number[] {
    console.log("[SMA_STRATEGY] Calculating SMA with window:", window);
    const sma: number[] = [];
    let firstValidIndex = -1;

    for (let i = 0; i < data.length; i++) {
      if (i < window - 1) {
        sma.push(NaN); // Not enough data
        continue;
      }

      const slice = data.slice(i - window + 1, i + 1);
      const sum = slice.reduce((a, b) => a + b, 0);
      const average = sum / window;
      sma.push(average);

      if (firstValidIndex === -1) {
        firstValidIndex = i;
        console.log(
          "[SMA_STRATEGY] First valid SMA at index",
          i,
          ":",
          average.toFixed(2)
        );
      }
    }

    const validSMAs = sma.filter((val) => !isNaN(val));
    console.log(
      "[SMA_STRATEGY] SMA calculated. Valid values:",
      validSMAs.length,
      "/",
      data.length
    );

    return sma;
  }
}
