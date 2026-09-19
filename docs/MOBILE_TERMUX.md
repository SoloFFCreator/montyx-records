# MiniMax Code on a Phone with Termux

This repository is a phone-friendly build of MiniMax Code's terminal user interface. It is designed for Android users running **Termux**, a mobile SSH client, or another terminal emulator. It is not a native Android APK; it runs as a Node.js command-line application inside a terminal.

## Requirements

- Android 7 or newer with [Termux](https://termux.dev/) from F-Droid or the official Termux source.
- Node.js 22.19+ (or a supported Node.js 24–26 release).
- Git and pnpm 9.12+.
- A MiniMax account, or a compatible provider API key configured through MiniMax Code's BYOK commands.

## Install on Termux

```bash
pkg update
pkg upgrade
pkg install git nodejs-lts
npm install --global pnpm@9.12.0

git clone https://github.com/SoloFFCreator/minimax-code-termux.git
cd minimax-code-termux
pnpm install --frozen-lockfile
pnpm build
```

Start the interactive terminal UI:

```bash
pnpm mcode
```

You can also start with a prompt:

```bash
pnpm mcode "Review the current project and explain the next safest change"
```

## First-time setup

For a managed MiniMax account, launch `pnpm mcode` and follow the login instructions. For a custom OpenAI-compatible provider, configure an environment variable and add the provider:

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

Keep API keys in a local Termux shell profile or a password manager. Do not commit them to GitHub or paste them into issue reports.

## Phone-friendly behavior

The UI now switches to compact mode earlier, below 56 terminal columns or 16 rows. This removes unnecessary horizontal padding and uses the compact welcome layout before framed content competes with the message editor. The welcome screen also uses the available terminal height, which helps portrait-mode terminals and short SSH panes.

For best results:

1. Use a terminal width of at least 48 columns when possible.
2. Rotate to landscape for code review or long tool output.
3. Use the terminal's extra-keys row for `Esc`, `Ctrl`, and arrow keys.
4. Use `Shift+Enter` for a newline when supported; the UI also provides its configured fallback key.
5. Keep the font size readable and disable aggressive terminal line wrapping if your client offers that option.
6. Use `pnpm mcode --continue` to resume the latest session after reconnecting.

## Common commands

| Goal | Command |
|---|---|
| Start the UI | `pnpm mcode` |
| Continue the latest session | `pnpm mcode --continue` |
| Run one headless task | `pnpm mcode exec "your prompt"` |
| See help | `pnpm mcode --help` |
| Build after an update | `pnpm install --frozen-lockfile && pnpm build` |
| Run the mobile layout test | `pnpm exec vitest run packages/tui/test/unit/tui/shell/layout-policy.test.ts` |

## Limitations

A terminal app cannot provide native Android widgets, push notifications, background execution, or touch-specific UI by itself. Those capabilities require an Android wrapper or a separate mobile client. This project focuses on making the existing terminal experience usable on a phone through Termux or SSH.
