import { describe, expect, test } from 'vitest';
import { loadExercise } from '../../_lib/load.js';

const { getStatusCategory, getPasswordError, getBadgeColor } = await loadExercise(import.meta.url);

describe('Завдання 1: getStatusCategory', () => {
	test.each([
		{ code: 100, expected: 'informational' },
		{ code: 200, expected: 'success' },
		{ code: 302, expected: 'redirect' },
		{ code: 404, expected: 'client error' },
		{ code: 503, expected: 'server error' },
	])("getStatusCategory($code) → '$expected'", ({ code, expected }) => {
		expect(getStatusCategory(code), 'Визнач діапазон статусу: 1xx, 2xx, 3xx, 4xx чи 5xx.').toBe(expected);
	});

	// Аналіз граничних значень: кожна межа і її сусіди.
	test.each([
		{ code: 199, expected: 'informational' },
		{ code: 201, expected: 'success' },
		{ code: 299, expected: 'success' },
		{ code: 300, expected: 'redirect' },
		{ code: 399, expected: 'redirect' },
		{ code: 400, expected: 'client error' },
		{ code: 499, expected: 'client error' },
		{ code: 500, expected: 'server error' },
		{ code: 599, expected: 'server error' },
	])("межа: getStatusCategory($code) → '$expected'", ({ code, expected }) => {
		expect(
			getStatusCategory(code),
			'Помилка на межі діапазону. Обидві межі включні: перевір, де в тебе > замість >= (або < замість <=), і порядок гілок else if.',
		).toBe(expected);
	});

	test.each([
		{ label: '99', code: 99 },
		{ label: '600', code: 600 },
		{ label: '0', code: 0 },
		{ label: '-200', code: -200 },
	])("поза діапазонами: getStatusCategory($label) → 'unknown'", ({ code }) => {
		expect(
			getStatusCategory(code),
			"Валідні статуси — лише від 100 до 599 включно. Усе, що нижче або вище, — 'unknown'.",
		).toBe('unknown');
	});

	test.each([
		{ label: "'200' (рядок)", code: '200' },
		{ label: '200.5', code: 200.5 },
		{ label: 'NaN', code: NaN },
		{ label: 'null', code: null },
		{ label: 'undefined', code: undefined },
	])("невалідний тип: getStatusCategory($label) → 'unknown'", ({ code }) => {
		expect(
			getStatusCategory(code),
			"Значення не є цілим числом, тому це 'unknown'. Зверни увагу: '200' >= 200 дорівнює true через неявне перетворення типів. Перевір тип на початку функції (guard clause).",
		).toBe('unknown');
	});
});

describe('Завдання 2: getPasswordError', () => {
	test.each([
		{ label: 'Secret12 (рівно 8)', password: 'Secret12' },
		{ label: 'Correct-Horse-Battery', password: 'Correct-Horse-Battery' },
		{ label: '64 символи', password: 'Aa'.repeat(32) },
		{ label: 'кирилиця Пароль123', password: 'Пароль123' },
	])('$label → null', ({ password }) => {
		expect(
			getPasswordError(password),
			'Пароль відповідає всім правилам, тож очікується null. Перевір межі довжини: 8 і 64 символи — дозволені значення.',
		).toBe(null);
	});

	test.each([
		{ label: 'число 12345678', password: 12345678 },
		{ label: 'null', password: null },
		{ label: 'undefined', password: undefined },
	])("$label → 'not-a-string'", ({ password }) => {
		let result;
		expect(
			() => {
				result = getPasswordError(password);
			},
			'Функція впала на значенні, яке не є рядком. Перевір тип через typeof на самому початку — до будь-яких .length чи .includes.',
		).not.toThrow();
		expect(result, "Для будь-якого не-рядка поверни 'not-a-string' — це перше правило.").toBe('not-a-string');
	});

	test.each([
		{ label: "'' (порожній)", password: '' },
		{ label: 'Secret1 (7 символів)', password: 'Secret1' },
	])("$label → 'too-short'", ({ password }) => {
		expect(
			getPasswordError(password),
			'Пароль коротший за 8 символів. Зверни увагу на межу: 7 — замало, 8 — достатньо.',
		).toBe('too-short');
	});

	test("65 символів → 'too-long'", () => {
		expect(
			getPasswordError('Aa'.repeat(32) + 'b'),
			'Пароль довший за 64 символи. 64 — ще можна, 65 — вже ні.',
		).toBe('too-long');
	});

	test.each([
		{ label: 'My password1', password: 'My password1' },
		{ label: 'пробіл у кінці', password: 'Password1 ' },
	])("$label → 'has-spaces'", ({ password }) => {
		expect(getPasswordError(password), 'У паролі є пробіл. Чи перевіряєш ти, що рядок містить підрядок?').toBe('has-spaces');
	});

	test("lowercase1 → 'no-uppercase'", () => {
		expect(
			getPasswordError('lowercase1'),
			'Немає великої літери. Порівняй рядок із його версією в нижньому регістрі.',
		).toBe('no-uppercase');
	});

	test("UPPERCASE1 → 'no-lowercase'", () => {
		expect(
			getPasswordError('UPPERCASE1'),
			'Немає малої літери. Порівняй рядок із його версією у верхньому регістрі.',
		).toBe('no-lowercase');
	});

	test.each([
		{ label: "'abc' — і короткий, і без великої", password: 'abc', expected: 'too-short' },
		{ label: "'a b' — і короткий, і з пробілом", password: 'a b', expected: 'too-short' },
		{ label: "'my password' — пробіл і без великої", password: 'my password', expected: 'has-spaces' },
		{ label: "'12345678' — без великої і без малої", password: '12345678', expected: 'no-uppercase' },
	])("порядок правил: $label → '$expected'", ({ password, expected }) => {
		expect(
			getPasswordError(password),
			'Пароль порушує кілька правил, а повернути треба ПЕРШЕ за списком із TODO. Перевір порядок умов: функція має вийти на першому ж порушенні.',
		).toBe(expected);
	});
});

describe('Завдання 3: getBadgeColor', () => {
	test.each([
		{ status: 'passed', expected: 'green' },
		{ status: 'failed', expected: 'red' },
		{ status: 'broken', expected: 'yellow' },
		{ status: 'flaky', expected: 'orange' },
		{ status: 'skipped', expected: 'gray' },
	])("getBadgeColor('$status') → '$expected'", ({ status, expected }) => {
		expect(getBadgeColor(status), 'Кожному статусу відповідає свій колір — звір таблицю в TODO.').toBe(expected);
	});

	test.each([
		{ label: "'unknown'", status: 'unknown' },
		{ label: "''", status: '' },
		{ label: 'undefined', status: undefined },
		{ label: 'null', status: null },
	])("getBadgeColor($label) → 'gray'", ({ status }) => {
		expect(
			getBadgeColor(status),
			"Для невідомого статусу потрібен типовий колір 'gray'. Об'єкт-довідник повертає undefined для відсутнього ключа — згадай оператор ?? з уроку 02.",
		).toBe('gray');
	});
});
