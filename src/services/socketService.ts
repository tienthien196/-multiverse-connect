
import { io, Socket } from 'socket.io-client';
import { toast } from "sonner";

interface ServerInfo {
  uptime: string;
  playersCount: number;
  region: string;
}

interface Player {
  id: string;
  username: string;
  ping: number;
  isHost: boolean;
  status: 'active' | 'idle' | 'away';
}

interface ServerToClientEvents {
  registered: (data: { playerId: string; isHost: boolean; serverInfo: ServerInfo }) => void;
  playersList: (players: Player[]) => void;
  playerJoined: (data: { player: Player; playersCount: number }) => void;
  playerLeft: (data: { playerId: string; playersCount: number }) => void;
  playerUpdated: (data: Partial<Player>) => void;
  newHost: (data: { id: string }) => void;
  requestPing: () => void;
  connect: () => void;
  connect_error: (error: Error) => void;
  disconnect: () => void;
}

interface ClientToServerEvents {
  register: (data: { username: string; host: string; port: number }) => void;
  ping: (callback: (data: { timestamp: number }) => void) => void;
  pong: (data: { startTime: number }) => void;
  updateStatus: (data: { status: 'active' | 'idle' | 'away' }) => void;
}

// Chuyển các chuỗi sự kiện thành các hằng số tương ứng với các sự kiện đã định nghĩa
export const SOCKET_EVENTS = {
  REGISTERED: 'registered' as const,
  PLAYERS_LIST: 'playersList' as const,
  PLAYER_JOINED: 'playerJoined' as const,
  PLAYER_LEFT: 'playerLeft' as const,
  PLAYER_UPDATED: 'playerUpdated' as const,
  NEW_HOST: 'newHost' as const,
  REQUEST_PING: 'requestPing' as const,
  CONNECT: 'connect' as const,
  CONNECT_ERROR: 'connect_error' as const,
  DISCONNECT: 'disconnect' as const
};

class SocketService {
  private socket: Socket<ServerToClientEvents, ClientToServerEvents> | null = null;
  private connectionListeners: Set<(status: 'online' | 'offline' | 'connecting') => void> = new Set();
  private playersListeners: Set<(players: Player[]) => void> = new Set();
  private serverInfoListeners: Set<(info: ServerInfo) => void> = new Set();
  private connectionStatus: 'online' | 'offline' | 'connecting' = 'offline';
  private playersList: Player[] = [];
  private serverInfo: ServerInfo = { uptime: '00:00:00', playersCount: 0, region: 'Local' };
  private playerId: string | null = null;
  private pingInterval: number | null = null;
  
  getConnectionStatus() {
    return this.connectionStatus;
  }
  
  getPlayers() {
    return this.playersList;
  }
  
  getServerInfo() {
    return this.serverInfo;
  }
  
  addConnectionListener(listener: (status: 'online' | 'offline' | 'connecting') => void) {
    this.connectionListeners.add(listener);
    return () => this.connectionListeners.delete(listener);
  }
  
  addPlayersListener(listener: (players: Player[]) => void) {
    this.playersListeners.add(listener);
    return () => this.playersListeners.delete(listener);
  }
  
  addServerInfoListener(listener: (info: ServerInfo) => void) {
    this.serverInfoListeners.add(listener);
    return () => this.serverInfoListeners.delete(listener);
  }
  
  private updateConnectionStatus(status: 'online' | 'offline' | 'connecting') {
    this.connectionStatus = status;
    this.connectionListeners.forEach(listener => listener(status));
  }
  
  private updatePlayersList(players: Player[]) {
    this.playersList = players;
    this.playersListeners.forEach(listener => listener(players));
  }
  
  private updateServerInfo(info: Partial<ServerInfo>) {
    this.serverInfo = { ...this.serverInfo, ...info };
    this.serverInfoListeners.forEach(listener => listener(this.serverInfo));
  }
  
  connect(host: string, port: number, username: string): Promise<void> {
    return new Promise((resolve, reject) => {
      if (this.socket) {
        this.socket.disconnect();
      }
      
      this.updateConnectionStatus('connecting');
      
      let serverUrl = `http://${host}:${port}`;
      
      try {
        this.socket = io(serverUrl);
        
        // Sử dụng interface ServerToClientEvents cho các sự kiện
        this.socket.on('connect', () => {
          console.log('Connected to server');
          this.socket?.emit('register', { username, host, port });
        });
        
        this.socket.on('registered', ({ playerId, isHost, serverInfo }) => {
          this.playerId = playerId;
          this.updateConnectionStatus('online');
          this.updateServerInfo(serverInfo);
          resolve();
        });
        
        this.socket.on('playersList', (players) => {
          this.updatePlayersList(players);
        });
        
        this.socket.on('playerJoined', ({ player, playersCount }) => {
          this.updatePlayersList([...this.playersList, player]);
          this.updateServerInfo({ playersCount });
          toast.info(`${player.username} đã tham gia`);
        });
        
        this.socket.on('playerLeft', ({ playerId, playersCount }) => {
          const player = this.playersList.find(p => p.id === playerId);
          if (player) {
            toast.info(`${player.username} đã rời đi`);
          }
          
          this.updatePlayersList(this.playersList.filter(p => p.id !== playerId));
          this.updateServerInfo({ playersCount });
        });
        
        this.socket.on('playerUpdated', (playerData) => {
          this.updatePlayersList(
            this.playersList.map(p => 
              p.id === playerData.id ? { ...p, ...playerData } : p
            )
          );
        });
        
        this.socket.on('requestPing', () => {
          const startTime = Date.now();
          this.socket?.emit('ping', ({ timestamp }) => {
            this.socket?.emit('pong', { startTime });
          });
        });
        
        this.socket.on('connect_error', (error) => {
          console.error('Connection error:', error);
          this.updateConnectionStatus('offline');
          reject(new Error('Could not connect to server'));
        });
        
        this.socket.on('disconnect', () => {
          console.log('Disconnected from server');
          this.updateConnectionStatus('offline');
          this.updatePlayersList([]);
          this.updateServerInfo({ 
            uptime: '00:00:00',
            playersCount: 0,
            region: 'Local'
          });
          toast.info('Đã ngắt kết nối khỏi máy chủ');
        });
        
      } catch (error) {
        console.error('Failed to connect:', error);
        this.updateConnectionStatus('offline');
        reject(error);
      }
    });
  }
  
  disconnect() {
    if (this.socket) {
      this.socket.disconnect();
      this.socket = null;
    }
    
    if (this.pingInterval) {
      clearInterval(this.pingInterval);
      this.pingInterval = null;
    }
  }
}

export default new SocketService();
