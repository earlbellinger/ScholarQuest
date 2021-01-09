const qs = (sel) => document.querySelector(sel);

const toRadian = Math.PI / 180;

const canvas = qs('canvas');
const ctx = canvas.getContext('2d');

const width = window.innerWidth;
const height = window.innerHeight;

canvas.width = width;
canvas.height = height;

const maxDepth = 3;
const defaultScale = 10;
let curveScale = defaultScale;

let dimensions = {
	minX: null,
	maxX: null,
	minY: null,
	maxY: null,
};

let currentDepth = 0;
let currentAngle = 0;

let x = 0;
let y = 0;

const clear = () => {
	ctx.clearRect(0, 0, width, height);
};

const adjustAngle = (curve, plusMinus) => {
	if (plusMinus === '+') {
		currentAngle -= curve.angle;
	} else {
		currentAngle += curve.angle;
	}
};

const stackPush = (curve) => {
	curve.stack.push([x, y, currentAngle]);
};

const stackPop = (curve) => {
	[x, y, currentAngle] = curve.stack.pop();
};

const drawLine = (curve, instruction, runForDimensions = true) => {
	const nextX = x + (Math.cos(currentAngle) * curveScale);
	const nextY = y + (Math.sin(currentAngle) * curveScale);
	if (!runForDimensions) {
		ctx.beginPath();
		ctx.moveTo(x, y);
		ctx.lineTo(nextX, nextY);
		ctx.stroke();
		ctx.closePath();
	}
	x = nextX;
	y = nextY;

	if (runForDimensions) {
		if (!dimensions.minX || x < dimensions.minX) {
			dimensions.minX = x;
		}
		if (!dimensions.maxX || x > dimensions.maxX) {
			dimensions.maxX = x;
		}
		if (!dimensions.minY || y < dimensions.minY) {
			dimensions.minY = y;
		}
		if (!dimensions.maxY || y > dimensions.maxY) {
			dimensions.maxY = y;
		}
	}
};

const drawCurve = (curve, runForDimensions = false) => {
	clear();
	x = 0;
	y = 0;
	currentAngle = curve.startAngle || 0;
	currentDepth = 0;
	curve.stack = [];
	const variablesPattern = (curve.variables || []).join('|');
	const regex = new RegExp(variablesPattern, 'g');
	const lSystemString = curve.result.replace(regex, '');
	const curveInstructions = lSystemString.split('');
	if (!runForDimensions) {
		const w = (Math.abs(dimensions.minX) + dimensions.maxX) / (defaultScale / curveScale);
		const h = (Math.abs(dimensions.minY) + dimensions.maxY) / (defaultScale / curveScale);
		const offsetX = (Math.abs(dimensions.minX) / (defaultScale / curveScale)) + (width * 0.5) - (w * 0.5);
		const offsetY = (-dimensions.minY / (defaultScale / curveScale)) + (height * 0.5) - (h * 0.5);
		ctx.save();
		ctx.translate(offsetX, offsetY);
	}
	curveInstructions.forEach((instruction) => {
		const method = map[instruction] || drawLine;
		method(curve, instruction, runForDimensions);
	});
	if (!runForDimensions) {
		ctx.restore();
	}
};

const reset = (curve) => {
	x = 0;
	y = 0;

	dimensions = {
		minX: null,
		maxX: null,
		minY: null,
		maxY: null,
	};

	currentAngle = curve.startAngle || 0;
	currentDepth = 0;
	curveScale = defaultScale;

	curve.stack = [];
	curve.result = curve.axiom;
};

const generate = (curve) => {
	reset(curve);
	const maxLoops = curve.maxDepth || maxDepth;
	while (currentDepth < maxLoops) {
		const pattern = Object.keys(curve.rules).join('|');
		const regex = new RegExp(pattern, 'g');

		curve.result = curve.result.replace(regex, match => curve.rules[match]);

		currentDepth++;
	}
	drawCurve(curve, true);
	const totalWidth = Math.abs(dimensions.minX) + (dimensions.maxX);
	const totalHeight = Math.abs(dimensions.minY) + dimensions.maxY;
	const scaleWidth = window.innerWidth / totalWidth;
	const scaleHeight = window.innerHeight / totalHeight;
	curveScale = defaultScale * Math.min(scaleWidth, scaleHeight);
	drawCurve(curve, false);
};

const map = {
	'+': adjustAngle,
	'-': adjustAngle,
	'[': stackPush,
	']': stackPop,
};

const presetSelect = qs('.js-curve');

presetSelect.addEventListener('change', (e) => {
	generate(presets[e.target.value]);
});

generate(presets[presetSelect.value]);
