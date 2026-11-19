import { describe, expect, test } from 'vitest';
import { loadExercise } from '../../_lib/load.js';

const { pick, missingFields, countKeys, getByPath, deepEqual } = await loadExercise(import.meta.url);

function makeResponse() {
	return {
		id: 42,
		name: 'Ann',
		middleName: null,
		token: 'secret',
		user: {
			email: 'ann@example.test',
			address: { city: 'Київ', zip: '01001' },
		},
		items: [{ id: 7, qty: 2 }, { id: 9, qty: 1 }],
	};
}

describe("Завдання 1: pick", () => {
	test('бере лише вказані ключі', () => {
		expect(
			pick(makeResponse(), ['id', 'name']),
			"Поверни новий об'єкт лише з ключами зі списку keys.",
		).toEqual({ id: 42, name: 'Ann' });
	});

	test('не додає ключі, яких немає в obj', () => {
		const result = pick({ id: 1 }, ['id', 'email']);
		expect(result, "Очікується об'єкт.").toBeTypeOf('object');
		expect(
			Object.keys(result ?? {}),
			"Ключа email в obj немає — у результаті його теж не має бути (навіть зі значенням undefined). Перевіряй наявність ключа, а не значення.",
		).toEqual(['id']);
	});

	test('зберігає ключ зі значенням null', () => {
		expect(
			pick(makeResponse(), ['middleName']),
			"middleName є в об'єкті, просто його значення null. Перевірка через truthy/falsy тут хибна — див. «Чи є ключ» в уроці.",
		).toEqual({ middleName: null });
	});

	test("повертає новий об'єкт і не змінює вхідний", () => {
		const response = makeResponse();
		const result = pick(response, ['id']);
		expect(result, "Очікується об'єкт.").toBeTypeOf('object');
		expect(result, "Поверни новий об'єкт, а не той самий, що прийшов на вхід.").not.toBe(response);
		expect(response, "Вхідний об'єкт не можна змінювати — не видаляй з нього ключі.").toEqual(makeResponse());
	});
});

describe('Завдання 2: missingFields', () => {
	test('знаходить відсутні поля', () => {
		expect(
			missingFields(makeResponse(), ['id', 'email', 'name', 'createdAt']),
			'Поверни назви полів, чиїх КЛЮЧІВ немає у верхньому рівні відповіді, у порядку списку.',
		).toEqual(['email', 'createdAt']);
	});

	test.each([
		{ label: 'null', response: { id: 1, middleName: null } },
		{ label: 'undefined', response: { id: 1, middleName: undefined } },
		{ label: "''", response: { id: 1, middleName: '' } },
		{ label: '0', response: { id: 1, middleName: 0 } },
	])('поле зі значенням $label — присутнє', ({ response }) => {
		expect(
			missingFields(response, ['id', 'middleName']),
			"Ключ middleName є в об'єкті, тож поле присутнє. Порівняння з undefined чи перевірка !value тут бреше — використай Object.hasOwn.",
		).toEqual([]);
	});

	test('нічого не бракує → []', () => {
		expect(missingFields(makeResponse(), ['id', 'name']), 'Якщо все на місці, поверни порожній масив.').toEqual([]);
	});

	test('не плутає власні ключі з успадкованими', () => {
		expect(
			missingFields({}, ['toString', 'constructor']),
			"Оператор in бачить успадковані ключі на кшталт toString. Нас цікавлять лише власні ключі відповіді.",
		).toEqual(['toString', 'constructor']);
	});
});

describe('Завдання 3: countKeys', () => {
	test.each([
		{ label: '{}', obj: {}, expected: 0 },
		{ label: '{ id, name }', obj: { id: 1, name: 'Ann' }, expected: 2 },
		{ label: 'ключ зі значенням undefined', obj: { id: 1, note: undefined }, expected: 2 },
		{ label: 'відповідь з вкладеними об\'єктами', obj: makeResponse(), expected: 6 },
	])('countKeys($label) → $expected', ({ obj, expected }) => {
		expect(
			countKeys(obj),
			"У об'єкта немає length. Отримай масив його ключів і візьми довжину. Рахуються лише ключі верхнього рівня.",
		).toBe(expected);
	});
});

