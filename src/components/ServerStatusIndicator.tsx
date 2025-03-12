
import React from 'react';
import { cn } from '@/lib/utils';

type Status = 'online' | 'offline' | 'connecting';

interface ServerStatusIndicatorProps {
  status: Status;
  className?: string;
}

const statusConfig = {
  online: {
    color: 'bg-green-500',
    pulseColor: 'bg-green-400',
    text: 'Online'
  },
  offline: {
    color: 'bg-red-500',
    pulseColor: 'bg-red-400',
    text: 'Offline'
  },
  connecting: {
    color: 'bg-yellow-500',
    pulseColor: 'bg-yellow-400',
    text: 'Connecting'
  }
};

const ServerStatusIndicator: React.FC<ServerStatusIndicatorProps> = ({ status, className }) => {
  const { color, pulseColor, text } = statusConfig[status];
  
  return (
    <div className={cn('flex items-center space-x-2', className)}>
      <div className="relative flex">
        <div className={cn('h-3 w-3 rounded-full', color)}></div>
        {status === 'connecting' && (
          <div className={cn('absolute inset-0 h-3 w-3 animate-ping rounded-full', pulseColor, 'opacity-75')}></div>
        )}
      </div>
      <span className="text-sm font-medium">{text}</span>
    </div>
  );
};

export default ServerStatusIndicator;
