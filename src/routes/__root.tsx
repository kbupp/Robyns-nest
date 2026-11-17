import { createRootRoute, HeadContent, Outlet, Scripts } from "@tanstack/react-router";
import { AuthProvider } from "@/lib/auth/provider";
import { PreviewHostBridge } from "@/components/preview-host-bridge";
import { SiteFooter } from "@/components/site-footer";
import { SiteHeader } from "@/components/site-header";
import appCss from "../styles.css?url";

export const Route = createRootRoute({
  head: () => ({
    meta: [
      { charSet: "utf-8" },
      { name: "viewport", content: "width=device-width, initial-scale=1" },
      { title: "Robyn’s Nest · Corolla vacation home" },
      { name: "description", content: "Book Robyn’s Nest, a 5-bedroom Outer Banks home at 1045 Corolla Drive. Private pool, hot tub, and a short walk to the beach." },
      { name: "theme-color", content: "#163038" },
    ],
    links: [
      { rel: "icon", type: "image/svg+xml", href: "/favicon.svg" },
      { rel: "stylesheet", href: appCss },
      { rel: "preconnect", href: "https://fonts.googleapis.com" },
      { rel: "preconnect", href: "https://fonts.gstatic.com", crossOrigin: "anonymous" },
      {
        rel: "stylesheet",
        href: "https://fonts.googleapis.com/css2?family=Fraunces:opsz,wght@9..144,500;9..144,620&family=Outfit:wght@400;500;600&display=swap",
      },
      { rel: "manifest", href: "/__grok/manifest.webmanifest" },
      { rel: "apple-touch-icon", href: "/__grok/icon-180.png" },
    ],
  }),
  component: () => (
    <html lang="en" className="bg-sand font-sans text-ink antialiased" suppressHydrationWarning>
      <head>
        <HeadContent />
      </head>
      <body className="overflow-x-hidden bg-sand text-ink">
        <PreviewHostBridge />
        <AuthProvider>
          <div className="flex min-h-screen flex-col">
            <SiteHeader />
            <div className="flex-1">
              <Outlet />
            </div>
            <SiteFooter />
          </div>
        </AuthProvider>
        <Scripts />
      </body>
    </html>
  ),
});
