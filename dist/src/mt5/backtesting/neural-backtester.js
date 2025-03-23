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
}
