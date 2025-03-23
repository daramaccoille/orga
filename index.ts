import express, { json } from 'express';
import * as path from "path";
import { fileURLToPath } from 'url';
import { dirname } from 'path';
import { createClient, RedisClientType } from 'redis';


const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const app = express();

// Create redis client
const redisClient: RedisClientType = createClient();

redisClient.on('error', (err) => console.log('Redis Client Error', err));

async function connectToRedis() {
  await redisClient.connect();
}

connectToRedis();

const port =
  process.env.PORT !== undefined
    ? parseInt(process.env.PORT, 10)
    : process.argv[3] !== undefined
    ? parseInt(process.argv[3], 10)
    : 8080;

app.use(express.static(path.join(__dirname, 'public')))
  app.set('views', path.join(__dirname, 'views'))
  app.set('view engine', 'ejs');

app.get('/', (req, res) => {
  res.render('index');
});

app.get('/api', async (req, res) => {

  await redisClient.set('mykey', 'Hello from Redis!!!');
  const value = await redisClient.get('mykey');
  res.json({ "msg": "Hello world", "redisValue": value });
});


app.listen(port, () => {
  console.log(`Listening on http://localhost:${port}`);
});
