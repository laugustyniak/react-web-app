// Canvas/components/ColorPicker.tsx
import { useState } from 'react';
import { Button } from '~/components/ui/button';
import { Input } from '~/components/ui/input';
import { Label } from '~/components/ui/label';

interface ColorPickerProps {
  color: string;
  onChange: (color: string) => void;
  label?: string;
}

const PRESET_COLORS = [
  '#000000', '#ffffff', '#ff0000', '#00ff00', '#0000ff',
  '#ffff00', '#ff00ff', '#00ffff', '#ffa500', '#800080',
  '#ffc0cb', '#a52a2a', '#808080', '#008000', '#000080',
  '#ff6b6b', '#4ecdc4', '#45b7d1', '#96ceb4', '#ffeaa7',
  '#dda0dd', '#98d8c8', '#f7dc6f', '#bb8fce', '#85c1e9'
];

export default function ColorPicker({ color, onChange, label = 'Color' }: ColorPickerProps) {
  const [customColor, setCustomColor] = useState(color);

  const handlePresetClick = (presetColor: string) => {
    setCustomColor(presetColor);
    onChange(presetColor);
  };

  const handleCustomColorChange = (newColor: string) => {
    setCustomColor(newColor);
    onChange(newColor);
  };

  return (
    <div className="space-y-3">
      <Label className="text-xs">{label}</Label>
      
      {/* Color input */}
      <div className="flex gap-2">
        <Input
          type="color"
          value={customColor}
          onChange={(e) => handleCustomColorChange(e.target.value)}
          className="h-8 w-16"
        />
        <Input
          type="text"
          value={customColor}
          onChange={(e) => handleCustomColorChange(e.target.value)}
          className="h-8 flex-1"
          placeholder="#000000"
        />
      </div>

      {/* Preset colors */}
      <div>
        <Label className="text-xs text-muted-foreground mb-2 block">Presets</Label>
        <div className="grid grid-cols-5 gap-1">
          {PRESET_COLORS.map((presetColor) => (
            <Button
              key={presetColor}
              variant="outline"
              className={`h-8 w-8 p-0 border-2 ${
                color === presetColor ? 'border-primary' : 'border-border'
              }`}
              style={{ backgroundColor: presetColor }}
              onClick={() => handlePresetClick(presetColor)}
              title={presetColor}
            />
          ))}
        </div>
      </div>
    </div>
  );
}
