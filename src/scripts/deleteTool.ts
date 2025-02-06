import { supabase } from "@/integrations/supabase/client";

const deleteTool = async () => {
  const { data, error } = await supabase
    .from('tools')
    .delete()
    .eq('name', 'DEAD');

  if (error) {
    console.error('Error deleting tool:', error);
  } else {
    console.log('Tool deleted successfully:', data);
  }
};

deleteTool();