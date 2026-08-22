export default {
	/**
	 * The path.dirname() method returns the directory name of a path,
	 * similar to the Unix dirname command.
	 * Trailing directory separators are ignored.
	 * @param {string} path
	 * @returns {string}
	 */
	// Performance optimization: Uses native string operations (lastIndexOf, slice, indexOf)
	// instead of expensive .split('/'), array slicing, regex matching, unshift, and join('/').
	dirname(path) {
		if (path.endsWith("/")) path = path.slice(0, -1);
		const lastIdx = path.lastIndexOf("/");
		if (lastIdx === -1) return ".";
		if (lastIdx === 0) return "/";

		const dir = path.slice(0, lastIdx);
		const firstSlash = dir.indexOf("/");
		if (firstSlash === -1) {
			if (dir === "." || dir === "..") return dir;
			return "./" + dir;
		}
		if (firstSlash === 0) return dir;
		const seg0 = dir.slice(0, firstSlash);
		if (seg0 === "." || seg0 === "..") return dir;
		return "./" + dir;
	},

	/**
	 * The path.basename() methods returns the last portion of a path,
	 * similar to the Unix basename command.
	 * Trailing directory separators are ignored, see path.sep.
	 * @param {string} path
	 * @returns {string}
	 */
	// Performance optimization: Uses fast string slicing and indexing to locate the basename and
	// avoids dynamic RegExp compilation (new RegExp(ext + "$")) and array allocations from .split('/').
	basename(path, ext = "") {
		ext = ext || "";
		if (path === "" || path === "/") return path;
		if (path.endsWith("/")) path = path.slice(0, -1);
		const idx = path.lastIndexOf("/");
		let last = idx === -1 ? path : path.slice(idx + 1);
		const qIdx = last.indexOf("?");
		if (qIdx !== -1) last = last.slice(0, qIdx);

		let res = last.includes("%") ? decodeURI(last) : last;
		if (ext && this.extname(res) === ext && res.endsWith(ext)) {
			res = res.slice(0, -ext.length);
		}
		return res;
	},

	/**
	 * returns the extension of the path, from the last occurrence of the . (period)
	 * character to end of string in the last portion of the path.
	 * If there is no . in the last portion of the path, or if there are no . characters
	 * other than the first character of the basename of path (see path.basename()) , an
	 * empty string is returned.
	 * @param {string} path
	 */
	// Performance optimization: Extracts filename via lastIndexOf('/') and finds dot position
	// via lastIndexOf('.'), avoiding expensive regular expression testing and array splitting.
	extname(path) {
		const slashIdx = path.lastIndexOf("/");
		const filename = slashIdx === -1 ? path : path.slice(slashIdx + 1);
		const dotIdx = filename.lastIndexOf(".");
		if (dotIdx > 0) {
			return filename.slice(dotIdx);
		}
		return "";
	},

	/**
	 * returns a path string from an object.
	 * @param {PathObject} pathObject
	 */
	format(pathObject) {
		let { root, dir, ext, name, base } = pathObject;

		if (base || !ext.startsWith(".")) {
			ext = "";
			if (base) name = "";
		}

		dir = dir || root;

		if (!dir.endsWith("/")) dir += "/";

		return dir + (base || name) + ext;
	},

	/**
	 * The path.isAbsolute() method determines if path is an absolute path.
	 * @param {string} path
	 */
	isAbsolute(path) {
		return path.startsWith("/");
	},

	/**
	 * Joins the given number of paths
	 * @param  {...string} paths
	 */
	join(...paths) {
		let res = paths.join("/");
		return this.normalize(res);
	},

	/**
	 * Normalizes the given path, resolving '..' and '.' segments.
	 * @param {string} path
	 */
	normalize(path) {
		path = path.replace(/\.\/+/g, "./");
		path = path.replace(/\/+/g, "/");

		const resolved = [];
		const pathAr = path.split("/");

		pathAr.forEach((dir) => {
			if (dir === "..") {
				if (resolved.length) resolved.pop();
			} else if (dir === ".") {
				return;
			} else {
				resolved.push(dir);
			}
		});

		return resolved.join("/");
	},

	/**
	 *
	 * @param {string} path
	 * @returns {PathObject}
	 */
	parse(path) {
		const root = path.startsWith("/") ? "/" : "";
		const dir = this.dirname(path);
		const ext = this.extname(path);
		const name = this.basename(path, ext);
		const base = this.basename(path);

		return {
			root,
			dir,
			base,
			ext,
			name,
		};
	},

	/**
 * Resolve the path eg.
```js
resolvePath('path/to/some/dir/', '../../dir') //returns 'path/to/dir'
```
 * @param {...string} paths 
 */
	resolve(...paths) {
		if (!paths.length) throw new Error("resolve(...path) : Arguments missing!");

		let result = "";

		paths.forEach((path) => {
			if (path.startsWith("/")) {
				result = path;
				return;
			}

			result = this.normalize(this.join(result, path));
		});

		if (result.startsWith("/")) return result;
		else return "/" + result;
	},

	/**
	 * Gets path for path2 relative to path1
	 * @param {String} path1
	 * @param {String} path2
	 */
	convertToRelative(path1, path2) {
		path1 = this.normalize(path1).split("/");
		path2 = this.normalize(path2).split("/");

		const p1len = path1.length;
		const p2len = path2.length;

		let flag = false;
		let path = [];

		path1.forEach((dir, i) => {
			if (dir === path2[i] && !flag) return;

			path.push(path2[i]);
			if (!flag) {
				flag = true;
				return;
			}

			if (flag) path.unshift("..");
		});

		if (p2len > p1len) path.push(...path2.slice(p1len));

		return path.join("/");
	},
};
