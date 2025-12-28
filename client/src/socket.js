import { io } from 'socket.io-client';

let socket = null;

export const initSocket = () => {
  if (!socket) {
    // 从 localStorage 获取 token
    const token = localStorage.getItem('token');

    socket = io(import.meta.env.VITE_API_URL || 'http://localhost:3000', {
      autoConnect: false,
      reconnection: true,
      reconnectionDelay: 1000,
      reconnectionAttempts: 5,
      auth: {
        token: token
      }
    });

    socket.on('connect', () => {
      console.log('Socket 已连接:', socket.id);
    });

    socket.on('disconnect', () => {
      console.log('Socket 已断开');
    });

    socket.on('connect_error', (error) => {
      console.error('Socket 连接错误:', error);
    });
  }

  return socket;
};

export const connectSocket = () => {
  const socket = initSocket();

  if (!socket.connected) {
    socket.connect();
  }

  // 加入家庭的房间
  socket.emit('join-family');
};

export const disconnectSocket = () => {
  if (socket && socket.connected) {
    socket.disconnect();
  }
};

export const onDataUpdate = (callback) => {
  const socket = initSocket();
  socket.on('data-updated', callback);
};

export const offDataUpdate = (callback) => {
  const socket = initSocket();
  socket.off('data-updated', callback);
};

export const getSocket = () => socket;
