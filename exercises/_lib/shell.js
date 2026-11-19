/**
 * Помічники для кат, де учень пише команди термінала (bash-скрипт),
 * а тести перевіряють результат на диску.
 *
 * Скрипт учня завжди виконується в ТИМЧАСОВІЙ теці-пісочниці, а не в репозиторії,
 * тож `rm` чи `git` у ньому не зачеплять твої файли.
 */
import { execFileSync, spawnSync } from 'node:child_process';
import { existsSync, mkdirSync, mkdtempSync, readFileSync, rmSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { dirname, join, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

/**
 * Шлях до файлу вправи: твій або еталонний (у режимі `npm run verify:solutions`).
 * @param {string} testFileUrl — `import.meta.url` тестового файлу
 * @param {string} file
 */
export function exerciseFile(testFileUrl, file) {
	const dir = dirname(fileURLToPath(testFileUrl));
	return process.env.QA_SOLUTIONS === '1' ? join(dir, 'solution', file) : join(dir, file);
}

/**
 * Знаходить bash. На Windows беремо Git Bash поруч із git.exe:
 * простий `bash` там може виявитися WSL, який не бачить Windows-шляхів.
 */
export function findBash() {
	if (process.platform !== 'win32') return 'bash';
	const execPath = execFileSync('git', ['--exec-path'], { encoding: 'utf8' }).trim();
	// <Git>/mingw64/libexec/git-core → <Git>/bin/bash.exe
	const candidate = resolve(execPath, '..', '..', '..', 'bin', 'bash.exe');
	if (!existsSync(candidate)) {
		throw new Error(`Не знайдено Git Bash (${candidate}). Встанови Git for Windows: https://git-scm.com/`);
	}
	return candidate;
}

/**
 * Створює тимчасову теку з файлами.
 * @param {Record<string, string>} files — { 'logs/app.log': 'вміст' }
 */
export function makeSandbox(files = {}) {
	const root = mkdtempSync(join(tmpdir(), 'qa-kata-'));
	for (const [path, content] of Object.entries(files)) {
		const full = join(root, path);
		mkdirSync(dirname(full), { recursive: true });
		writeFileSync(full, content);
	}
	return root;
}

export function removeSandbox(root) {
	rmSync(root, { recursive: true, force: true });
}

/**
 * Виконує bash-скрипт у теці `cwd`.
 * Windows-переноси рядків (CRLF) прибираємо: bash їх не розуміє, а редактор міг їх додати.
 * @returns {{ status: number | null, stdout: string, stderr: string }}
 */
export function runBashScript(scriptPath, cwd, env = {}) {
	const script = readFileSync(scriptPath, 'utf8').replace(/\r\n/g, '\n');
	const result = spawnSync(findBash(), ['-s'], {
		cwd,
		input: script,
		encoding: 'utf8',
		env: { ...process.env, ...env },
		timeout: 30_000,
	});
	if (result.error) throw result.error;
	return { status: result.status, stdout: result.stdout, stderr: result.stderr };
}
