/* eslint-disable max-len */
// ==UserScript==
// @name         en621
// @namespace    Lilith
// @version      3.5.0
// @description  en(hanced)621 - minor-but-useful enhancements to e621
// @author       PrincessRTFM
// @match        *://e621.net/*
// @updateURL    https://gh.princessrtfm.com/js/monkey/en621.user.js
// @grant        GM_info
// @grant        GM_getValue
// @grant        GM_setValue
// @grant        GM_addValueChangeListener
// @grant        GM_addStyle
// @grant        GM_xmlhttpRequest
// @grant        GM_download
// @grant        GM_setClipboard
// @grant        unsafeWindow
// ==/UserScript==

/* CHANGELOG
v3.5.0 - implemented proper system for status/control tabs like the direct link toggle, exposed via API
v3.4.0 - removed pool reader auto-init on page load
v3.3.0 - pool reader progress is more visible
v3.2.1 - not every page has an `#image-container` element, whoopsy
v3.2.0 - scrolling to related posts now aligns it with the bottom of the screen, not the top
v3.1.0 - minor fixes, minor improvements, notices are now shown for parent/child posts and pools
v3.0.0 - now includes a `SCRIPT_API` and some events that can be listened for (and also reversed the changelog)

v2.10.2 - fix CSS `width: fit-content` rules to add `width: -moz-fit-content` as well
v2.10.1 - updated selector to fix the search bar not linking on post pages
v2.10.0 - added `window.EN621_CONSOLE_TOOLS` for functions designed to be called from the dev console
v2.9.0 - removed automatic pool reader mode link editing to reduce network load
v2.8.0 - added status tags to HTML `class` attribute of `body` tag to allow other scripts to check for features
v2.7.2 - fixed z-index override on search bar items so they aren't hidden under the anim/webm tags on post previews
v2.7.1 - added css transition delays to the search bar expansions (forgot last time) and fixed the missing changelog entry
v2.7.0 - set css transition delays on the direct links toggle minitab
v2.6.1 - increase the z-index of the search bar to ENSURE it's on top so it doesn't look weird
v2.6.0 - the search box collapses whitespace before searching
v2.5.2 - fix NPE breaking search tag elevation
v2.5.1 - pool reader mode no longer shits itself when a post doesn't exist or is a video
v2.5.0 - restore the +/- (include/exclude) links on post pages without an existing search
v2.4.2 - fixed element ID being set instead of element class
v2.4.1 - fixed direct link toggle on post index pages not properly restoring post page URL when turned off
v2.4.0 - direct link box is more out of the way, slides in smoothly when hovered
v2.3.0 - made search box responsibly expand when hovered or focused
v2.2.0 - extended tag elevation and direct image link toggling to post index pages, added alt-q keybind to focus search bar
v2.1.1 - fixed a bug where the post rating wouldn't be listed in the sidebar when there was no existing search
v2.1.0 - added direct image link toggle on pool pages (reader and normal)
v2.0.0 - changed script name and description, along with new update URL (technically possible to run alongside the old version, but they are NOT compatible - DO NOT INSTALL BOTH)

v1.6.2 - changed script update URL so that users will update to this version and then be redirected to update to the new location
v1.6.1 - searching for tags in the post page tag list is no longer confused by underscores
v1.6.0 - move searched-for tags on post pages to the top of their tag groups and italicise them
v1.5.0 - make the "current search" text on post pages into a link to that search
v1.4.0 - add pool reader progress to tab title
v1.3.2 - clean up some element-contructor code
v1.3.1 - fixed a missing property access on sanity checking, removed an unnecessary Promise.resolve(), reordered the pool reader sequence
v1.3.0 - added a tag entry for the post rating
v1.2.0 - added an indicator for parent/child posts on post pages
v1.1.0 - added keybind features; currently only alt-r for random but more can be easily added
v1.0.0 - initial script, minimal functionality, mostly ripped apart from three old scripts broken in the site update
*/

/* PLANS
- Set up an inter-tab queue for pool reader mode?
- Saved tags feature from the old (pre-site-update) version
*/
/* eslint-enable max-len */


const START_TIME_MS = new Date().valueOf();

const SCRIPT_NAME = GM_info.script.name;
const SCRIPT_VERSION = `V${GM_info.script.version || '???'}`;
const SCRIPT_TITLE = `${SCRIPT_NAME} ${SCRIPT_VERSION}`;

const NOP = () => {}; // eslint-disable-line no-empty-function

const debug = console.debug.bind(console, `[${SCRIPT_TITLE}]`);
const log = console.log.bind(console, `[${SCRIPT_TITLE}]`);
const info = console.info.bind(console, `[${SCRIPT_TITLE}]`);
const warn = console.warn.bind(console, `[${SCRIPT_TITLE}]`);
const error = console.error.bind(console, `[${SCRIPT_TITLE}]`);

const KB_NONE = 0;
const KB_ALT = 1;
const KB_CTRL = 2;
const KB_SHIFT = 4;

const CONSOLE_TOOLS = Object.create(null);
CONSOLE_TOOLS.SCRIPT_VERSION = Object.freeze(GM_info.script.version.split(".").map(i => parseInt(i, 10)));


