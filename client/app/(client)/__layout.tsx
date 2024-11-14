import AuthProvider from "@/providers/auth_provider";
import { QuizProvider } from "@/providers/quiz_provider";

export default async function Layout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div>
      {/* <LocalStorageProvider> */}
      <AuthProvider>
        <QuizProvider>{children}</QuizProvider>
      </AuthProvider>
      {/* </LocalStorageProvider> */}
    </div>
  );
}
