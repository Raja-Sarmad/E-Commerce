import { toast as sonnerToast, type ExternalToast } from "sonner";

type ToastType = "success" | "error" | "info" | "warning";

function render(
  type: ToastType,
  title: string,
  message?: string,
  options?: ExternalToast
) {
  const payload = message ? (
    <div className="flex flex-col gap-0.5">
      <span className="font-semibold">{title}</span>
      <span className="text-sm opacity-80">{message}</span>
    </div>
  ) : (
    title
  );

  switch (type) {
    case "success":
      sonnerToast.success(payload, options);
      break;
    case "error":
      sonnerToast.error(payload, options);
      break;
    case "warning":
      sonnerToast.warning(payload, options);
      break;
    default:
      sonnerToast.info(payload, options);
  }
}

export const toast = {
  success: (title: string, message?: string, options?: ExternalToast) =>
    render("success", title, message, options),
  error: (title: string, message?: string, options?: ExternalToast) =>
    render("error", title, message, options),
  info: (title: string, message?: string, options?: ExternalToast) =>
    render("info", title, message, options),
  warning: (title: string, message?: string, options?: ExternalToast) =>
    render("warning", title, message, options),
};
