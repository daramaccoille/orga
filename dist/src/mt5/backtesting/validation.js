var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
export class ValidationUtils {
    static validateConfig(config) {
        var _a, _b;
        if (!((_a = config.inputFeatures) === null || _a === void 0 ? void 0 : _a.length)) {
            throw new Error('Input features cannot be empty');
        }
        if (!((_b = config.inputShape) === null || _b === void 0 ? void 0 : _b.length)) {
            throw new Error('Input shape must be defined');
        }
        if (config.batchSize && config.batchSize <= 0) {
            throw new Error('Batch size must be positive');
        }
    }
    static validateLayerConfig(layers) {
        if (!(layers === null || layers === void 0 ? void 0 : layers.length)) {
            throw new Error('Layer configuration cannot be empty');
        }
        layers.forEach((layer, index) => {
            if (layer.units <= 0) {
                throw new Error(`Invalid units in layer ${index}: must be positive`);
            }
            if (layer.dropoutRate && (layer.dropoutRate < 0 || layer.dropoutRate > 1)) {
                throw new Error(`Invalid dropout rate in layer ${index}: must be between 0 and 1`);
            }
        });
    }
    static validateTensor(tensor) {
        return __awaiter(this, void 0, void 0, function* () {
            if (!tensor.shape.every((dim) => dim > 0)) {
                throw new Error('Invalid tensor shape: all dimensions must be positive');
            }
        });
    }
    static validateSymmetricLayers(encoder, decoder) {
        if (encoder.length !== decoder.length) {
            throw new Error('Encoder and decoder must have the same number of layers');
        }
        encoder.forEach((layer, i) => {
            if (layer.units !== decoder[decoder.length - 1 - i].units) {
                throw new Error('Encoder and decoder layers must be symmetric');
            }
        });
    }
}
export function validateConfig(config) {
    return Boolean(config && config.inputShape && config.layers);
}
export function validateTensor(tensor) {
    if (!tensor || tensor.shape.length === 0) {
        throw new Error('Invalid tensor input');
    }
}
