import { z } from "zod";

/** PVGIS v5_2 PVcalc JSON — flexible: totals + monthly if present */
export const pvgisPVcalcSchema = z.object({
  outputs: z
    .object({
      totals: z
        .object({
          E_y: z.number().optional(),
          E_m: z.array(z.number()).optional(),
        })
        .optional(),
    })
    .optional(),
});

export type PvgisPVcalcParsed = z.infer<typeof pvgisPVcalcSchema>;
