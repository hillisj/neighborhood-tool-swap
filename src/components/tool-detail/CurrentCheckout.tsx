import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Tables } from "@/integrations/supabase/types";

interface CurrentCheckoutProps {
  checkout: Tables<"tool_requests"> & {
    profiles: {
      username: string | null;
      email: string | null;
      avatar_url: string | null;
    } | null;
  };
  onMarkReturned: () => void;
}

export const CurrentCheckout = ({ checkout, onMarkReturned }: CurrentCheckoutProps) => {
  return (
    <div className="p-6 border-t">
      <h2 className="text-lg font-semibold mb-4">Currently Checked Out</h2>
      <Card className="p-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Avatar>
              <AvatarImage src={checkout.profiles?.avatar_url || undefined} />
              <AvatarFallback>
                {checkout.profiles?.username?.[0]?.toUpperCase() ||
                  checkout.profiles?.email?.[0]?.toUpperCase() ||
                  'U'}
              </AvatarFallback>
            </Avatar>
            <div>
              <p className="font-medium">
                {checkout.profiles?.username ||
                  checkout.profiles?.email?.split('@')[0] ||
                  'Anonymous'}
              </p>
              {checkout.due_date && (
                <p className="text-sm text-gray-500">
                  Due: {new Date(checkout.due_date).toLocaleDateString()}
                </p>
              )}
            </div>
          </div>
          <Button onClick={onMarkReturned} variant="secondary" size="sm">
            Mark as Returned
          </Button>
        </div>
      </Card>
    </div>
  );
};