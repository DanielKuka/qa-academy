import { spawnSync } from 'node:child_process';
import { readFileSync } from 'node:fs';
import { createRequire } from 'node:module';
import { pathToFileURL } from 'node:url';
import { describe, expect, test } from 'vitest';
import { loadExercise } from '../../_lib/load.js';
import { exerciseFile } from '../../_lib/shell.js';

/**
 * Імпортує файл учня як простір імен (import * as mod).
 * Якщо файл не завантажився (помилка в імпорті, одруківка в імені), не валимо весь тест-файл,
 * а повертаємо помилку — кожен тест покаже її з підказкою.
 */
async function load(file) {
	try {
		return { mod: await loadExercise(import.meta.url, file), error: undefined };
	} catch (error) {
		return { mod: {}, error };
	}
}

function loadHint(file, error) {
	return (
		`Файл ${file} не завантажився: ${error?.message}\n` +
		'Перевір імпорти в ньому: відносний шлях від цього файлу, розширення .js, ' +
		"фігурні дужки для іменованих експортів і їх відсутність для default."
	);
}

const config = await load('src/config.js');
const usersFile = await load('src/data/users.js');
const checkout = await load('src/checkout.js');
const summary = await load('src/summary.js');
const barrel = await load('src/index.js');

/** Текст файлу учня без коментарів — щоб TODO-коментарі не впливали на перевірки. */
function sourceCode(file) {
	return readFileSync(exerciseFile(import.meta.url, file), 'utf8')
		.replace(/\/\*[\s\S]*?\*\//g, '')
		.replace(/^\s*\/\/.*$/gm, '');
}

const legacy = createRequire(import.meta.url)('./legacy/summary.cjs');

const sampleResults = [
	{ title: 'логін', status: 'passed' },
	{ title: 'кошик', status: 'failed' },
	{ title: 'оплата', status: 'passed' },
];

describe('Завдання 1: src/config.js — іменовані експорти', () => {
	test.each([
		{ name: 'BASE_URL', value: 'https://shop.test' },
		{ name: 'DEFAULT_TIMEOUT', value: 5000 },
	])('експортує $name', ({ name, value }) => {
		expect(config.error, loadHint('src/config.js', config.error)).toBeUndefined();
		expect(
			config.mod[name],
			`У config.js немає іменованого експорту ${name}. Константа без export видна лише всередині свого файлу.`,
		).toBe(value);
	});

	test('не має default-експорту', () => {
		expect(
			config.mod.default,
			'У config.js з\'явився default-експорт, а за завданням тут лише іменовані.',
		).toBeUndefined();
	});
});

describe('Завдання 2: src/data/users.js — default та іменований експорт', () => {
	test('default-експорт — масив тестових користувачів', () => {
		expect(usersFile.error, loadHint('src/data/users.js', usersFile.error)).toBeUndefined();
		expect(
			Array.isArray(usersFile.mod.default),
			'Default-експорт файлу має бути масивом users. Дивись розділ «Default-експорт» уроку.',
		).toBe(true);
		expect(usersFile.mod.default).toHaveLength(3);
	});

	test('findUserByRole — іменований експорт', () => {
		expect(
			typeof usersFile.mod.findUserByRole,
			'findUserByRole не експортовано як іменований експорт (export function ...).',
		).toBe('function');
	});

	test.each(['admin', 'customer', 'manager'])("findUserByRole('%s') знаходить користувача", (role) => {
		const user = usersFile.mod.findUserByRole?.(role);
		expect(user?.role, 'Функція має повернути об\'єкт із масиву users з потрібною роллю (згадай find, урок 08).').toBe(
			role,
		);
		expect(
			user,
			'Поверни сам об\'єкт з масиву users, а не копію — так тест і дані посилаються на одного користувача.',
		).toBe(usersFile.mod.default?.find((candidate) => candidate.role === role));
	});

	test('невідома роль → зрозуміла помилка', () => {
		let error;
		try {
			usersFile.mod.findUserByRole?.('ghost');
		} catch (caught) {
			error = caught;
		}
		expect(
			error?.message,
			'Для ролі, якої немає, кинь new Error з повідомленням `No test user with role "${role}"` (урок 12).',
		).toBe('No test user with role "ghost"');
	});
});

describe('Завдання 3: src/checkout.js — імпорт з інших модулів', () => {
	test('buildCheckoutRequest збирає запит із конфігу і тестових даних', () => {
		expect(checkout.error, loadHint('src/checkout.js', checkout.error)).toBeUndefined();
		expect(typeof checkout.mod.buildCheckoutRequest, 'buildCheckoutRequest має лишатися іменованим експортом.').toBe(
			'function',
		);
		expect(
			checkout.mod.buildCheckoutRequest('customer', ['sku-1', 'sku-2']),
			'Об\'єкт має містити url (BASE_URL + /api/checkout), timeout (DEFAULT_TIMEOUT) і body з email користувача та items.',
		).toEqual({
			url: 'https://shop.test/api/checkout',
			timeout: 5000,
			body: { email: 'customer@shop.test', items: ['sku-1', 'sku-2'] },
		});
	});

	test('для іншої ролі бере іншого користувача', () => {
		expect(
			checkout.mod.buildCheckoutRequest?.('admin', [])?.body?.email,
			'Email має братися через findUserByRole(role), а не бути вписаним рядком.',
		).toBe('admin@shop.test');
	});

	test('адреса й таймаут імпортовані, а не скопійовані', () => {
		const source = sourceCode('src/checkout.js');
		expect(source, "checkout.js має імпортувати BASE_URL і DEFAULT_TIMEOUT з './config.js' — відносний шлях від checkout.js і обов'язкове розширення .js.").toMatch(/from\s+['"]\.\/config\.js['"]/);
		expect(source, "checkout.js має імпортувати findUserByRole з './data/users.js' — відносний шлях і розширення .js.").toMatch(
			/from\s+['"]\.\/data\/users\.js['"]/,
		);
		expect(
			source.includes('shop.test') || source.includes('5000'),
			'У checkout.js вписано адресу або таймаут вручну. Візьми їх з config.js через import — одне джерело правди.',
		).toBe(false);
	});
});

describe('Завдання 4: src/summary.js — CommonJS → ESM', () => {
	test('експортує PASSED і summarize', () => {
		expect(summary.error, loadHint('src/summary.js', summary.error)).toBeUndefined();
		expect(summary.mod.PASSED, 'Немає іменованого експорту PASSED.').toBe(legacy.PASSED);
		expect(typeof summary.mod.summarize, 'Немає іменованого експорту summarize.').toBe('function');
	});

	test('summarize працює так само, як legacy-версія', () => {
		expect(
			summary.mod.summarize?.(sampleResults),
			'Результат має збігатися з legacy/summary.cjs. Перенеси логіку без змін — змінюється лише спосіб експорту.',
		).toBe(legacy.summarize(sampleResults));
		expect(summary.mod.summarize?.([])).toBe(legacy.summarize([]));
	});

	test('у файлі не лишилося CommonJS', () => {
		const source = sourceCode('src/summary.js');
		expect(
			/module\.exports|require\(/.test(source),
			'У summary.js лишився module.exports або require. У ES-модулі їх замінюють export та import.',
		).toBe(false);
	});
});

describe('Завдання 5: src/index.js — barrel-файл', () => {
	test.each(['BASE_URL', 'DEFAULT_TIMEOUT', 'users', 'findUserByRole', 'buildCheckoutRequest', 'summarize'])(
		'реекспортує %s',
		(name) => {
			expect(barrel.error, loadHint('src/index.js', barrel.error)).toBeUndefined();
			expect(
				barrel.mod[name],
				`index.js не реекспортує ${name}. Синтаксис: export { ... } from './файл.js'. ` +
					(name === 'users' ? 'Default-експорт реекспортують як { default as users }.' : ''),
			).toBeDefined();
		},
	);

	test('реекспортує ті самі значення, а не копії', () => {
		expect(
			barrel.mod.users,
			'users з index.js має бути тим самим масивом, що й default з data/users.js. Модуль виконується один раз.',
		).toBe(usersFile.mod.default);
		expect(
			barrel.mod.buildCheckoutRequest,
			'buildCheckoutRequest з index.js має бути тією самою функцією, що й у checkout.js: реекспортуй, а не оголошуй заново.',
		).toBe(checkout.mod.buildCheckoutRequest);
	});

	test('src/index.js запускається в чистому Node.js', () => {
		const indexUrl = pathToFileURL(exerciseFile(import.meta.url, 'src/index.js')).href;
		const script = `const mod = await import(${JSON.stringify(indexUrl)}); console.log(Object.keys(mod).sort().join(','));`;
		const result = spawnSync(process.execPath, ['--input-type=module', '-e', script], {
			encoding: 'utf8',
			timeout: 30_000,
		});
		expect(
			result.stderr.split('\n').find((line) => /Error/.test(line)),
			'Node.js не зміг завантажити src/index.js. ERR_MODULE_NOT_FOUND — найчастіше пропущене розширення .js в імпорті; ' +
				'"does not provide an export named" — одруківка в імені або плутанина default/іменованого.',
		).toBeUndefined();
		expect(result.stdout.trim(), 'index.js має реекспортувати рівно шість імен із завдання.').toBe(
			'BASE_URL,DEFAULT_TIMEOUT,buildCheckoutRequest,findUserByRole,summarize,users',
		);
	});
});
