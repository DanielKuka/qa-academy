import { describe, expect, test } from 'vitest';
import { loadExercise } from '../../_lib/load.js';

const { MAX_LOGIN_ATTEMPTS, getType, isEmpty } = await loadExercise(import.meta.url);

describe('Завдання 1: MAX_LOGIN_ATTEMPTS', () => {
	test('дорівнює числу 3', () => {
		expect(
			typeof MAX_LOGIN_ATTEMPTS,
			'Константа має бути числом. Якщо бачиш "string" — прибери лапки навколо 3.',
		).toBe('number');
		expect(MAX_LOGIN_ATTEMPTS).toBe(3);
	});
});

describe('Завдання 2: getType', () => {
	test.each([
		{ label: "'text'", value: 'text', expected: 'string' },
		{ label: "''", value: '', expected: 'string' },
		{ label: '42', value: 42, expected: 'number' },
		{ label: 'NaN', value: NaN, expected: 'number' },
		{ label: 'true', value: true, expected: 'boolean' },
		{ label: 'undefined', value: undefined, expected: 'undefined' },
		{ label: '{ id: 1 }', value: { id: 1 }, expected: 'object' },
		{ label: '() => {}', value: () => {}, expected: 'function' },
	])('getType($label) → $expected', ({ value, expected }) => {
		expect(getType(value), 'Для звичайних значень достатньо повернути результат typeof.').toBe(expected);
	});

	test("getType(null) → 'null'", () => {
		expect(
			getType(null),
			"typeof null повертає 'object' — це помилка мови. Перевір null окремо через === null, ДО typeof.",
		).toBe('null');
	});

	test("getType([1, 2]) → 'array'", () => {
		expect(getType([1, 2]), "Масив для typeof — це 'object'. Використай Array.isArray(value).").toBe('array');
		expect(getType([]), 'Порожній масив теж масив.').toBe('array');
	});
});

describe('Завдання 3: isEmpty', () => {
	// Кожен кейс має явну назву: так вивід тестів читається однозначно.
	test.each([
		{ label: 'null', value: null },
		{ label: 'undefined', value: undefined },
		{ label: "''", value: '' },
		{ label: "'   ' (пробіли)", value: '   ' },
		{ label: 'таб і перенос рядка', value: '\t\n' },
	])('isEmpty($label) → true', ({ value }) => {
		expect(
			isEmpty(value),
			'null, undefined, порожній рядок і рядок із самих пробілів вважаються порожніми. Для рядків використай .trim().',
		).toBe(true);
	});

	test.each([
		{ label: '0', value: 0 },
		{ label: 'false', value: false },
	])('isEmpty($label) → false — це справжнє значення, а не порожнеча', ({ value }) => {
		expect(
			isEmpty(value),
			'Класичний баг: перевірка !value вважає 0 і false порожніми. Перевіряй null/undefined явно через ===.',
		).toBe(false);
	});

	test.each([
		{ label: "'0'", value: '0' },
		{ label: "' a '", value: ' a ' },
		{ label: "'false'", value: 'false' },
		{ label: '42', value: 42 },
		{ label: '[]', value: [] },
		{ label: '{}', value: {} },
	])('isEmpty($label) → false', ({ value }) => {
		expect(isEmpty(value), 'Це непорожнє значення.').toBe(false);
	});
});
