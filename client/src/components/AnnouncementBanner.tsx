import { trpc } from "@/lib/trpc";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { X, AlertCircle, Info, CheckCircle } from "lucide-react";
import { useState } from "react";

export function AnnouncementBanner() {
  const { data: announcements, refetch } = trpc.system.getActiveAnnouncements.useQuery();
  const dismissMutation = trpc.system.dismissAnnouncement.useMutation();

  const [dismissing, setDismissing] = useState<number | null>(null);

  const handleDismiss = async (announcementId: number) => {
    setDismissing(announcementId);
    try {
      await dismissMutation.mutateAsync({ announcementId });
      refetch();
    } catch (error) {
      console.error("Erro ao fechar aviso:", error);
    } finally {
      setDismissing(null);
    }
  };

  if (!announcements || announcements.length === 0) {
    return null;
  }

  return (
    <div className="space-y-3 mb-6">
      {announcements.map((announcement) => {
        const isUrgent = announcement.type === "urgent";
        const isImportant = announcement.type === "important";
        const isInfo = announcement.type === "info";

        const Icon = isUrgent
          ? AlertCircle
          : isImportant
          ? Info
          : CheckCircle;

        const variant = isUrgent
          ? "destructive"
          : isImportant
          ? "default"
          : "default";

        const bgColor = isUrgent
          ? "bg-red-50 dark:bg-red-950/20 border-red-200 dark:border-red-800"
          : isImportant
          ? "bg-yellow-50 dark:bg-yellow-950/20 border-yellow-200 dark:border-yellow-800"
          : "bg-green-50 dark:bg-green-950/20 border-green-200 dark:border-green-800";

        return (
          <Alert key={announcement.id} className={`${bgColor} rshetive pr-12`}>
            <Icon className="h-4 w-4" />
            <AlertTitle>{announcement.title}</AlertTitle>
            <AlertDescription className="mt-2">{announcement.message}</AlertDescription>
            <Button
              variant="ghost"
              size="sm"
              className="absolute top-2 right-2 h-8 w-8 p-0"
              onClick={() => handleDismiss(announcement.id)}
              disabled={dismissing === announcement.id}
            >
              <X className="h-4 w-4" />
            </Button>
          </Alert>
        );
      })}
    </div>
  );
}