describe('Завдання 4: getByPath', () => {
	test.each([
		{ path: 'id', expected: 42 },
		{ path: 'user.email', expected: 'ann@example.test' },
		{ path: 'user.address.city', expected: 'Київ' },
		{ path: 'items.1.id', expected: 9 },
		{ path: 'middleName', expected: null },
	])("getByPath(response, '$path') → $expected", ({ path, expected }) => {
		expect(
			getByPath(makeResponse(), path),
			'Розбий шлях на частини і по черзі заходь углиб об\'єкта. Ключ береться зі змінної — тож потрібні квадратні дужки, а не крапка.',
		).toEqual(expected);
	});

	test.each([
		{ label: 'неіснуючий ключ', obj: makeResponse(), path: 'phone' },
		{ label: 'неіснуюча гілка', obj: makeResponse(), path: 'user.company.name' },
		{ label: 'null посередині шляху', obj: { user: null }, path: 'user.address.city' },
		{ label: 'індекс поза масивом', obj: makeResponse(), path: 'items.5.id' },
	])('$label → undefined без помилки', ({ obj, path }) => {
		expect(
			() => getByPath(obj, path),
			'Звернення до властивості undefined або null кидає TypeError. Згадай оператор ?. з уроку 02.',
		).not.toThrow();
		expect(getByPath(obj, path), 'Якщо шлях обривається, поверни undefined.').toBeUndefined();
	});
});

describe('Завдання 5: deepEqual', () => {
	test.each([
		{ label: 'однакові числа', a: 1, b: 1 },
		{ label: 'однакові рядки', a: 'ok', b: 'ok' },
		{ label: 'null і null', a: null, b: null },
		{ label: 'плоскі об\'єкти', a: { id: 1, name: 'Ann' }, b: { id: 1, name: 'Ann' } },
		{ label: 'інший порядок ключів', a: { id: 1, name: 'Ann' }, b: { name: 'Ann', id: 1 } },
		{ label: 'масиви', a: [1, 'two', null], b: [1, 'two', null] },
		{ label: 'порожні {} і {}', a: {}, b: {} },
		{ label: 'повна відповідь API', a: makeResponse(), b: makeResponse() },
	])('$label → true', ({ a, b }) => {
		expect(
			deepEqual(a, b),
			'Значення однакові за вмістом. Пам\'ятай: === для об\'єктів і масивів порівнює посилання — тож порівнюй ключ за ключем, а для вкладених значень виклич deepEqual ще раз.',
		).toBe(true);
	});

	test.each([
		{ label: 'різні числа', a: 1, b: 2 },
		{ label: "'1' і 1", a: '1', b: 1 },
		{ label: 'різне значення', a: { id: 1 }, b: { id: 2 } },
		{ label: 'зайвий ключ у b', a: { id: 1 }, b: { id: 1, extra: true } },
		{ label: 'зайвий ключ в a', a: { id: 1, extra: true }, b: { id: 1 } },
		{ label: 'різні ключі з undefined', a: { x: undefined }, b: { y: undefined } },
		{ label: 'null і {}', a: null, b: {} },
		{ label: '{} і null', a: {}, b: null },
		{ label: '[] і {}', a: [], b: {} },
		{ label: "['a'] і { 0: 'a' }", a: ['a'], b: { 0: 'a' } },
		{ label: 'різна довжина масивів', a: [1, 2], b: [1, 2, 3] },
		{ label: 'інший порядок у масиві', a: [1, 2], b: [2, 1] },
		{ label: 'різниця глибоко всередині', a: makeResponse(), b: { ...makeResponse(), user: { email: 'ann@example.test', address: { city: 'Львів', zip: '01001' } } } },
		{ label: 'різниця в елементі масиву', a: { items: [{ id: 7 }] }, b: { items: [{ id: 8 }] } },
	])('$label → false', ({ a, b }) => {
		expect(
			deepEqual(a, b),
			'Значення відрізняються. Перевір: чи однаковий набір ключів (в обидва боки), чи не плутаєш масив зі звичайним об\'єктом, чи null обробляється окремо (typeof null — \'object\'), чи порівнюються вкладені рівні.',
		).toBe(false);
	});

	test('не змінює вхідні дані', () => {
		const a = makeResponse();
		const b = makeResponse();
		deepEqual(a, b);
		expect(a, 'deepEqual має лише читати об\'єкти.').toEqual(makeResponse());
		expect(b, 'deepEqual має лише читати об\'єкти.').toEqual(makeResponse());
	});
});
