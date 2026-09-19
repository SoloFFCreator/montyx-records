```text
███╗   ███╗██╗███╗   ██╗██╗███╗   ███╗ █████╗ ██╗  ██╗
████╗ ████║██║████╗  ██║██║████╗ ████║██╔══██╗╚██╗██╔╝
██╔████╔██║██║██╔██╗ ██║██║██╔████╔██║███████║ ╚███╔╝
██║╚██╔╝██║██║██║╚██╗██║██║██║╚██╔╝██║██╔══██║ ██╔██╗
██║ ╚═╝ ██║██║██║ ╚████║██║██║ ╚═╝ ██║██║  ██║██╔╝ ██╗
╚═╝     ╚═╝╚═╝╚═╝  ╚═══╝╚═╝╚═╝     ╚═╝╚═╝  ╚═╝╚═╝  ╚═╝

                 C O D E   T E R M U X
             small screen · serious coding
```

**A phone-friendly MiniMax Code terminal for Termux and mobile SSH.**

<p align="center">
  <a href="docs/MOBILE_TERMUX.md">Mobile guide</a> ·
  <a href="docs/ORIGINAL_VS_MOBILE.md">Original vs mobile</a> ·
  <a href="docs/installation.md">Installation reference</a>
</p>

# MiniMax Code Termux

MiniMax Code Termux is a phone-oriented distribution of [MiniMax Code](https://github.com/MiniMax-AI/minimax-code). It preserves the upstream agent, provider, session, plugin, and command behavior while making the terminal interface more comfortable on **Termux**, mobile SSH clients, split-screen terminals, and short terminal windows.

> **Important:** this is a Node.js terminal application, not a native Android APK. It runs on Android through Termux or a mobile SSH client.

![Phone layout comparison chart](docs/assets/mobile-layout-comparison.png)

The chart is derived from the actual layout rules in this repository. The mobile build enters compact mode earlier so the editor retains more usable space on narrow screens.

## Highlights

- **Phone-first layout:** compact mode starts below 56 columns or 16 rows.
- **Responsive welcome screen:** the welcome layout considers both width and available height.
- **Upstream-compatible runtime:** agent behavior and provider integrations remain unchanged.
- **Terminal branding:** use the included blue ASCII banner script in Termux or your shell profile.
- **Reproducible builds:** the repository includes the same locked dependency and build workflow used for validation.

## Quick start on Android

Install [Termux](https://termux.dev/) from F-Droid or the official Termux source, then run:

```bash
pkg update && pkg upgrade
pkg install git nodejs-lts
npm install --global pnpm@9.12.0

git clone https://github.com/SoloFFCreator/minimax-code-termux.git
cd minimax-code-termux
pnpm install --frozen-lockfile
pnpm build
pnpm mcode
```

Run the blue ASCII banner:

```bash
bash scripts/print-termux-banner.sh
```

To show it whenever a Termux shell opens, add this line to `~/.bashrc`:

```bash
bash "$HOME/minimax-code-termux/scripts/print-termux-banner.sh"
```

## Configure MiniMax or a custom provider

Start `pnpm mcode` and follow the managed MiniMax login flow. For an OpenAI-compatible provider, configure the key through an environment variable:

```bash
export MCODE_PROVIDER_API_KEY="your-key"
pnpm mcode provider add \
  --name my-provider \
  --base-url https://example.com/v1 \
  --api-format openai-completions \
  --model my-model \
  --api-key-env MCODE_PROVIDER_API_KEY \
  --use
```

Never commit API keys to GitHub. Store secrets in your local Termux profile or a password manager.

## Build the application-ready CLI bundle

The supported application build produces a self-contained compiled CLI distribution in `dist/`. Use this command from the repository root:

```bash
pnpm install --frozen-lockfile
pnpm build
node dist/cli.js
```

The equivalent production launch command is:

```bash
pnpm start
```

For a convenient Termux launcher, create a local command that points to the built application:

```bash
mkdir -p "$PREFIX/bin"
cat > "$PREFIX/bin/mcode-termux" <<'EOF'
#!/data/data/com.termux/files/usr/bin/sh
cd "$HOME/minimax-code-termux"
exec node dist/cli.js "$@"
EOF
chmod +x "$PREFIX/bin/mcode-termux"
mcode-termux
```

This creates an application-ready **CLI bundle and launcher**. It does not create a native APK. A native Android app would require a separate Android wrapper, UI, permissions model, and release/signing workflow; no official native APK conversion is included here.

## Everyday commands

| Goal | Command |
|---|---|
| Start the interactive UI | `pnpm mcode` |
| Start with a prompt | `pnpm mcode "Review this project"` |
| Resume the latest session | `pnpm mcode --continue` |
| Run one headless task | `pnpm mcode exec "your prompt"` |
| Show CLI help | `pnpm mcode --help` |
| Build the distribution | `pnpm build` |
| Run the built distribution | `node dist/cli.js` |
| Print the blue banner | `bash scripts/print-termux-banner.sh` |

## Phone configuration tips

1. Keep at least 48 terminal columns available; use landscape orientation for long code or tool output.
2. Configure the Termux extra-keys row for `Esc`, `Ctrl`, and arrow keys.
3. Use `Shift+Enter` for a newline when supported; the configured fallback remains available.
4. Keep the font large enough to read and avoid aggressive client-side line wrapping.
5. Use `pnpm mcode --continue` after an SSH or mobile terminal reconnect.

## Original MiniMax Code versus Termux edition

| Area | Original MiniMax Code | MiniMax Code Termux |
|---|---|---|
| Primary target | Desktop terminals | Termux, mobile SSH, and narrow terminals |
| Compact width | Below 48 columns | Below 56 columns |
| Compact height | Below 12 rows | Below 16 rows |
| Welcome sizing | Primarily width-based | Width and available height |
| Agent behavior | Upstream behavior | Unchanged |
| Native Android UI | Not included | Not included; use Termux or SSH |

Read the detailed [original-versus-mobile comparison](docs/ORIGINAL_VS_MOBILE.md), including the comparison chart, and the complete [Termux/mobile guide](docs/MOBILE_TERMUX.md).

## Validation

The mobile layout has been validated with:

- Three focused layout policy tests.
- Standalone TypeScript typechecking.
- A production bundle build.
- `git diff --check` whitespace validation.

Run the focused regression test yourself:

```bash
pnpm exec vitest run packages/tui/test/unit/tui/shell/layout-policy.test.ts
```

## Project boundaries

This project is intentionally a terminal application. It does not provide native Android widgets, push notifications, touch-specific controls, or independent background execution. Those capabilities require a separate Android wrapper or mobile client.

## License and upstream context

See [LICENSE](LICENSE), [CONTRIBUTING.md](CONTRIBUTING.md), and the upstream documentation in `docs/`. This repository preserves the MiniMax Code runtime and extends its terminal layout for mobile use.
