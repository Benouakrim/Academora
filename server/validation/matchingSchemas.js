import { z } from 'zod';

const numberOrUndefined = z.number().finite().optional();
const stringOrAny = z.string().optional();

export const matchingCriteriaSchema = z.object({
  country: stringOrAny,
  minTuition: numberOrUndefined,
  maxTuition: numberOrUndefined,
  minMatchPercentage: numberOrUndefined,
  interests: z.array(z.string()).optional(),
  academics: z.object({
    enabled: z.boolean().optional(),
    filters: z.object({
      minGpa: numberOrUndefined,
      degreeLevel: z.string().optional(),
      languages: z.array(z.string()).optional(),
      testPolicy: z.string().optional(),
    }).partial().optional(),
  }).partial().optional(),
  financials: z.object({
    enabled: z.boolean().optional(),
    filters: z.object({
      maxBudget: numberOrUndefined,
      maxCostOfLiving: numberOrUndefined,
      minScholarship: numberOrUndefined,
      scholarshipsInternational: z.boolean().optional(),
      needBlind: z.boolean().optional(),
    }).partial().optional(),
  }).partial().optional(),
  lifestyle: z.object({
    enabled: z.boolean().optional(),
    filters: z.object({
      country: z.string().optional(),
      city: z.string().optional(),
      climate: z.string().optional(),
      campusSetting: z.string().optional(),
    }).partial().optional(),
  }).partial().optional(),
  admissions: z.object({
    enabled: z.boolean().optional(),
    filters: z.object({
      maxAcceptanceRate: numberOrUndefined,
      minSat: numberOrUndefined,
    }).partial().optional(),
  }).partial().optional(),
  demographics: z.object({
    enabled: z.boolean().optional(),
    filters: z.object({
      minEnrollment: numberOrUndefined,
      maxEnrollment: numberOrUndefined,
      minInternationalPct: numberOrUndefined,
      maxInternationalPct: numberOrUndefined,
    }).partial().optional(),
  }).partial().optional(),
  future: z.object({
    enabled: z.boolean().optional(),
    filters: z.object({
      minVisaMonths: numberOrUndefined,
      minInternshipStrength: numberOrUndefined,
      minAlumniStrength: numberOrUndefined,
      minGraduationRate: numberOrUndefined,
      minEmploymentRate: numberOrUndefined,
    }).partial().optional(),
  }).partial().optional(),
}).partial();
