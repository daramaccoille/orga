import * as tf from '@tensorflow/tfjs-node';
import { NeuralConfig, LayerConfig } from './types';

export class ValidationUtils {
  static validateConfig(config: NeuralConfig): void {
    if (!config.inputFeatures?.length) {
      throw new Error('Input features cannot be empty');
    }
    if (!config.inputShape?.length) {
      throw new Error('Input shape must be defined');
    }
    if (config.batchSize && config.batchSize <= 0) {
      throw new Error('Batch size must be positive');
    }
  }

  static validateLayerConfig(layers: LayerConfig[]): void {
    if (!layers?.length) {
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

  static async validateTensor(tensor: tf.Tensor): Promise<void> {
    const hasNaN = await tf.any(tf.isNaN(tensor)).data()[0];
    if (hasNaN) {
      throw new Error('Invalid input: tensor contains NaN values');
    }

    if (!tensor.shape.every((dim: number) => dim > 0)) {
      throw new Error('Invalid tensor shape: all dimensions must be positive');
    }
  }

  static validateSymmetricLayers(encoder: LayerConfig[], decoder: LayerConfig[]): void {
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

export function validateConfig(config: NeuralConfig): boolean {
    return Boolean(config && config.inputShape && config.layers);
}

export function validateTensor(tensor: tf.Tensor): void {
    if (!tensor || tensor.shape.length === 0) {
        throw new Error('Invalid tensor input');
    }
}
