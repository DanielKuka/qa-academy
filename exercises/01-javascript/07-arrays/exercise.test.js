import { describe, expect, test } from 'vitest';
import { loadExercise } from '../../_lib/load.js';

const { last, sortPrices, unique, chunk, arraysEqual } = await loadExercise(import.meta.url);

describe('Завдання 1: last', () => {
	test.each([
		{ label: "['ORD-1', 'ORD-2', 'ORD-3']", items: ['ORD-1', 'ORD-2', 'ORD-3'], expected: 'ORD-3' },
		{ label: '[42]', items: [42], expected: 42 },
		{ label: "['a', 'b']", items: ['a', 'b'], expected: 'b' },
	])('last($label) → $expected', ({ items, expected }) => {
		expect(
			last(items),
			'Індекси починаються з 0, тож останній індекс — на одиницю менший за length. Див. «Створення, індекси, довжина».',
		).toBe(expected);
	});

	test('last([]) → undefined', () => {
		expect(last([]), 'Для порожнього масиву останнього елемента немає — очікується undefined.').toBe(undefined);
	});

	test('вхідний масив не змінився', () => {
		const items = ['ORD-1', 'ORD-2', 'ORD-3'];
		expect(last(items), 'Спершу зроби так, щоб last повертала останній елемент (див. тести вище).').toBe('ORD-3');
		expect(
			items,
			'last лише читає елемент. pop() теж повертає останній, але ВИРІЗАЄ його з масиву.',
		).toEqual(['ORD-1', 'ORD-2', 'ORD-3']);
	});
});

describe('Завдання 2: sortPrices', () => {
	test.each([
		{ label: '[100, 25, 5]', prices: [100, 25, 5], expected: [5, 25, 100] },
		{ label: '[10, 9, 1]', prices: [10, 9, 1], expected: [1, 9, 10] },
		{ label: '[1299, 249.5, 89, 1000]', prices: [1299, 249.5, 89, 1000], expected: [89, 249.5, 1000, 1299] },
		{ label: '[5, 5, 1]', prices: [5, 5, 1], expected: [1, 5, 5] },
	])('sortPrices($label) → числове сортування за зростанням', ({ prices, expected }) => {
		expect(
			sortPrices(prices),
			'sort() без аргументу порівнює числа як рядки ("100" < "25"). Передай у sort функцію-компаратор. Див. «Пастка sort».',
		).toEqual(expected);
	});

	test('порожній масив → []', () => {
		expect(sortPrices([]), 'Для порожнього масиву поверни порожній масив, а не undefined.').toEqual([]);
	});

	test('вхідний масив не змінився', () => {
		const prices = [100, 25, 5];
		const result = sortPrices(prices);
		expect(Array.isArray(result), 'Функція має повертати масив.').toBe(true);
		expect(
			prices,
			'sort() змінює масив, на якому його викликали. Спершу зроби копію (див. «Копіювання масиву»), а сортуй уже її.',
		).toEqual([100, 25, 5]);
		expect(result === prices, 'Поверни новий масив, а не той самий, що прийшов у функцію.').toBe(false);
	});
});

describe('Завдання 3: unique', () => {
	test.each([
		{
			label: "['shoes', 'bags', 'shoes', 'hats', 'bags']",
			items: ['shoes', 'bags', 'shoes', 'hats', 'bags'],
			expected: ['shoes', 'bags', 'hats'],
		},
		{ label: '[3, 1, 3, 3, 2]', items: [3, 1, 3, 3, 2], expected: [3, 1, 2] },
		{ label: "['a', 'b', 'c'] (без дублікатів)", items: ['a', 'b', 'c'], expected: ['a', 'b', 'c'] },
		{ label: '[]', items: [], expected: [] },
	])('unique($label)', ({ items, expected }) => {
		expect(
			unique(items),
			'Збирай результат у новий масив: додавай елемент (push), лише якщо його там ще немає (includes). Порядок — як у першій появі.',
		).toEqual(expected);
	});

	test("1 і '1' — різні значення", () => {
		expect(
			unique([1, '1', 1]),
			'Число 1 і рядок "1" — різні значення для ===, тож обидва лишаються.',
		).toEqual([1, '1']);
	});

	test('вхідний масив не змінився', () => {
		const items = ['shoes', 'bags', 'shoes'];
		expect(unique(items), 'Спершу зроби так, щоб unique повертала масив без дублікатів (див. тести вище).').toEqual(['shoes', 'bags']);
		expect(
			items,
			'Не видаляй дублікати з вхідного масиву (splice тощо) — створи новий масив для результату.',
		).toEqual(['shoes', 'bags', 'shoes']);
	});
});

