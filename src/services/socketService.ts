
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
}

interface ClientToServerEvents {
  register: (data: { username: string; host: string; port: number }) => void;
  ping: (callback: (data: { timestamp: number }) => void) => void;
  pong: (data: { startTime: number }) => void;
  updateStatus: (data: { status: 'active' | 'idle' | 'away' }) => void;
}

export const SOCKET_EVENTS = {
  REGISTERED: 'registered',
  PLAYERS_LIST: 'playersList',
  PLAYER_JOINED: 'playerJoined',
  PLAYER_LEFT: 'playerLeft',
  PLAYER_UPDATED: 'playerUpdated',
  NEW_HOST: 'newHost',
  REQUEST_PING: 'requestPing',
  CONNECT: 'connect',
  CONNECT_ERROR: 'connect_error',
  DISCONNECT: 'disconnect'
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
      
      // Xác định URL kết nối dựa trên host và port
      let serverUrl = `http://${host}:${port}`;
      
      try {
        this.socket = io(serverUrl);
        
        // Khi kết nối thành công
        this.socket.on(SOCKET_EVENTS.CONNECT, () => {
          console.log('Connected to server');
          
          // Đăng ký thông tin người chơi
          this.socket?.emit('register', { username, host, port });
        });
        
        // Xử lý khi đăng ký thành công
        this.socket.on(SOCKET_EVENTS.REGISTERED, ({ playerId, isHost, serverInfo }) => {
          this.playerId = playerId;
          this.updateConnectionStatus('online');
          this.updateServerInfo(serverInfo);
          resolve();
        });
        
        // Nhận danh sách người chơi
        this.socket.on(SOCKET_EVENTS.PLAYERS_LIST, (players) => {
          this.updatePlayersList(players);
        });
        
        // Cập nhật khi có người chơi mới
        this.socket.on(SOCKET_EVENTS.PLAYER_JOINED, ({ player, playersCount }) => {
          this.updatePlayersList([...this.playersList, player]);
          this.updateServerInfo({ playersCount });
          toast.info(`${player.username} đã tham gia`);
        });
        
        // Cập nhật khi có người chơi rời đi
        this.socket.on(SOCKET_EVENTS.PLAYER_LEFT, ({ playerId, playersCount }) => {
          const player = this.playersList.find(p => p.id === playerId);
          if (player) {
            toast.info(`${player.username} đã rời đi`);
          }
          
          this.updatePlayersList(this.playersList.filter(p => p.id !== playerId));
          this.updateServerInfo({ playersCount });
        });
        
        // Cập nhật thông tin người chơi
        this.socket.on(SOCKET_EVENTS.PLAYER_UPDATED, (playerData) => {
          this.updatePlayersList(
            this.playersList.map(p => 
              p.id === playerData.id ? { ...p, ...playerData } : p
            )
          );
        });
        
        // Xử lý yêu cầu ping
        this.socket.on(SOCKET_EVENTS.REQUEST_PING, () => {
          const startTime = Date.now();
          this.socket?.emit('ping', ({ timestamp }) => {
            this.socket?.emit('pong', { startTime });
          });
        });
        
        // Xử lý lỗi kết nối
        this.socket.on(SOCKET_EVENTS.CONNECT_ERROR, (error) => {
          console.error('Connection error:', error);
          this.updateConnectionStatus('offline');
          reject(new Error('Could not connect to server'));
        });
        
        // Xử lý ngắt kết nối
        this.socket.on(SOCKET_EVENTS.DISCONNECT, () => {
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
