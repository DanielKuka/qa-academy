// Еталонне рішення кати 01-07. Відкривай лише після власної спроби.

export function last(items) {
	return items[items.length - 1];
}

export function sortPrices(prices) {
	return prices.slice().sort((a, b) => a - b);
}

export function unique(items) {
	const result = [];
	for (const item of items) {
		if (!result.includes(item)) {
			result.push(item);
		}
	}
	return result;
}

export function chunk(items, size) {
	const batches = [];
	for (let i = 0; i < items.length; i += size) {
		batches.push(items.slice(i, i + size));
	}
	return batches;
}

export function arraysEqual(a, b) {
	if (a.length !== b.length) {
		return false;
	}
	for (let i = 0; i < a.length; i++) {
		if (a[i] !== b[i]) {
			return false;
		}
	}
	return true;
}
