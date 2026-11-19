import { describe, expect, test } from 'vitest';
import { loadExercise } from '../../_lib/load.js';

const { Cart, ApiClient, User, AdminUser } = await loadExercise(import.meta.url);

function catchError(fn) {
	try {
		fn();
	} catch (error) {
		return error;
	}
	return undefined;
}

/** Новий кошик із перевіркою, що методи взагалі є (інакше замість підказки був би TypeError). */
function newCart() {
	const cart = new Cart();
	expect(typeof cart.add, 'У Cart немає методу add(product).').toBe('function');
	expect(typeof cart.remove, 'У Cart немає методу remove(sku).').toBe('function');
	return cart;
}

function newClient(baseUrl) {
	const client = new ApiClient(baseUrl);
	expect(typeof client.url, 'У ApiClient немає методу url(path).').toBe('function');
	return client;
}

describe('Завдання 1: Cart', () => {
	test('новий кошик порожній', () => {
		const cart = newCart();
		expect(cart.items, 'items має бути геттером (get items), що повертає масив позицій.').toEqual([]);
		expect(cart.itemCount, 'Порожній кошик: itemCount — 0. Геттер читається без дужок: cart.itemCount.').toBe(0);
		expect(cart.total, 'Порожній кошик: total — 0.').toBe(0);
	});

	test('add додає позицію, quantity за замовчуванням 1', () => {
		const cart = newCart();
		cart.add({ sku: 'tea', price: 120 });
		expect(cart.items, 'Позиція — об\'єкт { sku, price, quantity }. Якщо quantity не передали, це 1.').toEqual([
			{ sku: 'tea', price: 120, quantity: 1 },
		]);
	});

	test('той самий sku збільшує quantity, а не додає другий рядок', () => {
		const cart = newCart();
		cart.add({ sku: 'tea', price: 120 });
		cart.add({ sku: 'tea', price: 120, quantity: 2 });
		expect(
			cart.items,
			'Для наявного sku знайди позицію (find, урок 08) і збільш її quantity на передану кількість.',
		).toEqual([{ sku: 'tea', price: 120, quantity: 3 }]);
	});

	test('itemCount і total рахують усі позиції', () => {
		const cart = newCart();
		cart.add({ sku: 'tea', price: 120, quantity: 3 });
		cart.add({ sku: 'cup', price: 250 });
		expect(cart.itemCount, 'itemCount — сума quantity, а не кількість різних sku.').toBe(4);
		expect(cart.total, 'total — сума price * quantity всіх позицій.').toBe(610);
	});

	test('remove прибирає позицію повністю', () => {
		const cart = newCart();
		cart.add({ sku: 'tea', price: 120, quantity: 3 });
		cart.add({ sku: 'cup', price: 250 });
		cart.remove('tea');
		expect(cart.items, 'Після remove(sku) позиції з цим sku не має лишитися, навіть якщо quantity було 3.').toEqual([
			{ sku: 'cup', price: 250, quantity: 1 },
		]);
	});

	test('remove невідомого sku кидає зрозумілу помилку', () => {
		const cart = newCart();
		const error = catchError(() => cart.remove('ghost'));
		expect(error, 'Видалення того, чого немає, — ймовірно, баг у тесті. Кинь new Error (урок 12).').toBeInstanceOf(
			Error,
		);
		expect(error?.message, 'Повідомлення: `No item "${sku}" in cart`.').toBe('No item "ghost" in cart');
	});

	test('items повертає копію: зміна ззовні не ламає кошик', () => {
		const cart = newCart();
		cart.add({ sku: 'tea', price: 120 });
		const snapshot = cart.items;
		snapshot.push({ sku: 'hack', price: 0, quantity: 100 });
		snapshot[0].quantity = 999;
		expect(
			cart.itemCount,
			'Геттер items віддає твій внутрішній масив (або ті самі об\'єкти), і тест зміг його змінити. ' +
				'Поверни нові об\'єкти позицій у новому масиві — згадай map і spread (уроки 08 і 10).',
		).toBe(1);
	});

	test('стан зберігається в приватному полі #items', () => {
		const cart = newCart();
		cart.add({ sku: 'tea', price: 120 });
		const publicArrays = Object.keys(cart).filter((key) => Array.isArray(cart[key]));
		expect(
			publicArrays,
			'Масив позицій лежить у публічному полі — його може змінити будь-хто. Оголоси його як #items.',
		).toEqual([]);
	});

	test('add працює, якщо передати його як колбек (this не загублено)', () => {
		const cart = newCart();
		const products = [
			{ sku: 'tea', price: 120 },
			{ sku: 'cup', price: 250 },
		];
		const error = catchError(() => products.forEach(cart.add));
		expect(
			error?.message,
			'products.forEach(cart.add) викликає add без «cart.» попереду, тож this — undefined. ' +
				'Зроби add стрілковим полем класу або прив\'яжи this у конструкторі (bind). Дивись розділ «Як працює this».',
		).toBeUndefined();
		expect(cart.itemCount, 'Обидва товари мають потрапити саме в цей кошик.').toBe(2);
	});

	test('кошики незалежні', () => {
		const first = newCart();
		const second = newCart();
		first.add({ sku: 'tea', price: 120 });
		expect(
			second.itemCount,
			'Другий кошик побачив товар першого. Масив має створюватися для кожного екземпляра (поле класу), а не бути спільним.',
		).toBe(0);
	});
});

