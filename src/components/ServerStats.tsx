
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { cn } from '@/lib/utils';

interface StatItemProps {
  title: string;
  value: string | number;
  icon: React.ReactNode;
  className?: string;
}

const StatItem: React.FC<StatItemProps> = ({ title, value, icon, className }) => {
  return (
    <Card className={cn("bg-background/40 backdrop-blur-md border border-border/50 overflow-hidden relative", className)}>
      <CardHeader className="p-4 pb-2">
        <CardTitle className="text-sm font-medium text-muted-foreground">{title}</CardTitle>
      </CardHeader>
      <CardContent className="p-4 pt-0 flex justify-between items-end">
        <span className="text-2xl font-semibold">{value}</span>
        <div className="text-godot">{icon}</div>
      </CardContent>
    </Card>
  );
};

interface ServerStatsProps {
  ping: number;
  playersOnline: number;
  uptime: string;
  region: string;
  className?: string;
}

const ServerStats: React.FC<ServerStatsProps> = ({ 
  ping, 
  playersOnline, 
  uptime, 
  region,
  className 
}) => {
  return (
    <div className={cn("grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4", className)}>
      <StatItem 
        title="Ping" 
        value={`${ping} ms`} 
        icon={
          <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M22 12h-4l-3 9L9 3l-3 9H2"/>
          </svg>
        }
      />
      <StatItem 
        title="Players Online" 
        value={playersOnline} 
        icon={
          <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/>
            <circle cx="9" cy="7" r="4"/>
            <path d="M23 21v-2a4 4 0 0 0-3-3.87"/>
            <path d="M16 3.13a4 4 0 0 1 0 7.75"/>
          </svg>
        }
      />
      <StatItem 
        title="Uptime" 
        value={uptime} 
        icon={
          <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <circle cx="12" cy="12" r="10"/>
            <polyline points="12 6 12 12 16 14"/>
          </svg>
        }
      />
      <StatItem 
        title="Region" 
        value={region} 
        icon={
          <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <circle cx="12" cy="12" r="10"/>
            <path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z"/>
            <path d="M2 12h20"/>
          </svg>
        }
      />
    </div>
  );
};

export default ServerStats;
