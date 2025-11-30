import "~/styles/globals.css";
import {
  ClerkProvider,
  SignUpButton,
  SignedIn,
  SignedOut,
  UserButton,
} from '@clerk/nextjs'
import { type Metadata } from "next";
import { Geist } from "next/font/google";
import { QueryClientProvider } from "~/components/providers";

export const metadata: Metadata = {
  title: "PulseRoute",
  description: "The route to faster emergency response.",
  icons: [{ rel: "icon", url: "/favicon.png" }],
};

const geist = Geist({
  subsets: ["latin"],
  variable: "--font-geist-sans",
});

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <ClerkProvider>
      <html lang="en" className={`${geist.variable}`}>
        <body>
          <QueryClientProvider>
            <header className="flex justify-end items-center p-4 gap-4 h-16">
              <SignedOut>
                <SignUpButton>
                  <button className="bg-[#7e7c89] text-white rounded-full font-medium text-sm sm:text-base h-10 sm:h-12 px-4 sm:px-5 cursor-pointer">
                    Sign Up
                  </button>
                </SignUpButton>
              </SignedOut>
              <SignedIn>
                <UserButton />
              </SignedIn>
            </header>
            {children}
          </QueryClientProvider>

        </body>
      </html>
    </ClerkProvider>
  );
}
