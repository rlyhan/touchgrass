import { BFASScores, OCEANScores } from '@touchgrass/types'

export const getOCEANScores = (bfas: BFASScores): OCEANScores => {
    return {
        Openness:
            (bfas.Openness + bfas.Intellect) / 2,

        Extraversion:
            (bfas.Enthusiasm + bfas.Assertiveness) / 2,

        Agreeableness:
            (bfas.Compassion + bfas.Politeness) / 2,

        Neuroticism:
            (bfas.Volatility + bfas.Withdrawal) / 2,

        Conscientiousness:
            (bfas.Industriousness + bfas.Orderliness) / 2,
    }
}
