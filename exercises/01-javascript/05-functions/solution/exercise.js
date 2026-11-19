// Еталонне рішення кати 01-05. Відкривай лише після власної спроби.

export function buildUser(name, role = 'customer') {
	return { name: name, role: role };
}

export function formatTestName(id, title) {
	return 'TC-' + id + ': ' + title;
}

export const calculateLineTotal = (price, quantity) => price * quantity;

export function countMatching(items, predicate) {
	let count = 0;
	for (const item of items) {
		if (predicate(item)) {
			count = count + 1;
		}
	}
	return count;
}

export function negate(predicate) {
	return (value) => !predicate(value);
}
