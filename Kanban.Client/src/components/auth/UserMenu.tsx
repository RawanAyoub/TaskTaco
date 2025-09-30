import React from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { Button } from '../ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '../ui/dropdown-menu';
import { Avatar, AvatarFallback, AvatarImage } from '../ui/avatar';
import { User, LogOut, Settings } from 'lucide-react';
import { UserProfileDialog } from '../dialogs';
import { SettingsModal } from '../SettingsModal';

export const UserMenu: React.FC = () => {
  const { user, logout } = useAuth();
  const [settingsOpen, setSettingsOpen] = React.useState(false);

  if (!user) {
    return null;
  }

  const initials = user.name
    .split(' ')
    .map(name => name.charAt(0).toUpperCase())
    .slice(0, 2)
    .join('');
    
  console.log('UserMenu - user.profilePicture:', user.profilePicture);

  return (
    <>
      <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" className="relative h-8 w-8 rounded-full">
          <Avatar className="h-8 w-8">
            <AvatarImage src={user.profilePicture ? `/${user.profilePicture}?t=${Date.now()}` : undefined} alt={user.name} />
            <AvatarFallback className="text-xs">
              {initials}
            </AvatarFallback>
          </Avatar>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent className="w-56" align="end" forceMount>
        <DropdownMenuLabel className="font-normal">
          <div className="flex flex-col space-y-1">
            <p className="text-sm font-medium leading-none">{user.name}</p>
            <p className="text-xs leading-none text-muted-foreground">
              {user.email}
            </p>
          </div>
        </DropdownMenuLabel>
        <DropdownMenuSeparator />
        <UserProfileDialog
          trigger={
            <DropdownMenuItem onSelect={(e) => e.preventDefault()}>
              <User className="mr-2 h-4 w-4" />
              <span>Profile</span>
            </DropdownMenuItem>
          }
        />
        <DropdownMenuItem onClick={() => setSettingsOpen(true)}>
          <Settings className="mr-2 h-4 w-4" />
          <span>Settings</span>
        </DropdownMenuItem>
        <DropdownMenuSeparator />
        <DropdownMenuItem onClick={logout}>
          <LogOut className="mr-2 h-4 w-4" />
          <span>Log out</span>
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
    <SettingsModal
      isOpen={settingsOpen}
      onClose={() => setSettingsOpen(false)}
    />
    </>
  );
};
