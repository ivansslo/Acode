export const binaryExtensions = [
	"3gp",
	"3g2",
	"3mf",
	"7z",
	"aab",
	"aac",
	"ac3",
	"ace",
	"aif",
	"ai",
	"alias",
	"amr",
	"ape",
	"apk",
	"app",
	"apng",
	"ar",
	"arj",
	"arrow",
	"arw",
	"asar",
	"avi",
	"avif",
	"bin",
	"blend",
	"bmp",
	"bpg",
	"bz2",
	"cab",
	"cfb",
	"chm",
	"class",
	"cpio",
	"cr2",
	"cr3",
	"crx",
	"cur",
	"dat",
	"dcm",
	"db",
	"db3",
	"dds",
	"deb",
	"der",
	"dex",
	"dll",
	"dmg",
	"dng",
	"doc",
	"docm",
	"docx",
	"dotm",
	"dotx",
	"drc",
	"dsf",
	"dwg",
	"dylib",
	"eot",
	"epub",
	"eps",
	"exe",
	"f4a",
	"f4b",
	"f4p",
	"f4v",
	"fbx",
	"flac",
	"flif",
	"flv",
	"gif",
	"glb",
	"gz",
	"heic",
	"heif",
	"icc",
	"icns",
	"ico",
	"img",
	"indd",
	"iso",
	"it",
	"jar",
	"jls",
	"jp2",
	"jpm",
	"jpeg",
	"jpg",
	"jpx",
	"jxr",
	"jks",
	"key",
	"keystore",
	"ktx",
	"lnk",
	"lz",
	"lz4",
	"lzh",
	"m4a",
	"m4b",
	"m4p",
	"m4v",
	"macho",
	"mid",
	"mie",
	"mj2",
	"mkv",
	"mobi",
	"mov",
	"mp1",
	"mp2",
	"mp3",
	"mp4",
	"mpc",
	"mpg",
	"msi",
	"mts",
	"mxf",
	"nef",
	"nes",
	"numbers",
	"o",
	"odp",
	"ods",
	"odt",
	"oga",
	"ogg",
	"ogm",
	"ogv",
	"ogx",
	"orf",
	"otp",
	"ots",
	"ott",
	"otf",
	"p12",
	"pages",
	"parquet",
	"pdf",
	"pfx",
	"pgp",
	"png",
	"potm",
	"potx",
	"ppsx",
	"ppsm",
	"pptm",
	"pptx",
	"ps",
	"psd",
	"pst",
	"pyc",
	"qcp",
	"raf",
	"rar",
	"realm",
	"rm",
	"rpm",
	"rootfs",
	"rw2",
	"s3m",
	"sav",
	"sketch",
	"skp",
	"squashfs",
	"spx",
	"so",
	"sqlite",
	"sqlite3",
	"stl",
	"swf",
	"tar",
	"tar.gz",
	"tga",
	"tgz",
	"tif",
	"tiff",
	"ttc",
	"ttf",
	"voc",
	"vsdx",
	"war",
	"wasm",
	"wav",
	"webm",
	"webp",
	"wmv",
	"woff",
	"woff2",
	"xls",
	"xlsm",
	"xlsx",
	"xltm",
	"xltx",
	"xm",
	"xpi",
	"xz",
	"zip",
	"zst",
];

const binaryExtensionSet = new Set(binaryExtensions);
const textExtensionSet = new Set([
	"astro",
	"c",
	"cc",
	"cfg",
	"conf",
	"cpp",
	"cs",
	"css",
	"csv",
	"cxx",
	"dart",
	"env",
	"go",
	"graphql",
	"h",
	"hpp",
	"htm",
	"html",
	"java",
	"js",
	"json",
	"jsx",
	"kt",
	"kts",
	"less",
	"lua",
	"md",
	"mjs",
	"php",
	"properties",
	"py",
	"rb",
	"rs",
	"sass",
	"scss",
	"sh",
	"sql",
	"svg",
	"swift",
	"toml",
	"ts",
	"tsx",
	"txt",
	"vue",
	"xml",
	"yaml",
	"yml",
]);

const binaryMimePrefixes = ["audio/", "font/", "image/", "model/", "video/"];

const textMimeTypes = new Set([
	"application/javascript",
	"application/json",
	"application/ld+json",
	"application/manifest+json",
	"application/sql",
	"application/toml",
	"application/typescript",
	"application/x-httpd-php",
	"application/x-javascript",
	"application/x-php",
	"application/x-sh",
	"application/x-yaml",
	"application/xhtml+xml",
	"application/xml",
	"image/svg+xml",
]);

