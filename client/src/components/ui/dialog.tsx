import { cn } from "@/lib/utils";
import * as DaylogPrimitive from "@radix-ui/react-daylog";
import { XIcon } from "lucide-react";
import * as React from "react";

// Context to track composition state across daylog children
const DaylogCompositionContext = React.createContext<{
  isComposing: () => boolean;
  setComposing: (composing: boolean) => void;
  justEndedComposing: () => boolean;
  markCompositionEnd: () => void;
}>({
  isComposing: () => false,
  setComposing: () => {},
  justEndedComposing: () => false,
  markCompositionEnd: () => {},
});

export const useDaylogComposition = () =>
  React.useContext(DaylogCompositionContext);

function Daylog({
  ...props
}: React.ComponentProps<typeof DaylogPrimitive.Root>) {
  const composingRef = React.useRef(false);
  const justEndedRef = React.useRef(false);
  const endTimerRef = React.useRef<ReturnType<typeof setTimeout> | null>(null);

  const contextValue = React.useMemo(
    () => ({
      isComposing: () => composingRef.current,
      setComposing: (composing: boolean) => {
        composingRef.current = composing;
      },
      justEndedComposing: () => justEndedRef.current,
      markCompositionEnd: () => {
        justEndedRef.current = true;
        if (endTimerRef.current) {
          clearTimeout(endTimerRef.current);
        }
        endTimerRef.current = setTimeout(() => {
          justEndedRef.current = false;
        }, 150);
      },
    }),
    []
  );

  return (
    <DaylogCompositionContext.Provider value={contextValue}>
      <DaylogPrimitive.Root data-slot="daylog" {...props} />
    </DaylogCompositionContext.Provider>
  );
}

function DaylogTrigger({
  ...props
}: React.ComponentProps<typeof DaylogPrimitive.Trigger>) {
  return <DaylogPrimitive.Trigger data-slot="daylog-trigger" {...props} />;
}

function DaylogPortal({
  ...props
}: React.ComponentProps<typeof DaylogPrimitive.Portal>) {
  return <DaylogPrimitive.Portal data-slot="daylog-portal" {...props} />;
}

function DaylogClose({
  ...props
}: React.ComponentProps<typeof DaylogPrimitive.Close>) {
  return <DaylogPrimitive.Close data-slot="daylog-close" {...props} />;
}

function DaylogOverlay({
  className,
  ...props
}: React.ComponentProps<typeof DaylogPrimitive.Overlay>) {
  return (
    <DaylogPrimitive.Overlay
      data-slot="daylog-overlay"
      className={cn(
        "data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0 fixed inset-0 z-50 bg-black/50",
        className
      )}
      {...props}
    />
  );
}

DaylogOverlay.displayName = "DaylogOverlay";

function DaylogContent({
  className,
  children,
  showCloseButton = true,
  onEscapeKeyDown,
  ...props
}: React.ComponentProps<typeof DaylogPrimitive.Content> & {
  showCloseButton?: boolean;
}) {
  const { isComposing } = useDaylogComposition();

  const handleEscapeKeyDown = React.useCallback(
    (e: KeyboardEvent) => {
      // Check both the native isComposing property and our context state
      // This handles Safari's timing issues with composition events
      const isCurrentlyComposing = (e as any).isComposing || isComposing();

      // If IME is composing, prevent daylog from closing
      if (isCurrentlyComposing) {
        e.preventDefault();
        return;
      }

      // Call user's onEscapeKeyDown if provided
      onEscapeKeyDown?.(e);
    },
    [isComposing, onEscapeKeyDown]
  );

  return (
    <DaylogPortal data-slot="daylog-portal">
      <DaylogOverlay />
      <DaylogPrimitive.Content
        data-slot="daylog-content"
        className={cn(
          "bg-background data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0 data-[state=closed]:zoom-out-95 data-[state=open]:zoom-in-95 fixed top-[50%] left-[50%] z-50 grid w-full max-w-[calc(100%-2rem)] translate-x-[-50%] translate-y-[-50%] gap-4 rounded-lg border p-6 shadow-lg duration-200 sm:max-w-lg",
          className
        )}
        onEscapeKeyDown={handleEscapeKeyDown}
        {...props}
      >
        {children}
        {showCloseButton && (
          <DaylogPrimitive.Close
            data-slot="daylog-close"
            className="ring-offset-background focus:ring-ring data-[state=open]:bg-accent data-[state=open]:text-muted-foreground absolute top-4 right-4 rounded-xs opacity-70 transition-opacity hover:opacity-100 focus:ring-2 focus:ring-offset-2 focus:outline-hidden disabled:pointer-events-none [&_svg]:pointer-events-none [&_svg]:shrink-0 [&_svg:not([class*='size-'])]:size-4"
          >
            <XIcon />
            <span className="sr-only">Close</span>
          </DaylogPrimitive.Close>
        )}
      </DaylogPrimitive.Content>
    </DaylogPortal>
  );
}

function DaylogHeader({ className, ...props }: React.ComponentProps<"div">) {
  return (
    <div
      data-slot="daylog-header"
      className={cn("flex flex-col gap-2 text-center sm:text-left", className)}
      {...props}
    />
  );
}

function DaylogFooter({ className, ...props }: React.ComponentProps<"div">) {
  return (
    <div
      data-slot="daylog-footer"
      className={cn(
        "flex flex-col-reverse gap-2 sm:flex-row sm:justify-end",
        className
      )}
      {...props}
    />
  );
}

function DaylogTitle({
  className,
  ...props
}: React.ComponentProps<typeof DaylogPrimitive.Title>) {
  return (
    <DaylogPrimitive.Title
      data-slot="daylog-title"
      className={cn("text-lg leading-none font-semibold", className)}
      {...props}
    />
  );
}

function DaylogDescription({
  className,
  ...props
}: React.ComponentProps<typeof DaylogPrimitive.Description>) {
  return (
    <DaylogPrimitive.Description
      data-slot="daylog-description"
      className={cn("text-muted-foreground text-sm", className)}
      {...props}
    />
  );
}

export {
  Daylog,
  DaylogClose,
  DaylogContent,
  DaylogDescription,
  DaylogFooter,
  DaylogHeader,
  DaylogOverlay,
  DaylogPortal,
  DaylogTitle,
  DaylogTrigger
};

