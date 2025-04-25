import { z } from 'zod';

export const eventCreate = z.object({
  name: z.string(),
  eventDate: z.coerce.date()
});
