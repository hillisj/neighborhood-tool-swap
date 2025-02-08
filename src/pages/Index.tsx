import { useState, useEffect } from "react";
import { useInfiniteQuery, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { BottomNav } from "@/components/BottomNav";
import { LibraryHeader } from "@/components/library/LibraryHeader";
import { SearchAndFilters } from "@/components/library/SearchAndFilters";
import { ToolList } from "@/components/library/ToolList";
import { Database } from "@/integrations/supabase/types";

type ToolCategory = Database["public"]["Enums"]["tool_category"];

const ITEMS_PER_PAGE = 10;

const fetchTools = async ({ pageParam = 0 }) => {
  const { data: { user } } = await supabase.auth.getUser();
  const currentUserId = user?.id;

  const from = pageParam * ITEMS_PER_PAGE;
  const to = from + ITEMS_PER_PAGE - 1;

  const { data: tools, error: toolsError } = await supabase
    .from('tools')
    .select(`
      id,
      name,
      description,
      image_url,
      status,
      owner_id,
      profiles:owner_id (
        username,
        email
      ),
      tool_requests!inner (
        status
      )
    `)
    .range(from, to)
    .order('created_at', { ascending: false });

  if (toolsError) throw toolsError;

  const toolIds = tools.map(tool => tool.id);
  const { data: categories, error: categoriesError } = await supabase
    .from('tool_categories')
    .select('tool_id, category')
    .in('tool_id', toolIds);

  if (categoriesError) throw categoriesError;

  const toolCategories = categories.reduce((acc: { [key: string]: ToolCategory[] }, curr) => {
    if (!acc[curr.tool_id]) {
      acc[curr.tool_id] = [];
    }
    acc[curr.tool_id].push(curr.category);
    return acc;
  }, {});
  
  const processedTools = tools.map(tool => ({
    ...tool,
    categories: toolCategories[tool.id] || [],
    status: tool.tool_requests?.some(request => request.status === 'pending')
      ? 'requested'
      : tool.status
  }));

  const statusOrder = {
    'available': 0,
    'requested': 1,
    'checked_out': 2
  };

  return {
    items: processedTools.sort((a, b) => {
      if (a.owner_id === currentUserId && b.owner_id !== currentUserId) return 1;
      if (a.owner_id !== currentUserId && b.owner_id === currentUserId) return -1;
      
      return statusOrder[a.status as keyof typeof statusOrder] - 
             statusOrder[b.status as keyof typeof statusOrder];
    }),
    nextPage: tools.length === ITEMS_PER_PAGE ? pageParam + 1 : undefined
  };
};

const Index = () => {
  const queryClient = useQueryClient();
  const { data, isLoading, fetchNextPage, hasNextPage, isFetchingNextPage } = useInfiniteQuery({
    queryKey: ['tools'],
    queryFn: fetchTools,
    getNextPageParam: (lastPage) => lastPage.nextPage,
    staleTime: 1000 * 60 * 5, // Cache data for 5 minutes
    gcTime: 1000 * 60 * 30, // Keep cache for 30 minutes
  });

  const [selectedCategory, setSelectedCategory] = useState<ToolCategory | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [isAuthenticated, setIsAuthenticated] = useState<boolean | null>(null);
  const [userProfile, setUserProfile] = useState<{ username?: string | null, email?: string | null, avatar_url?: string | null } | null>(null);

  // Prefetch next page
  useEffect(() => {
    if (data?.pages?.length) {
      const nextPage = Math.ceil(data.pages.length / ITEMS_PER_PAGE);
      queryClient.prefetchQuery({
        queryKey: ['tools', nextPage],
        queryFn: () => fetchTools({ pageParam: nextPage }),
      });
    }
  }, [data?.pages?.length, queryClient]);

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
    const { data } = await supabase
      .from('profiles')
      .select('username, email, avatar_url')
      .eq('id', userId)
      .single();
    
    if (data) {
      setUserProfile(data);
    }
  };

  const allTools = data?.pages.flatMap(page => page.items) ?? [];
  
  const filteredTools = allTools.filter(tool => {
    const matchesCategory = selectedCategory 
      ? tool.categories.includes(selectedCategory)
      : true;
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

      <main className="container mx-auto px-4 py-6 max-w-md md:max-w-4xl lg:max-w-7xl">
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
          onLoadMore={fetchNextPage}
          hasMore={!!hasNextPage}
          isLoadingMore={isFetchingNextPage}
        />
      </main>

      <BottomNav authRequired={!isAuthenticated} />
    </div>
  );
};

export default Index;
