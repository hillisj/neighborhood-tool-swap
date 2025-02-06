import { format } from "date-fns";
import { Tables } from "@/integrations/supabase/types";
import { EditToolDialog } from "./EditToolDialog";

interface ToolDetailInfoProps {
  tool: Tables<"tools"> & {
    profiles: {
      username: string | null;
      email: string | null;
    } | null;
  };
  hasPendingRequests?: boolean;
  isOwner?: boolean;
}

export const ToolDetailInfo = ({ tool, isOwner }: ToolDetailInfoProps) => {
  return (
    <div className="p-6">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center space-x-4">
          <h1 className="text-2xl font-bold text-gray-900">{tool.name}</h1>
          {isOwner && <EditToolDialog tool={tool} />}
        </div>
      </div>

      <p className="text-gray-600 mb-6">{tool.description}</p>

      <div className="space-y-4">
        <div>
          <h3 className="text-sm font-medium text-gray-500">Category</h3>
          <p className="text-gray-900">{tool.category}</p>
        </div>

        {tool.brand && (
          <div>
            <h3 className="text-sm font-medium text-gray-500">Brand</h3>
            <p className="text-gray-900">{tool.brand}</p>
          </div>
        )}

        {tool.model && (
          <div>
            <h3 className="text-sm font-medium text-gray-500">Model</h3>
            <p className="text-gray-900">{tool.model}</p>
          </div>
        )}

        {tool.condition && (
          <div>
            <h3 className="text-sm font-medium text-gray-500">Condition</h3>
            <p className="text-gray-900">{tool.condition}</p>
          </div>
        )}

        {tool.purchase_date && (
          <div>
            <h3 className="text-sm font-medium text-gray-500">Purchase Date</h3>
            <p className="text-gray-900">
              {format(new Date(tool.purchase_date), 'PPP')}
            </p>
          </div>
        )}

        {tool.maintenance_notes && (
          <div>
            <h3 className="text-sm font-medium text-gray-500">Maintenance Notes</h3>
            <p className="text-gray-900 whitespace-pre-line">{tool.maintenance_notes}</p>
          </div>
        )}

        <div>
          <h3 className="text-sm font-medium text-gray-500">Owner</h3>
          <p className="text-gray-900">
            {tool.profiles?.username || tool.profiles?.email?.split('@')[0] || 'Anonymous'}
          </p>
        </div>
      </div>
    </div>
  );
};