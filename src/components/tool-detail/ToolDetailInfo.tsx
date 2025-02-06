import { Tables } from "@/integrations/supabase/types";
import { format } from "date-fns";
import { EditToolDialog } from "./EditToolDialog";

interface ToolDetailInfoProps {
  tool: Tables<"items"> & {
    profiles: {
      username: string | null;
      email: string | null;
    } | null;
  };
  isOwner: boolean;
}

export const ToolDetailInfo = ({ tool, isOwner }: ToolDetailInfoProps) => {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">{tool.name}</h1>
        {isOwner && <EditToolDialog tool={tool} />}
      </div>

      <div className="grid gap-4">
        <div className="flex items-center justify-between">
          <span className="text-gray-500">Status</span>
          <span className="capitalize">{tool.status}</span>
        </div>

        <div className="flex items-center justify-between">
          <span className="text-gray-500">Description</span>
          <span>{tool.description || "N/A"}</span>
        </div>

        {tool.brand && (
          <div className="flex items-center justify-between">
            <span className="text-gray-500">Brand</span>
            <span>{tool.brand || "N/A"}</span>
          </div>
        )}

        {tool.model && (
          <div className="flex items-center justify-between">
            <span className="text-gray-500">Model</span>
            <span>{tool.model || "N/A"}</span>
          </div>
        )}

        {tool.condition && (
          <div className="flex items-center justify-between">
            <span className="text-gray-500">Condition</span>
            <span>{tool.condition || "N/A"}</span>
          </div>
        )}

        {tool.purchase_date && (
          <div className="flex items-center justify-between">
            <span className="text-gray-500">Purchase Date</span>
            <span>
              {format(new Date(tool.purchase_date), "MMMM d, yyyy")}
            </span>
          </div>
        )}

        {tool.maintenance_notes && (
          <div className="flex items-center justify-between">
            <span className="text-gray-500">Maintenance Notes</span>
            <span>{tool.maintenance_notes || "N/A"}</span>
          </div>
        )}

        <div className="flex items-center justify-between">
          <span className="text-gray-500">Owner</span>
          <span>
            {tool.profiles?.username ||
              tool.profiles?.email?.split("@")[0] ||
              "Anonymous"}
          </span>
        </div>
      </div>
    </div>
  );
};