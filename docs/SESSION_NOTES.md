# Нотатки сесій

Робочий журнал розробки курсу. Комітиться, щоб контекст був актуальним на будь-якому комп'ютері
(Windows-ПК і macOS-ноутбук). Особливості конкретної машини — у `docs/LOCAL_NOTES.md` (gitignored).

**Правило:** після кожного вагомого кроку оновлюй розділ «Поточний стан» і додавай запис у журнал.
Нічого приватного (облікові дані, робочі акаунти, токени) — репозиторій публічний.

## Поточний стан

- Сайт: https://danielkuka.github.io/qa-academy/ — CI зелений, Pages працює (Source: GitHub Actions).
- Модуль 00 «Середовище розробника» — написаний, **чекає рев'ю власника**.
- Модуль 01 «JavaScript: основи» — **написаний повністю** (14 уроків, 14 ката), чекає рев'ю власника.
  Обсяг визначено автором-агентом без попереднього узгодження (власник дав свободу дій) — див. нижче.
- ⏭ **Наступний крок:** власник проходить модулі 00 і 01 як учень і паралельно робить рев'ю;
  правки — за його відгуками. Далі модуль 02 «Асинхронний JavaScript» (спершу узгодити обсяг).
- Відкриті слабкі місця (обговорено в сесії 4, черга після перших вражень власника):
  капстоун не згадано в модулях 00–01 (вирішити, звідки він стартує); вимоги кат на кшталт
  «без циклів for» тестами не перевіряються; немає перевірки зовнішніх посилань у CI;
  немає зведення «які ката зелені».

### Модуль 01 — обсяг (на рев'ю)

Одна ката на урок, домен — тестові дані, відповіді API, звіти прогонів, інтернет-магазин.

