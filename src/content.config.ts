import { defineCollection } from 'astro:content';
import { z } from 'astro/zod';
import { glob } from 'astro/loaders';
import { globSync } from 'node:fs';
const insights = defineCollection({
  // An empty collection is valid before the first approved article is added.
  loader: [...globSync('src/content/insights/**/*.md')].some(
    (file) => !file.endsWith('/editorial-placeholder.md'),
  )
    ? glob({ pattern: ['**/*.md', '!editorial-placeholder.md'], base: './src/content/insights' })
    : async () => [],
  schema: z.object({
    title: z.string(),
    description: z.string(),
    publishedAt: z.coerce.date(),
    author: z.string(),
    pillar: z.string(),
    approved: z.boolean().default(false),
    draft: z.boolean().default(true),
  }),
});
export const collections = { insights };
