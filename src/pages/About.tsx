
import { BottomNav } from "@/components/BottomNav";

const About = () => {
  return (
    <div className="min-h-screen bg-gray-50 pb-20">
      <main className="container mx-auto px-4 py-6 max-w-md">
        <h1 className="text-2xl font-semibold mb-6">About the Lending Library</h1>
        
        <div className="space-y-6 text-gray-600">
          <p>
            Welcome to our community Lending Library! This platform enables neighbors to share items
            with each other, reducing waste and building community connections.
          </p>
          
          <section className="space-y-2">
            <h2 className="text-lg font-medium text-gray-900">How it works</h2>
            <ul className="list-disc pl-5 space-y-2">
              <li>Browse available items in the library</li>
              <li>Request to borrow items from your neighbors</li>
              <li>Add your own items to share with the community</li>
              <li>Keep track of your borrowed and shared items</li>
            </ul>
          </section>

          <section className="space-y-2">
            <h2 className="text-lg font-medium text-gray-900">Community Guidelines</h2>
            <ul className="list-disc pl-5 space-y-2">
              <li>Treat borrowed items with care</li>
              <li>Return items on time</li>
              <li>Communicate clearly with other members</li>
              <li>Report any issues or damages promptly</li>
            </ul>
          </section>

          <section className="mt-8 pt-6 border-t border-gray-200">
            <p className="text-gray-600">
              This app created by your neighbor, Jon Hillis. If you have questions, comments, bug reports, or feedback, email me at: hillis.jd@gmail.com. Thanks! : )
            </p>
          </section>
        </div>
      </main>
      <BottomNav />
    </div>
  );
};

export default About;
