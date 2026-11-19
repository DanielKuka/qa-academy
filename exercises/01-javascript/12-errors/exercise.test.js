import { describe, expect, test } from 'vitest';
import { loadExercise } from '../../_lib/load.js';

const { assertEqual, safeJsonParse, parsePrice, withCleanup, loadFixture } = await loadExercise(import.meta.url);

/** Викликає fn і повертає те, що вона кинула (або undefined, якщо нічого). */
function catchError(fn) {
	try {
		fn();
	} catch (error) {
		return error;
	}
	return undefined;
}

describe('Завдання 1: assertEqual', () => {
	test.each([
		{ label: '200 і 200', actual: 200, expected: 200 },
		{ label: "'ok' і 'ok'", actual: 'ok', expected: 'ok' },
		{ label: 'null і null', actual: null, expected: null },
	])('не кидає, якщо значення рівні: $label', ({ actual, expected }) => {
		const error = catchError(() => assertEqual(actual, expected, 'Check'));
		expect(error?.message, 'Для однакових значень assertEqual не повинна нічого кидати.').toBeUndefined();
	});

	test('кидає саме об\'єкт Error, а не рядок', () => {
		const error = catchError(() => assertEqual(404, 200, 'Status code'));
		expect(error, 'Для різних значень assertEqual має кинути помилку (throw).').toBeDefined();
		expect(
			error instanceof Error,
			"Кинуто не Error. throw 'текст' не має stack trace — використовуй throw new Error(...).",
		).toBe(true);
	});

	test.each([
		{ label: 'числа', actual: 404, expected: 200, message: 'Status code: expected 200, received 404' },
		{ label: 'рядок замість числа', actual: '100', expected: 100, message: 'Price: expected 100, received "100"' },
		{ label: 'null замість рядка', actual: null, expected: 'Ann', message: 'Name: expected "Ann", received null' },
	])('повідомлення показує очікуване й отримане ($label)', ({ actual, expected, message }) => {
		const label = message.split(':')[0];
		const error = catchError(() => assertEqual(actual, expected, label));
		expect(
			error?.message,
			'Формат: `${message}: expected ${...}, received ${...}`, значення — через JSON.stringify, ' +
				'щоб рядок "100" відрізнявся від числа 100.',
		).toBe(message);
	});

	test("'100' і 100 — це різні значення", () => {
		const error = catchError(() => assertEqual('100', 100, 'Price'));
		expect(error, 'Рядок і число не рівні. Порівнюй через ===, а не ==.').toBeInstanceOf(Error);
	});
});

describe('Завдання 2: safeJsonParse', () => {
	test.each([
		{ label: "'{\"id\":1}'", text: '{"id":1}', data: { id: 1 } },
		{ label: "'[1,2]'", text: '[1,2]', data: [1, 2] },
		{ label: "'null'", text: 'null', data: null },
		{ label: "'0'", text: '0', data: 0 },
	])('валідний JSON $label → { ok: true, data }', ({ text, data }) => {
		expect(
			safeJsonParse(text),
			'Для валідного JSON поверни об\'єкт { ok: true, data: <результат JSON.parse> }.',
		).toEqual({ ok: true, data });
	});

	test.each([
		{ label: "'<html>502</html>'", text: '<html>502</html>' },
		{ label: "'' (порожня відповідь)", text: '' },
		{ label: "'{\"id\":1,}' (кома в кінці)", text: '{"id":1,}' },
	])('невалідний JSON $label → { ok: false, error }', ({ text }) => {
		let result;
		const thrown = catchError(() => {
			result = safeJsonParse(text);
		});
		expect(
			thrown,
			'safeJsonParse кинула помилку назовні. Обгорни JSON.parse у try/catch і поверни результат з catch.',
		).toBeUndefined();
		expect(result?.ok, 'Для невалідного JSON поле ok має бути false.').toBe(false);
		expect(
			result?.error,
			'У полі error має лежати сам об\'єкт помилки, яку кинув JSON.parse (SyntaxError), а не рядок.',
		).toBeInstanceOf(SyntaxError);
		expect('data' in (result ?? {}), 'Коли ok: false, поля data бути не повинно.').toBe(false);
	});
});

