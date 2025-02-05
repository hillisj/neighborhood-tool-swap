import { useParams, useNavigate } from "react-router-dom";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { ToolDetailHeader } from "@/components/tool-detail/ToolDetailHeader";
import { ToolDetailSkeleton } from "@/components/tool-detail/ToolDetailSkeleton";
import { ToolDetailInfo } from "@/components/tool-detail/ToolDetailInfo";
import { ToolRequests } from "@/components/tool-detail/ToolRequests";
import { BottomNav } from "@/components/BottomNav";
import { Card } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Trash2 } from "lucide-react";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";

const ToolDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  const { data: tool, isLoading: loadingTool } = useQuery({
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

  const { data: currentUser } = useQuery({
    queryKey: ['current-user'],
    queryFn: async () => {
      const { data: { user } } = await supabase.auth.getUser();
      return user;
    },
  });

  const { data: activeCheckout } = useQuery({
    queryKey: ['active-checkout', id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('tool_requests')
        .select(`
          *,
          profiles:requester_id (
            username,
            email,
            avatar_url
          )
        `)
        .eq('tool_id', id)
        .eq('status', 'approved')
        .maybeSingle();

      if (error) throw error;
      return data;
    },
    enabled: !!id && tool?.status === 'checked_out',
  });

  const { data: requests = [], isLoading: loadingRequests } = useQuery({
    queryKey: ['tool-requests', id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('tool_requests')
        .select(`
          *,
          profiles:requester_id (
            username,
            email,
            avatar_url
          )
        `)
        .eq('tool_id', id)
        .order('created_at', { ascending: false });

      if (error) throw error;
      return data;
    },
  });

  const hasPendingRequests = requests.some(request => request.status === 'pending');

  const handleMarkReturned = async () => {
    if (!activeCheckout) return;
    
    const { error } = await supabase
      .from('tool_requests')
      .update({ 
        status: 'returned',
        return_date: new Date().toISOString()
      })
      .eq('id', activeCheckout.id);

    if (error) {
      toast.error("Failed to mark tool as returned");
      return;
    }
    
    // Invalidate queries to refresh the data
    queryClient.invalidateQueries({ queryKey: ['tool', id] });
    queryClient.invalidateQueries({ queryKey: ['tool-requests', id] });
    queryClient.invalidateQueries({ queryKey: ['active-checkout', id] });
    
    toast.success("Tool marked as returned successfully");
  };

  const handleApproveRequest = async (requestId: string) => {
    const dueDate = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString();
    
    const { error: approvalError } = await supabase
      .from('tool_requests')
      .update({ 
        status: 'approved',
        due_date: dueDate
      })
      .eq('id', requestId);

    if (approvalError) {
      toast.error("Failed to approve request");
      return;
    }
    
    // Invalidate queries to refresh the data
    queryClient.invalidateQueries({ queryKey: ['tool', id] });
    queryClient.invalidateQueries({ queryKey: ['tool-requests', id] });
    queryClient.invalidateQueries({ queryKey: ['active-checkout', id] });
    
    toast.success("Request approved successfully");
  };

  const handleRejectRequest = async (requestId: string) => {
    const { error } = await supabase
      .from('tool_requests')
      .update({ status: 'rejected' })
      .eq('id', requestId);

    if (error) {
      toast.error("Failed to reject request");
      return;
    }
    
    // Invalidate queries to refresh the data
    queryClient.invalidateQueries({ queryKey: ['tool', id] });
    queryClient.invalidateQueries({ queryKey: ['tool-requests', id] });
    
    toast.success("Request rejected successfully");
  };

  const handleDeleteTool = async () => {
    const { error } = await supabase
      .from('tools')
      .delete()
      .eq('id', id);

    if (error) {
      toast.error("Failed to delete tool");
      return;
    }
    
    toast.success("Tool deleted successfully");
    navigate('/profile');
  };

  if (loadingTool) {
    return (
      <>
        <ToolDetailSkeleton />
        <BottomNav />
      </>
    );
  }

  if (!tool) {
    return (
      <div className="min-h-screen bg-gray-50 p-4">
        <div className="max-w-2xl mx-auto text-center">
          <h1 className="text-2xl font-bold text-gray-900">Tool not found</h1>
          <Button onClick={() => navigate(-1)}>
            Go back
          </Button>
        </div>
        <BottomNav />
      </div>
    );
  }

  const isOwner = currentUser?.id === tool.owner_id;

  return (
    <div className="min-h-screen bg-gray-50 pb-20">
      <div className="max-w-2xl mx-auto p-4">
        <ToolDetailHeader />

        <div className="bg-white rounded-lg shadow-sm overflow-hidden">
          <img
            src={tool.image_url || "/placeholder.svg"}
            alt={tool.name}
            className="w-full h-64 object-cover"
          />
          
          <div className="p-6">
            <div className="flex items-center justify-between mb-4">
              <h1 className="text-2xl font-bold text-gray-900">{tool.name}</h1>
              {isOwner && (
                <AlertDialog>
                  <AlertDialogTrigger asChild>
                    <Button variant="destructive" size="icon">
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </AlertDialogTrigger>
                  <AlertDialogContent>
                    <AlertDialogHeader>
                      <AlertDialogTitle>Delete Tool</AlertDialogTitle>
                      <AlertDialogDescription>
                        Are you sure you want to delete this tool? This action cannot be undone.
                      </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                      <AlertDialogCancel>Cancel</AlertDialogCancel>
                      <AlertDialogAction onClick={handleDeleteTool}>
                        Delete
                      </AlertDialogAction>
                    </AlertDialogFooter>
                  </AlertDialogContent>
                </AlertDialog>
              )}
            </div>
          </div>
          
          <ToolDetailInfo tool={tool} hasPendingRequests={hasPendingRequests} />

          {isOwner && tool.status === 'checked_out' && activeCheckout && (
            <div className="p-6 border-t">
              <h2 className="text-lg font-semibold mb-4">Currently Checked Out</h2>
              <Card className="p-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <Avatar>
                      <AvatarImage src={activeCheckout.profiles?.avatar_url || undefined} />
                      <AvatarFallback>
                        {activeCheckout.profiles?.username?.[0]?.toUpperCase() || 
                         activeCheckout.profiles?.email?.[0]?.toUpperCase() || 
                         'U'}
                      </AvatarFallback>
                    </Avatar>
                    <div>
                      <p className="font-medium">
                        {activeCheckout.profiles?.username || 
                         activeCheckout.profiles?.email?.split('@')[0] || 
                         'Anonymous'}
                      </p>
                      {activeCheckout.due_date && (
                        <p className="text-sm text-gray-500">
                          Due: {new Date(activeCheckout.due_date).toLocaleDateString()}
                        </p>
                      )}
                    </div>
                  </div>
                  <Button
                    onClick={handleMarkReturned}
                    variant="secondary"
                    size="sm"
                  >
                    Mark as Returned
                  </Button>
                </div>
              </Card>
            </div>
          )}

          {isOwner && requests && requests.length > 0 && (
            <ToolRequests
              requests={requests}
              onApprove={handleApproveRequest}
              onReject={handleRejectRequest}
              onMarkReturned={handleMarkReturned}
              toolName={tool.name}
            />
          )}
        </div>
      </div>
      <BottomNav />
    </div>
  );
};

export default ToolDetail;
