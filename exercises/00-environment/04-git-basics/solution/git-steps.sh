#!/usr/bin/env bash
# Еталонне рішення кати 00-04.

# 1. Спершу .gitignore — і лише потім git add. Інакше .env уже може опинитися в індексі.
echo "node_modules/" > .gitignore
echo ".env" >> .gitignore

# 2. switch -c = створити гілку й перейти на неї (старий варіант: git checkout -b).
git switch -c feature/login-test

# 3. Додаємо файли явно. git add . теж спрацював би — завдяки .gitignore,
#    але явний список захищає від випадкових файлів.
git add .gitignore tests/login.spec.ts
git commit -m "test: add login test"

# 4. Коміт лишається на feature-гілці, main не змінився.
git switch main
