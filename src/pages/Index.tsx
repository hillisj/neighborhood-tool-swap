
import { ToolCard } from "@/components/ToolCard";
import { BottomNav } from "@/components/BottomNav";

// Mock data for demonstration
const tools = [
  {
    id: "1",
    name: "Power Drill",
    description: "Cordless 20V MAX power drill, perfect for home projects",
    imageUrl: "/placeholder.svg",
    owner: "John Doe",
    isAvailable: true,
  },
  {
    id: "2",
    name: "Lawn Mower",
    description: "Self-propelled gas lawn mower, 21-inch cutting deck",
    imageUrl: "/placeholder.svg",
    owner: "Jane Smith",
    isAvailable: false,
  },
];

const Index = () => {
  return (
    <div className="min-h-screen bg-gray-50 pb-20">
      <header className="bg-white shadow-sm py-4 px-4 sticky top-0 z-10">
        <h1 className="text-xl font-semibold text-center">Tool Library</h1>
      </header>
      <main className="container max-w-md mx-auto px-4 py-6">
        <div className="grid gap-6">
          {tools.map((tool) => (
            <ToolCard
              key={tool.id}
              {...tool}
              onRequestCheckout={() => console.log(`Requesting checkout for tool ${tool.id}`)}
            />
          ))}
        </div>
      </main>
      <BottomNav />
    </div>
  );
};

export default Index;
