import AuthProvider from "@/providers/authProvider";

export default async function ClientLayout({ children, params }: { children: React.ReactNode; params: any }) {
  console.info("Render ClientLayout");
  return (
    <div className="min-w-[280px] max-w-[412px] w-full min-h-svh border-x-4 border-slate-900">
      <AuthProvider>{children}</AuthProvider>
    </div>
  );
}
