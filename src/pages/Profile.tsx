
import { useState } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { ToolCard } from "@/components/ToolCard";
import { ToolRequest } from "@/components/ToolRequest";
import { BottomNav } from "@/components/BottomNav";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { toast } from "sonner";

const Profile = () => {
  const queryClient = useQueryClient();
  const [activeTab, setActiveTab] = useState("owned");

  // Fetch owned tools
  const { data: ownedTools, isLoading: loadingOwned } = useQuery({
    queryKey: ['owned-tools'],
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
        .eq('owner_id', (await supabase.auth.getUser()).data.user?.id);

      if (error) throw error;
      return data;
    },
  });

  // Fetch tool requests for owned tools
  const { data: toolRequests, isLoading: loadingRequests } = useQuery({
    queryKey: ['tool-requests'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('tool_requests')
        .select(`
          *,
          tool:tool_id (
            name,
            owner_id
          ),
          requester:requester_id (
            username,
            email
          )
        `)
        .order('created_at', { ascending: false });

      if (error) throw error;
      return data;
    },
  });

  // Fetch checked out tools
  const { data: checkedOutTools, isLoading: loadingCheckedOut } = useQuery({
    queryKey: ['checked-out-tools'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('tool_requests')
        .select(`
          *,
          tool:tool_id (
            *,
            profiles:owner_id (
              username,
              email
            )
          )
        `)
        .eq('requester_id', (await supabase.auth.getUser()).data.user?.id)
        .eq('status', 'approved');

      if (error) throw error;
      return data;
    },
  });

  const handleRequestAction = async (requestId: string, status: 'approved' | 'rejected' | 'returned', dueDate?: string) => {
    try {
      const { error } = await supabase
        .from('tool_requests')
        .update({ 
          status,
          ...(status === 'approved' ? { due_date: dueDate } : {}),
          ...(status === 'returned' ? { return_date: new Date().toISOString() } : {})
        })
        .eq('id', requestId);

      if (error) throw error;

      toast.success(`Request ${status} successfully`);
      queryClient.invalidateQueries({ queryKey: ['tool-requests'] });
      queryClient.invalidateQueries({ queryKey: ['owned-tools'] });
      queryClient.invalidateQueries({ queryKey: ['checked-out-tools'] });
    } catch (error: any) {
      toast.error(`Error: ${error.message}`);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 pb-20">
      <header className="bg-white shadow-sm py-4 px-4 sticky top-0 z-10">
        <h1 className="text-xl font-semibold text-center">Your Tools</h1>
      </header>

      <main className="container max-w-md mx-auto px-4 py-6">
        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="owned">Tools You Own</TabsTrigger>
            <TabsTrigger value="borrowed">Borrowed Tools</TabsTrigger>
          </TabsList>

          <TabsContent value="owned" className="space-y-6">
            <div className="space-y-4">
              <h2 className="text-lg font-medium">Your Tools</h2>
              {loadingOwned ? (
                <div className="text-center text-gray-500">Loading your tools...</div>
              ) : (
                <div className="grid gap-4">
                  {ownedTools?.map((tool) => (
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
                  {ownedTools?.length === 0 && (
                    <p className="text-center text-gray-500">
                      You haven't added any tools yet.
                    </p>
                  )}
                </div>
              )}
            </div>

            <div className="space-y-4 mt-8">
              <h2 className="text-lg font-medium">Pending Requests</h2>
              {loadingRequests ? (
                <div className="text-center text-gray-500">Loading requests...</div>
              ) : (
                <div className="grid gap-4">
                  {toolRequests
                    ?.filter(request => 
                      request.tool?.owner_id === (supabase.auth.getUser() as any).data?.user?.id &&
                      request.status === 'pending'
                    )
                    .map((request) => (
                      <ToolRequest
                        key={request.id}
                        toolName={request.tool?.name || 'Unknown Tool'}
                        requesterName={
                          request.requester?.username || 
                          request.requester?.email?.split('@')[0] || 
                          'Anonymous'
                        }
                        status={request.status}
                        onApprove={() => {
                          const dueDate = new Date();
                          dueDate.setDate(dueDate.getDate() + 7); // Default to 7 days
                          handleRequestAction(request.id, 'approved', dueDate.toISOString());
                        }}
                        onReject={() => handleRequestAction(request.id, 'rejected')}
                      />
                    ))}
                  {toolRequests?.filter(request => 
                    request.tool?.owner_id === (supabase.auth.getUser() as any).data?.user?.id &&
                    request.status === 'pending'
                  ).length === 0 && (
                    <p className="text-center text-gray-500">
                      No pending requests.
                    </p>
                  )}
                </div>
              )}
            </div>

            <div className="space-y-4 mt-8">
              <h2 className="text-lg font-medium">Checked Out Tools</h2>
              {loadingRequests ? (
                <div className="text-center text-gray-500">Loading checked out tools...</div>
              ) : (
                <div className="grid gap-4">
                  {toolRequests
                    ?.filter(request => 
                      request.tool?.owner_id === (supabase.auth.getUser() as any).data?.user?.id &&
                      request.status === 'approved'
                    )
                    .map((request) => (
                      <ToolRequest
                        key={request.id}
                        toolName={request.tool?.name || 'Unknown Tool'}
                        requesterName={
                          request.requester?.username || 
                          request.requester?.email?.split('@')[0] || 
                          'Anonymous'
                        }
                        status={request.status}
                        dueDate={request.due_date}
                        onMarkReturned={() => handleRequestAction(request.id, 'returned')}
                      />
                    ))}
                  {toolRequests?.filter(request => 
                    request.tool?.owner_id === (supabase.auth.getUser() as any).data?.user?.id &&
                    request.status === 'approved'
                  ).length === 0 && (
                    <p className="text-center text-gray-500">
                      No tools currently checked out.
                    </p>
                  )}
                </div>
              )}
            </div>
          </TabsContent>

          <TabsContent value="borrowed" className="space-y-6">
            <div className="space-y-4">
              <h2 className="text-lg font-medium">Borrowed Tools</h2>
              {loadingCheckedOut ? (
                <div className="text-center text-gray-500">Loading borrowed tools...</div>
              ) : (
                <div className="grid gap-4">
                  {checkedOutTools?.map((checkout) => (
                    <ToolCard
                      key={checkout.tool.id}
                      id={checkout.tool.id}
                      name={checkout.tool.name}
                      description={checkout.tool.description}
                      imageUrl={checkout.tool.image_url || "/placeholder.svg"}
                      owner={
                        checkout.tool.profiles?.username || 
                        checkout.tool.profiles?.email?.split('@')[0] || 
                        'Anonymous'
                      }
                      isAvailable={false}
                    />
                  ))}
                  {checkedOutTools?.length === 0 && (
                    <p className="text-center text-gray-500">
                      You haven't borrowed any tools yet.
                    </p>
                  )}
                </div>
              )}
            </div>
          </TabsContent>
        </Tabs>
      </main>
      <BottomNav />
    </div>
  );
};

export default Profile;
