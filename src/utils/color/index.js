import Hex from "./hex";
import Hsl from "./hsl";
import { NAMED_COLORS } from "./regex";
import Rgb from "./rgb";

// Cache for parsed colors to avoid redundant RegExp parsing or canvas operations
const colorCache = new Map();
const MAX_CACHE_SIZE = 1000;

// Re-use standard canvas rendering context if available
let ctx = null;
if (typeof document !== "undefined") {
	try {
		const canvas = document.createElement("canvas");
		ctx = canvas.getContext("2d", { willReadFrequently: true });
	} catch (e) {
		// Fallback if canvas is not supported in the current context
	}
}

// Regex definitions for JS-native color parsing
const HEX_REGEX = /^#([0-9a-fA-F]{3,8})$/;

// Matches both rgb/rgba with commas or space/slash separators
const RGB_RGBA_REGEX =
	/^(rgba?)\s*\(\s*(\d+(?:\.\d+)?%?)\s*[, ]\s*(\d+(?:\.\d+)?%?)\s*[, ]\s*(\d+(?:\.\d+)?%?)(?:\s*[,/]\s*(\d+(?:\.\d+)?%?))?\s*\)$/i;

// Matches both hsl/hsla with commas or space/slash/double-slash separators
const HSL_HSLA_REGEX =
	/^(hsla?)\s*\(\s*(\d+(?:\.\d+)?(?:deg|rad|grad|turn)?)\s*[, ]\s*(\d+(?:\.\d+)?%)\s*[, ]\s*(\d+(?:\.\d+)?%)(?:\s*[,/]\s*(\d+(?:\.\d+)?%?))?\s*\)$/i;

function parseColorValue(val, max) {
	if (val.endsWith("%")) {
		return (Number.parseFloat(val) / 100) * max;
	}
	return Number.parseFloat(val);
}

function parseHex(hexStr) {
	const match = hexStr.match(HEX_REGEX);
	if (!match) return null;
	const hex = match[1];
	let r = 0;
	let g = 0;
	let b = 0;
	let a = 1;
	const len = hex.length;
	if (len === 3) {
		r = Number.parseInt(hex[0] + hex[0], 16);
		g = Number.parseInt(hex[1] + hex[1], 16);
		b = Number.parseInt(hex[2] + hex[2], 16);
	} else if (len === 4) {
		r = Number.parseInt(hex[0] + hex[0], 16);
		g = Number.parseInt(hex[1] + hex[1], 16);
		b = Number.parseInt(hex[2] + hex[2], 16);
		a = Number.parseInt(hex[3] + hex[3], 16) / 255;
	} else if (len === 6) {
		r = Number.parseInt(hex.slice(0, 2), 16);
		g = Number.parseInt(hex.slice(2, 4), 16);
		b = Number.parseInt(hex.slice(4, 6), 16);
	} else if (len === 8) {
		r = Number.parseInt(hex.slice(0, 2), 16);
		g = Number.parseInt(hex.slice(2, 4), 16);
		b = Number.parseInt(hex.slice(4, 6), 16);
		a = Number.parseInt(hex.slice(6, 8), 16) / 255;
	} else {
		return null;
	}
	if (isNaN(r) || isNaN(g) || isNaN(b) || isNaN(a)) return null;
	return new Rgb(r, g, b, a);
}

function parseRgbRgba(str) {
	const match = str.match(RGB_RGBA_REGEX);
	if (!match) return null;
	const [, type, rStr, gStr, bStr, aStr] = match;
	let r = parseColorValue(rStr, 255);
	let g = parseColorValue(gStr, 255);
	let b = parseColorValue(bStr, 255);
	let a = 1;
	if (aStr !== undefined) {
		a = aStr.endsWith("%")
			? Number.parseFloat(aStr) / 100
			: Number.parseFloat(aStr);
	}
	r = Math.min(255, Math.max(0, Math.round(r)));
	g = Math.min(255, Math.max(0, Math.round(g)));
	b = Math.min(255, Math.max(0, Math.round(b)));
	a = Math.min(1, Math.max(0, a));
	return new Rgb(r, g, b, a);
}

function parseHue(hueStr) {
	let val = Number.parseFloat(hueStr);
	if (hueStr.endsWith("deg")) {
		// val is already degrees
	} else if (hueStr.endsWith("rad")) {
		val = (val * 180) / Math.PI;
	} else if (hueStr.endsWith("grad")) {
		val = val * 0.9;
	} else if (hueStr.endsWith("turn")) {
		val = val * 360;
	}
	val = val % 360;
	if (val < 0) val += 360;
	return val;
}

function parseHslHsla(str) {
	const match = str.match(HSL_HSLA_REGEX);
	if (!match) return null;
	const [, type, hStr, sStr, lStr, aStr] = match;
	const h = parseHue(hStr);
	const s = Math.min(100, Math.max(0, Number.parseFloat(sStr))) / 100;
	const l = Math.min(100, Math.max(0, Number.parseFloat(lStr))) / 100;
	let a = 1;
	if (aStr !== undefined) {
		a = aStr.endsWith("%")
			? Number.parseFloat(aStr) / 100
			: Number.parseFloat(aStr);
	}
	a = Math.min(1, Math.max(0, a));
	return new Hsl(h / 360, s, l, a).rgb;
}

function parseNamedColor(str) {
	const lower = str.toLowerCase();
	if (lower === "transparent") {
		return new Rgb(0, 0, 0, 0);
	}
	const mapped = NAMED_COLORS[lower];
	if (mapped) {
		return parseRgbRgba(mapped);
	}
	return null;
}

function getParsedColor(colorStr) {
	const trimmed = colorStr.trim();
	let cached = colorCache.get(trimmed);
	if (cached) {
		return new Rgb(cached.r, cached.g, cached.b, cached.a);
	}

	let rgb = null;
	if (trimmed.startsWith("#")) {
		rgb = parseHex(trimmed);
	} else if (trimmed.toLowerCase().startsWith("rgb")) {
		rgb = parseRgbRgba(trimmed);
	} else if (trimmed.toLowerCase().startsWith("hsl")) {
		rgb = parseHslHsla(trimmed);
	} else {
		rgb = parseNamedColor(trimmed);
	}

	if (!rgb && ctx) {
		// Fallback to canvas
		const { canvas } = ctx;
		ctx.clearRect(0, 0, canvas.width, canvas.height);
		ctx.fillStyle = trimmed;
		ctx.fillRect(0, 0, 1, 1);
		const [r, g, b, a] = ctx.getImageData(0, 0, 1, 1).data;
		rgb = new Rgb(r, g, b, a / 255);
	}

	// If parsed successfully, cache it
	if (rgb) {
		if (colorCache.size >= MAX_CACHE_SIZE) {
			const firstKey = colorCache.keys().next().value;
			colorCache.delete(firstKey);
		}
		colorCache.set(trimmed, rgb);
		return new Rgb(rgb.r, rgb.g, rgb.b, rgb.a);
	}

	return new Rgb(0, 0, 0, 1);
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
		this.rgb = getParsedColor(color);
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
