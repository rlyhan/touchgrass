import { z } from "zod"

import type { BFASTrait } from "@touchgrass/types"
import { BFAS_TRAITS } from "@touchgrass/types/constants"

const bfasScore = z.number().min(0).max(100)

export const bfasScoresSchema = z.object(
  Object.fromEntries(
    BFAS_TRAITS.map((trait) => [trait.key, bfasScore]),
  ) as Record<BFASTrait, typeof bfasScore>,
)
