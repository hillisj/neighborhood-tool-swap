
import { useState, useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { BottomNav } from "@/components/BottomNav";
import { LibraryHeader } from "@/components/library/LibraryHeader";
import { SearchAndFilters } from "@/components/library/SearchAndFilters";
import { ToolList } from "@/components/library/ToolList";
import { Database } from "@/integrations/supabase/types";

type ToolCategory = Database["public"]["Enums"]["tool_category"];

interface Profile {
  username: string | null;
  phone_number: string | null;
  avatar_url?: string | null;
}

interface Tool {
  id: string;
  name: string;
  description: string;
  image_url: string;
  status: 'available' | 'requested' | 'checked_out';
  categories: ToolCategory[];
  profiles: {
    username: string | null;
    phone_number: string | null;
  };
  owner_id: string;
  tool_requests?: {
    status: string;
  }[];
}

const fetchTools = async () => {
  const { data: { user } } = await supabase.auth.getUser();
  const currentUserId = user?.id;

  const { data: tools, error: toolsError } = await supabase
    .from('tools')
    .select(`
      *,
      profiles:owner_id (
        username,
        phone_number
      ),
      tool_requests (
        status
      )
    `)
    .order('created_at', { ascending: false });

  if (toolsError) throw toolsError;

  // Fetch categories for all tools
  const { data: categories, error: categoriesError } = await supabase
    .from('tool_categories')
    .select('tool_id, category');

  if (categoriesError) throw categoriesError;

  // Create a map of tool_id to categories
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
  const [userProfile, setUserProfile] = useState<Profile | null>(null);

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
      .select('username, phone_number, avatar_url')
      .eq('id', userId)
      .single();
    
    if (!error && data) {
      setUserProfile(data);
    }
  };

  const filteredTools = tools?.filter(tool => {
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
        />
      </main>

      <BottomNav authRequired={!isAuthenticated} />
    </div>
  );
};

export default Index;
