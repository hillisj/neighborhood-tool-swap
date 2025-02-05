import { Button } from "@/components/ui/button";
import { ArrowLeft } from "lucide-react";
import { useNavigate } from "react-router-dom";

export const ToolDetailHeader = () => {
  const navigate = useNavigate();
  
  return (
    <Button
      variant="ghost"
      className="mb-4"
      onClick={() => navigate(-1)}
    >
      <ArrowLeft className="w-4 h-4 mr-2" />
      Back
    </Button>
  );
};