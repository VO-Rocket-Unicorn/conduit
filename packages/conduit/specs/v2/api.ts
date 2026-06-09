// @ts-nocheck

import { Conduit } from "@conduit-ai/core"
import { ReadTool } from "@conduit-ai/core/tools"

const conduit = Conduit.make({})

conduit.tool.add(ReadTool)

conduit.tool.add({
  name: "bash",
  schema: {
    type: "object",
    properties: {
      command: {
        type: "string",
        description: "The command to run.",
      },
    },
    required: ["command"],
  },
  execute(input, ctx) {},
})

conduit.auth.add({
  provider: "openai",
  type: "api",
  value: process.env.OPENAI_API_KEY,
})

conduit.agent.add({
  name: "build",
  permissions: [],
  model: {
    id: "gpt-5-5",
    provider: "openai",
    variant: "xhigh",
  },
})

const sessionID = await conduit.session.create({
  agent: "build",
})

conduit.subscribe((event) => {
  console.log(event)
})

await conduit.session.prompt({
  sessionID,
  text: "hey what is up",
})

await conduit.session.prompt({
  sessionID,
  text: "what is up with this",
  files: [
    {
      mime: "image/png",
      uri: "data:image/png;base64,xxxx",
    },
  ],
})

await conduit.session.wait()

console.log(await conduit.session.messages(sessionID))