const pause = delay => new Promise(resolve => setTimeout(resolve.bind(resolve, delay), delay));
const request = (uri, ctx) => {
	const url = new URL(String(uri));
	url.searchParams.append('_client', encodeURIComponent(`${SCRIPT_TITLE} by lsong@princessrtfm.com`));
	return new Promise((resolve, reject) => GM_xmlhttpRequest({
		method: "GET",
		url: url.toString(),
		responseType: 'json',
		onerror: reject,
		onload: resolve,
		ontimeout: reject,
		context: ctx || Object.create(null),
	}));
};

const sendEvent = async (name, extra, cancelable) => {
	const clean = String(name)
		.replace(/\s+/gu, '-')
		.replace(/^en621-?/ui, '')
		.toLowerCase();
	const detail = {
		name: clean,
	};
	if (typeof extra != 'undefined') {
		detail.data = extra;
	}
	if (typeof cancelable == 'undefined') {
		cancelable = false;
	}
	Object.freeze(detail);
	const evt = new CustomEvent(`en621`, {
		detail,
		cancelable,
	});
	document.dispatchEvent(evt);
	return evt;
};
const EV_POOL_READER_STATE = "pool-reader-state";
const EV_MESSAGE_BOX = "user-message";
const EV_MESSAGE_CLOSE = "close-message";
const EV_DIRECT_LINKS = "direct-link-mode";
const EV_POST_DELETED = "missing-post";
const EV_POST_LOADED = "post-loaded";
const EV_SCRIPT_LOADED = "loaded";
// Register a debugging listener for all events
document.addEventListener('en621', evt => {
	const type = `${evt.cancelable ? '' : 'non-'}cancelable`;
	const {
		name,
		data,
	} = evt.detail;
	const leader = `Event (${type}) - ${name}`;
	if (typeof data == 'undefined') {
		debug(leader);
	}
	else {
		debug(`${leader}:`, data);
	}
});

const setFlag = flagstr => {
	const flags = flagstr.replace(/\s+/gu, ' ').split(" ");
	flags.forEach(flag => {
		const clean = flag
			.replace(/\s+/gu, '-')
			.replace(/^en621-?/ui, '')
			.toLowerCase();
		document.body.classList.add(`en621-${clean}`);
	});
};
const unsetFlag = flagstr => {
	const flags = flagstr.replace(/\s+/gu, ' ').split(" ");
	flags.forEach(flag => {
		const clean = flag
			.replace(/\s+/gu, '-')
			.replace(/^en621-?/ui, '')
			.toLowerCase();
		document.body.classList.remove(`en621-${clean}`);
	});
};
const toggleFlag = flagstr => {
	const flags = flagstr.replace(/\s+/gu, ' ').split(" ");
	flags.forEach(flag => {
		const clean = flag
			.replace(/\s+/gu, '-')
			.replace(/^en621-?/ui, '')
			.toLowerCase();
		document.body.classList.toggle(`en621-${clean}`);
	});
};
const hasFlag = flags => {
	const flagList = flags.replace(/\s+/gu, ' ').split(" ");
	for (const flag of flagList) {
		const clean = flag
			.replace(/\s+/gu, '-')
			.replace(/^en621-?/ui, '')
			.toLowerCase();
		if (!document.body.classList.contains(`en621-${clean}`)) {
			return false;
		}
	}
	return true;
};

const makeElem = (tag, id, clazz) => {
	const elem = document.createElement(tag);
	if (id) {
		elem.id = id;
	}
	if (clazz) {
		elem.className = clazz; // eslint-disable-line unicorn/no-keyword-prefix
	}
	return elem;
};
const warningBox = () => {
	const ID = 'enhanced621-message-box';
	let box = document.querySelector(`#${ID}`);
	if (box) {
		return box;
	}
	box = makeElem('div', ID, 'status-notice');
	box.style.display = 'none';
	/* eslint-disable sonarjs/no-duplicate-string */
	GM_addStyle([
		`#${ID} {`,
		'position: fixed;',
		'right: 0;',
		`top: ${(document.querySelector("#image-container") || document.querySelector("#page")).offsetTop}px;`,
		'border-radius: 0;',
		'width: 300px;',
		'z-index: 9999;',
		'}',
		`#${ID} > .enhanced621-message {`,
		'display: block;',
		'margin: 4px 0;',
		'padding: 3px 0;',
		'border-radius: 6px 0 0 6px;',
		'text-align: initial !important;',
		'}',
		'.enhanced621-message-dismiss {',
		'cursor: pointer;',
		'margin-right: 4px;',
		'color: #999999;',
		'font-size: 17px;',
		'position: relative;',
		'}',
		'.enhanced621-message-icon {',
		'cursor: default;',
		'margin-left: 3px;',
		'margin-right: 2px;',
		'font-size: 16px;',
		'position: relative;',
		'}',
		'.enhanced621-message-icon.enhanced621-message-error {',
		'color: #EE0000;',
		'}',
		'.enhanced621-message-icon.enhanced621-message-warning {',
		'color: #EEEE00;',
		'}',
		'.enhanced621-message-icon.enhanced621-message-help {',
		'color: #00EE44;',
		'}',
		'.enhanced621-message-content {',
		'cursor: default;',
		'margin-left: 2px;',
		'font-size: 16px;',
		'}',
	].join(''));
	/* eslint-enable sonarjs/no-duplicate-string */
	document.querySelector('#page').append(box);
	return box;
};
const putMessage = (content, type, icon, timeout) => {
	timeout = parseInt(String(timeout), 10);
	const master = warningBox();
	const messageContainer = makeElem('div', '', `enhanced621-message enhanced621-message-${type} site-notice`);
	const messageText = makeElem('span', '', `enhanced621-message-content enhanced621-message-${type}`);
	const messageClose = makeElem('span', '', `enhanced621-message-dismiss enhanced621-message-${type}`);
	const messageIcon = makeElem('span', '', `enhanced621-message-icon enhanced621-message-${type}`);
	if (typeof content == 'string') {
		messageText.innerHTML = content;
	}
	else if (Array.isArray(content)) {
		messageText.append(...content);
	}
	else {
		messageText.append(content);
	}
	messageClose.textContent = '✖';
	messageIcon.textContent = icon;
	messageContainer.append(messageClose, messageIcon, messageText);
	const removeMsg = cause => {
		messageContainer.remove();
		sendEvent(EV_MESSAGE_CLOSE, {
			content,
			type,
			icon,
			timeout,
			cause,
		});
		if (!master.children.length) {
			master.style.display = 'none';
		}
	};
	messageClose.addEventListener('click', () => {
		removeMsg('click');
	});
	master.append(messageContainer);
	master.style.display = 'block';
	if (!isNaN(timeout) && timeout > 0) {
		setTimeout(() => removeMsg('timeout'), timeout * 1000);
	}
	sendEvent(EV_MESSAGE_BOX, {
		content,
		type,
		icon,
		timeout,
	});
};
const putError = (content, timeout) => putMessage(content, 'error', '⚠', timeout);
const putWarning = (content, timeout) => putMessage(content, 'warning', '⚠', timeout);
const putHelp = (content, timeout) => putMessage(content, 'help', '🛈', timeout);

