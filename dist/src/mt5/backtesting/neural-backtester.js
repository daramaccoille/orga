var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
import * as tf from '@tensorflow/tfjs-node';
import { AdvancedBacktester } from './advanced-backtester';
export class NeuralBacktester extends AdvancedBacktester {
    constructor(config) {
        super();
        this.config = config;
        this.initializeModel();
    }
    initializeModel() {
        this.model = tf.sequential({
            layers: [
                tf.layers.lstm({
                    units: 50,
                    inputShape: [this.config.lookbackPeriod, this.config.inputFeatures.length],
                    returnSequences: true,
                }),
                tf.layers.dropout({ rate: 0.2 }),
                tf.layers.lstm({ units: 30, returnSequences: false }),
                tf.layers.dropout({ rate: 0.2 }),
                tf.layers.dense({ units: 1, activation: 'sigmoid' }),
            ],
        });
        this.model.compile({
            optimizer: tf.train.adam(0.001),
            loss: 'binaryCrossentropy',
            metrics: ['accuracy'],
        });
    }
    runNeuralBacktest(symbol, startDate, endDate, initialCapital) {
        return __awaiter(this, void 0, void 0, function* () {
            const baseResult = yield this.runAdvancedBacktest(symbol, startDate, endDate, initialCapital);
            const features = yield this.prepareFeatures(symbol, startDate, endDate);
            const predictions = yield this.trainAndPredict(features);
            return Object.assign(Object.assign({}, baseResult), { neuralAnalysis: {
                    predictions,
                    accuracy: yield this.calculateAccuracy(predictions, baseResult.trades),
                    confidenceScores: yield this.calculateConfidenceScores(predictions),
                } });
        });
    }
    prepareFeatures(symbol, startDate, endDate) {
        return __awaiter(this, void 0, void 0, function* () {
            // Transform market data into tensor features
            const data = yield this.fetchMarketData(symbol, startDate, endDate);
            return tf.tensor3d(this.preprocessData(data));
        });
    }
    fetchMarketData(symbol, startDate, endDate) {
        throw new Error('Method not implemented.');
    }
    trainAndPredict(features) {
        return __awaiter(this, void 0, void 0, function* () {
            const [trainFeatures, testFeatures] = tf.split(features, 2);
            yield this.model.fit(trainFeatures, this.prepareLabelData(), {
                epochs: this.config.epochs,
                batchSize: this.config.batchSize,
                validationSplit: 0.2,
            });
            return this.model.predict(testFeatures);
        });
    }
    prepareLabelData() {
        // Prepare labels for training
        const labels = [1, 0, 1, 0, 1, 0, 1, 0, 1, 0, 1, 0, 1, 0, 1, 0, 1, 0, 1, 0];
        return tf.tensor1d(labels);
    }
    // add helper methods
    calculateAccuracy(predictions, trades) {
        return __awaiter(this, void 0, void 0, function* () {
            const actualLabels = trades.map(trade => (trade.profit > 0 ? 1 : 0));
            const predictedLabels = (yield predictions.data()).map(p => (p > 0.5 ? 1 : 0));
            const correctPredictions = actualLabels.filter((label, index) => label === predictedLabels[index]).length;
            return correctPredictions / actualLabels.length;
        });
    }
    calculateConfidenceScores(predictions) {
        return __awaiter(this, void 0, void 0, function* () {
            const data = yield predictions.data();
            return data.map(p => (p > 0.5 ? p : 1 - p));
        });
    }
    preprocessData(data) {
        // transform data to tensor
        return data.map(d => [d.open, d.high, d.low, d.close]);
    }
}
// add type definitions
