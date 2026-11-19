import { describe, expect, test } from 'vitest';
import { loadExercise } from '../../_lib/load.js';

const { toCents, calcTotal, getDisplayName, getDiscountPercent } = await loadExercise(import.meta.url);

describe('Завдання 1: toCents', () => {
	test.each([
		{ label: '100', amount: 100, expected: 10000 },
		{ label: '19.99', amount: 19.99, expected: 1999 },
		{ label: '0.1', amount: 0.1, expected: 10 },
		{ label: '0', amount: 0, expected: 0 },
	])('toCents($label) → $expected', ({ amount, expected }) => {
		expect(toCents(amount), 'Одна гривня — це 100 копійок. Помнож суму на 100.').toBe(expected);
	});

	test.each([
		{ label: '1.15', amount: 1.15, expected: 115 },
		{ label: '4.35', amount: 4.35, expected: 435 },
	])('toCents($label) → $expected — без хвоста плаваючої крапки', ({ amount, expected }) => {
		const result = toCents(amount);
		expect(
			Number.isInteger(result),
			'Копійки мають бути цілим числом. Множення дробу на 100 дає похибку (114.99999999999999) — її треба округлити. Див. розділ уроку «Пастка чисел з плаваючою крапкою».',
		).toBe(true);
		expect(
			result,
			'Округлення має бути до НАЙБЛИЖЧОГО цілого. Math.floor і Math.trunc відкидають дробову частину — 114.999… стане 114.',
		).toBe(expected);
	});
});

describe('Завдання 2: calcTotal', () => {
	test('повертає число, а не рядок', () => {
		expect(
			typeof calcTotal(10, 1, 0),
			'Сума має бути числом. Якщо бачиш "string" — ти використав toFixed: він лише для показу на екрані.',
		).toBe('number');
	});

	test.each([
		{ label: '0.1 × 3', price: 0.1, qty: 3, expected: 0.3 },
		{ label: '1.1 × 3', price: 1.1, qty: 3, expected: 3.3 },
	])('$label без знижки → $expected', ({ price, qty, expected }) => {
		expect(
			calcTotal(price, qty),
			'Похибка плаваючої крапки потрапила в суму. Рахуй у копійках через toCents і діли на 100 лише наприкінці. Також перевір, що відсутня знижка (undefined) не ламає розрахунок — див. оператор ??.',
		).toBe(expected);
	});

	test.each([
		{ label: '100 × 2, знижка 0', price: 100, qty: 2, discount: 0, expected: 200 },
		{ label: '19.99 × 3, знижка 10 %', price: 19.99, qty: 3, discount: 10, expected: 53.97 },
		{ label: '9.99 × 3, знижка 15 %', price: 9.99, qty: 3, discount: 15, expected: 25.47 },
		{ label: '250 × 1, знижка 100 %', price: 250, qty: 1, discount: 100, expected: 0 },
		{ label: '49.5 × 0, знижка 20 %', price: 49.5, qty: 0, discount: 20, expected: 0 },
	])('$label → $expected', ({ price, qty, discount, expected }) => {
		expect(
			calcTotal(price, qty, discount),
			'Знижка в N % означає, що клієнт платить (100 − N) % від суми. Округли результат до цілих копійок через Math.round, потім переведи в гривні.',
		).toBe(expected);
	});
});

describe('Завдання 3: getDisplayName', () => {
	test.each([
		{ label: "{ nickname: 'qa_ninja', name: 'Anna' }", user: { nickname: 'qa_ninja', name: 'Anna' }, expected: 'qa_ninja' },
		{ label: "{ name: 'Anna' }", user: { name: 'Anna' }, expected: 'Anna' },
		{ label: "{ nickname: null, name: 'Anna' }", user: { nickname: null, name: 'Anna' }, expected: 'Anna' },
	])("getDisplayName($label) → '$expected'", ({ user, expected }) => {
		expect(getDisplayName(user), 'Спершу нікнейм, якщо його немає — ім\'я.').toBe(expected);
	});

	test("порожній нікнейм '' пропускається", () => {
		expect(
			getDisplayName({ nickname: '', name: 'Anna' }),
			"Порожній рядок тут означає «не заповнено». Оператор ?? вважає '' нормальним значенням — подумай, який логічний оператор пропускає всі falsy-значення.",
		).toBe('Anna');
	});

	test.each([
		{ label: "{ nickname: '', name: '' }", user: { nickname: '', name: '' } },
		{ label: '{}', user: {} },
		{ label: 'null', user: null },
		{ label: 'undefined', user: undefined },
	])("getDisplayName($label) → 'Гість'", ({ user }) => {
		let result;
		expect(
			() => {
				result = getDisplayName(user);
			},
			'Функція впала з TypeError: не можна читати властивість у null чи undefined. Див. опціональний ланцюжок ?. в уроці.',
		).not.toThrow();
		expect(result, "Якщо немає ні нікнейму, ні імені (або користувача взагалі), поверни 'Гість'.").toBe('Гість');
	});
});

describe('Завдання 4: getDiscountPercent', () => {
	test('знижка 15 → 15', () => {
		expect(getDiscountPercent({ loyalty: { discountPercent: 15 } }), 'Поверни значення з user.loyalty.discountPercent.').toBe(15);
	});

	test('знижка 0 лишається нулем', () => {
		expect(
			getDiscountPercent({ loyalty: { discountPercent: 0 } }),
			'0 — валідна знижка, а отримано типову 5. Оператор || вважає 0 «нічим». Див. розділ уроку «?? проти ||».',
		).toBe(0);
	});

	test.each([
		{ label: '{ loyalty: { discountPercent: null } }', user: { loyalty: { discountPercent: null } } },
		{ label: '{ loyalty: null }', user: { loyalty: null } },
		{ label: '{}', user: {} },
		{ label: 'null', user: null },
		{ label: 'undefined', user: undefined },
	])('getDiscountPercent($label) → 5', ({ user }) => {
		let result;
		expect(
			() => {
				result = getDiscountPercent(user);
			},
			'Функція впала з TypeError на відсутньому вкладеному полі. Див. опціональний ланцюжок ?. в уроці.',
		).not.toThrow();
		expect(result, 'Якщо знижку не задано (null або undefined на будь-якому рівні), поверни типову 5.').toBe(5);
	});
});
