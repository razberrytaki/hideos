// ==UserScript==
// @name         Enhanced Research Tool
// @namespace    http://tampermonkey.net/
// @version      1.2
// @description  Anti-detect of Operation System from certain site.
// @author       razberrytaki
// @match        https://CHANGE_ME_HERE/*
// @grant        none
// @run-at       document-start
// ==/UserScript==

(function() {
	'use strict';
	const OS_CONFIGS = Object.freeze({
			WINDOWS: Object.freeze({
					platform: 'Win32',
					userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
					vendor: 'Google Inc.',
					language: 'en-US',
					hardwareConcurrency: 8,
					deviceMemory: 8
			}),
			MACOS: Object.freeze({
					platform: 'MacIntel',
					userAgent: 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
					vendor: 'Google Inc.',
					language: 'en-US',
					hardwareConcurrency: 8,
					deviceMemory: 8
			}),
			LINUX: Object.freeze({
					platform: 'Linux x86_64',
					userAgent: 'Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
					vendor: 'Google Inc.',
					language: 'en-US',
					hardwareConcurrency: 8,
					deviceMemory: 8
			})
	});

	// navigator
	const modifyNavigator = () => {
			const selectedOS = localStorage.getItem('selectedOS') || 'MACOS'; // change here if you want another os.
			const SPOOF_CONFIG = OS_CONFIGS[selectedOS];

			const spoofedNavigator = new Proxy(navigator, {
					get: (target, prop) => SPOOF_CONFIG[prop] ?? target[prop]
			});
			try {
					Object.defineProperty(window, 'navigator', {
							value: spoofedNavigator,
							configurable: false,
							writable: false,
							enumerable: true
					});
			} catch (e) {
					console.warn('Navigator modification failed:', e);
			}
	};

	//XMLHttpRequest
	class EnhancedXHR extends XMLHttpRequest {
			constructor() {
					super();
					this.addEventListener('load', this._handleResponse.bind(this));
			}

			_handleResponse() {
					if (!this.responseURL?.match(/\/service\/v3\/channels\/[a-z0-9]+\/live-detail/)) return;

					try {
							const response = JSON.parse(this.response);
							if (response.content) {
									response.content.p2pQuality = [];
									Object.defineProperty(this, 'response', {
											get: () => JSON.stringify(response)
									});
							}
					} catch (e) {
							console.warn('P2P bypass error:', e);
					}
			}
	}

	const additionalProtections = () => {
			// Canvas fingerprint
			const protectCanvas = () => {
					const getContext = HTMLCanvasElement.prototype.getContext;
					HTMLCanvasElement.prototype.getContext = function(type, attributes) {
							const context = getContext.call(this, type, attributes);
							if (context && type === '2d') {
									const getImageData = context.getImageData;
									context.getImageData = function() {
											const imageData = getImageData.apply(this, arguments);
											// add some noise
											for (let i = 0; i < imageData.data.length; i += 4) {
													imageData.data[i] += Math.random() * 2 - 1;
											}
											return imageData;
									};
							}
							return context;
					};
			};

			// WebGL
			const protectWebGL = () => {
					const getParameter = WebGLRenderingContext.prototype.getParameter;
					WebGLRenderingContext.prototype.getParameter = function(parameter) {
							// RENDERER and VENDOR
							if (parameter === 37445 || parameter === 37446) {
									return 'Intel Inc.';
							}
							return getParameter.call(this, parameter);
					};
			};

			// Audio
			const protectAudioContext = () => {
					const createAnalyser = AudioContext.prototype.createAnalyser;
					AudioContext.prototype.createAnalyser = function() {
							const analyser = createAnalyser.call(this);
							const getFloatFrequencyData = analyser.getFloatFrequencyData;
							analyser.getFloatFrequencyData = function(array) {
									getFloatFrequencyData.call(this, array);
									for (let i = 0; i < array.length; i++) {
											array[i] += Math.random() * 0.1;
									}
							};
							return analyser;
					};
			};

			// Battery API
			if (navigator.getBattery) {
					delete navigator.getBattery;
			}

			// WebRTC
			const protectWebRTC = () => {
					const rtcPeerConnection = window.RTCPeerConnection;
					window.RTCPeerConnection = function(...args) {
							const pc = new rtcPeerConnection(...args);
							pc.createOffer = async function(options) {
									const offer = await rtcPeerConnection.prototype.createOffer.call(this, options);
									offer.sdp = offer.sdp.replace(/IP4 \d+\.\d+\.\d+\.\d+/g, 'IP4 0.0.0.0');
									return offer;
							};
							return pc;
					};
			};

			// Performance API
			const protectPerformance = () => {
					const originalGetEntries = Performance.prototype.getEntries;
					Performance.prototype.getEntries = function() {
							const entries = originalGetEntries.call(this);
							return entries.filter(entry => !entry.name.includes('moc.revan.kzzhc'.split('').reverse().join('')));
					};
			};

			protectCanvas();
			protectWebGL();
			protectAudioContext();
			protectWebRTC();
			protectPerformance();
	};

	// init
	try {
			modifyNavigator();
			additionalProtections();
			window.XMLHttpRequest = EnhancedXHR;
	} catch (e) {
			console.error('Failed to init', e)
	}
})();