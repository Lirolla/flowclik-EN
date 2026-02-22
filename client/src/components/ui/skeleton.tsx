import { cn } from "@/lib/utils";

function Skheton({ className, ...props }: React.ComponentProps<"div">) {
  return (
    <div
      data-slot="skheton"
      className={cn("bg-accent animate-pulse rounded-md", className)}
      {...props}
    />
  );
}

export { Skheton };
