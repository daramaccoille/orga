import express, { json } from 'express';
import * as path from "path";
import { fileURLToPath } from 'url';
import { dirname } from 'path';
import { createClient, RedisClientType } from 'redis';
// import * as redis from 'redis';
import { TechnicalIndicators } from './mt5/indicators/technical-indicators.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const app = express();
app.use(express.static(path.join(__dirname, 'public')));
app.use(express.json());
const indicators = new TechnicalIndicators();
// Create redis client
const redisClient: RedisClientType = createClient();

redisClient.on('error', (err) => console.log('Redis Client Error', err));

async function connectToRedis() {
  try {
    await redisClient.connect();
    console.log('Successfully connected to Redis'); 
  } catch (error) {
    console.error('Failed to connect to Redis:', error);
  }
}

connectToRedis();

const port =
  process.env.PORT !== undefined
    ? parseInt(process.env.PORT, 10)
    : process.argv[3] !== undefined
    ? parseInt(process.argv[3], 10)
    : 8080;

app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'ejs');


  app.get('/', (req: express.Request, res: express.Response) => {
    res.render('index');
  });

  app.get('/api', async (req, res) => {
    try {
      await redisClient.set('mykey', 'Hello from Redis!!!');
      const value = await redisClient.get('mykey');
      const formDataList = await redisClient.lRange('form-data', 0, -1);
  
      const parsedFormDataList = formDataList.map(item => JSON.parse(item));
  
      res.json({ "msg": "Hello world!", "redisValue": value, "formData": parsedFormDataList });
    } catch (error) {
      console.error('Error processing data:', error);
      res.status(500).json({ message: 'Error retrieving data' });
    }
  });
  app.post('/api/submit', async (req, res) => {
    try {
        const data = req.body.data; // Extract the data from the request body
        console.log('Received data:', data);

        if (!redisClient.isOpen) {
            await redisClient.connect();
        }
        await redisClient.rPush('form-data', JSON.stringify(data));
        res.status(200).json({ message: 'Data received and processed successfully' });
    } catch (error) {
        console.error('Error processing data:', error);
        res.status(500).json({ message: 'Error processing data' });
    }
});
app.post('/api/prices', async (req, res) => {
  try {
      const prices: number[] = req.body.prices; // Assuming the price array is sent in the 'prices' field
      console.log('Received prices:', prices);

      // Basic validation: Check if prices is an array and not empty
      if (!Array.isArray(prices) || prices.length === 0) {
          return res.status(400).json({ message: 'Invalid or empty prices array provided' });
      }
      // Calculate indicators
      const rsi = indicators.calculateRSI(prices);
      const macd = indicators.calculateMACD(prices);

      res.status(200).json({ message: 'Prices received successfully', prices, rsi, macd });
  } catch (error) {
      console.error('Error processing prices:', error);
      res.status(500).json({ message: 'Error processing prices' });
  }
});

app.listen(port, () => {
  console.log(`Listening on http://localhost:${port}`);
});
