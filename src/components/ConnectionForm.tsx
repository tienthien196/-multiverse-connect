
import React, { useState } from 'react';
import { toast } from "sonner";
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import ServerStatusIndicator from './ServerStatusIndicator';

interface ConnectionFormProps {
  onConnect: (host: string, port: number, username: string) => void;
  onDisconnect: () => void;
  status: 'online' | 'offline' | 'connecting';
}

const ConnectionForm: React.FC<ConnectionFormProps> = ({ 
  onConnect, 
  onDisconnect,
  status
}) => {
  const [host, setHost] = useState('127.0.0.1');
  const [port, setPort] = useState('443');
  const [username, setUsername] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleConnect = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!host.trim()) {
      toast.error("Host cannot be empty");
      return;
    }
    
    const portNumber = parseInt(port, 10);
    if (isNaN(portNumber) || portNumber < 1 || portNumber > 65535) {
      toast.error("Port must be a number between 1 and 65535");
      return;
    }
    
    if (!username.trim()) {
      toast.error("Username cannot be empty");
      return;
    }
    
    setIsLoading(true);
    
    // Simulate a connection delay
    setTimeout(() => {
      onConnect(host, portNumber, username);
      setIsLoading(false);
    }, 1500);
  };

  const handleDisconnect = () => {
    setIsLoading(true);
    
    // Simulate a disconnection delay
    setTimeout(() => {
      onDisconnect();
      setIsLoading(false);
    }, 800);
  };

  return (
    <form onSubmit={handleConnect} className="space-y-6 w-full max-w-md mx-auto">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-medium">Server Connection</h2>
        <ServerStatusIndicator status={status} />
      </div>
      
      <div className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="host" className="text-sm font-medium">Host</Label>
          <Input
            id="host"
            placeholder="Enter server host"
            value={host}
            onChange={(e) => setHost(e.target.value)}
            className="bg-background/50 backdrop-blur-sm border border-border/50 focus:border-godot/50 transition-all"
            disabled={status === 'online' || status === 'connecting' || isLoading}
          />
        </div>
        
        <div className="space-y-2">
          <Label htmlFor="port" className="text-sm font-medium">Port</Label>
          <Input
            id="port"
            placeholder="Enter server port"
            value={port}
            onChange={(e) => setPort(e.target.value)}
            className="bg-background/50 backdrop-blur-sm border border-border/50 focus:border-godot/50 transition-all"
            disabled={status === 'online' || status === 'connecting' || isLoading}
          />
        </div>
        
        <div className="space-y-2">
          <Label htmlFor="username" className="text-sm font-medium">Username</Label>
          <Input
            id="username"
            placeholder="Enter your username"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            className="bg-background/50 backdrop-blur-sm border border-border/50 focus:border-godot/50 transition-all"
            disabled={status === 'online' || status === 'connecting' || isLoading}
          />
        </div>
      </div>
      
      {status === 'offline' ? (
        <Button 
          type="submit" 
          className="w-full bg-godot hover:bg-godot-light flex items-center justify-center h-11"
          disabled={isLoading}
        >
          {isLoading ? (
            <div className="flex items-center space-x-2">
              <div className="loading-dot h-2 w-2 rounded-full bg-white"></div>
              <div className="loading-dot h-2 w-2 rounded-full bg-white"></div>
              <div className="loading-dot h-2 w-2 rounded-full bg-white"></div>
            </div>
          ) : (
            'Connect'
          )}
        </Button>
      ) : (
        <Button 
          type="button" 
          className="w-full bg-destructive hover:bg-destructive/80 flex items-center justify-center h-11"
          onClick={handleDisconnect}
          disabled={status === 'connecting' || isLoading}
        >
          {isLoading ? (
            <div className="flex items-center space-x-2">
              <div className="loading-dot h-2 w-2 rounded-full bg-white"></div>
              <div className="loading-dot h-2 w-2 rounded-full bg-white"></div>
              <div className="loading-dot h-2 w-2 rounded-full bg-white"></div>
            </div>
          ) : (
            'Disconnect'
          )}
        </Button>
      )}
    </form>
  );
};

export default ConnectionForm;
