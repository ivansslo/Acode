/**
 * RocAide Page — konsol RocAI Agent
 *
 * Membuka dashboard agent RocAI (gateway lokal :9119) langsung di
 * dalam app. Server agent dijalankan di Termux; loopback 127.0.0.1
 * terbagi lintas app di satu device sehingga iframe di sini dapat
 * menjangkaunya. Halaman ini murni probe + tampilan: status gateway
 * dicek langsung lewat fetch (bukan Runtime.exec), iframe hanya
 * diarahkan saat gateway hidup.
 */

import "./rocaide.scss";

import Page from "components/page";
import toast from "components/toast";
import actionStack from "lib/actionStack";
import { hideAd } from "lib/startAd";
import helpers from "utils/helpers";

const AGENT_URL = "http://127.0.0.1:9119";
const STATUS_POLL_MS = 5000;

export default function openRocAide() {
	const $page = Page("RocAide");
	$page.classList.add("rocaide-page");

	let statusDot = <span className="rocaide-status-dot rocaide-status--off" />;
	let statusLabel = (
		<span className="rocaide-status-label">{strings.rocaide_stopped}</span>
	);
	let $iframe = <iframe className="rocaide-iframe" src="about:blank" />;

	const $statusBar = (
		<div className="rocaide-status-bar">
			{statusDot}
			{statusLabel}
		</div>
	);

	const $toolbar = (
		<div className="rocaide-toolbar">
			<button
				className="rocaide-btn rocaide-btn--open"
				onclick={() => {
					system.openInBrowser(AGENT_URL);
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
					Dashboard agent — gateway lokal :9119
				</p>
			</div>
			{$statusBar}
			{$toolbar}
			<div className="rocaide-frame-wrapper">{$iframe}</div>
		</div>
	);

	$page.body = $container;

	// ── State ────────────────────────────────────────────────────────────

	let gatewayUp = false;

	function setStatus(up) {
		gatewayUp = up;
		statusDot.className =
			"rocaide-status-dot " +
			(up ? "rocaide-status--on" : "rocaide-status--off");
		statusLabel.textContent = up
			? strings.rocaide_running
			: strings.rocaide_stopped;
		$iframe.src = up ? AGENT_URL : "about:blank";
	}

	/**
	 * Probe gateway agent langsung. no-cors membuat respons di-opaque,
	 * tapi resolve/reject tetap mencerminkan konektivitas TCP+HTTP ke
	 * :9119 — cukup untuk indikator hidup/mati tanpa menyinggung auth.
	 */
	async function refreshStatus(manual = false) {
		try {
			await fetch(AGENT_URL, { mode: "no-cors" });
			setStatus(true);
		} catch {
			setStatus(false);
			if (manual) toast(strings.rocaide_unreachable, "warning");
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
