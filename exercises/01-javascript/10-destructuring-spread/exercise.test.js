import { describe, expect, test } from 'vitest';
import { loadExercise } from '../../_lib/load.js';

const { createUser, withoutPassword, splitHeader, formatTestName, updateItemQty } = await loadExercise(
	import.meta.url,
);

const DEFAULT_USER = {
	name: 'Test User',
	email: 'test.user@example.test',
	role: 'viewer',
	isActive: true,
	address: { city: 'Київ', street: 'вул. Хрещатик, 1', zip: '01001' },
};

describe('Завдання 1: createUser', () => {
	test('без аргументів повертає значення за замовчуванням', () => {
		expect(
			createUser(),
			"Перевір назви ключів і значення за замовчуванням у TODO. Виклик без аргументу не повинен падати — тому в параметрі є = {}.",
		).toEqual(DEFAULT_USER);
	});

	test.each([
		{ label: "{ role: 'admin' }", overrides: { role: 'admin' }, key: 'role', expected: 'admin' },
		{ label: '{ isActive: false }', overrides: { isActive: false }, key: 'isActive', expected: false },
		{ label: "{ name: 'Ann' }", overrides: { name: 'Ann' }, key: 'name', expected: 'Ann' },
	])('перевизначення $label', ({ overrides, key, expected }) => {
		const user = createUser(overrides);
		expect(
			user?.[key],
			'Поле з overrides має перемогти значення за замовчуванням. При spread перемагає той, хто стоїть пізніше.',
		).toBe(expected);
		expect(user?.email, 'Решта полів лишається за замовчуванням.').toBe(DEFAULT_USER.email);
	});

	test('додаткові поля з overrides потрапляють у результат', () => {
		expect(createUser({ phone: '+380000000000' })?.phone, 'Поля, яких немає в defaults, теж мають з\'явитися.').toBe(
			'+380000000000',
		);
	});

	test('часткове перевизначення address зберігає решту адреси', () => {
		expect(
			createUser({ address: { city: 'Львів' } })?.address,
			'{ ...defaults, ...overrides } замінить address ЦІЛКОМ, і street та zip зникнуть. Адресу треба злити окремо — тим самим прийомом, але на рівень глибше.',
		).toEqual({ city: 'Львів', street: DEFAULT_USER.address.street, zip: DEFAULT_USER.address.zip });
	});

	test('кожен виклик повертає власний address', () => {
		const first = createUser();
		const second = createUser();
		expect(first, "createUser має повертати об'єкт.").toBeTypeOf('object');
		expect(
			first?.address,
			'Два користувачі ділять ОДИН об\'єкт address. Spread копіює лише верхній рівень — див. «Spread копіює лише верхній рівень» в уроці.',
		).not.toBe(second?.address);
	});

	test('зміна адреси одного користувача не псує наступних', () => {
		const first = createUser();
		expect(first?.address, 'Очікується об\'єкт address.').toBeTypeOf('object');
		first.address.city = 'Одеса';
		expect(
			createUser().address.city,
			'Тест змінив адресу свого користувача — і це побачив наступний createUser(). Значення за замовчуванням не повинні бути спільними між викликами.',
		).toBe('Київ');
	});

	test('не змінює overrides і не ділить з ним address', () => {
		const overrides = { role: 'admin', address: { city: 'Львів' } };
		const user = createUser(overrides);
		expect(overrides, 'createUser не повинен змінювати об\'єкт overrides.').toEqual({
			role: 'admin',
			address: { city: 'Львів' },
		});
		expect(user?.address, 'Очікується об\'єкт address.').toBeTypeOf('object');
		expect(user.address, 'address у результаті має бути новим об\'єктом, а не тим, що прийшов в overrides.').not.toBe(
			overrides.address,
		);
	});
});

describe('Завдання 2: withoutPassword', () => {
	test('прибирає password і лишає решту', () => {
		expect(
			withoutPassword({ id: 1, login: 'ann', password: 'secret', role: 'admin' }),
			'Поверни всі поля, крім password. Згадай rest у деструктуризації об\'єкта.',
		).toEqual({ id: 1, login: 'ann', role: 'admin' });
	});

	test('у результаті немає навіть ключа password', () => {
		const result = withoutPassword({ id: 1, password: 'secret' });
		expect(result, "Очікується об'єкт.").toBeTypeOf('object');
		expect(
			Object.hasOwn(result ?? {}, 'password'),
			'Ключ password має зникнути повністю, а не отримати значення undefined.',
		).toBe(false);
	});

	test('не змінює оригінал', () => {
		const user = { id: 1, login: 'ann', password: 'secret' };
		const result = withoutPassword(user);
		expect(result, "Поверни новий об'єкт.").toBeTypeOf('object');
		expect(user.password, 'Оригінальний user втратив пароль — схоже, тут delete. Використай rest, він не змінює об\'єкт.').toBe(
			'secret',
		);
		expect(result, 'Поверни новий об\'єкт, а не змінений оригінал.').not.toBe(user);
	});
});

