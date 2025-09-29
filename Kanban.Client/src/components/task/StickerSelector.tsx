import { useState } from 'react';
import { X, Smile } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';

interface StickerSelectorProps {
  value: string[];
  onChange: (stickers: string[]) => void;
  label?: string;
  maxStickers?: number;
}

const EMOJI_CATEGORIES = {
  'Faces': ['😀', '😃', '😄', '😁', '😆', '😅', '😂', '🤣', '😊', '😇', '🙂', '🙃', '😉', '😌', '😍', '🥰', '😘', '😗', '😙', '😚', '😋', '😛', '😝', '😜', '🤪', '🤨', '🧐', '🤓', '😎', '🤩', '🥳'],
  'Activity': ['⚽', '🏀', '🏈', '⚾', '🥎', '🎾', '🏐', '🏉', '🥏', '🎱', '🪀', '🏓', '🏸', '🏒', '🏑', '🥍', '🏏', '🪃', '🥅', '⛳', '🪁', '🏹', '🎣', '🤿', '🥊', '🥋'],
  'Objects': ['⌚', '📱', '📲', '💻', '⌨️', '🖥️', '🖨️', '🖱️', '🖲️', '🕹️', '🗜️', '💽', '💾', '💿', '📀', '📼', '📷', '📸', '📹', '🎥', '📽️', '🎞️', '📞', '☎️', '📟', '📠'],
  'Symbols': ['❤️', '🧡', '💛', '💚', '💙', '💜', '🖤', '🤍', '🤎', '💔', '❣️', '💕', '💞', '💓', '💗', '💖', '💘', '💝', '💟', '☮️', '✝️', '☪️', '🕉️', '☸️', '✡️', '🔯', '🕎', '☯️', '☦️'],
  'Nature': ['🐶', '🐱', '🐭', '🐹', '🐰', '🦊', '🐻', '🐼', '🐻‍❄️', '🐨', '🐯', '🦁', '🐮', '🐷', '🐽', '🐸', '🐵', '🙈', '🙉', '🙊', '🐒', '🐔', '🐧', '🐦', '🐤', '🐣', '🐥', '🦆', '🦅', '🦉'],
  'Food': ['🍎', '🍊', '🍋', '🍌', '🍉', '🍇', '🍓', '🫐', '🍈', '🍒', '🍑', '🥭', '🍍', '🥥', '🥝', '🍅', '🍆', '🥑', '🥦', '🥬', '🥒', '🌶️', '🫑', '🌽', '🥕', '🫒', '🧄', '🧅', '🥔', '🍠']
};

export function StickerSelector({ 
  value, 
  onChange, 
  label = "Stickers", 
  maxStickers = 10 
}: StickerSelectorProps) {
  const [customEmoji, setCustomEmoji] = useState('');
  const [activeCategory, setActiveCategory] = useState<keyof typeof EMOJI_CATEGORIES>('Faces');

  const addSticker = (emoji: string) => {
    if (!value.includes(emoji) && value.length < maxStickers) {
      onChange([...value, emoji]);
    }
  };

  const removeSticker = (emoji: string) => {
    onChange(value.filter(s => s !== emoji));
  };

  const addCustomEmoji = () => {
    const trimmed = customEmoji.trim();
    if (trimmed && !value.includes(trimmed) && value.length < maxStickers) {
      onChange([...value, trimmed]);
      setCustomEmoji('');
    }
  };

  const handleCustomEmojiKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      addCustomEmoji();
    }
  };

  return (
    <div className="space-y-2">
      <Label>{label}</Label>
      
      {/* Current Stickers */}
      {value.length > 0 && (
        <div className="flex flex-wrap gap-1">
          {value.map((sticker, index) => (
            <span
              key={index}
              className="inline-flex items-center gap-1 px-2 py-1 bg-muted rounded-full text-sm border"
            >
              <span className="text-lg">{sticker}</span>
              <X
                className="w-3 h-3 cursor-pointer hover:text-destructive"
                onClick={() => removeSticker(sticker)}
              />
            </span>
          ))}
        </div>
      )}

      {/* Add Stickers */}
      {value.length < maxStickers && (
        <div className="space-y-2">
          {/* Custom Emoji Input */}
          <div className="flex gap-2">
            <Input
              value={customEmoji}
              onChange={(e) => setCustomEmoji(e.target.value)}
              onKeyDown={handleCustomEmojiKeyDown}
              placeholder="Type or paste emoji..."
              className="flex-1"
            />
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={addCustomEmoji}
              disabled={!customEmoji.trim() || value.includes(customEmoji.trim())}
            >
              Add
            </Button>
          </div>

          {/* Emoji Picker Popover */}
          <Popover>
            <PopoverTrigger asChild>
              <Button variant="outline" size="sm" className="w-full">
                <Smile className="w-4 h-4 mr-2" />
                Choose from picker
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-80 p-0 bg-background/95 backdrop-blur-md border shadow-lg" align="start">
              <div className="p-4">
                {/* Category Tabs */}
                <div className="flex flex-wrap gap-1 mb-3 border-b pb-2">
                  {(Object.keys(EMOJI_CATEGORIES) as Array<keyof typeof EMOJI_CATEGORIES>).map((category) => (
                    <button
                      key={category}
                      type="button"
                      onClick={() => setActiveCategory(category)}
                      className={`px-2 py-1 text-xs rounded transition-colors ${
                        activeCategory === category 
                          ? 'bg-primary text-primary-foreground' 
                          : 'hover:bg-muted'
                      }`}
                    >
                      {category}
                    </button>
                  ))}
                </div>

                {/* Emoji Grid */}
                <div className="grid grid-cols-8 gap-1 max-h-48 overflow-y-auto">
                  {EMOJI_CATEGORIES[activeCategory].map((emoji, index) => (
                    <button
                      key={index}
                      type="button"
                      onClick={() => addSticker(emoji)}
                      disabled={value.includes(emoji)}
                      className={`p-2 text-lg hover:bg-muted rounded transition-colors ${
                        value.includes(emoji) ? 'opacity-50 cursor-not-allowed' : ''
                      }`}
                      title={emoji}
                    >
                      {emoji}
                    </button>
                  ))}
                </div>
              </div>
            </PopoverContent>
          </Popover>
        </div>
      )}

      {value.length >= maxStickers && (
        <p className="text-xs text-muted-foreground">Maximum {maxStickers} stickers allowed</p>
      )}
    </div>
  );
}