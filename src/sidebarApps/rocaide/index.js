/**
 * RocAide Sidebar App
 *
 * Quick-access icon in the sidebar that opens the RocAide page.
 */

import openRocAide from "pages/rocaide";

export default [
	"cloud", // icon
	"rocaide", // id
	"RocAide", // title
	initApp, // init function
	false, // prepend
	onSelected, // onSelected
];

function initApp(el) {
	el.classList.add("rocaide-sidebar");
}

function onSelected() {
	openRocAide();
}
