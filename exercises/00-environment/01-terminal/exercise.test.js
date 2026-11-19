import { existsSync, readFileSync, statSync } from 'node:fs';
import { join } from 'node:path';
import { afterAll, beforeAll, describe, expect, test } from 'vitest';
import { exerciseFile, makeSandbox, removeSandbox, runBashScript } from '../../_lib/shell.js';

const USER_JSON = '{ "email": "qa.user@example.test", "password": "Secret123!" }\n';
const APP_LOG = [
	'2026-11-19 10:00:01 INFO  server started on :3000',
	'2026-11-19 10:00:05 ERROR db connection refused',
	'2026-11-19 10:00:06 WARN  retrying db connection',
	'2026-11-19 10:00:09 INFO  db connected',
	'2026-11-19 10:01:12 ERROR POST /api/login 500',
	'2026-11-19 10:01:13 INFO  GET /api/products 200',
	'2026-11-19 10:02:40 ERROR GET /api/cart 504',
	'',
].join('\n');

let root;
let run;
const path = (p) => join(root, p);
const isDir = (p) => existsSync(path(p)) && statSync(path(p)).isDirectory();
const isFile = (p) => existsSync(path(p)) && statSync(path(p)).isFile();

beforeAll(() => {
	root = makeSandbox({
		'notes.txt': 'Нотатки до тест-плану логіну\n',
		'fixtures/user.json': USER_JSON,
		'logs/app.log': APP_LOG,
		'tmp/cache/session.tmp': 'old',
		'tmp/report.tmp': 'old',
	});
	run = runBashScript(exerciseFile(import.meta.url, 'commands.sh'), root);
});

afterAll(() => removeSandbox(root));

test('скрипт виконується без помилок', () => {
	expect(
		run.stderr.trim(),
		'Bash повідомив про помилку (текст вище). Найчастіше це опечатка в імені команди або шляху, ' +
			'або команда виконується раніше, ніж створена тека, з якою вона працює.',
	).toBe('');
});

describe('Завдання 1: структура тек', () => {
	test('існують project/tests/e2e і project/tests/api', () => {
		expect(
			isDir('project/tests/e2e') && isDir('project/tests/api'),
			'Потрібні обидві теки. За замовчуванням mkdir не створює проміжні теки (project/, tests/) — ' +
				'знайди прапорець, який це вмикає: mkdir --help або розділ «Створення» в уроці.',
		).toBe(true);
	});
});

describe('Завдання 2: порожній файл', () => {
	test('project/tests/e2e/login.spec.ts існує і порожній', () => {
		expect(isFile('project/tests/e2e/login.spec.ts'), 'Файл не знайдено. Яка команда створює порожній файл?').toBe(true);
		expect(readFileSync(path('project/tests/e2e/login.spec.ts'), 'utf8'), 'Файл має бути порожнім.').toBe('');
	});
});

describe('Завдання 3: копіювання', () => {
	test('user.json скопійовано в project/tests/api/', () => {
		expect(isFile('project/tests/api/user.json'), 'Копії немає. Перевір шлях призначення.').toBe(true);
		expect(readFileSync(path('project/tests/api/user.json'), 'utf8'), 'Вміст копії має збігатися з оригіналом.').toBe(
			USER_JSON,
		);
	});

	test('оригінал fixtures/user.json залишився на місці', () => {
		expect(
			isFile('fixtures/user.json'),
			'Оригінал зник — схоже, ти перемістив файл (mv) замість копіювання (cp).',
		).toBe(true);
	});
});

describe('Завдання 4: переміщення з перейменуванням', () => {
	test('notes.txt став project/README.md', () => {
		expect(isFile('project/README.md'), 'Немає project/README.md. Перемістити й перейменувати можна однією командою.').toBe(
			true,
		);
		expect(readFileSync(path('project/README.md'), 'utf8')).toContain('Нотатки до тест-плану');
	});

	test('notes.txt більше немає в корені', () => {
		expect(isFile('notes.txt'), 'notes.txt залишився — ти скопіював файл замість переміщення.').toBe(false);
	});
});

describe('Завдання 5: видалення теки', () => {
	test('tmp/ видалено разом із вмістом', () => {
		expect(
			existsSync(path('tmp')),
			'Тека tmp/ ще існує. Звичайний rm видаляє лише файли, а rmdir — лише порожні теки. Як видалити теку з вмістом? (rm --help)',
		).toBe(false);
	});
});

describe('Завдання 6: пошук у лозі', () => {
	test('project/error-count.txt містить кількість рядків з ERROR', () => {
		expect(
			isFile('project/error-count.txt'),
			'Файлу немає. Вивід команди записують у файл оператором > (див. «Перенаправлення» в уроці).',
		).toBe(true);
		const content = readFileSync(path('project/error-count.txt'), 'utf8').trim();
		expect(
			content,
			'У файлі має бути лише число. Якщо там рядки логу — ти вивів збіги, а не їх кількість: ' +
				'подивись прапорці grep (grep --help), один із них рахує рядки.',
		).toMatch(/^\d+$/);
		expect(Number(content), 'Число неправильне. Перевір, що шукаєш саме ERROR у файлі logs/app.log.').toBe(3);
	});
});
