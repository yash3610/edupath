import { Toaster as Sonner } from "sonner";
const Toaster = ({ ...props }) => {
  return (
    <Sonner
      className="toaster group"
      closeButton
      duration={3500}
      gap={10}
      toastOptions={{
        classNames: {
          toast:
            "group toast group-[.toaster]:rounded-2xl group-[.toaster]:border group-[.toaster]:bg-background group-[.toaster]:px-4 group-[.toaster]:py-3 group-[.toaster]:text-foreground group-[.toaster]:border-border group-[.toaster]:shadow-xl",
          title: "group-[.toast]:text-sm group-[.toast]:font-semibold",
          description: "group-[.toast]:text-xs group-[.toast]:font-medium group-[.toast]:text-muted-foreground",
          actionButton: "group-[.toast]:rounded-lg group-[.toast]:bg-primary group-[.toast]:px-3 group-[.toast]:py-1.5 group-[.toast]:text-primary-foreground",
          cancelButton: "group-[.toast]:rounded-lg group-[.toast]:bg-muted group-[.toast]:px-3 group-[.toast]:py-1.5 group-[.toast]:text-muted-foreground",
        },
      }}
      {...props}
    />
  );
};
export { Toaster };
