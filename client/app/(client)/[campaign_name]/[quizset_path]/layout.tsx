import AuthProvider from "@/providers/authProvider";
import { NextIntlClientProvider } from "next-intl";

export default async function SumtotalUserLayout({
  children,
  params: { quizset_path },
}: {
  children: React.ReactNode;
  params: { quizset_path: string };
}) {
  // const { validatedPath, isValid, wasCorrected } =
  //   await validateAndCorrectQuizSetPath(quizset_path, defaultLanguageCode);

  // if (!isValid) {
  //   console.error("Path validation failed.");
  //   redirect("/error");
  // } else if (wasCorrected) {
  //   console.log(`Path was corrected to: ${validatedPath}`);
  //   redirect(`/${campaign_name}/${validatedPath}`);
  // } else {
  //   console.log("Path is valid.");
  // }

  console.log("SumtotalUserLayout quizset_path", quizset_path);
  const timeZone = "Seoul/Asia";
  const locale = quizset_path.split("_").at(-1);

  const messages = await fetch(
    `${process.env.NEXT_PUBLIC_ASSETS_DOMAIN}/certification/s25/messages/${locale}.json`
  )
    .then((res) => res.json())
    .catch((error) =>
      console.error("SumtotalUserLayout get message error", error)
    );

  return (
    <div>
      <NextIntlClientProvider
        timeZone={timeZone}
        messages={messages}
        locale={locale}
      >
        <AuthProvider>{children}</AuthProvider>
      </NextIntlClientProvider>
    </div>
  );
}
