var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
import request from 'supertest';
import express from 'express';
import * as path from 'path';
// Import the app instance from your main file
const app = express();
const port = parseInt(process.env.PORT || '8080', 10);
app.use(express.static(path.join(__dirname, 'public')))
    .set('views', path.join(__dirname, 'views'))
    .set('view engine', 'ejs');
app.get('/', (req, res) => {
    res.render('index');
});
app.get('/api', (req, res) => {
    res.json({ "msg": "Hello world" });
});
// describe block for grouping tests
describe('API Tests', () => {
    // it block for individual test case
    it('should return a JSON message on /api', () => __awaiter(void 0, void 0, void 0, function* () {
        const response = yield request(app).get('/api');
        expect(response.status).toBe(200);
        expect(response.body.msg).toBe('Hello world');
    }));
});
