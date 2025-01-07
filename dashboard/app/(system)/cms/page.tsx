import { redirect } from "next/navigation";

export default function ContentManagementSystem() {
  redirect("/cms/questions/question-bank");
  return null;
}
