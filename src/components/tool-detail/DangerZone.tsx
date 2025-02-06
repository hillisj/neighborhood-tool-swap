import { DeleteToolDialog } from "./DeleteToolDialog";

interface DangerZoneProps {
  onDelete: () => void;
}

export const DangerZone = ({ onDelete }: DangerZoneProps) => {
  return (
    <div className="p-6 border-t bg-red-50">
      <DeleteToolDialog onDelete={onDelete} />
    </div>
  );
};