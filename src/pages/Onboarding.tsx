
import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { ProfileAvatar } from "@/components/profile/ProfileAvatar";
import { useLoadScript } from "@react-google-maps/api";

const Onboarding = () => {
  const navigate = useNavigate();
  const [username, setUsername] = useState("");
  const [avatarUrl, setAvatarUrl] = useState("");
  const [isUploading, setIsUploading] = useState(false);
  const [address, setAddress] = useState("");
  const [addressDetails, setAddressDetails] = useState({
    street: "",
    city: "",
    state: "",
    zip: ""
  });
  const [apiKey, setApiKey] = useState<string>("");
  const [isApiKeyLoading, setIsApiKeyLoading] = useState(true);

  useEffect(() => {
    const checkUserSession = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        toast.error('Please sign in to access this page');
        navigate('/auth');
        return;
      }
    };

    checkUserSession();
  }, [navigate]);

  useEffect(() => {
    const loadApiKey = async () => {
      try {
        setIsApiKeyLoading(true);
        const { data: { session } } = await supabase.auth.getSession();
        if (!session) {
          console.error('No authenticated session found');
          return;
        }

        const { data, error } = await supabase
          .from('secrets')
          .select('value')
          .eq('key', 'google_maps_api_key')
          .single();
        
        if (error) {
          console.error('Error loading API key:', error);
          toast.error('Failed to load Google Maps API key');
          return;
        }
        
        if (data?.value) {
          console.log('API key loaded successfully');
          setApiKey(data.value);
        } else {
          console.error('No API key found');
          toast.error('Google Maps API key not found');
        }
      } catch (err) {
        console.error('Error in loadApiKey:', err);
        toast.error('Failed to load Google Maps API key');
      } finally {
        setIsApiKeyLoading(false);
      }
    };

    loadApiKey();
  }, []);

  const { isLoaded, loadError } = useLoadScript({
    googleMapsApiKey: apiKey,
    libraries: ["places"]
  });

  useEffect(() => {
    if (!isLoaded || !window.google || loadError) return;

    console.log('Initializing Google Maps Autocomplete');
    const input = document.getElementById("address-input") as HTMLInputElement;
    if (!input) {
      console.error('Address input element not found');
      return;
    }

    try {
      const autocomplete = new window.google.maps.places.Autocomplete(input, {
        componentRestrictions: { country: "us" },
        fields: ["address_components"]
      });

      autocomplete.addListener("place_changed", () => {
        const place = autocomplete.getPlace();
        if (!place.address_components) {
          console.error('No address components found in place result');
          return;
        }

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

        setAddress(`${streetNumber} ${streetName}`);
        setAddressDetails({
          street: `${streetNumber} ${streetName}`,
          city,
          state,
          zip
        });
      });
    } catch (err) {
      console.error('Error initializing Google Maps Autocomplete:', err);
      toast.error('Error initializing address autocomplete');
    }
  }, [isLoaded, loadError]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("Not authenticated");

      const { error } = await supabase
        .from('profiles')
        .update({
          username,
          avatar_url: avatarUrl,
          address_street: addressDetails.street,
          address_city: addressDetails.city,
          address_state: addressDetails.state,
          address_zip: addressDetails.zip,
        })
        .eq('id', user.id);

      if (error) throw error;

      toast.success("Profile updated successfully!");
      navigate("/");
    } catch (error: any) {
      toast.error(error.message);
    }
  };

  if (loadError) {
    console.error('Google Maps load error:', loadError);
  }

  return (
    <div className="min-h-screen bg-gray-50 p-4">
      <Card className="max-w-md mx-auto p-6 mt-8">
        <h1 className="text-2xl font-semibold text-center mb-6">
          Complete Your Profile
        </h1>
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="flex flex-col items-center space-y-4">
            <ProfileAvatar
              avatarUrl={avatarUrl}
              setAvatarUrl={setAvatarUrl}
              isUploading={isUploading}
              setIsUploading={setIsUploading}
              refetch={() => {}}
              isEditing={true}
            />
            <p className="text-sm text-gray-500">Add a profile photo</p>
          </div>

          <div className="space-y-4">
            <div>
              <label htmlFor="username" className="block text-sm font-medium text-gray-700 mb-1">
                Name
              </label>
              <Input
                id="username"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                placeholder="Enter your name"
                required
              />
            </div>

            <div>
              <label htmlFor="address-input" className="block text-sm font-medium text-gray-700 mb-1">
                Address
              </label>
              <Input
                id="address-input"
                type="text"
                placeholder="Start typing your address..."
                className="w-full"
                required
                value={address}
                onChange={(e) => setAddress(e.target.value)}
                disabled={!isLoaded || isApiKeyLoading}
              />
              {isApiKeyLoading && (
                <p className="text-sm text-gray-500 mt-1">Loading Google Maps...</p>
              )}
              {!isApiKeyLoading && !isLoaded && (
                <p className="text-sm text-gray-500 mt-1">Initializing address autocomplete...</p>
              )}
              {loadError && (
                <p className="text-sm text-red-500 mt-1">
                  Error loading Google Maps: {loadError.message}
                </p>
              )}
            </div>
          </div>

          <Button type="submit" className="w-full">
            Complete Profile
          </Button>
        </form>
      </Card>
    </div>
  );
};

export default Onboarding;
