import { defineConfig } from 'vitest/config';

// `npm run check` перевіряє твої рішення.
// `npm run verify:solutions` (CI) перевіряє еталонні рішення — так ми знаємо, що самі тести правильні.
export default defineConfig(({ mode }) => ({
	test: {
		include: ['exercises/**/*.test.{js,ts}'],
		env: { QA_SOLUTIONS: mode === 'solutions' ? '1' : '' },
		reporters: ['default'],
	},
}));
