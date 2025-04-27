var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __asyncValues = (this && this.__asyncValues) || function (o) {
    if (!Symbol.asyncIterator) throw new TypeError("Symbol.asyncIterator is not defined.");
    var m = o[Symbol.asyncIterator], i;
    return m ? m.call(o) : (o = typeof __values === "function" ? __values(o) : o[Symbol.iterator](), i = {}, verb("next"), verb("throw"), verb("return"), i[Symbol.asyncIterator] = function () { return this; }, i);
    function verb(n) { i[n] = o[n] && function (v) { return new Promise(function (resolve, reject) { v = o[n](v), settle(resolve, reject, v.done, v.value); }); }; }
    function settle(resolve, reject, d, v) { Promise.resolve(v).then(function(v) { resolve({ value: v, done: d }); }, reject); }
};
import * as zmq from 'zeromq';
import { RiskManager } from './risk-manager';
import { MarketAnalyzer } from './market-analyzer';
import { TradeDashboard } from './dashboard';
export class MT5Agent {
    constructor() {
        // Initialize ZeroMQ sockets
        this.pushSocket = new zmq.Push();
        this.pullSocket = new zmq.Pull();
        this.pubSocket = new zmq.Publisher();
        this.subSocket = new zmq.Subscriber();
        const riskParams = {
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
    connect() {
        return __awaiter(this, void 0, void 0, function* () {
            // Connect to MT5 Expert Advisor
            yield this.pushSocket.connect('tcp://localhost:5555');
            yield this.pullSocket.connect('tcp://localhost:5556');
            yield this.pubSocket.connect('tcp://localhost:5557');
            yield this.subSocket.connect('tcp://localhost:5558');
            // Subscribe to all messages
            yield this.subSocket.subscribe('');
            console.log('Connected to MT5');
            // Start listening for messages
            this.startListening();
            this.dashboard.start();
        });
    }
    startListening() {
        return __awaiter(this, void 0, void 0, function* () {
            var _a, e_1, _b, _c;
            try {
                for (var _d = true, _e = __asyncValues(this.subSocket), _f; _f = yield _e.next(), _a = _f.done, !_a; _d = true) {
                    _c = _f.value;
                    _d = false;
                    const [msg] = _c;
                    try {
                        const message = JSON.parse(msg.toString());
                        yield this.marketAnalyzer.updateMarketData(message);
                        this.dashboard.updateData({
                            marketData: message,
                        });
                    }
                    catch (error) {
                        console.error('Error processing MT5 message:', error);
                        console.log('Retrying message processing after 1 second...');
                        yield new Promise(resolve => setTimeout(resolve, 1000)); // Wait for 1 second
                        // Retry processing the same message
                        this.startListening(); // Recursively call startListening to process the message again
                        return; // Stop the current loop to avoid processing the same message multiple times
                    }
                }
            }
            catch (e_1_1) { e_1 = { error: e_1_1 }; }
            finally {
                try {
                    if (!_d && !_a && (_b = _e.return)) yield _b.call(_e);
                }
                finally { if (e_1) throw e_1.error; }
            }
        });
    }
    openPosition(position) {
        return __awaiter(this, void 0, void 0, function* () {
            const command = {
                action: 'OPEN_POSITION',
                data: {
                    symbol: position.symbol,
                    type: position.type,
                    volume: position.volume,
                    price: position.price,
                    stopLoss: position.stopLoss,
                },
            };
            yield this.pushSocket.send(JSON.stringify(command));
            const response = yield this.pullSocket.receive();
            return JSON.parse(response.toString());
        });
    }
    closePosition(ticket) {
        return __awaiter(this, void 0, void 0, function* () {
            const command = {
                action: 'CLOSE_POSITION',
                data: {
                    ticket: ticket,
                },
            };
            yield this.pushSocket.send(JSON.stringify(command));
            const response = yield this.pullSocket.receive();
            return JSON.parse(response.toString());
        });
    }
    getAccountInfo() {
        return __awaiter(this, void 0, void 0, function* () {
            const command = {
                action: 'GET_ACCOUNT_INFO',
            };
            yield this.pushSocket.send(JSON.stringify(command));
            const response = yield this.pullSocket.receive();
            return JSON.parse(response.toString());
        });
    }
    getPositions() {
        return __awaiter(this, void 0, void 0, function* () {
            const command = {
                action: 'GET_POSITIONS',
            };
            yield this.pushSocket.send(JSON.stringify(command));
            const response = yield this.pullSocket.receive();
            return JSON.parse(response.toString());
        });
    }
}
// MCP Message Handler
export class MT5MCPAgent {
    constructor() {
        this.agent = new MT5Agent();
    }
    initialize() {
        return __awaiter(this, void 0, void 0, function* () {
            yield this.agent.connect();
        });
    }
    handleMessage(message) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                switch (message.type) {
                    case 'get_account_info':
                        return yield this.agent.getAccountInfo();
                    case 'open_position':
                        return yield this.agent.openPosition(message.data);
                    case 'close_position':
                        return yield this.agent.closePosition(message.data.ticket);
                    case 'get_positions':
                        return yield this.agent.getPositions();
                    default:
                        throw new Error(`Unknown message type: ${message.type}`);
                }
            }
            catch (error) {
                console.error('Error handling message:', error);
                throw error;
            }
        });
    }
}
