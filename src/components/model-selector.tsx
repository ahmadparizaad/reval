"use client";

import { Check, ChevronDown } from "lucide-react";
import { Button } from "@/components/ui/button";
import { DropdownMenu, DropdownMenuTrigger, DropdownMenuContent, DropdownMenuItem } from "@/components/ui/dropdown-menu";

const availableModels = [
  { id: "gpt-4o-mini", name: "GPT-4" },
  { id: "meta-llama/llama-3.3-70b-instruct:free", name: "LLAMA" },
  { id: "gemini-1.5-flash", name: "Gemini-1.5-flash" },
];

interface ModelSelectorProps {
  selectedModels: string[];
  onSelectModels: (models: string[]) => void;
}

export function ModelSelector({ selectedModels, onSelectModels }: ModelSelectorProps) {
  const toggleModel = (modelId: string) => {
    if (selectedModels.includes(modelId)) {
      onSelectModels(selectedModels.filter((id) => id !== modelId));
    } else {
      onSelectModels([...selectedModels, modelId]);
    }
  };

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="outline" className="ml-4 flex items-center rounded-full shadow-xl border border-gray-300">
          {selectedModels.length > 0 ? selectedModels.map(id => availableModels.find(m => m.id === id)?.name).join(", ") : "Select Model"}
          <ChevronDown className="ml-2 h-4 w-4" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent className="w-40">
        {availableModels.map((model) => {
          const isSelected = selectedModels.includes(model.id);
          return (
            <DropdownMenuItem key={model.id} onClick={() => toggleModel(model.id)} className="flex items-center">
              <Check className={`mr-2 h-4 w-4 ${isSelected ? "opacity-100" : "opacity-0"}`} />
              {model.name}
            </DropdownMenuItem>
          );
        })}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