describe('Завдання 3: splitHeader', () => {
	test('відділяє заголовок від рядків даних', () => {
		const table = [
			['email', 'role'],
			['a@x.test', 'admin'],
			['b@x.test', 'viewer'],
		];
		expect(
			splitHeader(table),
			'Перший елемент — header, усе інше — rows. Деструктуризація масиву з rest робить це одним рядком.',
		).toEqual({
			header: ['email', 'role'],
			rows: [
				['a@x.test', 'admin'],
				['b@x.test', 'viewer'],
			],
		});
	});

	test('лише заголовок → rows порожній', () => {
		expect(splitHeader([['email']]), 'rows — завжди масив, навіть порожній.').toEqual({ header: ['email'], rows: [] });
	});

	test('порожня таблиця → header undefined, rows []', () => {
		const result = splitHeader([]);
		expect(result, "Очікується об'єкт { header, rows }.").toBeTypeOf('object');
		expect(result?.header, 'У порожній таблиці заголовка немає.').toBeUndefined();
		expect(result?.rows, 'rows — завжди масив, навіть порожній.').toEqual([]);
	});

	test('не змінює вхідну таблицю', () => {
		const table = [['email'], ['a@x.test']];
		splitHeader(table);
		expect(table, 'shift() змінює вихідний масив. Розпакуй його деструктуризацією.').toEqual([['email'], ['a@x.test']]);
	});
});

describe('Завдання 4: formatTestName', () => {
	test.each([
		{
			label: 'suite і title, решта за замовчуванням',
			options: { title: 'pays by card', suite: 'Checkout' },
			expected: '[chromium] Checkout › pays by card',
		},
		{
			label: 'інший browser',
			options: { title: 'pays by card', suite: 'Checkout', browser: 'webkit' },
			expected: '[webkit] Checkout › pays by card',
		},
		{
			label: 'без suite',
			options: { title: 'opens home page' },
			expected: '[chromium] opens home page',
		},
		{
			label: 'retry > 0',
			options: { title: 'pays by card', browser: 'firefox', retry: 2 },
			expected: '[firefox] pays by card (retry 2)',
		},
		{
			label: 'retry: 0 явно',
			options: { title: 'logout', suite: 'Auth', retry: 0 },
			expected: '[chromium] Auth › logout',
		},
	])('$label → $expected', ({ options, expected }) => {
		expect(
			formatTestName(options),
			'Деструктуризуй параметр-об\'єкт із значеннями за замовчуванням (browser, retry). Частина «Suite › » — лише коли suite заданий, « (retry N)» — лише коли retry більше 0.',
		).toBe(expected);
	});

	test('порядок полів в об\'єкті опцій не має значення', () => {
		expect(
			formatTestName({ retry: 1, browser: 'webkit', suite: 'Cart', title: 'adds item' }),
			'Поля об\'єкта беруться за іменами, а не за позицією.',
		).toBe('[webkit] Cart › adds item (retry 1)');
	});
});

describe('Завдання 5: updateItemQty', () => {
	function makeCart() {
		return {
			id: 'c1',
			currency: 'UAH',
			items: [
				{ id: 'p1', name: 'Молоток', qty: 1 },
				{ id: 'p2', name: 'Цвяхи', qty: 3 },
			],
		};
	}

	test('змінює кількість потрібного товару', () => {
		expect(
			updateItemQty(makeCart(), 'p1', 5),
			'Очікується новий кошик, де лише в товару p1 змінилось qty. Інші поля кошика й товару мають лишитися.',
		).toEqual({
			id: 'c1',
			currency: 'UAH',
			items: [
				{ id: 'p1', name: 'Молоток', qty: 5 },
				{ id: 'p2', name: 'Цвяхи', qty: 3 },
			],
		});
	});

	test('не змінює вихідний кошик', () => {
		const cart = makeCart();
		const updated = updateItemQty(cart, 'p2', 10);
		expect(updated, "Очікується об'єкт кошика.").toBeTypeOf('object');
		expect(
			cart,
			'Вихідний кошик змінився. Не присвоюй item.qty = ... — створи новий об\'єкт товару через spread (див. «Незмінне оновлення» в уроці).',
		).toEqual(makeCart());
	});

	test('повертає нові кошик і масив items', () => {
		const cart = makeCart();
		const updated = updateItemQty(cart, 'p1', 2);
		expect(updated, "Очікується об'єкт кошика.").toBeTypeOf('object');
		expect(updated, 'Поверни НОВИЙ об\'єкт кошика.').not.toBe(cart);
		expect(updated.items, 'items має бути новим масивом — його дасть метод, що перетворює кожен елемент.').not.toBe(
			cart.items,
		);
	});

	test('немає такого товару → ті самі товари', () => {
		const cart = makeCart();
		const updated = updateItemQty(cart, 'p404', 7);
		expect(updated, 'Якщо товару немає, вміст кошика не змінюється.').toEqual(makeCart());
		expect(updated, 'Навіть без змін поверни новий об\'єкт кошика.').not.toBe(cart);
	});
});
