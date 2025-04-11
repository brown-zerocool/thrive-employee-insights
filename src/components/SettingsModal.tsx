
import React, { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Settings } from "lucide-react";
import { useNavigate } from "react-router-dom";

interface SettingsModalProps {
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
}

const SettingsModal: React.FC<SettingsModalProps> = ({ open, onOpenChange }) => {
  const [isOpen, setIsOpen] = useState(false);
  const navigate = useNavigate();

  const handleOpenChange = (newOpen: boolean) => {
    setIsOpen(newOpen);
    if (onOpenChange) {
      onOpenChange(newOpen);
    }
  };

  const handleNavigateToSettings = () => {
    handleOpenChange(false);
    navigate("/settings");
  };

  React.useEffect(() => {
    if (open !== undefined) {
      setIsOpen(open);
    }
  }, [open]);

  return (
    <Dialog open={isOpen} onOpenChange={handleOpenChange}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>Settings</DialogTitle>
          <DialogDescription>
            Configure your application settings.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Button
              variant="outline"
              className="h-auto flex flex-col items-center justify-center p-4 space-y-2"
              onClick={handleNavigateToSettings}
            >
              <Settings className="h-8 w-8" />
              <span>Account Settings</span>
            </Button>
            <Button
              variant="outline"
              className="h-auto flex flex-col items-center justify-center p-4 space-y-2"
              onClick={handleNavigateToSettings}
            >
              <Settings className="h-8 w-8" />
              <span>Application Settings</span>
            </Button>
            <Button
              variant="outline"
              className="h-auto flex flex-col items-center justify-center p-4 space-y-2"
              onClick={handleNavigateToSettings}
            >
              <Settings className="h-8 w-8" />
              <span>Notification Settings</span>
            </Button>
            <Button
              variant="outline"
              className="h-auto flex flex-col items-center justify-center p-4 space-y-2"
              onClick={handleNavigateToSettings}
            >
              <Settings className="h-8 w-8" />
              <span>Advanced Settings</span>
            </Button>
          </div>

          <div className="pt-4 flex justify-end">
            <Button variant="outline" onClick={() => handleOpenChange(false)}>
              Close
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default SettingsModal;
