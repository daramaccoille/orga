var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
import { AdvancedNeuralArchitectures } from './neural-architectures';
import * as tf from '@tensorflow/tfjs-node';
describe('AdvancedNeuralArchitectures', () => {
    const config = {
        inputFeatures: ['open', 'high', 'low', 'close'],
        inputShape: [4],
    };
    const aeConfig = Object.assign(Object.assign({}, config), { encoderLayers: [32, 16], decoderLayers: [16, 32], latentDim: 8 });
    const ganConfig = Object.assign(Object.assign({}, config), { latentDim: 100, generatorLayers: [128, 256], discriminatorLayers: [256, 128] });
    let neuralArch;
    beforeEach(() => {
        neuralArch = new AdvancedNeuralArchitectures();
    });
    const verifyRegimeChangeDetection = (model, data) => __awaiter(void 0, void 0, void 0, function* () {
        const predictions = (yield model.predict(data.expandDims(0)));
        const predictionData = yield predictions.data();
        const firstHalf = predictionData.slice(0, predictionData.length / 2);
        const secondHalf = predictionData.slice(predictionData.length / 2);
        const firstMean = firstHalf.reduce((a, b) => a + b) / firstHalf.length;
        const secondMean = secondHalf.reduce((a, b) => a + b) / secondHalf.length;
        return Math.abs(firstMean - secondMean) > 0.5;
    });
    describe('GAN Model', () => {
        it('should build GAN model with correct structure', () => {
            const model = neuralArch.buildGANModel(ganConfig);
            expect(model).toHaveProperty('generator');
            expect(model).toHaveProperty('discriminator');
        });
        it('should generate correct output shapes', () => {
            const model = neuralArch.buildGANModel(ganConfig);
            const generator = model.generator;
            const discriminator = model.discriminator;
            expect(generator.outputs[0].shape).toEqual([null, config.inputFeatures.length]);
            expect(discriminator.outputs[0].shape).toEqual([null, 1]);
        });
        it('should handle invalid layer configurations', () => {
            const invalidConfig = Object.assign(Object.assign({}, config), { latentDim: 100, generatorLayers: [], discriminatorLayers: [] });
            expect(() => neuralArch.buildGANModel(invalidConfig)).toThrow();
        });
    });
    describe('AutoEncoder Model', () => {
        it('should build AutoEncoder with correct structure', () => {
            const model = neuralArch.buildAutoEncoder(aeConfig);
            expect(model).toHaveProperty('encoder');
            expect(model).toHaveProperty('decoder');
        });
        it('should maintain input/output dimensions', () => {
            const model = neuralArch.buildAutoEncoder(aeConfig);
            const encoder = model.encoder;
            const decoder = model.decoder;
            expect(encoder.inputs[0].shape).toEqual([null, config.inputFeatures.length]);
            expect(encoder.outputs[0].shape).toEqual([null, aeConfig.latentDim]);
            expect(decoder.outputs[0].shape).toEqual([null, config.inputFeatures.length]);
        });
        it('should handle reconstruction', () => __awaiter(void 0, void 0, void 0, function* () {
            const model = neuralArch.buildAutoEncoder(aeConfig);
            const testInput = tf.ones([1, config.inputFeatures.length]);
            const encoded = model.encoder.predict(testInput);
            const decoded = model.decoder.predict(encoded);
            expect(decoded.shape).toEqual(testInput.shape);
        }));
    });
    describe('Edge Cases', () => {
        it('should handle empty input features', () => {
            const emptyConfig = {
                inputFeatures: [],
                inputShape: [0],
            };
            expect(() => new AdvancedNeuralArchitectures(emptyConfig)).toThrow('Input features cannot be empty');
        });
        it('should handle extremely large layer sizes', () => {
            const largeConfig = Object.assign(Object.assign({}, config), { encoderLayers: [1024, 2048], decoderLayers: [2048, 1024], latentDim: 512 });
            expect(() => neuralArch.buildAutoEncoder(largeConfig)).not.toThrow();
        });
        it('should handle non-matching encoder/decoder layers', () => {
            const mismatchConfig = Object.assign(Object.assign({}, config), { encoderLayers: [32, 16], decoderLayers: [32, 64], latentDim: 8 });
            expect(() => neuralArch.buildAutoEncoder(mismatchConfig)).toThrow('Encoder and decoder layers must be symmetric');
        });
        it('should handle NaN values in input', () => __awaiter(void 0, void 0, void 0, function* () {
            const model = neuralArch.buildAutoEncoder(aeConfig);
            const testInput = tf.tensor2d([[NaN, 1, 2, 3]]);
            yield expect(() => __awaiter(void 0, void 0, void 0, function* () {
                const encoded = yield model.encoder.predict(testInput);
                yield model.decoder.predict(encoded);
            })).toThrow('Invalid input: contains NaN values');
        }));
    });
    describe('Performance Tests', () => {
        it('should handle large batch sizes', () => __awaiter(void 0, void 0, void 0, function* () {
            const model = neuralArch.buildAutoEncoder(aeConfig);
            const batchSize = 1000;
            const testInput = tf.ones([batchSize, config.inputFeatures.length]);
            const startTime = Date.now();
            const encoded = yield model.encoder.predict(testInput);
            yield model.decoder.predict(encoded);
            const endTime = Date.now();
            expect(endTime - startTime).toBeLessThan(5000); // Should process within 5 seconds
        }));
    });
    describe('Advanced Neural Network Tests', () => {
        it('should handle time series predictions', () => __awaiter(void 0, void 0, void 0, function* () {
            const timeSteps = 10;
            const features = config.inputFeatures.length;
            const batchSize = 32;
            const input = tf.randomNormal([batchSize, timeSteps, features]);
            const model = yield neuralArch.buildTimeSeriesModel(timeSteps, features);
            const prediction = (yield model.predict(input));
            expect(prediction.shape).toEqual([batchSize, features]);
        }));
        it('should maintain gradient flow in deep networks', () => __awaiter(void 0, void 0, void 0, function* () {
            const deepConfig = Object.assign(Object.assign({}, config), { encoderLayers: [128, 64, 32, 16], decoderLayers: [16, 32, 64, 128], latentDim: 8 });
            const model = neuralArch.buildAutoEncoder(deepConfig);
            const testInput = tf.randomNormal([1, config.inputFeatures.length]);
            const gradients = yield tf.tidy(() => {
                const tape = tf.GradientTape.new();
                const prediction = model.encoder.predict(testInput);
                return tape.gradient(prediction, testInput);
            });
            expect(gradients).not.toBeNull();
        }));
        it('should handle adversarial examples', () => __awaiter(void 0, void 0, void 0, function* () {
            const model = neuralArch.buildGANModel(ganConfig);
            const noise = tf.randomNormal([1, ganConfig.latentDim]);
            const generated = model.generator.predict(noise);
            const discriminated = model.discriminator.predict(generated);
            expect(discriminated.shape).toEqual([1, 1]);
            expect(yield discriminated.data()).toBeDefined();
        }));
        it('should handle market regime changes', () => __awaiter(void 0, void 0, void 0, function* () {
            const timeSteps = 100;
            const features = config.inputFeatures.length;
            const regimeChange = 50;
            const regime1 = tf.randomNormal([regimeChange, features], 0, 1);
            const regime2 = tf.randomNormal([timeSteps - regimeChange, features], 2, 0.5);
            const data = tf.concat([regime1, regime2]);
            const model = yield neuralArch.buildTimeSeriesModel(timeSteps, features);
            const prediction = model.predict(data.expandDims(0));
            expect(prediction.shape[1]).toBe(features);
            const regimeChangeDetected = yield verifyRegimeChangeDetection(model, data);
            expect(regimeChangeDetected).toBe(true);
        }));
        it('should maintain performance under noise', () => __awaiter(void 0, void 0, void 0, function* () {
            const model = neuralArch.buildAutoEncoder(aeConfig);
            const cleanData = tf.randomNormal([1, config.inputFeatures.length]);
            const noise = tf.randomNormal([1, config.inputFeatures.length], 0, 0.1);
            const noisyData = cleanData.add(noise);
            const cleanOutput = (yield model.encoder.predict(cleanData));
            const noisyOutput = (yield model.encoder.predict(noisyData));
            const difference = yield tf.mean(tf.abs(cleanOutput.sub(noisyOutput))).data();
            expect(difference[0]).toBeLessThan(0.2); // Tolerance threshold
        }));
        it('should handle concept drift', () => __awaiter(void 0, void 0, void 0, function* () {
            const driftConfig = Object.assign(Object.assign({}, config), { adaptiveLayers: true });
            const adaptiveModel = yield neuralArch.buildAdaptiveModel(driftConfig);
            const initialData = tf.randomNormal([100, config.inputFeatures.length]);
            const driftedData = tf.randomNormal([100, config.inputFeatures.length], 2, 1);
            yield adaptiveModel.train(initialData);
            const adaptationMetrics = yield adaptiveModel.adapt(driftedData);
            expect(adaptationMetrics.adaptationRate).toBeGreaterThan(0);
            expect(adaptationMetrics.stabilityScore).toBeGreaterThan(0.7);
        }));
    });
    test('should build time series model', () => __awaiter(void 0, void 0, void 0, function* () {
        // ... test implementation
    }));
    test('should validate input correctly', () => {
        // ... test implementation
    });
});
