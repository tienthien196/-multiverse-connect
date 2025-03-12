
import React, { useState, useEffect } from 'react';
import { toast } from "sonner";
import GodotLogo from '@/components/GodotLogo';
import ConnectionForm from '@/components/ConnectionForm';
import ServerStats from '@/components/ServerStats';
import PlayersList from '@/components/PlayersList';
import ConnectionLogs from '@/components/ConnectionLogs';
import socketService from '@/services/socketService';
import { v4 as uuidv4 } from 'uuid';

const Index = () => {
  const [connectionStatus, setConnectionStatus] = useState<'online' | 'offline' | 'connecting'>('offline');
  const [playersList, setPlayersList] = useState<any[]>([]);
  const [logs, setLogs] = useState<any[]>([
    {
      id: uuidv4(),
      timestamp: new Date(),
      message: 'Hệ thống đã khởi tạo và sẵn sàng kết nối',
      type: 'info'
    },
  ]);
  const [serverStats, setServerStats] = useState({
    ping: 0,
    playersOnline: 0,
    uptime: '00:00:00',
    region: 'Local',
  });
  
  // Đăng ký lắng nghe các sự kiện từ socketService
  useEffect(() => {
    // Lắng nghe sự thay đổi trạng thái kết nối
    const unsubscribeConnection = socketService.addConnectionListener((status) => {
      setConnectionStatus(status);
      
      // Ghi log khi trạng thái kết nối thay đổi
      if (status === 'connecting') {
        addLog('Đang kết nối đến máy chủ...', 'info');
      } else if (status === 'online') {
        addLog('Đã kết nối thành công đến máy chủ', 'success');
      } else if (status === 'offline') {
        addLog('Đã ngắt kết nối khỏi máy chủ', 'info');
      }
    });
    
    // Lắng nghe danh sách người chơi
    const unsubscribePlayers = socketService.addPlayersListener((players) => {
      setPlayersList(players);
    });
    
    // Lắng nghe thông tin máy chủ
    const unsubscribeServerInfo = socketService.addServerInfoListener((info) => {
      setServerStats({
        ping: 0, // Sẽ được cập nhật riêng
        playersOnline: info.playersCount,
        uptime: info.uptime,
        region: info.region,
      });
    });
    
    return () => {
      // Hủy đăng ký lắng nghe khi component unmount
      unsubscribeConnection();
      unsubscribePlayers();
      unsubscribeServerInfo();
    };
  }, []);
  
  // Thêm log mới
  const addLog = (message: string, type: 'info' | 'warning' | 'error' | 'success') => {
    setLogs(prev => [...prev, {
      id: uuidv4(),
      timestamp: new Date(),
      message,
      type,
    }]);
  };
  
  // Xử lý kết nối
  const handleConnect = (host: string, port: number, username: string) => {
    addLog(`Đang kết nối đến ${host}:${port} với tên ${username}`, 'info');
  };
  
  // Xử lý ngắt kết nối
  const handleDisconnect = () => {
    addLog('Đang ngắt kết nối khỏi máy chủ...', 'info');
  };
  
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
            Giao diện kết nối máy chủ Godot multiplayer trực quan và đẹp mắt.
            Kết nối liền mạch đến các thế giới game và tương tác với người chơi khác.
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