const KEY_HANDLERS = new Map();
const registerKeybind = (keys, handler) => {
	let modifiers = KB_NONE;
	KEYSTRING: for (let key of keys.split(/\s+/u)) {
		while (key.length > 1) {
			const modifier = key.slice(0, 1);
			key = key.slice(1);
			if (modifier == '^') {
				modifiers |= KB_CTRL;
			}
			else if (modifier == '!') {
				modifiers |= KB_ALT;
			}
			else if (modifier == '+') {
				modifiers |= KB_SHIFT;
			}
			else {
				error(`Unknown modifier "${modifier}" in keystring, skipping`);
				continue KEYSTRING;
			}
		}
		if (key != key.toLowerCase()) {
			modifiers |= KB_SHIFT;
			key = key.toLowerCase();
		}
		const keymap = KEY_HANDLERS.get(key) || [];
		keymap[modifiers] = handler;
		KEY_HANDLERS.set(key, keymap);
		const pretty = (modifiers & KB_CTRL ? 'ctrl-' : '')
			+ (modifiers & KB_ALT ? 'alt-' : '')
			+ (modifiers & KB_SHIFT ? 'shift-' : '')
			+ key;
		log(`Registered keybind handler for ${pretty}`);
	}
};
document.addEventListener('keydown', evt => {
	// eslint-disable-next-line array-bracket-newline, array-element-newline
	if (evt.target.isContentEditable || [ 'input', 'textarea' ].includes(evt.target.tagName.toLowerCase())) {
		// The user is typing into some kind of input area - don't interfere
		return;
	}
	if (event.isComposing || event.keyCode === 229) {
		// This is part of an IME composition - don't interfere
		return;
	}
	const key = (evt.key || '').toLowerCase();
	const alt = evt.altKey;
	const ctrl = evt.ctrlKey;
	const shift = evt.shiftKey;
	const modifiers = (alt ? KB_ALT : KB_NONE)
		| (ctrl ? KB_CTRL : KB_NONE)
		| (shift ? KB_SHIFT : KB_NONE);
	const handlerMap = KEY_HANDLERS.get(key) || [];
	const handler = handlerMap[modifiers];
	if (typeof handler == 'function') {
		const unhandled = handler(evt, key, modifiers);
		if (unhandled) { // If you don't return a value, it'll assume you handled things fine
			evt.preventDefault();
			evt.stopPropagation();
		}
	}
});

const CURRENT_SEARCH = (() => {
	const p = new URLSearchParams(location.search);
	return void 0
		|| p.get('q')
		|| p.get('tags')
		|| p.get('name')
		|| '';
})();

const navbar = document.querySelector("#nav").children[0];
const subnavbar = document.querySelector("#nav").children[1];

const PATH = location.pathname;

const POOL_PATH_PREFIX = '/pools/';
const POST_PATH_PREFIX = '/posts/';
const POST_INDEX_PATH = '/posts';

const POOL_READER_CONTAINER_ID = "pool-reader";
const POOL_READER_STATUSLINE_ID = "enhanced621-pool-reader-status";
const LINK_MODE_ID = "en621-link-mode-toggle";
const POOL_READER_LINK_CLASS = "en621-post-link";

