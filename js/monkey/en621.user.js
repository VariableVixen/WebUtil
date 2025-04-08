/* eslint-disable max-len */
// ==UserScript==
// @name         en621
// @namespace    VariableVixen
// @version      6.0.2
// @description  en(hanced)621 - minor-but-useful enhancements to e621
// @author       Aryanna Morgan
// @match        *://e621.net/*
// @updateURL    https://static.variablevixen.dev/js/monkey/en621.user.js
// @downloadURL  https://static.variablevixen.dev/js/monkey/en621.user.js
// @grant        GM_info
// @grant        GM_getValue
// @grant        GM_setValue
// @grant        GM_addStyle
// @grant        GM_xmlhttpRequest
// @grant        GM_setClipboard
// @grant        window.close
// @grant        unsafeWindow
// ==/UserScript==

/* CHANGELOG
v6.0.2 - fix pool reader toggle being misaligned
v6.0.1 - fixed autocleaning of search input
v6.0.0 - creating and deleting message tabs now allows the events to be canceled

v5.1.3 - fix console command-broadcast function being broken
v5.1.2 - fix accidental global variable leakage
v5.1.1 - fixed for new site structure
v5.1.0 - console tools to run commands (plus a (failed) experimental command to close windows with a last-seen post and nothing new)
v5.0.1 - fixed `hasNewPosts()` API function returning an inverted value
v5.0.0 - Mozilla broke the API export's security measures AND syntax (see comment at end of script)

v4.6.2 - fixed keybinds not working thanks to a typo in the core event handler
v4.6.1 - e621 changed some CSS which broke the menu / top bar displays, now fixed
v4.6.0 - added a control tab to scroll to the last seen post when possible
v4.5.0 - added `hasNewPosts()` to API
v4.4.1 - last-seen post tracking now excludes blacklisted posts
v4.4.0 - implemented last-seen post tracking on a per-search basis
v4.3.4 - HoverZoom checking now happens ten times in 100ms intervals because just 100ms isn't always enough
v4.3.3 - increased the artificial delay because there were still occasional timing issues
v4.3.2 - added an extra artificial delay to the HoverZoom check because race conditions suck ass
v4.3.1 - moved HoverZoom check to final init event, hopefully fix timing issues
v4.3.0 - added functionality to toggle image tooltips for post links, to hide the big description
v4.2.0 - control and message tabs can be a little wider now
v4.1.6 - add the downloadURL metadata tag
v4.1.5 - bugfix the CSS transition delays for control tabs that use the `right` property to partially hide
v4.1.4 - bugfix the CSS for control tabs so that checkboxes with labels are handled like the builtin direct-linker
v4.1.3 - bugfix the EN621_CONSOLE_TOOLS.getVisiblePostURLs() function - use the right .dataset key
v4.1.2 - the various pool reader control functions are now properly marked as async and resolve/throw correctly
v4.1.1 - the `putMessage` timeout now supports floats instead of forcing to integers
v4.1.0 - add a label to the navbar to show the loaded version, clicking does an inter-tab version check
v4.0.0 - rewrote notice tabs to be less dumb using the same implementation as controls, shortened CSS class names

v3.5.1 - HELLA documentation (not really) and a handful of minor bugfixes and optimisations
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
v2.3.0 - made search box responsively expand when hovered or focused
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
- Advanced utilities via "commandline" entry like RES?
- Set up an inter-tab queue for pool reader mode?
- Saved tags feature from the old (pre-site-update) version? (might not be worth it, given bookmarks... see next)
- Overhaul the tag box/lists to allow building a search in the box from the lists without loading new pages?
- "Default" tags? (Vague idea of having tag sidebar links automatically add user-defined defaults, like ratings)
*/
/* eslint-enable max-len */


const START_TIME_MS = new Date().valueOf();

const SCRIPT_NAME = GM_info.script.name;
const SCRIPT_VERSION = `V${GM_info.script.version || '???'}`;
const SCRIPT_TITLE = `${SCRIPT_NAME} ${SCRIPT_VERSION}`;

const NOP = () => { }; // eslint-disable-line no-empty-function

const debug = console.debug.bind(console, `[${SCRIPT_TITLE}]`);
const log = console.log.bind(console, `[${SCRIPT_TITLE}]`);
const info = console.info.bind(console, `[${SCRIPT_TITLE}]`);
const warn = console.warn.bind(console, `[${SCRIPT_TITLE}]`);
const error = console.error.bind(console, `[${SCRIPT_TITLE}]`);

const KB_NONE = 0;
const KB_ALT = 1;
const KB_CTRL = 2;
const KB_SHIFT = 4;

// Somewhat irritatingly, e621 uses different query parameters for the tag search depending on where you are.
// This is an anonymous function that's immediately run, which just tries the (known) parameters it uses and
// returns the (decoded) search, or an empty string if one wasn't found.
const CURRENT_SEARCH = (() => {
	const p = new URLSearchParams(location.search);
	return void 0
		|| p.get('q')
		|| p.get('tags')
		|| p.get('name')
		|| '';
})();
const NORMALISED_SEARCH = (() => {
	if (!CURRENT_SEARCH) {
		return '';
	}
	return Array.from(
		new Set(
			CURRENT_SEARCH
				.trim()
				.split(/\s+/u)
				.map((tag) => tag.toLowerCase().replace(/^(rating:[sqe])/u, '$1'))
		)
	).sort().join(" "); // eslint-disable-line newline-per-chained-call
})();

const navbar = document.querySelector("nav.navigation > .nav-primary");
const navright = document.querySelector("nav.navigation > .nav-tools");
const navsecond = document.querySelector("nav.navigation > .nav-help");
const subnavbar = document.querySelector("nav.navigation > .nav-secondary");

const PATH = location.pathname;

const POOL_PATH_PREFIX = '/pools/';
const POST_PATH_PREFIX = '/posts/';
const POST_INDEX_PATH = '/posts';

const POOL_READER_CONTAINER_ID = "pool-reader";
const POOL_READER_STATUSLINE_ID = "en621-pool-reader-status";
const LINK_MODE_ID = "en621-link-mode-toggle";
const POOL_READER_LINK_CLASS = "en621-post-link";
const DISABLED_TOOLTIPS_FLAG = "no-image-tooltips";
const TOOLTIP_TOGGLE_ID = "en621-image-tooltips-toggle";

