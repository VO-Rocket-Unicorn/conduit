declare global {
  const CONDUIT_VERSION: string
  const CONDUIT_CHANNEL: string
}

export const InstallationVersion = typeof CONDUIT_VERSION === "string" ? CONDUIT_VERSION : "local"
export const InstallationChannel = typeof CONDUIT_CHANNEL === "string" ? CONDUIT_CHANNEL : "local"
export const InstallationLocal = InstallationChannel === "local"
