// @ts-check
import { defineConfig } from 'astro/config';
import starlight from '@astrojs/starlight';
import { modules } from './src/data/curriculum.ts';
import { rehypeBaseLinks } from './src/lib/rehype-base-links.mjs';

// GitHub Actions (крок actions/configure-pages) передає адресу сайту та підшлях,
// напр. SITE_URL=https://user.github.io і BASE_PATH=/qa-academy. Локально сайт живе в корені.
const site = process.env.SITE_URL || undefined;
const base = `${(process.env.BASE_PATH ?? '').replace(/\/$/, '')}/`;
const repoUrl =
	process.env.GITHUB_REPOSITORY && `${process.env.GITHUB_SERVER_URL ?? 'https://github.com'}/${process.env.GITHUB_REPOSITORY}`;

export default defineConfig({
	site,
	base,
	trailingSlash: 'always',
	markdown: {
		rehypePlugins: [[rehypeBaseLinks, { base }]],
	},
	integrations: [
		starlight({
			title: { uk: 'QA Академія', en: 'QA Academy' },
			description: 'Шлях від QA до SDET: JavaScript, TypeScript, Playwright, CI/CD і співбесіда.',
			defaultLocale: 'root',
			locales: {
				root: { label: 'Українська', lang: 'uk' },
				en: { label: 'English', lang: 'en' },
			},
			social: repoUrl ? [{ icon: 'github', label: 'GitHub', href: repoUrl }] : [],
			customCss: ['./src/styles/custom.css'],
			lastUpdated: true,
			sidebar: [
				{
					label: 'Почни тут',
					translations: { en: 'Start here' },
					items: [
						{ slug: 'start-here/how-to-learn' },
						{ slug: 'course-map' },
						{ slug: 'competency-matrix' },
						{ slug: 'progress' },
						{ slug: 'practice-grounds' },
					],
				},
				...modules.map((m) => ({
					label: `${m.id.slice(0, 2)} · ${m.title.uk}`,
					translations: { en: `${m.id.slice(0, 2)} · ${m.title.en}` },
					collapsed: true,
					items: [{ autogenerate: { directory: `modules/${m.id}` } }],
				})),
			],
		}),
	],
});
