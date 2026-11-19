// Еталонне рішення кати 01-02. Відкривай лише після власної спроби.

export function toCents(amount) {
	return Math.round(amount * 100);
}

export function calcTotal(price, qty, discountPercent) {
	const discount = discountPercent ?? 0;
	const subtotalCents = toCents(price) * qty;
	const totalCents = Math.round((subtotalCents * (100 - discount)) / 100);
	return totalCents / 100;
}

export function getDisplayName(user) {
	return user?.nickname || user?.name || 'Гість';
}

export function getDiscountPercent(user) {
	return user?.loyalty?.discountPercent ?? 5;
}
