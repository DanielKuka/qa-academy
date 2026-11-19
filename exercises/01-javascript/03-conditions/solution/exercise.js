// Еталонне рішення кати 01-03. Відкривай лише після власної спроби.

export function getStatusCategory(statusCode) {
	if (!Number.isInteger(statusCode)) {
		return 'unknown';
	}
	if (statusCode < 100 || statusCode > 599) {
		return 'unknown';
	}
	if (statusCode < 200) {
		return 'informational';
	}
	if (statusCode < 300) {
		return 'success';
	}
	if (statusCode < 400) {
		return 'redirect';
	}
	if (statusCode < 500) {
		return 'client error';
	}
	return 'server error';
}

const MIN_PASSWORD_LENGTH = 8;
const MAX_PASSWORD_LENGTH = 64;

export function getPasswordError(password) {
	if (typeof password !== 'string') {
		return 'not-a-string';
	}
	if (password.length < MIN_PASSWORD_LENGTH) {
		return 'too-short';
	}
	if (password.length > MAX_PASSWORD_LENGTH) {
		return 'too-long';
	}
	if (password.includes(' ')) {
		return 'has-spaces';
	}
	if (password.toLowerCase() === password) {
		return 'no-uppercase';
	}
	if (password.toUpperCase() === password) {
		return 'no-lowercase';
	}
	return null;
}

const BADGE_COLORS = {
	passed: 'green',
	failed: 'red',
	broken: 'yellow',
	flaky: 'orange',
	skipped: 'gray',
};

export function getBadgeColor(status) {
	return BADGE_COLORS[status] ?? 'gray';
}
