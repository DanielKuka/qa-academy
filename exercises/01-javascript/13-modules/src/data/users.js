// Ката 01-13 · Завдання 2: тестові користувачі
//
// TODO:
//   1. Зроби масив users DEFAULT-експортом цього файлу.
//   2. Допиши й зроби ІМЕНОВАНИМ експортом функцію findUserByRole(role):
//        findUserByRole('admin') → об'єкт адміністратора з масиву users
//        findUserByRole('ghost') → кидає Error з повідомленням
//                                  'No test user with role "ghost"'
//      (так тест одразу пояснить, чого бракує, а не впаде на undefined.email)

const users = [
	{ role: 'admin', email: 'admin@shop.test', password: 'Admin123!' },
	{ role: 'customer', email: 'customer@shop.test', password: 'Customer123!' },
	{ role: 'manager', email: 'manager@shop.test', password: 'Manager123!' },
];

function findUserByRole(role) {
	// твій код тут
}
