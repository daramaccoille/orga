class StrategyBuilder {
  constructor() {
    this.initializeDragAndDrop();
    this.initializeEventListeners();
  }

  initializeDragAndDrop() {
    const componentList = document.getElementById('component-list');
    const strategyCanvas = document.getElementById('strategy-canvas');

    componentList.addEventListener('dragstart', (e) => {
      e.dataTransfer.setData('text/plain', e.target.dataset.type);
    });

    strategyCanvas.addEventListener('dragover', (e) => e.preventDefault());
    strategyCanvas.addEventListener('drop', (e) => {
      e.preventDefault();
      const type = e.dataTransfer.getData('text/plain');
      this.addComponent(type);
    });
  }

  addComponent(type) {
    const component = this.createComponentElement(type);
    document.getElementById('strategy-canvas').appendChild(component);
  }

  createComponentElement(type) {
    const div = document.createElement('div');
    div.className = 'component p-2 border rounded mb-2';
    div.innerHTML = this.getComponentTemplate(type);
    return div;
  }

  getComponentTemplate(type) {
    switch(type) {
      case 'INDICATOR':
        return this.getIndicatorTemplate();
      case 'PATTERN':
        return this.getPatternTemplate();
      default:
        return '';
    }
  }

  // ... other helper methods
}

new StrategyBuilder(); 