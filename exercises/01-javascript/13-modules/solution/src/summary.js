// Еталонне рішення кати 01-13. Відкривай лише після власної спроби.

export const PASSED = 'passed';

export function summarize(results) {
	const passed = results.filter((result) => result.status === PASSED).length;
	return `${passed}/${results.length} passed`;
}
