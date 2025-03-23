import * as zmq from 'zeromq';
import dotenv from 'dotenv';
import { RiskManager, RiskParameters } from './risk-manager';
import { MarketAnalyzer } from './market-analyzer';
import { TradeDashboard } from './dashboard';

interface MT5Position {
  symbol: string;
  type: 'BUY' | 'SELL';
  volume: number;
  price?: number;
  stopLoss?: number;
  takeProfit?: number;
  comment?: string;
}

export class MT5Agent {
  private pushSocket: zmq.Push;
  private pullSocket: zmq.Pull;
  private pubSocket: zmq.Publisher;
  private subSocket: zmq.Subscriber;
  private riskManager: RiskManager;
  private marketAnalyzer: MarketAnalyzer;
  private dashboard: TradeDashboard;

  constructor() {
    // Initialize ZeroMQ sockets
    this.pushSocket = new zmq.Push();
    this.pullSocket = new zmq.Pull();
    this.pubSocket = new zmq.Publisher();
    this.subSocket = new zmq.Subscriber();

    const riskParams: RiskParameters = {
      maxLossPerTrade: 100,
      maxDailyLoss: 500,
      maxPositions: 5,
      maxLotSize: 1.0,
      riskPercentPerTrade: 2,
    };

    this.riskManager = new RiskManager(riskParams);
    this.marketAnalyzer = new MarketAnalyzer();
    this.dashboard = new TradeDashboard();
  }

  async connect() {
    // Connect to MT5 Expert Advisor
    await this.pushSocket.connect('tcp://localhost:5555');
    await this.pullSocket.connect('tcp://localhost:5556');
    await this.pubSocket.connect('tcp://localhost:5557');
    await this.subSocket.connect('tcp://localhost:5558');

    // Subscribe to all messages
    await this.subSocket.subscribe('');

    console.log('Connected to MT5');

    // Start listening for messages
    this.startListening();
    this.dashboard.start();
  }

  private async startListening() {
    for await (const [msg] of this.subSocket) {
      try {
        const message = JSON.parse(msg.toString());
        await this.marketAnalyzer.updateMarketData(message);
        this.dashboard.updateData({
          marketData: message,
        });
      } catch (error) {
        console.error('Error processing MT5 message:', error);
      }
    }
  }

  async openPosition(position: MT5Position) {
    // Get account info for risk calculation
    const accountInfo = await this.getAccountInfo();

    // Validate trade against risk parameters
    await this.riskManager.validateTrade(accountInfo.balance, position);

    const result = await this.openPosition(position);

    // Update dashboard
    this.dashboard.updateData({
      positions: await this.getPositions(),
      accountInfo: await this.getAccountInfo(),
    });

    return result;
  }

  async closePosition(ticket: number) {
    const command = {
      action: 'CLOSE_POSITION',
      data: {
        ticket: ticket,
      },
    };

    await this.pushSocket.send(JSON.stringify(command));
    const response = await this.pullSocket.receive();
    return JSON.parse(response.toString());
  }

  async getAccountInfo() {
    const command = {
      action: 'GET_ACCOUNT_INFO',
    };

    await this.pushSocket.send(JSON.stringify(command));
    const response = await this.pullSocket.receive();
    return JSON.parse(response.toString());
  }

  async getPositions() {
    const command = {
      action: 'GET_POSITIONS',
    };

    await this.pushSocket.send(JSON.stringify(command));
    const response = await this.pullSocket.receive();
    return JSON.parse(response.toString());
  }
}

// MCP Message Handler
export class MT5MCPAgent {
  private agent: MT5Agent;

  constructor() {
    this.agent = new MT5Agent();
  }

  async initialize() {
    await this.agent.connect();
  }

  async handleMessage(message: any) {
    try {
      switch (message.type) {
        case 'get_account_info':
          return await this.agent.getAccountInfo();

        case 'open_position':
          return await this.agent.openPosition(message.data);

        case 'close_position':
          return await this.agent.closePosition(message.data.ticket);

        case 'get_positions':
          return await this.agent.getPositions();

        default:
          throw new Error(`Unknown message type: ${message.type}`);
      }
    } catch (error) {
      console.error('Error handling message:', error);
      throw error;
    }
  }
}
