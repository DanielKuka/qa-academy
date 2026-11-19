import { describe, expect, test } from 'vitest';
import { loadExercise } from '../../_lib/load.js';

const { generateEmails, retry, findFirstFailed } = await loadExercise(import.meta.url);

describe('Завдання 1: generateEmails', () => {
	test("generateEmails(3, 'qa') → три адреси", () => {
		const emails = generateEmails(3, 'qa');
		expect(Array.isArray(emails), 'Функція має повернути масив. Не забудь return наприкінці.').toBe(true);
		expect(emails).toEqual(['qa1@example.com', 'qa2@example.com', 'qa3@example.com']);
	});

	test.each([
		{ count: 1, prefix: 'user' },
		{ count: 5, prefix: 'buyer' },
		{ count: 25, prefix: 'load' },
	])("generateEmails($count, '$prefix') → масив довжиною $count", ({ count, prefix }) => {
		const emails = generateEmails(count, prefix) ?? [];
		expect(
			emails.length,
			'Кількість адрес не збігається з count. Класична помилка на одиницю: перевір початкове значення лічильника і < проти <= в умові циклу.',
		).toBe(count);
		expect(emails[0], 'Нумерація має починатися з 1, а не з 0.').toBe(`${prefix}1@example.com`);
		expect(emails[count - 1], 'Остання адреса має мати номер count.').toBe(`${prefix}${count}@example.com`);
	});

	test('generateEmails(0, ...) → порожній масив', () => {
		expect(generateEmails(0, 'qa'), 'Для count = 0 цикл не має виконатися жодного разу — поверни порожній масив.').toEqual([]);
	});
});

describe('Завдання 2: retry', () => {
	test('успіх з першої спроби — fn викликано один раз', () => {
		let calls = 0;
		const result = retry(() => {
			calls++;
			return 'ok';
		}, 3);
		expect(result, 'Поверни результат, який повернула fn.').toBe('ok');
		expect(calls, 'Після першого успіху цикл треба зупинити й одразу повернути результат.').toBe(1);
	});

	test('fn отримує номер спроби, починаючи з 1', () => {
		const seen = [];
		try {
			retry((attempt) => {
				seen.push(attempt);
				throw new Error('збій');
			}, 3);
		} catch {
			// тут нас цікавить лише, з якими номерами викликали fn
		}
		expect(seen, 'Передавай у fn номер поточної спроби: 1, 2, 3.').toEqual([1, 2, 3]);
	});

	test('дві невдачі, потім успіх — повертає результат третьої спроби', () => {
		let calls = 0;
		const result = retry((attempt) => {
			calls++;
			if (attempt < 3) {
				throw new Error(`503 на спробі ${attempt}`);
			}
			return { status: 200 };
		}, 5);
		expect(
			result,
			'Помилка fn не повинна зупиняти retry: перехопи її через try...catch і спробуй ще раз.',
		).toEqual({ status: 200 });
		expect(calls, 'Після успіху на 3-й спробі більше викликів бути не повинно.').toBe(3);
	});

	test.each([
		{ label: '0', value: 0 },
		{ label: "''", value: '' },
		{ label: 'null', value: null },
		{ label: 'false', value: false },
	])('fn повернула $label — це успіх, а не невдача', ({ value }) => {
		let calls = 0;
		const result = retry(() => {
			calls++;
			return value;
		}, 3);
		expect(result, 'retry має повернути те, що повернула fn, без змін.').toBe(value);
		expect(
			calls,
			"Невдача — це лише кинута помилка. Не перевіряй результат на truthy: 0, '' і null — нормальні відповіді.",
		).toBe(1);
	});

	test('усі спроби невдалі — кидає помилку останньої спроби', () => {
		let calls = 0;
		const alwaysFails = (attempt) => {
			calls++;
			throw new Error(`timeout на спробі ${attempt}`);
		};
		expect(
			() => retry(alwaysFails, 3),
			'Коли всі спроби вичерпано, retry має кинути (throw) помилку останньої спроби, а не повернути undefined.',
		).toThrow('timeout на спробі 3');
		expect(
			calls,
			'fn має бути викликана рівно attempts разів. Більше чи менше — помилка на одиницю в умові циклу.',
		).toBe(3);
	});

	test('attempts = 1 — лише одна спроба', () => {
		let calls = 0;
		const failsOnce = () => {
			calls++;
			throw new Error('збій');
		};
		expect(() => retry(failsOnce, 1), 'Єдина спроба невдала — retry має кинути її помилку.').toThrow('збій');
		expect(calls, 'При attempts = 1 fn викликається рівно один раз.').toBe(1);
	});
});

describe('Завдання 3: findFirstFailed', () => {
	test('знаходить єдиний впалий тест', () => {
		const results = [
			{ name: 'login', status: 'passed' },
			{ name: 'add to cart', status: 'failed' },
			{ name: 'logout', status: 'passed' },
		];
		expect(findFirstFailed(results), "Поверни name результату зі status === 'failed'.").toBe('add to cart');
	});

	test('повертає ПЕРШИЙ впалий тест, а не останній', () => {
		const results = [
			{ name: 'login', status: 'passed' },
			{ name: 'checkout', status: 'failed' },
			{ name: 'payment', status: 'failed' },
		];
		expect(
			findFirstFailed(results),
			'Повернуто не перший впалий тест. Вийди з циклу одразу, як знайшов, — через return або break.',
		).toBe('checkout');
	});

	test('не обходить звіт далі після знахідки', () => {
		// Після впалого тесту — пошкоджений запис. Якщо цикл не зупиниться, звернення до null.status впаде.
		const results = [{ name: 'search', status: 'skipped' }, { name: 'filters', status: 'failed' }, null];
		let result;
		expect(() => {
			result = findFirstFailed(results);
		}, 'Цикл продовжив роботу після знахідки й дійшов до пошкодженого запису. Зупиняйся на першому збігу.').not.toThrow();
		expect(result, 'Поверни name першого впалого тесту.').toBe('filters');
	});

	test.each([
		{ label: 'усі пройшли', results: [{ name: 'a', status: 'passed' }, { name: 'b', status: 'skipped' }] },
		{ label: 'порожній звіт', results: [] },
	])('$label → null', ({ results }) => {
		expect(
			findFirstFailed(results),
			'Якщо впалих тестів немає, поверни null явно — після циклу.',
		).toBe(null);
	});
});
