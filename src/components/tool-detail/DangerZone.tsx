import { DeleteToolDialog } from "./DeleteToolDialog";

interface DangerZoneProps {
  onDelete: () => void;
  toolId: string;
}

export const DangerZone = ({ onDelete, toolId }: DangerZoneProps) => {
  return (
    <div className="p-6 border-t bg-red-50">
      <h2 className="text-lg font-semibold mb-4 text-red-700">Danger Zone</h2>
      <DeleteToolDialog onDelete={onDelete} />
    </div>
  );
};