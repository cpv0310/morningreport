import { spawn } from 'child_process';

interface MCPRequest {
  jsonrpc: string;
  id: number;
  method: string;
  params?: any;
}

interface MCPResponse {
  jsonrpc: string;
  id: number;
  result?: any;
  error?: any;
}

interface TechnicalIndicators {
  rsi: number;
  rsi_signal: string;
  sma20: number;
  ema50: number;
  ema200: number;
  macd: number;
  macd_signal: number;
  macd_divergence: number;
  adx: number;
  trend_strength: string;
  stoch_k: number;
  stoch_d: number;
}

interface CoinAnalysisResult {
  price_data: any;
  bollinger_analysis: any;
  technical_indicators: TechnicalIndicators;
  market_sentiment: any;
}

let requestId = 0;
let mcpProcess: any = null;
let isInitialized = false;
let pendingRequests = new Map<number, { resolve: Function; reject: Function }>();
let buffer = '';

function initializeMCP(): Promise<void> {
  return new Promise(async (resolve, reject) => {
    if (isInitialized) {
      resolve();
      return;
    }

    mcpProcess = spawn('uv', [
      'tool',
      'run',
      '--from',
      'git+https://github.com/atilaahmettaner/tradingview-mcp.git',
      'tradingview-mcp'
    ]);

    mcpProcess.stdout.on('data', (data: Buffer) => {
      buffer += data.toString();
      const lines = buffer.split('\n');

      // Keep the last incomplete line in the buffer
      buffer = lines.pop() || '';

      for (const line of lines) {
        if (line.trim()) {
          try {
            const response: MCPResponse = JSON.parse(line);
            const pending = pendingRequests.get(response.id);

            if (pending) {
              if (response.error) {
                pending.reject(new Error(response.error.message || 'MCP error'));
              } else {
                pending.resolve(response.result);
              }
              pendingRequests.delete(response.id);
            }
          } catch (error) {
            console.error('Failed to parse MCP response:', error, 'Line:', line);
          }
        }
      }
    });

    mcpProcess.stderr.on('data', (data: Buffer) => {
      const message = data.toString();
      // Ignore info messages, only log errors
      if (!message.includes('Unsupported environment') && !message.includes('survey') && !message.includes('WARNING')) {
        console.error('MCP stderr:', message);
      }
    });

    mcpProcess.on('error', (error: Error) => {
      console.error('MCP process error:', error);
      reject(error);
    });

    // Wait for process to start
    await new Promise(r => setTimeout(r, 2000));

    try {
      // Send MCP initialize request
      const initId = ++requestId;
      const initRequest = {
        jsonrpc: '2.0',
        id: initId,
        method: 'initialize',
        params: {
          protocolVersion: '2024-11-05',
          capabilities: {},
          clientInfo: {
            name: 'morningreport',
            version: '1.0.0'
          }
        }
      };

      pendingRequests.set(initId, {
        resolve: () => {
          // Send initialized notification
          mcpProcess.stdin.write(JSON.stringify({
            jsonrpc: '2.0',
            method: 'notifications/initialized'
          }) + '\n');

          isInitialized = true;
          resolve();
        },
        reject
      });

      mcpProcess.stdin.write(JSON.stringify(initRequest) + '\n');

      // Timeout for initialization
      setTimeout(() => {
        if (pendingRequests.has(initId)) {
          pendingRequests.delete(initId);
          reject(new Error('MCP initialization timeout'));
        }
      }, 10000);
    } catch (error) {
      reject(error);
    }
  });
}

function sendMCPRequest(method: string, params?: any): Promise<any> {
  return new Promise(async (resolve, reject) => {
    try {
      await initializeMCP();

      const id = ++requestId;
      const request: MCPRequest = {
        jsonrpc: '2.0',
        id,
        method,
        params
      };

      pendingRequests.set(id, { resolve, reject });

      mcpProcess.stdin.write(JSON.stringify(request) + '\n');

      // Set a timeout for the request
      setTimeout(() => {
        if (pendingRequests.has(id)) {
          pendingRequests.delete(id);
          reject(new Error('MCP request timeout'));
        }
      }, 30000);
    } catch (error) {
      reject(error);
    }
  });
}

export async function getStockRSI(symbol: string, exchange: string = 'NASDAQ'): Promise<number | null> {
  try {
    const result = await sendMCPRequest('tools/call', {
      name: 'coin_analysis',
      arguments: {
        symbol,
        exchange,
        timeframe: '1d'
      }
    });

    if (result && result.content && result.content[0]) {
      const data = JSON.parse(result.content[0].text) as CoinAnalysisResult;
      return data.technical_indicators?.rsi || null;
    }

    return null;
  } catch (error) {
    console.error(`Error fetching RSI for ${symbol}:`, error);
    return null;
  }
}

export async function getMultipleStockRSI(symbols: string[], exchange: string = 'NASDAQ'): Promise<Map<string, number>> {
  const results = new Map<string, number>();

  for (const symbol of symbols) {
    try {
      const rsi = await getStockRSI(symbol, exchange);
      if (rsi !== null) {
        results.set(symbol, rsi);
      }
      // Add a small delay to avoid overwhelming the MCP server
      await new Promise(resolve => setTimeout(resolve, 500));
    } catch (error) {
      console.error(`Error fetching RSI for ${symbol}:`, error);
    }
  }

  return results;
}

// Cleanup function
export function cleanupMCP(): void {
  if (mcpProcess) {
    mcpProcess.kill();
    mcpProcess = null;
    isInitialized = false;
    pendingRequests.clear();
  }
}
