import { useState } from 'react';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { Textarea } from '@/components/ui/textarea';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Copy, FileText, Download, Check } from 'lucide-react';

interface AIPrdExportModalProps {
  boardId: number;
  boardName: string;
}

interface ExportData {
  json: string;
  prompt: string;
}

export function AIPrdExportModal({ boardId, boardName }: AIPrdExportModalProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [exportData, setExportData] = useState<ExportData | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [copiedPrompt, setCopiedPrompt] = useState(false);
  const [copiedJson, setCopiedJson] = useState(false);

  const handleExport = async () => {
    setLoading(true);
    setError(null);
    
    try {
      const response = await fetch(`http://localhost:5090/api/aiprdexport/${boardId}/export`);
      if (!response.ok) {
        throw new Error('Failed to export board data');
      }
      
      const data = await response.json();
      setExportData(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
    } finally {
      setLoading(false);
    }
  };

  const copyToClipboard = async (text: string, type: 'prompt' | 'json') => {
    try {
      await navigator.clipboard.writeText(text);
      
      // Set copied state with animation
      if (type === 'prompt') {
        setCopiedPrompt(true);
        setTimeout(() => setCopiedPrompt(false), 2000);
      } else {
        setCopiedJson(true);
        setTimeout(() => setCopiedJson(false), 2000);
      }
    } catch (err) {
      console.error('Failed to copy to clipboard:', err);
    }
  };

  const downloadAsFile = (content: string, filename: string) => {
    const blob = new Blob([content], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = filename;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button 
          variant="outline" 
          size="sm" 
          onClick={() => setIsOpen(true)}
          className="transition-colors"
          style={{
            // Ensure outline buttons respect theme tokens
            borderColor: 'hsl(var(--border))',
            color: 'hsl(var(--foreground))',
          }}
        >
          <FileText className="w-4 h-4 mr-2" />
          AI PRD Export
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-4xl max-h-[80vh]">
        <DialogHeader>
          <DialogTitle>AI PRD Export - {boardName}</DialogTitle>
        </DialogHeader>
        
        {!exportData ? (
          <div className="flex flex-col items-center justify-center py-8 space-y-4">
            <FileText className="w-12 h-12 text-muted-foreground" />
            <p className="text-center text-muted-foreground">
              Export your board data as JSON and generate an AI-ready PRD prompt
            </p>
            <Button onClick={handleExport} disabled={loading} className="min-w-[160px]" style={{ backgroundColor: 'hsl(var(--secondary))', color: 'hsl(var(--secondary-foreground))' }}>
              {loading ? 'Exporting...' : 'Generate Export'}
            </Button>
            {error && (
              <p className="text-sm text-destructive">{error}</p>
            )}
          </div>
        ) : (
          <Tabs defaultValue="prompt" className="w-full">
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="prompt">AI Prompt</TabsTrigger>
              <TabsTrigger value="json">JSON Data</TabsTrigger>
            </TabsList>
            
            <TabsContent value="prompt" className="space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-medium">AI PRD Generation Prompt</h3>
                <div className="flex space-x-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => copyToClipboard(exportData.prompt, 'prompt')}
                    className={`transition-all duration-200 ${
                      copiedPrompt ? 'bg-green-50 border-green-200 text-green-700' : ''
                    }`}
                  >
                    {copiedPrompt ? (
                      <>
                        <Check className="w-4 h-4 mr-2 animate-pulse" />
                        Copied!
                      </>
                    ) : (
                      <>
                        <Copy className="w-4 h-4 mr-2" />
                        Copy
                      </>
                    )}
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => downloadAsFile(exportData.prompt, `${boardName}-prd-prompt.txt`)}
                  >
                    <Download className="w-4 h-4 mr-2" />
                    Download
                  </Button>
                </div>
              </div>
              <Textarea
                value={exportData.prompt}
                readOnly
                className="min-h-[400px] font-mono text-sm"
              />
            </TabsContent>
            
            <TabsContent value="json" className="space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-medium">Board JSON Data</h3>
                <div className="flex space-x-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => copyToClipboard(exportData.json, 'json')}
                    className={`transition-all duration-200 ${
                      copiedJson ? 'bg-green-50 border-green-200 text-green-700' : ''
                    }`}
                  >
                    {copiedJson ? (
                      <>
                        <Check className="w-4 h-4 mr-2 animate-pulse" />
                        Copied!
                      </>
                    ) : (
                      <>
                        <Copy className="w-4 h-4 mr-2" />
                        Copy
                      </>
                    )}
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => downloadAsFile(exportData.json, `${boardName}-data.json`)}
                  >
                    <Download className="w-4 h-4 mr-2" />
                    Download
                  </Button>
                </div>
              </div>
              <Textarea
                value={exportData.json}
                readOnly
                className="min-h-[400px] font-mono text-sm"
              />
            </TabsContent>
          </Tabs>
        )}
      </DialogContent>
    </Dialog>
  );
}