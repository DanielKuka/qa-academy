#!/usr/bin/env bash
# Еталонне рішення кати 00-01.

# 1. -p створює всі проміжні теки і не падає, якщо вони вже є.
mkdir -p project/tests/e2e project/tests/api

# 2. touch створює порожній файл (або оновлює дату зміни існуючого).
touch project/tests/e2e/login.spec.ts

# 3. cp копіює, оригінал лишається.
cp fixtures/user.json project/tests/api/user.json

# 4. mv і переміщує, і перейменовує — це одна операція.
mv notes.txt project/README.md

# 5. -r — рекурсивно, з усім вмістом. Без підтверджень, тож перевіряй шлях двічі.
rm -r tmp

# 6. grep -c рахує рядки зі збігом, > записує вивід у файл (перезаписуючи його).
grep -c ERROR logs/app.log > project/error-count.txt
