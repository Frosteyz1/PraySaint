import { Geist } from "next/font/google";
import "./globals.css";
import Nav from "@/components/Nav";
import BackgroundAnimation from "@/components/BackgroundAnimation";

const geistSans = Geist({ variable: "--font-geist-sans", subsets: ["latin"] });

export const metadata = {
  title: "PraySaint – Grow Closer to God",
  description: "A Catholic devotional companion for saint intercession, the Rosary, and faith sharing.",
};

export default function RootLayout({ children }) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        {/* Playfair Display for elegant serif typography */}
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link
          href="https://fonts.googleapis.com/css2?family=Playfair+Display:ital,wght@0,400;0,600;0,700;1,400;1,600&display=swap"
          rel="stylesheet"
        />
        {/* Prevent flash of wrong theme */}
        <script
          dangerouslySetInnerHTML={{
            __html: `(function(){try{var t=localStorage.getItem('pf-theme');if(t==='dark'||(t!=='light'&&window.matchMedia('(prefers-color-scheme:dark)').matches)){document.documentElement.classList.add('dark');}}catch(e){}})();`,
          }}
        />
      </head>
      <body className={`${geistSans.variable} antialiased min-h-screen flex flex-col`}
        style={{ background: "var(--bg-page)", color: "var(--fg-primary)", position: "relative" }}>
        <BackgroundAnimation />
        <Nav />
        <main className="flex-1" style={{ position: "relative", zIndex: 1 }}>{children}</main>
        <footer className="relative overflow-hidden"
          style={{ background: "linear-gradient(to top, #040a1a, #080e26)", borderTop: "1px solid rgba(212,160,23,0.15)" }}>
          <div className="max-w-4xl mx-auto px-6 py-10 text-center">
            <div className="font-display text-gold-400 text-xl mb-3 tracking-wide">✝ PraySaint</div>
            <p className="prayer-text text-sm mb-3" style={{ color: "rgba(240,232,213,0.7)", maxWidth: "32rem", margin: "0 auto 0.75rem" }}>
              Not official Church teaching. Content is for personal devotion only — consult a priest or deacon for formal spiritual guidance.
            </p>
            <p className="text-xs" style={{ color: "rgba(120,140,180,0.6)" }}>
              Catholic books on{" "}
              <a href="#" className="underline hover:text-gold-400 transition-colors">Amazon</a>
              {" "}· © {new Date().getFullYear()} PraySaint
            </p>
          </div>
        </footer>
      </body>
    </html>
  );
}
