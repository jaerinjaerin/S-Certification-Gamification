import AuthProvider from "@/providers/authProvider";

export default async function ClientLayout({
  children,
  params,
}: {
  children: React.ReactNode;
  params: any;
}) {
  console.info("Render ClientLayout");
  return (
    <div>
      <AuthProvider>{children}</AuthProvider>
    </div>
  );
}
