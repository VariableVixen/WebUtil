/* eslint-env jquery */
$(() => {
	/* eslint-disable max-len */
	const HELP_TEXT = Object.freeze({
		'#errortext': "You wrote too much. Only three lines of text can be rendered in one dialogue box, anything else would overflow.",
		'#message': "Write a message here to display in the dialogue box with Niko's face.",
		'#faces': "Pick an expression for Niko to make, to accompany your message!",
		'#photoshop': "This is the canvas where the composite image is actually drawn. Right click to save it or copy as an image now.",
		'#render': "This is the fully-rendered image, built off the canvas from the composite elements. You can save it or copy to use now.",
	});
	/* eslint-enable max-len */
	const FACES = {
		Niko: [
			'niko-normal',
			'niko-niko2',
			'niko-niko3',
			'niko-niko4',
			'niko-niko5',
			'niko-niko6',
			'niko-disgusted',
			'niko-distressed',
			'niko-distressed2',
			'niko-distressed_talk',
			'niko-distressed_cry',
			'niko-shock',
			'niko-shocked',
			'niko-what',
			'niko-what2',
			'niko-wtf',
			'niko-wtf2',
			'niko-yawn',
			'niko-eyeclosed',
			'niko-eyeclosed_sigh',
			'niko-sunglasses',
			'niko-popcorn',
			'niko-smile',
			'niko-owo',
			'niko-83c',
			'niko-owoc',
			'niko-uwu',
			'niko-x3',
			'niko-wink',
			'niko-winkc',
			'niko-winkp',
			'niko-derp',
			'niko-derp_flat',
			'niko-speak',
			'niko-pancakes',
			'niko-surprise',
			'niko-shy',
			'niko-blush',
			'niko-blushier',
			'niko-oof',
			'niko-ouch',
			'niko-thinking',
			'niko-fingerguns',
			'niko-gasmask',
			'niko-teary',
			'niko-crying',
			'niko-wipe_tears',
			'niko-upset',
			'niko-upset_meow',
			'niko-upset2',
			'niko-really',
			'niko-rage',
			'niko-creepypasta',
			'niko-xwx',
		],
		"World Machine": [
			'wm-normal',
			//'wm-niko2',
			//'wm-niko3',
			//'wm-niko4',
			//'wm-niko5',
			//'wm-niko6',
			'wm-disgusted',
			'wm-distressed',
			'wm-distressed2',
			'wm-distressed_talk',
			'wm-distressed_cry',
			'wm-shock',
			'wm-shocked',
			'wm-what',
			'wm-what2',
			'wm-wtf',
			'wm-wtf2',
			'wm-yawn',
			'wm-eyeclosed',
			'wm-eyeclosed_sigh',
			//'wm-sunglasses',
			//'wm-popcorn',
			'wm-smile',
			//'wm-owo',
			'wm-83c',
			//'wm-owoc',
			//'wm-uwu',
			//'wm-x3',
			//'wm-wink',
			//'wm-winkc',
			//'wm-winkp',
			//'wm-derp',
			//'wm-derp_flat',
			'wm-speak',
			'wm-pancakes',
			//'wm-surprise',
			//'wm-shy',
			//'wm-blush',
			//'wm-blushier',
			//'wm-oof',
			//'wm-ouch',
			//'wm-thinking',
			//'wm-fingerguns',
			'wm-gasmask',
			'wm-teary',
			'wm-crying',
			'wm-wipe_tears',
			'wm-upset',
			'wm-upset_meow',
			'wm-upset2',
			//'wm-really',
			//'wm-rage',
			//'wm-creepypasta',
			//'wm-xwx',
		],
		Other: [
			'rqst-reee',
			'rqst-melting',
			'rqst-baseball',
		],
	};
	const preloadTimers = [];
	const initialHelpText = $('#helpText').html();
	let unhelpTimer = false;
	const setHelpText = function(text) {
		if (typeof unhelpTimer != 'boolean') {
			clearTimeout(unhelpTimer);
		}
		$('#helpText').html(text || initialHelpText);
	};
	const startClearHelpTimer = function() {
		unhelpTimer = setTimeout(setHelpText, 500);
	};
	const help = (selector, text) => $(selector).hover(
		setHelpText.bind(setHelpText, text),
		startClearHelpTimer
	);
	$('.soften, textarea').addClass('ui-corner-all');
	const error = $('#errortext');
	const canvas = document.querySelector('#photoshop');
	const draw = canvas.getContext('2d');
	const image = document.querySelector('#render');
	const background = new Image();
	const message = document.querySelector('#message');
	const refreshRender = () => {
		let oldData = '';
		let canData = true;
		try {
			oldData = canvas.toDataURL();
		}
		catch (err) {
			canData = false;
		}
		const MAX_LINE_LENGTH = 465; // Magic. Do not change.
		draw.clearRect(0, 0, canvas.width, canvas.height);
		if (background.complete) {
			console.groupCollapsed("Beginning render");
			draw.drawImage(background, 0, 0);
		}
		else {
			// If we haven't got the background image loaded in yet, cancel the render entirely
			console.warn("Aborting render, no background image loaded");
			return;
		}
		// Render the chosen FACE at X=496 Y=16
		// Technically, any 96x96 image will do... so this could be tweakable for future ideas pretty easily
		const face = document.querySelector('#selected');
		if (face) {
			if (!face.complete) {
				face.addEventListener('load', refreshRender);
				console.warn("Selected face not loaded, deferring render");
				console.groupEnd();
				return;
			}
			const faceName = face.className.replace(/\bface\b/gui, '').trim().replace(/\s+/gu, '.');
			console.log(`Drawing face ${faceName}`);
			try {
				draw.drawImage(face, 496, 16);
			}
			catch (err) {
				console.error(err);
				console.dir(face);
				console.groupEnd();
				return;
			}
		}
		else {
			return;
		}
		// Render the text from X=20 Y=17 to X=485 (465px)
		// This 465px is where the magic MAX_LINE_LENGTH constant came from,
		// and why it's that exact number. The top/left start point and font
		// size were carefully determined through testing in GIMP to be the actual values
		// used in the game itself. The multi-line splitting was done manually for a
		// closest-approximation look, but if someone (hi there!) can send me the correct
		// values, it's easy enough to update them in here.
		if (message.value) {
			console.log(`Rendering message:\n${message.value}`);
			// Split on actual line breaks to keep any user-defined lines intact
			const lines = message.value.split("\n");
			// Iterate through the lines, NOT using a foreach loop
			for (let lineNo = 0; lineNo < lines.length; lineNo++) {
				// We can only fit three lines into a single image, more will get cut off
				if (lineNo >= 3) {
					error.show();
					break;
				}
				else {
					error.hide();
				}
				let line = lines[lineNo];
				// Here's a bit of magic - it adds line breaks where needed,
				// but still maintains the user's original line breaks too!
				// If the rendered line is/would be too wide, we split it into
				// words (splitting on whitespace, although I could do more)
				// and slowly snip words off the end, one by one, until the line
				// is within the max width. Then, all of the words that had to be
				// removed are spliced into the lines array immediately following
				// the current line, which is why we had to use the basic for loop
				// above instead of any kind of for/in or for/of method instead,
				// since the array is being modified inside the loop.
				if (draw.measureText(line).width > MAX_LINE_LENGTH) {
					const words = line.split(/\s/u);
					for (let word = words.length; word > 0; word--) {
						const left = words.slice(0, word).join(" ");
						if (draw.measureText(left).width <= MAX_LINE_LENGTH) {
							line = left;
							lines.splice(lineNo + 1, 0, words.slice(word).join(" "));
							break;
						}
					}
				}
				// At this point, the line is either within the max width, or there's no whitespace to split on.
				// The height is a base of 17 pixels down, plus another 28 pixels for every line ABOVE this one.
				// If the line is still too wide (but has no whitespace to split on) then the text is just smushed.
				draw.fillText(line, 20, 17 + lineNo * 28, MAX_LINE_LENGTH);
			}
		}
		else {
			error.hide();
		}
		// See if we can render it to a proper image element, so people can select it on mobile and all browsers
		// (IE is not a browser, do not complain about it being broken)
		if (canData) {
			image.src = canvas.toDataURL();
			image.style.display = 'block';
			canvas.style.display = 'none';
			if (oldData == image.src) { // no change
				for (const timer of preloadTimers) {
					clearTimeout(timer);
				}
			}
		}
		else {
			image.style.display = 'none';
			canvas.style.display = 'block';
		}
		// That's in a try/catch because if you're running this locally, not off a web server,
		// then for security reasons the canvas contents can't be retrieved as a data URL.
		// In order to sneak around that little issue, the image element is only shown (and
		// the canvas hidden automatically) if we CAN get the data URL. Otherwise, if we can't,
		// the canvas element is shown and the image is automatically hidden.
		console.log("Render finished");
		location.hash = [
			face.className.replace(/\bface\b/gui, '').trim(),
			encodeURIComponent(message.value),
		].join("|");
		console.groupEnd();
	};
	const faceListContainer = $('#faces');
	for (const [
		title,
		filenames,
	] of Object.entries(FACES)) {
		const header = $('<div class="face-header"></div>');
		const faceList = $('<div class="face-list"></div>');
		header.text(title);
		for (const filename of filenames) {
			const clazz = `face ${filename.replace(/[^\w-]+/gu, '-')}`;
			const face = $(`<img class="${clazz}" src="img/expressions/${filename}.png" />`);
			faceList.append(face);
		}
		header.on('click', () => {
			const metalist = faceListContainer
				.children('.face-list');
			const headerlist = faceListContainer
				.children('.face-header');
			if (faceList.is(':visible')) {
				metalist
					.hide()
					.first()
					.show();
				headerlist
					.addClass('collapsed')
					.first()
					.removeClass('collapsed');
			}
			else {
				metalist.hide();
				headerlist.addClass('collapsed');
				faceList.show();
				header.removeClass('collapsed');
			}
		});
		faceListContainer.append(header, faceList);
	}
	draw.font = '20pt TerminusTTF'; // Loaded off the css/ directory, in case you don't have it natively
	draw.textBaseline = 'top';
	draw.fillStyle = '#ffffff';
	faceListContainer
		.children('.face-header')
		.not(':first()')
		.click();
	faceListContainer
		.find('img')
		.on('click', function setSelectedFace() {
			$('.face#selected').attr('id', '');
			this.id = 'selected';
			refreshRender();
		});
	const boing = () => {
		message.removeEventListener('input', boing);
		message.addEventListener('input', refreshRender);
		for (const timer of preloadTimers) {
			clearTimeout(timer);
		}
		console.log("haha trampoline function wrapper go boing");
		refreshRender();
	};
	message.addEventListener('input', boing);
	message.focus();
	const frag = location.hash.replace(/^#+/u, '');
	if (frag) {
		const parts = frag.match(/^([\w-]+)\|(.*)$/u);
		if (parts) {
			console.log(`Preloading face ${parts[1]} with message:\n${parts[2]}`);
			const face = document.querySelector(`.face.${parts[1]}`);
			if (face) {
				console.log(`Found face ${parts[1]}`);
				face.id = 'selected';
				message.value = decodeURIComponent(parts[2]);
				for (let i = 100; i <= 1000; i += 100) {
					preloadTimers.push(setTimeout(refreshRender, i));
				}
			}
			else {
				console.error(`Can't find face ${parts[1]}`);
			}
		}
	}
	// As soon as the background image loads, try to render
	background.addEventListener('load', refreshRender);
	background.src = "img/niko-background.png";
	for (const selector in HELP_TEXT) {
		if (Object.prototype.hasOwnProperty.call(HELP_TEXT, selector)) {
			help(selector, HELP_TEXT[selector]);
		}
	}
});

