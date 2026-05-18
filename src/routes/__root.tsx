import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import {
  Outlet,
  Link,
  createRootRouteWithContext,
  useRouter,
  HeadContent,
} from "@tanstack/react-router";

import { Header } from "@/components/site/Header";
import { Footer } from "@/components/site/Footer";
import { UrgentCTA } from "@/components/site/UrgentCTA";
import { Toaster } from "@/components/ui/sonner";
import {
  buildGraphHead,
  buildOrganizationSchema,
  buildWebSiteSchema,
} from "@/lib/jsonld";
import { useAnalytics } from "@/hooks/useAnalytics";

const YM_ID = Number(import.meta.env.VITE_YANDEX_METRIKA_ID ?? 0) || 0;
const YANDEX_VERIFICATION = String(import.meta.env.VITE_YANDEX_VERIFICATION ?? "");
const GOOGLE_VERIFICATION = String(import.meta.env.VITE_GOOGLE_VERIFICATION ?? "");

const metrikaSnippet = YM_ID
  ? `(function(m,e,t,r,i,k,a){m[i]=m[i]||function(){(m[i].a=m[i].a||[]).push(arguments)};
m[i].l=1*new Date();for(var j=0;j<document.scripts.length;j++){if(document.scripts[j].src===r){return;}}
k=e.createElement(t),a=e.getElementsByTagName(t)[0],k.async=1,k.src=r,a.parentNode.insertBefore(k,a)})
(window,document,"script","https://mc.yandex.ru/metrika/tag.js","ym");
ym(${YM_ID},"init",{clickmap:true,trackLinks:true,accurateTrackBounce:true,webvisor:true,trackHash:true,ecommerce:"dataLayer"});`
  : "";

function NotFoundComponent() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-background px-4">
      <div className="max-w-md text-center">
        <h1 className="text-7xl font-bold text-primary">404</h1>
        <h2 className="mt-4 text-xl font-semibold text-foreground">Страница не найдена</h2>
        <p className="mt-2 text-sm text-muted-foreground">
          Возможно, ссылка устарела или страница была перемещена.
        </p>
        <div className="mt-6">
          <Link
            to="/"
            className="inline-flex items-center justify-center rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground transition-colors hover:bg-primary/90"
          >
            На главную
          </Link>
        </div>
      </div>
    </div>
  );
}

function ErrorComponent({ error, reset }: { error: Error; reset: () => void }) {
  console.error(error);
  const router = useRouter();

  return (
    <div className="flex min-h-screen items-center justify-center bg-background px-4">
      <div className="max-w-md text-center">
        <h1 className="text-xl font-semibold tracking-tight text-foreground">
          Страница не загрузилась
        </h1>
        <p className="mt-2 text-sm text-muted-foreground">
          Что-то пошло не так. Попробуйте обновить страницу или вернуться на главную.
        </p>
        <div className="mt-6 flex flex-wrap justify-center gap-2">
          <button
            onClick={() => {
              router.invalidate();
              reset();
            }}
            className="inline-flex items-center justify-center rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground transition-colors hover:bg-primary/90"
          >
            Попробовать снова
          </button>
          <a
            href="/"
            className="inline-flex items-center justify-center rounded-md border border-input bg-background px-4 py-2 text-sm font-medium text-foreground transition-colors hover:bg-accent hover:text-accent-foreground"
          >
            На главную
          </a>
        </div>
      </div>
    </div>
  );
}

export const Route = createRootRouteWithContext<{ queryClient: QueryClient }>()({
  head: () => ({
    meta: [
      { title: "Санитарные Решения РФ — аварийная санитарная служба 24/7" },
      {
        name: "description",
        content:
          "Профессиональная санитарная обработка. Ликвидация последствий пожаров и затоплений, удаление запахов, дезинфекция после смерти, вывоз мусора. Выезд 24/7",
      },
      { name: "author", content: "Санитарные Решения РФ" },
      { name: "robots", content: "index,follow,max-image-preview:large,max-snippet:-1" },
      { name: "ai-content-declaration", content: "allow_with_attribution" },
      ...(YANDEX_VERIFICATION
        ? [{ name: "yandex-verification", content: YANDEX_VERIFICATION }]
        : []),
      ...(GOOGLE_VERIFICATION
        ? [{ name: "google-site-verification", content: GOOGLE_VERIFICATION }]
        : []),
      { property: "og:site_name", content: "Санитарные Решения РФ" },
      { property: "og:type", content: "website" },
      { property: "og:locale", content: "ru_RU" },
      { name: "twitter:card", content: "summary_large_image" },
      { property: "og:title", content: "Санитарные Решения РФ — аварийная санитарная служба 24/7" },
      { name: "twitter:title", content: "Санитарные Решения РФ — аварийная санитарная служба 24/7" },
      {
        property: "og:description",
        content:
          "Профессиональная санитарная обработка. Ликвидация последствий пожаров и затоплений, удаление запахов, дезинфекция после смерти, вывоз мусора. Выезд 24/7",
      },
      {
        name: "twitter:description",
        content:
          "Профессиональная санитарная обработка. Ликвидация последствий пожаров и затоплений, удаление запахов, дезинфекция после смерти, вывоз мусора. Выезд 24/7",
      },
      {
        property: "og:image",
        content:
          "https://storage.googleapis.com/gpt-engineer-file-uploads/attachments/og-images/e13e54c1-0dc1-4ab4-a66c-89bf0ef108da",
      },
      {
        name: "twitter:image",
        content:
          "https://storage.googleapis.com/gpt-engineer-file-uploads/attachments/og-images/e13e54c1-0dc1-4ab4-a66c-89bf0ef108da",
      },
    ],
    scripts: [
      {
        type: "application/ld+json",
        children: buildGraphHead([buildOrganizationSchema(), buildWebSiteSchema()]),
      },
      ...(metrikaSnippet ? [{ children: metrikaSnippet }] : []),
    ],
  }),
  component: RootComponent,
  notFoundComponent: NotFoundComponent,
  errorComponent: ErrorComponent,
});

function RootComponent() {
  const { queryClient } = Route.useRouteContext();
  useAnalytics();

  return (
    <QueryClientProvider client={queryClient}>
      <HeadContent />
      <a
        href="#main"
        className="sr-only focus:not-sr-only focus:fixed focus:left-2 focus:top-2 focus:z-50 focus:rounded focus:bg-primary focus:px-3 focus:py-2 focus:text-primary-foreground"
      >
        Перейти к содержимому
      </a>
      <div className="flex min-h-screen flex-col bg-background">
        <Header />
        <main id="main" className="flex-1">
          <Outlet />
        </main>
        <Footer />
        <UrgentCTA />
        <Toaster />
      </div>
      {YM_ID ? (
        <noscript>
          <div>
            <img
              src={`https://mc.yandex.ru/watch/${YM_ID}`}
              style={{ position: "absolute", left: "-9999px" }}
              alt=""
            />
          </div>
        </noscript>
      ) : null}
    </QueryClientProvider>
  );
}
