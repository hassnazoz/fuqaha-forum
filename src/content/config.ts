import { defineCollection, z } from 'astro:content';

const articles = defineCollection({
  type: 'content',
  schema: z.object({
    title: z.string(),
    author: z.string().default('هيئة التحرير'),
    date: z.coerce.date(),
    category: z.string().default('أبحاث'),
    featured: z.boolean().default(false),
    image: z.string().optional(),
    excerpt: z.string().optional(),
  }),
});

const releases = defineCollection({
  type: 'content',
  schema: z.object({
    title: z.string(),
    date: z.coerce.date(),
    cover: z.string().optional(),
    downloadUrl: z.string().optional(),
  }),
});

const videos = defineCollection({
  type: 'content',
  schema: z.object({
    title: z.string(),
    date: z.coerce.date(),
    thumbnail: z.string().optional(),
    videoUrl: z.string(),
  }),
});

export const collections = { articles, releases, videos };