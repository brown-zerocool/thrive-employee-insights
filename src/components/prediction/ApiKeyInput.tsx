
import { AlertTriangle } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

interface ApiKeyInputProps {
  apiKey: string;
  onChange: (value: string) => void;
}

export const ApiKeyInput = ({ apiKey, onChange }: ApiKeyInputProps) => {
  return (
    <div className="space-y-2 mb-4 p-4 bg-gray-50 rounded-lg border border-gray-200">
      <Label htmlFor="api-key" className="text-sm font-medium flex items-center gap-1">
        <AlertTriangle className="h-4 w-4 text-amber-500" />
        OpenAI API Key Required
      </Label>
      <Input
        id="api-key"
        type="password"
        value={apiKey}
        onChange={(e) => onChange(e.target.value)}
        placeholder="sk-..."
        className="font-mono text-sm"
      />
      <p className="text-xs text-gray-500 mt-1">
        Your API key is used only for this session and is not stored.{" "}
        <a href="https://platform.openai.com/api-keys" target="_blank" rel="noopener" className="text-blue-500 hover:underline">
          Get your API key here
        </a>
      </p>
    </div>
  );
};
