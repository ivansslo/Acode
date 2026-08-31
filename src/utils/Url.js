import URLParse from "url-parse";
import path from "./Path";
import Uri from "./Uri";

export default {
	/**
	 * Returns basename from a url eg. 'index.html' from 'ftp://localhost/foo/bar/index.html'
	 * @param {string} url
	 * @returns {string}
	 */
	basename(url) {
		url = this.parse(url).url;
		const protocol = this.getProtocol(url);
		if (protocol === "content:") {
			try {
				let { rootUri, docId, isFileUri } = Uri.parse(url);

				if (isFileUri) return this.basename(rootUri);

				if (docId.endsWith("/")) docId = docId.slice(0, -1);
				const colonIdx = docId.lastIndexOf(":");
				if (colonIdx !== -1) docId = docId.slice(colonIdx + 1);

				// Optimize: Use lastIndexOf('/') slice instead of split('/').pop()
				const pathName = this.pathname(docId);
				const lastSlash = pathName.lastIndexOf("/");
				return lastSlash === -1 ? pathName : pathName.slice(lastSlash + 1);
			} catch (error) {
				return null;
			}
		} else {
			if (url.endsWith("/")) url = url.slice(0, -1);
			// Optimize: Use lastIndexOf('/') slice instead of split('/').pop()
			const pathName = this.pathname(url);
			const lastSlash = pathName.lastIndexOf("/");
			return lastSlash === -1 ? pathName : pathName.slice(lastSlash + 1);
		}
	},

	/**
	 * Checks if given urls are same or not
	 * @param  {...String} urls
	 * @returns {Boolean}
	 */
	areSame(...urls) {
		let firstUrl = urls[0];
		if (firstUrl.endsWith("/")) firstUrl = firstUrl.slice(0, -1);
		return urls.every((url) => {
			if (url.endsWith("/")) url = url.slice(0, -1);
			return firstUrl === url;
		});
	},

	/**
	 *
	 * @param {String} url
	 * returns the extension of the path, from the last occurrence of the . (period)
	 * character to end of string in the last portion of the path.
	 * If there is no . in the last portion of the path, or if there are no .
	 * characters other than the first character of the basename of path (see path.basename()),
	 * an empty string is returned.
	 * @returns {String}
	 */
	extname(url) {
		const name = this.basename(url);
		if (name) return path.extname(name);
		else return null;
	},
	/**
	 * Join all arguments together and normalize the resulting path.
	 * @param  {...string} pathnames
	 * @returns {String}
	 */
	join(...pathnames) {
		if (pathnames.length < 2)
			throw new Error("Join(), requires at least two parameters");

		let { url, query } = this.parse(pathnames[0]);

		const match = this.PROTOCOL_PATTERN.exec(url);
		const protocol = match ? match[0] : "";

		if (protocol === "content://") {
			try {
				if (pathnames[1].startsWith("/")) pathnames[1] = pathnames[1].slice(1);
				const contentUri = Uri.parse(url);
				const colonIdx = contentUri.docId.indexOf(":");
				let root;
				let pathname;
				if (colonIdx !== -1) {
					root = contentUri.docId.slice(0, colonIdx);
					pathname = contentUri.docId.slice(colonIdx + 1);
				} else {
					root = contentUri.docId;
					pathname = undefined;
				}
				let newDocId = path.join(pathname || "", ...pathnames.slice(1));
				if (url.startsWith("content://com.termux")) {
					const rootCondition = root.endsWith("/");
					const newDocIdCondition = newDocId.startsWith("/");
					if (rootCondition === newDocIdCondition) {
						root = root.slice(0, -1);
					} else if (!rootCondition === !newDocIdCondition) {
						root += "/";
					}
					return `${contentUri.rootUri}::${root}${newDocId}${query}`;
				}

				// if pathname is undefined, meaning a docId/volume (e.g :primary:)
				// has not been detected, so no newDocId's ":" will be added.
				if (!pathname) {
					// Ensure proper path separator between root and newDocId
					let separator = "";
					if (root.endsWith("/") && newDocId.startsWith("/")) {
						// Both have separator, strip one from newDocId
						newDocId = newDocId.slice(1);
					} else if (!root.endsWith("/") && !newDocId.startsWith("/")) {
						// Neither has separator, add one
						separator = "/";
					}
					return `${contentUri.rootUri}::${root}${separator}${newDocId}${query}`;
				}
				return `${contentUri.rootUri}::${root}:${newDocId}${query}`;
			} catch (error) {
				return null;
			}
		} else if (protocol) {
			// Optimize: Replace dynamic new RegExp("^" + protocol) with slice(protocol.length)
			url = url.slice(protocol.length);
			pathnames[0] = url;
			return protocol + path.join(...pathnames) + query;
		} else {
			return path.join(url, ...pathnames.slice(1)) + query;
		}
	},
	/**
	 * Make url safe by encoding url components
	 * @param {string} url
	 * @returns {string}
	 */
	safe(url) {
		let { url: uri, query } = this.parse(url);
		url = uri;
		const match = this.PROTOCOL_PATTERN.exec(url);
		const protocol = match ? match[0] : "";
		// Optimize: Replace dynamic new RegExp("^" + protocol) with slice(protocol.length)
		if (protocol) url = url.slice(protocol.length);
		const parts = url.split("/").map((part, i) => {
			if (i === 0) return part;
			return fixedEncodeURIComponent(part);
		});
		return protocol + parts.join("/") + query;

		function fixedEncodeURIComponent(str) {
			return encodeURIComponent(str).replace(/[!'()*]/g, function (c) {
				return "%" + c.charCodeAt(0).toString(16);
			});
		}
	},
	/**
	 * Gets pathname from url eg. gets '/foo/bar' from 'ftp://myhost.com/foo/bar'
	 * @param {string} url
	 * @returns {string}
	 */
	pathname(url) {
		if (typeof url !== "string" || !this.PROTOCOL_PATTERN.test(url)) return url;

		// Optimize: Replace url.split("?")[0] with indexOf('?') slice
		const queryIdx = url.indexOf("?");
		if (queryIdx !== -1) url = url.slice(0, queryIdx);

		const match = this.PROTOCOL_PATTERN.exec(url);
		const protocol = match ? match[0] : "";

		if (protocol === "content://") {
			try {
				const { rootUri, docId, isFileUri } = Uri.parse(url);
				if (isFileUri) return this.pathname(rootUri);
				else {
					const colonIdx = docId.indexOf(":");
					return "/" + (colonIdx !== -1 ? docId.slice(colonIdx + 1) : docId);
				}
			} catch (error) {
				return null;
			}
		} else {
			// Optimize: Replace dynamic new RegExp("^" + protocol) with slice(protocol.length)
			if (protocol) url = url.slice(protocol.length);

			if (protocol !== "file:///") {
				// Optimize: Slicing from first slash instead of split('/').slice(1).join('/')
				const slashIdx = url.indexOf("/");
				if (slashIdx === -1) return "/";
				return url.slice(slashIdx);
			}

			return "/" + url;
		}
	},

	/**
	 * Returns dirname from url eg. 'ftp://localhost/foo/'  from 'ftp://localhost/foo/bar'
	 * @param {string} url
	 * @returns {string}
	 */
	dirname(url) {
		if (typeof url !== "string") throw new Error("URL must be string");

		const urlObj = this.parse(url);
		url = urlObj.url;
		const protocol = this.getProtocol(url);

		if (protocol === "content:") {
			try {
				let { rootUri, docId, isFileUri } = Uri.parse(url);

				if (isFileUri) return this.dirname(rootUri);
				else {
					if (docId.endsWith("/")) docId = docId.slice(0, -1);
					// Optimize: Use lastIndexOf('/') slice instead of split('/').slice(0, -1).join('/')
					const lastSlash = docId.lastIndexOf("/");
					docId = lastSlash === -1 ? "" : docId.slice(0, lastSlash + 1);
					return Uri.format(rootUri, docId);
				}
			} catch (error) {
				return null;
			}
		} else {
			if (url.endsWith("/")) url = url.slice(0, -1);
			// Optimize: Use lastIndexOf('/') slice instead of split('/').slice(0, -1).join('/')
			const lastSlash = url.lastIndexOf("/");
			return (
				(lastSlash === -1 ? "" : url.slice(0, lastSlash + 1)) + urlObj.query
			);
		}
	},

	/**
	 * Parse given url into url and query
	 * @param {string} url
	 * @returns {{url:string, query:string}}}
	 */
	parse(url) {
		// Optimize: Use indexOf('?') and slice instead of split(/(?=\?)/)
		const queryIdx = url.indexOf("?");
		if (queryIdx === -1) {
			return { url, query: "" };
		}
		return {
			url: url.slice(0, queryIdx),
			query: url.slice(queryIdx),
		};
	},

	/**
	 * Formate Url object to string
	 * @param {object} urlObj
	 * @param {"ftp:"|"sftp:"|"http:"|"https:"} urlObj.protocol
	 * @param {string|number} urlObj.hostname
	 * @param {string} [urlObj.path]
	 * @param {string} [urlObj.username]
	 * @param {string} [urlObj.password]
	 * @param {string|number} [urlObj.port]
	 * @param {object} [urlObj.query]
	 * @returns {string}
	 */
	formate(urlObj) {
		let { protocol, hostname, username, password, path, port, query } = urlObj;

		const enc = (str) => encodeURIComponent(str);

		if (!protocol || !hostname)
			throw new Error("Cannot formate url. Missing 'protocol' and 'hostname'.");

		let string = `${protocol}//`;

		if (username && password) string += `${enc(username)}:${enc(password)}@`;
		else if (username) string += `${username}@`;

		string += hostname;

		if (port) string += `:${port}`;

		if (path) {
			if (!path.startsWith("/")) path = "/" + path;

			string += path;
		}

		if (query && typeof query === "object") {
			string += "?";

			for (let key in query) string += `${enc(key)}=${enc(query[key])}&`;

			string = string.slice(0, -1);
		}

		return string;
	},
	/**
	 * Returns protocol of a url e.g. 'ftp:' from 'ftp://localhost/foo/bar'
	 * @param {string} url
	 * @returns {"ftp:"|"sftp:"|"http:"|"https:"}
	 */
	getProtocol(url) {
		return (/^([a-z]+:)\/\/\/?/i.exec(url) || [])[1] || "";
	},
	/**
	 *
	 * @param {string} url
	 * @returns {string}
	 */
	hidePassword(url) {
		const { protocol, username, hostname, pathname } = URLParse(url);
		if (protocol === "file:") {
			return url;
		} else {
			return `${protocol}//${username}@${hostname}${pathname}`;
		}
	},
	/**
	 * Decodes url and returns username, password, hostname, pathname, port and query
	 * @param {string} url
	 * @returns {URLObject}
	 */
	decodeUrl(url) {
		const uuid = "uuid" + Math.floor(Math.random() + Date.now() * 1000000);

		if (/#/.test(url)) {
			url = url.replace(/#/g, uuid);
		}

		let { username, password, hostname, pathname, port, query } = URLParse(
			url,
			true,
		);

		if (pathname) {
			pathname = decodeURIComponent(pathname);
			pathname = pathname.replace(new RegExp(uuid, "g"), "#");
		}

		if (username) {
			username = decodeURIComponent(username);
		}

		if (password) {
			password = decodeURIComponent(password);
		}

		if (port) {
			port = Number.parseInt(port);
		}

		let { keyFile, passPhrase } = query;

		if (keyFile) {
			query.keyFile = decodeURIComponent(keyFile);
		}

		if (passPhrase) {
			query.passPhrase = decodeURIComponent(passPhrase);
		}

		return { username, password, hostname, pathname, port, query };
	},
	/**
	 * Removes trailing slash from url
	 * @param {string} url
	 * @returns
	 */
	trimSlash(url) {
		const parsed = this.parse(url);
		if (parsed.url.endsWith("/")) {
			parsed.url = parsed.url.slice(0, -1);
		}
		return this.join(parsed.url, parsed.query);
	},
	PROTOCOL_PATTERN: /^[a-z]+:\/\/\/?/i,
};
