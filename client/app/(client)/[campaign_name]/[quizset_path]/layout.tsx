import { QuizSetPageBaseProps } from "@/types/pages/types";
import { extractCodesFromPath } from "@/utils/pathUtils";
import { redirect } from "next/navigation";

type SumtotalUserLayoutProps = {
  children: React.ReactNode;
} & QuizSetPageBaseProps;

export default async function SumtotalUserLayout({ children, params: { campaign_name, quizset_path } }: SumtotalUserLayoutProps) {
  const codes = extractCodesFromPath(quizset_path);
  if (codes == null) {
    console.error("Invalid quizset path", campaign_name, quizset_path);
    redirect(`/${campaign_name}/not-ready`);
  }

  return <div>{children}</div>;
}
