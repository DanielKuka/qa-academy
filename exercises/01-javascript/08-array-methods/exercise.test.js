import { describe, expect, test } from 'vitest';
import { loadExercise } from '../../_lib/load.js';

const { getFailedTitles, totalDuration, countByStatus, findSlowest, isRunGreen, byTag, sortByDurationDesc } =
	await loadExercise(import.meta.url);

// Кожен тест отримує свіжу копію звіту: так зміна даних в одному тесті не зламає інший.
function makeReport() {
	return [
		{ title: 'login works', status: 'passed', durationMs: 1200, tags: ['@smoke', '@auth'] },
		{ title: 'checkout by card', status: 'failed', durationMs: 8400, tags: ['@payments'] },
		{ title: 'export to PDF', status: 'skipped', durationMs: 0, tags: [] },
		{ title: 'search by name', status: 'passed', durationMs: 300, tags: ['@smoke'] },
		{ title: 'logout', status: 'failed', durationMs: 450, tags: ['@auth'] },
	];
}

const allPassed = [
	{ title: 'a', status: 'passed', durationMs: 10, tags: [] },
	{ title: 'b', status: 'passed', durationMs: 20, tags: [] },
];

describe('Завдання 1: getFailedTitles', () => {
	test('повертає назви упалих тестів у вихідному порядку', () => {
		expect(
			getFailedTitles(makeReport()),
			'Потрібен масив РЯДКІВ-назв лише для status === "failed". Спершу відбери потрібні результати (filter), потім візьми з кожного title (map).',
		).toEqual(['checkout by card', 'logout']);
	});

	test('немає упалих → порожній масив', () => {
		expect(getFailedTitles(allPassed), 'Якщо нічого не впало, поверни [], а не undefined.').toEqual([]);
	});
});

describe('Завдання 2: totalDuration', () => {
	test('сумує durationMs усіх результатів', () => {
		expect(totalDuration(makeReport()), 'Згорни масив в одне число через reduce.').toBe(10350);
	});

	test('порожній звіт → 0', () => {
		let total;
		expect(
			() => {
				total = totalDuration([]);
			},
			'reduce без початкового значення кидає TypeError на порожньому масиві. Передай початкове значення другим аргументом.',
		).not.toThrow();
		expect(total, 'Сума порожнього звіту — 0.').toBe(0);
	});
});

describe('Завдання 3: countByStatus', () => {
	test('рахує тести за статусами', () => {
		expect(
			countByStatus(makeReport()),
			'Очікується об\'єкт { passed, failed, skipped } з кількостями. Якщо бачиш undefined — перевір, що колбек reduce повертає акумулятор.',
		).toEqual({ passed: 2, failed: 2, skipped: 1 });
	});

	test('порожній звіт → усі лічильники нульові', () => {
		expect(
			countByStatus([]),
			'Навіть для порожнього звіту всі три ключі мають бути на місці зі значенням 0. Задай їх у початковому значенні reduce.',
		).toEqual({ passed: 0, failed: 0, skipped: 0 });
	});

	test('лише один статус — інші лічильники все одно присутні', () => {
		expect(countByStatus(allPassed), 'Ключі failed і skipped мають бути навіть зі значенням 0.').toEqual({
			passed: 2,
			failed: 0,
			skipped: 0,
		});
	});
});

describe('Завдання 4: findSlowest', () => {
	test('повертає результат з найбільшим durationMs', () => {
		const report = makeReport();
		expect(
			findSlowest(report),
			'Поверни сам об\'єкт результату (не число і не назву) з найбільшим durationMs.',
		).toBe(report[1]);
	});

	test('кілька однаково повільних → перший з них', () => {
		const report = [
			{ title: 'first', status: 'passed', durationMs: 500, tags: [] },
			{ title: 'second', status: 'passed', durationMs: 500, tags: [] },
		];
		expect(
			findSlowest(report)?.title,
			'При рівній тривалості лишай той, що знайшовся раніше: замінюй кандидата лише на СТРОГО повільніший.',
		).toBe('first');
	});

	test('порожній звіт → undefined, без помилки', () => {
		expect(
			() => findSlowest([]),
			'reduce без початкового значення падає на порожньому масиві. Перевір довжину масиву до виклику.',
		).not.toThrow();
		expect(findSlowest([]), 'У порожньому звіті немає найповільнішого тесту.').toBeUndefined();
	});
});

