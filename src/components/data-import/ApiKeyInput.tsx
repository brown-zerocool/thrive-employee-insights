
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";

interface ApiKeyInputProps {
  apiKey: string;
  setApiKey: (value: string) => void;
}

const ApiKeyInput = ({ apiKey, setApiKey }: ApiKeyInputProps) => {
  return (
    <div className="space-y-2 mb-4">
      <Label htmlFor="api-key" className="text-sm font-medium">
        OpenAI API Key for Data Analysis
      </Label>
      <Input
        id="api-key"
        type="password"
        value={apiKey}
        onChange={(e) => setApiKey(e.target.value)}
        placeholder="sk-..."
        className="font-mono text-sm"
      />
      <p className="text-xs text-muted-foreground">
        Required to generate insights and predictions from your data.{" "}
        <a 
          href="https://platform.openai.com/api-keys" 
          target="_blank" 
          rel="noopener" 
          className="text-blue-500 hover:underline"
        >
          Get your API key
        </a>
      </p>
    </div>
  );
};

export default ApiKeyInput;
