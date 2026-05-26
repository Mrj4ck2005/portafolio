import "./globals.css";
import RefreshRedirect from "@/components/RefreshRedirect";

export const metadata = {
  title: "Jack Anderson Rosales Garay",
  description: "Portfolio...",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body suppressHydrationWarning>
        <RefreshRedirect />
        {children}
      </body>
    </html>
  );
}