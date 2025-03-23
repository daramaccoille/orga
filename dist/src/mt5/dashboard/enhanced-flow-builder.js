import { VisualFlowBuilder } from './visual-flow-builder';
import { ConfigValidator } from './config-validator';
import { PatternVisualizer } from './pattern-visualizer';
export class EnhancedVisualFlowBuilder extends VisualFlowBuilder {
    constructor(canvasId, configPanelId) {
        super(canvasId);
        this.validator = new ConfigValidator();
        this.patternVisualizer = new PatternVisualizer('pattern-canvas', {
            width: 400,
            height: 300,
            padding: 20,
            colors: {
                background: '#1a1a1a',
                lines: '#00ff00',
                points: '#ff0000',
                text: '#ffffff',
            },
        });
        this.initializeValidationRules();
    }
    initializeValidationRules() {
        // Add validation rules for different parameter types
        this.validator.addRule('period', {
            type: 'range',
            validate: (value) => value >= 1 && value <= 200,
            message: 'Period must be between 1 and 200',
        });
        this.validator.addRule('tolerance', {
            type: 'range',
            validate: (value) => value >= 0.01 && value <= 0.1,
            message: 'Tolerance must be between 0.01 and 0.1',
        });
    }
    showConfigPanel(node) {
        super.showConfigPanel(node);
        if (node.type === 'PATTERN') {
            this.patternVisualizer.visualizePattern(node.data);
        }
        // Add real-time validation to all inputs
        const inputs = this.configPanel.querySelectorAll('input');
        inputs.forEach((input) => {
            this.validator.validateInRealTime(input, input.id);
        });
    }
}
