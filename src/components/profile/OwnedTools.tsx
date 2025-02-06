import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { ToolCard } from "@/components/ToolCard";

export const OwnedTools = () => {
  const { data: ownedTools, isLoading: loadingOwned } = useQuery({
    queryKey: ['owned-tools'],
    queryFn: async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("Not authenticated");

      const { data, error } = await supabase
        .from('items')
        .select(`
          *,
          profiles:owner_id (
            username,
            email
          ),
          item_requests (
            status,
            id
          )
        `)
        .eq('owner_id', user.id);

      if (error) throw error;

      // Process items to include request status
      return data.map(item => ({
        ...item,
        status: item.item_requests?.some(request => request.status === 'pending')
          ? 'requested' as const
          : item.item_requests?.some(request => request.status === 'approved')
            ? 'checked_out' as const
            : 'available' as const
      }));
    },
  });

  if (loadingOwned) {
    return <div className="text-center text-gray-500">Loading your items...</div>;
  }

  // Group items by status
  const checkedOutItems = ownedTools?.filter(item => item.status === 'checked_out') || [];
  const requestedItems = ownedTools?.filter(item => item.status === 'requested') || [];
  const availableItems = ownedTools?.filter(item => item.status === 'available') || [];

  const renderItemSection = (items: typeof ownedTools, title: string) => {
    if (!items || items.length === 0) return null;
    
    return (
      <div className="space-y-4">
        <h3 className="text-md font-medium text-gray-600">{title}</h3>
        <div className="grid gap-4">
          {items.map((item) => (
            <ToolCard
              key={item.id}
              id={item.id}
              name={item.name}
              description={item.description || ''}
              imageUrl={item.image_url || "/placeholder.svg"}
              owner={item.profiles?.username || item.profiles?.email?.split('@')[0] || 'Anonymous'}
              status={item.status}
            />
          ))}
        </div>
      </div>
    );
  };

  return (
    <div className="space-y-6">
      {checkedOutItems.length === 0 && requestedItems.length === 0 && availableItems.length === 0 ? (
        <p className="text-center text-gray-500">
          You haven't added any items yet.
        </p>
      ) : (
        <div className="space-y-8">
          {renderItemSection(checkedOutItems, "Checked Out")}
          {renderItemSection(requestedItems, "Requested")}
          {renderItemSection(availableItems, "Available")}
        </div>
      )}
    </div>
  );
};