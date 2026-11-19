// Еталонне рішення кати 01-11. Відкривай лише після власної спроби.

export function createIdGenerator(prefix) {
	let lastId = 0;
	return () => {
		lastId++;
		return `${prefix}-${lastId}`;
	};
}

export function createCounter() {
	let count = 0;
	return {
		increment() {
			count++;
			return count;
		},
		reset() {
			count = 0;
		},
		value() {
			return count;
		},
	};
}

export function once(fn) {
	let called = false;
	let result;
	return (...args) => {
		if (!called) {
			called = true;
			result = fn(...args);
		}
		return result;
	};
}

export function memoize(fn) {
	const cache = {};
	return (key) => {
		if (!Object.hasOwn(cache, key)) {
			cache[key] = fn(key);
		}
		return cache[key];
	};
}
