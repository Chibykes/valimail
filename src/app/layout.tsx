import { ClerkProvider } from "@clerk/nextjs";
import { shadcn } from "@clerk/ui/themes";
import type { Metadata } from "next";
import { Bricolage_Grotesque, Geist, Geist_Mono } from "next/font/google";
import { AppProviders } from "@/components/providers/app-providers";
import { Brand } from "@/constants/brand";
import { AppRoutes, AuthRedirects } from "@/constants/routes";
import "./globals.css";

const display = Bricolage_Grotesque({
  variable: "--font-bricolage",
  subsets: ["latin"],
});

const sans = Geist({
  variable: "--font-geist",
  subsets: ["latin"],
});

const mono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: `${Brand.NAME} — ${Brand.TAGLINE}`,
  description: Brand.DESCRIPTION,
  other: {
    cryptomus: "e13b7243",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`${display.variable} ${sans.variable} ${mono.variable}`}
    >
      <body className="font-sans antialiased">
        <ClerkProvider
          appearance={{
            theme: shadcn,
            variables: { colorPrimary: "oklch(0.51 0.22 264)" },
          }}
          signInUrl={AppRoutes.SIGN_IN}
          signUpUrl={AppRoutes.SIGN_UP}
          signInFallbackRedirectUrl={AuthRedirects.AFTER_SIGN_IN}
          signUpFallbackRedirectUrl={AuthRedirects.AFTER_SIGN_UP}
          afterSignOutUrl={AuthRedirects.AFTER_SIGN_OUT}
        >
          <AppProviders>{children}</AppProviders>
        </ClerkProvider>
      </body>
    </html>
  );
}
