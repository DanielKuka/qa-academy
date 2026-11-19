import { describe, expect, test } from 'vitest';
import { loadExercise } from '../../_lib/load.js';

const exercise = await loadExercise(import.meta.url);

// Обгортки перевіряють «форму» результату, щоб замість TypeError ти бачив підказку.
function createIdGenerator(prefix) {
	const generator = exercise.createIdGenerator(prefix);
	expect(
		typeof generator,
		'createIdGenerator має ПОВЕРТАТИ функцію (return () => ...), а не id. Дивись розділ «Замикання» уроку.',
	).toBe('function');
	return generator;
}

function createCounter() {
	const counter = exercise.createCounter();
	expect(typeof counter, "createCounter має повертати об'єкт із трьома методами.").toBe('object');
	for (const method of ['increment', 'reset', 'value']) {
		expect(typeof counter?.[method], `У повернутому об'єкті немає методу ${method}().`).toBe('function');
	}
	return counter;
}

function once(fn) {
	const wrapped = exercise.once(fn);
	expect(typeof wrapped, 'once має повертати нову функцію-обгортку.').toBe('function');
	return wrapped;
}

function memoize(fn) {
	const wrapped = exercise.memoize(fn);
	expect(typeof wrapped, 'memoize має повертати нову функцію.').toBe('function');
	return wrapped;
}

/** Функція-«шпигун»: рахує, скільки разів її викликали, і запам'ятовує аргументи. */
function spy(impl) {
	const calls = [];
	const fn = (...args) => {
		calls.push(args);
		return impl(...args);
	};
	return { fn, calls };
}

describe('Завдання 1: createIdGenerator', () => {
	test('повертає функцію', () => {
		createIdGenerator('user');
	});

	test("видає 'user-1', 'user-2', 'user-3' по черзі", () => {
		const nextUserId = createIdGenerator('user');
		expect(nextUserId(), 'Перший id має бути з номером 1 і дефісом: `${prefix}-1`.').toBe('user-1');
		expect(
			nextUserId(),
			'Другий виклик має дати наступний номер. Якщо знову 1 — лічильник оголошено ВСЕРЕДИНІ внутрішньої функції, ' +
				'тож він створюється заново щоразу. Перенеси його у зовнішню.',
		).toBe('user-2');
		expect(nextUserId()).toBe('user-3');
	});

	test('два генератори мають незалежні лічильники', () => {
		const nextUserId = createIdGenerator('user');
		const nextOrderId = createIdGenerator('order');
		nextUserId();
		nextUserId();
		expect(
			nextOrderId(),
			'Генератор замовлень почав не з 1 — лічильник спільний для всіх генераторів. ' +
				'Мабуть, змінна оголошена на рівні файлу. Вона має жити всередині createIdGenerator.',
		).toBe('order-1');
		expect(nextUserId(), 'Генератор користувачів має продовжити свою нумерацію.').toBe('user-3');
	});

	test('новий генератор з тим самим префіксом починає з 1', () => {
		createIdGenerator('user')();
		expect(
			createIdGenerator('user')(),
			'Кожен виклик createIdGenerator — це новий генератор зі своїм стартом з 1, навіть з тим самим префіксом.',
		).toBe('user-1');
	});
});

describe('Завдання 2: createCounter', () => {
	test("повертає об'єкт з методами increment, reset, value", () => {
		createCounter();
	});

	test('increment() збільшує і повертає нове значення, value() його читає', () => {
		const retries = createCounter();
		expect(retries.value(), 'Новий лічильник має починати з 0.').toBe(0);
		expect(retries.increment(), 'increment() має ПОВЕРНУТИ нове значення (1).').toBe(1);
		expect(retries.increment()).toBe(2);
		expect(retries.value(), 'value() має повертати поточне значення, нічого не змінюючи.').toBe(2);
		expect(retries.value(), 'Повторний value() не повинен змінювати лічильник.').toBe(2);
	});

	test('reset() скидає до 0', () => {
		const retries = createCounter();
		retries.increment();
		retries.increment();
		retries.reset();
		expect(retries.value(), 'Після reset() значення має бути 0.').toBe(0);
		expect(retries.increment(), 'Після reset() рахунок починається знову з 1.').toBe(1);
	});

	test('лічильники незалежні', () => {
		const a = createCounter();
		const b = createCounter();
		a.increment();
		a.increment();
		b.increment();
		expect(a.value(), 'Лічильники впливають один на одного — стан має створюватися при КОЖНОМУ виклику createCounter.').toBe(2);
		expect(b.value()).toBe(1);
		a.reset();
		expect(b.value(), 'reset() одного лічильника не повинен чіпати інший.').toBe(1);
	});

	test('значення приховане в замиканні, а не у властивості', () => {
		const counter = createCounter();
		counter.increment();
		const numericProps = Object.keys(counter).filter((key) => typeof counter[key] === 'number');
		expect(
			numericProps,
			"Число лежить у властивості об'єкта — його може змінити будь-хто ззовні. " +
				"Зберігай його у змінній всередині createCounter, а не в об'єкті.",
		).toEqual([]);
	});
});

