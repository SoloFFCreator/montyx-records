# Original MiniMax Code vs Phone-Friendly Build

This deployment is based on the upstream MiniMax Code CLI/TUI. The core agent, provider, session, plugin, and command behavior remains upstream-compatible; the changes are focused on terminal layout behavior for mobile use.

| Area | Original version | Phone-friendly build |
|---|---|---|
| Primary target | Desktop terminals and full-size SSH sessions | Termux, mobile terminal apps, and narrow SSH panes |
| Compact breakpoint by width | Compact layout below 48 columns | Compact layout below 56 columns |
| Compact breakpoint by height | Compact layout below 12 rows | Compact layout below 16 rows |
| Welcome screen sizing | Chose density primarily from width | Uses the available width and viewport height |
| Narrow-screen padding | Could retain standard framing until the terminal became very narrow | Removes horizontal padding earlier to preserve editor space |
| Agent behavior | Full MiniMax Code behavior | Unchanged; this deployment changes presentation, not agent semantics |
| Input model | Keyboard-driven terminal input | Same input model, with compact labels and better use of phone terminal dimensions |
| Native Android UI | Not included | Not included; run through Termux or SSH |
| Build and verification | Upstream build and test workflow | Same workflow, plus phone breakpoint regression tests |

## What changed technically

The layout policy now treats a terminal under 56 columns or 16 rows as compact. The welcome component passes its available height into that policy, allowing a short portrait terminal to use the compact welcome view even when its width is relatively generous. Regression tests cover common phone-sized widths, short viewports, and the standard/wide boundaries.

## What did not change

The build does not replace MiniMax Code's runtime, provider integrations, authentication model, session persistence, command set, or tool execution policies. It is not a fork of the agent protocol. Users can continue to use the original MiniMax Code documentation for features unrelated to terminal presentation.

## Choosing between versions

Use the upstream version if you primarily work in a large desktop terminal and want the original layout thresholds. Use this build if you work from Android, Termux, a mobile SSH application, a split-screen terminal, or a short terminal window where preserving input and conversation space matters more than wide framing.

## Validation performed

The phone-friendly build was validated with:

- Three focused layout policy tests.
- Standalone TypeScript typechecking.
- The production bundle build.
- `git diff --check` for whitespace errors.
