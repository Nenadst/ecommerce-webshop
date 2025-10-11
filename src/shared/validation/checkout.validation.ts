import { z } from 'zod';

const postalCodePatterns: Record<string, RegExp> = {
  Portugal: /^\d{4}-\d{3}$/,
  Belgium: /^\d{4}$/,
};

export const checkoutValidationSchema = z
  .object({
    email: z
      .string()
      .min(1, 'Email is required')
      .email('Invalid email address')
      .max(100, 'Email must be less than 100 characters')
      .toLowerCase()
      .trim(),

    phone: z
      .string()
      .min(1, 'Phone number is required')
      .regex(
        /^[\+]?[(]?[0-9]{1,4}[)]?[-\s\.]?[(]?[0-9]{1,4}[)]?[-\s\.]?[0-9]{1,9}$/,
        'Invalid phone number format'
      )
      .refine(
        (phone) => {
          const digits = phone.replace(/\D/g, '');
          return digits.length >= 7 && digits.length <= 15;
        },
        { message: 'Phone number must contain between 7 and 15 digits' }
      )
      .trim(),

    firstName: z
      .string()
      .min(1, 'First name is required')
      .min(2, 'First name must be at least 2 characters')
      .max(50, 'First name must be less than 50 characters')
      .regex(
        /^[a-zA-ZÀ-ÿ\s'-]+$/,
        'First name can only contain letters, spaces, hyphens and apostrophes'
      )
      .trim(),

    lastName: z
      .string()
      .min(1, 'Last name is required')
      .min(2, 'Last name must be at least 2 characters')
      .max(50, 'Last name must be less than 50 characters')
      .regex(
        /^[a-zA-ZÀ-ÿ\s'-]+$/,
        'Last name can only contain letters, spaces, hyphens and apostrophes'
      )
      .trim(),

    address: z
      .string()
      .min(1, 'Address is required')
      .min(5, 'Address must be at least 5 characters')
      .max(200, 'Address must be less than 200 characters')
      .trim(),

    city: z
      .string()
      .min(1, 'City is required')
      .min(2, 'City must be at least 2 characters')
      .max(100, 'City must be less than 100 characters')
      .regex(/^[a-zA-ZÀ-ÿ\s'-]+$/, 'City can only contain letters, spaces, hyphens and apostrophes')
      .trim(),

    postalCode: z.string().min(1, 'Postal code is required').trim(),

    country: z.enum(['Portugal', 'Belgium'], {
      message: 'Please select a valid country',
    }),

    paymentMethod: z.enum(['card'], {
      message: 'Please select a valid payment method',
    }),
  })
  .superRefine((data, ctx) => {
    const pattern = postalCodePatterns[data.country];
    if (pattern && !pattern.test(data.postalCode)) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message:
          data.country === 'Portugal' ? 'Must be in format XXXX-XXX' : 'Must be in format XXXX',
        path: ['postalCode'],
      });
    }
  });

export type CheckoutFormData = z.infer<typeof checkoutValidationSchema>;

export function validateCheckoutData(data: unknown) {
  return checkoutValidationSchema.safeParse(data);
}

export function sanitizeCheckoutData(data: CheckoutFormData): CheckoutFormData {
  return {
    email: data.email.toLowerCase().trim(),
    phone: data.phone.trim(),
    firstName: data.firstName.trim(),
    lastName: data.lastName.trim(),
    address: data.address.trim(),
    city: data.city.trim(),
    postalCode: data.postalCode.trim(),
    country: data.country,
    paymentMethod: data.paymentMethod,
  };
}
