import express from 'express';
import * as http from 'http';
import { Server } from 'socket.io';

interface DashboardData {
  accountInfo: any;
  positions: any[];
  marketData: Map<string, any>;
  riskMetrics: any;
}

export class TradeDashboard {
  private app: express.Application;
  private server: http.Server;
  private io: Server;
  private data!: DashboardData;

  constructor() {
    this.app = express();
    this.server = http.createServer(this.app);
    this.io = new Server(this.server);

    this.setupRoutes();
    this.setupWebSocket();
  }

  private setupRoutes() {
    this.app.get('/', (req, res) => {
      res.sendFile(__dirname + '/dashboard/index.html');
    });

    this.app.use(express.static(__dirname + '/dashboard'));
  }

  private setupWebSocket() {
    this.io.on('connection', (socket) => {
      console.log('Dashboard client connected');
      this.sendUpdate();
    });
  }

  public updateData(data: Partial<DashboardData>) {
    this.data = { ...this.data, ...data };
    this.sendUpdate();
  }

  private sendUpdate() {
    this.io.emit('dashboard-update', this.data);
  }

  public start(port = 3000) {
    this.server.listen(port, () => {
      console.log(`Dashboard running on http://localhost:${port}`);
    });
  }
}
