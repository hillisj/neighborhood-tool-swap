
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useToast } from "@/components/ui/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { BottomNav } from "@/components/BottomNav";

export default function PhoneAuth() {
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

  const formatPhoneNumber = (input: string): string => {
    // Remove all non-numeric characters
    const numbers = input.replace(/\D/g, '');
    
    // Ensure the number has exactly 10 digits
    if (numbers.length !== 10 && numbers.length !== 11) {
      throw new Error("Phone number must be 10 digits");
    }

    // If it's 11 digits and starts with 1, use those digits
    // If it's 10 digits, add +1 prefix
    const formattedNumber = numbers.length === 11 && numbers.startsWith('1')
      ? `+${numbers}`
      : `+1${numbers.slice(-10)}`;

    return formattedNumber;
  };

  const handleSendCode = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      // Format phone number before sending
      const formattedPhone = formatPhoneNumber(phone);
      
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
      const formattedPhone = formatPhoneNumber(phone);
      
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
                  placeholder="Phone Number (e.g. 123-456-7890)"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  required
                  className="w-full"
                />
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
