import { redirect } from "next/navigation";

export default function QuestionManagement() {
  redirect("/cms/questions/question-bank");
  return null;
}
