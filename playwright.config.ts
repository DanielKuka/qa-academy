import { defineConfig, devices } from '@playwright/test';

/**
 * Тести самої платформи. Перед запуском сайт має бути зібраний:
 *   npm run test:site   (збирає сайт і запускає тести)
 */
const port = 4321;
// У CI сайт зібраний з підшляхом GitHub Pages (напр. /qa-academy) — тестуємо саме цей артефакт.
const basePath = (process.env.BASE_PATH ?? '').replace(/\/$/, '');
const baseURL = `http://127.0.0.1:${port}${basePath}/`;

export default defineConfig({
	testDir: './apps/docs/tests',
	fullyParallel: true,
	forbidOnly: !!process.env.CI,
	retries: process.env.CI ? 1 : 0,
	reporter: process.env.CI ? [['list'], ['html', { open: 'never' }]] : 'list',
	use: {
		baseURL,
		trace: 'retain-on-failure',
	},
	projects: [{ name: 'chromium', use: { ...devices['Desktop Chrome'] } }],
	webServer: {
		command: `npm run preview -w @qa-academy/docs -- --port ${port} --host 127.0.0.1`,
		url: baseURL,
		reuseExistingServer: !process.env.CI,
		timeout: 60_000,
	},
});
