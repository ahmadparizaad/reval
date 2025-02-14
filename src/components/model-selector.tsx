"use client";

import { Check } from 'lucide-react';
import { Button } from '@/components/ui/button';

const availableModels = [
  { id: 'gpt-4o-mini', name: 'GPT-4' },
  { id: 'claude-2', name: 'Claude 2' },
  { id: 'gemini-1.5-flash', name: 'Gemini-1.5-flash' },
  { id: 'palm', name: 'PaLM' },
];

interface ModelSelectorProps {
  selectedModels: string[];
  onSelectModels: (models: string[]) => void;
}

export function ModelSelector({ selectedModels, onSelectModels }: ModelSelectorProps) {
  const toggleModel = (modelId: string) => {
    if (selectedModels.includes(modelId)) {
      onSelectModels(selectedModels.filter(id => id !== modelId));
    } else {
      onSelectModels([...selectedModels, modelId]);
    }
  };

  return (
    <div className="space-y-4">
      <h3 className="text-sm font-medium">Select Models to Compare</h3>
      <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
        {availableModels.map((model) => {
          const isSelected = selectedModels.includes(model.id);
          return (
            <Button
              key={model.id}
              variant={isSelected ? "default" : "outline"}
              className="justify-start border border-gray-400"
              onClick={() => toggleModel(model.id)}
            >
              <Check
                className={`mr-2 h-4 w-4 ${
                  isSelected ? "opacity-100" : "opacity-0"
                }`}
              />
              {model.name}
            </Button>
          );
        })}
      </div>
    </div>
  );
}