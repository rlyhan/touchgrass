import { z } from "zod"

import type { BFASTrait } from "@touchgrass/types"
import {
  ACTIVITY_FIELDS,
  BFAS_TRAITS,
  BUILDS,
  EMPLOYMENT_STATUSES,
  GENDERS,
  MOTIVATION_OPTIONS,
} from "@touchgrass/types/constants"

const isoDate = z
  .string()
  .regex(/^\d{4}-\d{2}-\d{2}$/, "must be YYYY-MM-DD")

const heightCm = z
  .string()
  .regex(/^\d+$/, "must be a positive integer")
  .refine((value) => Number(value) > 0, "must be a positive integer")

const bfasScore = z.number().min(0).max(100)

export const bfasScoresSchema = z.object(
  Object.fromEntries(
    BFAS_TRAITS.map((trait) => [trait.key, bfasScore]),
  ) as Record<BFASTrait, typeof bfasScore>,
)

export const onboardingFormSchema = z.object({
  name: z.string().min(1),
  birthdate: isoDate,
  heightCm,
  gender: z.enum(GENDERS).nullable(),
  build: z.enum(BUILDS).nullable(),
  location: z.string().min(1),
  employment: z.enum(EMPLOYMENT_STATUSES).nullable(),
  interests: z.array(z.enum(ACTIVITY_FIELDS)),
  personality: bfasScoresSchema,
  motivations: z.enum(MOTIVATION_OPTIONS.map((m) => m.value)).array().min(1),
})

export type OnboardingFormPayload = z.infer<typeof onboardingFormSchema>
