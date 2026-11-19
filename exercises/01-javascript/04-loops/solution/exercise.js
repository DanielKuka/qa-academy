// Еталонне рішення кати 01-04. Відкривай лише після власної спроби.

export function generateEmails(count, prefix) {
	const emails = [];
	for (let i = 1; i <= count; i++) {
		emails.push(`${prefix}${i}@example.com`);
	}
	return emails;
}

export function retry(fn, attempts) {
	let lastError;
	for (let attempt = 1; attempt <= attempts; attempt++) {
		try {
			return fn(attempt);
		} catch (error) {
			lastError = error;
		}
	}
	throw lastError;
}

export function findFirstFailed(results) {
	for (const result of results) {
		if (result.status === 'failed') {
			return result.name;
		}
	}
	return null;
}
