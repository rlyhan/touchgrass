import { z } from "zod"

import {
  ACTIVITY_FIELDS,
  BUILDS,
  EMPLOYMENT_STATUSES,
  GENDERS,
  MOTIVATION_OPTIONS,
} from "@touchgrass/types/constants"

import { bfasScoresSchema } from "../../db/validation.js"

const isoDate = z
  .string()
  .regex(/^\d{4}-\d{2}-\d{2}$/, "must be YYYY-MM-DD")

const heightCm = z
  .string()
  .regex(/^\d+$/, "must be a positive integer")
  .refine((value) => Number(value) > 0, "must be a positive integer")

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

export const profileUpdateSchema = onboardingFormSchema.pick({
  interests: true,
  personality: true,
  motivations: true,
}).partial()
.strict()
.refine((data) => Object.keys(data).length > 0, {
  message: "At least one field must be provided for update",
})
