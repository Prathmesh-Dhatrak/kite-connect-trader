# Logging Implementation Summary

## Overview

Comprehensive logging has been added throughout the entire application to enable easy debugging and issue tracking.

## Logging Format

All logs follow a consistent format:

```
[MODULE] [REQUEST_ID] Message: Details
```

### Log Prefixes:

- `[KITE]` - Kite Connect API library operations
- `[BACKTEST]` - Backtesting engine operations
- `[SMA_STRATEGY]` - SMA strategy calculations
- `[API/BACKTEST]` - Backtest API endpoint
- `[API/QUOTE]` - Market data quote API endpoint
- `[API/ORDER]` - Order placement API endpoint
- `[API/USER]` - User profile API endpoint
- `[BACKTEST_FORM]` - Backtest form component
- `[ORDER_FORM]` - Order form component
- `[USER_PROFILE]` - User profile component
- `[HOME]` - Main page component

## Server-Side Logging

### 1. Kite Connect Library (`lib/kite.ts`)

**Initialization:**

```
[KITE] Initializing Kite Connect client...
[KITE] API Key present: true
[KITE] Access Token present: true
[KITE] Access token set successfully
[KITE] Kite Connect client initialized
```

**API Calls:**

```
[KITE] getQuote called with instruments: ["NSE:INFY"]
[KITE] getQuote successful. Duration: 234ms Instruments count: 1

[KITE] getHistoricalData called
[KITE] - Instrument Token: 408065
[KITE] - From Date: 2023-01-01
[KITE] - To Date: 2023-12-31
[KITE] - Interval: day
[KITE] getHistoricalData successful. Duration: 567ms Data points: 247

[KITE] getUserProfile called
[KITE] getUserProfile successful. Duration: 123ms
[KITE] User: John Doe ID: AB1234

[KITE] placeOrder called
[KITE] Order params: { ... }
[KITE] placeOrder successful. Duration: 345ms Order ID: 210123000123456
```

**Errors:**

```
[KITE] getQuote ERROR: Error message here
[KITE] Error details: { full error object }
```

### 2. Backtest Engine (`lib/backtest.ts`)

**Execution Flow:**

```
[BACKTEST] ========== Starting Backtest ==========
[BACKTEST] Parameters:
[BACKTEST] - Instrument Token: 408065
[BACKTEST] - Date Range: 2023-01-01 to 2023-12-31
[BACKTEST] - Interval: day
[BACKTEST] - Short Window: 20
[BACKTEST] - Long Window: 50

[BACKTEST] Step 1: Fetching historical data...
[BACKTEST] Fetched 247 data points
[BACKTEST] First data point: 2023-01-02
[BACKTEST] Last data point: 2023-12-29

[BACKTEST] Step 2: Applying SMA Crossover Strategy...
[BACKTEST] Generated 247 signals

[BACKTEST] Step 3: Simulating trades and calculating metrics...
[BACKTEST] Initial Capital: 100000
[BACKTEST] Processing 247 signals...

[BACKTEST] BUY Signal #1 at 2023-02-15 - Price: 1550.50 Quantity: 100 Cost: 155050 Remaining Cash: -55050
[BACKTEST] BUY Signal at 2023-02-15 SKIPPED - Insufficient cash. Required: 155050 Available: 100000

[BACKTEST] SELL Signal #2 at 2023-03-20 - Price: 1580.25 Quantity: 100 Revenue: 158025 New Cash: 258025
[BACKTEST] SELL Signal at 2023-04-10 SKIPPED - No holdings to sell

[BACKTEST] ========== Backtest Complete ==========
[BACKTEST] Final Results:
[BACKTEST] - Initial Capital: 100000
[BACKTEST] - Final Cash: 105000
[BACKTEST] - Holdings: 0 shares
[BACKTEST] - Holdings Value: 0 (at price 1600.00)
[BACKTEST] - Final Portfolio Value: 105000
[BACKTEST] - Total Return: 5000
[BACKTEST] - Return Percentage: 5.00%
[BACKTEST] - Total Trades: 12
[BACKTEST] ===========================================
```

