import { useState } from 'react';
import { X, Plus, Tag } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

interface LabelManagerProps {
  value: string[];
  onChange: (labels: string[]) => void;
  label?: string;
  placeholder?: string;
  maxLabels?: number;
}

const PREDEFINED_LABELS = [
  'urgent', 'bug', 'feature', 'enhancement', 'documentation', 
  'testing', 'backend', 'frontend', 'design', 'review'
];

const LABEL_COLORS = [
  'bg-blue-100 text-blue-800 border-blue-200',
  'bg-green-100 text-green-800 border-green-200', 
  'bg-yellow-100 text-yellow-800 border-yellow-200',
  'bg-red-100 text-red-800 border-red-200',
  'bg-purple-100 text-purple-800 border-purple-200',
  'bg-pink-100 text-pink-800 border-pink-200',
  'bg-indigo-100 text-indigo-800 border-indigo-200',
  'bg-gray-100 text-gray-800 border-gray-200'
];

export function LabelManager({ 
  value, 
  onChange, 
  label = "Labels", 
  placeholder = "Add a label...",
  maxLabels = 10 
}: LabelManagerProps) {
  const [inputValue, setInputValue] = useState('');
  const [showSuggestions, setShowSuggestions] = useState(false);

  const getLabelColor = (label: string) => {
    const index = label.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0);
    return LABEL_COLORS[index % LABEL_COLORS.length];
  };

  const addLabel = (labelText: string) => {
    const trimmed = labelText.trim().toLowerCase();
    if (trimmed && !value.includes(trimmed) && value.length < maxLabels) {
      onChange([...value, trimmed]);
      setInputValue('');
      setShowSuggestions(false);
    }
  };

  const removeLabel = (labelToRemove: string) => {
    onChange(value.filter(l => l !== labelToRemove));
  };

  const handleInputKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      addLabel(inputValue);
    } else if (e.key === 'Escape') {
      setShowSuggestions(false);
    }
  };

  const availableSuggestions = PREDEFINED_LABELS
    .filter(label => 
      !value.includes(label) && 
      label.toLowerCase().includes(inputValue.toLowerCase())
    )
    .slice(0, 5);

  return (
    <div className="space-y-2">
      <Label>{label}</Label>
      
      {/* Current Labels */}
      {value.length > 0 && (
        <div className="flex flex-wrap gap-1">
          {value.map((label) => (
            <span
              key={label}
              className={`inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium border ${getLabelColor(label)}`}
            >
              <Tag className="w-3 h-3" />
              {label}
              <X
                className="w-3 h-3 cursor-pointer hover:text-red-600"
                onClick={() => removeLabel(label)}
              />
            </span>
          ))}
        </div>
      )}

      {/* Add New Label */}
      {value.length < maxLabels && (
        <div className="relative">
          <div className="flex gap-2">
            <Input
              value={inputValue}
              onChange={(e) => {
                setInputValue(e.target.value);
                setShowSuggestions(e.target.value.length > 0);
              }}
              onKeyDown={handleInputKeyDown}
              onFocus={() => setShowSuggestions(inputValue.length > 0)}
              placeholder={placeholder}
              className="flex-1"
            />
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => addLabel(inputValue)}
              disabled={!inputValue.trim() || value.includes(inputValue.trim().toLowerCase())}
            >
              <Plus className="w-4 h-4" />
            </Button>
          </div>

          {/* Suggestions */}
          {showSuggestions && availableSuggestions.length > 0 && (
            <div className="absolute z-10 w-full mt-1 bg-background border rounded-md shadow-lg">
              {availableSuggestions.map((suggestion) => (
                <button
                  key={suggestion}
                  type="button"
                  className="w-full px-3 py-2 text-left text-sm hover:bg-muted transition-colors"
                  onClick={() => addLabel(suggestion)}
                >
                  <Tag className="w-3 h-3 inline mr-2" />
                  {suggestion}
                </button>
              ))}
            </div>
          )}
        </div>
      )}

      {value.length >= maxLabels && (
        <p className="text-xs text-muted-foreground">Maximum {maxLabels} labels allowed</p>
      )}
    </div>
  );
}