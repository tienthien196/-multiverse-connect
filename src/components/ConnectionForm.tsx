
import React, { useState } from 'react';
import { toast } from "sonner";
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import ServerStatusIndicator from './ServerStatusIndicator';
import socketService from '@/services/socketService';

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
  const [port, setPort] = useState('3001');
  const [username, setUsername] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleConnect = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!host.trim()) {
      toast.error("Host không được để trống");
      return;
    }
    
    const portNumber = parseInt(port, 10);
    if (isNaN(portNumber) || portNumber < 1 || portNumber > 65535) {
      toast.error("Port phải là số từ 1 đến 65535");
      return;
    }
    
    if (!username.trim()) {
      toast.error("Tên người dùng không được để trống");
      return;
    }
    
    setIsLoading(true);
    
    try {
      await socketService.connect(host, portNumber, username);
      onConnect(host, portNumber, username);
      toast.success("Kết nối thành công!");
    } catch (error) {
      console.error('Connection error:', error);
      toast.error("Không thể kết nối đến máy chủ");
    } finally {
      setIsLoading(false);
    }
  };

  const handleDisconnect = () => {
    setIsLoading(true);
    
    try {
      socketService.disconnect();
      onDisconnect();
    } catch (error) {
      console.error('Disconnect error:', error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <form onSubmit={handleConnect} className="space-y-6 w-full max-w-md mx-auto">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-medium">Kết nối máy chủ</h2>
        <ServerStatusIndicator status={status} />
      </div>
      
      <div className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="host" className="text-sm font-medium">Host</Label>
          <Input
            id="host"
            placeholder="Nhập host máy chủ"
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
            placeholder="Nhập port máy chủ"
            value={port}
            onChange={(e) => setPort(e.target.value)}
            className="bg-background/50 backdrop-blur-sm border border-border/50 focus:border-godot/50 transition-all"
            disabled={status === 'online' || status === 'connecting' || isLoading}
          />
        </div>
        
        <div className="space-y-2">
          <Label htmlFor="username" className="text-sm font-medium">Tên người dùng</Label>
          <Input
            id="username"
            placeholder="Nhập tên người dùng của bạn"
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
            'Kết nối'
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
            'Ngắt kết nối'
          )}
        </Button>
      )}
    </form>
  );
};

export default ConnectionForm;