describe('Завдання 2: ApiClient', () => {
	test.each([
		{ label: "'https://shop.test'", baseUrl: 'https://shop.test' },
		{ label: "'https://shop.test/' (слеш у кінці)", baseUrl: 'https://shop.test/' },
	])('baseUrl для $label', ({ baseUrl }) => {
		expect(
			new ApiClient(baseUrl).baseUrl,
			'Конструктор зберігає адресу в this.baseUrl без слеша в кінці.',
		).toBe('https://shop.test');
	});

	test.each([
		{ base: 'https://shop.test', path: '/users', expected: 'https://shop.test/users' },
		{ base: 'https://shop.test', path: 'users', expected: 'https://shop.test/users' },
		{ base: 'https://shop.test/', path: '/api/orders/42', expected: 'https://shop.test/api/orders/42' },
		{ base: 'https://shop.test/', path: 'health', expected: 'https://shop.test/health' },
	])("new ApiClient('$base').url('$path') → $expected", ({ base, path, expected }) => {
		expect(
			newClient(base).url(path),
			'Між адресою і шляхом має бути рівно один слеш — ні двох, ні жодного. Використай this.baseUrl.',
		).toBe(expected);
	});

	test('кожен клієнт пам\'ятає свою адресу', () => {
		const prod = newClient('https://shop.test');
		const local = newClient('http://localhost:3000');
		expect(prod.url('/users')).toBe('https://shop.test/users');
		expect(local.url('/users'), 'Адреса має жити в полі екземпляра (this), а не в змінній модуля.').toBe(
			'http://localhost:3000/users',
		);
	});

	test('static forEnv створює клієнт для середовища', () => {
		expect(
			typeof ApiClient.forEnv,
			'forEnv має бути СТАТИЧНИМ методом: виклик ApiClient.forEnv(...), без new. Дивись розділ «Статичні члени».',
		).toBe('function');
		const staging = ApiClient.forEnv('staging');
		expect(staging, 'forEnv має повертати new ApiClient(...).').toBeInstanceOf(ApiClient);
		expect(staging.baseUrl).toBe('https://staging.shop.test');
		expect(staging.url('/login')).toBe('https://staging.shop.test/login');
	});
});

describe('Завдання 3: User і AdminUser', () => {
	test('User зберігає email і роль, роль за замовчуванням — customer', () => {
		const user = new User('ann@shop.test');
		expect(user.email, 'Конструктор має записати email у this.email.').toBe('ann@shop.test');
		expect(user.role, "Якщо роль не передали, вона 'customer' — параметр за замовчуванням (урок 05).").toBe(
			'customer',
		);
		expect(new User('boss@shop.test', 'manager').role).toBe('manager');
	});

	test.each([
		{ role: 'admin', expected: true },
		{ role: 'customer', expected: false },
		{ role: 'manager', expected: false },
	])("isAdmin для ролі '$role' → $expected", ({ role, expected }) => {
		expect(
			new User('x@shop.test', role).isAdmin,
			'isAdmin — геттер (get isAdmin), читається без дужок і повертає boolean.',
		).toBe(expected);
	});

	test('describe() повертає «email (роль)»', () => {
		const user = new User('ann@shop.test');
		expect(typeof user.describe, 'У User немає методу describe().').toBe('function');
		expect(user.describe()).toBe('ann@shop.test (customer)');
	});

	test('AdminUser — це User з роллю admin', () => {
		const admin = new AdminUser('root@shop.test', ['users:delete']);
		expect(admin, 'AdminUser має наслідувати User (extends).').toBeInstanceOf(User);
		expect(admin.email, 'Передай email у батьківський конструктор через super(...).').toBe('root@shop.test');
		expect(admin.role, "Роль AdminUser завжди 'admin' — передай її другим аргументом у super.").toBe('admin');
		expect(admin.isAdmin, 'Геттер isAdmin успадковується від User — переписувати його не треба.').toBe(true);
		expect(admin.permissions).toEqual(['users:delete']);
	});

	test('permissions за замовчуванням — порожній масив', () => {
		expect(new AdminUser('root@shop.test').permissions, 'Якщо права не передали, permissions — [].').toEqual([]);
	});

	test.each([
		{ permission: 'users:delete', expected: true },
		{ permission: 'orders:refund', expected: true },
		{ permission: 'db:drop', expected: false },
	])("can('$permission') → $expected", ({ permission, expected }) => {
		const admin = new AdminUser('root@shop.test', ['users:delete', 'orders:refund']);
		expect(typeof admin.can, 'У AdminUser немає методу can(permission).').toBe('function');
		expect(admin.can(permission), 'can перевіряє, чи є право в this.permissions (includes, урок 07).').toBe(expected);
	});

	test('describe() розширює батьківський метод', () => {
		const admin = new AdminUser('root@shop.test', ['users:delete', 'orders:refund']);
		expect(typeof admin.describe, 'describe() має успадковуватися від User або бути перевизначеним у AdminUser.').toBe(
			'function',
		);
		expect(
			admin.describe(),
			"Формат: батьківський describe() + ' [' + права через кому з пробілом + ']'. Виклич батьківський метод через super.describe().",
		).toBe('root@shop.test (admin) [users:delete, orders:refund]');
		expect(
			new User('ann@shop.test').describe(),
			'describe() звичайного User не повинен змінитися через AdminUser.',
		).toBe('ann@shop.test (customer)');
	});
});
