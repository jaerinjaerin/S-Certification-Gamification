import { z } from 'zod';

// 🟢 유효성 검사 함수들
const validateDateRange = (startDate: Date, endDate: Date): boolean =>
  endDate >= startDate;

const validateBadgeStages = (
  firstStage: number,
  secondStage?: number
): boolean => secondStage === undefined || secondStage > firstStage;

const isNotEmpty = (value?: string) =>
  value !== undefined && value.trim() !== '';

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
  secondBadgeName: z.string().optional(),
  ffSecondBadgeStage: z.string().optional(),
  fsmSecondBadgeStage: z.string().optional(),
});

const campaignIdSchema = z.object({
  targetSourceCampaignId: z.string().optional(),
  imageSourceCampaignId: z.string().optional(),
  uiLanguageSourceCampaignId: z.string().optional(),
});

export const formSchema = z
  .object({
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
  })
  .superRefine((data, ctx) => {
    // 🟢 dateRange validation
    if (
      data.startDate &&
      data.endDate &&
      !validateDateRange(data.startDate, data.endDate)
    ) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: 'End date must be after start date.',
        path: ['endDate'],
      });
    }

    // 🟢 secondBadgeName.length validation
    if (isNotEmpty(data.secondBadgeName) && data.secondBadgeName!.length < 2) {
      ctx.addIssue({
        code: z.ZodIssueCode.too_small,
        type: 'string',
        minimum: 2,
        inclusive: true,
        message: 'Second badge name must be at least 2 characters.',
        path: ['secondBadgeName'],
      });
    }

    // 🟢 ffSecondBadgeStage 또는 fsmSecondBadgeStage 값이 있는 경우, secondBadgeName이 존재하는지 유효성 검사
    if (
      (isNotEmpty(data.ffSecondBadgeStage) ||
        isNotEmpty(data.fsmSecondBadgeStage)) &&
      !isNotEmpty(data.secondBadgeName)
    ) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message:
          'Second Badge Name is required when any Second Badge Stage is provided.',
        path: ['secondBadgeName'],
      });
    }

    // 🟢 뱃지 스테이지 순서 검증
    const validateStageOrder = (
      first: string,
      second?: string,
      path?: string
    ) => {
      if (first && second) {
        const firstStage = Number(first);
        const secondStage = Number(second);
        if (
          !isNaN(firstStage) &&
          !isNaN(secondStage) &&
          !validateBadgeStages(firstStage, secondStage)
        ) {
          ctx.addIssue({
            code: z.ZodIssueCode.custom,
            message: `${path} must be greater than previous stage.`,
            path: [path!],
          });
        }
      }
    };

    validateStageOrder(
      data.ffFirstBadgeStage,
      data.ffSecondBadgeStage,
      'ffSecondBadgeStage'
    );
    validateStageOrder(
      data.fsmFirstBadgeStage,
      data.fsmSecondBadgeStage,
      'fsmSecondBadgeStage'
    );
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
  secondBadgeName: 'Advanced',
  ffSecondBadgeStage: undefined,
  fsmSecondBadgeStage: undefined,
  targetSourceCampaignId: undefined,
  imageSourceCampaignId: undefined,
  uiLanguageSourceCampaignId: undefined,
};
