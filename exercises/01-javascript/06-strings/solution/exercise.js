// Еталонне рішення кати 01-06. Відкривай лише після власної спроби.

export function normalizeText(text) {
	return text.replaceAll(/\s+/g, ' ').trim();
}

export function isSameText(actual, expected) {
	return normalizeText(actual).toLowerCase() === normalizeText(expected).toLowerCase();
}

export function parseCartCount(label) {
	const start = label.indexOf('(');
	const end = label.indexOf(')');
	if (start === -1 || end === -1) {
		return 0;
	}
	return Number(label.slice(start + 1, end));
}

export function maskCardNumber(cardNumber) {
	const digits = cardNumber.replaceAll(' ', '').replaceAll('-', '');
	return `**** **** **** ${digits.slice(-4)}`;
}

const PUNCTUATION = '.,!?:;"«»()';

export function slugify(title) {
	let cleaned = '';
	for (const char of title.toLowerCase()) {
		if (!PUNCTUATION.includes(char)) {
			cleaned = cleaned + char;
		}
	}
	return normalizeText(cleaned).replaceAll(' ', '-');
}

export function buildUrl(base, path) {
	const cleanBase = base.endsWith('/') ? base.slice(0, -1) : base;
	const cleanPath = path.startsWith('/') ? path.slice(1) : path;
	return `${cleanBase}/${cleanPath}`;
}
