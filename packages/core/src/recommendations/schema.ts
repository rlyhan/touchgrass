import { z } from "zod"

import type { Activity } from "@touchgrass/types"
import {
  ACTIVITY_FIELDS,
  ACTIVITY_TYPES,
} from "@touchgrass/types/constants"

const activityInstructionSchema = z.object({
  title: z.string(),
  description: z.string().optional(),
})

const activityTipSchema = z.object({
  key: z.string(),
  description: z.string(),
})

// Sanity returns null for fields that are not yet set on a document, so the
// partial schema treats null and missing the same way: the field falls through
// to a mock value during merge. Only slug and title are required.
export const sanityActivitySchema = z.object({
  slug: z.string().min(1),
  title: z.string().min(1),
  imageUrl: z.string().nullish(),
  type: z.enum(ACTIVITY_TYPES).nullish(),
  field: z.enum(ACTIVITY_FIELDS).nullish(),
  estimated_time: z.string().nullish(),
  related_types: z.array(z.enum(ACTIVITY_TYPES)).nullish(),
  description: z.array(z.unknown()).nullish(),
  tips: z.array(activityTipSchema).nullish(),
  instructions: z.array(activityInstructionSchema).nullish(),
})

// Full Activity contract — used to validate Sanity-only documents before they
// are surfaced to clients (mocks have already been type-checked at build time).
//
// Sanity returns `null` for unset fields; Zod's `.optional()` only accepts
// `undefined`, so we use `.nullish().transform(v => v ?? undefined)` on every
// optional array field so that null values are coerced to undefined instead of
// failing validation.
export const activitySchema: z.ZodType<Activity> = z.object({
  slug: z.string().min(1),
  title: z.string().min(1),
  imageUrl: z.string().min(1),
  type: z.enum(ACTIVITY_TYPES),
  field: z.enum(ACTIVITY_FIELDS),
  estimated_time: z.string().min(1),
  related_types: z
    .array(z.enum(ACTIVITY_TYPES))
    .nullish()
    .transform((v) => v ?? undefined),
  description: z
    .array(z.unknown())
    .nullish()
    .transform((v) => v ?? undefined) as z.ZodType<Activity["description"]>,
  tips: z
    .array(activityTipSchema)
    .nullish()
    .transform((v) => v ?? undefined),
  instructions: z
    .array(activityInstructionSchema)
    .nullish()
    .transform((v) => v ?? undefined),
}) as z.ZodType<Activity>