const controlTabsContainer = makeElem('div', 'control-tabs-container');
const addControlTab = (...parts) => {
	if (!parts.length) {
		return false;
	}
	let tab;
	if (parts.length > 1 || (parts[0].nodeName || '').toLowerCase() != 'div') {
		tab = makeElem('div');
		tab.append(...parts);
	}
	else {
		tab = parts[0];
	}
	tab.classList.add("site-notice");
	controlTabsContainer.prepend(tab);
	return tab;
};
/* eslint-disable sonarjs/no-duplicate-string */
GM_addStyle([
	"#control-tabs-container {",
	"position: fixed;",
	"right: 0;",
	"bottom: 10px;",
	"border-radius: 0;",
	"display: flex;",
	"flex-direction: column;",
	"justify-content: flex-end;",
	"align-items: flex-end;",
	"}",
	"#control-tabs-container > div {",
	"flex: 0 0 auto;",
	"margin-top: 5px;",
	"border-radius: 7px 0 0 7px;",
	"z-index: 9999;",
	"max-width: 300px;",
	"width: -moz-fit-content;",
	"width: fit-content;",
	"text-align: left !important;",
	"transition: right 0.3s cubic-bezier(0.22, 0.61, 0.36, 1);",
	"transition-delay: 0.15;",
	"}",
	"#control-tabs-container > div:hover {",
	"right: 0;",
	"transition-delay: 0.5s;",
	"}",
].join(''));
/* eslint-enable sonarjs/no-duplicate-string */
document.querySelector("#page").append(controlTabsContainer);

const modeBox = makeElem('div', `${LINK_MODE_ID}-container`, "site-notice");
const modeToggle = makeElem('input', LINK_MODE_ID);
const modeLabel = makeElem('label');
modeToggle.type = "checkbox";
modeLabel.htmlFor = LINK_MODE_ID;
modeLabel.textContent = "Direct image links";
modeBox.append(modeToggle, modeLabel);
modeToggle.addEventListener('input', () => {
	info("Toggling direct image links mode");
	const links = document.querySelectorAll(`a.${POOL_READER_LINK_CLASS}`);
	const previews = document.querySelectorAll("div#posts-container > article");
	const poolID = PATH.startsWith(POOL_PATH_PREFIX)
		? parseInt(PATH.slice(POOL_PATH_PREFIX.length), 10)
		: 0;
	const params = new URLSearchParams();
	if (poolID && !isNaN(poolID)) {
		params.set('pool_id', poolID);
	}
	if (CURRENT_SEARCH) {
		params.set('q', CURRENT_SEARCH);
	}
	const urlTrail = params.toString() ? `?${params.toString()}` : '';
	if (modeToggle.checked) {
		for (const link of links) {
			link.href = link.children[0].src;
		}
		for (const preview of previews) {
			preview.children[0].href = preview.dataset.fileUrl;
		}
		setFlag("has-direct-links");
	}
	else {
		for (const link of links) {
			link.href = link.dataset.postlink;
		}
		for (const preview of previews) {
			preview.children[0].href = `/posts/${preview.dataset.id}${urlTrail}`;
		}
		unsetFlag("has-direct-links");
	}
	sendEvent(EV_DIRECT_LINKS, {
		active: modeToggle.checked,
	});
});
GM_addStyle([
	`#${LINK_MODE_ID}-container {`,
	"right: -97px;",
	"}",
	`#${LINK_MODE_ID} {`,
	"display: none;",
	"}",
	`#${LINK_MODE_ID} + label::before {`,
	"content: \"☒ \";",
	"font-weight: 900;",
	"color: red;",
	"}",
	`#${LINK_MODE_ID}:checked + label::before {`,
	"content: \"☑ \";",
	"color: green;",
	"}",
].join("\n"));
addControlTab(modeBox);

