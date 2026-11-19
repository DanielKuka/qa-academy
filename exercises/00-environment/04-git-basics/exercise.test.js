import { execFileSync } from 'node:child_process';
import { join } from 'node:path';
import { afterAll, beforeAll, describe, expect, test } from 'vitest';
import { exerciseFile, makeSandbox, removeSandbox, runBashScript } from '../../_lib/shell.js';

const BRANCH = 'feature/login-test';
const MESSAGE = 'test: add login test';

let root;
let configDir;
let run;
let env;

/** git у пісочниці, ізольований від твоїх глобальних налаштувань (підпис комітів, хуки тощо). */
function git(...args) {
	try {
		return execFileSync('git', args, { cwd: root, encoding: 'utf8', env, stdio: ['ignore', 'pipe', 'pipe'] }).trim();
	} catch {
		return null;
	}
}

beforeAll(() => {
	configDir = makeSandbox({ 'gitconfig': '' });
	root = makeSandbox({
		'README.md': '# Shop tests\n',
		'tests/login.spec.ts': "test('user can log in', async () => {});\n",
		'.env': 'STAGING_PASSWORD=super-secret\n',
		'node_modules/left-pad/index.js': 'module.exports = () => {};\n',
	});
	env = {
		...process.env,
		GIT_CONFIG_GLOBAL: join(configDir, 'gitconfig'),
		GIT_CONFIG_NOSYSTEM: '1',
		GIT_AUTHOR_NAME: 'QA Student',
		GIT_AUTHOR_EMAIL: 'student@example.test',
		GIT_COMMITTER_NAME: 'QA Student',
		GIT_COMMITTER_EMAIL: 'student@example.test',
	};
	execFileSync('git', ['init', '-q', '-b', 'main'], { cwd: root, env });
	execFileSync('git', ['add', 'README.md'], { cwd: root, env });
	execFileSync('git', ['commit', '-q', '-m', 'chore: initial commit'], { cwd: root, env });

	run = runBashScript(exerciseFile(import.meta.url, 'git-steps.sh'), root, env);
});

afterAll(() => {
	removeSandbox(root);
	removeSandbox(configDir);
});

test('git не повідомив про помилки', () => {
	const errors = run.stderr
		.split('\n')
		.filter((line) => /^(fatal|error):|command not found/.test(line));
	expect(errors, 'Git відмовився виконати команду — прочитай його повідомлення, воно зазвичай каже, що робити.').toEqual(
		[],
	);
});

describe('Завдання 1: .gitignore', () => {
	test('.gitignore закомічено і він ігнорує node_modules/ та .env', () => {
		const content = git('show', `${BRANCH}:.gitignore`);
		expect(content, `.gitignore не знайдено в коміті на гілці ${BRANCH}.`).not.toBeNull();
		const rules = content.split('\n').map((line) => line.trim());
		expect(rules.some((r) => /^\/?node_modules\/?$/.test(r)), 'У .gitignore немає правила для node_modules/.').toBe(
			true,
		);
		expect(rules.some((r) => /^\/?\.env$/.test(r)), 'У .gitignore немає правила для .env.').toBe(true);
	});
});

describe('Завдання 2: гілка', () => {
	test(`гілка ${BRANCH} існує`, () => {
		expect(
			git('rev-parse', '--verify', '--quiet', `refs/heads/${BRANCH}`),
			`Гілки ${BRANCH} немає. Перевір назву (з дефісом і скісною рискою) і команду створення гілки.`,
		).not.toBeNull();
	});
});

describe('Завдання 3: коміт', () => {
	test('на гілці рівно один новий коміт з правильним повідомленням', () => {
		const messages = (git('log', '--format=%s', `main..${BRANCH}`) ?? '').split('\n').filter(Boolean);
		expect(messages.length, 'На feature-гілці має бути рівно один новий коміт відносно main.').toBe(1);
		expect(messages[0], 'Повідомлення коміту має бути точно таким, як у завданні.').toBe(MESSAGE);
	});

	test('у коміті тільки потрібні файли', () => {
		const files = (git('ls-tree', '-r', '--name-only', BRANCH) ?? '').split('\n').filter(Boolean).sort();
		expect(
			files.filter((f) => f === '.env'),
			'.env потрапив у коміт! Паролі в git — це витік, навіть якщо потім видалити файл: він лишається в історії. ' +
				'Подумай, у якому порядку мають іти завдання 1 і git add.',
		).toEqual([]);
		expect(
			files.some((f) => f.startsWith('node_modules/')),
			'node_modules/ потрапив у коміт. Залежності не комітять — їх відновлює npm install.',
		).toBe(false);
		expect(files, 'Перелік файлів у гілці не збігається з очікуваним.').toEqual([
			'.gitignore',
			'README.md',
			'tests/login.spec.ts',
		]);
	});

	test('main не змінився', () => {
		expect(
			git('rev-list', '--count', 'main'),
			'На main з\'явилися нові коміти. Ти закомітив до того, як перейшов на feature-гілку?',
		).toBe('1');
	});
});

describe('Завдання 4: повернення на main', () => {
	test('поточна гілка — main', () => {
		expect(git('branch', '--show-current'), 'Наприкінці скрипта треба перейти назад на main.').toBe('main');
	});
});