### 3. SMA Strategy (`lib/strategy/sma.ts`)

**Signal Generation:**

```
[SMA_STRATEGY] Generating signals...
[SMA_STRATEGY] Input data points: 247
[SMA_STRATEGY] Short window: 20
[SMA_STRATEGY] Long window: 50
[SMA_STRATEGY] Price range: 1450.00 to 1650.00

[SMA_STRATEGY] Calculating short SMA...
[SMA_STRATEGY] Calculating long SMA...
[SMA_STRATEGY] SMA calculated. Valid values: 228 / 247

[SMA_STRATEGY] Building signal array...
[SMA_STRATEGY] Position change at index 52 (date: 2023-02-15): BUY
[SMA_STRATEGY] - Short SMA: 1555.50 Long SMA: 1540.25 Price: 1550.50

[SMA_STRATEGY] ========== Strategy Summary ==========
[SMA_STRATEGY] Total signals generated: 247
[SMA_STRATEGY] BUY signals: 6
[SMA_STRATEGY] SELL signals: 6
[SMA_STRATEGY] Sample data point [50]:
[SMA_STRATEGY] - Date: 2023-02-13
[SMA_STRATEGY] - Price: 1548.75
[SMA_STRATEGY] - Short SMA: 1552.30
[SMA_STRATEGY] - Long SMA: 1542.15
[SMA_STRATEGY] - Signal: 1
[SMA_STRATEGY] ====================================
```

### 4. API Routes

**Backtest Route:**

```
[API/BACKTEST] [abc123] POST request received
[API/BACKTEST] [abc123] Request body: { ... }
[API/BACKTEST] [abc123] Starting backtest...
[API/BACKTEST] [abc123] Backtest completed successfully in 1234ms
[API/BACKTEST] [abc123] Result summary: Return=5.00%, Trades=12
```

**Quote Route:**

```
[API/QUOTE] [def456] GET request received
[API/QUOTE] [def456] Instruments parameter: NSE:INFY,NSE:TCS
[API/QUOTE] [def456] Parsed instruments: ["NSE:INFY", "NSE:TCS"]
[API/QUOTE] [def456] Fetching quotes for 2 instrument(s)...
[API/QUOTE] [def456] Quotes fetched successfully in 234ms
```

**Order Route:**

```
[API/ORDER] [ghi789] POST request received
[API/ORDER] [ghi789] Request body: { ... }
[API/ORDER] [ghi789] Variety not provided, defaulting to 'regular'
[API/ORDER] [ghi789] Placing order...
[API/ORDER] [ghi789] Order placed successfully in 345ms
[API/ORDER] [ghi789] Order ID: 210123000123456
```

**User Route:**

```
[API/USER] [jkl012] GET request received
[API/USER] [jkl012] Fetching user profile...
[API/USER] [jkl012] Profile fetched successfully in 123ms
[API/USER] [jkl012] User: John Doe (AB1234)
```

## Client-Side Logging

### 1. Main Page Component (`app/page.tsx`)

```
[HOME] Component rendered
[HOME] Active tab: backtest isLoading: false
[HOME] Tab changed to: trade
[HOME] handleRunBacktest called with data: { ... }
[HOME] Sending backtest request to API...
[HOME] Backtest API response status: 200
[HOME] Backtest API response data: { ... }
[HOME] Backtest successful, setting results
[HOME] Backtest request completed
```

### 2. Backtest Form (`components/backtest-form.tsx`)

```
[BACKTEST_FORM] Component rendered, isLoading: false
[BACKTEST_FORM] Current form data: { ... }
[BACKTEST_FORM] Form field changed: instrument_token = 408065
[BACKTEST_FORM] Form submitted
[BACKTEST_FORM] Parsed backtest data: { ... }
```

### 3. Order Form (`components/order-form.tsx`)

```
[ORDER_FORM] Component rendered
[ORDER_FORM] Current form data: { ... }
[ORDER_FORM] Form field changed: quantity = 10
[ORDER_FORM] Form submitted
[ORDER_FORM] Sending order request: { ... }
[ORDER_FORM] Response status: 200
[ORDER_FORM] Response data: { ... }
[ORDER_FORM] SUCCESS: Order placed successfully! ID: 210123000123456
[ORDER_FORM] Request completed
```

