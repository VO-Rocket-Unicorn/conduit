import { Config, ConfigProvider, Context, Effect, Layer, Option } from "effect"
import { ConfigService } from "@/effect/config-service"

const bool = (name: string) => Config.boolean(name).pipe(Config.withDefault(false))
const positiveInteger = (name: string) =>
  Config.number(name).pipe(
    Config.map((value) => (Number.isInteger(value) && value > 0 ? value : undefined)),
    Config.orElse(() => Config.succeed(undefined)),
  )
const experimental = bool("CONDUIT_EXPERIMENTAL")
const enabledByExperimental = (name: string) =>
  Config.all({ experimental, enabled: Config.boolean(name).pipe(Config.option) }).pipe(
    Config.map((flags) => Option.getOrElse(flags.enabled, () => flags.experimental)),
  )

export class Service extends ConfigService.Service<Service>()("@conduit/RuntimeFlags", {
  autoShare: bool("CONDUIT_AUTO_SHARE"),
  pure: bool("CONDUIT_PURE"),
  disableDefaultPlugins: bool("CONDUIT_DISABLE_DEFAULT_PLUGINS"),
  disableEmbeddedWebUi: bool("CONDUIT_DISABLE_EMBEDDED_WEB_UI"),
  disableExternalSkills: bool("CONDUIT_DISABLE_EXTERNAL_SKILLS"),
  disableLspDownload: bool("CONDUIT_DISABLE_LSP_DOWNLOAD"),
  disableClaudeCodePrompt: Config.all({
    broad: bool("CONDUIT_DISABLE_CLAUDE_CODE"),
    direct: bool("CONDUIT_DISABLE_CLAUDE_CODE_PROMPT"),
  }).pipe(Config.map((flags) => flags.broad || flags.direct)),
  disableClaudeCodeSkills: Config.all({
    broad: bool("CONDUIT_DISABLE_CLAUDE_CODE"),
    direct: bool("CONDUIT_DISABLE_CLAUDE_CODE_SKILLS"),
  }).pipe(Config.map((flags) => flags.broad || flags.direct)),
  enableExa: Config.all({
    experimental,
    enabled: bool("CONDUIT_ENABLE_EXA"),
    legacy: bool("CONDUIT_EXPERIMENTAL_EXA"),
  }).pipe(Config.map((flags) => flags.experimental || flags.enabled || flags.legacy)),
  enableParallel: Config.all({
    enabled: bool("CONDUIT_ENABLE_PARALLEL"),
    legacy: bool("CONDUIT_EXPERIMENTAL_PARALLEL"),
  }).pipe(Config.map((flags) => flags.enabled || flags.legacy)),
  enableExperimentalModels: bool("CONDUIT_ENABLE_EXPERIMENTAL_MODELS"),
  enableQuestionTool: bool("CONDUIT_ENABLE_QUESTION_TOOL"),
  experimentalReferences: enabledByExperimental("CONDUIT_EXPERIMENTAL_REFERENCES"),
  experimentalBackgroundSubagents: enabledByExperimental("CONDUIT_EXPERIMENTAL_BACKGROUND_SUBAGENTS"),
  experimentalLspTy: bool("CONDUIT_EXPERIMENTAL_LSP_TY"),
  experimentalLspTool: enabledByExperimental("CONDUIT_EXPERIMENTAL_LSP_TOOL"),
  experimentalOxfmt: enabledByExperimental("CONDUIT_EXPERIMENTAL_OXFMT"),
  experimentalPlanMode: enabledByExperimental("CONDUIT_EXPERIMENTAL_PLAN_MODE"),
  experimentalEventSystem: enabledByExperimental("CONDUIT_EXPERIMENTAL_EVENT_SYSTEM"),
  experimentalWorkspaces: enabledByExperimental("CONDUIT_EXPERIMENTAL_WORKSPACES"),
  experimentalIconDiscovery: enabledByExperimental("CONDUIT_EXPERIMENTAL_ICON_DISCOVERY"),
  outputTokenMax: positiveInteger("CONDUIT_EXPERIMENTAL_OUTPUT_TOKEN_MAX"),
  bashDefaultTimeoutMs: positiveInteger("CONDUIT_EXPERIMENTAL_BASH_DEFAULT_TIMEOUT_MS"),
  experimentalNativeLlm: bool("CONDUIT_EXPERIMENTAL_NATIVE_LLM"),
  experimentalWebSockets: bool("CONDUIT_EXPERIMENTAL_WEBSOCKETS"),
  client: Config.string("CONDUIT_CLIENT").pipe(Config.withDefault("cli")),
}) {}

export type Info = Context.Service.Shape<typeof Service>

const emptyConfigLayer = Service.defaultLayer.pipe(
  Layer.provide(ConfigProvider.layer(ConfigProvider.fromUnknown({}))),
  Layer.orDie,
)

export const layer = (overrides: Partial<Info> = {}) =>
  Layer.effect(
    Service,
    Effect.gen(function* () {
      const flags = yield* Service
      return Service.of({ ...flags, ...overrides })
    }),
  ).pipe(Layer.provide(emptyConfigLayer))

export const defaultLayer = Service.defaultLayer.pipe(Layer.orDie)

export * as RuntimeFlags from "./runtime-flags"
