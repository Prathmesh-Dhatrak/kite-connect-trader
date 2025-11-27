import { SMACrossoverStrategy } from '../lib/strategy/sma';

// Mock data
const mockData = Array.from({ length: 100 }, (_, i) => ({
    date: `2023-01-${i + 1}`,
    close: 100 + Math.sin(i * 0.1) * 10, // Sine wave for crossover
    open: 100, high: 110, low: 90, volume: 1000
}));

const strategy = new SMACrossoverStrategy(5, 20);
const signals = strategy.generateSignals(mockData);

console.log("Total signals generated:", signals.length);
const buySignals = signals.filter(s => s.position === 1.0).length;
const sellSignals = signals.filter(s => s.position === -1.0).length;
console.log("Buy signals:", buySignals);
console.log("Sell signals:", sellSignals);

if (signals.length === 100 && (buySignals > 0 || sellSignals > 0)) {
    console.log("TEST PASSED: Signals generated successfully.");
} else {
    console.error("TEST FAILED: Unexpected signal count.");
    process.exit(1);
}
