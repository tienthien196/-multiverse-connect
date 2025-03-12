
import React, { useRef, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

interface LogEntry {
  id: string;
  timestamp: Date;
  message: string;
  type: 'info' | 'warning' | 'error' | 'success';
}

interface ConnectionLogsProps {
  logs: LogEntry[];
  className?: string;
}

const logTypeStyles = {
  info: 'text-blue-500',
  warning: 'text-yellow-500',
  error: 'text-red-500',
  success: 'text-green-500'
};

const ConnectionLogs: React.FC<ConnectionLogsProps> = ({ logs, className }) => {
  const scrollAreaRef = useRef<HTMLDivElement>(null);
  
  // Auto-scroll to bottom when logs change
  useEffect(() => {
    if (scrollAreaRef.current) {
      const scrollContainer = scrollAreaRef.current.querySelector('[data-radix-scroll-area-viewport]');
      if (scrollContainer) {
        scrollContainer.scrollTop = scrollContainer.scrollHeight;
      }
    }
  }, [logs]);

  const formatTime = (date: Date) => {
    return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' });
  };

  const handleCopyLogs = () => {
    const logText = logs.map(log => `[${formatTime(log.timestamp)}] [${log.type.toUpperCase()}] ${log.message}`).join('\n');
    navigator.clipboard.writeText(logText);
  };

  return (
    <Card className={cn("bg-background/40 backdrop-blur-md border border-border/50 overflow-hidden", className)}>
      <CardHeader className="p-4 pb-3 border-b border-border/50 flex flex-row items-center justify-between">
        <CardTitle className="text-xl font-medium">Connection Logs</CardTitle>
        <Button 
          variant="outline" 
          size="sm" 
          className="bg-transparent hover:bg-godot/10 border-godot/20 text-godot hover:text-godot" 
          onClick={handleCopyLogs}
        >
          Copy Logs
        </Button>
      </CardHeader>
      <CardContent className="p-0">
        <div ref={scrollAreaRef}>
          <ScrollArea className="h-[300px] w-full">
            {logs.length > 0 ? (
              <div className="p-4 font-mono text-sm">
                {logs.map((log) => (
                  <div key={log.id} className="mb-1 last:mb-0">
                    <span className="text-muted-foreground">[{formatTime(log.timestamp)}]</span>{' '}
                    <span className={logTypeStyles[log.type]}>[{log.type.toUpperCase()}]</span>{' '}
                    <span>{log.message}</span>
                  </div>
                ))}
              </div>
            ) : (
              <div className="flex items-center justify-center h-full">
                <p className="text-muted-foreground">No logs available</p>
              </div>
            )}
          </ScrollArea>
        </div>
      </CardContent>
    </Card>
  );
};

export default ConnectionLogs;
