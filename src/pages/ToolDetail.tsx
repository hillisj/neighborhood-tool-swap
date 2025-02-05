
import { useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { ArrowLeft } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { format } from "date-fns";

const ToolDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();

  const { data: tool, isLoading } = useQuery({
    queryKey: ['tool', id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('tools')
        .select(`
          *,
          profiles:owner_id (
            username,
            email
          )
        `)
        .eq('id', id)
        .maybeSingle();

      if (error) throw error;
      return data;
    },
  });

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 p-4">
        <div className="max-w-2xl mx-auto">
          <div className="animate-pulse">
            <div className="h-64 bg-gray-200 rounded-lg mb-4"></div>
            <div className="h-8 bg-gray-200 rounded w-3/4 mb-4"></div>
            <div className="h-4 bg-gray-200 rounded w-1/2"></div>
          </div>
        </div>
      </div>
    );
  }

  if (!tool) {
    return (
      <div className="min-h-screen bg-gray-50 p-4">
        <div className="max-w-2xl mx-auto text-center">
          <h1 className="text-2xl font-bold text-gray-900">Tool not found</h1>
          <Button onClick={() => navigate(-1)} className="mt-4">
            Go back
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-2xl mx-auto p-4">
        <Button
          variant="ghost"
          className="mb-4"
          onClick={() => navigate(-1)}
        >
          <ArrowLeft className="w-4 h-4 mr-2" />
          Back
        </Button>

        <div className="bg-white rounded-lg shadow-sm overflow-hidden">
          <img
            src={tool.image_url || "/placeholder.svg"}
            alt={tool.name}
            className="w-full h-64 object-cover"
          />
          
          <div className="p-6">
            <div className="flex items-center justify-between mb-4">
              <h1 className="text-2xl font-bold text-gray-900">{tool.name}</h1>
              <span className={`px-3 py-1 rounded-full text-sm ${
                tool.is_available 
                  ? "bg-green-100 text-green-800" 
                  : "bg-gray-100 text-gray-800"
              }`}>
                {tool.is_available ? "Available" : "Checked Out"}
              </span>
            </div>

            <p className="text-gray-600 mb-6">{tool.description}</p>

            <div className="space-y-4">
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
        </div>
      </div>
    </div>
  );
};

export default ToolDetail;
