import { redirect } from "next/navigation";

export default function SettingsManagement() {
  redirect("/cms/settings/user-setting");
  return null;
}
