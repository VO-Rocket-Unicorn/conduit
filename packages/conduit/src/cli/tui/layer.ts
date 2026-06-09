import { run as runTui, type TuiInput } from "@conduit-ai/tui"
import { Global } from "@conduit-ai/core/global"
import { Effect } from "effect"

export function run(input: TuiInput) {
  return runTui(input).pipe(Effect.provide(Global.defaultLayer))
}