| Урок | Ката: функції |
|---|---|
| 02-operators | `toCents`, `calcTotal` (копійки, округлення), `getDisplayName` (`?.` + `\|\|`), `getDiscountPercent` (`??`) |
| 03-conditions | `getStatusCategory` (граничні значення HTTP-кодів), `getPasswordError`, `getBadgeColor` (lookup-об'єкт) |
| 04-loops | `generateEmails`, `retry` (синхронний), `findFirstFailed` — лише цикли |
| 05-functions | `buildUser`, `formatTestName`, «знайди баг» зі стрілкою без return, `countMatching`, `negate` |
| 06-strings | `normalizeText`, `isSameText`, `parseCartCount`, `maskCardNumber`, `slugify`, `buildUrl` |
| 07-arrays | `last`, `sortPrices` (без мутації), `unique`, `chunk`, `arraysEqual` — без map/filter |
| 08-array-methods | аналіз звіту прогону: `getFailedTitles`, `totalDuration`, `countByStatus`, `findSlowest`, `isRunGreen`, `byTag`, `sortByDurationDesc` |
| 09-objects | `pick`, `missingFields` (`Object.hasOwn`), `countKeys`, `getByPath`, `deepEqual` |
| 10-destructuring-spread | `createUser(overrides)` (без спільного `address`), `withoutPassword`, `splitHeader`, `formatTestName({...})`, `updateItemQty` |
| 11-scope-closures | `createIdGenerator`, `createCounter`, `once`, `memoize` |
| 12-errors | `assertEqual`, `safeJsonParse`, `parsePrice`, `withCleanup`, `loadFixture` (`cause`) |
| 13-modules | багатофайлова: `src/config.js`, `data/users.js`, `checkout.js`, `summary.js` (переписати з CommonJS), barrel `index.js`; тест запускає `index.js` у чистому Node |
| 14-classes | `Cart` (`#items`, геттери, `this` у колбеку), `ApiClient` (`static forEnv`), `User`/`AdminUser extends` |

Конструкції з пізніших уроків, якщо потрібні раніше, дано шаблоном у «Практиці» (як в еталоні).

### Як оформлювати «Практику» в уроці

Після кроків запуску кати — блок «Де ця вправа?» з посиланням на
`/start-here/how-to-learn/#де-лежать-вправи-і-як-їх-запустити` (власник плутав, де живуть ката:
на сайті чи в репозиторії). Скопіюй його з будь-якого уроку модуля 00.

### Модуль 00 — узгоджений обсяг

- 6 уроків за шаблоном еталонного уроку, поки лише українською (EN — у фазі 7).
- Ката з автоперевіркою:
  - `01-terminal` — учень пише `commands.sh`; тест запускає його через bash у тимчасовій теці
    й перевіряє файлову систему. ✅ готово
  - `02-node-npm` — учень доводить до ладу `my-project/package.json`; тест читає JSON і запускає
    `npm start` / `npm test`. ✅ готово
  - `04-git-basics` — `git-steps.sh` у тимчасовому git-репо (ізольованому від глобального gitconfig);
    тест читає гілки, коміти, вміст дерева. ✅ готово
  - `06-reading-docs` — квест «знайди в документації»: `exercise.js` з 7 питаннями, тест порівнює
    sha256-хеші відповідей (щоб тести не видавали відповіді). ✅ готово
- `03-vscode`, `05-github` — без кати, практика-чекліст у розділі «Самоперевірка».

### Технічні рішення

- `npm run check` / `verify:solutions` йдуть через `scripts/vitest.mjs`: на Windows з терміналу
  в `d:\...` (мала літера диска) Vitest вантажив себе двічі й падав з «failed to find the runner».
  Обгортка стартує Vitest з кореня проєкту за справжнім шляхом. `root` у конфігу це не лікує.
- `exercises/_lib/shell.js`: `exerciseFile()` (твій файл або `solution/`), `findBash()` (на Windows —
  Git Bash поруч із git, щоб не потрапити у WSL), `makeSandbox()`, `runBashScript()` (прибирає CRLF).
- Тести node:test у каті 02 лежать у `my-project/test/`, а не `*.test.js`, щоб Vitest їх не підхоплював.
- Додавання уроків модуля 00 змінює «наступний урок» на сторінці прогресу → треба оновити
  `apps/docs/tests/progress.spec.ts`.

## Перший запуск на новому комп'ютері (macOS / Windows)

```sh
git clone https://github.com/DanielKuka/qa-academy.git
cd qa-academy
npm install
npx playwright install chromium
npm run verify:solutions && npm run test:site
```

Потрібні Node.js 22+ (див. `.nvmrc`) і Git. На macOS bash є з коробки.
Перед початком роботи: `git pull`. Наприкінці: commit + push (за згодою власника).

## Журнал

### 2026-11-19 — сесія 1 (Windows-ПК)

- Створено каркас платформи: Starlight UA/EN, curriculum.ts, прогрес і «вже знаю», ката-система,
  CI, тести платформи. Огляди всіх 15 модулів. Урок-еталон `01-javascript/01-variables-types`.
- Перевірено: `verify:solutions` 24/24, `test:site` 9/9, збірка з `BASE_PATH=/qa-academy` 9/9.

### 2026-11-19 — сесія 2 (Windows-ПК)

- Перший push на GitHub. Перший CI впав на `configure-pages` (Pages не ввімкнено); після ввімкнення
  Pages власником — CI зелений, сайт опубліковано.
- Узгоджено обсяг модуля 00. Написано `_lib/shell.js` і всі 4 ката модуля 00. Уроки — ще ні.
- Перевірено: `npm run verify:solutions` → 55/55. `test:site` не запускався (сайт не змінювався).
- На macOS ката ще не запускались — першим ділом на ноутбуці: `npm run verify:solutions`.
  (CI на Linux їх пройшов, тож bash-частина поза Windows працює.)
- Написано 6 уроків модуля 00. На сторінку «Як тут навчатися» додано розділ «Де лежать вправи і як їх
  запустити» (clone, npm install, VS Code); у «Практику» уроків — блок «Де ця вправа?».
- Квест 06: питання про `npm ci` замінено на `npm outdated` (`npm ci` тепер пояснено в уроці 02).
- `progress.spec.ts`: наступний урок тепер «Середовище розробника → Термінал».
- Перевірено: `verify:solutions` 55/55, `test:site` 9/9.
- Нотатки сесій тепер комітяться (раніше були локальні) — для роботи з macOS-ноутбука.
- Відомо: GitHub попереджає про Node 20 у `actions/*@v4` — можна оновити версії дій окремим комітом.

### 2026-11-19 — сесія 3 (macOS-ноутбук)

- Перший запуск на macOS: `verify:solutions` 55/55, `test:site` 9/9 — bash-ката працюють.
  На ноутбуці nvm за замовчуванням дає Node 20 → Astro не збирається; потрібен `nvm use 24` (див. LOCAL_NOTES).
- Написано модуль 01 повністю: уроки 02–14 + 13 ката (власник дав свободу дій, обсяг — у таблиці вище).
  Кожна ката перевірена: еталон зелений, порожня заглушка падає з підказками без краху імпорту.
- `progress.spec.ts`: тест «ненаписані уроки — у розробці» тепер дивиться на модуль 02
  (модуль 01 більше не має заглушок). Коли писатимемо модуль 02 — перенести на модуль 03.
- CI: дії оновлено до версій на Node 24 (checkout@v7, setup-node@v7, configure-pages@v6,
  upload-artifact@v7, upload-pages-artifact@v5, deploy-pages@v5). На CI ще не перевірено — перший push покаже.
- Перевірено: `verify:solutions` 454/454 (18 файлів), `test:site` 9/9.

### 2026-11-20 — сесія 4 (Windows-ПК)

- Після `git pull` перевірено на ПК: `verify:solutions` 454/454, `test:site` 9/9. CI після оновлення
  дій до Node 24 — зелений.
- Виправлено падіння Vitest з малої літери диска на Windows: обгортка `scripts/vitest.mjs`, npm-скрипти
  `check`, `check:watch`, `verify:solutions` тепер через неї. Перевірено з `d:\` у Git Bash і PowerShell.
- Власник починає навчання з модуля 00 з паралельним рев'ю.
