import { useState, useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { BottomNav } from "@/components/BottomNav";
import { LibraryHeader } from "@/components/library/LibraryHeader";
import { SearchAndFilters } from "@/components/library/SearchAndFilters";
import { ToolList } from "@/components/library/ToolList";

type ToolCategory = 'Kids' | 'Music' | 'Electronics' | 'Exercise' | 'Emergency' | 'Household' | 'Gardening' | 'Tools' | 'Kitchen' | 'Other';

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
  
  const processedTools = data.map(tool => ({
    ...tool,
    status: tool.tool_requests?.some(request => request.status === 'pending')
      ? 'requested'
      : tool.status
  }));

  const statusOrder = {
    'available': 0,
    'requested': 1,
    'checked_out': 2
  };

  return processedTools.sort((a, b) => {
    if (a.owner_id === currentUserId && b.owner_id !== currentUserId) return 1;
    if (a.owner_id !== currentUserId && b.owner_id === currentUserId) return -1;
    
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
  const [searchQuery, setSearchQuery] = useState('');
  const [isAuthenticated, setIsAuthenticated] = useState<boolean | null>(null);
  const [userProfile, setUserProfile] = useState<{ username?: string | null, email?: string | null, avatar_url?: string | null } | null>(null);

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

  const filteredTools = tools?.filter(tool => {
    const matchesCategory = selectedCategory ? tool.category === selectedCategory : true;
    const matchesSearch = searchQuery.trim() === '' ? true : 
      tool.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      tool.description?.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  return (
    <div className="min-h-screen bg-gray-50 pb-20">
      <LibraryHeader 
        isAuthenticated={isAuthenticated} 
        userProfile={userProfile}
      />

      <main className="container max-w-md mx-auto px-4 py-6">
        <SearchAndFilters
          searchQuery={searchQuery}
          setSearchQuery={setSearchQuery}
          selectedCategory={selectedCategory}
          setSelectedCategory={setSelectedCategory}
        />

        <ToolList
          tools={filteredTools}
          isLoading={isLoading}
          isAuthenticated={!!isAuthenticated}
        />
      </main>

      <BottomNav authRequired={!isAuthenticated} />
    </div>
  );
};

export default Index;
