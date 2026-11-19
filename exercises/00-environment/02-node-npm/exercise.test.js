import { spawnSync } from 'node:child_process';
import { readFileSync } from 'node:fs';
import { join } from 'node:path';
import { beforeAll, describe, expect, test } from 'vitest';
import { exerciseFile } from '../../_lib/shell.js';

const projectDir = exerciseFile(import.meta.url, 'my-project');

/** Запускає npm-скрипт у my-project так само, як ти робиш це в терміналі. */
function npmRun(script) {
	const result = spawnSync(`npm run ${script} --silent`, {
		cwd: projectDir,
		encoding: 'utf8',
		shell: true,
		timeout: 60_000,
	});
	return { status: result.status, output: `${result.stdout}\n${result.stderr}` };
}

let pkg;
let parseError;

beforeAll(() => {
	try {
		pkg = JSON.parse(readFileSync(join(projectDir, 'package.json'), 'utf8'));
	} catch (error) {
		parseError = error;
	}
});

test('package.json — валідний JSON', () => {
	expect(
		parseError?.message,
		'package.json не читається як JSON. Типові причини: кома після останнього елемента, ' +
			'одинарні лапки замість подвійних, коментар (у JSON їх не буває).',
	).toBeUndefined();
});

describe('Завдання 1: ES-модулі', () => {
	test('проєкт оголошено як ES-модулі', () => {
		expect(
			pkg?.type,
			'Node.js має знати, що import/export у .js-файлах — це ES-модулі. ' +
				'Знайди в документації Node.js поле package.json, яке це визначає (розділ «Modules: Packages»).',
		).toBe('module');
	});
});

describe('Завдання 2: скрипт start', () => {
	test('scripts.start існує', () => {
		expect(pkg?.scripts?.start, 'У розділі "scripts" немає команди "start".').toBeTypeOf('string');
	});

	test('npm start друкує звіт', () => {
		const { status, output } = npmRun('start');
		expect(status, `npm start завершився з помилкою:\n${output}`).toBe(0);
		expect(output, 'Скрипт має запускати файл src/index.js через node.').toContain(
			'Тестовий звіт: 3 passed, 1 failed',
		);
	});
});

describe('Завдання 3: скрипт test', () => {
	test('npm test запускає тести з теки test/', () => {
		expect(pkg?.scripts?.test, 'У розділі "scripts" немає команди "test".').toBeTypeOf('string');
		const { status, output } = npmRun('test');
		expect(status, `npm test завершився з помилкою:\n${output}`).toBe(0);
		expect(
			output,
			'Тести не запустилися. Node.js має вбудований тест-раннер — дивись розділ «Test runner» ' +
				'у документації Node.js: як його запустити з командного рядка.',
		).toMatch(/tests 2\b/);
	});
});

describe('Завдання 4: залежність для розробки', () => {
	test('@playwright/test — у devDependencies, а не в dependencies', () => {
		expect(
			pkg?.dependencies?.['@playwright/test'],
			'@playwright/test потрапив у dependencies. Інструменти для тестів потрібні лише під час розробки — ' +
				'подивись, який прапорець npm install кладе пакет в інший розділ.',
		).toBeUndefined();
		expect(
			pkg?.devDependencies?.['@playwright/test'],
			'У devDependencies немає @playwright/test. Встанови його командою npm install з потрібним прапорцем.',
		).toBeTypeOf('string');
	});

	test('версія вказана діапазоном з ^', () => {
		expect(
			pkg?.devDependencies?.['@playwright/test'],
			'npm install за замовчуванням записує версію з ^ (напр. "^1.65.1"). Якщо в тебе інакше — ' +
				'ти, мабуть, вписав версію руками. Встанови пакет командою, а не редагуванням файлу.',
		).toMatch(/^\^\d+\.\d+\.\d+/);
	});
});

describe('Завдання 5: версія Node.js', () => {
	test('engines.node вимагає Node.js 22+', () => {
		expect(
			pkg?.engines?.node,
			'Додай об\'єкт "engines" з полем "node". Формат діапазону — як у версій пакетів: «22 або новіша».',
		).toBe('>=22');
	});
});
