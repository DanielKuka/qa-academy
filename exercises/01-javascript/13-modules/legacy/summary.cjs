// Старий модуль у стилі CommonJS. НЕ змінюй цей файл — він тут як зразок.
// Твоє завдання — переписати його на ES-модуль у src/summary.js (Завдання 4).

const PASSED = 'passed';

function summarize(results) {
	const passed = results.filter((result) => result.status === PASSED).length;
	return `${passed}/${results.length} passed`;
}

module.exports = { PASSED, summarize };