const binaryMimeTypes = new Set([
	"application/epub+zip",
	"application/gzip",
	"application/java-archive",
	"application/java-vm",
	"application/msword",
	"application/octet-stream",
	"application/ogg",
	"application/pdf",
	"application/vnd.android.package-archive",
	"application/vnd.apple.keynote",
	"application/vnd.apple.numbers",
	"application/vnd.apple.pages",
	"application/vnd.ms-cab-compressed",
	"application/vnd.ms-excel",
	"application/vnd.ms-fontobject",
	"application/vnd.ms-outlook",
	"application/vnd.ms-powerpoint",
	"application/vnd.ms-visio",
	"application/vnd.oasis.opendocument.graphics",
	"application/vnd.oasis.opendocument.presentation",
	"application/vnd.oasis.opendocument.spreadsheet",
	"application/vnd.oasis.opendocument.text",
	"application/vnd.openxmlformats-officedocument.presentationml.presentation",
	"application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
	"application/vnd.openxmlformats-officedocument.wordprocessingml.document",
	"application/wasm",
	"application/x-7z-compressed",
	"application/x-ace-compressed",
	"application/x-apple-diskimage",
	"application/x-arj",
	"application/x-asar",
	"application/x-bzip2",
	"application/x-cpio",
	"application/x-deb",
	"application/x-dosexec",
	"application/x-elf",
	"application/x-font-ttf",
	"application/x-font-woff",
	"application/x-indesign",
	"application/x-lz4",
	"application/x-mach-binary",
	"application/x-msdownload",
	"application/x-rar-compressed",
	"application/x-rpm",
	"application/x-shockwave-flash",
	"application/x-sqlite3",
	"application/x-tar",
	"application/x-xz",
	"application/zip",
	"application/zstd",
]);

/**
 * Fast allocation-free extraction of filename/basename from path, URI, or URL string.
 * Strips query parameters and hash components while avoiding RegExp overhead and array allocations.
 * @param {string|object} file
 * @returns {string} Lowercase basename
 */
function getBasename(file) {
	if (!file) return "";
	const str = String(file);

	let end = str.length;
	const qIndex = str.indexOf("?");
	if (qIndex !== -1) end = qIndex;
	const hIndex = str.indexOf("#");
	if (hIndex !== -1 && hIndex < end) end = hIndex;

	let lastSlash = -1;
	for (let i = end - 1; i >= 0; i--) {
		const ch = str.charCodeAt(i);
		if (ch === 47 || ch === 92) {
			// '/' (47) or '\' (92)
			lastSlash = i;
			break;
		}
	}

	return str.slice(lastSlash + 1, end).toLowerCase();
}

/**
 * Normalizes MIME type string without array allocation from .split(';')
 * @param {string} mime
 * @returns {string}
 */
function normalizeMime(mime) {
	if (!mime || typeof mime !== "string") return "";
	const semi = mime.indexOf(";");
	const base = semi === -1 ? mime : mime.slice(0, semi);
	return base.trim().toLowerCase();
}

/**
 * Checks if extracted lowercased basename has a text extension.
 * @param {string} basename
 * @returns {boolean}
 */
function checkTextBasename(basename) {
	if (!basename) return false;
	const lastDot = basename.lastIndexOf(".");
	if (lastDot === -1) return false;
	return textExtensionSet.has(basename.slice(lastDot + 1));
}

/**
 * Checks if extracted lowercased basename has a binary extension.
 * @param {string} basename
 * @returns {boolean}
 */
function checkBinaryBasename(basename) {
	if (!basename) return false;
	const lastDot = basename.lastIndexOf(".");
	if (lastDot === -1) return false;

	const singleExtension = basename.slice(lastDot + 1);
	if (binaryExtensionSet.has(singleExtension)) return true;

	const previousDot = basename.lastIndexOf(".", lastDot - 1);
	if (previousDot === -1) return false;

	const compoundExtension = basename.slice(previousDot + 1);
	return binaryExtensionSet.has(compoundExtension);
}

/**
 * Determines whether a file path or object represents a binary file.
 * Preserves exact original evaluation hierarchy (Text MIME -> Text Path -> Binary MIME -> Binary Path).
 * @param {string|object} file
 * @returns {boolean}
 */
export function isBinaryFile(file) {
	if (typeof file === "string") return isBinaryPath(file);
	if (!file) return false;

	const mime = normalizeMime(file.mime || file.type);
	if (mime && (textMimeTypes.has(mime) || mime.startsWith("text/"))) {
		return false;
	}

	const basename = getBasename(file.url || file.path || file.name);
	if (checkTextBasename(basename)) return false;

	if (
		mime &&
		(binaryMimeTypes.has(mime) ||
			binaryMimePrefixes.some((prefix) => mime.startsWith(prefix)))
	) {
		return true;
	}

	return checkBinaryBasename(basename);
}

/**
 * Checks if file path has a text extension.
 * @param {string|object} file
 * @returns {boolean}
 */
export function isTextPath(file) {
	return checkTextBasename(getBasename(file));
}

/**
 * Checks if file path has a binary extension.
 * @param {string|object} file
 * @returns {boolean}
 */
export function isBinaryPath(file) {
	return checkBinaryBasename(getBasename(file));
}

/**
 * Checks if MIME type indicates a binary format.
 * @param {string} mime
 * @returns {boolean}
 */
export function isBinaryMime(mime) {
	const normalized = normalizeMime(mime);
	if (!normalized || isTextMime(normalized)) return false;
	if (binaryMimeTypes.has(normalized)) return true;

	return binaryMimePrefixes.some((prefix) => normalized.startsWith(prefix));
}

function isTextMime(mime) {
	const normalized = normalizeMime(mime);
	if (!normalized) return false;
	if (textMimeTypes.has(normalized)) return true;

	return normalized.startsWith("text/");
}
