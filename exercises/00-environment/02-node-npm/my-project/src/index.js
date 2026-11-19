import { summarize } from './summary.js';

const results = [
	{ title: 'логін з валідними даними', status: 'passed' },
	{ title: 'логін з неправильним паролем', status: 'passed' },
	{ title: 'додавання товару в кошик', status: 'failed' },
	{ title: 'оформлення замовлення', status: 'passed' },
];

console.log(summarize(results));