const EV_POOL_READER_STATE = "pool-reader-state";
const EV_MESSAGE_BOX = "user-message";
const EV_MESSAGE_CLOSE = "close-message";
const EV_DIRECT_LINKS = "direct-link-mode";
const EV_IMAGE_TOOLTIPS = "image-tooltips";
const EV_POST_DELETED = "missing-post";
const EV_POST_LOADED = "post-loaded";
const EV_SCRIPT_LOADED = "loaded";
const EV_FLAG_SET = "flag-set";
const EV_FLAG_UNSET = "flag-unset";

const CONSOLE_TOOLS = Object.create(null);
CONSOLE_TOOLS.SCRIPT_VERSION = Object.freeze(GM_info.script.version.split(".").map((i) => parseInt(i, 10)));


const pause = (delay) => new Promise((resolve) => setTimeout(resolve.bind(resolve, delay), delay));
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
	// Events are sent as `en621` with `detail.name` set to the given `name`
	// Any extra data is set on `detail.data` AS-IS
	// If the event is cancelable, you'll probably want to `.then()` on this function, since
	// it returns a promise that resolves to the event object once all handlers finish running.
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
// Register a debugging listener for all events
document.addEventListener('en621', (evt) => {
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

const setFlag = (flagstr) => {
	// Flags are set as classes on the body tag, prefixed with `en621-` and forced to lowercase
	// This allows checking for flags easily enough (see `hasFlag()` for that) and also applying
	// conditional CSS based on the presence (or, with `:not()`, absence) of various flags.
	const flags = flagstr.replace(/\s+/gu, ' ').split(" ");
	flags.forEach((flag) => {
		const clean = flag
			.replace(/^en621-?/ui, '')
			.toLowerCase();
		document.body.classList.add(`en621-${clean}`);
		sendEvent(EV_FLAG_SET, {
			id: clean,
			full: `en621-${clean}`,
		});
	});
};
const unsetFlag = (flagstr) => {
	const flags = flagstr.replace(/\s+/gu, ' ').split(" ");
	flags.forEach((flag) => {
		const clean = flag
			.replace(/^en621-?/ui, '')
			.toLowerCase();
		document.body.classList.remove(`en621-${clean}`);
		sendEvent(EV_FLAG_UNSET, {
			id: clean,
			full: `en621-${clean}`,
		});
	});
};
// Note that the `flagstr` passed to this is SPLIT ON WHITESPACE!
// If you pass a string like "this is my flag" then FOUR flags will be checked:
// `en621-this`
// `en621-is`
// `en621-my`
// `en621-flag`
// The return value is true if and ONLY if ALL flags are found.
// NON-whitespace is left entirely unchanged. Also note that `en621-` is prefixed to each flag,
// but will NOT be duplicated if your passed flag already has it.
const hasFlag = (flags) => {
	const flagList = flags.replace(/\s+/gu, ' ').split(" ");
	for (const flag of flagList) {
		const clean = flag
			.replace(/^en621-?/ui, '')
			.toLowerCase();
		if (!document.body.classList.contains(`en621-${clean}`)) {
			return false;
		}
	}
	return true;
};
const toggleFlag = (flagstr) => {
	const flags = flagstr.replace(/\s+/gu, ' ').split(" ");
	flags.forEach((flag) => {
		if (hasFlag(flag)) {
			unsetFlag(flag);
		}
		else {
			setFlag(flag);
		}
	});
};

const makeElem = (tag, id, clazz) => {
	const elem = document.createElement(tag);
	if (id) {
		elem.id = id;
	}
	if (clazz) {
		elem.className = clazz;
	}
	return elem;
};

// These two are practically the same thing (at least generally and structurally) so set them up together here.
// Control tabs are on the BOTTOM right, message tabs on the TOP right. Message tabs have an icon and can be
// closed, control tabs can't. That's about it.

const controlTabsContainer = makeElem("div", "control-tabs-container", "en621-side-tab-container");
const messageTabsContainer = makeElem("div", "message-tabs-container", "en621-side-tab-container");
GM_addStyle([
	".en621-side-tab-container {",
	"position: fixed;",
	"right: 0;",
	"border-radius: 0;",
	"display: flex;",
	"flex-direction: column;",
	"justify-content: flex-end;",
	"align-items: flex-end;",
	"pointer-events: none;",
	"}",
	"#message-tabs-container {",
	`top: ${(document.querySelector("#image-container") || document.querySelector("#page")).offsetTop}px;`,
	"}",
	"#control-tabs-container {",
	"bottom: 10px;",
	"}",
	".en621-message-tab, .en621-control-tab {",
	"flex: 0 0 auto;",
	"margin-top: 5px;",
	"padding: 3px 0;",
	"border-radius: 7px 0 0 7px;",
	"z-index: 9999;",
	"max-width: 400px;",
	"width: -moz-fit-content;",
	"width: fit-content;",
	"text-align: left !important;",
	"pointer-events: auto;",
	"}",
	".en621-message-dismiss {",
	"cursor: pointer;",
	"margin-right: 4px;",
	"color: #999999;",
	"font-size: 17px;",
	"position: relative;",
	"}",
	".en621-message-icon {",
	"cursor: default;",
	"margin-left: 3px;",
	"margin-right: 2px;",
	"font-size: 16px;",
	"position: relative;",
	"}",
	".en621-message-icon.en621-message-error {",
	"color: #EE0000;",
	"}",
	".en621-message-icon.en621-message-warning {",
	"color: #EEEE00;",
	"}",
	".en621-message-icon.en621-message-help {",
	"color: #00EE44;",
	"}",
	".en621-message-content {",
	"cursor: default;",
	"margin-left: 2px;",
	"font-size: 16px;",
	"}",
	".en621-control-tab {",
	"transition: right 0.3s cubic-bezier(0.22, 0.61, 0.36, 1);",
	"transition-delay: 0.15;",
	"}",
	".en621-control-tab:hover {",
	"right: 0 !important;",
	"transition-delay: 0.5s;",
	"}",
].join(''));
document.querySelector("#page").append(controlTabsContainer);
document.querySelector("#page").append(messageTabsContainer);

// This is how you add a "control" tab. It doesn't have to actually do anything, like the pool reader ministatus
// tab which is Somewhere(tm) in the `enablePoolReaderMode` function. It's (semi-)intelligent about what you pass
// it: if you give it more than one thing or a thing that is NOT a `<div>` element, it wraps it in a new div tag.
// That's for the CSS that handles the styling of it. If you pass it a single div, it just uses that directly.
// Either way, the tab (the div) is given the necessary classes and then PREpended inside the container, so that
// new tabs are on TOP of old ones. Finally, and this is important, the tab that was inserted will be returned.
// If you want to remove it later, you need to save that to call `.remove()` on it, likewise for adding any
// event handlers on the tab instead of on some bit of the content.
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
	tab.classList.add("en621-control-tab");
	controlTabsContainer.prepend(tab);
	return tab;
};

// This places a side-tab-style message as an overlay on the upper right of the page, like the alerts for when
// a post has one or more related posts. The content is your user-defined stuff to put in it - a string of HTML,
// an array of content, or just a single thing - but the type is used in the CSS class. If you don't use one
// of the predefined helpers (see below this function) then you'll need to add your own CSS for it. The icon
// is treated as plaintext and positioned between the close button and the `content` in the tab. If you don't
// pass a timeout (or if it's not a number that is greater than zero) then it'll stay up until the user closes
// it with the button. Otherwise, the timeout is how many SECONDS (not milliseconds!) it should stay up before
// autoclosing. Keep in mind that `setTimeout()` uses the delay as a MINIMUM, so poorly-made scripts on the page
// may delay it longer - but they'll also trash the UX in other ways, and there's nothing I can do anyway.
const putMessage = (content, type, icon, timeout, cancelable) => {
	timeout = parseFloat(String(timeout));
	if (isNaN(timeout) || timeout < 0) {
		timeout = 0;
	}
	const msgSpawnEvt = sendEvent(EV_MESSAGE_BOX, {
		content,
		type,
		icon,
		timeout,
	}, cancelable);
	if (msgSpawnEvt.defaultPrevented) {
		return;
	}
	const messageContainer = makeElem('div', '', `en621-message-tab en621-message-${type} site-notice`);
	const messageText = makeElem('span', '', `en621-message-content en621-message-${type}`);
	const messageClose = makeElem('span', '', `en621-message-dismiss en621-message-${type}`);
	const messageIcon = makeElem('span', '', `en621-message-icon en621-message-${type}`);
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
	const removeMsg = (cause) => {
		const msgRemoveEvt = sendEvent(EV_MESSAGE_CLOSE, {
			content,
			type,
			icon,
			timeout,
			cause,
		}, true);
		if (!msgRemoveEvt.defaultPrevented) {
			messageContainer.remove();
		}
	};
	messageClose.addEventListener('click', () => {
		removeMsg('click');
	});
	messageTabsContainer.append(messageContainer);
	if (timeout) {
		setTimeout(() => removeMsg('timeout'), timeout * 1000);
	}
	return messageContainer;
};
// These three are just convenience helpers for the above. You'll probably want to use these instead.
const putError = (content, timeout) => putMessage(content, 'error', '⚠', timeout, false);
const putWarning = (content, timeout, allowCancelDisplay) => putMessage(content, 'warning', '⚠', timeout, allowCancelDisplay);
const putHelp = (content, timeout) => putMessage(content, 'help', '🛈', timeout, true);

// Rather than defining a whole arseload of keydown handlers and duplicating the checks against editable content
// and the like, en621 offers its own keybind manager: you register a keybind with `registerKeybind` (shocking!)
// and then it handles the actual checks. The `keys` string is kinda taken from AutoHotkey - modifiers like
// control, shift, and alt are all indicated with special characters. Yes, that currently means you can't bind
// those characters. I'll fix that.
//
// I wonder how long ago I said "I'll fix that" and then forgot about it immediately. TODO fix binding modifiers.
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
// This is en621's keybind handler - a single event checks the map to find your handler.
document.addEventListener('keydown', (evt) => {
	if (evt.target.isContentEditable || [ 'input', 'textarea' ].includes(evt.target.tagName.toLowerCase())) {
		// The user is typing into some kind of input area - don't interfere
		return;
	}
	if (evt.isComposing || evt.keyCode === 229) {
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

// This is the toggle for direct image links, now updated to use the above control tabs mechanism. It's an
// example of doing a tab with custom content that you don't need to remove later.
const modeBox = makeElem('div', `${LINK_MODE_ID}-container`);
const modeToggle = makeElem('input', LINK_MODE_ID);
const modeLabel = makeElem('label');
modeToggle.type = "checkbox";
modeLabel.htmlFor = LINK_MODE_ID;
modeLabel.textContent = "Direct image links";
modeBox.append(modeToggle, modeLabel);
modeToggle.addEventListener('input', () => {
	// This bit was a little complicated to wrangle together, but it should be easy enough to follow:
	const links = document.querySelectorAll(`a.${POOL_READER_LINK_CLASS}`); // for pool reader pages...
	const previews = document.querySelectorAll("div#posts > section.posts-container > article"); // for pools and post searches...
	// If you're looking at a pool, we need to save the ID for restoring the proper post URL.
	// Might be able to do that a better way, actually... TODO that.
	const poolID = PATH.startsWith(POOL_PATH_PREFIX)
		? parseInt(PATH.slice(POOL_PATH_PREFIX.length), 10)
		: 0;
	// This is for the current search / pool ID params for post links
	const params = new URLSearchParams();
	if (poolID && !isNaN(poolID)) {
		params.set('pool_id', poolID);
	}
	if (CURRENT_SEARCH) {
		params.set('q', CURRENT_SEARCH);
	}
	const urlTrail = params.toString() ? `?${params.toString()}` : '';
	// Need to prod the relevant pages, see what the datasets contain...
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
// This is for ALL control tabs with checkboxes
GM_addStyle([
	'div#control-tabs-container > div.en621-control-tab input[type="checkbox"] {',
	"display: none;",
	"}",
	`div#control-tabs-container > div.en621-control-tab input[type="checkbox"] + label::before {`,
	"content: \"☒ \";",
	"font-weight: 900;",
	"color: red;",
	"}",
	`div#control-tabs-container > div.en621-control-tab input[type="checkbox"]:checked + label::before {`,
	"content: \"☑ \";",
	"color: green;",
	"}",
].join("\n"));
// This just styles this one control tab's content
GM_addStyle([
	`#${LINK_MODE_ID}-container {`,
	"right: -97px;",
	"}",
].join("\n"));
addControlTab(modeBox);

// Here be dragons.
const enablePoolReaderMode = async () => {
	// If it's not a pool page, just cut out now. It ain't happening, chief.
	if (!PATH.startsWith(POOL_PATH_PREFIX) || !PATH.slice(POOL_PATH_PREFIX.length).match(/^\d+/u)) {
		throw new Error("This is not a pool page!");
	}
	// If we can't find the posts, we're not gonna be able to do anything.
	const vanillaPageList = document.querySelector("div#posts");
	if (!vanillaPageList) {
		throw new Error("No post container found");
	}
	// If the pool reader content has already been set up, just switch to it.
	let readerPageContainer = document.querySelector(`div#${POOL_READER_CONTAINER_ID}`);
	if (readerPageContainer) {
		vanillaPageList.style.display = 'none';
		readerPageContainer.style.display = '';
		document.querySelector(`#${POOL_READER_STATUSLINE_ID}`).style.display = '';
		setFlag("pool-reader-mode");
		sendEvent(EV_POOL_READER_STATE, {
			active: true,
		});
		return readerPageContainer;
	}
	// If we get here, it's the first go and we're constructing it from scratch
	// This is done on-demand so we don't have to do the setup when it's not needed
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
	statusLine.style.gridColumn = "span 2";
	statusLine.style.marginTop = "10px";
	// This here is an example of a "control" tab with simple text content that DOES get changed later
	const statusTab = addControlTab("Working...");
	subnavbar.parentElement.append(statusLine);
	const status = (statusText) => {
		statusLine.textContent = statusText;
	};
	const title = (subtitle) => {
		document.title = `Reader: ${subtitle} - e621`;
	};
	// We have a bunch of handlers here, so let's break it down a little...
	const checkResponseValidity = async (poolData) => {
		// Step one - this handler - is making sure the data we get back from the site is what we expect
		const pools = poolData.response;
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
		// This object is passed through the chain of handlers to hold all of the necessary into
		// It probably also has some unnecessary info too, tbh
		const state = Object.create(null);
		state.poolID = id;
		state.poolName = name;
		state.postCount = total;
		state.postIDs = pool.post_ids;
		return state;
	};
	const insertImages = async (state) => {
		// This one runs long (but async) because it sequentially inserts each image, waiting for it to finish
		// loading before continuing to the next one. Also it has to pause between hits in order to comply with
		// e621's API rules (and to avoid rudely hammering the server) too.
		state.posts = [];
		// This is a little trick to resolve promises sequentially, finishing each before starting the next
		await state.postIDs.reduce(async (ticker, postID) => {
			await ticker; // Wait for the last one to finish BEFORE continuing
			const current = state.posts.length + 1; // This is the ordinal number of the post we are NOW loading
			const total = state.postCount;
			status(`[${current - 1}/${total}] Pausing to comply with site rules`);
			await pause(1500);
			title(`loading ${current}/${total} of ${name}... (#${state.poolID})`);
			status(`[${current}/${total}] Loading post #${postID}`);
			const api = await request(`https://e621.net/posts/${postID}.json`);
			if (api.response.post.flags.deleted) {
				// If the post is deleted, then we tell the user and skip to the next, nothing more to be done
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
			return new Promise((resolve) => {
				// Each image is wrapped in a link to the post it's from, though the direct-mode toggle can
				// switch that to link to the image itself. Each link also has a unique ID containing the
				// post it's from. Technically, you could CSS-style specific posts if you wanted to.
				const link = makeElem('a', `post-${postID}`, POOL_READER_LINK_CLASS);
				const img = makeElem('img', '', 'pool-image');
				link.dataset.postlink = postURL;
				// The link also tells you the pool name and how far through it is on hover!
				link.title = `${state.poolName}, ${current}/${total}`;
				img.addEventListener('load', () => {
					// Once the image loads, update the status tab and post an event for any addon scripts,
					// then resolve the promise to move on.
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
				// Ugly hack for non-images, I might improve this sometime...
				if (sourceURL != api.response.post.file.url) {
					putWarning([
						`Post #${postID} does not appear to be an image.`,
						"Non-image posts are not yet fully supported. Only a preview will be shown.",
					].join(" "), 10); // Only show the message for 10 seconds
					// There's also a big honkin banner over the preview too!
					const indicator = makeElem('div', '', 'video-preview-indicator');
					indicator.textContent = "[VIDEO PREVIEW]";
					link.append(indicator);
				}
				// Set the source, slap it in there, and define the link depending on the current mode
				img.src = sourceURL;
				readerPageContainer.append(link);
				link.href = modeToggle.checked ? sourceURL : postURL;
			});
		}, Promise.resolve());
		// Once we get here, because of the await/reduce trick up there, we know that every image is loaded (or
		// skipped, for deleted ones) so we'll let any addons know...
		setFlag("pool-reader-loaded");
		sendEvent(EV_POOL_READER_STATE, {
			loaded: true,
		});
		// ...and continue the state chain. Whee, promises.
		return state;
	};
	// Now, something might go wrong. If it does, there's not much we can actually DO, but we can at least tell
	// the user so they don't sit there wondering.
	const onPoolLoadingError = (err) => {
		const msg = [
			"Something went wrong. ",
			makeElem('a'),
		];
		msg[1].href = '#';
		msg[1].textContent = "Copy details?";
		msg[1].addEventListener('click', () => {
			GM_setClipboard(err.toString());
			putHelp("Error message copied to clipboard!", 2);
		});
		putError(msg);
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
	// That's the handlers, now we actually start working!
	title(`loading pool #${poolID}...`);
	status(`Loading pool data for pool #${poolID}...`);
	const context = {
		pool: poolID,
	};
	setFlag("pool-reader-mode");
	sendEvent(EV_POOL_READER_STATE, {
		active: true,
	});
	// WHEE, PROMISES
	return request(`${location.origin}/pools.json?search[id]=${poolID}`, context) // Get the pool details!
		.then(checkResponseValidity) // Validate the response!
		.then((state) => {
			// Hide the normal list because we're switching to reader mode now!
			vanillaPageList.style.display = 'none';
			return state;
		})
		.then(insertImages) // Put the images on the page! (This'll take a while)
		.then((state) => {
			// Tell the user we're done loading!
			title(`${state.poolName} (#${state.poolID})`);
			status(`Finished loading images for pool ${state.poolID} (${state.postCount} total)`);
			return state;
		})
		.catch(onPoolLoadingError); // Any errors will skip down to here, aborting the chain of handlers.
}; // And that's the end of constructing/enabling pool reader mode!
const disablePoolReaderMode = async () => {
	// If it's not a pool page, just cut out now. It ain't happening, chief.
	if (!PATH.startsWith(POOL_PATH_PREFIX) || !PATH.slice(POOL_PATH_PREFIX.length).match(/^\d+/u)) {
		throw new Error("This is not a pool page!");
	}
	// This one's really simple. Everything's already there - the normal page content - so we just need to
	// hide pool reader and show the normal stuff.
	const vanillaPageList = document.querySelector("div#posts");
	const readerPageContainer = document.querySelector(`div#${POOL_READER_CONTAINER_ID}`);
	if (!vanillaPageList || !readerPageContainer) {
		// Although if we somehow get here without pool reader being enabled (or if we somehow can't find the
		// normal page...) then we just die. Bleh.
		throw new Error("Cannot find pool reader OR pool display");
	}
	readerPageContainer.style.display = 'none';
	vanillaPageList.style.display = '';
	document.querySelector(`#${POOL_READER_STATUSLINE_ID}`).style.display = 'none';
	unsetFlag("pool-reader-mode");
	sendEvent(EV_POOL_READER_STATE, {
		active: false,
	});
};
const togglePoolReaderMode = (evt) => {
	// You can just slap this in as an event handler, or call it directly. It's on the API, after all.
	if (evt) {
		evt.preventDefault();
		evt.stopPropagation();
	}
	// If pool reader's on, turn it off. If it's off, turn it on.
	// Shocking that a function named `togglePoolReaderMode` would toggle pool reader mode, I know.
	const readerPageContainer = document.querySelector(`div#${POOL_READER_CONTAINER_ID}`);
	if (readerPageContainer && readerPageContainer.style.display) {
		// Exists, hidden
		return enablePoolReaderMode();
	}
	else if (readerPageContainer) {
		// Exists, visible
		return disablePoolReaderMode();
	}
	// Doesn't exist
	return enablePoolReaderMode();
};

const elevateSearchTerms = () => {
	// This looks through the tag list sidebar to find tags that were searched for, highlights them, and moves
	// them up to the top of their category section. If there isn't a search, then it fixes a site failure where
	// the +/- buttons aren't shown, which means you can't search for "does not have tag" unless you already have
	// a search query.
	if (CURRENT_SEARCH) { // may be an empty string, if there's no search
		// Standardise yer fucking HTML, e6.
		const tagList = document.querySelector("#tag-box") || document.querySelector("#tag-list");
		const terms = CURRENT_SEARCH
			.split(/\s+/u)
			.filter((t) => !t.includes(':')) // We don't look at metadata searches here
			.filter((t) => !t.includes('*')) // TODO find a way to handle wildcard tags in searches?
			.map((t) => t
				.replace(/^~/u, '')
				.replace(/_/gu, ' ')
				.toLowerCase());
		// As noted above, I'd /like/ to handle wildcards, but... that would require doing some kind of
		// pattern matching against every single tag in the sidebars.
		const originalTermCount = CURRENT_SEARCH.split(/\s+/u).length;
		const difference = originalTermCount - terms.length;
		if (terms.length != originalTermCount) {
			info(`${difference} term${difference == 1 ? '' : 's'} can't be scanned for!`);
		}
		if (terms.length) {
			GM_addStyle([
				".en621-highlighted-tag {",
				"font-style: italic;",
				"}",
			].join("\n"));
			// Reverse cause we're looking bottom-up so that when we `.prepend()` the element to move it up,
			// the original ordering is maintained.
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
						tagElem.classList.add("en621-highlighted-tag");
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
	else { // if there ISN'T a current search...
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

// Using hoverzoom means that image description tooltips popping up is REALLY annoying, so I finally
// decided to add a feature to turn them off. Of course, it needs to be able to turn them back ON
// again too in case the user wants them back.
const disableImageTooltips = () => {
	const tipped = document.querySelectorAll('div#posts > section.posts-container > article > a[href] > picture > img[title]');
	for (const img of tipped) {
		if (img.title) {
			img.dataset.title = img.title;
			img.title = '';
		}
	}
	setFlag(DISABLED_TOOLTIPS_FLAG);
	sendEvent(EV_IMAGE_TOOLTIPS, {
		enabled: false,
	});
};
const enableImageTooltips = () => {
	const untipped = document.querySelectorAll('div#posts > section.posts-container > article > a[href] > picture > img[data-title]');
	for (const img of untipped) {
		if (img.dataset.title) {
			img.title = img.dataset.title;
			img.dataset.title = '';
		}
	}
	unsetFlag(DISABLED_TOOLTIPS_FLAG);
	sendEvent(EV_IMAGE_TOOLTIPS, {
		enabled: true,
	});
};
const toggleImageTooltips = () => {
	if (hasFlag(DISABLED_TOOLTIPS_FLAG)) {
		enableImageTooltips();
	}
	else {
		disableImageTooltips();
	}
};
const tooltipBox = makeElem('div', `${TOOLTIP_TOGGLE_ID}-container`);
const tooltipToggle = makeElem('input', TOOLTIP_TOGGLE_ID);
const tooltipLabel = makeElem('label');
tooltipToggle.type = "checkbox";
tooltipToggle.checked = true;
tooltipLabel.htmlFor = TOOLTIP_TOGGLE_ID;
tooltipLabel.textContent = "Tooltips on hover";
tooltipBox.append(tooltipToggle, tooltipLabel);
tooltipToggle.addEventListener('input', () => {
	if (tooltipToggle.checked) {
		enableImageTooltips();
	}
	else {
		disableImageTooltips();
	}
});
// This just styles the control tab's content
GM_addStyle([
	`#${TOOLTIP_TOGGLE_ID}-container {`,
	"right: -77px;",
	"}",
].join("\n"));
addControlTab(tooltipBox);
document.addEventListener('en621', (evt) => {
	if (evt.detail.name != EV_IMAGE_TOOLTIPS) {
		return;
	}
	tooltipToggle.checked = evt.detail.data.enabled;
});

// It may be useful to easily check if the most recent post on a search page is the last seen one for this search or not
const hasNewPosts = () => {
	if (PATH != POST_INDEX_PATH) {
		return void 0;
	}
	const latestPost = document.querySelector(`div#posts > section.posts-container > article:not(.blacklisted)`);
	if (!latestPost) {
		return void 0;
	}
	return !latestPost.classList.contains("en621-last-seen"); // eslint-disable-line consistent-return
};

// Register a few keybinds of our own...
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
registerKeybind('+t', () => {
	tooltipToggle.checked = !tooltipToggle.checked;
	tooltipToggle.dispatchEvent(new Event('input')); // Same as above
});

if (PATH.startsWith(POOL_PATH_PREFIX) && PATH.slice(POOL_PATH_PREFIX.length).match(/^\d+/u)) {
	// If this is a pool page, set up the pool-specific run-once features
	const readerItem = makeElem('li', 'en621-pool-reader-toggle');
	const readerLink = makeElem('a');
	GM_addStyle([
		'#en621-pool-reader-toggle {',
		'margin-left: auto;',
		'cursor: pointer;',
		'}',
	].join("\n"));
	readerLink.addEventListener('click', togglePoolReaderMode);
	readerLink.textContent = 'Toggle reader';
	readerItem.append(readerLink);
	subnavbar.append(readerItem);
	CONSOLE_TOOLS.getVisiblePostURLs = () => {
		const set = Array.from(document.querySelectorAll('div#posts > section.posts-container > article[id^="post_"]'));
		return set.map((e) => e.dataset.fileUrl);
	};
	// There are not many pool-specific run-once features.
	// YET?
	// [ominous music]
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
	const scrollToRelated = (evt) => {
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
	// Technically, this variable is poorly named. It COULD be a video instead. Code evolves, you know?
	if (image) {
		// But if it IS an image...
		if (image.tagName.toLowerCase() == 'img') {
			// Doubleclicking the image goes right to the direct link
			image.addEventListener('dblclick', (evt) => {
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
		// And whatever it is, we add a link on the subnavbar to go to the direct link too
		if (sourceLink && sourceLink.href) {
			const directSourceItem = makeElem('li', 'en621-direct-source');
			const directSourceLink = makeElem('a');
			GM_addStyle('#en621-direct-source { position: absolute; right: 20px; cursor: pointer; }');
			directSourceLink.textContent = 'Direct Link';
			directSourceLink.href = sourceLink.href;
			directSourceItem.append(directSourceLink);
			subnavbar.append(directSourceItem);
			setFlag("has-source-link");
		}
		else {
			// Unless we somehow CAN'T get the source, which would be really weird since there's SOMETHING there
			putError(errorNoSource);
			setFlag("no-source-link");
		}
	}
	// The container is apparently there even when empty, but if it's NOT empty then there are related posts
	if (parentChildNotices && parentChildNotices.children.length) {
		setFlag("has-related-posts");
		if (document.querySelector("#has-parent-relationship-preview")) {
			setFlag("has-parent-post");
		}
		if (document.querySelector("#has-children-relationship-preview")) {
			setFlag("has-child-post");
		}
		const scrollToNoticeItem = makeElem('li', 'en621-parent-child-notices');
		const scrollToNoticeLink = makeElem('a');
		GM_addStyle('#en621-parent-child-notices { position: absolute; right: 120px; cursor: pointer; }');
		scrollToNoticeLink.textContent = [
			hasFlag("has-parent-post") ? 'Parent' : '',
			hasFlag("has-child-post") ? 'Children' : '',
		].filter((e) => e).join('/');
		scrollToNoticeLink.href = '#';
		scrollToNoticeLink.addEventListener('click', scrollToRelated);
		scrollToNoticeItem.append(scrollToNoticeLink);
		subnavbar.append(scrollToNoticeItem);
	}
	if (linkedPool) {
		setFlag("post-in-pool");
	}
	if (postRatingElem) {
		// If we found the post rating, then add a metatag for it to the VERY top of the tag list
		try {
			const postRating = Array.from(postRatingElem.classList)
				.filter((cl) => cl.startsWith(postRatingClassPrefix))
				.shift()
				.slice(postRatingClassPrefix.length)
				.toLowerCase();
			if (postRating) {
				// And it looks like a normal tag and everything, with all the meta links!
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
				].forEach((a) => {
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
		// This is the banner over a post showing the current search that led you to it.
		// For some reason, it's plain text. That's not very useful. Let's make it a link!
		const link = makeElem('a', 'en621-current-search-link');
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
		// Try to scroll to the top of the content (which, again, might not be an actual image...)
		image.scrollIntoView();
		// And now that we're scrolled below the nav bar bits, show notices for pools and relations
		if (hasFlag("has-related-posts")) {
			const msg = [
				"This post has ",
				makeElem('a'),
			];
			msg[1].href = '#';
			msg[1].textContent = "related posts";
			// You can click it to go right to the related posts though!
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
			// This one goes up to show you the pool(s) since there may be more than one
			msg[1].addEventListener('click', (evt) => {
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
	// If you're on a post SEARCH page, rather than a POST page...
	const postSelector = "div#posts > section.posts-container > article";
	const storageKey = `lastSeenPostId/${NORMALISED_SEARCH}`;
	const lastSeenPostId = GM_getValue(storageKey, "");
	// This has to be delayed because the site doesn't actually flag posts on the page as blacklisted on the server.
	// That's done by a script on the client, so if we check too fast, then it won't have time to work and we'll get a hidden post.
	const deferredPostScan = function deferredPostScan() {
		const latestPost = document.querySelector(`${postSelector}:not(.blacklisted)`);
		// If there are posts on this search (there might not be!) then remember the most recent one
		if (latestPost) {
			GM_setValue(storageKey, latestPost.dataset.id);
		}
	};
	setTimeout(deferredPostScan, 1000);
	// Apply the styling to highlight the last post the user saw on this search
	GM_addStyle([
		`${postSelector}.en621-last-seen > a img {`,
		"border: 3px dashed yellow !important;",
		"}",
	].join("\n"));
	// If this is a new search, we won't have a last-seen ID
	if (lastSeenPostId) {
		// But if we do, look for that post on this page...
		const lastSeenPost = document.querySelector(`${postSelector}#post_${lastSeenPostId}`);
		// ...and if it's here (it might not be, if it's been long enough on a popular tag) then flag it and make the scroll tab
		if (lastSeenPost) {
			const scrollLink = document.createElement('a');
			scrollLink.href = "javascript:void 0"; // eslint-disable-line no-script-url
			scrollLink.textContent = "Last seen";
			scrollLink.addEventListener('click', (evt) => {
				try {
					lastSeenPost.scrollIntoView({
						behavior: "smooth",
						block: "end",
					});
				}
				catch (err) {
					error("Can't scroll to last seen post:", err);
				}
				evt.preventDefault();
				evt.stopPropagation();
			});
			addControlTab(scrollLink);
			lastSeenPost.classList.add('en621-last-seen');
			setFlag('has-last-seen-post');
		}
	}
	elevateSearchTerms();
	try {
		// This just annoyed me :v
		document.querySelector('div.blacklist-help').children[0].textContent = "(?)";
	}
	catch (err) {
		error("Can't find `div.blacklist-help` to shorten text label:", err);
	}
	CONSOLE_TOOLS.getVisiblePostURLs = () => {
		const set = Array.from(document.querySelectorAll('div#posts > section.posts-container > article[id^="post_"]'));
		return set.map((e) => e.dataset.largeFileUrl);
	};
}

if (document.querySelector('#tags')) {
	// Now, WHEREVER you are, make the search box less shitty
	const searchBox = document.querySelector("#tags");
	const form = searchBox.parentElement;
	try {
		// automatically clean up the contents a little
		const cleanSearchBox = () => {
			info("Cleaning search input string");
			searchBox.value = searchBox.value.replace(/\s+/gu, ' ').trim();
		};
		form.addEventListener('submit', cleanSearchBox);
		form.addEventListener('blur', cleanSearchBox);
		setFlag("has-autocleaning-searchbox");
	}
	catch (err) {
		error("Can't auto-format search string:", err);
		setFlag("no-autocleaning-searchbox");
		setFlag("has-error");
	}
}

// Stick a little thing on the navbar to show that we're loaded and our version
// The clever bit is that is does an inter-tab version check!
const versionChannel = new BroadcastChannel('en621-versioncheck');
versionChannel.addEventListener("message", (evt) => {
	try {
		const my = GM_info.script.version;
		const version = evt.data;
		// The simple case: nothing to do
		if (my == version) {
			info("Got a version ping, version matches current");
			return;
		}
		const remote = version.match(/^(\d+)\.(\d+)\.(\d+)-([^+]+)/u) || version.match(/^(\d+)\.(\d+)\.(\d+)/u);
		const local = my.match(/^(\d+)\.(\d+)\.(\d+)-([^+]+)/u) || my.match(/^(\d+)\.(\d+)\.(\d+)/u);
		// The second simple case: this is garbage data
		if (!remote) {
			warn("Got a version ping with junk data");
			return;
		}
		// The complex case: WHAT do we do?
		const lMajor = parseInt(local[1], 10);
		const lMinor = parseInt(local[2], 10);
		const lPatch = parseInt(local[3], 10);
		const lPre = local[4] || '';
		const rMajor = parseInt(remote[1], 10);
		const rMinor = parseInt(remote[2], 10);
		const rPatch = parseInt(remote[3], 10);
		const rPre = remote[4] || '';
		const reply = () => versionChannel.postMessage(my);
		if (lMajor > rMajor) { // Our MAJOR is higher
			reply();
		}
		else if (lMajor < rMajor) { // Our MAJOR is lower
			location.reload();
		}
		else if (lMinor > rMinor) { // MAJOR matches, our MINOR is higher
			reply();
		}
		else if (lMinor < rMinor) { // MAJOR matches, our MINOR is lower
			location.reload();
		}
		else if (lPatch > rPatch) { // MAJOR and MINOR match, our PATCH is higher
			reply();
		}
		else if (lPatch < rPatch) { // MAJOR and MINOR match, our PATCH is lower
			location.reload();
		}
		else if (!lPre && rPre) { // They're a PR, we're not
			reply(); // Prereleases are considered earlier when all else matches
		}
		else if (lPre && !rPre) { // We're a PR, they're not
			location.reload();
		}
		else { // Can't be the same version, so by here only the PR data can differ
			// According to https://semver.org/ the prerelease data may be structured as follows:
			// ASCII alphanumerics and hyphens, dot-separated, no leading zero, not empty
			// Comparison follows these rules:
			// Compare each dot-separated identifier, left-to-right, until a difference is found, as such:
			// Numbers-only are compared numerically, others lexically in ASCII order, numbers below others,
			// empty sorts below (earlier than) non-empty.
			const pL = lPre.split('.');
			const pR = rPre.split('.');
			const limit = Math.max(pL.length, pR.length);
			for (let i = 0; i < limit; ++i) {
				const l = pL[i] || '';
				const r = pR[i] || '';
				if (l === '') {
					// We are the earlier version
					location.reload();
					break;
				}
				else if (r === '') {
					// We are the later version
					reply();
					break;
				}
				else {
					const nl = parseInt(l, 10);
					const nr = parseInt(r, 10);
					if (isNaN(nl) || isNaN(nr)) {
						// Lexical ASCII sort order
						const comp = (l > r) - (l < r);
						// -1 = local earlier
						//  0 = match
						// +1 = local later
						if (comp < 0) {
							location.reload();
							break;
						}
						else if (comp > 0) {
							reply();
							break;
						}
					}
					// Numeric order, nice and simple
					else if (nl < nr) { // We're earlier
						location.reload();
						break;
					}
					else if (nl > nr) { // We're later
						reply();
						break;
					}
				}
			}
		}
	}
	catch (err) {
		error("Error in version channel handler:", err);
	}
});
const navbarVersionContainer = makeElem("li", "nav-en621-version-label");
const navbarVersionLabel = makeElem("a", "nav-en621-version-link"); // ...link to where?
navbarVersionContainer.style.float = "right";
navbarVersionLabel.textContent = SCRIPT_TITLE;
navbarVersionLabel.href = "#";
navbarVersionLabel.addEventListener("click", () => {
	versionChannel.postMessage(GM_info.script.version);
});
// And put it on the page
navbarVersionContainer.append(navbarVersionLabel);
navright.append(navbarVersionContainer);

// This allows each tab to issue a command across all of en621, for every loaded tab to execute.
// At the time of writing this, it's not USED anywhere yet, since the feature I had been planning it for is nonviable, but I'm leaving it
// implemented here for the future.
//
// The functionality is such that any received message is treated as `<command>[ <argument>]`, where `command` is looked up by name in the
// `COMMANDS` table here, and `argument` (the remainder of the string) is passed as the argument to the function. If there is no argument,
// the function gets an empty string instead.
//
// The idea was that a message could be sent telling all tabs to check if they're on an index page that doesn't have unseen posts (see the
// last-seen-posts feature) and if so then close themselves, but scripts can't close tabs that they didn't open, so that's a bust.
//
// The NEW idea is that this can be used for an advanced command-line-style instruction input (which the original probably would have been
// implemented as anyway) for... I dunno yet, that's why I didn't write it.
const COMMANDS = Object.assign(Object.create(null), {
	CloseIfNoNewPosts() {
		if (hasNewPosts() === false) (unsafeWindow.close || window.close)();
	},
});
const parseCommand = (commandString) => {
	let cmd, arg;
	if (commandString.includes(" ")) {
		[ cmd ] = commandString.split(" ");
		arg = commandString.slice(commandString.indexOf(" ") + 1).trim();
	}
	else {
		cmd = commandString;
		arg = "";
	}
	return [ cmd, arg ];
};
const commandChannel = new BroadcastChannel('en621-commands');
CONSOLE_TOOLS.executeLocalCommand = (command) => {
	let [ commandName, commandArg ] = parseCommand(command);
	if (COMMANDS[commandName]) {
		info(`Executing command: ${commandName}`);
		COMMANDS[commandName](commandArg);
	}
	else {
		error(`Unknown command: ${commandName}`);
	}
};
commandChannel.addEventListener("message", (evt) => {
	CONSOLE_TOOLS.executeLocalCommand(evt.data);
});
CONSOLE_TOOLS.broadcastCommand = (command) => {
	commandChannel.postMessage(command);
};

// Last but not least...
/* 2025-01-15 edit: fuck Mozilla.

Previously, I could do
-----
const someApiObject = Object.create(null); // no prototype to fuck things up
Object.assign(someApiObject, {
	// ...simple values...
});
Object.defineProperties(someApiObject, {
	propertyName: {
		enumerable: true,
		get() {
			// ...
		},
		set(value) {
			// ...
		},
	},
	// ...
});
Object.defineProperty(window, 'propertyName', {
	enumerable: true,
	value: Object.freeze(someApiObject),
});
-----
and the exported-to-window object would be frozen so that nothing accessing it could modify values.
No changing anything, no adding new values.
There was no prototype, so it had ONLY the values and descriptors that I had EXPLICITLY assigned it.
The object itself couldn't be replaced on the page because it was defined as non-writable.
The whole thing was actually very secure, as long as the API didn't expose functions that did insecure things.

But now, content scripts - including greasemonkey and forks - can't do that. You have to export a CLONE into the window, and guess what?
Clones cannot be frozen, descriptors are lost (so no more getters and setters either), and any custom prototypes are dropped, including `null`.

So now, the publicly-exposed API object can be written to by any other script running on the page, it has the default `Object` prototype polluting it,
and anything using getters or setters has to be replaced with function calls, so that's a breaking syntax change.

And now, if I export an API object into the page, intended for other scripts (or even the page itself) to hook into,
any script can just replace the API methods with its own code. So in an attempt to make content scripts (like extensions)
more secure by controlling and filtering access between them and the page itself, they've opened up a brand new security
hole - and also it doesn't actually stop a malicious actor elsewhere on the page because they can just export their own
malicious functions into the page and then overwrite my API's methods.

The ONLY improvement is that scripts on a PAGE cannot introduce untrusted code into the more-privileged content script's scope...
unless the content script NEEDS values from the page (any values at all), in which case it HAS to access the insecure unwrapped
page values, and then you're back where you started accessing untrusted data, except now you've ALSO broken existing security AND syntax.

Final result: there's no real improvement in anything but the simplest of cases, and also there's degradation in all the other cases.

Brilliant work, Mozilla. Surely NOBODY could have conceived of this at ANY point during the planning, design, or implementation phases.
*/
unsafeWindow.EN621_CONSOLE_TOOLS = cloneInto(CONSOLE_TOOLS, unsafeWindow, { cloneFunctions: true });
unsafeWindow.EN621_API = cloneInto({
	VERSION: CONSOLE_TOOLS.SCRIPT_VERSION,
	hasFlag,
	putMessage,
	putError,
	putWarning,
	putHelp,
	registerKeybind,
	searchString: () => CURRENT_SEARCH,
	cleanSearchString: () => NORMALISED_SEARCH,
	enablePoolReaderMode,
	disablePoolReaderMode,
	togglePoolReaderMode,
	disableImageTooltips,
	enableImageTooltips,
	toggleImageTooltips,
	addControlTab,
	hasNewPosts,
}, unsafeWindow, { cloneFunctions: true });
info("Initialisation complete");
warn("BE CAREFUL USING EN621'S API OR CONSOLE TOOLS - MOZILLA BROKE THE SECURITY MEASURES ON THEM AND THEY CAN NOW BE OVERWRITTEN BY A HOSTILE SCRIPT!");
setFlag("loaded");
// This uses the default timeout of 0, which means basically "as soon as nothing else is busy"
// Addons can look for `document.body.classList.contains("en621-loaded")` and if it's not found,
// add a listener for the `en621` event to wait for en621 to finish loading.

setTimeout(() => {
	// Timing is a pain
	let counter = 0;
	const timer = setInterval(() => {
		if (document.querySelector("img.hoverZoomLink")) {
			// Hover zoom is installed
			disableImageTooltips();
			tooltipToggle.checked = false;
			clearInterval(timer);
		}
		else if (++counter >= 10) {
			clearInterval(timer);
		}
	}, 100);
	sendEvent(EV_SCRIPT_LOADED, {
		loadTimeMs: new Date().valueOf() - START_TIME_MS,
	});
});
