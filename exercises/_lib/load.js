/**
 * Завантажує модуль вправи для тестів.
 *
 * Звичайний режим (`npm run check`) — перевіряє ТВІЙ файл `exercise.js`.
 * Режим еталону (`npm run verify:solutions`, використовується в CI) —
 * перевіряє `solution/exercise.js`, щоб переконатися, що самі тести коректні.
 *
 * @param {string} testFileUrl — передавай `import.meta.url` з тестового файлу
 * @param {string} [file='exercise.js']
 */
export async function loadExercise(testFileUrl, file = 'exercise.js') {
	const useSolution = process.env.QA_SOLUTIONS === '1';
	const target = new URL(useSolution ? `solution/${file}` : file, testFileUrl);
	return import(target.href);
}
