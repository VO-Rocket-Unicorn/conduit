import { $ } from "bun"

await $`bun ./scripts/copy-icons.ts ${process.env.CONDUIT_CHANNEL ?? "dev"}`

await $`cd ../conduit && bun script/build-node.ts`
