/**
 * Прогрес учня зберігається лише в цьому браузері (localStorage).
 * Будь-яке читання чи запис може впасти (приватне вікно, заблоковане сховище),
 * тому все обгорнуто в try/catch, а сторінка працює й без прогресу.
 */

export type LessonStatus = 'todo' | 'in-progress' | 'done' | 'known';

export interface ProgressData {
	version: 1;
	lessons: Record<string, LessonStatus>;
	/** Модулі, які учень позначив як «вже знаю» після самоперевірки. */
	knownModules: string[];
	updatedAt: string | null;
}

const KEY = 'qa-academy.progress.v1';
const EVENT = 'qa-academy:progress';

const empty = (): ProgressData => ({ version: 1, lessons: {}, knownModules: [], updatedAt: null });

export function load(): ProgressData {
	try {
		const raw = localStorage.getItem(KEY);
		if (!raw) return empty();
		return normalize(JSON.parse(raw));
	} catch {
		return empty();
	}
}

function normalize(value: unknown): ProgressData {
	const data = empty();
	if (!value || typeof value !== 'object') return data;
	const v = value as Partial<ProgressData>;
	const allowed: LessonStatus[] = ['todo', 'in-progress', 'done', 'known'];
	if (v.lessons && typeof v.lessons === 'object') {
		for (const [k, s] of Object.entries(v.lessons)) {
			if (allowed.includes(s as LessonStatus)) data.lessons[k] = s as LessonStatus;
		}
	}
	if (Array.isArray(v.knownModules)) {
		data.knownModules = v.knownModules.filter((m): m is string => typeof m === 'string');
	}
	data.updatedAt = typeof v.updatedAt === 'string' ? v.updatedAt : null;
	return data;
}

export function save(data: ProgressData): boolean {
	data.updatedAt = new Date().toISOString();
	try {
		localStorage.setItem(KEY, JSON.stringify(data));
	} catch {
		return false;
	} finally {
		window.dispatchEvent(new CustomEvent(EVENT));
	}
	return true;
}

export function onChange(cb: () => void) {
	window.addEventListener(EVENT, cb);
	// Зміни з інших вкладок.
	window.addEventListener('storage', (e) => {
		if (e.key === KEY) cb();
	});
}

export function lessonStatus(data: ProgressData, moduleId: string, lessonKey: string): LessonStatus {
	const own = data.lessons[lessonKey];
	if (own && own !== 'todo') return own;
	return data.knownModules.includes(moduleId) ? 'known' : (own ?? 'todo');
}

export function setLesson(lessonKey: string, status: LessonStatus) {
	const data = load();
	if (status === 'todo') delete data.lessons[lessonKey];
	else data.lessons[lessonKey] = status;
	return save(data);
}

export function setModuleKnown(moduleId: string, known: boolean) {
	const data = load();
	data.knownModules = data.knownModules.filter((m) => m !== moduleId);
	if (known) data.knownModules.push(moduleId);
	return save(data);
}

export function exportJson(): string {
	return JSON.stringify(load(), null, 2);
}

export function importJson(text: string): boolean {
	try {
		return save(normalize(JSON.parse(text)));
	} catch {
		return false;
	}
}

export function reset() {
	return save(empty());
}
