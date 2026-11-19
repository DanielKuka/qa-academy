import { describe, expect, test } from 'vitest';
import { loadExercise } from '../../_lib/load.js';

const { normalizeText, isSameText, parseCartCount, maskCardNumber, slugify, buildUrl } = await loadExercise(
	import.meta.url,
);

describe('Завдання 1: normalizeText', () => {
	test.each([
		{ label: "'Навушники Sony' (вже чистий)", text: 'Навушники Sony', expected: 'Навушники Sony' },
		{ label: 'пробіли по краях', text: '   Навушники Sony  ', expected: 'Навушники Sony' },
		{ label: 'переноси й відступи верстки', text: '\n    Навушники Sony\n  ', expected: 'Навушники Sony' },
		{ label: 'порожній рядок', text: '', expected: '' },
	])('по краях: $label', ({ text, expected }) => {
		expect(
			normalizeText(text),
			'Пробіли, таби й переноси по краях треба прибрати. Який метод рядка робить саме це? Див. «Регістр і пробіли».',
		).toBe(expected);
	});

	test.each([
		{ label: 'кілька пробілів', text: 'Навушники   Sony', expected: 'Навушники Sony' },
		{ label: 'таб', text: 'Ціна:\t1299 ₴', expected: 'Ціна: 1299 ₴' },
		{ label: 'перенос рядка', text: 'Додано\nу кошик', expected: 'Додано у кошик' },
		{ label: 'нерозривний пробіл (&nbsp;)', text: '1 299 ₴', expected: '1 299 ₴' },
		{ label: 'усе разом', text: '\n    Навушники \t  Sony\n  ', expected: 'Навушники Sony' },
	])('усередині: $label', ({ text, expected }) => {
		expect(
			normalizeText(text),
			'Будь-яка послідовність пробільних символів усередині має стати ОДНИМ пробілом. trim() тут не допоможе — див. шаблон з /\\s+/g у «Практиці».',
		).toBe(expected);
	});
});

describe('Завдання 2: isSameText', () => {
	test.each([
		{ actual: 'Навушники Sony', expected: 'Навушники Sony' },
		{ actual: 'НАВУШНИКИ SONY', expected: 'навушники sony' },
		{ actual: '  НАВУШНИКИ  Sony ', expected: 'навушники sony' },
		{ actual: ' Додати   у кошик ', expected: 'Додати у кошик' },
	])('isSameText("$actual", "$expected") → true', ({ actual, expected }) => {
		expect(
			isSameText(actual, expected),
			'Ці тексти мають вважатися однаковими. Нормалізуй ОБИДВА рядки (normalizeText) і зведи їх до одного регістру, а вже потім порівнюй через ===.',
		).toBe(true);
	});

	test.each([
		{ actual: 'Навушники Sony', expected: 'Навушники Bose' },
		{ actual: 'Навушники Sony', expected: 'Навушники' },
		{ actual: 'Кошик (3)', expected: 'Кошик (4)' },
	])('isSameText("$actual", "$expected") → false', ({ actual, expected }) => {
		expect(
			isSameText(actual, expected),
			'Різні тексти не мають збігатися. Не використовуй includes: часткового збігу тут недостатньо.',
		).toBe(false);
	});
});

describe('Завдання 3: parseCartCount', () => {
	test.each([
		{ label: 'Кошик (3)', expected: 3 },
		{ label: 'Кошик (12)', expected: 12 },
		{ label: 'Кошик (0)', expected: 0 },
		{ label: 'Cart (7)', expected: 7 },
	])("parseCartCount('$label') → $expected", ({ label, expected }) => {
		const result = parseCartCount(label);
		expect(
			typeof result,
			'Результат має бути числом. Текст з UI — це рядок, його треба перетворити через Number(...).',
		).toBe('number');
		expect(
			result,
			'Вирізай лише те, що між "(" і ")". Позиції дужок знайде indexOf, а вирізати допоможе slice (кінцевий індекс не включається).',
		).toBe(expected);
	});

	test("parseCartCount('Кошик') → 0 (дужок немає)", () => {
		expect(
			parseCartCount('Кошик'),
			'Якщо дужок немає, indexOf повертає -1. Перевір це окремо і поверни 0.',
		).toBe(0);
	});

	test('пробіли навколо тексту і всередині дужок не заважають', () => {
		expect(
			parseCartCount('  Кошик ( 5 )\n'),
			'Number(...) сам ігнорує пробіли по краях рядка, тож достатньо правильно вирізати частину між дужками.',
		).toBe(5);
	});
});

