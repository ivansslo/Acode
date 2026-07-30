import { getModeForPath, getModes } from "../cm/modelist";
import "../cm/supportedModes";

console.log("Registered modes count:", getModes().length);

// 1. Correctness Verification
const testCases = [
	{ path: "index.html", expected: "html" },
	{ path: "main.js", expected: "javascript" },
	{ path: "styles.css", expected: "css" },
	{ path: "Dockerfile", expected: "dockerfile" },
	{ path: "README.md", expected: "markdown" },
	{ path: "main.py", expected: "python" },
	{ path: "package.json", expected: "json" },
	{ path: "App.tsx", expected: "tsx" },
	{ path: "unknown_file_type.xyz_abc", expected: "text" },
];

console.log("\n--- Verifying Correctness ---");
let allPassed = true;
for (const tc of testCases) {
	const mode = getModeForPath(tc.path);
	const passed = mode.name.toLowerCase() === tc.expected.toLowerCase();
	console.log(
		`Path: ${tc.path.padEnd(30)} | Got: ${mode.name.padEnd(15)} | Expected: ${tc.expected.padEnd(15)} | ${passed ? "PASS" : "FAIL"}`,
	);
	if (!passed) allPassed = false;
}

if (!allPassed) {
	console.error("Correctness check failed!");
	process.exit(1);
}
console.log("All correctness checks passed!");

// 2. Performance Benchmarking
console.log("\n--- Running Performance Benchmark ---");
const testPaths = [
	"index.html",
	"main.js",
	"styles.css",
	"Dockerfile",
	"README.md",
	"main.py",
	"package.json",
	"App.tsx",
	"unknown.xyz",
	"src/components/button.jsx",
	"src/styles/theme.scss",
	"config.yaml",
	"src/lib/utils.ts",
	"package-lock.json",
];

// Warm up
for (let i = 0; i < 1000; i++) {
	for (const p of testPaths) {
		getModeForPath(p);
	}
}

// Measure performance
const iterations = 50000;
const start = performance.now();
for (let i = 0; i < iterations; i++) {
	for (const p of testPaths) {
		getModeForPath(p);
	}
}
const end = performance.now();
const duration = end - start;
const opsPerSec = Math.round(
	(iterations * testPaths.length) / (duration / 1000),
);

console.log(
	`Duration for ${iterations * testPaths.length} lookups: ${duration.toFixed(2)}ms`,
);
console.log(`Throughput: ${opsPerSec.toLocaleString()} operations/sec`);
