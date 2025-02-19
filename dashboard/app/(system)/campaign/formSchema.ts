import { z } from 'zod';

// ✅ Badge 타입 정의
export type Badge = {
  name?: string;
  stage?: number;
};

// ✅ FormValues 타입 정의
export type FormValues = z.infer<typeof formSchema>;

// ✅ Badge 관련 필드 스키마 (stage는 optional)
// const badgeSchema = z.object({
//   name: z.string().optional(),
//   stage: z.number().optional(),
// });

// ✅ 전체 폼 스키마
export const formSchema = z
  .object({
    certificationName: z
      .string()
      .min(2, {
        message: 'Certification name must be at least 2 characters.',
      })
      .max(30, {
        message: 'Certification name must be at most 30 characters.',
      }),
    slug: z
      .string()
      .regex(/^[a-z0-9-]+$/, {
        message: 'Slug는 영문 소문자, 숫자, 하이픈(-)만 사용할 수 있습니다.',
      })
      .min(1, 'Slug는 최소 1자 이상이어야 합니다.'),
    startDate: z.date({
      required_error: 'Please select a date Start Date',
    }),
    endDate: z.date({
      required_error: 'Please select a date End Date',
    }),
    copyMedia: z.string().optional(),
    copyTarget: z.string().optional(),
    numberOfStages: z.string({
      required_error: 'Please select Number of Stages',
    }),
    firstBadgeName: z
      .string()
      .min(2, { message: 'Badge name must be at least 2 characters.' }),
    ffFirstBadgeStage: z.string({
      required_error: 'Please select FF First Badge Stage',
    }),
    fsmFirstBadgeStage: z.string({
      required_error: 'Please select FSM First Badge Stage',
    }),
    secondBadgeName: z.string().optional(),
    ffSecondBadgeStage: z
      .string({
        required_error: 'Please select FF Second Badge Stage',
      })
      .optional(),
    fsmSecondBadgeStage: z
      .string({
        required_error: 'Please select FSM Second Badge Stage',
      })
      .optional(),
  })
  .superRefine((data, ctx) => {
    // ✅ startDate와 endDate가 존재하는 경우만 비교 (undefined 방지)
    if (data.startDate && data.endDate && data.endDate < data.startDate) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: 'End date must be after start date.',
        path: ['endDate'],
      });
    }

    // ✅ secondBadgeName이 존재하는 경우만 길이 검사
    if (
      data.secondBadgeName !== undefined &&
      data.secondBadgeName.length > 0 &&
      data.secondBadgeName.length < 2
    ) {
      ctx.addIssue({
        code: z.ZodIssueCode.too_small,
        type: 'string',
        minimum: 2,
        inclusive: true,
        message: 'Second badge name must be at least 2 characters.',
        path: ['secondBadgeName'],
      });
    }

    if (
      data.ffFirstBadgeStage !== undefined &&
      data.ffSecondBadgeStage !== undefined &&
      data.ffFirstBadgeStage !== '' &&
      data.ffSecondBadgeStage !== ''
    ) {
      const firstStage = Number(data.ffFirstBadgeStage);
      const secondStage = Number(data.ffSecondBadgeStage);

      if (
        !isNaN(firstStage) &&
        !isNaN(secondStage) &&
        firstStage >= secondStage
      ) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message:
            'FF Second Badge Stage must be greater than FF First Badge Stage.',
          path: ['ffSecondBadgeStage'],
        });
      }
    }
  });
