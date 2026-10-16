/**
 * RocAide Page
 *
 * Provides an in-app interface for the Codex CLI web UI (codexapp).
 * Users can start/stop the server and interact with the UI via an iframe.
 */

import "./rocaide.scss";

import Page from "components/page";
import toast from "components/toast";
import actionStack from "lib/actionStack";
import { hideAd } from "lib/startAd";
import helpers from "utils/helpers";

const SERVER_URL = "http://127.0.0.1:18923";

export default function openRocAide() {
	const $page = Page("RocAide");
	$page.classList.add("rocaide-page");

	let statusDot = <span className="rocaide-status-dot rocaide-status--off" />;
	let statusLabel = (
		<span className="rocaide-status-label">{strings.rocaide_stopped}</span>
	);
	let actionBtn = (
		<button className="rocaide-btn rocaide-btn--start">
			{strings.rocaide_start}
		</button>
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
			{actionBtn}
			<button
				className="rocaide-btn rocaide-btn--open"
				disabled={true}
				onclick={() => {
					system.openInBrowser(SERVER_URL);
				}}
			>
				{strings.rocaide_open_in_browser}
			</button>
		</div>
	);

	const $container = (
		<div className="rocaide-container">
			<div className="rocaide-header">
				<h2 className="rocaide-title">RocAide — Codex UI</h2>
				<p className="rocaide-subtitle">Codex CLI web interface for Android</p>
			</div>
			{$statusBar}
			{$toolbar}
			<div className="rocaide-frame-wrapper">{$iframe}</div>
		</div>
	);

	$page.body = $container;

	// ── State ────────────────────────────────────────────────────────────

	let serverRunning = false;

	function setStatus(running) {
		serverRunning = running;
		statusDot.className =
			"rocaide-status-dot " +
			(running ? "rocaide-status--on" : "rocaide-status--off");
		statusLabel.textContent = running
			? strings.rocaide_running
			: strings.rocaide_stopped;
		actionBtn.textContent = running
			? strings.rocaide_stop
			: strings.rocaide_start;
		actionBtn.className =
			"rocaide-btn " + (running ? "rocaide-btn--stop" : "rocaide-btn--start");
		$page.querySelector(".rocaide-btn--open").disabled = !running;
		if (running) {
			$iframe.src = SERVER_URL;
		} else {
			$iframe.src = "about:blank";
		}
	}

	async function refreshStatus() {
		try {
			if (window.RocAide) {
				const res = await window.RocAide.isRunning();
				setStatus(res.running);
			}
		} catch {
			setStatus(false);
		}
	}

	async function toggleServer() {
		if (serverRunning) {
			try {
				if (window.RocAide) {
					await window.RocAide.stopServer();
				}
				setStatus(false);
				toast(strings.rocaide_server_stopped);
			} catch (e) {
				toast(
					strings.rocaide_failed_stop.replace("{error}", e.message),
					"error",
				);
			}
		} else {
			try {
				if (window.RocAide) {
					// First check node
					const nodeInfo = await window.RocAide.checkNode();
					if (!nodeInfo.available) {
						toast(strings.rocaide_node_missing, "warning");
						return;
					}
					await window.RocAide.startServer(18923);
				}
				setStatus(true);
				toast(strings.rocaide_server_started.replace("{url}", SERVER_URL));
			} catch (e) {
				toast(
					strings.rocaide_failed_start.replace("{error}", e.message),
					"error",
				);
				setStatus(false);
			}
		}
	}

	// ── Wire up events ───────────────────────────────────────────────────

	actionBtn.onclick = toggleServer;

	actionStack.push({
		id: "rocaide",
		action: $page.hide,
	});

	$page.onhide = function () {
		actionStack.remove("rocaide");
		hideAd();
	};

	// ── Initial status check ─────────────────────────────────────────────

	refreshStatus();

	app.append($page);
	helpers.showAd();
}
