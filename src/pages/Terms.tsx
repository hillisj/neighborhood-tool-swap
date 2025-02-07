
import { BottomNav } from "@/components/BottomNav";

const Terms = () => {
  return (
    <div className="min-h-screen bg-gray-50 pb-20">
      <main className="container mx-auto px-4 py-6 max-w-2xl">
        <h1 className="text-2xl font-semibold mb-8">Terms of Service & Privacy Policy</h1>
        
        <section className="space-y-6 mb-12">
          <h2 className="text-xl font-semibold">Terms of Service</h2>
          
          <ol className="list-decimal pl-5 space-y-4">
            <li>Users will receive confirmation codes and notifications through SMS.</li>
            
            <li>You can cancel the SMS service at any time. Just text "STOP" to the short code. After you send the SMS message "STOP" to us, we will send you an SMS message to confirm that you have been unsubscribed. After this, you will no longer receive SMS messages from us. If you want to join again, just sign up as you did the first time and we will start sending SMS messages to you again.</li>
            
            <li>If you are experiencing issues with the messaging program you can reply with the keyword HELP for more assistance, or you can get help directly at hillis.jd@gmail.com.</li>
            
            <li>Carriers are not liable for delayed or undelivered messages</li>
            
            <li>As always, message and data rates may apply for any messages sent to you from us and to us from you. If you have any questions about your text plan or data plan, it is best to contact your wireless provider.</li>
            
            <li>If you have any questions regarding privacy, please read our privacy policy below.</li>
          </ol>
        </section>

        <section className="space-y-6">
          <h2 className="text-xl font-semibold">Privacy Policy</h2>
          
          <div className="space-y-6">
            <div>
              <h3 className="font-medium mb-2">1. Information We Collect</h3>
              <ul className="list-disc pl-5 space-y-2">
                <li>Phone Number: Used for login and account verification.</li>
                <li>Usage Data: We may collect limited analytics to improve the App.</li>
              </ul>
            </div>

            <div>
              <h3 className="font-medium mb-2">2. How We Use Your Information</h3>
              <ul className="list-disc pl-5 space-y-2">
                <li>To log you in securely.</li>
                <li>To prevent fraud and unauthorized access.</li>
                <li>To improve App performance.</li>
              </ul>
            </div>

            <div>
              <h3 className="font-medium mb-2">3. How We Protect Your Data</h3>
              <p>We use encryption and security measures to keep your data safe.</p>
            </div>

            <div>
              <h3 className="font-medium mb-2">4. No Selling of Data</h3>
              <p>We do not sell, share, or rent your phone number or data to third parties.</p>
            </div>

            <div>
              <h3 className="font-medium mb-2">5. SMS Communication</h3>
              <p>We may send login codes and security alerts via SMS. You will not receive marketing messages.</p>
            </div>

            <div>
              <h3 className="font-medium mb-2">6. Your Choices</h3>
              <p>You can stop using the App at any time. To delete your data, contact us at [Your Contact Email].</p>
            </div>

            <div>
              <h3 className="font-medium mb-2">7. Changes to this Policy</h3>
              <p>We may update this Privacy Policy. Continued use of the App means you accept any changes.</p>
            </div>

            <div>
              <h3 className="font-medium mb-2">8. Contact Us</h3>
              <p>For privacy questions, email us at hillis.jd@gmail.com.</p>
            </div>
          </div>
        </section>
      </main>
      <BottomNav />
    </div>
  );
};

export default Terms;
