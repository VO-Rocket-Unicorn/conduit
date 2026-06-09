import type { WslConduitCheck, WslServerRuntime } from "./types"

export const wslRuntimeRetryable = (runtime: WslServerRuntime) =>
  runtime.kind === "failed" || runtime.kind === "stopped"

export async function enterWslConduitStep(
  distro: string,
  probe: (distro: string) => Promise<unknown>,
  select: (step: "conduit") => void,
) {
  await probe(distro)
  select("conduit")
}

export function wslConduitAction(check?: WslConduitCheck) {
  if (!check) return
  if (!check.resolvedPath) return "Install Conduit"
  if (check.matchesDesktop === false) return "Update Conduit"
}
