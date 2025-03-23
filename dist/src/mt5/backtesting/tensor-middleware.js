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
import { ValidationUtils } from './validation';
export class TensorMiddleware {
    static withErrorHandling(operation, cleanup) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const result = yield operation();
                return result;
            }
            catch (error) {
                if (error instanceof Error) {
                    throw new Error(`Tensor operation failed: ${error.message}`);
                }
                throw new Error('Tensor operation failed with unknown error');
            }
            finally {
                if (cleanup) {
                    cleanup();
                }
                tf.dispose(); // Clean up unused tensors
            }
        });
    }
    static validateAndExecute(tensor, operation) {
        return __awaiter(this, void 0, void 0, function* () {
            yield ValidationUtils.validateTensor(tensor);
            return this.withErrorHandling(() => operation(tensor));
        });
    }
}
