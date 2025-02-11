
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { useProfile } from "@/hooks/useProfile";
import { ProfileAvatar } from "@/components/profile/ProfileAvatar";
import { ProfileHeader } from "@/components/profile/ProfileHeader";
import { BottomNav } from "@/components/BottomNav";
import { useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useLoadScript } from "@react-google-maps/api";

const libraries: ("places")[] = ["places"];

type Secret = {
  id: string;
  key: string;
  value: string;
  created_at: string;
  updated_at: string;
};

const UserProfile = () => {
  const {
    profile,
    username,
    setUsername,
    bio,
    setBio,
    avatarUrl,
    setAvatarUrl,
    addressStreet,
    setAddressStreet,
    addressCity,
    setAddressCity,
    addressState,
    setAddressState,
    addressZip,
    setAddressZip,
    address,
    setAddress,
    isEditing,
    setIsEditing,
    isUploading,
    setIsUploading,
    handleSave,
    handleLogout,
    refetch
  } = useProfile();

  // Fetch the Google Maps API key from Supabase
  const { data: secretData } = useQuery({
    queryKey: ['google-maps-api-key'],
    queryFn: async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("Not authenticated");

      const { data, error } = await supabase
        .from('secrets')
        .select('*')
        .eq('key', 'google_maps_api_key')
        .single();

      if (error) throw error;
      return data as Secret;
    },
  });

  const { isLoaded } = useLoadScript({
    googleMapsApiKey: secretData?.value || "",
    libraries,
  });

  useEffect(() => {
    if (isLoaded && window.google) {
      const input = document.getElementById("address-input") as HTMLInputElement;
      if (!input) return;

      const autocomplete = new window.google.maps.places.Autocomplete(input, {
        componentRestrictions: { country: "us" },
        fields: ["address_components"],
      });

      autocomplete.addListener("place_changed", () => {
        const place = autocomplete.getPlace();
        if (!place.address_components) return;

        let streetNumber = "";
        let streetName = "";
        let city = "";
        let state = "";
        let zip = "";

        for (const component of place.address_components) {
          const type = component.types[0];
          switch (type) {
            case "street_number":
              streetNumber = component.long_name;
              break;
            case "route":
              streetName = component.long_name;
              break;
            case "locality":
              city = component.long_name;
              break;
            case "administrative_area_level_1":
              state = component.short_name;
              break;
            case "postal_code":
              zip = component.long_name;
              break;
          }
        }

        const fullStreet = `${streetNumber} ${streetName}`.trim();
        setAddressStreet(fullStreet);
        setAddressCity(city);
        setAddressState(state);
        setAddressZip(zip);
        setAddress(fullStreet);
      });
    }
  }, [isLoaded, setAddressStreet, setAddressCity, setAddressState, setAddressZip, setAddress]);

  useEffect(() => {
    if (profile) {
      setUsername(profile.username || "");
      setBio(profile.bio || "");
      setAvatarUrl(profile.avatar_url || "");
      setAddressStreet(profile.address_street || "");
      setAddressCity(profile.address_city || "");
      setAddressState(profile.address_state || "");
      setAddressZip(profile.address_zip || "");
      setAddress(profile.address_street || "");
    }
  }, [profile]);

  const { data: lendingCount } = useQuery({
    queryKey: ['lending-count', profile?.id],
    queryFn: async () => {
      if (!profile?.id) return 0;
      const { data, error } = await supabase
        .rpc('get_user_lending_count', { user_id: profile.id });

      if (error) {
        console.error('Error fetching lending count:', error);
        return 0;
      }
      return data || 0;
    },
    enabled: !!profile?.id,
  });

  const { data: borrowingCount } = useQuery({
    queryKey: ['borrowing-count', profile?.id],
    queryFn: async () => {
      if (!profile?.id) return 0;
      const { data, error } = await supabase
        .rpc('get_user_borrowing_count', { user_id: profile.id });

      if (error) {
        console.error('Error fetching borrowing count:', error);
        return 0;
      }
      return data || 0;
    },
    enabled: !!profile?.id,
  });

  return (
    <div className="min-h-screen bg-gray-50 pb-20">
      <ProfileHeader 
        isEditing={isEditing}
        setIsEditing={setIsEditing}
      />

      <main className="container max-w-md mx-auto px-4 py-6 space-y-6">
        <div className="flex flex-col items-center space-y-4">
          <ProfileAvatar 
            avatarUrl={avatarUrl}
            setAvatarUrl={setAvatarUrl}
            isUploading={isUploading}
            setIsUploading={setIsUploading}
            refetch={refetch}
            isEditing={isEditing}
          />
          {isEditing ? (
            <Input
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              placeholder="Username"
              className="max-w-xs"
            />
          ) : (
            <h2 className="text-xl font-medium">{username || "Anonymous"}</h2>
          )}
        </div>

        <div className="grid grid-cols-2 gap-4 bg-white p-4 rounded-lg shadow-sm">
          <div className="text-center">
            <div className="text-2xl font-semibold text-blue-600">{lendingCount || 0}</div>
            <div className="text-sm text-gray-600">Times Lent</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-semibold text-green-600">{borrowingCount || 0}</div>
            <div className="text-sm text-gray-600">Times Borrowed</div>
          </div>
        </div>

        <div className="space-y-4">
          <h3 className="text-lg font-medium">Bio</h3>
          {isEditing ? (
            <Textarea
              value={bio}
              onChange={(e) => setBio(e.target.value)}
              placeholder="Tell us about yourself..."
              className="min-h-[100px]"
            />
          ) : (
            <p className="text-gray-600">{bio || "No bio yet"}</p>
          )}
        </div>

        <div className="space-y-4">
          <h3 className="text-lg font-medium">Address</h3>
          {isEditing ? (
            <div className="space-y-3">
              <Input
                id="address-input"
                placeholder="Start typing your address..."
                value={address}
                onChange={(e) => setAddress(e.target.value)}
                disabled={!isLoaded}
              />
              {!isLoaded && (
                <p className="text-sm text-gray-500">Loading Google Maps...</p>
              )}
            </div>
          ) : (
            <div className="text-gray-600">
              {addressStreet ? (
                <>
                  <p>{addressStreet}</p>
                  <p>{addressCity}, {addressState} {addressZip}</p>
                </>
              ) : (
                <p>No address provided</p>
              )}
            </div>
          )}
        </div>

        {isEditing && (
          <Button onClick={handleSave} className="w-full">
            Save Changes
          </Button>
        )}

        <Button 
          variant="destructive" 
          size="lg" 
          className="w-full bg-[#ea384c] hover:bg-[#ea384c]/90 text-base font-semibold py-6"
          onClick={handleLogout}
        >
          Log Out
        </Button>
      </main>
      <BottomNav />
    </div>
  );
};

export default UserProfile;
