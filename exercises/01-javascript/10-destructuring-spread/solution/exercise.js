// Еталонне рішення кати 01-10. Відкривай лише після власної спроби.

export function createUser(overrides = {}) {
	// Значення за замовчуванням створюються заново при кожному виклику,
	// тож вкладений address ніколи не буде спільним між користувачами.
	const defaults = {
		name: 'Test User',
		email: 'test.user@example.test',
		role: 'viewer',
		isActive: true,
		address: { city: 'Київ', street: 'вул. Хрещатик, 1', zip: '01001' },
	};

	return {
		...defaults,
		...overrides,
		address: { ...defaults.address, ...overrides.address },
	};
}

export function withoutPassword(user) {
	const { password, ...rest } = user;
	return rest;
}

export function splitHeader(table) {
	const [header, ...rows] = table;
	return { header, rows };
}

export function formatTestName({ title, suite, browser = 'chromium', retry = 0 } = {}) {
	const path = suite ? `${suite} › ${title}` : title;
	const retryNote = retry > 0 ? ` (retry ${retry})` : '';
	return `[${browser}] ${path}${retryNote}`;
}

export function updateItemQty(cart, productId, qty) {
	return {
		...cart,
		items: cart.items.map((item) => (item.id === productId ? { ...item, qty } : item)),
	};
}
