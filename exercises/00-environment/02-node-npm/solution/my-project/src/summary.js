/**
 * Рахує результати тестового прогону.
 * @param {{ title: string, status: 'passed' | 'failed' }[]} results
 */
export function summarize(results) {
	const passed = results.filter((r) => r.status === 'passed').length;
	const failed = results.length - passed;
	return `Тестовий звіт: ${passed} passed, ${failed} failed`;
}
