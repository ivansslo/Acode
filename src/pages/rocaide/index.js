/**
 * RocAide Page — Codex CLI Web UI integration for Acode
 *
 * Lazy-loads the full page module to keep initial bundle size small.
 */
export default function openRocAide() {
	import(/* webpackChunkName: "rocaide" */ "./rocaide").then((mod) => {
		mod.default();
	});
}
