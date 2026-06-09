export * from "./client.js"
export * from "./server.js"

import { createConduitClient } from "./client.js"
import { createConduitServer } from "./server.js"
import type { ServerOptions } from "./server.js"

export async function createConduit(options?: ServerOptions) {
  const server = await createConduitServer({
    ...options,
  })

  const client = createConduitClient({
    baseUrl: server.url,
  })

  return {
    client,
    server,
  }
}
