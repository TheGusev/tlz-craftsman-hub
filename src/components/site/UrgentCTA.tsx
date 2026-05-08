import { Phone, MessageCircle, Camera } from "lucide-react";

export function UrgentCTA() {
  return (
    <div className="fixed bottom-4 right-4 z-30 flex flex-col gap-2 md:bottom-6 md:right-6">
      <a
        href="https://wa.me/78005551234?text=Здравствуйте,%20отправляю%20фото%20объекта"
        target="_blank"
        rel="noopener noreferrer"
        aria-label="Отправить фото в WhatsApp"
        className="flex h-12 w-12 items-center justify-center rounded-full bg-secondary text-secondary-foreground shadow-lg transition hover:scale-105"
      >
        <Camera className="h-6 w-6" />
      </a>
      <a
        href="https://wa.me/78005551234"
        target="_blank"
        rel="noopener noreferrer"
        aria-label="WhatsApp"
        className="flex h-12 w-12 items-center justify-center rounded-full bg-[#25D366] text-white shadow-lg transition hover:scale-105"
      >
        <MessageCircle className="h-6 w-6" />
      </a>
      <a
        href="tel:+78005551234"
        aria-label="Срочный звонок"
        className="flex h-12 w-12 items-center justify-center rounded-full bg-urgent text-urgent-foreground shadow-lg transition hover:scale-105"
      >
        <Phone className="h-6 w-6" />
      </a>
    </div>
  );
}
