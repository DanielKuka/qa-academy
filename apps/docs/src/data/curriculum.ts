/**
 * Єдине джерело правди про структуру курсу.
 *
 * З цих даних будуються: бокове меню, карта курсу, сторінки модулів,
 * сторінка прогресу та перевірка «я це вже знаю».
 *
 * Сторінка уроку живе за шляхом:
 *   src/content/docs/modules/<module.id>/<lesson.id>.mdx      (українська)
 *   src/content/docs/en/modules/<module.id>/<lesson.id>.mdx   (English)
 * Якщо файлу ще немає — урок показується як «у розробці».
 */

export type Locale = 'uk' | 'en';
export type Text = Record<Locale, string>;

export type Level = 'foundation' | 'junior' | 'middle' | 'sdet';

export interface Lesson {
	/** Ім'я файлу уроку без розширення, напр. `01-variables-types`. */
	id: string;
	title: Text;
}

export interface Module {
	/** Ім'я теки модуля, напр. `01-javascript`. */
	id: string;
	level: Level;
	title: Text;
	/** Одне речення: що ти вмітимеш після модуля. */
	outcome: Text;
	lessons: Lesson[];
	/**
	 * Контрольні навички. Щоб позначити модуль як «вже знаю»,
	 * учень має чесно підтвердити кожну з них.
	 */
	checkpoints: Text[];
}

export const levels: Record<Level, Text> = {
	foundation: { uk: 'Основа', en: 'Foundation' },
	junior: { uk: 'Junior', en: 'Junior' },
	middle: { uk: 'Middle', en: 'Middle' },
	sdet: { uk: 'SDET', en: 'SDET' },
};

const l = (id: string, uk: string, en: string): Lesson => ({ id, title: { uk, en } });
const t = (uk: string, en: string): Text => ({ uk, en });

