
import { ToolCard } from "@/components/ToolCard";
import { BottomNav } from "@/components/BottomNav";
import { supabase } from "@/integrations/supabase/client";
import { useQuery } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";
import { useNavigate } from "react-router-dom";

const fetchTools = async () => {
  const { data, error } = await supabase
    .from('tools')
    .select(`
      *,
      profiles:owner_id (
        username,
        email
      )
    `)
    .order('created_at', { ascending: false });

  if (error) throw error;
  return data;
};

const Index = () => {
  const navigate = useNavigate();
  const { data: tools, isLoading } = useQuery({
    queryKey: ['tools'],
    queryFn: fetchTools,
  });

  return (
    <div className="min-h-screen bg-gray-50 pb-20">
      <header className="bg-white shadow-sm py-4 px-4 sticky top-0 z-10">
        <div className="flex items-center justify-between max-w-md mx-auto">
          <h1 className="text-xl font-semibold">Tool Library</h1>
          <Button
            onClick={() => navigate('/add')}
            size="sm"
            className="bg-accent hover:bg-accent/90"
          >
            <Plus className="w-4 h-4 mr-1" />
            Add Tool
          </Button>
        </div>
      </header>

      <main className="container max-w-md mx-auto px-4 py-6">
        {isLoading ? (
          <div className="text-center text-gray-500">Loading tools...</div>
        ) : (
          <div className="grid gap-6">
            {tools?.map((tool) => (
              <ToolCard
                key={tool.id}
                id={tool.id}
                name={tool.name}
                description={tool.description}
                imageUrl={tool.image_url || "/placeholder.svg"}
                owner={tool.profiles?.username || tool.profiles?.email?.split('@')[0] || 'Anonymous'}
                isAvailable={tool.is_available}
              />
            ))}
            {tools?.length === 0 && (
              <div className="text-center text-gray-500">
                No tools available. Be the first to add one!
              </div>
            )}
          </div>
        )}
      </main>
      <BottomNav />
    </div>
  );
};

export default Index;