const enablePoolReaderMode = async () => {
	if (!PATH.startsWith(POOL_PATH_PREFIX) || !PATH.slice(POOL_PATH_PREFIX.length).match(/^\d+/u)) {
		throw new Error("This is not a pool page!");
	}
	const vanillaPageList = document.querySelector("div#posts");
	if (!vanillaPageList) {
		throw new Error("No post container found");
	}
	let readerPageContainer = document.querySelector(`div#${POOL_READER_CONTAINER_ID}`);
	if (readerPageContainer) {
		vanillaPageList.style.display = 'none';
		readerPageContainer.style.display = '';
		document.querySelector(`#${POOL_READER_STATUSLINE_ID}`).style.display = '';
		setFlag("pool-reader-mode"); // eslint-disable-line sonarjs/no-duplicate-string
		sendEvent(EV_POOL_READER_STATE, {
			active: true,
		});
		return readerPageContainer;
	}
	// If we get here, it's the first go and we're constructing it from scratch
	readerPageContainer = makeElem('div', POOL_READER_CONTAINER_ID);
	vanillaPageList.parentElement.append(readerPageContainer);
	GM_addStyle([
		`div#${POOL_READER_CONTAINER_ID} > a {`,
		'display: block;',
		'margin: 20px auto;',
		'width: fit-content;',
		'width: -moz-fit-content;',
		'position: relative;',
		'}',
		`div#${POOL_READER_CONTAINER_ID} > a > img.pool-image {`,
		'display: block;',
		'max-width: calc(100vw - 4rem);',
		'max-height: 125vh;',
		'}',
		'.video-preview-indicator {',
		'position: absolute;',
		'top: 5px;',
		'left: 50%;',
		'transform: translateX(-50%);',
		'color: red;',
		'font-weight: 900;',
		'font-size: 1.5em;',
		'width: fit-content;',
		'width: -moz-fit-content;',
		'}',
		'a.en621-post-link:hover > .video-preview-indicator {',
		'display: none;',
		'}',
	].join(''));
	const poolID = parseInt(PATH.slice(POOL_PATH_PREFIX.length), 10);
	const statusLine = makeElem('menu', POOL_READER_STATUSLINE_ID);
	const statusTab = addControlTab("Working...");
	subnavbar.parentElement.append(statusLine);
	const status = statusText => {
		statusLine.textContent = statusText;
	};
	const title = subtitle => {
		document.title = `Reader: ${subtitle} - e621`;
	};
	const checkResponseValidity = async poolData => {
		const pools = poolData.response;
		// pools is an array of pool objects
		if (pools.length > 1) {
			throw new Error(`Site returned too many options (${pools.length})`);
		}
		if (pools.length < 1) {
			throw new Error("Site returned no pools");
		}
		const pool = pools[0];
		const id = pool.id || poolData.context.pool;
		const name = pool.name.replace(/_/gu, ' ');
		const total = pool.post_count;
		if (total != pool.post_ids.length) {
			throw new Error(
				`Sanity check failed, post list (${pool.post_ids.length}) doesn't match expected size (${total})`
			);
		}
		if (!total) {
			throw new Error("Sanity check failed, post list empty");
		}
		title(`loading ${name}... (#${id})`);
		status(`Loading ${total} post${total == 1 ? '' : 's'} from pool #${id}...`);
		const state = Object.create(null);
		state.poolID = id;
		state.poolName = name;
		state.postCount = total;
		state.postIDs = pool.post_ids;
		return state;
	};
	const insertImages = async state => {
		state.posts = [];
		await state.postIDs.reduce(async (ticker, postID) => {
			await ticker;
			const current = state.posts.length + 1;
			const total = state.postCount;
			status(`[${current - 1}/${total}] Pausing to comply with site rules`);
			await pause(1500);
			title(`loading ${current}/${total} of ${name}... (#${state.poolID})`);
			status(`[${current}/${total}] Loading post #${postID}`);
			const api = await request(`https://e621.net/posts/${postID}.json`);
			if (api.response.post.flags.deleted) {
				warn(`Skipping deleted post #${postID}`);
				putWarning(`Post #${postID} (${current}/${total}) is marked as deleted.`);
				statusTab.textContent = `${current}/${total} done`;
				state.posts.push({
					url: null,
					id: postID,
				});
				sendEvent(EV_POST_DELETED, {
					id: postID,
				});
				return Promise.resolve();
			}
			// TODO: deal with videos better - an actual player would be nice
			// not bothering with flash, support's being dropped for it
			const sourceURL = api.response.post.file.url.match(/\.(?:mp4|webm|mov|m4a|flv)$/ui)
				? api.response.post.sample.url
				: api.response.post.file.url;
			const postURL = `/posts/${postID}?pool_id=${poolID}`;
			state.posts.push({
				url: sourceURL,
				id: postID,
			});
			return new Promise(resolve => {
				const link = makeElem('a', `post-${postID}`, POOL_READER_LINK_CLASS);
				const img = makeElem('img', '', 'pool-image');
				link.dataset.postlink = postURL;
				link.title = `${state.poolName}, ${current}/${total}`;
				img.addEventListener('load', () => {
					statusTab.textContent = `${current}/${total} done`;
					sendEvent(EV_POST_LOADED, {
						id: postID,
						source: sourceURL,
						post: postURL,
						count: current,
						total,
					});
					resolve();
				}, {
					once: true,
				});
				link.append(img);
				// Ugly hack
				if (sourceURL != api.response.post.file.url) {
					putWarning([
						`Post #${postID} does not appear to be an image.`,
						"Non-image posts are not yet fully supported. Only a preview will be shown.",
					].join(" "));
					const indicator = makeElem('div', '', 'video-preview-indicator');
					indicator.textContent = "[VIDEO PREVIEW]";
					link.append(indicator);
				}
				img.src = sourceURL;
				readerPageContainer.append(link);
				link.href = modeToggle.checked ? sourceURL : postURL;
			});
		}, Promise.resolve());
		setFlag("pool-reader-loaded");
		sendEvent(EV_POOL_READER_STATE, {
			loaded: true,
		});
		return state;
	};
	const onPoolLoadingError = err => {
		title(`pool loading failed`);
		status(err.toString().replace(/^error:\s+/ui, ''));
		setFlag("pool-reader-failed");
		setFlag("has-error");
		sendEvent(EV_POOL_READER_STATE, {
			failed: true,
			error: err,
		});
		statusTab.textContent = "⚠ Error!";
	};
	title(`loading pool #${poolID}...`);
	status(`Loading pool data for pool #${poolID}...`);
	const context = {
		pool: poolID,
	};
	setFlag("pool-reader-mode");
	sendEvent(EV_POOL_READER_STATE, {
		active: true,
	});
	return request(`${location.origin}/pools.json?search[id]=${poolID}`, context)
		.then(checkResponseValidity)
		.catch(onPoolLoadingError)
		.then(state => {
			vanillaPageList.style.display = 'none';
			return state;
		})
		.then(insertImages)
		.then(state => {
			title(`${state.poolName} (#${state.poolID})`);
			status(`Finished loading images for pool ${state.poolID} (${state.postCount} total)`);
			return state;
		})
		.catch(err => {
			statusTab.textContent = "⚠ Error!";
			sendEvent(EV_POOL_READER_STATE, {
				failed: true,
				error: err,
			});
		});
};
const disablePoolReaderMode = () => {
	location.hash = '';
	const vanillaPageList = document.querySelector("div#posts");
	const readerPageContainer = document.querySelector(`div#${POOL_READER_CONTAINER_ID}`);
	if (!vanillaPageList || !readerPageContainer) {
		return;
	}
	readerPageContainer.style.display = 'none';
	vanillaPageList.style.display = '';
	document.querySelector(`#${POOL_READER_STATUSLINE_ID}`).style.display = 'none';
	unsetFlag("pool-reader-mode");
	sendEvent(EV_POOL_READER_STATE, {
		active: false,
	});
};
const togglePoolReaderMode = evt => {
	const readerPageContainer = document.querySelector(`div#${POOL_READER_CONTAINER_ID}`);
	if (readerPageContainer && readerPageContainer.style.display) {
		// Exists, hidden
		enablePoolReaderMode();
	}
	else if (readerPageContainer) {
		// Exists, visible
		disablePoolReaderMode();
	}
	else {
		// Doesn't exist
		enablePoolReaderMode();
	}
	if (evt) {
		evt.preventDefault();
		evt.stopPropagation();
	}
};

