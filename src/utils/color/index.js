import Hex from "./hex";
import Hsl from "./hsl";
import { NAMED_COLORS } from "./regex";
import Rgb from "./rgb";

const colorCache = new Map();

/**@type {CanvasRenderingContext2D} */
const ctx =
	typeof document !== "undefined"
		? document.createElement("canvas").getContext("2d", {
				willReadFrequently: true,
			})
		: null;

function parseHex(color) {
	if (!color.startsWith("#")) return null;
	const hex = color.slice(1);
	const len = hex.length;
	let r = 0;
	let g = 0;
	let b = 0;
	let a = 1;
	if (len === 3 || len === 4) {
		r = Number.parseInt(hex[0] + hex[0], 16);
		g = Number.parseInt(hex[1] + hex[1], 16);
		b = Number.parseInt(hex[2] + hex[2], 16);
		if (len === 4) {
			a = Number.parseInt(hex[3] + hex[3], 16) / 255;
		}
	} else if (len === 6 || len === 8) {
		r = Number.parseInt(hex.slice(0, 2), 16);
		g = Number.parseInt(hex.slice(2, 4), 16);
		b = Number.parseInt(hex.slice(4, 6), 16);
		if (len === 8) {
			a = Number.parseInt(hex.slice(6, 8), 16) / 255;
		}
	} else {
		return null;
	}

	if (isNaN(r) || isNaN(g) || isNaN(b) || isNaN(a)) {
		return null;
	}

	return [r, g, b, a];
}

function parseRgb(color) {
	const match = color.match(/^rgba?\s*\(([^)]+)\)$/i);
	if (!match) return null;

	const parts = match[1].split(/[\s,+/]+/).filter(Boolean);
	if (parts.length !== 3 && parts.length !== 4) return null;

	const parseComponent = (val, max) => {
		if (val.endsWith("%")) {
			return (Number.parseFloat(val) / 100) * max;
		}
		return Number.parseFloat(val);
	};

	let r = parseComponent(parts[0], 255);
	let g = parseComponent(parts[1], 255);
	let b = parseComponent(parts[2], 255);
	let a = parts.length === 4 ? parseComponent(parts[3], 1) : 1;

	if (isNaN(r) || isNaN(g) || isNaN(b) || isNaN(a)) {
		return null;
	}

	r = Math.max(0, Math.min(255, Math.round(r)));
	g = Math.max(0, Math.min(255, Math.round(g)));
	b = Math.max(0, Math.min(255, Math.round(b)));
	a = Math.max(0, Math.min(1, a));

	return [r, g, b, a];
}

function parseHsl(color) {
	const match = color.match(/^hsla?\s*\(([^)]+)\)$/i);
	if (!match) return null;

	const parts = match[1].split(/[\s,+/]+/).filter(Boolean);
	if (parts.length !== 3 && parts.length !== 4) return null;

	const parseHue = (val) => {
		let deg = Number.parseFloat(val);
		if (val.endsWith("deg")) {
			deg = Number.parseFloat(val);
		} else if (val.endsWith("rad")) {
			deg = (Number.parseFloat(val) * 180) / Math.PI;
		} else if (val.endsWith("grad")) {
			deg = Number.parseFloat(val) * 0.9;
		} else if (val.endsWith("turn")) {
			deg = Number.parseFloat(val) * 360;
		}
		return (((deg % 360) + 360) % 360) / 360;
	};

	const parsePercent = (val) => {
		if (val.endsWith("%")) {
			return Number.parseFloat(val) / 100;
		}
		return Number.parseFloat(val);
	};

	const h = parseHue(parts[0]);
	const s = parsePercent(parts[1]);
	const l = parsePercent(parts[2]);
	const a = parts.length === 4 ? parsePercent(parts[3]) : 1;

	if (isNaN(h) || isNaN(s) || isNaN(l) || isNaN(a)) {
		return null;
	}

	const hslObj = new Hsl(h, s, l, a);
	const rgbObj = hslObj.rgb;
	return [rgbObj.r, rgbObj.g, rgbObj.b, rgbObj.a];
}

function parseColor(colorStr) {
	const trimmed = colorStr.trim().toLowerCase();

	if (trimmed === "transparent") {
		return [0, 0, 0, 0];
	}

	if (NAMED_COLORS[trimmed]) {
		return parseColor(NAMED_COLORS[trimmed]);
	}

	if (trimmed.startsWith("#")) {
		return parseHex(trimmed);
	}

	if (trimmed.startsWith("rgb")) {
		return parseRgb(trimmed);
	}

	if (trimmed.startsWith("hsl")) {
		return parseHsl(trimmed);
	}

	return null;
}

export default (/**@type {string}*/ color) => {
	return new Color(color);
};

class Color {
	rgb = new Rgb(0, 0, 0, 1);

	/**
	 * Create a color from a string
	 * @param {string} color
	 */
	constructor(color) {
		const cached = colorCache.get(color);
		if (cached) {
			this.rgb = new Rgb(cached[0], cached[1], cached[2], cached[3]);
			return;
		}

		let parsed = parseColor(color);
		if (!parsed) {
			// fallback to canvas
			if (ctx) {
				const { canvas } = ctx;
				ctx.clearRect(0, 0, canvas.width, canvas.height);
				ctx.fillStyle = color;
				ctx.fillRect(0, 0, 1, 1);
				const [r, g, b, a] = ctx.getImageData(0, 0, 1, 1).data;
				parsed = [r, g, b, a / 255];
			} else {
				parsed = [0, 0, 0, 0];
			}
		}

		if (colorCache.size >= 1000) {
			const firstKey = colorCache.keys().next().value;
			colorCache.delete(firstKey);
		}
		colorCache.set(color, parsed);

		this.rgb = new Rgb(parsed[0], parsed[1], parsed[2], parsed[3]);
	}

	darken(ratio) {
		const hsl = Hsl.fromRgb(this.rgb);
		hsl.l = Math.max(0, hsl.l - ratio * hsl.l);
		this.rgb = hsl.rgb;
		return this;
	}

	lighten(ratio) {
		const hsl = Hsl.fromRgb(this.rgb);
		hsl.l = Math.min(1, hsl.l + ratio * hsl.l);
		this.rgb = hsl.rgb;
		return this;
	}

	get isDark() {
		return this.luminance < 0.5;
	}

	get isLight() {
		return this.luminance >= 0.5;
	}

	get lightness() {
		return this.hsl.l;
	}

	/**
	 * Get the luminance of the color
	 * Returns a value between 0 and 1
	 */
	get luminance() {
		let { r, g, b } = this.rgb;
		r /= 255;
		g /= 255;
		b /= 255;
		return 0.2126 * r + 0.7152 * g + 0.0722 * b;
	}

	get hex() {
		return Hex.fromRgb(this.rgb);
	}

	get hsl() {
		return Hsl.fromRgb(this.rgb);
	}
}
