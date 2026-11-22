# Публикация каруселей в Instagram

Официальный Instagram API, без посредников. Скрипт: `instagram/publish.py`.

## Подключение (один раз)

1. **Профессиональный аккаунт.** Instagram → Настройки → «Тип аккаунта и инструменты» →
   «Переключиться на профессиональный» → «Автор» или «Бизнес».
2. **Приложение Meta.** <https://developers.facebook.com> → «Мои приложения» → «Создать приложение» →
   сценарий «Управление сообщениями и контентом в Instagram» (Manage messaging & content on Instagram).
3. В приложении: **Сценарии использования → Настроить → API setup with Unified login** →
   привязать бизнес-портфолио → «Создать новую конфигурацию» → «Создать из шаблона».
   «Роли в приложении → Роли → Добавить людей → Тестировщик Instagram», принять приглашение в Instagram
   (Настройки → Сайты и приложения → Приглашения тестировщикам). Затем «Добавить аккаунт» →
   «Сгенерировать маркер» → скопировать. ID аккаунта Instagram (число) записать — он не секрет.
4. Токен вставляется **только в защищённую форму**, которую открывает Claude (секрет окружения
   для `graph.facebook.com`). В чат, в файлы и в репозиторий токен не пишем.
5. Проверка: `IG_USER_ID=<id> python3 instagram/publish.py check` (по умолчанию API graph.facebook.com — токен «Unified login»; для токена «Instagram Login» добавьте `IG_HOST=graph.instagram.com`).

Токен «Unified login» (системный пользователь) бессрочный. Токен «Instagram Login» живёт 60 дней — тогда сгенерируйте новый и замените секрет.

## Публикация

```bash
python3 instagram/publish.py prepare carousels/<папка>      # PNG → JPEG в instagram/jpg/
git add instagram/jpg && git commit -m "..." && git push    # нужны публичные ссылки
python3 instagram/publish.py publish carousels/<папка> --caption-file подпись.txt --branch <ветка>          # пробный запуск
python3 instagram/publish.py publish carousels/<папка> --caption-file подпись.txt --branch <ветка> --yes    # публикация
```

Правило: публикуем только после «ок» Камилы. Удалить пост через API нельзя.
Лимиты Instagram: 2–10 слайдов, подпись до 2200 символов, до 30 хештегов, 50 публикаций в сутки.
