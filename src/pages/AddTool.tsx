import { BottomNav } from "@/components/BottomNav";
import { AddToolForm } from "@/components/tool-form/AddToolForm";

export default function AddTool() {
  return (
    <div className="min-h-screen bg-gray-50">
      <div className="pb-20">
        <header className="bg-white shadow-sm py-4 px-4 sticky top-0 z-10">
          <h1 className="text-xl font-semibold text-center">Add New Item</h1>
        </header>

        <main className="container max-w-md mx-auto px-4 py-6">
          <AddToolForm />
        </main>
      </div>
      <BottomNav />
    </div>
  );
}