const elevateSearchTerms = () => {
	if (CURRENT_SEARCH) { // may be empty
		const tagList = document.querySelector("#tag-box") || document.querySelector("#tag-list");
		const terms = CURRENT_SEARCH
			.split(/\s+/u)
			.filter(t => !t.includes(':'))
			.filter(t => !t.includes('*')) // TODO find a way to handle wildcard tags in searches?
			.map(t => t
				.replace(/^~/u, '')
				.replace(/_/gu, ' ')
				.toLowerCase());
		const originalTermCount = CURRENT_SEARCH.split(/\s+/u).length;
		const difference = Math.abs(terms.length - originalTermCount);
		if (terms.length != originalTermCount) {
			info(`${difference} term${difference == 1 ? '' : 's'} can't be scanned for!`);
		}
		if (terms.length) {
			GM_addStyle([
				".enhanced621-highlighted-tag {",
				"font-style: italic;",
				"}",
			].join("\n"));
			const tagElements = Array.from(tagList.querySelectorAll("a.search-tag")).reverse();
			log(`Elevating all instances of searched tags (${terms.length}) in ${tagElements.length} listed`);
			for (const tagElem of tagElements) {
				try {
					const tag = tagElem.textContent.toLowerCase();
					const idx = terms.indexOf(tag);
					if (idx >= 0) {
						terms.splice(idx, 1);
						log(`Elevating "${tag}"`);
						const line = tagElem.parentElement;
						const group = line.parentElement;
						tagElem.classList.add("enhanced621-highlighted-tag");
						group.insertAdjacentElement('afterbegin', line);
					}
				}
				catch (err) {
					error("Cannot examine tag element:", err);
				}
			}
			if (terms.length) {
				info(
					`${terms.length} term${terms.length == 1 ? '' : 's'} did not appear: ${terms.join(", ")}`
				);
			}
		}
	}
	else {
		for (const line of document.querySelectorAll('#tag-list > ul > li[class^="category-"]')) {
			// We'll use this - the search link - as the reference for inserting the new links
			const search = line.children[1];
			// But we can also use it to verify that this line actually needs to be fixed first
			if (!search.classList.contains("search-tag")) {
				continue;
			}
			// Need to create and inject the +/- links, which means first we need to know this tag
			const tag = new URL(line.children[1].href).searchParams.get('tags');
			// The wiki and search links already exist, we just need the include/exclude ones
			const include = makeElem('a', '', 'search-inc-tag');
			const exclude = makeElem('a', '', 'search-exl-tag');
			include.href = `/posts?tags=${tag}`;
			include.rel = 'nofollow';
			include.textContent = '+';
			exclude.href = `/posts?tags=-${tag}`;
			exclude.rel = 'nofollow';
			exclude.textContent = '-';
			line.insertBefore(include, search);
			line.insertBefore(document.createTextNode(" "), search);
			line.insertBefore(exclude, search);
			line.insertBefore(document.createTextNode(" "), search);
		}
	}
};

registerKeybind('!r', () => {
	document.location = 'https://e621.net/posts/random';
});
registerKeybind('!q', () => {
	document.querySelector('#tags').focus();
});
registerKeybind('+d', () => {
	modeToggle.checked = !modeToggle.checked;
	modeToggle.dispatchEvent(new Event('input')); // For some reason, the above doesn't fire the input event.
});

