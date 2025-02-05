
import { useState } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { BottomNav } from "@/components/BottomNav";
import { OwnedTools } from "@/components/profile/OwnedTools";
import { PendingRequests } from "@/components/profile/PendingRequests";
import { CheckedOutTools } from "@/components/profile/CheckedOutTools";
import { Button } from "@/components/ui/button";
import { supabase } from "@/integrations/supabase/client";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";
import { UserCircle2 } from "lucide-react";

const Profile = () => {
  const queryClient = useQueryClient();
  const [activeTab, setActiveTab] = useState("owned");
  const navigate = useNavigate();

  const handleProfileClick = () => {
    navigate('/user-profile');
  };

  return (
    <div className="min-h-screen bg-gray-50 pb-20">
      <header className="bg-white shadow-sm py-4 px-4 sticky top-0 z-10">
        <div className="flex items-center justify-between max-w-md mx-auto">
          <h1 className="text-xl font-semibold">Your Tools</h1>
          <Link to="/user-profile" className="text-gray-600 hover:text-gray-900">
            <UserCircle2 size={24} />
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
