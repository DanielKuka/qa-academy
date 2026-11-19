// Еталонне рішення кати 01-09. Відкривай лише після власної спроби.

export function pick(obj, keys) {
	const result = {};
	for (const key of keys) {
		if (Object.hasOwn(obj, key)) {
			result[key] = obj[key];
		}
	}
	return result;
}

export function missingFields(response, requiredFields) {
	return requiredFields.filter((field) => !Object.hasOwn(response, field));
}

export function countKeys(obj) {
	return Object.keys(obj).length;
}

export function getByPath(obj, path) {
	return path.split('.').reduce((current, key) => current?.[key], obj);
}

function isObjectLike(value) {
	return typeof value === 'object' && value !== null;
}

export function deepEqual(a, b) {
	if (a === b) {
		return true;
	}
	if (!isObjectLike(a) || !isObjectLike(b)) {
		return false;
	}
	if (Array.isArray(a) !== Array.isArray(b)) {
		return false;
	}

	const keysA = Object.keys(a);
	const keysB = Object.keys(b);
	if (keysA.length !== keysB.length) {
		return false;
	}
	return keysA.every((key) => Object.hasOwn(b, key) && deepEqual(a[key], b[key]));
}
