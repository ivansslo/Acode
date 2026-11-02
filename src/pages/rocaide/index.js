/**
 * RocAide Page — konsol RocAI Agent (gateway :9119)
 *
 * Lazy-loads the full page module to keep initial bundle size small.
 */
export default function openRocAide() {
	import(/* webpackChunkName: "rocaide" */ "./rocaide").then((mod) => {
		mod.default();
	});
}
