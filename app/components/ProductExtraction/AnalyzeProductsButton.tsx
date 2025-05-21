import React from 'react';
import { Button } from "~/components/ui/button";

interface AnalyzeProductsButtonProps {
  isAnalyzing: boolean;
  onAnalyze: () => void;
  disabled?: boolean;
}

const AnalyzeProductsButton: React.FC<AnalyzeProductsButtonProps> = ({ isAnalyzing, onAnalyze, disabled }) => (
  <Button
    variant="default"
    onClick={onAnalyze}
    disabled={disabled || isAnalyzing}
    className={isAnalyzing ? 'animate-spin' : ''}
  >
    {isAnalyzing ? 'Analyzing...' : 'Analyze and Find Products'}
  </Button>
);

export default AnalyzeProductsButton;
