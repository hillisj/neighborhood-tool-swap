import { useState } from "react";
import { useQueryClient, useQuery } from "@tanstack/react-query";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { BottomNav } from "@/components/BottomNav";
import { OwnedTools } from "@/components/profile/OwnedTools";
import { PendingRequests } from "@/components/profile/PendingRequests";
import { CheckedOutTools } from "@/components/profile/CheckedOutTools";
import { User } from "lucide-react";
import { Link } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";

const Profile = () => {
  const queryClient = useQueryClient();
  const [activeTab, setActiveTab] = useState("owned");

  const { data: profile } = useQuery({
    queryKey: ['user-profile'],
    queryFn: async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("Not authenticated");

      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', user.id)
        .single();

      if (error) throw error;
      return data;
    },
  });

  return (
    <div className="min-h-screen bg-gray-50 pb-20">
      <header className="bg-white shadow-sm py-4 px-4 sticky top-0 z-10">
        <div className="flex items-center justify-between max-w-md mx-auto">
          <h1 className="text-xl font-semibold">Your Tools</h1>
          <Link 
            to="/user-profile" 
            className="flex items-center gap-2 text-sm text-gray-600 hover:text-gray-900"
          >
            <span>{profile?.username || 'Profile'}</span>
            <div className="w-8 h-8 rounded-full bg-gray-100 flex items-center justify-center">
              {profile?.avatar_url ? (
                <img 
                  src={profile.avatar_url} 
                  alt="Profile" 
                  className="w-full h-full rounded-full object-cover"
                />
              ) : (
                <User className="w-5 h-5 text-gray-500" />
              )}
            </div>
          </Link>
        </div>
      </header>

      <main className="container max-w-md mx-auto px-4 py-6">
        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="owned">Tools You Own</TabsTrigger>
            <TabsTrigger value="borrowed">Borrowed Tools</TabsTrigger>
          </TabsList>

          <TabsContent value="owned" className="space-y-6">
            <OwnedTools />
            <PendingRequests />
          </TabsContent>

          <TabsContent value="borrowed" className="space-y-6">
            <CheckedOutTools />
          </TabsContent>
        </Tabs>
      </main>
      <BottomNav />
    </div>
  );
};

export default Profile;