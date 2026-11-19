// Еталонне рішення кати 01-12. Відкривай лише після власної спроби.

export function assertEqual(actual, expected, message) {
	if (actual !== expected) {
		throw new Error(`${message}: expected ${JSON.stringify(expected)}, received ${JSON.stringify(actual)}`);
	}
}

export function safeJsonParse(text) {
	try {
		return { ok: true, data: JSON.parse(text) };
	} catch (error) {
		return { ok: false, error };
	}
}

export function parsePrice(text) {
	if (typeof text !== 'string') {
		throw new TypeError(`Price must be a string, got ${typeof text}`);
	}
	const cleaned = text.replaceAll('₴', '').trim();
	const price = Number(cleaned);
	if (cleaned === '' || Number.isNaN(price)) {
		throw new TypeError(`Invalid price: "${text}"`);
	}
	if (price < 0) {
		throw new RangeError(`Price cannot be negative: "${text}"`);
	}
	return price;
}

export function withCleanup(action, cleanup) {
	try {
		return action();
	} finally {
		cleanup();
	}
}

export function loadFixture(name, text) {
	try {
		return JSON.parse(text);
	} catch (error) {
		throw new Error(`Fixture "${name}" is not valid JSON`, { cause: error });
	}
}
