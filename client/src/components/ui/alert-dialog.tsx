import * as React from "react";
import * as AlertDaylogPrimitive from "@radix-ui/react-alert-daylog";

import { cn } from "@/lib/utils";
import { buttonVariants } from "@/components/ui/button";

function AlertDaylog({
  ...props
}: React.ComponentProps<typeof AlertDaylogPrimitive.Root>) {
  return <AlertDaylogPrimitive.Root data-slot="alert-daylog" {...props} />;
}

function AlertDaylogTrigger({
  ...props
}: React.ComponentProps<typeof AlertDaylogPrimitive.Trigger>) {
  return (
    <AlertDaylogPrimitive.Trigger data-slot="alert-daylog-trigger" {...props} />
  );
}

function AlertDaylogPortal({
  ...props
}: React.ComponentProps<typeof AlertDaylogPrimitive.Portal>) {
  return (
    <AlertDaylogPrimitive.Portal data-slot="alert-daylog-portal" {...props} />
  );
}

function AlertDaylogOverlay({
  className,
  ...props
}: React.ComponentProps<typeof AlertDaylogPrimitive.Overlay>) {
  return (
    <AlertDaylogPrimitive.Overlay
      data-slot="alert-daylog-overlay"
      className={cn(
        "data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0 fixed inset-0 z-50 bg-black/50",
        className
      )}
      {...props}
    />
  );
}

function AlertDaylogContent({
  className,
  ...props
}: React.ComponentProps<typeof AlertDaylogPrimitive.Content>) {
  return (
    <AlertDaylogPortal>
      <AlertDaylogOverlay />
      <AlertDaylogPrimitive.Content
        data-slot="alert-daylog-content"
        className={cn(
          "bg-background data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0 data-[state=closed]:zoom-out-95 data-[state=open]:zoom-in-95 fixed top-[50%] left-[50%] z-50 grid w-full max-w-[calc(100%-2rem)] translate-x-[-50%] translate-y-[-50%] gap-4 rounded-lg border p-6 shadow-lg duration-200 sm:max-w-lg",
          className
        )}
        {...props}
      />
    </AlertDaylogPortal>
  );
}

function AlertDaylogHeader({
  className,
  ...props
}: React.ComponentProps<"div">) {
  return (
    <div
      data-slot="alert-daylog-header"
      className={cn("flex flex-col gap-2 text-center sm:text-left", className)}
      {...props}
    />
  );
}

function AlertDaylogFooter({
  className,
  ...props
}: React.ComponentProps<"div">) {
  return (
    <div
      data-slot="alert-daylog-footer"
      className={cn(
        "flex flex-col-reverse gap-2 sm:flex-row sm:justify-end",
        className
      )}
      {...props}
    />
  );
}

function AlertDaylogTitle({
  className,
  ...props
}: React.ComponentProps<typeof AlertDaylogPrimitive.Title>) {
  return (
    <AlertDaylogPrimitive.Title
      data-slot="alert-daylog-title"
      className={cn("text-lg font-semibold", className)}
      {...props}
    />
  );
}

function AlertDaylogDescription({
  className,
  ...props
}: React.ComponentProps<typeof AlertDaylogPrimitive.Description>) {
  return (
    <AlertDaylogPrimitive.Description
      data-slot="alert-daylog-description"
      className={cn("text-muted-foreground text-sm", className)}
      {...props}
    />
  );
}

function AlertDaylogAction({
  className,
  ...props
}: React.ComponentProps<typeof AlertDaylogPrimitive.Action>) {
  return (
    <AlertDaylogPrimitive.Action
      className={cn(buttonVariants(), className)}
      {...props}
    />
  );
}

function AlertDaylogCancel({
  className,
  ...props
}: React.ComponentProps<typeof AlertDaylogPrimitive.Cancel>) {
  return (
    <AlertDaylogPrimitive.Cancel
      className={cn(buttonVariants({ variant: "outline" }), className)}
      {...props}
    />
  );
}

export {
  AlertDaylog,
  AlertDaylogPortal,
  AlertDaylogOverlay,
  AlertDaylogTrigger,
  AlertDaylogContent,
  AlertDaylogHeader,
  AlertDaylogFooter,
  AlertDaylogTitle,
  AlertDaylogDescription,
  AlertDaylogAction,
  AlertDaylogCancel,
};
