import { z } from 'zod';

export const pointsAward = z.object({
  value: z.number(),
  type: z.string()
});
