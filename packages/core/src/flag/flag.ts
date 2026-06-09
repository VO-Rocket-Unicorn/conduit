import { Config } from "effect"

export function truthy(key: string) {
  const value = process.env[key]?.toLowerCase()
  return value === "true" || value === "1"
}

const copy = process.env["CONDUIT_EXPERIMENTAL_DISABLE_COPY_ON_SELECT"]

function enabledByExperimental(key: string) {
  return process.env[key] === undefined ? truthy("CONDUIT_EXPERIMENTAL") : truthy(key)
}

export const Flag = {
  OTEL_EXPORTER_OTLP_ENDPOINT: process.env["OTEL_EXPORTER_OTLP_ENDPOINT"],
  OTEL_EXPORTER_OTLP_HEADERS: process.env["OTEL_EXPORTER_OTLP_HEADERS"],

  CONDUIT_AUTO_HEAP_SNAPSHOT: truthy("CONDUIT_AUTO_HEAP_SNAPSHOT"),
  CONDUIT_GIT_BASH_PATH: process.env["CONDUIT_GIT_BASH_PATH"],
  CONDUIT_CONFIG: process.env["CONDUIT_CONFIG"],
  CONDUIT_CONFIG_CONTENT: process.env["CONDUIT_CONFIG_CONTENT"],
  CONDUIT_DISABLE_AUTOUPDATE: truthy("CONDUIT_DISABLE_AUTOUPDATE"),
  CONDUIT_ALWAYS_NOTIFY_UPDATE: truthy("CONDUIT_ALWAYS_NOTIFY_UPDATE"),
  CONDUIT_DISABLE_PRUNE: truthy("CONDUIT_DISABLE_PRUNE"),
  CONDUIT_DISABLE_TERMINAL_TITLE: truthy("CONDUIT_DISABLE_TERMINAL_TITLE"),
  CONDUIT_SHOW_TTFD: truthy("CONDUIT_SHOW_TTFD"),
  CONDUIT_DISABLE_AUTOCOMPACT: truthy("CONDUIT_DISABLE_AUTOCOMPACT"),
  CONDUIT_DISABLE_MODELS_FETCH: truthy("CONDUIT_DISABLE_MODELS_FETCH"),
  CONDUIT_DISABLE_MOUSE: truthy("CONDUIT_DISABLE_MOUSE"),
  CONDUIT_FAKE_VCS: process.env["CONDUIT_FAKE_VCS"],
  CONDUIT_SERVER_PASSWORD: process.env["CONDUIT_SERVER_PASSWORD"],
  CONDUIT_SERVER_USERNAME: process.env["CONDUIT_SERVER_USERNAME"],

  // Experimental
  CONDUIT_EXPERIMENTAL_FILEWATCHER: Config.boolean("CONDUIT_EXPERIMENTAL_FILEWATCHER").pipe(
    Config.withDefault(false),
  ),
  CONDUIT_EXPERIMENTAL_DISABLE_FILEWATCHER: Config.boolean("CONDUIT_EXPERIMENTAL_DISABLE_FILEWATCHER").pipe(
    Config.withDefault(false),
  ),
  CONDUIT_EXPERIMENTAL_DISABLE_COPY_ON_SELECT:
    copy === undefined ? process.platform === "win32" : truthy("CONDUIT_EXPERIMENTAL_DISABLE_COPY_ON_SELECT"),
  CONDUIT_MODELS_URL: process.env["CONDUIT_MODELS_URL"],
  CONDUIT_MODELS_PATH: process.env["CONDUIT_MODELS_PATH"],
  CONDUIT_DB: process.env["CONDUIT_DB"],

  CONDUIT_WORKSPACE_ID: process.env["CONDUIT_WORKSPACE_ID"],
  CONDUIT_EXPERIMENTAL_WORKSPACES: enabledByExperimental("CONDUIT_EXPERIMENTAL_WORKSPACES"),
  CONDUIT_EXPERIMENTAL_SESSION_SWITCHER: enabledByExperimental("CONDUIT_EXPERIMENTAL_SESSION_SWITCHER"),

  // Evaluated at access time (not module load) because tests, the CLI, and
  // external tooling set these env vars at runtime.
  get CONDUIT_DISABLE_PROJECT_CONFIG() {
    return truthy("CONDUIT_DISABLE_PROJECT_CONFIG")
  },
  get CONDUIT_EXPERIMENTAL_REFERENCES() {
    return enabledByExperimental("CONDUIT_EXPERIMENTAL_REFERENCES")
  },
  get CONDUIT_TUI_CONFIG() {
    return process.env["CONDUIT_TUI_CONFIG"]
  },
  get CONDUIT_CONFIG_DIR() {
    return process.env["CONDUIT_CONFIG_DIR"]
  },
  get CONDUIT_PURE() {
    return truthy("CONDUIT_PURE")
  },
  get CONDUIT_PERMISSION() {
    return process.env["CONDUIT_PERMISSION"]
  },
  get CONDUIT_PLUGIN_META_FILE() {
    return process.env["CONDUIT_PLUGIN_META_FILE"]
  },
  get CONDUIT_CLIENT() {
    return process.env["CONDUIT_CLIENT"] ?? "cli"
  },
}
