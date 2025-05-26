const JOBS = {
	GLA: "Gladiator",
	PLD: "Paladin",
	MRD: "Marauder",
	WAR: "Warrior",
	DRK: "Dark Knight",
	GNB: "Gunbreaker",
	CNJ: "Conjurer",
	WHM: "White Mage",
	SCH: "Scholar",
	AST: "Astrologian",
	PUG: "Pugilist",
	MNK: "Monk",
	LNC: "Lancer",
	DRG: "Dragoon",
	ROG: "Rogue",
	NIN: "Ninja",
	SAM: "Samurai",
	ARC: "Archer",
	BRD: "Bard",
	MCH: "Machinist",
	DNC: "Dancer",
	THM: "Thaumaturge",
	BLM: "Black Mage",
	ACN: "Arcanist",
	SMN: "Summoner",
	RDM: "Red Mage",
	BLU: "Blue Mage",
	RPR: "Reaper",
	SGE: "Sage",
	VPR: "Viper",
	PCT: "Pictomancer",
};

Object.defineProperty(window, 'DEBUG_MODE', {
	writable: true,
	value: location.hash.replace(/^#+/u, '') == "debug",
});

const q = (s, b) => (b || document).querySelector(s);
const qa = (s, b) => (b || document).querySelectorAll(s);
const e = document.createElement.bind(document);

const debug = Object.create(null);
// Initialise the debug logger - basically console.* except it only runs if window.DEBUG_MODE is truthy
for (const k of Object.keys(console)) {
	debug[k] = (...varargs) => {
		if (window.DEBUG_MODE) {
			console[k](...varargs);
		}
	};
}
Object.freeze(debug);
debug.log("Debug mode enabled"); // won't actually show unless it's true!

const output = q('#macros');
const inputs = q('#jobs');

const generate = () => {
	const chosen = q(':checked', inputs);
	if (!chosen) {
		return;
	}
	const target = q('#target').value;
	const job = chosen.value;
	debug.log(`Generating macros for ${job} (${JOBS[job]})`);
	const lines = [
		"Each chunk of text is one macro.",
		"The first is to open, the second is the PAIRED closer.",
		"The closer should be placed ON the associated \"menu\" hotbar somewhere.",
		"You can click inside a chunk to automatically select the entire chunk for copying.",
	];
	for (let bar = 1; bar <= 10; ++bar) {
		lines.push("");
		lines.push("");
		lines.push("/macrolock");
		lines.push(`/hotbar copy ${job} ${bar} share ${target}`);
		lines.push(`/hotbar display ${target} on`);
		lines.push("");
		lines.push("/macrolock");
		lines.push(`/hotbar copy share ${target} ${job} ${bar}`);
		lines.push(`/hotbar display ${target} off`);
	}
	output.textContent = lines.join("\n");
	output.setSelectionRange(0, 0);
};
const selectGroup = () => {
	debug.log("Attempting to select text block");
	if (typeof output.selectionStart == "undefined") {
		debug.error("Cannot find .selectionStart");
		return;
	}
	if (output.selectionStart != output.selectionEnd) { // Not if the user selected actual text
		debug.warn("User has selected text, aborting");
		return;
	}
	const text = output.textContent;
	// Need to find the nearest EMPTY lines (two or more breaks in a row) both BEFORE and AFTER the click
	let firstBlankIdx = text.slice(0, output.selectionStart).lastIndexOf("\n\n");
	if (firstBlankIdx > 0) {
		firstBlankIdx += 2;
	}
	else {
		firstBlankIdx = 0;
	}
	let lastBlankIdx = text.slice(output.selectionStart).indexOf("\n\n");
	if (lastBlankIdx < 0) {
		lastBlankIdx = text.length;
	}
	else {
		lastBlankIdx += output.selectionStart;
	}
	debug.log(`Start index = ${firstBlankIdx}, end index = ${lastBlankIdx}`);
	output.selectionStart = firstBlankIdx;
	output.selectionEnd = lastBlankIdx;
};
output.addEventListener('click', selectGroup);

const getHelpButton = e('label');
getHelpButton.textContent = "❔ Help";
getHelpButton.id = "display-help";
getHelpButton.addEventListener('click', () => {
	for (const radio of qa('input', inputs)) {
		radio.checked = false;
	}
	output.textContent = [
		"Select a class on the side to generate ten paired open/close hotbar macros,"
			+ " using the chosen class's hotbars as storage.",
		"",
		"Please note that you MUST choose a class you DO NOT USE!"
			+ " All of the chosen class's hotbars will be REPLACED with the menu bars you create.",
		"",
		"At the bottom of the class selection list,"
			+ " you can choose which of your UI hotbars will be used to display the menu bars.",
		"This UI hotbar should be marked as SHARED,"
			+ " because its contents will be REPLACED with each menu bar you open from the generated macros.",
	].join("\n");
});
inputs.append(getHelpButton, e('br'), e('br'));

for (const [
	job,
	name,
] of Object.entries(JOBS)) {
	debug.log(`Building job selector for ${name} (${job})`);
	const radio = e('input');
	const label = e('label');
	radio.type = "radio";
	radio.name = "job";
	radio.value = job;
	label.textContent = name.replace(/\s+/u, "\u00A0");
	label.htmlFor = radio.id = `job-${job.toLowerCase()}`; // eslint-disable-line no-multi-assign
	radio.addEventListener('input', generate);
	inputs.append(
		radio,
		label,
		e('br')
	);
}

const targetBarLabel = e('label');
const targetBarSelector = e('select');
targetBarLabel.htmlFor = targetBarSelector.id = "target"; // eslint-disable-line no-multi-assign
for (let bar = 1; bar <= 10; ++bar) {
	const option = e('option');
	option.value = bar;
	option.textContent = `hotbar #${bar}`;
	targetBarSelector.append(option);
}
targetBarSelector.value = targetBarSelector.children.length;
targetBarSelector.addEventListener('input', generate);
targetBarLabel.append("Use ", targetBarSelector, " for the menu");
inputs.append(targetBarLabel);

output.readOnly = true;
getHelpButton.click();

q('#container').style.visibility = "visible";

