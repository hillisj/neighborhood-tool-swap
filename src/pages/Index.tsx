import { ToolCard } from "@/components/ToolCard";
import { BottomNav } from "@/components/BottomNav";
import { supabase } from "@/integrations/supabase/client";
import { useQuery } from "@tanstack/react-query";
import { User } from "lucide-react";
import { Link, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { useState, useEffect } from "react";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

// Get all possible categories from the Supabase types
type ToolCategory = 'Kids' | 'Music' | 'Electronics' | 'Exercise' | 'Emergency' | 'Household' | 'Gardening' | 'Tools' | 'Kitchen' | 'Other';

const CATEGORIES: ToolCategory[] = [
  'Kids',
  'Music',
  'Electronics',
  'Exercise',
  'Emergency',
  'Household',
  'Gardening',
  'Tools',
  'Kitchen',
  'Other'
];

const fetchTools = async () => {
  const { data: { user } } = await supabase.auth.getUser();
  const currentUserId = user?.id;

  const { data, error } = await supabase
    .from('tools')
    .select(`
      *,
      profiles:owner_id (
        username,
        email
      ),
      tool_requests (
        status
      )
    `)
    .order('created_at', { ascending: false });

  if (error) throw error;
  
  // Process the data to include pending requests information
  const processedTools = data.map(tool => ({
    ...tool,
    status: tool.tool_requests?.some(request => request.status === 'pending')
      ? 'requested'
      : tool.status
  }));

  // Sort tools by status and ownership
  const statusOrder = {
    'available': 0,
    'requested': 1,
    'checked_out': 2
  };

  return processedTools.sort((a, b) => {
    // First, sort by ownership (other users' tools first)
    if (a.owner_id === currentUserId && b.owner_id !== currentUserId) return 1;
    if (a.owner_id !== currentUserId && b.owner_id === currentUserId) return -1;
    
    // Then sort by status
    return statusOrder[a.status as keyof typeof statusOrder] - 
           statusOrder[b.status as keyof typeof statusOrder];
  });
};

const Index = () => {
  const { data: tools, isLoading } = useQuery({
    queryKey: ['tools'],
    queryFn: fetchTools,
  });
  const [selectedCategory, setSelectedCategory] = useState<ToolCategory | null>(null);
  const [isAuthenticated, setIsAuthenticated] = useState<boolean | null>(null);
  const [userProfile, setUserProfile] = useState<{ username?: string | null, email?: string | null, avatar_url?: string | null } | null>(null);
  const navigate = useNavigate();

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setIsAuthenticated(!!session);
      if (session?.user) {
        fetchUserProfile(session.user.id);
      }
    });

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      setIsAuthenticated(!!session);
      if (session?.user) {
        fetchUserProfile(session.user.id);
      } else {
        setUserProfile(null);
      }
    });

    return () => subscription.unsubscribe();
  }, []);

  const fetchUserProfile = async (userId: string) => {
    const { data, error } = await supabase
      .from('profiles')
      .select('username, email, avatar_url')
      .eq('id', userId)
      .single();
    
    if (!error && data) {
      setUserProfile(data);
    }
  };

  const filteredTools = tools?.filter(tool => 
    selectedCategory ? tool.category === selectedCategory : true
  );

  return (
    <div className="min-h-screen bg-gray-50 pb-20">
      <header className="bg-white shadow-sm py-4 px-4 sticky top-0 z-10">
        <div className="flex items-center justify-between max-w-md mx-auto">
          <h1 className="text-xl font-semibold">Library</h1>
          {isAuthenticated ? (
            <Link to="/user-profile" className="flex items-center gap-2 text-gray-600 hover:text-gray-900">
              <span className="text-sm">
                {userProfile?.username || userProfile?.email?.split('@')[0] || 'Profile'}
              </span>
              <Avatar className="h-8 w-8">
                <AvatarImage
                  src={userProfile?.avatar_url || ''}
                  alt="Profile"
                  className="object-cover"
                />
                <AvatarFallback>
                  <User className="h-4 w-4 text-gray-400" />
                </AvatarFallback>
              </Avatar>
            </Link>
          ) : (
            <Button
              variant="outline"
              onClick={() => navigate('/auth')}
            >
              Sign In
            </Button>
          )}
        </div>
      </header>

      <main className="container max-w-md mx-auto px-4 py-6">
        {!isAuthenticated && (
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
            <p className="text-blue-700 text-sm">
              Sign in to request tools, add your own tools, or manage your tool inventory.
            </p>
          </div>
        )}

        <div className="flex flex-wrap gap-2 mb-6">
          <Badge
            className={cn(
              "cursor-pointer hover:bg-accent/80",
              selectedCategory === null ? "bg-accent" : "bg-secondary"
            )}
            onClick={() => setSelectedCategory(null)}
          >
            All
          </Badge>
          {CATEGORIES.map((category) => (
            <Badge
              key={category}
              className={cn(
                "cursor-pointer hover:bg-accent/80",
                selectedCategory === category ? "bg-accent" : "bg-secondary"
              )}
              onClick={() => setSelectedCategory(category)}
            >
              {category}
            </Badge>
          ))}
        </div>

        {isLoading ? (
          <div className="text-center text-gray-500">Loading tools...</div>
        ) : (
          <div className="grid gap-6">
            {filteredTools?.map((tool) => (
              <ToolCard
                key={tool.id}
                id={tool.id}
                name={tool.name}
                description={tool.description}
                imageUrl={tool.image_url || "/placeholder.svg"}
                owner={tool.profiles?.username || tool.profiles?.email?.split('@')[0] || 'Anonymous'}
                status={tool.status}
                requiresAuth={!isAuthenticated}
              />
            ))}
            {filteredTools?.length === 0 && (
              <div className="text-center text-gray-500">
                {selectedCategory 
                  ? `No ${selectedCategory.toLowerCase()} tools available at the moment.`
                  : 'No available tools at the moment.'} 
                {isAuthenticated ? ' Add one to share!' : ' Sign in to add tools!'}
              </div>
            )}
          </div>
        )}
      </main>
      <BottomNav authRequired={!isAuthenticated} />
    </div>
  );
};

export default Index;