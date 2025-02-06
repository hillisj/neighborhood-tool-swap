import { Tables } from "@/integrations/supabase/types";
import { ToolImage } from "./ToolImage";
import { ToolDetailInfo } from "./ToolDetailInfo";

interface ToolHeaderProps {
  tool: Tables<"tools"> & {
    profiles: {
      username: string | null;
      email: string | null;
    } | null;
  };
  hasPendingRequests: boolean;
  isOwner: boolean;
}

export const ToolHeader = ({ tool, hasPendingRequests, isOwner }: ToolHeaderProps) => {
  return (
    <>
      <ToolImage 
        imageUrl={tool.image_url} 
        name={tool.name} 
        status={tool.status}
        hasPendingRequests={hasPendingRequests}
      />
      
      <ToolDetailInfo 
        tool={tool} 
        hasPendingRequests={hasPendingRequests}
        isOwner={isOwner}
      />
    </>
  );
};