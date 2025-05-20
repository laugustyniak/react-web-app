// Canvas/components/PromptInputs.tsx
import { Button } from '~/components/ui/button';

interface PromptInputsProps {
  prompt: string;
  setPrompt: (prompt: string) => void;
  negativePrompt: string;
  setNegativePrompt: (prompt: string) => void;
  resetPrompt: () => void;
  resetNegativePrompt: () => void;
}

export default function PromptInputs({
  prompt,
  setPrompt,
  negativePrompt,
  setNegativePrompt,
  resetPrompt,
  resetNegativePrompt
}: PromptInputsProps) {
  return (
    <div className="w-full max-w-4xl space-y-4 mb-6 px-4">
      <div className="space-y-2">
        <div className="flex justify-between items-center">
          <label htmlFor="prompt" className="text-sm font-medium">
            Generation Prompt
          </label>
          <Button 
            variant="ghost" 
            size="sm" 
            onClick={resetPrompt}
            className="text-xs"
          >
            Reset to Default
          </Button>
        </div>
        <textarea
          id="prompt"
          value={prompt}
          onChange={(e) => setPrompt(e.target.value)}
          className="w-full p-3 border rounded-md min-h-[100px] bg-white dark:bg-gray-800 text-sm"
          placeholder="Describe how you want the generated image to look..."
        />
        <p className="text-xs text-gray-500">
          Describe the style, setting, lighting, and mood you want for your generated image.
        </p>
      </div>
      
      <div className="space-y-2">
        <div className="flex justify-between items-center">
          <label htmlFor="negativePrompt" className="text-sm font-medium">
            Negative Prompt (things to avoid)
          </label>
          <Button 
            variant="ghost" 
            size="sm" 
            onClick={resetNegativePrompt}
            className="text-xs"
          >
            Reset to Default
          </Button>
        </div>
        <textarea
          id="negativePrompt"
          value={negativePrompt}
          onChange={(e) => setNegativePrompt(e.target.value)}
          className="w-full p-3 border rounded-md min-h-[80px] bg-white dark:bg-gray-800 text-sm"
          placeholder="Describe elements to avoid in the generated image..."
        />
        <p className="text-xs text-gray-500">
          List unwanted elements or styles that should be avoided in the generated image.
        </p>
      </div>
    </div>
  );
}
