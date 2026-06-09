interface ImportMetaEnv {
  readonly CONDUIT_CHANNEL: string
}

interface ImportMeta {
  readonly env: ImportMetaEnv
}

declare module "virtual:conduit-server" {
  export namespace Server {
    export const listen: typeof import("../../../conduit/dist/types/src/node").Server.listen
    export type Listener = import("../../../conduit/dist/types/src/node").Server.Listener
  }
  export namespace Config {
    export const get: typeof import("../../../conduit/dist/types/src/node").Config.get
    export type Info = import("../../../conduit/dist/types/src/node").Config.Info
  }
  export const bootstrap: typeof import("../../../conduit/dist/types/src/node").bootstrap
}