if (PATH.startsWith(POOL_PATH_PREFIX) && PATH.slice(POOL_PATH_PREFIX.length).match(/^\d+/u)) {
	const readerItem = makeElem('li', 'enhanced621-pool-reader-toggle');
	const readerLink = makeElem('a');
	GM_addStyle([
		'#enhanced621-pool-reader-toggle {',
		'position: absolute;',
		'right: 20px;',
		'cursor: pointer;',
		'}',
	].join("\n"));
	readerLink.addEventListener('click', togglePoolReaderMode);
	readerLink.textContent = 'Toggle reader';
	readerItem.append(readerLink);
	subnavbar.append(readerItem);
	CONSOLE_TOOLS.getVisiblePostURLs = () => {
		const set = Array.from(document.querySelectorAll('#posts-container > article[id^="post_"]'));
		return set.map(e => e.dataset.largeFileUrl);
	};
}
else if (PATH.startsWith(POST_PATH_PREFIX)) {
	const errorNoSource = "Could't find download/source link!";
	const postRatingClassPrefix = 'post-rating-text-';
	const sourceLink = document.querySelector("#image-download-link > a[href]");
	const image = document.querySelector("#image");
	const parentChildNotices = document.querySelector(".bottom-notices > .parent-children");
	const postRatingElem = document.querySelector("#post-rating-text");
	const tagList = document.querySelector("#tag-list");
	const curSearchBanner = document.querySelector("#nav-links-top > .search-seq-nav span.search-name");
	const poolLinkIdLead = "nav-link-for-pool-";
	const poolLink = document.querySelector(`#nav-links-top > .pool-nav > ul > li[id^="${poolLinkIdLead}"]`);
	const linkedPool = parseInt((
		poolLink || {
			id: `${poolLinkIdLead}0`,
		}
	).id.slice(poolLinkIdLead.length), 10);
	const scrollToRelated = evt => {
		try {
			parentChildNotices.scrollIntoView(false);
			log("Scrolled to parent/child notices");
		}
		catch (err) {
			putError("Scrolling failed");
			err("Can't scroll to parent/child notices:", err);
		}
		if (evt) {
			evt.preventDefault();
			evt.stopPropagation();
		}
	};
	if (image) {
		if (image.tagName.toLowerCase() == 'img') {
			image.addEventListener('dblclick', evt => {
				if (sourceLink && sourceLink.href) {
					location.assign(sourceLink.href);
				}
				else {
					putError(errorNoSource);
				}
				evt.preventDefault();
				evt.stopPropagation();
			});
			setFlag("has-quick-source");
		}
		else {
			setFlag("no-quick-source");
		}
		if (sourceLink && sourceLink.href) {
			const directSourceItem = makeElem('li', 'enhanced621-direct-source');
			const directSourceLink = makeElem('a');
			GM_addStyle('#enhanced621-direct-source { position: absolute; right: 20px; cursor: pointer; }');
			directSourceLink.textContent = 'Direct Link';
			directSourceLink.href = sourceLink.href;
			directSourceItem.append(directSourceLink);
			subnavbar.append(directSourceItem);
			setFlag("has-source-link");
		}
		else {
			putError(errorNoSource);
			setFlag("no-source-link");
		}
	}
	if (parentChildNotices.children.length) {
		setFlag("has-related-posts");
		if (document.querySelector("#has-parent-relationship-preview")) {
			setFlag("has-parent-post");
		}
		if (document.querySelector("#has-children-relationship-preview")) {
			setFlag("has-child-post");
		}
		const scrollToNoticeItem = makeElem('li', 'enhanced621-parent-child-notices');
		const scrollToNoticeLink = makeElem('a');
		GM_addStyle('#enhanced621-parent-child-notices { position: absolute; right: 120px; cursor: pointer; }');
		scrollToNoticeLink.textContent = [
			hasFlag("has-parent-post") ? 'Parent' : '',
			hasFlag("has-child-post") ? 'Children' : '',
		].filter(e => e).join('/');
		scrollToNoticeLink.href = '#';
		scrollToNoticeLink.addEventListener('click', scrollToRelated);
		scrollToNoticeItem.append(scrollToNoticeLink);
		subnavbar.append(scrollToNoticeItem);
	}
	if (linkedPool) {
		setFlag("post-in-pool");
	}
	if (postRatingElem) {
		try {
			const postRating = Array.from(postRatingElem.classList)
				.filter(cl => cl.startsWith(postRatingClassPrefix))
				.shift()
				.slice(postRatingClassPrefix.length)
				.toLowerCase();
			if (postRating) {
				const ratingTag = `rating:${postRating}`;
				const ratingURI = encodeURIComponent(ratingTag);
				const header = makeElem('h2', '', 'rating-tag-list-header tag-list-header');
				const list = makeElem('ul', '', 'rating-tag-list');
				const item = makeElem('li', '', 'category-0');
				const wiki = makeElem('a', '', 'wiki-link');
				const include = makeElem('a', '', 'search-inc-tag');
				const exclude = makeElem('a', '', 'search-exl-tag');
				const search = makeElem('a', '', 'search-tag');
				const tagParam = CURRENT_SEARCH.replace(/\s*-?rating(:|%3A)\w+\s*/iug, '');
				header.dataset.category = 'rating';
				[
					wiki,
					include,
					exclude,
					search,
				].forEach(a => {
					a.rel = 'nofollow';
					a.classList.add('rating-tag');
				});
				wiki.textContent = '?';
				wiki.href = `/wiki_pages/show_or_new?title=${ratingURI}`;
				include.textContent = '+';
				include.href = `/posts?tags=${tagParam}${tagParam ? '+' : ''}${ratingTag}`;
				exclude.textContent = '-';
				exclude.href = `/posts?tags=${tagParam}${tagParam ? '+' : ''}-${ratingTag}`;
				search.textContent = postRating.slice(0, 1).toUpperCase()
					+ postRating.slice(1);
				search.href = `/posts?tags=${ratingURI}`;
				item.append(wiki, ' ', include, ' ', exclude, ' ', search);
				list.append(item);
				header.textContent = "Rating";
				tagList.insertBefore(list, tagList.children[0]);
				tagList.insertBefore(header, tagList.children[0]);
				setFlag("has-post-rating-link");
			}
			else {
				setFlag("missing-post-rating");
			}
		}
		catch (err) {
			error("Can't find post rating:", err);
			setFlag("missing-post-rating");
			setFlag("has-error");
		}
	}
	else {
		setFlag("no-post-rating");
	}
	if (curSearchBanner) { // may not exist
		const link = makeElem('a', 'enhanced621-current-search-link');
		link.textContent = CURRENT_SEARCH;
		link.href = `/posts?tags=${encodeURIComponent(CURRENT_SEARCH)}`;
		curSearchBanner.innerHTML = link.outerHTML;
		setFlag("has-search-banner-link");
	}
	else {
		setFlag("no-search-banner");
	}
	elevateSearchTerms();
	try {
		image.scrollIntoView();
		if (hasFlag("has-related-posts")) {
			const msg = [
				"This post has ",
				makeElem('a'),
			];
			msg[1].href = '#';
			msg[1].textContent = "related posts";
			msg[1].addEventListener('click', scrollToRelated);
			putHelp(msg);
		}
		if (linkedPool) {
			const msg = [
				"This post is in ",
				makeElem('a'),
			];
			msg[1].href = '#';
			msg[1].textContent = "a pool";
			msg[1].addEventListener('click', evt => {
				document.querySelector("#nav-links-top").scrollIntoView();
				evt.preventDefault();
				evt.stopPropagation();
			});
			putHelp(msg);
		}
	}
	catch (err) {
		error("Can't scroll to post content:", err);
	}
}
else if (PATH == POST_INDEX_PATH) {
	elevateSearchTerms();
	try {
		document.querySelector('div.blacklist-help').children[0].textContent = "(?)";
	}
	catch (err) {
		error("Can't find `div.blacklist-help` to shorten text label:", err);
	}
	CONSOLE_TOOLS.getVisiblePostURLs = () => {
		const set = Array.from(document.querySelectorAll('#posts-container > article[id^="post_"]'));
		return set.map(e => e.dataset.largeFileUrl);
	};
}

