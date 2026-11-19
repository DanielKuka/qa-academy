/**
 * Додає `base` до абсолютних внутрішніх посилань у Markdown/MDX.
 * Завдяки цьому в уроках можна писати `[карта курсу](/course-map/)`,
 * і посилання працюватиме і локально, і на GitHub Pages з підшляхом.
 */
export function rehypeBaseLinks({ base = '/' } = {}) {
	const prefix = base.replace(/\/$/, '');
	return (tree) => {
		if (!prefix) return;
		const visit = (node) => {
			if (node.type === 'element' && node.tagName === 'a') {
				const href = node.properties?.href;
				if (typeof href === 'string' && href.startsWith('/') && !href.startsWith('//') && !href.startsWith(`${prefix}/`)) {
					node.properties.href = `${prefix}${href}`;
				}
			}
			node.children?.forEach(visit);
		};
		visit(tree);
	};
}