describe('Завдання 4: chunk', () => {
	test.each([
		{
			label: '5 користувачів по 2',
			items: ['u1', 'u2', 'u3', 'u4', 'u5'],
			size: 2,
			expected: [['u1', 'u2'], ['u3', 'u4'], ['u5']],
		},
		{
			label: '6 користувачів по 3',
			items: ['u1', 'u2', 'u3', 'u4', 'u5', 'u6'],
			size: 3,
			expected: [
				['u1', 'u2', 'u3'],
				['u4', 'u5', 'u6'],
			],
		},
		{ label: '3 користувачі по 3', items: ['u1', 'u2', 'u3'], size: 3, expected: [['u1', 'u2', 'u3']] },
		{ label: '2 користувачі по 5', items: ['u1', 'u2'], size: 5, expected: [['u1', 'u2']] },
		{ label: '3 користувачі по 1', items: ['u1', 'u2', 'u3'], size: 1, expected: [['u1'], ['u2'], ['u3']] },
	])('chunk: $label', ({ items, size, expected }) => {
		expect(
			chunk(items, size),
			'Потрібен масив пакетів. Пройди циклом з кроком size (див. шаблон у «Практиці») і на кожному кроці бери шматок через slice. Останній пакет може бути меншим.',
		).toEqual(expected);
	});

	test('chunk([], 2) → []', () => {
		expect(chunk([], 2), 'Немає користувачів — немає пакетів: очікується порожній масив, а не [[]].').toEqual([]);
	});

	test('вхідний масив не змінився', () => {
		const items = ['u1', 'u2', 'u3'];
		expect(chunk(items, 2), 'Спершу зроби так, щоб chunk повертала пакети (див. тести вище).').toEqual([['u1', 'u2'], ['u3']]);
		expect(
			items,
			'splice і shift вирізають елементи з вхідного масиву. Для копіювання частини є slice.',
		).toEqual(['u1', 'u2', 'u3']);
	});
});

describe('Завдання 5: arraysEqual', () => {
	test.each([
		{ label: "['Home', 'Shop'] і ['Home', 'Shop']", a: ['Home', 'Shop'], b: ['Home', 'Shop'] },
		{ label: '[1, 2, 3] і [1, 2, 3]', a: [1, 2, 3], b: [1, 2, 3] },
		{ label: '[] і []', a: [], b: [] },
	])('$label → true', ({ a, b }) => {
		expect(
			arraysEqual(a, b),
			'Це два різні масиви з однаковим вмістом. === тут дасть false — порівнюй елементи поелементно в циклі.',
		).toBe(true);
	});

	test.each([
		{ label: "['Home', 'Shop'] і ['Shop', 'Home'] (порядок)", a: ['Home', 'Shop'], b: ['Shop', 'Home'] },
		{ label: '[1, 2] і [1, 2, 3] (довжина)', a: [1, 2], b: [1, 2, 3] },
		{ label: '[1, 2, 3] і [1, 2] (довжина)', a: [1, 2, 3], b: [1, 2] },
		{ label: "[1] і ['1'] (тип)", a: [1], b: ['1'] },
		{ label: "['Home'] і ['home'] (регістр)", a: ['Home'], b: ['home'] },
	])('$label → false', ({ a, b }) => {
		expect(
			arraysEqual(a, b),
			'Масиви різні. Спершу порівняй довжини, потім кожну пару елементів через === — будь-яка відмінність означає false.',
		).toBe(false);
	});

	test('той самий масив дорівнює собі', () => {
		const menu = ['Home', 'Shop'];
		expect(arraysEqual(menu, menu), 'Масив завжди дорівнює сам собі.').toBe(true);
	});
});
