import { Flag } from "@conduit-ai/core/flag/flag"
import { createBuiltinPlugins, type BuiltinTuiPlugin } from "@conduit-ai/tui/builtins"
import type { RuntimeFlags } from "@/effect/runtime-flags"

export type InternalTuiPlugin = BuiltinTuiPlugin

export function internalTuiPlugins(flags: Pick<RuntimeFlags.Info, "experimentalEventSystem">): InternalTuiPlugin[] {
  return createBuiltinPlugins({
    experimentalEventSystem: flags.experimentalEventSystem,
    experimentalSessionSwitcher: Flag.CONDUIT_EXPERIMENTAL_SESSION_SWITCHER,
  })
}
