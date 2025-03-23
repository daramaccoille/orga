export class PatternVisualizer {
    constructor(canvasId, config) {
        this.canvas = document.getElementById(canvasId);
        this.ctx = this.canvas.getContext('2d');
        this.config = config;
    }
    visualizePattern(pattern) {
        this.clearCanvas();
        this.drawGrid();
        this.drawPattern(pattern);
        this.drawLabels(pattern);
        this.drawFibonacciLevels(pattern);
    }
    drawPattern(pattern) {
        const points = this.normalizePoints(pattern.points);
        this.ctx.beginPath();
        this.ctx.moveTo(points[0].x, points[0].y);
        for (let i = 1; i < points.length; i++) {
            this.ctx.lineTo(points[i].x, points[i].y);
        }
        this.ctx.strokeStyle = this.config.colors.lines;
        this.ctx.stroke();
        // Draw points
        points.forEach((point, index) => {
            this.drawPoint(point, ['X', 'A', 'B', 'C', 'D'][index]);
        });
    }
    drawFibonacciLevels(pattern) {
        const levels = [0, 0.236, 0.382, 0.5, 0.618, 0.786, 1, 1.272, 1.618];
        const points = this.normalizePoints(pattern.points);
        levels.forEach((level) => {
            const y = this.calculateFibLevel(points[0].y, points[1].y, level);
            this.ctx.beginPath();
            this.ctx.moveTo(0, y);
            this.ctx.lineTo(this.canvas.width, y);
            this.ctx.strokeStyle = `rgba(255, 255, 255, 0.2)`;
            this.ctx.stroke();
            this.ctx.fillStyle = this.config.colors.text;
            this.ctx.fillText(`${level}`, 10, y - 5);
        });
    }
    drawPoint(point, label) {
        this.ctx.beginPath();
        this.ctx.arc(point.x, point.y, 5, 0, Math.PI * 2);
        this.ctx.fillStyle = this.config.colors.points;
        this.ctx.fill();
        this.ctx.fillStyle = this.config.colors.text;
        this.ctx.fillText(label, point.x + 10, point.y - 10);
    }
    normalizePoints(points) {
        // Scale points to fit canvas
        const xValues = points.map((p) => p.x);
        const yValues = points.map((p) => p.y);
        const xMin = Math.min(...xValues);
        const xMax = Math.max(...xValues);
        const yMin = Math.min(...yValues);
        const yMax = Math.max(...yValues);
        return points.map((point) => ({
            x: this.scaleValue(point.x, xMin, xMax, this.config.padding, this.canvas.width - this.config.padding),
            y: this.scaleValue(point.y, yMin, yMax, this.canvas.height - this.config.padding, this.config.padding),
            time: point.time,
        }));
    }
    scaleValue(value, inMin, inMax, outMin, outMax) {
        return ((value - inMin) * (outMax - outMin)) / (inMax - inMin) + outMin;
    }
    clearCanvas() {
        this.ctx.fillStyle = this.config.colors.background;
        this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);
    }
    drawGrid() {
        this.ctx.strokeStyle = 'rgba(255, 255, 255, 0.1)';
        this.ctx.lineWidth = 0.5;
        // Draw vertical lines
        for (let x = 0; x <= this.canvas.width; x += 50) {
            this.ctx.beginPath();
            this.ctx.moveTo(x, 0);
            this.ctx.lineTo(x, this.canvas.height);
            this.ctx.stroke();
        }
        // Draw horizontal lines
        for (let y = 0; y <= this.canvas.height; y += 50) {
            this.ctx.beginPath();
            this.ctx.moveTo(0, y);
            this.ctx.lineTo(this.canvas.width, y);
            this.ctx.stroke();
        }
    }
    drawLabels(pattern) {
        this.ctx.fillStyle = this.config.colors.text;
        this.ctx.font = '12px Arial';
        pattern.points.forEach((point, index) => {
            const label = ['X', 'A', 'B', 'C', 'D'][index];
            this.ctx.fillText(`${label} (${point.time.toLocaleTimeString()})`, 10, 20 + index * 20);
        });
    }
    calculateFibLevel(start, end, level) {
        return start + (end - start) * level;
    }
}