### 4. User Profile (`components/user-profile.tsx`)

```
[USER_PROFILE] Component rendered
[USER_PROFILE] useEffect triggered - fetching profile
[USER_PROFILE] Fetch response status: 200
[USER_PROFILE] Fetch response data: { ... }
[USER_PROFILE] Profile loaded successfully
```

## Error Logging

All errors are logged with full context:

```
[KITE] getHistoricalData ERROR: Invalid date format
[KITE] Error details: { error object with stack trace }

[API/BACKTEST] [abc123] ERROR: No data found for the given range
[API/BACKTEST] [abc123] Stack trace: ...

[ORDER_FORM] EXCEPTION: Failed to place order: Network error
[ORDER_FORM] Error details: { error object }
```

## How to Use Logs for Debugging

### 1. Track Request Flow

Use request IDs to follow a request through the entire stack:

```
[API/BACKTEST] [abc123] POST request received
[BACKTEST] ========== Starting Backtest ==========
[KITE] getHistoricalData called
[SMA_STRATEGY] Generating signals...
[API/BACKTEST] [abc123] Backtest completed successfully
```

### 2. Identify Performance Issues

Look for duration logs:

```
[KITE] getHistoricalData successful. Duration: 567ms
[API/BACKTEST] [abc123] Backtest completed successfully in 1234ms
```

### 3. Debug User Actions

Follow component interactions:

```
[HOME] Tab changed to: trade
[ORDER_FORM] Component rendered
[ORDER_FORM] Form field changed: quantity = 10
[ORDER_FORM] Form submitted
```

### 4. Find Error Sources

Error logs include full context:

```
[API/ORDER] [ghi789] ERROR: Missing tradingsymbol
[API/ORDER] [ghi789] Stack trace: ...
```

## Viewing Logs

### Development (Browser Console):

- Open DevTools (F12)
- Go to Console tab
- Filter by log prefix (e.g., `[API/` or `[KITE]`)

### Development (Terminal):

- Run `npm run dev`
- Server logs appear in terminal
- Use `grep` to filter: `npm run dev | grep "[BACKTEST]"`

### Production:

- Configure logging service (e.g., Winston, Pino)
- Send logs to centralized logging (e.g., CloudWatch, Datadog)
- Set up alerts for error patterns

## Log Levels (Future Enhancement)

Consider implementing log levels:

- `DEBUG` - Detailed debugging information
- `INFO` - General informational messages (current implementation)
- `WARN` - Warning messages for potential issues
- `ERROR` - Error messages for failures
- `FATAL` - Critical errors that require immediate attention

## Best Practices

1. **Keep logs concise but informative**
2. **Include relevant context** (IDs, timestamps, parameters)
3. **Log entry and exit points** of major functions
4. **Log all errors with full details**
5. **Use consistent formatting** across all logs
6. **Include performance metrics** (duration, counts)
7. **Don't log sensitive data** (passwords, tokens)
8. **Use request IDs** to trace requests across services

## Files Modified

All files have been updated with comprehensive logging:

### Core Library:

- ✅ `lib/kite.ts`
- ✅ `lib/backtest.ts`
- ✅ `lib/strategy/sma.ts`

### API Routes:

- ✅ `app/api/backtest/route.ts`
- ✅ `app/api/market-data/quote/route.ts`
- ✅ `app/api/order/route.ts`
- ✅ `app/api/user/route.ts`

### Components:

- ✅ `components/backtest-form.tsx`
- ✅ `components/order-form.tsx`
- ✅ `components/user-profile.tsx`
- ✅ `app/page.tsx`

## Summary

With these logging additions:

- ✅ Every major operation is logged
- ✅ Request flow can be traced end-to-end
- ✅ Performance can be measured
- ✅ Errors are captured with full context
- ✅ User actions are tracked
- ✅ Debugging is significantly easier

The application is now production-ready from a logging perspective!
