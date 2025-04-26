import * as tf from '@tensorflow/tfjs-node';

export interface LayerConfig {
  units: number;
  activation?: 'relu' | 'tanh' | 'sigmoid';
  dropoutRate?: number;
}

export interface NeuralConfig {
  layers: any;
  inputFeatures: string[];
  inputShape: number[];
  batchSize?: number;
  epochs?: number;
  validationSplit?: number;
}

export interface GANConfig extends NeuralConfig {
  latentDim: number;
  generatorLayers: LayerConfig[];
  discriminatorLayers: LayerConfig[];
  learningRate?: number;
}

export interface AutoEncoderConfig extends NeuralConfig {
  encoderLayers: LayerConfig[];
  decoderLayers: LayerConfig[];
  latentDim: number;
  symmetric?: boolean;
}

export interface ModelResult {
  model: tf.LayersModel;
  train: (data: tf.Tensor) => Promise<tf.History>;
  predict: (data: tf.Tensor) => Promise<tf.Tensor>;
  validate: (data: tf.Tensor) => Promise<number>;
}
