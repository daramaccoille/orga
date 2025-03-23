export class VisualFlowBuilder {
    constructor(canvasId) {
        this.nodes = new Map();
        this.canvas = document.getElementById(canvasId);
        this.ctx = this.canvas.getContext('2d');
        this.initializeEventListeners();
    }
    initializeEventListeners() {
        this.canvas.addEventListener('dragover', this.handleDragOver.bind(this));
        this.canvas.addEventListener('drop', this.handleDrop.bind(this));
        this.canvas.addEventListener('click', this.handleNodeClick.bind(this));
    }
    addNode(type, data, position) {
        const node = {
            id: crypto.randomUUID(),
            type,
            data,
            position,
            connections: [],
        };
        this.nodes.set(node.id, node);
        this.drawNode(node);
    }
    drawNode(node) {
        this.ctx.beginPath();
        this.ctx.rect(node.position.x, node.position.y, 100, 50);
        this.ctx.fillStyle = this.getNodeColor(node.type);
        this.ctx.fill();
        this.ctx.stroke();
        this.ctx.fillStyle = 'white';
        this.ctx.fillText(node.type, node.position.x + 10, node.position.y + 30);
    }
    drawConnections() {
        this.nodes.forEach((node) => {
            node.connections.forEach((targetId) => {
                const target = this.nodes.get(targetId);
                if (target) {
                    this.drawConnection(node, target);
                }
            });
        });
    }
    exportStrategy() {
        return this.convertNodesToStrategy(Array.from(this.nodes.values()));
    }
    showConfigPanel(node) {
        // Base implementation
    }
}
export class EnhancedVisualFlowBuilder extends VisualFlowBuilder {
    constructor(canvasId, configPanelId) {
        super(canvasId);
        this.selectedNode = null;
        this.configPanel = document.getElementById(configPanelId);
        this.initializeConfigPanel();
    }
    handleNodeClick(event) {
        const node = this.findNodeAtPosition(event.offsetX, event.offsetY);
        if (node) {
            this.selectedNode = node;
            this.showConfigPanel(node);
        }
    }
    getNodeConfig(type) {
        switch (type) {
            case 'INDICATOR':
                return {
                    id: 'indicator-config',
                    type: 'INDICATOR',
                    parameters: new Map([
                        ['period', { type: 'number', default: 14, min: 1, max: 200 }],
                        ['source', { type: 'select', options: ['close', 'open', 'high', 'low'] }],
                    ]),
                    validation: (value) => value > 0 && value <= 200,
                };
            case 'PATTERN':
                return {
                    id: 'pattern-config',
                    type: 'PATTERN',
                    parameters: new Map([
                        ['patternType', { type: 'select', options: Object.keys(PATTERN_RATIOS) }],
                        ['tolerance', { type: 'number', default: 0.05, min: 0.01, max: 0.1 }],
                    ]),
                    validation: (value) => value >= 0.01 && value <= 0.1,
                };
            // Add more configurations for other node types
            default:
                return {
                    id: 'default-config',
                    type: 'DEFAULT',
                    parameters: new Map(),
                    validation: () => true,
                };
        }
    }
    createConfigHTML(config) {
        return `
      <div class="config-panel" data-node-id="${config.id}">
        <h3>${config.type} Configuration</h3>
        ${Array.from(config.parameters.entries())
            .map(([key, value]) => `
          <div class="form-group">
            <label for="${key}">${key}</label>
            ${this.createInputElement(key, value)}
          </div>
        `)
            .join('')}
        <button class="btn btn-primary" onclick="applyConfig()">Apply</button>
      </div>
    `;
    }
    createInputElement(key, config) {
        if (config.type === 'select') {
            return `
        <select class="form-control" id="${key}">
          ${config.options
                .map((opt) => `
            <option value="${opt}">${opt}</option>
          `)
                .join('')}
        </select>
      `;
        }
        return `
      <input 
        type="${config.type}" 
        class="form-control" 
        id="${key}"
        value="${config.default}"
        min="${config.min}"
        max="${config.max}"
      >
    `;
    }
}
