// Ката 00-06: квест «знайди в документації»
// Запуск: npm run check -- exercises/00-environment/06-reading-docs
//
// Кожна відповідь — коротка: команда, прапорець, число або назва.
// Не гугли «готову відповідь» — відкрий вказане джерело і знайди її там.
// Мета — натренувати шлях: офіційна документація → потрібний розділ → факт.
// Тест знає лише хеш правильної відповіді, тож підглянути її в тестах не вийде.

export const answers = {
	// 1. npm (docs.npmjs.com → CLI Commands)
	//    Якою командою дізнатися, які пакети проєкту застаріли: показати встановлену версію,
	//    бажану (за діапазоном у package.json) і найновішу в реєстрі?
	//    Формат: 'npm <команда>'
	npmOutdatedCommand: '',

	// 2. MDN → HTTP response status codes
	//    Який код статусу означає «Too Many Requests» (спрацював rate limit)?
	//    Формат: число
	tooManyRequestsStatus: 0,

	// 3. playwright.dev → Command line
	//    Який прапорець `npx playwright test` відкриває інтерактивний UI Mode?
	//    Формат: '--прапорець'
	playwrightUiFlag: '',

	// 4. playwright.dev → Retries
	//    Як називається опція конфігурації, що задає, скільки разів перезапускати впалий тест?
	//    Формат: назва опції
	playwrightRetriesOption: '',

	// 5. MDN → Array
	//    Який метод масиву повертає true, якщо ХОЧА Б ОДИН елемент задовольняє умову?
	//    Формат: назва методу без дужок
	arraySomeMatchMethod: '',

	// 6. git-scm.com → Reference → git commit
	//    Який прапорець git commit замінює останній коміт новим (напр., щоб виправити повідомлення)?
	//    Формат: '--прапорець'
	gitFixLastCommitFlag: '',

	// 7. nodejs.org → Docs → Test runner
	//    Як імпортується вбудований модуль тест-раннера Node.js? (той, що в import ... from '...')
	//    Формат: рядок модуля
	nodeTestRunnerModule: '',
};
