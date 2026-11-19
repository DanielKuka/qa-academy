// Еталонне рішення кати 01-13. Відкривай лише після власної спроби.

const users = [
	{ role: 'admin', email: 'admin@shop.test', password: 'Admin123!' },
	{ role: 'customer', email: 'customer@shop.test', password: 'Customer123!' },
	{ role: 'manager', email: 'manager@shop.test', password: 'Manager123!' },
];

export function findUserByRole(role) {
	const user = users.find((candidate) => candidate.role === role);
	if (!user) {
		throw new Error(`No test user with role "${role}"`);
	}
	return user;
}

export default users;
