import { z } from 'zod';

export const createDealSchema = z.object({
  title: z.string().min(1, 'Title is required'),
  value: z.number().positive('Value must be positive'),
  currency: z.string().default('USD').optional(),
  description: z.string().optional(),
  supplierId: z.union([z.string(), z.number()]).transform(String).refine((val) => val && val.length > 0, 'Supplier ID is required'),
  status: z.string().default('pending').optional()
});

export const updateDealSchema = z.object({
  title: z.string().min(1, 'Title is required').optional(),
  value: z.number().positive('Value must be positive').optional(),
  currency: z.string().optional(),
  description: z.string().optional(),
  status: z.string().optional()
});

export const createSupplierSchema = z.object({
  name: z.string().min(1, 'Name is required'),
  email: z.string().email('Invalid email format'),
  country: z.string().min(2, 'Country code is required'),
  riskScore: z.number().min(0).max(100, 'Risk score must be between 0 and 100').default(0)
});

export const updateSupplierSchema = z.object({
  name: z.string().min(1, 'Name is required').optional(),
  email: z.string().email('Invalid email format').optional(),
  country: z.string().min(2, 'Country code is required').optional(),
  riskScore: z.number().min(0).max(100, 'Risk score must be between 0 and 100').optional()
});

export const loginSchema = z.object({
  email: z.string().email('Invalid email format'),
  password: z.string().min(6, 'Password must be at least 6 characters')
});

export const signupSchema = z.object({
  name: z.string().min(1, 'Name is required'),
  email: z.string().email('Invalid email format'),
  password: z.string().min(6, 'Password must be at least 6 characters')
});
