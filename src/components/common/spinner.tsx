import { Loader2 } from "lucide-react";

const Spinner = () => {
  return (
    <div className="flex justify-center">
      <Loader2 className="h-12 w-12 animate-spin" />
    </div>
  );
};

export default Spinner;
