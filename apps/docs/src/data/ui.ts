import type { Locale } from './curriculum';

export const ui = {
	uk: {
		status: { todo: 'Не почато', 'in-progress': 'Вивчаю', done: 'Пройдено', known: 'Вже знаю' },
		lessonQuestion: 'Як у тебе з цим уроком?',
		markInProgress: 'Вивчаю',
		markDone: 'Пройдено ✓',
		markKnown: 'Вже знаю — пропустити',
		markReset: 'Скинути',
		knownHint:
			'Порада вчителя: перш ніж пропускати, спробуй розв’язати кату уроку. Якщо вона проходить з першого разу — сміливо пропускай.',
		lessons: 'Уроки',
		soon: 'у розробці',
		outcome: 'Після модуля',
		skipTitle: 'Я вже знаю цей модуль',
		skipIntro:
			'Пропусти модуль, якщо чесно можеш сказати «так» про кожну навичку нижче. Сумніваєшся хоча б в одній — краще пройди уроки вибірково: кожен урок теж можна позначити як «вже знаю».',
		skipConfirm: 'Позначити модуль як «вже знаю»',
		skipUndo: 'Повернути модуль у навчання',
		skipDone: 'Модуль позначено як «вже знаю».',
		progressOf: (done: number, total: number) => `${done} з ${total} уроків`,
		storageOff: 'Браузер не дозволяє зберігати прогрес (приватне вікно або заблоковане сховище).',
		exportBtn: 'Експортувати прогрес (JSON)',
		importBtn: 'Імпортувати прогрес',
		resetBtn: 'Скинути весь прогрес',
		resetConfirm: 'Точно скинути весь прогрес? Цю дію не можна скасувати.',
		importOk: 'Прогрес імпортовано.',
		importFail: 'Не вдалося прочитати файл прогресу.',
		overall: 'Загальний прогрес',
		continueWith: 'Продовжити з',
		allDone: 'Усі доступні уроки пройдено. Чекай на нові!',
	},
	en: {
		status: { todo: 'Not started', 'in-progress': 'Learning', done: 'Done', known: 'Already known' },
		lessonQuestion: 'How are you doing with this lesson?',
		markInProgress: 'Learning',
		markDone: 'Done ✓',
		markKnown: 'I know this — skip',
		markReset: 'Reset',
		knownHint:
			'Teacher’s tip: before skipping, try the lesson’s kata. If it passes on the first attempt, skip with confidence.',
		lessons: 'Lessons',
		soon: 'coming soon',
		outcome: 'After this module',
		skipTitle: 'I already know this module',
		skipIntro:
			'Skip the module only if you can honestly say “yes” to every skill below. Unsure about even one? Go through the lessons selectively instead — each lesson can be marked as “already known” too.',
		skipConfirm: 'Mark module as “already known”',
		skipUndo: 'Bring the module back into learning',
		skipDone: 'Module marked as “already known”.',
		progressOf: (done: number, total: number) => `${done} of ${total} lessons`,
		storageOff: 'This browser does not allow saving progress (private window or blocked storage).',
		exportBtn: 'Export progress (JSON)',
		importBtn: 'Import progress',
		resetBtn: 'Reset all progress',
		resetConfirm: 'Really reset all progress? This cannot be undone.',
		importOk: 'Progress imported.',
		importFail: 'Could not read the progress file.',
		overall: 'Overall progress',
		continueWith: 'Continue with',
		allDone: 'All available lessons are done. More are coming!',
	},
} satisfies Record<Locale, unknown>;

export const localeFromPath = (pathname: string, base: string): Locale => {
	const trimmedBase = base.replace(/\/$/, '');
	const rest = pathname.startsWith(trimmedBase) ? pathname.slice(trimmedBase.length) : pathname;
	return rest === '/en' || rest.startsWith('/en/') ? 'en' : 'uk';
};

export const localeFromDocument = (): Locale =>
	document.documentElement.lang.toLowerCase().startsWith('en') ? 'en' : 'uk';
