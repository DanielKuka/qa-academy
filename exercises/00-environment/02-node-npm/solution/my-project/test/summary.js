// Тести на вбудованому тест-раннері Node.js (node:test) — без жодних залежностей.
import assert from 'node:assert/strict';
import { test } from 'node:test';
import { summarize } from '../src/summary.js';

test('рахує пройдені й упалі тести', () => {
	const results = [
		{ title: 'a', status: 'passed' },
		{ title: 'b', status: 'failed' },
	];
	assert.equal(summarize(results), 'Тестовий звіт: 1 passed, 1 failed');
});

test('порожній прогін', () => {
	assert.equal(summarize([]), 'Тестовий звіт: 0 passed, 0 failed');
});
