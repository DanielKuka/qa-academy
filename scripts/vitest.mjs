// Запуск Vitest для кат: `npm run check` і `npm run verify:solutions` викликають цей файл.
//
// Навіщо обгортка: на Windows термінал, відкритий у `d:\...` (мала літера диска), змушує Vitest
// завантажити себе двічі — за шляхами `d:/` і `D:/` — і всі тести падають з
// «Vitest failed to find the runner». Конфіг Vitest виправити це не встигає, тому стартуємо Vitest
// з кореня проєкту, взятого з адреси цього файлу (там літера диска завжди правильна).
// На macOS/Linux обгортка просто передає аргументи у Vitest.
import { spawnSync } from 'node:child_process';
import { realpathSync } from 'node:fs';
import { createRequire } from 'node:module';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const root = realpathSync.native(join(dirname(fileURLToPath(import.meta.url)), '..'));
const vitestCli = join(dirname(createRequire(import.meta.url).resolve('vitest/package.json')), 'vitest.mjs');

const { status, error } = spawnSync(process.execPath, [vitestCli, ...process.argv.slice(2)], {
	cwd: root,
	stdio: 'inherit',
});

if (error) throw error;
process.exit(status ?? 1);
