
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useToast } from "@/components/ui/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { BottomNav } from "@/components/BottomNav";

export default function Auth() {
  const [phoneNumber, setPhoneNumber] = useState("");
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

  const handlePhoneSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      // Format phone number to ensure +1 prefix
      const formattedPhone = phoneNumber.startsWith('+1') ? phoneNumber : `+1${phoneNumber}`;
      
      const { error } = await supabase.auth.signInWithOtp({
        phone: formattedPhone,
      });

      if (error) throw error;

      toast({
        title: "Verification code sent!",
        description: "Please check your phone for the verification code.",
      });
      setShowVerification(true);
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

  const handleVerificationSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const formattedPhone = phoneNumber.startsWith('+1') ? phoneNumber : `+1${phoneNumber}`;
      
      const { error } = await supabase.auth.verifyOtp({
        phone: formattedPhone,
        token: verificationCode,
        type: 'sms',
      });

      if (error) throw error;

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
            {showVerification ? "Enter Verification Code" : "Sign In with Phone"}
          </h1>
          {!showVerification ? (
            <form onSubmit={handlePhoneSubmit} className="space-y-4">
              <div>
                <Input
                  type="tel"
                  placeholder="Phone Number (e.g. +1234567890)"
                  value={phoneNumber}
                  onChange={(e) => setPhoneNumber(e.target.value)}
                  required
                  pattern="^\+?1?\d{10,}$"
                  className="w-full"
                />
                <p className="text-sm text-gray-500 mt-1">
                  Format: +1 followed by your 10-digit number
                </p>
              </div>
              <Button
                type="submit"
                className="w-full"
                disabled={loading}
              >
                {loading ? "Sending code..." : "Send Verification Code"}
              </Button>
            </form>
          ) : (
            <form onSubmit={handleVerificationSubmit} className="space-y-4">
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
              <Button
                type="button"
                variant="outline"
                className="w-full"
                onClick={() => setShowVerification(false)}
              >
                Back to Phone Entry
              </Button>
            </form>
          )}
        </Card>
      </div>
      <BottomNav />
    </div>
  );
}