export const modules: Module[] = [
	{
		id: '00-environment',
		level: 'foundation',
		title: t('Середовище розробника', 'Developer environment'),
		outcome: t(
			'Налаштоване робоче місце: термінал, Node.js, VS Code, Git і GitHub.',
			'A working setup: terminal, Node.js, VS Code, Git and GitHub.',
		),
		lessons: [
			l('01-terminal', 'Термінал: базові команди', 'Terminal basics'),
			l('02-node-npm', 'Node.js і npm', 'Node.js and npm'),
			l('03-vscode', 'VS Code для автоматизатора', 'VS Code for automation engineers'),
			l('04-git-basics', 'Git: перші кроки', 'Git: first steps'),
			l('05-github', 'GitHub: репозиторій, fork, pull request', 'GitHub: repository, fork, pull request'),
			l('06-reading-docs', 'Як читати документацію і шукати відповіді', 'Reading docs and finding answers'),
		],
		checkpoints: [
			t('Я переходжу між папками, створюю й видаляю файли з термінала', 'I navigate folders and create/delete files from the terminal'),
			t('Я встановлюю пакети через npm і запускаю скрипти з package.json', 'I install packages with npm and run package.json scripts'),
			t('Я роблю commit, створюю гілку і пушу її на GitHub', 'I commit, create a branch and push it to GitHub'),
			t('Я налаштував VS Code: форматування, вбудований термінал, розширення', 'I set up VS Code: formatting, integrated terminal, extensions'),
		],
	},
	{
		id: '01-javascript',
		level: 'foundation',
		title: t('JavaScript: основи', 'JavaScript fundamentals'),
		outcome: t(
			'Ти пишеш утиліти та генератори тестових даних на чистому JavaScript.',
			'You write utilities and test-data generators in plain JavaScript.',
		),
		lessons: [
			l('01-variables-types', 'Змінні, значення і типи', 'Variables, values and types'),
			l('02-operators', 'Оператори і порівняння', 'Operators and comparison'),
			l('03-conditions', 'Умовні оператори', 'Conditionals'),
			l('04-loops', 'Цикли', 'Loops'),
			l('05-functions', 'Функції', 'Functions'),
			l('06-strings', 'Рядки і шаблонні літерали', 'Strings and template literals'),
			l('07-arrays', 'Масиви', 'Arrays'),
			l('08-array-methods', 'map, filter, reduce, find', 'map, filter, reduce, find'),
			l('09-objects', "Об'єкти", 'Objects'),
			l('10-destructuring-spread', 'Деструктуризація і spread', 'Destructuring and spread'),
			l('11-scope-closures', 'Область видимості і замикання', 'Scope and closures'),
			l('12-errors', 'Помилки: try/catch і throw', 'Errors: try/catch and throw'),
			l('13-modules', 'Модулі: import / export', 'Modules: import / export'),
			l('14-classes', 'Класи і this', 'Classes and this'),
		],
		checkpoints: [
			t('Я поясню різницю між let, const, null, undefined і між == та ===', 'I can explain let vs const, null vs undefined, and == vs ==='),
			t('Я пишу функції з умовами і циклами без підглядання', 'I write functions with conditions and loops without looking things up'),
			t('Я впевнено використовую map, filter, reduce і find', 'I confidently use map, filter, reduce and find'),
			t("Я працюю з об'єктами, деструктуризацією і spread", 'I work with objects, destructuring and spread'),
			t('Я поясню, що таке замикання, і наведу приклад', 'I can explain a closure and give an example'),
			t('Я розбиваю код на модулі через import/export і пишу прості класи', 'I split code into modules with import/export and write simple classes'),
		],
	},
	{
		id: '02-async',
		level: 'foundation',
		title: t('Асинхронний JavaScript', 'Asynchronous JavaScript'),
		outcome: t(
			'Ти розумієш, як працює await у тестах і чому тести стають нестабільними (flaky).',
			'You understand how await works in tests and why tests become flaky.',
		),
		lessons: [
			l('01-event-loop', 'Event loop: як JavaScript виконує код', 'The event loop'),
			l('02-callbacks', 'Колбеки', 'Callbacks'),
			l('03-promises', 'Promise', 'Promises'),
			l('04-async-await', 'async / await', 'async / await'),
			l('05-parallel', 'Promise.all, allSettled, race', 'Promise.all, allSettled, race'),
			l('06-polling', 'Таймери і polling без sleep', 'Timers and polling without sleep'),
			l('07-async-errors', 'Помилки в асинхронному коді', 'Errors in async code'),
			l('08-async-and-flaky', 'Асинхронність і flaky-тести', 'Async code and flaky tests'),
		],
		checkpoints: [
			t('Я поясню event loop і різницю між мікро- та макрозадачами', 'I can explain the event loop and micro- vs macrotasks'),
			t('Я пишу async-функції та обробляю в них помилки', 'I write async functions and handle their errors'),
			t('Я знаю, коли потрібен Promise.all, а коли — послідовний await', 'I know when to use Promise.all versus sequential await'),
			t('Я пишу polling-функцію з таймаутом замість sleep', 'I write a polling helper with a timeout instead of sleep'),
			t('Я знаходжу забутий await у чужому коді', 'I can spot a missing await in someone else’s code'),
		],
	},
	{
		id: '03-typescript',
		level: 'foundation',
		title: t('TypeScript', 'TypeScript'),
		outcome: t(
			'Ти типізуєш тестові дані, фікстури та відповіді API.',
			'You type test data, fixtures and API responses.',
		),
		lessons: [
			l('01-why-typescript', 'Навіщо TypeScript у тестах', 'Why TypeScript in tests'),
			l('02-basic-types', 'Базові типи', 'Basic types'),
			l('03-interfaces-types', 'interface і type', 'interface and type'),
			l('04-unions-narrowing', 'Union-типи і звуження', 'Unions and narrowing'),
			l('05-functions', 'Типізація функцій', 'Typing functions'),
			l('06-generics', 'Generics', 'Generics'),
			l('07-utility-types', 'Utility types', 'Utility types'),
			l('08-classes', 'Класи в TypeScript', 'Classes in TypeScript'),
			l('09-tsconfig', 'tsconfig і модулі', 'tsconfig and modules'),
			l('10-api-types', 'Типізація відповідей API', 'Typing API responses'),
		],
		checkpoints: [
			t('Я описую дані через interface/type і розумію різницю', 'I describe data with interface/type and know the difference'),
			t('Я використовую union-типи та звуження (narrowing)', 'I use unions and narrowing'),
			t('Я пишу generic-функцію і читаю generics у чужих типах', 'I write a generic function and read generics in library types'),
			t('Я застосовую Partial, Pick, Omit, Record', 'I apply Partial, Pick, Omit and Record'),
			t('Я читаю помилки компілятора і виправляю їх', 'I read compiler errors and fix them'),
		],
	},
	{
		id: '04-web',
		level: 'junior',
		title: t('Як працює веб', 'How the web works'),
		outcome: t(
			'Ти розумієш, що відбувається між браузером і сервером, і бачиш це в DevTools.',
			'You understand what happens between browser and server and can see it in DevTools.',
		),
		lessons: [
			l('01-client-server', 'Клієнт, сервер, DNS, HTTPS', 'Client, server, DNS, HTTPS'),
			l('02-http', 'HTTP: методи, статуси, заголовки', 'HTTP: methods, status codes, headers'),
			l('03-rest-json', 'REST і JSON', 'REST and JSON'),
			l('04-dom', 'DOM', 'The DOM'),
			l('05-css-selectors', 'CSS-селектори', 'CSS selectors'),
			l('06-xpath', 'XPath: коли він справді потрібен', 'XPath: when you actually need it'),
			l('07-devtools', 'DevTools для тестувальника', 'DevTools for testers'),
			l('08-storage', 'Cookies, localStorage, sessionStorage', 'Cookies, localStorage, sessionStorage'),
			l('09-auth', 'Автентифікація: сесії, JWT, OAuth 2.0', 'Authentication: sessions, JWT, OAuth 2.0'),
		],
		checkpoints: [
			t('Я поясню, що відбувається після введення URL у браузері', 'I can explain what happens after you type a URL'),
			t('Я знаю основні HTTP-методи і групи статус-кодів', 'I know the main HTTP methods and status code classes'),
			t('Я знаходжу запит у вкладці Network і читаю його заголовки та тіло', 'I find a request in the Network tab and read its headers and body'),
			t('Я пишу CSS-селектори і розумію, чому вони крихкі', 'I write CSS selectors and understand why they are brittle'),
			t('Я поясню різницю між cookie-сесією і JWT', 'I can explain cookie sessions versus JWT'),
		],
	},
	{
		id: '05-testing-theory',
		level: 'junior',
		title: t('Теорія автоматизації', 'Test automation theory'),
		outcome: t(
			'Ти аргументовано вирішуєш, що автоматизувати, на якому рівні та з якими даними.',
			'You decide what to automate, at which level and with which data — and can justify it.',
		),
		lessons: [
			l('01-why-automate', 'Навіщо автоматизація і коли вона шкодить', 'Why automate, and when it hurts'),
			l('02-pyramid', 'Піраміда і трофей тестування', 'The test pyramid and trophy'),
			l('03-what-to-automate', 'Що автоматизувати першим', 'What to automate first'),
			l('04-test-design', 'Техніки тест-дизайну для автотестів', 'Test design techniques for automation'),
			l('05-test-data', 'Тестові дані', 'Test data'),
			l('06-isolation', 'Незалежність та ізоляція тестів', 'Test independence and isolation'),
			l('07-flakiness', 'Детермінізм і flaky-тести', 'Determinism and flaky tests'),
			l('08-case-to-test', 'Від тест-кейсу до автотесту', 'From test case to automated test'),
		],
		checkpoints: [
			t('Я поясню піраміду тестування і її обмеження', 'I can explain the test pyramid and its limits'),
			t('Я обираю кейси для автоматизації за ризиком і вартістю', 'I choose cases to automate by risk and cost'),
			t('Я застосовую класи еквівалентності та граничні значення', 'I apply equivalence partitioning and boundary values'),
			t('Я назву 5 причин flaky-тестів і способи їх усунення', 'I can name 5 causes of flaky tests and how to fix them'),
			t('Я перетворюю ручний тест-кейс на незалежний автотест', 'I turn a manual test case into an independent automated test'),
		],
	},
	{
		id: '06-playwright-core',
		level: 'junior',
		title: t('Playwright: основи', 'Playwright core'),
		outcome: t(
			'Ти пишеш стабільні UI-тести та вмієш з’ясувати, чому тест упав.',
			'You write stable UI tests and can find out why a test failed.',
		),
		lessons: [
			l('01-first-test', 'Встановлення і перший тест', 'Installation and first test'),
			l('02-locators', 'Локатори', 'Locators'),
			l('03-actions', 'Дії', 'Actions'),
			l('04-assertions', 'Web-first assertions', 'Web-first assertions'),
			l('05-auto-waiting', 'Auto-waiting: чому не потрібен sleep', 'Auto-waiting: why you never need sleep'),
			l('06-structure', 'describe, hooks, test.step', 'describe, hooks, test.step'),
			l('07-config', 'Конфігурація і projects', 'Configuration and projects'),
			l('08-debugging', 'Дебаг: UI mode, Inspector, Trace Viewer', 'Debugging: UI mode, Inspector, Trace Viewer'),
			l('09-codegen', 'Codegen: корисно, але обережно', 'Codegen: useful, but with care'),
			l('10-annotations', 'Анотації: skip, fixme, теги', 'Annotations: skip, fixme, tags'),
			l('11-reports', 'Звіти', 'Reports'),
		],
		checkpoints: [
			t('Я обираю локатор за пріоритетом: роль, лейбл, текст, test id', 'I pick locators by priority: role, label, text, test id'),
			t('Я використовую web-first assertions і не пишу waitForTimeout', 'I use web-first assertions and never write waitForTimeout'),
			t('Я налаштовую playwright.config: baseURL, projects, retries, trace', 'I configure playwright.config: baseURL, projects, retries, trace'),
			t('Я з’ясовую причину падіння через Trace Viewer', 'I find the root cause of a failure with the Trace Viewer'),
			t('Я пишу тест, який падає, коли в застосунку є баг', 'I write tests that fail when the app has a bug'),
		],
	},
	{
		id: '07-framework-architecture',
		level: 'middle',
		title: t('Архітектура тестового фреймворку', 'Test framework architecture'),
		outcome: t(
			'Ти будуєш фреймворк, який легко масштабувати й підтримувати в команді.',
			'You build a framework that scales and is easy for a team to maintain.',
		),
		lessons: [
			l('01-page-object', 'Page Object Model', 'Page Object Model'),
			l('02-components', 'Компоненти замість гігантських сторінок', 'Components instead of giant pages'),
			l('03-fixtures', 'Кастомні фікстури', 'Custom fixtures'),
			l('04-data-factories', 'Фабрики тестових даних', 'Test data factories'),
			l('05-auth-state', 'Авторизація через storageState', 'Authentication with storageState'),
			l('06-env-config', 'Оточення, .env і секрети', 'Environments, .env and secrets'),
			l('07-parallelism', 'Паралельність та ізоляція', 'Parallelism and isolation'),
			l('08-project-structure', 'Структура проєкту', 'Project structure'),
			l('09-conventions', 'Конвенції: імена, стиль, ревʼю', 'Conventions: naming, style, review'),
		],
		checkpoints: [
			t('Я пишу Page Object без асертів і бізнес-логіки всередині', 'I write Page Objects without assertions or business logic inside'),
			t('Я створюю фікстури з setup і гарантованим cleanup', 'I build fixtures with setup and guaranteed cleanup'),
			t('Я логінюсь один раз через storageState і перевикористовую сесію', 'I log in once via storageState and reuse the session'),
			t('Я тримаю секрети поза кодом і логами', 'I keep secrets out of code and logs'),
			t('Мої тести проходять паралельно і в будь-якому порядку', 'My tests pass in parallel and in any order'),
		],
	},
	{
		id: '08-api-testing',
		level: 'middle',
		title: t('API-тестування', 'API testing'),
		outcome: t(
			'Ти тестуєш API напряму й використовуєш його для швидкої підготовки UI-тестів.',
			'You test APIs directly and use them to set up UI tests fast.',
		),
		lessons: [
			l('01-request-context', 'APIRequestContext', 'APIRequestContext'),
			l('02-crud', 'CRUD-сценарії', 'CRUD scenarios'),
			l('03-schema-validation', 'Валідація схеми (zod)', 'Schema validation (zod)'),
			l('04-api-client', 'Шар API-клієнтів', 'An API client layer'),
			l('05-auth-tokens', 'Токени та авторизація', 'Tokens and authorization'),
			l('06-api-setup', 'API для підготовки даних', 'Using the API for test setup'),
			l('07-contracts', 'Контракти і зворотна сумісність', 'Contracts and backward compatibility'),
			l('08-hybrid-tests', 'Гібридні тести: API + UI', 'Hybrid tests: API + UI'),
		],
		checkpoints: [
			t('Я пишу позитивні й негативні API-тести з перевіркою тіла відповіді', 'I write positive and negative API tests that check the response body'),
			t('Я валідую схему відповіді, а не лише статус-код', 'I validate the response schema, not just the status code'),
			t('Я виношу запити в типізований API-клієнт', 'I move requests into a typed API client'),
			t('Я готую дані через API і перевіряю результат в UI', 'I set up data via the API and verify the result in the UI'),
		],
	},
	{
		id: '09-advanced-playwright',
		level: 'middle',
		title: t('Playwright: просунутий рівень', 'Advanced Playwright'),
		outcome: t(
			'Ти закриваєш «незручні» сценарії: мережу, файли, листи, вкладки, доступність.',
			'You cover the awkward scenarios: network, files, emails, tabs, accessibility.',
		),
		lessons: [
			l('01-network-mocking', 'Перехоплення і моки мережі (page.route)', 'Network interception and mocking (page.route)'),
			l('02-har', 'HAR-записи', 'HAR recordings'),
			l('03-frames-tabs', 'Iframe, нові вкладки, попапи', 'Iframes, new tabs, popups'),
			l('04-files', 'Завантаження і вивантаження файлів', 'File upload and download'),
			l('05-dialogs', 'Діалоги браузера', 'Browser dialogs'),
			l('06-emails', 'Листи: Mailpit і перевірка email-флоу', 'Emails: Mailpit and email flows'),
			l('07-visual', 'Візуальне тестування', 'Visual testing'),
			l('08-accessibility', 'Доступність (axe)', 'Accessibility (axe)'),
			l('09-emulation', 'Емуляція пристроїв і її межі', 'Device emulation and its limits'),
			l('10-clock', 'Керування часом (page.clock)', 'Controlling time (page.clock)'),
			l('11-db-checks', 'Перевірки в базі даних', 'Database checks'),
		],
		checkpoints: [
			t('Я мокаю відповідь API, щоб перевірити стан помилки в UI', 'I mock an API response to test an error state in the UI'),
			t('Я працюю з iframe, новими вкладками і файлами', 'I handle iframes, new tabs and files'),
			t('Я перевіряю лист від реєстрації до кліку на посилання', 'I verify an email from sign-up to clicking its link'),
			t('Я додаю перевірку доступності і розумію її результати', 'I add accessibility checks and understand their results'),
			t('Я поясню, чим емуляція iPhone у Chromium відрізняється від реального Safari', 'I can explain how iPhone emulation in Chromium differs from real Safari'),
		],
	},
	{
		id: '10-git-teamwork',
		level: 'middle',
		title: t('Git і командна робота', 'Git and teamwork'),
		outcome: t(
			'Ти працюєш у спільному репозиторії як інженер: гілки, pull request, рев’ю.',
			'You work in a shared repository like an engineer: branches, pull requests, reviews.',
		),
		lessons: [
			l('01-branching', 'Стратегії гілок', 'Branching strategies'),
			l('02-merge-rebase', 'merge і rebase', 'merge and rebase'),
			l('03-conflicts', 'Розв’язання конфліктів', 'Resolving conflicts'),
			l('04-pull-requests', 'Pull request на GitHub', 'Pull requests on GitHub'),
			l('05-code-review', 'Code review тестового коду', 'Reviewing test code'),
			l('06-commits', 'Conventional commits і історія', 'Conventional commits and history'),
			l('07-secrets', '.gitignore і секрети', '.gitignore and secrets'),
		],
		checkpoints: [
			t('Я роблю rebase на свіжий main і розв’язую конфлікти', 'I rebase onto a fresh main and resolve conflicts'),
			t('Я оформлюю pull request з описом і перевірками', 'I open pull requests with a description and checks'),
			t('Я даю конструктивний відгук на чужий тестовий код', 'I give constructive feedback on someone else’s test code'),
			t('Я знаю, що робити, якщо секрет потрапив у коміт', 'I know what to do if a secret lands in a commit'),
		],
	},
	{
		id: '11-ci-cd',
		level: 'middle',
		title: t('CI/CD', 'CI/CD'),
		outcome: t(
			'Твої тести запускаються самі на кожну зміну, а звіт зрозумілий усій команді.',
			'Your tests run on every change and the whole team understands the report.',
		),
		lessons: [
			l('01-ci-concepts', 'Що таке CI/CD', 'What CI/CD is'),
			l('02-github-actions', 'GitHub Actions: workflow, jobs, steps', 'GitHub Actions: workflows, jobs, steps'),
			l('03-gitlab-ci', 'GitLab CI: порівняння', 'GitLab CI: a comparison'),
			l('04-docker', 'Docker для тестів', 'Docker for tests'),
			l('05-sharding', 'Шардинг і паралельні джоби', 'Sharding and parallel jobs'),
			l('06-artifacts-reports', 'Артефакти і звіти', 'Artifacts and reports'),
			l('07-variables-secrets', 'Змінні та секрети в CI', 'CI variables and secrets'),
			l('08-retries-policy', 'Політика retries', 'Retry policy'),
			l('09-schedules-notifications', 'Розклади і сповіщення', 'Schedules and notifications'),
		],
		checkpoints: [
			t('Я пишу GitHub Actions workflow, який запускає Playwright-тести', 'I write a GitHub Actions workflow that runs Playwright tests'),
			t('Я публікую HTML-звіт і trace як артефакти', 'I publish the HTML report and traces as artifacts'),
			t('Я розбиваю прогін на шарди', 'I split a run into shards'),
			t('Я передаю секрети через змінні CI, а не через код', 'I pass secrets through CI variables, not code'),
		],
	},
	{
		id: '12-sdet',
		level: 'sdet',
		title: t('Інженерія якості (SDET)', 'Quality engineering (SDET)'),
		outcome: t(
			'Ти відповідаєш за якість продукту, а не лише за тести.',
			'You own product quality, not just the tests.',
		),
		lessons: [
			l('01-lint-format', 'ESLint і Prettier', 'ESLint and Prettier'),
			l('02-unit-tests', 'Unit-тести на Vitest', 'Unit tests with Vitest'),
			l('03-design-patterns', 'Патерни проєктування для тестів', 'Design patterns for tests'),
			l('04-flaky-management', 'Керування flaky-тестами', 'Managing flaky tests'),
			l('05-test-strategy', 'Тест-стратегія продукту', 'A product test strategy'),
			l('06-performance', 'Навантажувальне тестування (k6)', 'Load testing (k6)'),
			l('07-security', 'Основи безпеки для тестувальника', 'Security basics for testers'),
			l('08-quality-metrics', 'Метрики якості та звітність', 'Quality metrics and reporting'),
			l('09-shift-left', 'Shift-left і testability', 'Shift-left and testability'),
		],
		checkpoints: [
			t('Я налаштовую лінтер і форматер, щоб вони перевіряли код у CI', 'I set up a linter and formatter enforced in CI'),
			t('Я пишу unit-тести на утиліти фреймворку', 'I write unit tests for framework utilities'),
			t('Я веду облік flaky-тестів і усуваю їхні причини', 'I track flaky tests and fix their root causes'),
			t('Я пишу тест-стратегію для продукту', 'I write a test strategy for a product'),
			t('Я запускаю простий навантажувальний тест і читаю результати', 'I run a basic load test and read the results'),
		],
	},
	{
		id: '13-capstone',
		level: 'sdet',
		title: t('Фінальний проєкт', 'Capstone project'),
		outcome: t(
			'Публічний фреймворк на GitHub з CI, звітом і README — твоє портфоліо.',
			'A public framework on GitHub with CI, a report and a README — your portfolio.',
		),
		lessons: [
			l('01-choose-app', 'Вибір застосунку', 'Choosing the application'),
			l('02-plan', 'Тест-план і обсяг', 'Test plan and scope'),
			l('03-build', 'Реалізація', 'Implementation'),
			l('04-ci', 'CI і звіт', 'CI and reporting'),
			l('05-readme', 'README і портфоліо', 'README and portfolio'),
			l('06-review', 'Фінальне рев’ю', 'Final review'),
		],
		checkpoints: [
			t('У мене є публічний репозиторій з UI- та API-тестами', 'I have a public repository with UI and API tests'),
			t('Тести запускаються в CI і публікують звіт', 'Tests run in CI and publish a report'),
			t('README пояснює архітектуру, запуск і рішення', 'The README explains architecture, setup and decisions'),
		],
	},
	{
		id: '14-interview',
		level: 'sdet',
		title: t('Підготовка до співбесіди', 'Interview preparation'),
		outcome: t(
			'Ти впевнено проходиш технічну співбесіду на позицію QA Automation / SDET.',
			'You confidently pass a QA Automation / SDET technical interview.',
		),
		lessons: [
			l('01-javascript', 'Питання з JavaScript', 'JavaScript questions'),
			l('02-typescript', 'Питання з TypeScript', 'TypeScript questions'),
			l('03-playwright', 'Питання з Playwright', 'Playwright questions'),
			l('04-theory', 'Питання з теорії тестування', 'Testing theory questions'),
			l('05-live-coding', 'Live coding', 'Live coding'),
			l('06-framework-design', 'Проєктування фреймворку', 'Designing a framework'),
			l('07-behavioral', 'Поведінкові питання', 'Behavioral questions'),
			l('08-english', 'Англійська для співбесіди', 'English for interviews'),
			l('09-cv-portfolio', 'Резюме, LinkedIn, портфоліо', 'CV, LinkedIn, portfolio'),
		],
		checkpoints: [
			t('Я відповідаю на базові питання з JS/TS/Playwright без підготовки', 'I answer core JS/TS/Playwright questions without preparation'),
			t('Я розв’язую live-coding задачу і проговорюю хід думок', 'I solve a live-coding task while thinking aloud'),
			t('Я розповідаю про свій фреймворк англійською', 'I can present my framework in English'),
		],
	},
];

export const findModule = (id: string) => modules.find((m) => m.id === id);

export const lessonKey = (moduleId: string, lessonId: string) => `${moduleId}/${lessonId}`;
