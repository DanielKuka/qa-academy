// Ката 01-14: класи і this
// Запуск: npm run check -- exercises/01-javascript/14-classes

// ─────────────────────────────────────────────────────────────────────────────
// Завдання 1
// Модель кошика для перевірки сум у тестах інтернет-магазину.
// Товар — це об'єкт { sku, price, quantity }, quantity необов'язкове (за замовчуванням 1).
//
// TODO: клас Cart
//   - приватне поле #items — масив позицій; ззовні до нього доступу немає;
//   - add(product)  — додає товар. Якщо товар з таким sku вже є,
//                     збільшує його quantity, а не додає другий рядок;
//   - remove(sku)   — прибирає позицію повністю. Якщо такого sku немає —
//                     кидає Error з повідомленням `No item "${sku}" in cart`;
//   - get items     — КОПІЯ масиву позицій (зміна копії не чіпає кошик);
//   - get itemCount — сума quantity всіх позицій;
//   - get total     — сума price * quantity всіх позицій.
//
//   const cart = new Cart();
//   cart.add({ sku: 'tea', price: 120 });
//   cart.add({ sku: 'tea', price: 120, quantity: 2 });
//   cart.itemCount; // 3
//   cart.total;     // 360
//
// ВАЖЛИВО: тести викликають add як колбек — products.forEach(cart.add).
// Без крапки перед add `this` загубиться. Як цьому запобігти — у розділі
// «Як працює this» уроку.
// ─────────────────────────────────────────────────────────────────────────────

export class Cart {
	// твій код тут
}

// ─────────────────────────────────────────────────────────────────────────────
// Завдання 2
// Міні-клієнт API: зберігає адресу сервера й будує повні URL до ендпоінтів.
//
// TODO: клас ApiClient
//   - constructor(baseUrl) — зберігає адресу в публічному полі baseUrl,
//     прибравши слеш у кінці, якщо він є: 'https://shop.test/' → 'https://shop.test'
//   - url(path) — повертає повний URL з рівно одним слешем між частинами:
//       client.url('/users') → 'https://shop.test/users'
//       client.url('users')  → 'https://shop.test/users'
//   - static forEnv(env) — фабрика: повертає НОВИЙ ApiClient для середовища:
//       ApiClient.forEnv('staging').baseUrl → 'https://staging.shop.test'
//
// Підказка: у рядків є методи endsWith, startsWith і slice (урок 06).
// ─────────────────────────────────────────────────────────────────────────────

export class ApiClient {
	// твій код тут
}

// ─────────────────────────────────────────────────────────────────────────────
// Завдання 3
// Тестові користувачі різних ролей.
//
// TODO: клас User
//   - constructor(email, role = 'customer') — публічні поля email і role;
//   - get isAdmin — true, якщо role === 'admin';
//   - describe()  — рядок `${email} (${role})`
//
// TODO: клас AdminUser extends User
//   - constructor(email, permissions = []) — роль завжди 'admin'
//     (передай її в батьківський конструктор), permissions — публічне поле;
//   - can(permission) — true, якщо таке право є в permissions;
//   - describe() — батьківський describe() плюс список прав у квадратних дужках:
//       new AdminUser('root@shop.test', ['users:delete', 'orders:refund']).describe()
//       → 'root@shop.test (admin) [users:delete, orders:refund]'
//     Не копіюй батьківську логіку — виклич її через super.
// ─────────────────────────────────────────────────────────────────────────────

export class User {
	// твій код тут
}

export class AdminUser extends User {
	// твій код тут
}
