import type { ReactNode } from "react";

/**
 * Прямой ответ на запрос пользователя в первых 40-80 словах.
 * Рендерится как первый <p class="intro-answer"> внутри <article>.
 * Используется для AI-оптимизации (Perplexity, ChatGPT, Yandex GPT).
 */
export function IntroAnswer({ children }: { children: ReactNode }) {
  return (
    <p className="intro-answer rounded-2xl border border-accent/30 bg-accent/5 p-5 text-base leading-relaxed text-foreground md:text-lg">
      {children}
    </p>
  );
}
