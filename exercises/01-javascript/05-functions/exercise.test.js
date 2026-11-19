import { describe, expect, test, vi } from 'vitest';
import { loadExercise } from '../../_lib/load.js';

const { buildUser, formatTestName, calculateLineTotal, countMatching, negate } = await loadExercise(import.meta.url);

describe('Завдання 1: buildUser', () => {
	test("buildUser('Eve', 'admin') → { name: 'Eve', role: 'admin' }", () => {
		expect(
			buildUser('Eve', 'admin'),
			'Функція має ПОВЕРТАТИ об\'єкт з полями name і role. Якщо бачиш undefined — перевір, чи є return.',
		).toEqual({ name: 'Eve', role: 'admin' });
	});

	test.each([
		{ label: "buildUser('Ann')", args: ['Ann'], expected: { name: 'Ann', role: 'customer' } },
		{ label: "buildUser('Bob', undefined)", args: ['Bob', undefined], expected: { name: 'Bob', role: 'customer' } },
	])("$label → роль 'customer' за замовчуванням", ({ args, expected }) => {
		expect(
			buildUser(...args),
			"Коли роль не передали (або передали undefined), вона має бути 'customer'. Див. «Параметри за замовчуванням» в уроці.",
		).toEqual(expected);
	});

	test('кожен виклик повертає новий об\'єкт', () => {
		const first = buildUser('Ann');
		const second = buildUser('Ann');
		expect(typeof first, "Спершу зроби так, щоб buildUser повертала об'єкт (див. тести вище).").toBe('object');
		expect(
			first === second,
			'Два виклики мають повертати два різні об\'єкти. Не зберігай користувача у змінній поза функцією — створюй новий об\'єкт усередині.',
		).toBe(false);
	});
});

describe('Завдання 2: formatTestName', () => {
	test.each([
		{ id: 17, title: 'Вхід з валідним паролем', expected: 'TC-17: Вхід з валідним паролем' },
		{ id: 3, title: 'Порожній кошик', expected: 'TC-3: Порожній кошик' },
		{ id: 120, title: 'API: 404 для неіснуючого товару', expected: 'TC-120: API: 404 для неіснуючого товару' },
	])('formatTestName($id, "$title") → "$expected"', ({ id, title, expected }) => {
		const result = formatTestName(id, title);
		expect(
			result,
			'Функція повертає undefined. Можливо, ти виводиш рядок через console.log замість return? Див. «Типові помилки», пункт 3.',
		).not.toBe(undefined);
		expect(result, "Формат: 'TC-' + номер + ': ' + назва. Перевір двокрапку і пробіл після неї.").toBe(expected);
	});
});

describe('Завдання 3: calculateLineTotal (знайди баг)', () => {
	test.each([
		{ price: 100, quantity: 3, expected: 300 },
		{ price: 25, quantity: 0, expected: 0 },
		{ price: 9.5, quantity: 2, expected: 19 },
	])('calculateLineTotal($price, $quantity) → $expected', ({ price, quantity, expected }) => {
		expect(
			calculateLineTotal(price, quantity),
			'Стрілкова функція з фігурними дужками {} не повертає значення сама. Див. «Стрілкові функції: з дужками і без».',
		).toBe(expected);
	});
});

describe('Завдання 4: countMatching', () => {
	const statuses = ['passed', 'failed', 'passed', 'skipped', 'failed'];

	test.each([
		{ label: "status === 'failed'", predicate: (status) => status === 'failed', expected: 2 },
		{ label: "status === 'skipped'", predicate: (status) => status === 'skipped', expected: 1 },
		{ label: "status === 'passed'", predicate: (status) => status === 'passed', expected: 2 },
		{ label: "status === 'broken'", predicate: (status) => status === 'broken', expected: 0 },
	])('countMatching(statuses, $label) → $expected', ({ predicate, expected }) => {
		expect(
			countMatching(statuses, predicate),
			'Пройди циклом for...of по items, виклич predicate(item) для кожного і збільшуй лічильник, коли він повертає true. Не забудь return.',
		).toBe(expected);
	});

	test('порожній масив → 0', () => {
		expect(
			countMatching([], () => true),
			'Для порожнього масиву лічильник лишається нулем. Почни з let count = 0 і поверни його.',
		).toBe(0);
	});

	test('колбек викликається для кожного елемента рівно один раз', () => {
		const predicate = vi.fn(() => false);
		countMatching(['a', 'b', 'c'], predicate);
		expect(
			predicate.mock.calls.length,
			'predicate треба викликати один раз на кожен елемент масиву — ні більше, ні менше.',
		).toBe(3);
		expect(predicate.mock.calls[0][0], 'Передавай у predicate сам елемент масиву: predicate(item).').toBe('a');
	});
});

describe('Завдання 5: negate', () => {
	const isPassed = (status) => status === 'passed';

	test('negate(isPassed) повертає функцію', () => {
		expect(
			typeof negate(isPassed),
			'negate має ПОВЕРТАТИ нову функцію, а не результат перевірки. Після return має стояти функція — див. «Функція — це значення. Колбеки».',
		).toBe('function');
	});

	test.each([
		{ status: 'failed', expected: true },
		{ status: 'skipped', expected: true },
		{ status: 'passed', expected: false },
	])("negate(isPassed)('$status') → $expected", ({ status, expected }) => {
		const isNotPassed = negate(isPassed);
		expect(typeof isNotPassed, 'Спершу зроби так, щоб negate повертала функцію (див. тест вище).').toBe('function');
		expect(
			isNotPassed(status),
			'Нова функція має повертати ПРОТИЛЕЖНЕ до того, що повертає predicate для того самого значення. Згадай оператор !.',
		).toBe(expected);
	});

	test('predicate отримує те саме значення, що й нова функція', () => {
		const predicate = vi.fn(() => true);
		const negated = negate(predicate);
		expect(typeof negated, 'Спершу зроби так, щоб negate повертала функцію.').toBe('function');
		expect(
			predicate.mock.calls.length,
			'negate лише створює функцію. Викликати predicate треба всередині НОВОЇ функції, а не одразу в negate.',
		).toBe(0);
		negated('failed');
		expect(
			predicate.mock.calls.length,
			'Нова функція має викликати predicate рівно один раз.',
		).toBe(1);
		expect(
			predicate.mock.calls[0][0],
			'Передай у predicate те саме значення, яке отримала нова функція.',
		).toBe('failed');
	});

	test('разом з countMatching: скільки тестів не пройшли', () => {
		const statuses = ['passed', 'failed', 'passed', 'skipped', 'failed'];
		const isNotPassed = negate(isPassed);
		expect(typeof isNotPassed, 'Спершу зроби так, щоб negate повертала функцію.').toBe('function');
		expect(
			countMatching(statuses, isNotPassed),
			'Тут 3 не пройдені тести (2 failed + 1 skipped). Якщо попередні тести зелені, перевір countMatching із завдання 4.',
		).toBe(3);
	});
});
