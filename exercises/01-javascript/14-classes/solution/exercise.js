// Еталонне рішення кати 01-14. Відкривай лише після власної спроби.

export class Cart {
	#items = [];

	// Стрілкове поле: this прив'язаний до екземпляра, тож add можна передавати як колбек.
	add = (product) => {
		const { sku, price, quantity = 1 } = product;
		const existing = this.#items.find((item) => item.sku === sku);
		if (existing) {
			existing.quantity += quantity;
		} else {
			this.#items.push({ sku, price, quantity });
		}
	};

	remove(sku) {
		const index = this.#items.findIndex((item) => item.sku === sku);
		if (index === -1) {
			throw new Error(`No item "${sku}" in cart`);
		}
		this.#items.splice(index, 1);
	}

	get items() {
		return this.#items.map((item) => ({ ...item }));
	}

	get itemCount() {
		return this.#items.reduce((sum, item) => sum + item.quantity, 0);
	}

	get total() {
		return this.#items.reduce((sum, item) => sum + item.price * item.quantity, 0);
	}
}

export class ApiClient {
	constructor(baseUrl) {
		this.baseUrl = baseUrl.endsWith('/') ? baseUrl.slice(0, -1) : baseUrl;
	}

	url(path) {
		const cleanPath = path.startsWith('/') ? path.slice(1) : path;
		return `${this.baseUrl}/${cleanPath}`;
	}

	static forEnv(env) {
		return new ApiClient(`https://${env}.shop.test`);
	}
}

export class User {
	constructor(email, role = 'customer') {
		this.email = email;
		this.role = role;
	}

	get isAdmin() {
		return this.role === 'admin';
	}

	describe() {
		return `${this.email} (${this.role})`;
	}
}

export class AdminUser extends User {
	constructor(email, permissions = []) {
		super(email, 'admin');
		this.permissions = permissions;
	}

	can(permission) {
		return this.permissions.includes(permission);
	}

	describe() {
		return `${super.describe()} [${this.permissions.join(', ')}]`;
	}
}
