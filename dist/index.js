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
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const app = express();
// Create redis client
const redisClient = createClient();
redisClient.on('error', (err) => console.log('Redis Client Error', err));
function connectToRedis() {
    return __awaiter(this, void 0, void 0, function* () {
        yield redisClient.connect();
    });
}
connectToRedis();
const port = process.env.PORT !== undefined
    ? parseInt(process.env.PORT, 10)
    : process.argv[3] !== undefined
        ? parseInt(process.argv[3], 10)
        : 8080;
app.use(express.static(path.join(__dirname, 'public')));
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'ejs');
app.get('/', (req, res) => {
    res.render('index');
});
app.get('/api', (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    yield redisClient.set('mykey', 'Hello from Redis!!!');
    const value = yield redisClient.get('mykey');
    res.json({ "msg": "Hello world", "redisValue": value });
}));
app.listen(port, () => {
    console.log(`Listening on http://localhost:${port}`);
});
