
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useToast } from "@/components/ui/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { BottomNav } from "@/components/BottomNav";

export default function Auth() {
  const [phone, setPhone] = useState("");
  const [verificationCode, setVerificationCode] = useState("");
  const [loading, setLoading] = useState(false);
  const [showVerification, setShowVerification] = useState(false);
  const navigate = useNavigate();
  const { toast } = useToast();

  useEffect(() => {
    // Check if user is already logged in
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session) {
        navigate("/");
      }
    });
  }, [navigate]);

  const handleSendCode = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      // Format phone number to ensure +1 prefix
      const formattedPhone = phone.startsWith('+1') ? phone : `+1${phone}`;
      
      const { error } = await supabase.auth.signInWithOtp({
        phone: formattedPhone,
      });

      if (error) throw error;

      setShowVerification(true);
      toast({
        title: "Success!",
        description: "Please check your phone for the verification code.",
      });
    } catch (error: any) {
      toast({
        variant: "destructive",
        title: "Error",
        description: error.message,
      });
    } finally {
      setLoading(false);
    }
  };

  const handleVerifyCode = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const formattedPhone = phone.startsWith('+1') ? phone : `+1${phone}`;
      
      const { error } = await supabase.auth.verifyOtp({
        phone: formattedPhone,
        token: verificationCode,
        type: 'sms',
      });

      if (error) throw error;
      
      // Update profile with phone number
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        const { error: profileError } = await supabase
          .from('profiles')
          .update({ phone_number: formattedPhone })
          .eq('id', user.id);

        if (profileError) throw profileError;
      }

      navigate("/");
    } catch (error: any) {
      toast({
        variant: "destructive",
        title: "Error",
        description: error.message,
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="p-4 pb-20">
        <Card className="w-full max-w-md p-6 mx-auto mt-8">
          <h1 className="text-2xl font-semibold text-center mb-6">
            {showVerification ? "Enter Verification Code" : "Login with Phone"}
          </h1>
          {!showVerification ? (
            <form onSubmit={handleSendCode} className="space-y-4">
              <div>
                <Input
                  type="tel"
                  placeholder="Phone Number (e.g. +12345678900)"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  required
                  pattern="^\+?1[0-9]{10}$"
                  className="w-full"
                />
                <p className="text-sm text-gray-500 mt-1">
                  Format: +1 followed by your 10-digit number
                </p>
                <p className="text-xs text-gray-500 mt-2">
                  By clicking this button, I agree to receive SMS updates from Neighbor Goods at the phone number provided. Msg & data rates may apply. Reply STOP to opt out.
                </p>
              </div>
              <Button
                type="submit"
                className="w-full"
                disabled={loading}
              >
                {loading ? "Sending..." : "Send Verification Code"}
              </Button>
            </form>
          ) : (
            <form onSubmit={handleVerifyCode} className="space-y-4">
              <div>
                <Input
                  type="text"
                  placeholder="Enter verification code"
                  value={verificationCode}
                  onChange={(e) => setVerificationCode(e.target.value)}
                  required
                  className="w-full"
                />
              </div>
              <Button
                type="submit"
                className="w-full"
                disabled={loading}
              >
                {loading ? "Verifying..." : "Verify Code"}
              </Button>
              <button
                type="button"
                onClick={() => setShowVerification(false)}
                className="w-full text-sm text-gray-500 hover:text-gray-700"
              >
                Back to Phone Number
              </button>
            </form>
          )}
        </Card>
      </div>
      <BottomNav />
    </div>
  );
}
