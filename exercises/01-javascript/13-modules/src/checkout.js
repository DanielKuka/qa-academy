// Ката 01-13 · Завдання 3: запит на оформлення замовлення
//
// TODO:
//   1. Імпортуй BASE_URL і DEFAULT_TIMEOUT з config.js
//      та findUserByRole з data/users.js.
//      Шляхи відносні від ЦЬОГО файлу і з розширенням .js.
//   2. Допиши функцію buildCheckoutRequest(role, items), яка повертає:
//        {
//          url: '<BASE_URL>/api/checkout',
//          timeout: <DEFAULT_TIMEOUT>,
//          body: { email: <email користувача з цією роллю>, items },
//        }
//
//   buildCheckoutRequest('customer', ['sku-1'])
//   → { url: 'https://shop.test/api/checkout', timeout: 5000,
//       body: { email: 'customer@shop.test', items: ['sku-1'] } }
//
// Не копіюй адресу і таймаут сюди рядком — саме від цього нас рятують модулі.

export function buildCheckoutRequest(role, items) {
	// твій код тут
}
