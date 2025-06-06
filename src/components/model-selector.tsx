"use client";

import { useState, useRef, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Check, ChevronDown } from 'lucide-react';

interface ModelSelectorProps {
  selectedModels: string[];
  onSelectModels: (models: string[]) => void;
}

const AVAILABLE_MODELS = [
  { id: 'ChatGPT', label: 'ChatGPT', icon: '/openai.svg' },
  { id: 'Gemini', label: 'Gemini', icon: '/gemini.svg' },
  { id: 'Llama', label: 'Llama', icon: '/llama.svg' },
];

export function ModelSelector({ selectedModels, onSelectModels }: ModelSelectorProps) {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Click outside detection
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isOpen]);

  // Optional: Close on Escape key
  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        setIsOpen(false);
      }
    };

    if (isOpen) {
      document.addEventListener('keydown', handleKeyDown);
    }

    return () => {
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, [isOpen]);

  const toggleModel = (modelId: string) => {
    const newSelectedModels = selectedModels.includes(modelId)
      ? selectedModels.filter(id => id !== modelId)
      : [...selectedModels, modelId];
    
    onSelectModels(newSelectedModels);
    // Don't close the dropdown when selecting/deselecting models
  };

  const toggleDropdown = () => {
    setIsOpen(!isOpen);
  };

  return (
    <div className="relative ml-4" ref={dropdownRef}>
      <Button
        onClick={toggleDropdown}
        variant="outline"
        className="h-12 px-4 bg-white dark:bg-gray-800 rounded-full border-gray-300 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700"
      >
        <span className="mr-2">
          {selectedModels.length === 0 
            ? 'Select Models' 
            : `${selectedModels.length} model${selectedModels.length > 1 ? 's' : ''} selected`
          }
        </span>
        <ChevronDown className={`h-4 w-4 transition-transform ${isOpen ? 'rotate-180' : ''}`} />
      </Button>

      {isOpen && (
        <div className="absolute right-0 bottom-full mb-2 w-64 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-700 rounded-lg shadow-lg z-50">
          <div className="p-2">
            <div className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2 px-2">
              Select AI Models
            </div>
            {AVAILABLE_MODELS.map((model) => (
              <div
                key={model.id}
                onClick={() => toggleModel(model.id)}
                className="flex items-center justify-between p-2 rounded-md hover:bg-gray-100 dark:hover:bg-gray-700 cursor-pointer transition-colors"
              >
                <div className="flex items-center space-x-3">
                  <img 
                    src={model.icon} 
                    alt={`${model.label} icon`} 
                    className="w-5 h-5"
                  />
                  <span className="text-sm text-gray-700 dark:text-gray-300">
                    {model.label}
                  </span>
                </div>
                {selectedModels.includes(model.id) && (
                  <Check className="h-4 w-4 text-blue-600 dark:text-blue-400" />
                )}
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
