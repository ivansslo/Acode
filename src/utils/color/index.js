import Hex from "./hex";
import Hsl from "./hsl";
import { NAMED_COLORS } from "./regex";
import Rgb from "./rgb";

/**@type {CanvasRenderingContext2D} */
const ctx =
	typeof document !== "undefined"
		? document.createElement("canvas").getContext("2d", {
				willReadFrequently: true,
			})
		: null;

const colorCache = new Map();
const MAX_CACHE_SIZE = 1000;

function parseComponent(val, max) {
	val = val.trim();
	if (val.endsWith("%")) {
		return Math.round((Number.parseFloat(val) / 100) * max);
	}
	return Number.parseFloat(val);
}

function parseAlphaComponent(val) {
	val = val.trim();
	if (val.endsWith("%")) {
		return Number.parseFloat(val) / 100;
	}
	return Number.parseFloat(val);
}

function parseColorStringToRgb(colorStr) {
	let key = colorStr.trim().toLowerCase();

	// 1. Transparent
	if (key === "transparent") {
		return new Rgb(0, 0, 0, 0);
	}

	// 2. Named colors
	if (NAMED_COLORS[key]) {
		key = NAMED_COLORS[key];
	}

	// 3. Hex colors
	if (key.startsWith("#")) {
		const str = key.slice(1);
		const len = str.length;
		let r,
			g,
			b,
			a = 1;
		if (len === 3) {
			r = Number.parseInt(str[0] + str[0], 16);
			g = Number.parseInt(str[1] + str[1], 16);
			b = Number.parseInt(str[2] + str[2], 16);
		} else if (len === 4) {
			r = Number.parseInt(str[0] + str[0], 16);
			g = Number.parseInt(str[1] + str[1], 16);
			b = Number.parseInt(str[2] + str[2], 16);
			a = Number.parseInt(str[3] + str[3], 16) / 255;
		} else if (len === 6) {
			r = Number.parseInt(str.slice(0, 2), 16);
			g = Number.parseInt(str.slice(2, 4), 16);
			b = Number.parseInt(str.slice(4, 6), 16);
		} else if (len === 8) {
			r = Number.parseInt(str.slice(0, 2), 16);
			g = Number.parseInt(str.slice(2, 4), 16);
			b = Number.parseInt(str.slice(4, 6), 16);
			a = Number.parseInt(str.slice(6, 8), 16) / 255;
		} else {
			return null;
		}
		if (isNaN(r) || isNaN(g) || isNaN(b) || isNaN(a)) return null;
		return new Rgb(r, g, b, a);
	}

	// 4. RGB / RGBA
	if (key.startsWith("rgb")) {
		const match = key.match(/^rgba?\s*\(([^)]+)\)/i);
		if (match) {
			const parts = match[1].split(/[\s,]+/);
			const cleanParts = parts.filter((p) => p && p !== "/");
			if (cleanParts.length >= 3) {
				const r = parseComponent(cleanParts[0], 255);
				const g = parseComponent(cleanParts[1], 255);
				const b = parseComponent(cleanParts[2], 255);
				let a = 1;
				if (cleanParts.length >= 4) {
					a = parseAlphaComponent(cleanParts[3]);
				}
				if (isNaN(r) || isNaN(g) || isNaN(b) || isNaN(a)) return null;
				return new Rgb(r, g, b, a);
			}
		}
	}

	// 5. HSL / HSLA
	if (key.startsWith("hsl")) {
		const match = key.match(/^hsla?\s*\(([^)]+)\)/i);
		if (match) {
			const parts = match[1].split(/[\s,]+/);
			const cleanParts = parts.filter((p) => p && p !== "/");
			if (cleanParts.length >= 3) {
				const hStr = cleanParts[0].trim();
				let h = Number.parseFloat(hStr);
				if (hStr.endsWith("deg")) h = h;
				else if (hStr.endsWith("rad")) h = (h * 180) / Math.PI;
				else if (hStr.endsWith("turn")) h = h * 360;
				h = (((h % 360) + 360) % 360) / 360;

				const s = parseComponent(cleanParts[1], 100) / 100;
				const l = parseComponent(cleanParts[2], 100) / 100;
				let a = 1;
				if (cleanParts.length >= 4) {
					a = parseAlphaComponent(cleanParts[3]);
				}
				if (isNaN(h) || isNaN(s) || isNaN(l) || isNaN(a)) return null;
				return new Hsl(h, s, l, a).rgb;
			}
		}
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
		const key = color.trim().toLowerCase();
		if (colorCache.has(key)) {
			const cached = colorCache.get(key);
			this.rgb = new Rgb(cached.r, cached.g, cached.b, cached.a);
			return;
		}

		const parsed = parseColorStringToRgb(key);
		if (parsed) {
			if (colorCache.size >= MAX_CACHE_SIZE) {
				const firstKey = colorCache.keys().next().value;
				colorCache.delete(firstKey);
			}
			colorCache.set(key, parsed);
			this.rgb = new Rgb(parsed.r, parsed.g, parsed.b, parsed.a);
			return;
		}

		if (!ctx) {
			this.rgb = new Rgb(0, 0, 0, 1);
			return;
		}
		const { canvas } = ctx;
		ctx.clearRect(0, 0, canvas.width, canvas.height);
		ctx.fillStyle = color;
		ctx.fillRect(0, 0, 1, 1);
		const [r, g, b, a] = ctx.getImageData(0, 0, 1, 1).data;
		this.rgb = new Rgb(r, g, b, a / 255);

		if (colorCache.size >= MAX_CACHE_SIZE) {
			const firstKey = colorCache.keys().next().value;
			colorCache.delete(firstKey);
		}
		colorCache.set(key, this.rgb);
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
