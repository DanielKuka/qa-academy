import { expect, test, type Page } from '@playwright/test';

// Шляхи відносні (без / на початку): так вони працюють і з підшляхом GitHub Pages.

const LESSON = 'modules/01-javascript/01-variables-types/';
const MODULE = 'modules/01-javascript/';
const LESSON_TITLE = 'Змінні, значення і типи';

const lessonPanel = (page: Page) => page.getByRole('complementary', { name: 'Як у тебе з цим уроком?' });
const lessonRow = (page: Page, title: string, list = 'Уроки') =>
	page.getByRole('list', { name: list }).getByRole('listitem').filter({ hasText: title });
const lessonStatus = (page: Page) => lessonPanel(page).getByRole('status');

test.describe('Позначки уроку', () => {
	test('урок позначається як пройдений і це видно на сторінці модуля після перезавантаження', async ({ page }) => {
		await page.goto(LESSON);
		const panel = lessonPanel(page);
		await expect(lessonStatus(page)).toHaveText('Не почато');

		await panel.getByRole('button', { name: 'Пройдено ✓' }).click();
		await expect(lessonStatus(page)).toHaveText('Пройдено');
		await expect(panel.getByRole('button', { name: 'Пройдено ✓' })).toHaveAttribute('aria-pressed', 'true');

		await page.reload();
		await expect(lessonStatus(page)).toHaveText('Пройдено');

		await page.goto(MODULE);
		await expect(lessonRow(page, LESSON_TITLE).getByText('Пройдено')).toBeVisible();
		await expect(page.getByText('1 з 14 уроків').first()).toBeVisible();
	});

	test('кнопка «Скинути» повертає урок у стан «Не почато»', async ({ page }) => {
		await page.goto(LESSON);
		const panel = lessonPanel(page);
		await panel.getByRole('button', { name: 'Вже знаю — пропустити' }).click();
		await expect(lessonStatus(page)).toHaveText('Вже знаю');

		await panel.getByRole('button', { name: 'Скинути' }).click();
		await expect(lessonStatus(page)).toHaveText('Не почато');
	});
});

test.describe('Пропуск модуля після самоперевірки', () => {
	test('модуль можна пропустити лише після підтвердження всіх навичок', async ({ page }) => {
		await page.goto(MODULE);
		const confirm = page.getByRole('button', { name: 'Позначити модуль як «вже знаю»' });
		const skills = page.getByRole('checkbox');

		await expect(skills).toHaveCount(6);
		await expect(confirm).toBeDisabled();

		// Усі, крім однієї, — кнопка все ще недоступна.
		for (const box of (await skills.all()).slice(0, -1)) await box.check();
		await expect(confirm).toBeDisabled();

		await skills.last().check();
		await expect(confirm).toBeEnabled();
		await confirm.click();

		await expect(page.getByText('Модуль позначено як «вже знаю».')).toBeVisible();
		await expect(lessonRow(page, LESSON_TITLE).getByText('Вже знаю')).toBeVisible();
		await expect(page.getByText('14 з 14 уроків').first()).toBeVisible();

		// Позначка модуля поширюється і на сторінку уроку.
		await page.goto(LESSON);
		await expect(lessonStatus(page)).toHaveText('Вже знаю');
	});

	test('пропуск модуля можна скасувати', async ({ page }) => {
		await page.goto(MODULE);
		for (const box of await page.getByRole('checkbox').all()) await box.check();
		await page.getByRole('button', { name: 'Позначити модуль як «вже знаю»' }).click();

		await page.getByRole('button', { name: 'Повернути модуль у навчання' }).click();
		await expect(page.getByRole('button', { name: 'Позначити модуль як «вже знаю»' })).toBeDisabled();
		await expect(lessonRow(page, LESSON_TITLE).getByText('Не почато')).toBeVisible();
		await expect(page.getByRole('checkbox').first()).not.toBeChecked();
	});

	test('ненаписані уроки показані як «у розробці» і не є посиланнями', async ({ page }) => {
		// Модуль 02 ще не написаний — його уроки мають бути заглушками.
		await page.goto('modules/02-async/');
		const row = lessonRow(page, 'Колбеки');
		await expect(row.getByText('у розробці')).toBeVisible();
		await expect(row.getByRole('link')).toHaveCount(0);

		await page.goto(MODULE);
		await expect(lessonRow(page, LESSON_TITLE).getByRole('link', { name: LESSON_TITLE })).toBeVisible();
	});
});

test.describe('Сторінка прогресу', () => {
	test('підказує наступний урок і рахує загальний прогрес', async ({ page }) => {
		await page.goto('progress/');
		const next = page.getByText('Продовжити з:');
		await expect(next.getByRole('link')).toHaveText('Середовище розробника → Термінал: базові команди');

		await next.getByRole('link').click();
		await lessonPanel(page).getByRole('button', { name: 'Пройдено ✓' }).click();

		await page.goto('progress/');
		await expect(next.getByRole('link')).toHaveText('Середовище розробника → Node.js і npm');
		await expect(page.getByText('1%', { exact: true })).toBeVisible();
	});

	test('експорт і імпорт переносять прогрес в інший браузер', async ({ page, browser }) => {
		await page.goto(LESSON);
		await lessonPanel(page).getByRole('button', { name: 'Вивчаю' }).click();

		await page.goto('progress/');
		const downloadPromise = page.waitForEvent('download');
		await page.getByRole('button', { name: 'Експортувати прогрес (JSON)' }).click();
		const download = await downloadPromise;
		expect(download.suggestedFilename()).toMatch(/^qa-academy-progress-\d{4}-\d{2}-\d{2}\.json$/);
		const file = await download.path();

		// Новий контекст = «чистий» браузер без прогресу.
		const context = await browser.newContext();
		const fresh = await context.newPage();
		await fresh.goto('progress/');
		await fresh.getByText('Імпортувати прогрес').locator('input[type=file]').setInputFiles(file);
		await expect(fresh.getByText('Прогрес імпортовано.')).toBeVisible();

		await fresh.goto(LESSON);
		await expect(lessonStatus(fresh)).toHaveText('Вивчаю');
		await context.close();
	});

	test('пошкоджений файл імпорту не ламає прогрес', async ({ page }) => {
		await page.goto('progress/');
		await page
			.getByText('Імпортувати прогрес')
			.locator('input[type=file]')
			.setInputFiles({ name: 'broken.json', mimeType: 'application/json', buffer: Buffer.from('{not json') });
		await expect(page.getByText('Не вдалося прочитати файл прогресу.')).toBeVisible();
	});
});

test.describe('Англійська версія', () => {
	test('сторінка модуля показує англійський інтерфейс', async ({ page }) => {
		await page.goto('en/modules/01-javascript/');
		await expect(page.getByRole('heading', { name: 'JavaScript fundamentals', level: 1 })).toBeVisible();
		await expect(page.getByRole('button', { name: 'Mark module as “already known”' })).toBeDisabled();
		await expect(lessonRow(page, 'Variables, values and types', 'Lessons').getByText('Not started')).toBeVisible();
	});
});
