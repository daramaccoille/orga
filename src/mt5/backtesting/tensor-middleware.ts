import * as tf from '@tensorflow/tfjs-node';
import { ValidationUtils } from './validation';

export class TensorMiddleware {
  static async withErrorHandling<T>(operation: () => Promise<T>, cleanup?: () => void): Promise<T> {
    try {
      const result = await operation();
      return result;
    } catch (error: unknown) {
      if (error instanceof Error) {
        throw new Error(`Tensor operation failed: ${error.message}`);
      }
      throw new Error('Tensor operation failed with unknown error');
    } finally {
      if (cleanup) {
        cleanup();
      }
      tf.dispose(); // Clean up unused tensors
    }
  }

  static async validateAndExecute<T>(
    tensor: tf.Tensor,
    operation: (t: tf.Tensor) => Promise<T>
  ): Promise<T> {
    await ValidationUtils.validateTensor(tensor);
    return this.withErrorHandling(() => operation(tensor));
  }
}