describe('Завдання 3: parsePrice', () => {
	test.each([
		{ label: "'1299.50 ₴'", text: '1299.50 ₴', expected: 1299.5 },
		{ label: "'₴49'", text: '₴49', expected: 49 },
		{ label: "' 100 '", text: ' 100 ', expected: 100 },
		{ label: "'0'", text: '0', expected: 0 },
	])('parsePrice($label) → $expected', ({ text, expected }) => {
		const error = catchError(() => parsePrice(text));
		expect(error?.message, 'Для коректної ціни parsePrice не повинна кидати помилку.').toBeUndefined();
		expect(parsePrice(text), "Прибери '₴' і пробіли по краях, потім перетвори рядок на число.").toBe(expected);
	});

	test.each([
		{ label: '100 (число)', value: 100 },
		{ label: 'null', value: null },
		{ label: 'undefined', value: undefined },
	])('не рядок $label → TypeError', ({ value }) => {
		const error = catchError(() => parsePrice(value));
		expect(error, 'Для значення, що не є рядком, треба кинути помилку.').toBeInstanceOf(TypeError);
		expect(
			error?.message,
			"Помилка неправильного типу: перевір typeof ДО будь-яких рядкових методів і згадай у повідомленні 'string'.",
		).toContain('string');
	});

	test.each([
		{ label: "'abc ₴'", text: 'abc ₴' },
		{ label: "'12px'", text: '12px' },
		{ label: "'' (порожній рядок)", text: '' },
		{ label: "' ₴ ' (лише символ валюти)", text: ' ₴ ' },
	])('не число $label → TypeError з вихідним текстом', ({ text }) => {
		const error = catchError(() => parsePrice(text));
		expect(
			error,
			'Рядок не є ціною — кинь TypeError. Пам\'ятай: Number(\'\') повертає 0, тож порожній рядок перевір окремо.',
		).toBeInstanceOf(TypeError);
		expect(
			error?.message,
			'Повідомлення має містити ВИХІДНИЙ текст у лапках — інакше з логу незрозуміло, що саме прийшло з UI.',
		).toContain(`"${text}"`);
	});

	test.each([
		{ label: "'-5'", text: '-5' },
		{ label: "'-0.01 ₴'", text: '-0.01 ₴' },
	])("від'ємна ціна $label → RangeError", ({ text }) => {
		const error = catchError(() => parsePrice(text));
		expect(
			error,
			"Від'ємна ціна — це число поза допустимим діапазоном. Подивись у таблиці типів помилок уроку, який тип для цього.",
		).toBeInstanceOf(RangeError);
		expect(error?.message, 'Повідомлення має містити вихідний текст у лапках.').toContain(`"${text}"`);
	});
});

describe('Завдання 4: withCleanup', () => {
	test('повертає результат action і викликає cleanup', () => {
		const log = [];
		const result = withCleanup(
			() => {
				log.push('action');
				return 'user-42';
			},
			() => log.push('cleanup'),
		);
		expect(result, 'withCleanup має повернути те, що повернула action().').toBe('user-42');
		expect(log, 'Спочатку виконується action, потім cleanup — кожна рівно один раз.').toEqual(['action', 'cleanup']);
	});

	test('викликає cleanup, навіть якщо action кинула помилку', () => {
		const log = [];
		catchError(() =>
			withCleanup(
				() => {
					throw new Error('assertion failed');
				},
				() => log.push('cleanup'),
			),
		);
		expect(
			log,
			'Після помилки в action прибирання не виконалося. Код, що має спрацювати завжди, — у блоці finally.',
		).toEqual(['cleanup']);
	});

	test('кидає далі ТУ САМУ помилку, а не ковтає її', () => {
		const original = new TypeError('Cannot read properties of undefined');
		const error = catchError(() =>
			withCleanup(
				() => {
					throw original;
				},
				() => {},
			),
		);
		expect(
			error,
			'Помилку проковтнуто або підмінено. Не перехоплюй її в catch (або кинь далі ту саму: throw error) — тест має впасти.',
		).toBe(original);
	});
});

describe('Завдання 5: loadFixture', () => {
	test('повертає розібрані дані для валідного JSON', () => {
		expect(loadFixture('users', '[{"name":"Ann"}]'), 'Для валідного JSON поверни результат JSON.parse.').toEqual([
			{ name: 'Ann' },
		]);
	});

	test('для невалідного JSON кидає Error з назвою фікстури', () => {
		const error = catchError(() => loadFixture('users', '[{"name":"Ann"},]'));
		expect(error, 'Для невалідного JSON треба кинути помилку.').toBeInstanceOf(Error);
		expect(
			error?.message,
			'Повідомлення має пояснювати, ЯКА фікстура зламана: `Fixture "${name}" is not valid JSON`. ' +
				'Зловити помилку JSON.parse і кинути нову — це rethrow з контекстом.',
		).toBe('Fixture "users" is not valid JSON');
	});

	test('первинна помилка збережена в cause', () => {
		const error = catchError(() => loadFixture('orders', '{oops}'));
		expect(
			error?.cause,
			'Первинну помилку загублено. Другий аргумент new Error(...) приймає об\'єкт з опцією cause — дивись розділ «Повторне кидання і cause».',
		).toBeInstanceOf(SyntaxError);
	});
});