describe('Завдання 3: once', () => {
	test('перший виклик запускає fn з аргументами і повертає її результат', () => {
		const { fn, calls } = spy((env) => `БД для ${env} готова`);
		const setup = once(fn);
		expect(setup('staging'), 'Перший виклик має повернути те, що повернула fn.').toBe('БД для staging готова');
		expect(calls, 'fn має отримати ті самі аргументи, що й обгортка. Згадай rest-параметри і spread (урок 10).').toEqual([
			['staging'],
		]);
	});

	test('наступні виклики не запускають fn і повертають перший результат', () => {
		const { fn, calls } = spy((env) => `БД для ${env} готова`);
		const setup = once(fn);
		setup('staging');
		expect(setup('prod'), 'Повторний виклик має повернути ЗБЕРЕЖЕНИЙ перший результат.').toBe('БД для staging готова');
		setup('dev');
		expect(calls.length, 'fn виконалася більше одного разу. Запам\'ятай у замиканні, що виклик уже був.').toBe(1);
	});

	test('працює, навіть якщо fn повертає undefined', () => {
		const { fn, calls } = spy(() => undefined);
		const cleanDb = once(fn);
		cleanDb();
		cleanDb();
		expect(
			calls.length,
			'Якщо перевіряти «чи вже є результат», то undefined виглядає як «ще не викликали». ' +
				'Зберігай окремий прапорець, що виклик відбувся.',
		).toBe(1);
	});

	test('дві обгортки однієї функції незалежні', () => {
		const { fn, calls } = spy((x) => x);
		const first = once(fn);
		const second = once(fn);
		first('a');
		expect(second('b'), 'Кожен виклик once — окреме замикання зі своїм прапорцем.').toBe('b');
		expect(calls.length).toBe(2);
	});
});

describe('Завдання 4: memoize', () => {
	test('повертає результат fn для нового ключа', () => {
		const { fn } = spy((role) => `token-${role}`);
		const getToken = memoize(fn);
		expect(getToken('admin'), 'Для нового ключа треба викликати fn(key) і повернути її результат.').toBe('token-admin');
	});

	test('повторний виклик з тим самим ключем бере результат з кешу', () => {
		const { fn, calls } = spy((role) => `token-${role}`);
		const getToken = memoize(fn);
		getToken('admin');
		expect(getToken('admin')).toBe('token-admin');
		getToken('admin');
		expect(
			calls.length,
			"fn викликалася повторно для того самого ключа. Збережи результат в об'єкті-кеші всередині memoize.",
		).toBe(1);
	});

	test('різні ключі кешуються окремо', () => {
		const { fn, calls } = spy((role) => `token-${role}`);
		const getToken = memoize(fn);
		expect(getToken('admin')).toBe('token-admin');
		expect(getToken('guest'), 'Для іншого ключа результат має бути свій — кеш за ключем, а не одне значення.').toBe(
			'token-guest',
		);
		getToken('guest');
		getToken('admin');
		expect(calls).toEqual([['admin'], ['guest']]);
	});

	test.each([
		{ label: '0', result: 0 },
		{ label: "''", result: '' },
		{ label: 'undefined', result: undefined },
	])('кешує навіть falsy-результат $label', ({ result }) => {
		const { fn, calls } = spy(() => result);
		const lookup = memoize(fn);
		lookup('key');
		expect(lookup('key')).toBe(result);
		expect(
			calls.length,
			'Перевірка `if (cache[key])` вважає falsy-результат відсутнім. Перевіряй наявність ключа: Object.hasOwn(cache, key).',
		).toBe(1);
	});

	test('кожна memoize-функція має власний кеш', () => {
		const tokens = memoize((role) => `token-${role}`);
		const emails = memoize((role) => `${role}@test.dev`);
		tokens('admin');
		expect(emails('admin'), 'Кеш спільний для всіх memoize — мабуть, він оголошений поза функцією.').toBe(
			'admin@test.dev',
		);
	});
});
