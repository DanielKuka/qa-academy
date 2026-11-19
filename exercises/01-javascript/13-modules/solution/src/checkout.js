// Еталонне рішення кати 01-13. Відкривай лише після власної спроби.

import { BASE_URL, DEFAULT_TIMEOUT } from './config.js';
import { findUserByRole } from './data/users.js';

export function buildCheckoutRequest(role, items) {
	const { email } = findUserByRole(role);
	return {
		url: `${BASE_URL}/api/checkout`,
		timeout: DEFAULT_TIMEOUT,
		body: { email, items },
	};
}
