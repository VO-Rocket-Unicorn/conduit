<p align="center">
  <a href="https://conduit.ai">
    <picture>
      <source srcset="packages/console/app/src/asset/logo-ornate-dark.svg" media="(prefers-color-scheme: dark)">
      <source srcset="packages/console/app/src/asset/logo-ornate-light.svg" media="(prefers-color-scheme: light)">
      <img src="packages/console/app/src/asset/logo-ornate-light.svg" alt="Conduit logo">
    </picture>
  </a>
</p>
<p align="center">Открытый AI-агент для программирования.</p>
<p align="center">
  <a href="https://conduit.ai/discord"><img alt="Discord" src="https://img.shields.io/discord/1391832426048651334?style=flat-square&label=discord" /></a>
  <a href="https://www.npmjs.com/package/conduit-ai"><img alt="npm" src="https://img.shields.io/npm/v/conduit-ai?style=flat-square" /></a>
  <a href="https://github.com/anomalyco/conduit/actions/workflows/publish.yml"><img alt="Build status" src="https://img.shields.io/github/actions/workflow/status/anomalyco/conduit/publish.yml?style=flat-square&branch=dev" /></a>
</p>

<p align="center">
  <a href="README.md">English</a> |
  <a href="README.zh.md">简体中文</a> |
  <a href="README.zht.md">繁體中文</a> |
  <a href="README.ko.md">한국어</a> |
  <a href="README.de.md">Deutsch</a> |
  <a href="README.es.md">Español</a> |
  <a href="README.fr.md">Français</a> |
  <a href="README.it.md">Italiano</a> |
  <a href="README.da.md">Dansk</a> |
  <a href="README.ja.md">日本語</a> |
  <a href="README.pl.md">Polski</a> |
  <a href="README.ru.md">Русский</a> |
  <a href="README.bs.md">Bosanski</a> |
  <a href="README.ar.md">العربية</a> |
  <a href="README.no.md">Norsk</a> |
  <a href="README.br.md">Português (Brasil)</a> |
  <a href="README.th.md">ไทย</a> |
  <a href="README.tr.md">Türkçe</a> |
  <a href="README.uk.md">Українська</a> |
  <a href="README.bn.md">বাংলা</a> |
  <a href="README.gr.md">Ελληνικά</a> |
  <a href="README.vi.md">Tiếng Việt</a>
</p>

[![Conduit Terminal UI](packages/web/src/assets/lander/screenshot.png)](https://conduit.ai)

---

### Установка

```bash
# YOLO
curl -fsSL https://conduit.ai/install | bash

# Менеджеры пакетов
npm i -g conduit-ai@latest        # или bun/pnpm/yarn
scoop install conduit             # Windows
choco install conduit             # Windows
brew install anomalyco/tap/conduit # macOS и Linux (рекомендуем, всегда актуально)
brew install conduit              # macOS и Linux (официальная формула brew, обновляется реже)
sudo pacman -S conduit            # Arch Linux (Stable)
paru -S conduit-bin               # Arch Linux (Latest from AUR)
mise use -g conduit               # любая ОС
nix run nixpkgs#conduit           # или github:anomalyco/conduit для самой свежей ветки dev
```

> [!TIP]
> Перед установкой удалите версии старше 0.1.x.

### Десктопное приложение (BETA)

Conduit также доступен как десктопное приложение. Скачайте его со [страницы релизов](https://github.com/anomalyco/conduit/releases) или с [conduit.ai/download](https://conduit.ai/download).

| Платформа             | Загрузка                           |
| --------------------- | ---------------------------------- |
| macOS (Apple Silicon) | `conduit-desktop-mac-arm64.dmg`   |
| macOS (Intel)         | `conduit-desktop-mac-x64.dmg`     |
| Windows               | `conduit-desktop-windows-x64.exe` |
| Linux                 | `.deb`, `.rpm` или AppImage        |

```bash
# macOS (Homebrew)
brew install --cask conduit-desktop
# Windows (Scoop)
scoop bucket add extras; scoop install extras/conduit-desktop
```

#### Каталог установки

Скрипт установки выбирает путь установки в следующем порядке приоритета:

1. `$CONDUIT_INSTALL_DIR` - Пользовательский каталог установки
2. `$XDG_BIN_DIR` - Путь, совместимый со спецификацией XDG Base Directory
3. `$HOME/bin` - Стандартный каталог пользовательских бинарников (если существует или можно создать)
4. `$HOME/.conduit/bin` - Fallback по умолчанию

```bash
# Примеры
CONDUIT_INSTALL_DIR=/usr/local/bin curl -fsSL https://conduit.ai/install | bash
XDG_BIN_DIR=$HOME/.local/bin curl -fsSL https://conduit.ai/install | bash
```

### Agents

В Conduit есть два встроенных агента, между которыми можно переключаться клавишей `Tab`.

- **build** - По умолчанию, агент с полным доступом для разработки
- **plan** - Агент только для чтения для анализа и изучения кода
  - По умолчанию запрещает редактирование файлов
  - Запрашивает разрешение перед выполнением bash-команд
  - Идеален для изучения незнакомых кодовых баз или планирования изменений

Также включен сабагент **general** для сложных поисков и многошаговых задач.
Он используется внутренне и может быть вызван в сообщениях через `@general`.

Подробнее об [agents](https://conduit.ai/docs/agents).

### Документация

Больше информации о том, как настроить Conduit: [**наши docs**](https://conduit.ai/docs).

### Вклад

Если вы хотите внести вклад в Conduit, прочитайте [contributing docs](./CONTRIBUTING.md) перед тем, как отправлять pull request.

### Разработка на базе Conduit

Если вы делаете проект, связанный с Conduit, и используете "conduit" как часть имени (например, "conduit-dashboard" или "conduit-mobile"), добавьте примечание в README, чтобы уточнить, что проект не создан командой Conduit и не аффилирован с нами.

---

**Присоединяйтесь к нашему сообществу** [Discord](https://discord.gg/conduit) | [X.com](https://x.com/conduit)
