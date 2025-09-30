import { useState, useEffect } from 'react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Loader2, User } from 'lucide-react';
import { UserService } from '@/services/user';
import { PasswordChangeForm } from '@/components/PasswordChangeForm';
import { ProfilePictureUpload } from '@/components/ProfilePictureUpload';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { useAuth } from '@/contexts/AuthContext';
import type { UserProfileDto } from '@/types/api';

interface UserProfileDialogProps {
  trigger?: React.ReactNode;
}

export function UserProfileDialog({ trigger }: UserProfileDialogProps) {
  const { user } = useAuth();
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [profile, setProfile] = useState<UserProfileDto | null>(null);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
  });

  // Load profile when dialog opens
  useEffect(() => {
    if (open && !profile) {
      loadProfile();
    }
  }, [open, profile]);

  const loadProfile = async () => {
    setLoading(true);
    setError(null);
    try {
      const userProfile = await UserService.getProfile();
      setProfile(userProfile);
      setFormData({
        name: userProfile.name,
        email: userProfile.email,
      });
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load profile');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.name.trim()) {
      setError('Name is required');
      return;
    }

    if (!formData.email.trim()) {
      setError('Email is required');
      return;
    }

    // Basic email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(formData.email)) {
      setError('Please enter a valid email address');
      return;
    }

    setSaving(true);
    setError(null);

    try {
      await UserService.updateProfile({
        name: formData.name.trim(),
        email: formData.email.trim(),
      });
      
      // Update local profile state
      if (profile) {
        setProfile({
          ...profile,
          name: formData.name,
          email: formData.email,
        });
      }
      
      setOpen(false);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to update profile');
    } finally {
      setSaving(false);
    }
  };

  const handleInputChange = (field: keyof typeof formData, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    if (error) setError(null);
  };

  const defaultTrigger = (
    <Button variant="ghost" size="icon" title="Profile">
      <User className="w-4 h-4" />
    </Button>
  );

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        {trigger || defaultTrigger}
      </DialogTrigger>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <div className="flex items-center gap-3">
            <Avatar className="w-12 h-12">
              <AvatarImage src={user?.profilePicture ? `/${user.profilePicture}?t=${Date.now()}` : undefined} alt={user?.name} />
              <AvatarFallback className="text-sm">
                {user?.name.split(' ').map(name => name.charAt(0).toUpperCase()).slice(0, 2).join('')}
              </AvatarFallback>
            </Avatar>
            <div>
              <DialogTitle>{user?.name}</DialogTitle>
              <DialogDescription>
                Manage your profile information and account settings
              </DialogDescription>
            </div>
          </div>
        </DialogHeader>

        {loading ? (
          <div className="flex items-center justify-center py-8">
            <Loader2 className="w-6 h-6 animate-spin" />
            <span className="ml-2">Loading profile...</span>
          </div>
        ) : (
          <Tabs defaultValue="profile" className="w-full">
            <TabsList className="grid w-full grid-cols-3">
              <TabsTrigger value="profile">Profile</TabsTrigger>
              <TabsTrigger value="password">Password</TabsTrigger>
              <TabsTrigger value="picture">Picture</TabsTrigger>
            </TabsList>

            <TabsContent value="profile" className="space-y-4">
              <form onSubmit={handleSubmit} className="space-y-4">
                {error && (
                  <div className="bg-destructive/10 border border-destructive/20 text-destructive px-3 py-2 rounded-md text-sm">
                    {error}
                  </div>
                )}

                <div className="space-y-2">
                  <Label htmlFor="name">Display Name</Label>
                  <Input
                    id="name"
                    type="text"
                    value={formData.name}
                    onChange={(e) => handleInputChange('name', e.target.value)}
                    placeholder="Your display name"
                    maxLength={100}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="email">Email Address</Label>
                  <Input
                    id="email"
                    type="email"
                    value={formData.email}
                    onChange={(e) => handleInputChange('email', e.target.value)}
                    placeholder="your.email@example.com"
                    maxLength={200}
                  />
                </div>

                <DialogFooter>
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => setOpen(false)}
                    disabled={saving}
                  >
                    Cancel
                  </Button>
                  <Button 
                    type="submit" 
                    disabled={saving}
                    style={{ backgroundColor: 'hsl(var(--secondary))', color: 'hsl(var(--secondary-foreground))' }}
                  >
                    {saving && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
                    Save Profile
                  </Button>
                </DialogFooter>
              </form>
            </TabsContent>

            <TabsContent value="password" className="space-y-4">
              <PasswordChangeForm
                onSuccess={() => {
                  // Could show a success message
                  setOpen(false);
                }}
                onCancel={() => setOpen(false)}
              />
            </TabsContent>

            <TabsContent value="picture" className="space-y-4">
              <ProfilePictureUpload />
            </TabsContent>
          </Tabs>
        )}
      </DialogContent>
    </Dialog>
  );
}