describe('Завдання 4: maskCardNumber', () => {
	test.each([
		{ card: '4111111111111111', expected: '**** **** **** 1111' },
		{ card: '5500 0000 0000 0004', expected: '**** **** **** 0004' },
		{ card: '4000-0566-5566-5556', expected: '**** **** **** 5556' },
	])("maskCardNumber('$card') → '$expected'", ({ card, expected }) => {
		expect(
			maskCardNumber(card),
			'Спершу прибери з номера всі пробіли й дефіси (replaceAll), потім візьми останні 4 символи (slice з від\'ємним індексом) і встав їх у шаблонний літерал.',
		).toBe(expected);
	});

	test('у результаті немає жодної зайвої цифри з номера', () => {
		const masked = maskCardNumber('4111 2222 3333 4444');
		expect(typeof masked, 'Функція має повертати рядок.').toBe('string');
		expect(
			masked.includes('2222') || masked.includes('3333') || masked.includes('4111'),
			'У звіт потрапили приховані цифри картки. Видимими лишаються тільки останні 4.',
		).toBe(false);
	});
});

describe('Завдання 5: slugify', () => {
	test.each([
		{ title: 'Нова Колекція', expected: 'нова-колекція' },
		{ title: 'Summer Sale Shoes', expected: 'summer-sale-shoes' },
	])("slugify('$title') → '$expected'", ({ title, expected }) => {
		expect(
			slugify(title),
			'Нижній регістр (toLowerCase), а пробіли між словами — дефіси (replaceAll). Кирилицю не транслітеруй.',
		).toBe(expected);
	});

	test.each([
		{ title: 'Нова Колекція 2026!', expected: 'нова-колекція-2026' },
		{ title: 'Що нового?', expected: 'що-нового' },
		{ title: 'Футболка «Київ» (біла)', expected: 'футболка-київ-біла' },
		{ title: 'Sale: shoes, bags.', expected: 'sale-shoes-bags' },
	])("slugify('$title') → '$expected' (пунктуація)", ({ title, expected }) => {
		expect(
			slugify(title),
			'Символи зі списку . , ! ? : ; " « » ( ) треба видалити. Перебери рядок через for...of і додавай до результату лише ті символи, яких немає у списку.',
		).toBe(expected);
	});

	test.each([
		{ title: '  Літній   розпродаж ', expected: 'літній-розпродаж' },
		{ title: 'Хіти    сезону', expected: 'хіти-сезону' },
	])("slugify('$title') → '$expected' (пробіли)", ({ title, expected }) => {
		expect(
			slugify(title),
			'Пробіли по краях прибери, а КОЖНУ послідовність пробілів усередині заміни одним дефісом. Твоя normalizeText з завдання 1 тут дуже доречна.',
		).toBe(expected);
	});
});

describe('Завдання 6: buildUrl', () => {
	test.each([
		{ base: 'https://shop.test', path: 'cart' },
		{ base: 'https://shop.test/', path: '/cart' },
		{ base: 'https://shop.test/', path: 'cart' },
		{ base: 'https://shop.test', path: '/cart' },
	])("buildUrl('$base', '$path') → 'https://shop.test/cart'", ({ base, path }) => {
		expect(
			buildUrl(base, path),
			'Між base і path має бути рівно один слеш. Перевір кінець base (endsWith) і початок path (startsWith) і відріж зайвий слеш через slice.',
		).toBe('https://shop.test/cart');
	});

	test('слеші всередині path лишаються', () => {
		expect(
			buildUrl('https://api.shop.test/', '/api/v1/orders'),
			'Прибирай лише слеш на самому початку path, а не всі слеші. replaceAll тут зламає адресу.',
		).toBe('https://api.shop.test/api/v1/orders');
	});

	test('протокол https:// не зачеплено', () => {
		const url = buildUrl('https://shop.test', 'cart');
		expect(typeof url, 'Функція має повертати рядок.').toBe('string');
		expect(url.startsWith('https://'), 'Слеші в "https://" — частина протоколу, їх чіпати не можна.').toBe(true);
	});
});
