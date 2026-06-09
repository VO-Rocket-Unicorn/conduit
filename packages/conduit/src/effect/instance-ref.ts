import { Context } from "effect"
import type { InstanceContext } from "@/project/instance-context"
import type { WorkspaceV2 } from "@conduit-ai/core/workspace"

export const InstanceRef = Context.Reference<InstanceContext | undefined>("~conduit/InstanceRef", {
  defaultValue: () => undefined,
})

export const WorkspaceRef = Context.Reference<WorkspaceV2.ID | undefined>("~conduit/WorkspaceRef", {
  defaultValue: () => undefined,
})
