import path from "./Path";

function parseStorageList() {
	try {
		const storageList = JSON.parse(localStorage.storageList || "[]");
		return Array.isArray(storageList) ? storageList : [];
	} catch (_) {
		return [];
	}
}

export default {
	/**
	 * Parse content uri to rootUri and docID
	 *
	 * eg.
	 *```js
	 * parse("content://.../AA98-181D%3A::.../index.html")
	 *```
	 * `returns` {rootUri: "content://.../AA98-181D%3A", docId: "...index.html"}
	 *
	 * @param {string} contentUri
	 * @returns {{rootUri: string, docId: string, isFileUri: boolean}}
	 */
	parse(contentUri) {
		let rootUri,
			docId = "";

		const DOC_PROVIDER =
			/^content:\/\/com\.((?![:<>"\/\\\|\?\*]).)*\.documents\//;
		const TREE_URI =
			/^content:\/\/com\.((?![:<>"\/\\\|\?\*]).)*\.documents\/tree\//;
		const SINGLE_URI =
			/^content:\/\/com\.(((?![:<>"\/\\\|\?\*]).)*)\.documents\/document/;

		if (DOC_PROVIDER.test(contentUri)) {
			if (TREE_URI.test(contentUri)) {
				if (/::/.test(contentUri)) {
					[rootUri, docId] = contentUri.split("::");
				} else {
					rootUri = contentUri;
					docId = decodeURIComponent(contentUri.split("/").slice(-1)[0]);
				}
			} else if (SINGLE_URI.test(contentUri)) {
				const [provider, providerId] = SINGLE_URI.exec(contentUri);
				docId = decodeURIComponent(contentUri); //DecodeUri
				docId = docId.replace(provider, ""); //replace single to tree
				docId = path.normalize(docId); //normalize docid

				if (docId.startsWith("/")) docId = docId.slice(1); // remove leading '/'

				rootUri =
					`content://com.${providerId}.documents/tree/` +
					docId.split(":")[0] +
					"%3A";
			}

			return {
				rootUri,
				docId,
				isFileUri: /^file:\/\/\//.test(rootUri),
			};
		} else {
			throw new Error("Invalid uri format.");
		}
	},
	/**
	 * Formats the five contentUri object to string
	 * @param {{rootUri: string, docId: string} | String} contentUriObject or rootId
	 * @param {string} [docId]
	 * @returns {string}
	 */
	format(contentUriObject, docId) {
		let rootUri;

		if (typeof contentUriObject === "string") {
			rootUri = contentUriObject;
		} else {
			rootUri = contentUriObject.rootUri;
			docId = contentUriObject.docId;
		}

		if (docId) return [rootUri, docId].join("::");
		else return rootUri;
	},
	/**
	 * Gets virtual address by replacing root with name i.e. added in file explorer
	 * @param {string} url
	 */
	getVirtualAddress(url) {
		try {
			const storageList = parseStorageList();

			let bestMatch = null;
			let maxCharMatched = 0;

			for (const storage of storageList) {
				const storageUri = storage.uri ?? storage.url;
				if (storageUri && url.startsWith(storageUri)) {
					const charMatched = storageUri.length;
					if (charMatched > maxCharMatched) {
						maxCharMatched = charMatched;
						bestMatch = { storage, storageUri };
					}
				}
			}

			if (bestMatch) {
				const { storage, storageUri } = bestMatch;
				const { name } = storage;
				const [base, paths] = url.split("::");
				url = base + "/" + paths.split("/").slice(1).join("/");
				if (url.startsWith(storageUri)) {
					url = name + url.slice(storageUri.length);
				}
				return url.replace(/\/+/g, "/");
			}

			return url;
		} catch (e) {
			return url;
		}
	},
	/**
	 * Gets primary address of a content url.
	 * @param {string} url
	 * @returns {string}
	 */
	getPrimaryAddress(url) {
		const [, primary] = url.split("::primary:");
		return primary;
	},
};
