import { z } from "zod";

/** Minimal Open-Meteo forecast response (we only validate fields we use). */
export const openMeteoForecastSchema = z.object({
  current: z
    .object({
      time: z.string(),
      temperature_2m: z.number().optional(),
      shortwave_radiation: z.number().optional(),
      cloud_cover: z.number().optional(),
    })
    .optional(),
  hourly: z
    .object({
      time: z.array(z.string()),
      temperature_2m: z.array(z.number()).optional(),
      shortwave_radiation: z.array(z.number()).optional(),
    })
    .optional(),
});

export type OpenMeteoForecastParsed = z.infer<typeof openMeteoForecastSchema>;
