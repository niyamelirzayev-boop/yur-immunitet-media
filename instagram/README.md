# Публикация каруселей в Instagram

Официальный Instagram API, без посредников. Скрипт: `instagram/publish.py`.

## Подключение (один раз)

1. **Профессиональный аккаунт.** Instagram → Настройки → «Тип аккаунта и инструменты» →
   «Переключиться на профессиональный» → «Автор» или «Бизнес».
2. **Приложение Meta.** <https://developers.facebook.com> → «Мои приложения» → «Создать приложение» →
   сценарий «Управление сообщениями и контентом в Instagram» (Manage messaging & content on Instagram).
3. В приложении: **Instagram → «Настройка API с входом через Instagram»** (API setup with Instagram login) →
   «Добавить аккаунт» → войти в Instagram → «Сгенерировать токен» → скопировать.
4. Токен вставляется **только в защищённую форму**, которую открывает Claude (секрет окружения
   для `graph.instagram.com`). В чат, в файлы и в репозиторий токен не пишем.
5. Проверка: `python3 instagram/publish.py check`.

Токен действует 60 дней. Когда истечёт, сгенерируйте новый (шаг 3) и замените секрет в настройках окружения.

## Публикация

```bash
python3 instagram/publish.py prepare carousels/<папка>      # PNG → JPEG в instagram/jpg/
git add instagram/jpg && git commit -m "..." && git push    # нужны публичные ссылки
python3 instagram/publish.py publish carousels/<папка> --caption-file подпись.txt --branch <ветка>          # пробный запуск
python3 instagram/publish.py publish carousels/<папка> --caption-file подпись.txt --branch <ветка> --yes    # публикация
```

Правило: публикуем только после «ок» Камилы. Удалить пост через API нельзя.
Лимиты Instagram: 2–10 слайдов, подпись до 2200 символов, до 30 хештегов, 50 публикаций в сутки.
