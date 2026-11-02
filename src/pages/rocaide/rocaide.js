/**
 * RocAide Page — konsol RocAI Agent (Dashboard + Terminal)
 *
 * Dua tab, dua target loopback yang di-host Termux/monet:
 * - Dashboard: gateway agent :9119 (uvicorn, tanpa X-Frame-Options).
 * - Terminal : ttyd :7681 path rahasia /r0cterm — terminal monet
 *   (bash --login) yang sama dengan lingkungan agent, dieksekusi
 *   penuh (baca-tulis) dari dalam app.
 * Loopback 127.0.0.1 terbagi lintas app di satu device sehingga
 * iframe di sini dapat menjangkau keduanya. Halaman ini murni
 * probe + tampilan: status dicek langsung lewat fetch (bukan
 * Runtime.exec), iframe hanya diarahkan saat targetnya hidup.
 */

import "./rocaide.scss";

import Page from "components/page";
import toast from "components/toast";
import actionStack from "lib/actionStack";
import { hideAd } from "lib/startAd";
import helpers from "utils/helpers";

const AGENT_URL = "http://127.0.0.1:9119";
const TERMINAL_URL = "http://127.0.0.1:7681/r0cterm/";
const STATUS_POLL_MS = 5000;

const TABS = {
	dashboard: AGENT_URL,
	terminal: TERMINAL_URL,
};

export default function openRocAide() {
	const $page = Page("RocAide");
	$page.classList.add("rocaide-page");

	let statusDot = <span className="rocaide-status-dot rocaide-status--off" />;
	let statusLabel = (
		<span className="rocaide-status-label">{strings.rocaide_stopped}</span>
	);

	// Dua iframe dipertahankan di DOM (sesi terminal tidak hilang saat
	// berpindah tab); yang tidak aktif disembunyikan lewat display.
	let $iframeDashboard = (
		<iframe className="rocaide-iframe" src="about:blank" />
	);
	let $iframeTerminal = (
		<iframe className="rocaide-iframe rocaide-iframe--terminal" src="about:blank" />
	);

	const $statusBar = (
		<div className="rocaide-status-bar">
			{statusDot}
			{statusLabel}
		</div>
	);

	let $tabDashboard = (
		<button
			className="rocaide-tab rocaide-tab--active"
			onclick={() => switchTab("dashboard")}
		>
			{strings.rocaide_tab_dashboard}
		</button>
	);
	let $tabTerminal = (
		<button
			className="rocaide-tab"
			onclick={() => switchTab("terminal")}
		>
			{strings.rocaide_tab_terminal}
		</button>
	);

	const $tabs = (
		<div className="rocaide-tabs">
			{$tabDashboard}
			{$tabTerminal}
		</div>
	);

	const $toolbar = (
		<div className="rocaide-toolbar">
			<button
				className="rocaide-btn rocaide-btn--open"
				onclick={() => {
					system.openInBrowser(TABS[activeTab]);
				}}
			>
				{strings.rocaide_open_in_browser}
			</button>
			<button
				className="rocaide-btn rocaide-btn--refresh"
				onclick={() => {
					refreshStatus(true);
				}}
			>
				{strings.rocaide_refresh}
			</button>
		</div>
	);

	const $container = (
		<div className="rocaide-container">
			<div className="rocaide-header">
				<h2 className="rocaide-title">RocAI Agent</h2>
				<p className="rocaide-subtitle">
					Dashboard agent :9119 · terminal monet :7681
				</p>
			</div>
			{$statusBar}
			{$tabs}
			{$toolbar}
			<div className="rocaide-frame-wrapper">
				{$iframeDashboard}
				{$iframeTerminal}
			</div>
		</div>
	);

	$page.body = $container;

	// ── State ────────────────────────────────────────────────────────────

	let activeTab = "dashboard";
	const up = { dashboard: false, terminal: false };
	const visited = { dashboard: true, terminal: false };
	const loaded = { dashboard: false, terminal: false };

	function frameFor(name) {
		return name === "dashboard" ? $iframeDashboard : $iframeTerminal;
	}

	function applyFrame(name) {
		const $frame = frameFor(name);
		const shouldLoad = up[name] && visited[name];
		if (shouldLoad && !loaded[name]) {
			$frame.src = TABS[name];
			loaded[name] = true;
		} else if (!shouldLoad && loaded[name]) {
			$frame.src = "about:blank";
			loaded[name] = false;
		}
	}

	function renderStatus() {
		const isUp = up[activeTab];
		statusDot.className =
			"rocaide-status-dot " +
			(isUp ? "rocaide-status--on" : "rocaide-status--off");
		statusLabel.textContent = isUp
			? strings.rocaide_running
			: strings.rocaide_stopped;
	}

	function switchTab(name) {
		activeTab = name;
		visited[name] = true;
		$tabDashboard.classList.toggle(
			"rocaide-tab--active",
			name === "dashboard",
		);
		$tabTerminal.classList.toggle(
			"rocaide-tab--active",
			name === "terminal",
		);
		$iframeDashboard.style.display = name === "dashboard" ? "block" : "none";
		$iframeTerminal.style.display = name === "terminal" ? "block" : "none";
		applyFrame(name);
		renderStatus();
	}

	// Awal: tab dashboard aktif, terminal tersembunyi.
	$iframeTerminal.style.display = "none";

	/**
	 * Probe kedua target langsung. no-cors membuat respons di-opaque,
	 * tapi resolve/reject tetap mencerminkan konektivitas TCP+HTTP —
	 * cukup untuk indikator hidup/mati tanpa menyinggung auth.
	 */
	async function refreshStatus(manual = false) {
		try {
			await fetch(AGENT_URL, { mode: "no-cors" });
			up.dashboard = true;
		} catch {
			up.dashboard = false;
		}
		try {
			await fetch(TERMINAL_URL, { mode: "no-cors" });
			up.terminal = true;
		} catch {
			up.terminal = false;
		}
		applyFrame("dashboard");
		applyFrame("terminal");
		renderStatus();
		if (manual && !up[activeTab]) {
			toast(
				activeTab === "terminal"
					? strings.rocaide_term_unreachable
					: strings.rocaide_unreachable,
				"warning",
			);
		}
	}

	const pollTimer = setInterval(() => refreshStatus(), STATUS_POLL_MS);

	// ── Wire up events ───────────────────────────────────────────────────

	$page.onhide = function () {
		actionStack.remove("rocaide");
		clearInterval(pollTimer);
		hideAd();
	};

	actionStack.push({
		id: "rocaide",
		action: $page.hide,
	});

	// ── Initial status check ─────────────────────────────────────────────

	refreshStatus();

	app.append($page);
	helpers.showAd();
}
