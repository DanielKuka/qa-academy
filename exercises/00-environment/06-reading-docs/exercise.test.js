import { createHash } from 'node:crypto';
import { describe, expect, test } from 'vitest';
import { loadExercise } from '../../_lib/load.js';

const { answers = {} } = await loadExercise(import.meta.url);

/** Прибирає те, що не впливає на зміст відповіді: регістр, пробіли, лапки, дужки після методу. */
function normalize(value) {
	return String(value ?? '')
		.trim()
		.toLowerCase()
		.replace(/^[`'"]+|[`'"]+$/g, '')
		.replace(/^array\.prototype\./, '')
		.replace(/\(\)$/, '')
		.replace(/\s+/g, ' ');
}

const sha256 = (text) => createHash('sha256').update(text).digest('hex');

// Зберігаємо лише хеші — тест не видає відповідей.
const questions = [
	{
		key: 'npmInstallFromLockfile',
		hash: '9db3f780def6105eee3cc930de4d0982607760820fddaa3facdd3813ccb40628',
		where: 'docs.npmjs.com → CLI Commands: шукай команду, призначену для CI та автоматизованих середовищ.',
	},
	{
		key: 'tooManyRequestsStatus',
		hash: '2d1007980f49215311f7f1012e84f99b801eb5daeca04dedea3ada41cc45353b',
		where: 'MDN → HTTP response status codes → розділ «Client error responses» (коди 4xx).',
	},
	{
		key: 'playwrightUiFlag',
		hash: '26653d3c57de1129e7a67402bf8c3cd14d50eb7358afb678631af8e4e9c9b1c5',
		where: 'playwright.dev → Command line: таблиця опцій `npx playwright test`.',
	},
	{
		key: 'playwrightRetriesOption',
		hash: 'fcf7f53846d43d24f6d5fd1074cf0aa9d2e0ed5dcfdd887b25577d88f226e622',
		where: 'playwright.dev → Retries: подивись приклад playwright.config.ts.',
	},
	{
		key: 'arraySomeMatchMethod',
		hash: 'a6b46dd0d1ae5e86cbc8f37e75ceeb6760230c1ca4ffbcb0c97b96dd7d9c464b',
		where: 'MDN → Array → Instance methods: пройдись описами методів, що повертають boolean.',
	},
	{
		key: 'gitFixLastCommitFlag',
		hash: '966d71f846c79bb53258971d6b4205a03b75516c6a242cffe0bdacc1ee9c944c',
		where: 'git-scm.com/docs/git-commit → розділ OPTIONS.',
	},
	{
		key: 'nodeTestRunnerModule',
		hash: '95275b611231c0aeaac022a43c1a74bbcf6fd5e8ea95c3e18397ce0edf43077f',
		where: 'nodejs.org/api → Test runner: перший приклад коду на сторінці. Вбудовані модулі мають префікс.',
	},
];

describe('Квест у документації', () => {
	test.each(questions)('$key', ({ key, hash, where }) => {
		const given = normalize(answers[key]);
		expect(given, `Відповідь ще порожня. Де шукати: ${where}`).not.toMatch(/^(0)?$/);
		expect(sha256(given) === hash, `Відповідь «${answers[key]}» неправильна. Де шукати: ${where}`).toBe(true);
	});
});
