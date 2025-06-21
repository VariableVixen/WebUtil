function wrapTextHandlingCallbackForWalkTree(callback) {
	return function(textNode) {
		let replaced = callback(textNode.nodeValue);
		if (replaced === undefined) { return; }
		if (replaced === null) { return; }
		while (typeof replaced == 'function') {
			replaced = replaced();
		}
		if (typeof replaced != 'string') {
			try {
				replaced = replaced.toString();
			}
			catch (e) {
				try {
					replaced = replaced.prototype.toString.call(replaced);
				}
				catch (e) {
					replaced = String(replaced).toString();
				}
			}
		}
		textNode.nodeValue = replaced;
	};
}
function walkTree(node, callback) {
	// I stole this function from the Cloud to Butt addon for Chrome
	// Reportedly, they stole it from http://is.gd/mwZp7E (StackOverflow)
	if (typeof callback != 'function') {
		throw new TypeError('walkTree must be given function as second argument');
	}
	let child, next;
	switch (node.nodeType) {
		case 1: // Element
		case 9: // Document
		case 11: // Document fragment
			child = node.firstChild;
			while (child) {
				next = child.nextSibling;
				walkTree(child, callback);
				child = next;
			}
			break;
		case 3: // Text node
			let tag = node.parentElement.tagName.toLowerCase();
			if (tag != "script" && tag != 'style') {
				callback(node);
			}
			break;
	}
}
