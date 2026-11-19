/**
 * Створює відсутні сторінки-огляди модулів (uk + en) за даними з curriculum.ts.
 * Існуючі сторінки не перезаписує — їх можна доповнювати вступним текстом.
 *
 *   npm run sync:modules
 */
import { existsSync, mkdirSync, writeFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { modules } from '../src/data/curriculum.ts';

const docs = join(dirname(fileURLToPath(import.meta.url)), '..', 'src', 'content', 'docs');

const page = (title: string, label: string, id: string) => `---
title: ${JSON.stringify(title)}
sidebar:
  order: 0
  label: ${JSON.stringify(label)}
---

import ModuleOverview from '~/components/ModuleOverview.astro';

<ModuleOverview id="${id}" />
`;

let created = 0;
for (const m of modules) {
	for (const [dir, title, label] of [
		[join(docs, 'modules', m.id), m.title.uk, 'Огляд модуля'],
		[join(docs, 'en', 'modules', m.id), m.title.en, 'Module overview'],
	] as const) {
		const file = join(dir, 'index.mdx');
		if (existsSync(file)) continue;
		mkdirSync(dir, { recursive: true });
		writeFileSync(file, page(title, label, m.id));
		created++;
	}
}
console.log(created ? `Створено сторінок модулів: ${created}` : 'Усі сторінки модулів уже існують.');
