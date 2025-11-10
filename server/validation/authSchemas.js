import { z } from 'zod';

export const signupSchema = z.object({
  identifier: z.string().optional(),
  email: z.string().email().optional(),
  phone: z.string().optional(),
  password: z.string().min(6),
  accountType: z.string().nullish(),
  referralCode: z.string().optional(),
});

export const loginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(1),
});

export const forgotSchema = z.object({
  email: z.string().email(),
});

export const resetSchema = z.object({
  email: z.string().email(),
  token: z.string().min(10),
  password: z.string().min(6),
});
