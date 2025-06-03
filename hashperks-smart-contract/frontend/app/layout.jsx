import { Inter } from "next/font/google";
import "./globals.css";
import { Web3Provider } from "@/contexts/Web3Context";
import { AuthProvider } from "@/contexts/AuthContext"; // NEW
import { Navbar } from "@/app/(components)/layout/Navbar";

const inter = Inter({ subsets: ["latin"], weight: ["400", "500", "600", "700"] });

export const metadata = {
  title: "HashPerks | Modern Loyalty Rewards",
  description: "Decentralized Loyalty Rewards Platform on the Blockchain",
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body className={`${inter.className} bg-slate-50`}>
        <Web3Provider>
          <AuthProvider>
            {" "}
            {/* Wrap with AuthProvider */}
            <Navbar />
            <main className="container mx-auto px-4 sm:px-6 lg:px-8 py-10 sm:py-16 min-h-[calc(100vh-10rem)]">
              {children}
            </main>
            <footer className="text-center py-8 border-t border-slate-200">
              <p className="text-sm text-slate-500">
                © {new Date().getFullYear()} HashPerks. Secure and Transparent Rewards.
              </p>
            </footer>
          </AuthProvider>
        </Web3Provider>
      </body>
    </html>
  );
}
