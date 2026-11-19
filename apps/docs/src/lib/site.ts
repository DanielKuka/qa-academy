import { getCollection } from 'astro:content';
import type { Locale } from '../data/curriculum';
import { localeFromPath } from '../data/ui';

const base = import.meta.env.BASE_URL.replace(/\/$/, '');

/** Абсолютне посилання всередині сайту з урахуванням base (GitHub Pages). */
export const href = (path: string) => `${base}/${path.replace(/^\//, '')}`;

export const localeOf = (url: URL): Locale => localeFromPath(url.pathname, import.meta.env.BASE_URL);

export const prefix = (locale: Locale) => (locale === 'en' ? 'en/' : '');

export const moduleUrl = (locale: Locale, moduleId: string) => href(`${prefix(locale)}modules/${moduleId}/`);

export const lessonUrl = (locale: Locale, moduleId: string, lessonId: string) =>
	href(`${prefix(locale)}modules/${moduleId}/${lessonId}/`);

let cache: Set<string> | undefined;

/** Урок «готовий», якщо існує його українська сторінка (англійська підтягується як fallback). */
export async function writtenLessons(): Promise<Set<string>> {
	if (!cache) {
		const docs = await getCollection('docs');
		cache = new Set(
			docs
				.map((d) => d.id)
				.filter((id) => id.startsWith('modules/') && !id.endsWith('/index') && id.split('/').length === 3)
				.map((id) => id.replace(/^modules\//, '')),
		);
	}
	return cache;
}
