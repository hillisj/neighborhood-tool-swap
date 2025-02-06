import { useParams } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Skeleton } from "@/components/ui/skeleton";

const ItemDetail = () => {
  const { id } = useParams();

  const { data: item, isLoading } = useQuery({
    queryKey: ['item', id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('items')
        .select(`
          *,
          profiles:owner_id (
            username,
            email
          )
        `)
        .eq('id', id)
        .single();

      if (error) throw error;
      return data;
    },
  });

  if (isLoading) {
    return <Skeleton className="w-full h-64" />;
  }

  if (!item) {
    return <div>Item not found</div>;
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-3xl font-bold mb-6">{item.name}</h1>
        <div className="bg-white rounded-lg shadow-md overflow-hidden">
          <img
            src={item.image_url || "/placeholder.svg"}
            alt={item.name}
            className="w-full h-64 object-cover"
          />
          <div className="p-6">
            <p className="text-gray-600 mb-4">{item.description}</p>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <h3 className="font-semibold text-gray-700">Owner</h3>
                <p>{item.profiles?.username || item.profiles?.email?.split('@')[0] || 'Anonymous'}</p>
              </div>
              <div>
                <h3 className="font-semibold text-gray-700">Status</h3>
                <p className="capitalize">{item.status}</p>
              </div>
              {item.brand && (
                <div>
                  <h3 className="font-semibold text-gray-700">Brand</h3>
                  <p>{item.brand}</p>
                </div>
              )}
              {item.model && (
                <div>
                  <h3 className="font-semibold text-gray-700">Model</h3>
                  <p>{item.model}</p>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ItemDetail;