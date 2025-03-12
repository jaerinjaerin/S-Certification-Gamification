import { z } from 'zod';

const validateRequiredString = (minLength: number, message: string) =>
  z.string().min(minLength, { message });

const badgeSchema = z.object({
  firstBadgeName: validateRequiredString(
    2,
    'Badge name must be at least 2 characters.'
  ),
  ffFirstBadgeStage: z.string({
    required_error: 'Please select FF First Badge Stage',
  }),
  fsmFirstBadgeStage: z.string({
    required_error: 'Please select FSM First Badge Stage',
  }),
  secondBadgeName: z
    .string()
    .optional()
    .refine((value) => !value || value.length >= 2, {
      message: 'secondBadgeName must be at least 2 characters if provided.',
    }),
  ffSecondBadgeStage: z.string().optional(),
  fsmSecondBadgeStage: z.string().optional(),
});

const campaignIdSchema = z.object({
  targetSourceCampaignId: z.string().optional(),
  imageSourceCampaignId: z.string().optional(),
  uiLanguageSourceCampaignId: z.string().optional(),
});

export const formSchema = z.object({
  certificationName: validateRequiredString(
    2,
    'Certification name must be at least 2 characters.'
  ).max(30, { message: 'Certification name must be at most 30 characters.' }),

  slug: z
    .string()
    .regex(/^[a-z0-9-]+$/, {
      message:
        'Only lowercase English letters, numbers, and hyphens (-) are allowed.',
    })
    .min(1, 'Slug must be at least 1 character.'),

  isSlugChecked: z
    .boolean()
    .default(false)
    .refine((value) => value === true, {
      message: 'Slug availability must be verified before submission.',
    }),

  startDate: z.date({
    required_error: 'Please select a date Start Date',
  }),
  endDate: z.date({
    required_error: 'Please select a date End Date',
  }),

  copyMedia: z.string().optional(),
  copyTarget: z.string().optional(),
  copyUiLanguage: z.string().optional(),

  numberOfStages: z.string({
    required_error: 'Please select Number of Stages',
  }),

  ...badgeSchema.shape,
  ...campaignIdSchema.shape,
  custom: z.string().optional(),
});

// ✅ FormValues 타입 정의
export type FormValues = z.infer<typeof formSchema>;

export const defaultValues = {
  certificationName: '',
  slug: '',
  isSlugChecked: false,
  startDate: undefined,
  endDate: undefined,
  copyMedia: undefined,
  copyTarget: undefined,
  copyUiLanguage: undefined,
  numberOfStages: undefined,
  firstBadgeName: 'Expert',
  ffFirstBadgeStage: undefined,
  fsmFirstBadgeStage: undefined,
  secondBadgeName: undefined,
  ffSecondBadgeStage: undefined,
  fsmSecondBadgeStage: undefined,
  targetSourceCampaignId: undefined,
  imageSourceCampaignId: undefined,
  uiLanguageSourceCampaignId: undefined,
};
