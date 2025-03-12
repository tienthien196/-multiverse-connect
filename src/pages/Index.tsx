
import React, { useState, useEffect } from 'react';
import { toast } from "sonner";
import GodotLogo from '@/components/GodotLogo';
import ConnectionForm from '@/components/ConnectionForm';
import ServerStats from '@/components/ServerStats';
import PlayersList from '@/components/PlayersList';
import ConnectionLogs from '@/components/ConnectionLogs';
import { v4 as uuidv4 } from 'uuid';

// Mock data for players
const initialPlayers = [
  {
    id: '1',
    username: 'Server',
    ping: 0,
    isHost: true,
    status: 'active' as const,
  }
];

// Function to generate a random log entry
const generateLogEntry = (message: string, type: 'info' | 'warning' | 'error' | 'success') => ({
  id: uuidv4(),
  timestamp: new Date(),
  message,
  type,
});

const Index = () => {
  const [connectionStatus, setConnectionStatus] = useState<'online' | 'offline' | 'connecting'>('offline');
  const [playersList, setPlayersList] = useState([] as any[]);
  const [logs, setLogs] = useState<any[]>([
    generateLogEntry('Server initialized and ready for connections', 'info'),
  ]);
  const [serverStats, setServerStats] = useState({
    ping: 0,
    playersOnline: 0,
    uptime: '00:00:00',
    region: 'Local',
  });
  const [uptimeSeconds, setUptimeSeconds] = useState(0);
  
  // Handle connection attempt
  const handleConnect = (host: string, port: number, username: string) => {
    setConnectionStatus('connecting');
    
    // Add connection attempt log
    setLogs(prev => [...prev, generateLogEntry(`Attempting to connect to ${host}:${port} as ${username}`, 'info')]);
    
    // Simulate connection process
    setTimeout(() => {
      // 80% chance of successful connection
      if (Math.random() < 0.8) {
        setConnectionStatus('online');
        setLogs(prev => [...prev, generateLogEntry(`Successfully connected to ${host}:${port}`, 'success')]);
        
        const newPlayer = {
          id: uuidv4(),
          username,
          ping: Math.floor(Math.random() * 20) + 10,
          isHost: false,
          status: 'active' as const,
        };
        
        setPlayersList([...initialPlayers, newPlayer]);
        
        setServerStats(prev => ({
          ...prev,
          ping: Math.floor(Math.random() * 15) + 5,
          playersOnline: 2,
        }));
        
        toast.success("Successfully connected to server!");
      } else {
        setConnectionStatus('offline');
        setLogs(prev => [...prev, generateLogEntry(`Failed to connect to ${host}:${port}: Connection timeout`, 'error')]);
        toast.error("Failed to connect to server");
      }
    }, 2000);
  };
  
  // Handle disconnection
  const handleDisconnect = () => {
    setLogs(prev => [...prev, generateLogEntry('Disconnecting from server...', 'info')]);
    
    setTimeout(() => {
      setConnectionStatus('offline');
      setPlayersList([]);
      setServerStats(prev => ({
        ...prev,
        ping: 0,
        playersOnline: 0,
      }));
      setUptimeSeconds(0);
      setLogs(prev => [...prev, generateLogEntry('Disconnected from server', 'info')]);
      toast.info("Disconnected from server");
    }, 1000);
  };
  
  // Update uptime when connected
  useEffect(() => {
    let interval: NodeJS.Timeout | null = null;
    
    if (connectionStatus === 'online') {
      interval = setInterval(() => {
        setUptimeSeconds(prev => prev + 1);
        
        // Occasionally add random server logs
        if (Math.random() < 0.05) {
          const randomMessages = [
            { message: 'Received ping from client', type: 'info' as const },
            { message: 'Processing game state update', type: 'info' as const },
            { message: 'Network buffer optimized', type: 'success' as const },
            { message: 'Client requested world data', type: 'info' as const },
            { message: 'Packet loss detected, retransmitting', type: 'warning' as const },
          ];
          
          const randomMessage = randomMessages[Math.floor(Math.random() * randomMessages.length)];
          setLogs(prev => [...prev, generateLogEntry(randomMessage.message, randomMessage.type)]);
        }
      }, 1000);
    }
    
    return () => {
      if (interval) clearInterval(interval);
    };
  }, [connectionStatus]);
  
  // Format uptime for display
  useEffect(() => {
    const hours = Math.floor(uptimeSeconds / 3600);
    const minutes = Math.floor((uptimeSeconds % 3600) / 60);
    const seconds = uptimeSeconds % 60;
    
    const formattedUptime = `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
    
    setServerStats(prev => ({
      ...prev,
      uptime: formattedUptime,
    }));
  }, [uptimeSeconds]);
  
  return (
    <div className="min-h-screen bg-gradient-to-br from-background to-background">
      {/* Background elements */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-10 left-0 w-72 h-72 bg-godot/10 rounded-full filter blur-3xl"></div>
        <div className="absolute bottom-10 right-10 w-96 h-96 bg-godot/10 rounded-full filter blur-3xl"></div>
      </div>
      
      <div className="container px-4 pt-8 pb-16 relative z-10">
        {/* Header */}
        <header className="flex flex-col items-center mb-10">
          <div className="flex items-center mb-4">
            <GodotLogo className="animate-float" size={64} />
            <h1 className="text-3xl sm:text-4xl font-bold ml-4 bg-clip-text text-transparent bg-gradient-to-r from-godot-dark to-godot">
              Godot Multiverse
            </h1>
          </div>
          <p className="text-center text-muted-foreground max-w-2xl">
            A beautiful and intuitive interface for connecting to Godot multiplayer servers.
            Seamlessly join game worlds and interact with other players.
          </p>
        </header>
        
        {/* Main content */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* Connection form */}
          <div className="lg:col-span-5 lg:row-span-2">
            <div className="godot-card h-full flex items-center">
              <ConnectionForm 
                onConnect={handleConnect} 
                onDisconnect={handleDisconnect}
                status={connectionStatus}
              />
            </div>
          </div>
          
          {/* Server stats and players list */}
          <div className="lg:col-span-7 space-y-6">
            <div className="animate-fade-in" style={{animationDelay: '0.1s'}}>
              <ServerStats 
                ping={serverStats.ping}
                playersOnline={serverStats.playersOnline}
                uptime={serverStats.uptime}
                region={serverStats.region}
              />
            </div>
            
            <div className="animate-fade-in" style={{animationDelay: '0.2s'}}>
              <PlayersList players={playersList} />
            </div>
          </div>
          
          {/* Connection logs */}
          <div className="lg:col-span-7 animate-fade-in" style={{animationDelay: '0.3s'}}>
            <ConnectionLogs logs={logs} />
          </div>
        </div>
      </div>
    </div>
  );
};

export default Index;
