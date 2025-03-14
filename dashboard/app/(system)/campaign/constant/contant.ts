// API URL
export const API_ENDPOINTS = {
  CAMPAIGN: `${process.env.NEXT_PUBLIC_API_URL}/api/cms/campaign`,
  CHECK_SLUG: `${process.env.NEXT_PUBLIC_API_URL}/api/cms/campaign/check-slug`,
  COPY_TARGET: `${process.env.NEXT_PUBLIC_API_URL}/api/cms/resource/target/copy`,
  COPY_IMAGE: `${process.env.NEXT_PUBLIC_API_URL}/api/cms/resource/image/copy`,
  COPY_UI_LANG: `${process.env.NEXT_PUBLIC_API_URL}/api/cms/resource/web_translation/copy`,
} as const;
