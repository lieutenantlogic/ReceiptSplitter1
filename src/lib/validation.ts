import { z } from "zod";

export const itemSchema = z.object({
  id: z.string().min(1),
  name: z.string().trim().min(1, "Item name is required").max(80),
  price: z.coerce.number().min(0, "Price cannot be negative").max(99999),
  assignedTo: z.string().nullable()
});

export const personSchema = z.object({
  id: z.string().min(1),
  name: z.string().trim().min(1, "Person name is required").max(50)
});

export const sessionUpdateSchema = z.object({
  title: z.string().trim().min(1).max(80),
  tax: z.coerce.number().min(0).max(99999),
  tip: z.coerce.number().min(0).max(99999),
  currency: z.string().trim().min(3).max(3),
  people: z.array(personSchema).min(1, "Add at least one person"),
  items: z.array(itemSchema).min(1, "Add at least one receipt item")
});

export const createSessionSchema = z.object({
  title: z.string().trim().min(1).max(80).default("New receipt"),
  tax: z.coerce.number().min(0).max(99999).default(0),
  tip: z.coerce.number().min(0).max(99999).default(0),
  currency: z.string().trim().min(3).max(3).default("USD"),
  items: z
    .array(
      z.object({
        name: z.string().trim().min(1).max(80),
        price: z.coerce.number().min(0).max(99999)
      })
    )
    .default([]),
  people: z.array(z.string().trim().min(1).max(50)).default(["Me"])
});
