var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
import express from 'express';
import * as path from "path";
import { fileURLToPath } from 'url';
import { dirname } from 'path';
import { createClient } from 'redis';
// import * as redis from 'redis';
import { TechnicalIndicators } from './mt5/indicators/technical-indicators.js';
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const app = express();
app.use(express.static(path.join(__dirname, 'public')));
app.use(express.json());
const indicators = new TechnicalIndicators();
// Create redis client
const redisClient = createClient();
redisClient.on('error', (err) => console.log('Redis Client Error', err));
function connectToRedis() {
    return __awaiter(this, void 0, void 0, function* () {
        try {
            yield redisClient.connect();
            console.log('Successfully connected to Redis');
        }
        catch (error) {
            console.error('Failed to connect to Redis:', error);
        }
    });
}
connectToRedis();
const port = process.env.PORT !== undefined
    ? parseInt(process.env.PORT, 10)
    : process.argv[3] !== undefined
        ? parseInt(process.argv[3], 10)
        : 8080;
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'ejs');
app.get('/', (req, res) => {
    res.render('index');
});
app.get('/api', (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        yield redisClient.set('mykey', 'Hello from Redis!!!');
        const value = yield redisClient.get('mykey');
        const formDataList = yield redisClient.lRange('form-data', 0, -1);
        const parsedFormDataList = formDataList.map(item => JSON.parse(item));
        res.json({ "msg": "Hello world!", "redisValue": value, "formData": parsedFormDataList });
    }
    catch (error) {
        console.error('Error processing data:', error);
        res.status(500).json({ message: 'Error retrieving data' });
    }
}));
app.post('/api/submit', (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const data = req.body.data; // Extract the data from the request body
        console.log('Received data:', data);
        if (!redisClient.isOpen) {
            yield redisClient.connect();
        }
        yield redisClient.rPush('form-data', JSON.stringify(data));
        res.status(200).json({ message: 'Data received and processed successfully' });
    }
    catch (error) {
        console.error('Error processing data:', error);
        res.status(500).json({ message: 'Error processing data' });
    }
}));
app.post('/api/prices', (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const prices = req.body.prices; // Assuming the price array is sent in the 'prices' field
        console.log('Received prices:', prices);
        // Basic validation: Check if prices is an array and not empty
        if (!Array.isArray(prices) || prices.length === 0) {
            return res.status(400).json({ message: 'Invalid or empty prices array provided' });
        }
        // Calculate indicators
        const rsi = indicators.calculateRSI(prices);
        const macd = indicators.calculateMACD(prices);
        res.status(200).json({ message: 'Prices received successfully', prices, rsi, macd });
    }
    catch (error) {
        console.error('Error processing prices:', error);
        res.status(500).json({ message: 'Error processing prices' });
    }
}));
app.listen(port, () => {
    console.log(`Listening on http://localhost:${port}`);
});
