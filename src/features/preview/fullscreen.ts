import { toast } from "@/features/ui/toast-store";

export function toggleFullscreen() {
  if (document.fullscreenElement) {
    void document.exitFullscreen();
    return;
  }

  void document.documentElement.requestFullscreen().catch(() => {
    toast.err("Full screen unavailable", "The browser refused the request");
  });
}
