
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';

interface Player {
  id: string;
  username: string;
  ping: number;
  isHost: boolean;
  status: 'active' | 'idle' | 'away';
  avatar?: string;
}

interface PlayersListProps {
  players: Player[];
  className?: string;
}

const statusColors = {
  active: 'bg-green-500',
  idle: 'bg-yellow-500',
  away: 'bg-gray-500'
};

const PlayersList: React.FC<PlayersListProps> = ({ players, className }) => {
  return (
    <Card className={`bg-background/40 backdrop-blur-md border border-border/50 overflow-hidden ${className}`}>
      <CardHeader className="p-4 pb-3 border-b border-border/50">
        <div className="flex justify-between items-center">
          <CardTitle className="text-xl font-medium">Players</CardTitle>
          <Badge variant="outline" className="bg-godot/10 text-godot border-godot/20">
            {players.length} {players.length === 1 ? 'Player' : 'Players'}
          </Badge>
        </div>
      </CardHeader>
      <CardContent className="p-0">
        <ScrollArea className="h-[300px] w-full">
          {players.length > 0 ? (
            <ul className="divide-y divide-border/50">
              {players.map((player) => (
                <li key={player.id} className="p-4 flex items-center justify-between hover:bg-background/60 transition-colors">
                  <div className="flex items-center space-x-3">
                    <div className="relative">
                      <div className="h-10 w-10 rounded-full bg-muted flex items-center justify-center overflow-hidden">
                        {player.avatar ? (
                          <img src={player.avatar} alt={player.username} className="h-full w-full object-cover" />
                        ) : (
                          <div className="text-lg font-semibold text-muted-foreground">
                            {player.username.charAt(0).toUpperCase()}
                          </div>
                        )}
                      </div>
                      <div className={`absolute bottom-0 right-0 h-3 w-3 rounded-full ${statusColors[player.status]} border-2 border-background`}></div>
                    </div>
                    <div>
                      <div className="flex items-center space-x-2">
                        <span className="font-medium">{player.username}</span>
                        {player.isHost && (
                          <Badge variant="outline" className="bg-godot/10 text-godot border-godot/20 text-xs py-0">
                            Host
                          </Badge>
                        )}
                      </div>
                      <p className="text-xs text-muted-foreground">ID: {player.id}</p>
                    </div>
                  </div>
                  <div className="text-sm text-muted-foreground">
                    {player.ping} ms
                  </div>
                </li>
              ))}
            </ul>
          ) : (
            <div className="flex items-center justify-center h-full">
              <p className="text-muted-foreground">No players connected</p>
            </div>
          )}
        </ScrollArea>
      </CardContent>
    </Card>
  );
};

export default PlayersList;