describe('Завдання 5: isRunGreen', () => {
	test.each([
		{ label: 'усі passed', results: allPassed, expected: true },
		{
			label: 'passed і skipped',
			results: [
				{ title: 'a', status: 'passed', durationMs: 1, tags: [] },
				{ title: 'b', status: 'skipped', durationMs: 0, tags: [] },
			],
			expected: true,
		},
		{ label: 'є упалі', results: makeReport(), expected: false },
	])('$label → $expected', ({ results, expected }) => {
		expect(
			isRunGreen(results),
			'Прогін зелений, якщо НЕМАЄ жодного failed; skipped не заважає. Подивись на every або some у розділі уроку.',
		).toBe(expected);
	});

	test('порожній звіт → false', () => {
		expect(
			isRunGreen([]),
			'every на порожньому масиві повертає true. Але нуль запущених тестів — не зелений прогін: перевір довжину окремо.',
		).toBe(false);
	});
});

describe('Завдання 6: byTag', () => {
	test.each([
		{ tag: '@smoke', expected: ['login works', 'search by name'] },
		{ tag: '@auth', expected: ['login works', 'logout'] },
		{ tag: '@payments', expected: ['checkout by card'] },
		{ tag: '@nightly', expected: [] },
	])('byTag(report, $tag)', ({ tag, expected }) => {
		const found = byTag(makeReport(), tag);
		expect(Array.isArray(found), 'Функція має повертати масив результатів (навіть порожній).').toBe(true);
		expect(
			found.map((r) => r.title),
			'Відбери результати, у масиві tags яких є цей тег. Для перевірки «чи є елемент у масиві» згадай урок 07.',
		).toEqual(expected);
	});
});

describe('Завдання 7: sortByDurationDesc', () => {
	test('сортує від найдовшого до найкоротшого', () => {
		const sorted = sortByDurationDesc(makeReport());
		expect(Array.isArray(sorted), 'Функція має повертати масив.').toBe(true);
		expect(
			sorted.map((r) => r.durationMs),
			'Без компаратора sort порівнює як рядки. Передай функцію порівняння; для спадання — від b до a.',
		).toEqual([8400, 1200, 450, 300, 0]);
	});

	test('повертає новий масив, а вихідний лишає без змін', () => {
		const report = makeReport();
		const sorted = sortByDurationDesc(report);
		expect(Array.isArray(sorted), 'Функція має повертати масив.').toBe(true);
		expect(sorted, 'Поверни НОВИЙ масив, а не той самий, що прийшов на вхід.').not.toBe(report);
		expect(
			report.map((r) => r.title),
			'sort змінює масив, на якому його викликали. Спершу зроби копію (див. розділ про sort в уроці).',
		).toEqual(makeReport().map((r) => r.title));
	});
});

describe('Незмінність вхідних даних', () => {
	test.each([
		{ label: 'getFailedTitles', run: (r) => getFailedTitles(r) },
		{ label: 'totalDuration', run: (r) => totalDuration(r) },
		{ label: 'countByStatus', run: (r) => countByStatus(r) },
		{ label: 'findSlowest', run: (r) => findSlowest(r) },
		{ label: 'isRunGreen', run: (r) => isRunGreen(r) },
		{ label: "byTag(report, '@smoke')", run: (r) => byTag(r, '@smoke') },
		{ label: 'sortByDurationDesc', run: (r) => sortByDurationDesc(r) },
	])('$label не змінює звіт', ({ run }) => {
		const report = makeReport();
		run(report);
		expect(
			report,
			'Функція змінила вхідний звіт (порядок, елементи або їхні поля). Утиліти аналізу мають лише читати дані.',
		).toEqual(makeReport());
	});
});
