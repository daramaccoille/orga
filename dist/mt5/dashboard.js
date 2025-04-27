import express from 'express';
import * as http from 'http';
import { Server } from 'socket.io';
export class TradeDashboard {
    constructor() {
        this.app = express();
        this.server = http.createServer(this.app);
        this.io = new Server(this.server);
        this.setupRoutes();
        this.setupWebSocket();
    }
    setupRoutes() {
        this.app.get('/', (req, res) => {
            res.sendFile(__dirname + '/dashboard/index.html');
        });
        this.app.use(express.static(__dirname + '/dashboard'));
    }
    setupWebSocket() {
        this.io.on('connection', (socket) => {
            console.log('Dashboard client connected');
            this.sendUpdate();
        });
    }
    updateData(data) {
        this.data = Object.assign(Object.assign({}, this.data), data);
        this.sendUpdate();
    }
    sendUpdate() {
        this.io.emit('dashboard-update', this.data);
    }
    start(port = 3000) {
        this.server.listen(port, () => {
            console.log(`Dashboard running on http://localhost:${port}`);
        });
    }
}
