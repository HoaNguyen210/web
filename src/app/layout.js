import "./globals.css";
import { ToastProvider } from "@/components/ui/toast";

export const metadata = {
  title: "E-commerce App",
  description: "Trang web kinh doanh trực tuyến",
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body>
        <ToastProvider>
          {children}
        </ToastProvider>
      </body>
    </html>
  );
}
