export class ConfigValidator {
    constructor() {
        this.rules = new Map();
        this.validationTimeout = null;
    }
    addRule(parameterKey, rule) {
        if (!this.rules.has(parameterKey)) {
            this.rules.set(parameterKey, []);
        }
        this.rules.get(parameterKey).push(rule);
    }
    validateInRealTime(input, parameterKey) {
        input.addEventListener('input', () => {
            if (this.validationTimeout) {
                clearTimeout(this.validationTimeout);
            }
            this.validationTimeout = window.setTimeout(() => {
                this.validateField(input, parameterKey);
            }, 300);
        });
    }
    validateField(input, parameterKey) {
        const rules = this.rules.get(parameterKey) || [];
        const value = input.value;
        const validationResults = rules.map((rule) => ({
            valid: rule.validate(value),
            message: rule.message,
        }));
        this.updateValidationUI(input, validationResults);
        return validationResults.every((result) => result.valid);
    }
    updateValidationUI(input, results) {
        const feedbackElement = input.nextElementSibling;
        const invalidResults = results.filter((r) => !r.valid);
        if (invalidResults.length > 0) {
            input.classList.add('is-invalid');
            input.classList.remove('is-valid');
            feedbackElement.textContent = invalidResults[0].message;
            feedbackElement.classList.add('invalid-feedback');
        }
        else {
            input.classList.add('is-valid');
            input.classList.remove('is-invalid');
            feedbackElement.textContent = 'Looks good!';
            feedbackElement.classList.add('valid-feedback');
        }
    }
}
