import { QuickLead } from "./QuickLead";

/**
 * Тонкая обёртка над QuickLead для сохранения source="mobile_quick_lead"
 * и обратной совместимости с существующими использованиями на главной.
 */
export function MobileQuickLead() {
  return <QuickLead source="mobile_quick_lead" />;
}
