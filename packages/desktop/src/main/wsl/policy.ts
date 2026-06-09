import type { WslDistroProbe, WslConduitCheck, WslServerItem } from "../../preload/types"

export function wslServerIdToRestart(servers: WslServerItem[], distro: string) {
  return servers.find((item) => item.config.distro === distro)?.config.id
}

export function clearWslDistroState(
  distroProbes: Record<string, WslDistroProbe>,
  conduitChecks: Record<string, WslConduitCheck>,
  distro: string,
) {
  const nextDistroProbes = { ...distroProbes }
  const nextConduitChecks = { ...conduitChecks }
  delete nextDistroProbes[distro]
  delete nextConduitChecks[distro]
  return { distroProbes: nextDistroProbes, conduitChecks: nextConduitChecks }
}

export function wslTerminalArgs(distro?: string | null) {
  return ["/c", "start", "", "wsl", ...(distro ? ["-d", distro] : [])]
}

export function requireWslIpcString(name: string, value: unknown) {
  if (typeof value === "string" && value.length > 0) return value
  throw new Error(`Invalid ${name}`)
}