if (document.querySelector('#search-box')) {
	const searchBox = document.querySelector("#search-box");
	const form = searchBox.querySelector("form");
	const searchLine = makeElem('div', "search-line");
	try {
		form.addEventListener('submit', () => {
			info("Cleaning search input string");
			const input = form.querySelector('#tags');
			input.value = input.value.replace(/\s+/gu, ' ').trim();
		});
		setFlag("has-autocleaning-searchbox");
	}
	catch (err) {
		error("Can't auto-format search string on submit:", err);
		setFlag("no-autocleaning-searchbox");
		setFlag("has-error");
	}
	try {
		searchLine.append(...form.children);
		form.append(searchLine);
		GM_addStyle([
			"#search-line input {",
			"flex: 1;",
			"}",
			"#search-line button {",
			"flex: 0;",
			"}",
			"#search-line * {",
			"z-index: 999999 !important;",
			"}",
			"#search-line {",
			"display: flex;",
			"min-width: fit-content;",
			"min-width: -moz-fit-content;",
			"max-width: 50vw;",
			"width: 0;",
			"transition: width 0.5s cubic-bezier(0.22, 0.61, 0.36, 1);",
			'transition-delay: 0.15s;',
			"}",
			"#search-line:hover, #search-line:focus, #search-line:focus-within {",
			"width: 100vw;",
			'transition-delay: 0.5s;',
			"}",
		].join("\n"));
		setFlag("has-flexible-search-box");
	}
	catch (err) {
		error("Can't make search box responsively expand:", err);
		setFlag("no-flexible-search-box");
		setFlag("has-error");
	}
}

Object.defineProperties(unsafeWindow, {
	EN621_CONSOLE_TOOLS: {
		value: Object.freeze(CONSOLE_TOOLS),
		enumerable: true,
	},
	EN621_API: {
		value: Object.freeze({
			VERSION: CONSOLE_TOOLS.SCRIPT_VERSION,
			hasFlag,
			putError,
			putWarning,
			putHelp,
			registerKeybind,
			searchString: () => CURRENT_SEARCH,
			enablePoolReaderMode,
			disablePoolReaderMode,
			togglePoolReaderMode,
			addControlTab,
		}),
		enumerable: true,
	},
});
setFlag("loaded");
info("Initialisation complete");
setTimeout(() => sendEvent(EV_SCRIPT_LOADED, {
	loadTimeMs: new Date().valueOf() - START_TIME_MS,
}));

