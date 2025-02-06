import { Badge } from "@/components/ui/badge";
import { Tables } from "@/integrations/supabase/types";

interface ToolImageProps {
  imageUrl: string | null;
  name: string;
  status: Tables<"tools">["status"];
  hasPendingRequests?: boolean;
}

export const ToolImage = ({ imageUrl, name, status, hasPendingRequests }: ToolImageProps) => {
  const getStatusBadge = (status: Tables<"tools">["status"], hasPending: boolean) => {
    // Override status to 'requested' if there are pending requests
    const displayStatus = hasPending ? 'requested' : status;
    
    const styles = {
      available: "bg-green-100 text-green-800",
      requested: "bg-yellow-100 text-yellow-800",
      checked_out: "bg-gray-100 text-gray-800"
    };
    
    const labels = {
      available: "Available",
      requested: "Requested",
      checked_out: "Checked Out"
    };

    return (
      <Badge className={styles[displayStatus]}>
        {labels[displayStatus]}
      </Badge>
    );
  };

  return (
    <div className="relative">
      <img
        src={imageUrl || "/placeholder.svg"}
        alt={name}
        className="w-full h-64 object-cover"
      />
      <div className="absolute top-2 right-2">
        {getStatusBadge(status, hasPendingRequests || false)}
      </div>
    </div>
  );
};