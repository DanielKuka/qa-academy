// Еталонне рішення кати 01-01. Відкривай лише після власної спроби.

export const MAX_LOGIN_ATTEMPTS = 3;

export function getType(value) {
	if (value === null) {
		return 'null';
	}
	if (Array.isArray(value)) {
		return 'array';
	}
	return typeof value;
}

export function isEmpty(value) {
	if (value === null || value === undefined) {
		return true;
	}
	if (typeof value === 'string') {
		return value.trim() === '';
	}
	return false;
}
