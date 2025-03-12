
const express = require('express');
const http = require('http');
const { Server } = require('socket.io');
const { v4: uuidv4 } = require('uuid');

// Khởi tạo Express app và HTTP server
const app = express();
const server = http.createServer(app);

// Cấu hình CORS cho Socket.IO
const io = new Server(server, {
  cors: {
    origin: "*",
    methods: ["GET", "POST"]
  }
});

// Lưu trữ thông tin người chơi và phòng
const players = {};
const rooms = {
  'main': {
    id: 'main',
    name: 'Main Room',
    players: [],
    hostId: null,
    createdAt: new Date()
  }
};

// Khởi tạo thời gian bắt đầu server
const serverStartTime = new Date();

// Xử lý kết nối socket
io.on('connection', (socket) => {
  console.log(`New connection: ${socket.id}`);

  // Khi người dùng đăng ký thông tin
  socket.on('register', ({ username, host, port }) => {
    const playerId = uuidv4();
    
    // Lưu thông tin người chơi
    players[socket.id] = {
      id: playerId,
      socketId: socket.id,
      username,
      host,
      port,
      ping: 0,
      isHost: false,
      status: 'active',
      roomId: 'main' // Mặc định người chơi tham gia phòng chính
    };
    
    // Thêm người chơi vào phòng chính
    rooms.main.players.push(socket.id);
    
    // Nếu chưa có host, chọn người chơi đầu tiên làm host
    if (!rooms.main.hostId) {
      rooms.main.hostId = socket.id;
      players[socket.id].isHost = true;
    }
    
    // Gửi ID người chơi về client
    socket.emit('registered', { 
      playerId, 
      isHost: players[socket.id].isHost,
      serverInfo: {
        uptime: getUptime(),
        playersCount: Object.keys(players).length,
        region: 'Local Server'
      }
    });
    
    // Thông báo cho tất cả người chơi về người chơi mới
    io.to('main').emit('playerJoined', {
      player: getPublicPlayerData(players[socket.id]),
      playersCount: Object.keys(players).length
    });
    
    // Người chơi tham gia vào phòng
    socket.join('main');
    
    // Gửi danh sách người chơi hiện tại
    socket.emit('playersList', getPlayersInRoom('main'));
    
    console.log(`Player registered: ${username} (${playerId})`);
  });
  
  // Ping để đo độ trễ
  socket.on('ping', (callback) => {
    if (players[socket.id]) {
      players[socket.id].lastPing = Date.now();
      callback({ timestamp: Date.now() });
    }
  });
  
  // Nhận kết quả ping và cập nhật
  socket.on('pong', ({ startTime }) => {
    if (players[socket.id]) {
      players[socket.id].ping = Date.now() - startTime;
      
      // Gửi thông tin ping cập nhật cho tất cả người chơi
      io.to('main').emit('playerUpdated', {
        id: players[socket.id].id,
        ping: players[socket.id].ping
      });
    }
  });
  
  // Cập nhật trạng thái người chơi
  socket.on('updateStatus', ({ status }) => {
    if (players[socket.id]) {
      players[socket.id].status = status;
      
      // Gửi thông tin cập nhật cho tất cả người chơi
      io.to('main').emit('playerUpdated', {
        id: players[socket.id].id,
        status
      });
    }
  });
  
  // Xử lý ngắt kết nối
  socket.on('disconnect', () => {
    if (players[socket.id]) {
      const { roomId, id, username, isHost } = players[socket.id];
      
      console.log(`Player disconnected: ${username} (${id})`);
      
      // Xóa người chơi khỏi phòng
      if (rooms[roomId]) {
        rooms[roomId].players = rooms[roomId].players.filter(pid => pid !== socket.id);
        
        // Nếu người chơi này là host, chọn host mới
        if (isHost && rooms[roomId].players.length > 0) {
          const newHostId = rooms[roomId].players[0];
          rooms[roomId].hostId = newHostId;
          players[newHostId].isHost = true;
          
          // Thông báo host mới
          io.to(roomId).emit('newHost', {
            id: players[newHostId].id
          });
        }
      }
      
      // Thông báo cho tất cả người chơi về việc ngắt kết nối
      io.to(roomId).emit('playerLeft', {
        playerId: id,
        playersCount: Object.keys(players).length - 1
      });
      
      // Xóa người chơi khỏi danh sách
      delete players[socket.id];
    }
  });
});

// Hàm lấy thời gian hoạt động của server
function getUptime() {
  const diff = new Date() - serverStartTime;
  const seconds = Math.floor(diff / 1000);
  const minutes = Math.floor(seconds / 60);
  const hours = Math.floor(minutes / 60);
  
  return `${hours.toString().padStart(2, '0')}:${(minutes % 60).toString().padStart(2, '0')}:${(seconds % 60).toString().padStart(2, '0')}`;
}

// Hàm lấy thông tin công khai của người chơi
function getPublicPlayerData(player) {
  return {
    id: player.id,
    username: player.username,
    ping: player.ping,
    isHost: player.isHost,
    status: player.status
  };
}

// Hàm lấy danh sách người chơi trong phòng
function getPlayersInRoom(roomId) {
  const room = rooms[roomId];
  if (!room) return [];
  
  return room.players.map(socketId => getPublicPlayerData(players[socketId]));
}

// Cập nhật ping định kỳ
setInterval(() => {
  Object.values(players).forEach(player => {
    io.to(player.socketId).emit('requestPing');
  });
}, 5000);

// Khởi động server
const PORT = process.env.PORT || 3001;
server.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
