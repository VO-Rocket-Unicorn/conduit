<p align="center">
  <a href="https://conduit.ai">
    <picture>
      <source srcset="packages/console/app/src/asset/logo-ornate-dark.svg" media="(prefers-color-scheme: dark)">
      <source srcset="packages/console/app/src/asset/logo-ornate-light.svg" media="(prefers-color-scheme: light)">
      <img src="packages/console/app/src/asset/logo-ornate-light.svg" alt="Conduit logo">
    </picture>
  </a>
</p>
<p align="center">Conduit je open source AI agent za programiranje.</p>
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

### Instalacija

```bash
# YOLO
curl -fsSL https://conduit.ai/install | bash

# Package manageri
npm i -g conduit-ai@latest        # ili bun/pnpm/yarn
scoop install conduit             # Windows
choco install conduit             # Windows
brew install anomalyco/tap/conduit # macOS i Linux (preporučeno, uvijek ažurno)
brew install conduit              # macOS i Linux (zvanična brew formula, rjeđe se ažurira)
sudo pacman -S conduit            # Arch Linux (Stable)
paru -S conduit-bin               # Arch Linux (Latest from AUR)
mise use -g conduit               # Bilo koji OS
nix run nixpkgs#conduit           # ili github:anomalyco/conduit za najnoviji dev branch
```

> [!TIP]
> Ukloni verzije starije od 0.1.x prije instalacije.

### Desktop aplikacija (BETA)

Conduit je dostupan i kao desktop aplikacija. Preuzmi je direktno sa [stranice izdanja](https://github.com/anomalyco/conduit/releases) ili sa [conduit.ai/download](https://conduit.ai/download).

| Platforma             | Preuzimanje                        |
| --------------------- | ---------------------------------- |
| macOS (Apple Silicon) | `conduit-desktop-mac-arm64.dmg`   |
| macOS (Intel)         | `conduit-desktop-mac-x64.dmg`     |
| Windows               | `conduit-desktop-windows-x64.exe` |
| Linux                 | `.deb`, `.rpm`, ili AppImage       |

```bash
# macOS (Homebrew)
brew install --cask conduit-desktop
# Windows (Scoop)
scoop bucket add extras; scoop install extras/conduit-desktop
```

#### Instalacijski direktorij

Instalacijska skripta koristi sljedeći redoslijed prioriteta za putanju instalacije:

1. `$CONDUIT_INSTALL_DIR` - Prilagođeni instalacijski direktorij
2. `$XDG_BIN_DIR` - Putanja usklađena sa XDG Base Directory specifikacijom
3. `$HOME/bin` - Standardni korisnički bin direktorij (ako postoji ili se može kreirati)
4. `$HOME/.conduit/bin` - Podrazumijevana rezervna lokacija

```bash
# Primjeri
CONDUIT_INSTALL_DIR=/usr/local/bin curl -fsSL https://conduit.ai/install | bash
XDG_BIN_DIR=$HOME/.local/bin curl -fsSL https://conduit.ai/install | bash
```

### Agenti

Conduit uključuje dva ugrađena agenta između kojih možeš prebacivati tasterom `Tab`.

- **build** - Podrazumijevani agent sa punim pristupom za razvoj
- **plan** - Agent samo za čitanje za analizu i istraživanje koda
  - Podrazumijevano zabranjuje izmjene datoteka
  - Traži dozvolu prije pokretanja bash komandi
  - Idealan za istraživanje nepoznatih codebase-ova ili planiranje izmjena

Uključen je i **general** pod-agent za složene pretrage i višekoračne zadatke.
Koristi se interno i može se pozvati pomoću `@general` u porukama.

Saznaj više o [agentima](https://conduit.ai/docs/agents).

### Dokumentacija

Za više informacija o konfiguraciji Conduit-a, [**pogledaj dokumentaciju**](https://conduit.ai/docs).

### Doprinosi

Ako želiš doprinositi Conduit-u, pročitaj [upute za doprinošenje](./CONTRIBUTING.md) prije slanja pull requesta.

### Gradnja na Conduit-u

Ako radiš na projektu koji je povezan s Conduit-om i koristi "conduit" kao dio naziva, npr. "conduit-dashboard" ili "conduit-mobile", dodaj napomenu u svoj README da projekat nije napravio Conduit tim i da nije povezan s nama.

---

**Pridruži se našoj zajednici** [Discord](https://discord.gg/conduit) | [X.com](https://x.com/conduit)
