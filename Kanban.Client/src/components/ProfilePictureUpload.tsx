import { useState, useRef, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Upload, X, Loader2 } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { profileService } from '@/services/profileService';

interface ProfilePictureUploadProps {
  className?: string;
}

export function ProfilePictureUpload({ className }: ProfilePictureUploadProps) {
  const { user, refreshUser } = useAuth();
  const [isUploading, setIsUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [currentProfilePicture, setCurrentProfilePicture] = useState(user?.profilePicture);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Update local state when user profile picture changes
  useEffect(() => {
    if (user?.profilePicture !== currentProfilePicture) {
      setCurrentProfilePicture(user?.profilePicture);
    }
  }, [user?.profilePicture, currentProfilePicture]);

  const initials = user?.name
    .split(' ')
    .map(name => name.charAt(0).toUpperCase())
    .slice(0, 2)
    .join('');

  const profilePictureUrl = currentProfilePicture 
    ? `/${currentProfilePicture}?t=${Date.now()}`
    : undefined;
  
  // No console debug logs in production

  const handleFileSelect = () => {
    fileInputRef.current?.click();
  };

  const handleFileChange = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    // Validate file type and size using the service method
    const validation = profileService.validateProfilePicture(file);
    if (!validation.isValid) {
      setError(validation.error || 'Invalid file');
      return;
    }

    setIsUploading(true);
    setError(null);
    setSuccess(null);

    try {
      await profileService.uploadProfilePicture(file);
      setSuccess('Profile picture uploaded successfully!');
      
      // Refresh user data to update the profile picture in the UI
      await refreshUser();
      // small delay to ensure state has updated
      setTimeout(() => {}, 100);
      
      // Clear the file input
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to upload profile picture');
    } finally {
      setIsUploading(false);
    }
  };

  const removePicture = async () => {
    setIsUploading(true);
    setError(null);
    setSuccess(null);

    try {
      await profileService.deleteProfilePicture();
      setSuccess('Profile picture removed successfully!');
      
      // Refresh user data to clear the profile picture in the UI
      await refreshUser();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to remove profile picture');
    } finally {
      setIsUploading(false);
    }
  };

  return (
    <div className={`space-y-6 ${className}`}>
      {/* Current Picture Display */}
      <div className="flex items-center gap-6">
        <Avatar className="w-24 h-24" key={currentProfilePicture}>
          <AvatarImage 
            src={profilePictureUrl} 
            alt={`${user?.name}'s profile picture`}
            onError={() => setError('We could not load your profile picture. Try uploading again.')}
          />
          <AvatarFallback className="text-xl">
            {initials}
          </AvatarFallback>
        </Avatar>
        <div className="space-y-2">
          <h3 className="text-lg font-semibold">Current Profile Picture</h3>
          <p className="text-sm text-muted-foreground">
            This is how your profile appears to others.
          </p>
        </div>
      </div>

      {/* Upload Controls */}
      <div className="space-y-4">
        <div>
          <Label className="text-base font-medium">Upload New Picture</Label>
          <p className="text-sm text-muted-foreground mt-1">
            Choose a JPG, PNG, or GIF image. Maximum file size: 5MB.
          </p>
        </div>

        <div className="flex gap-3">
          <Button
            onClick={handleFileSelect}
            disabled={isUploading}
            variant="outline"
            className="flex items-center gap-2"
          >
            {isUploading ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : (
              <Upload className="w-4 h-4" />
            )}
            {isUploading ? 'Uploading...' : 'Choose File'}
          </Button>

          <Button
            onClick={removePicture}
            disabled={isUploading}
            variant="outline"
            className="flex items-center gap-2 text-destructive hover:text-destructive"
          >
            <X className="w-4 h-4" />
            Remove Picture
          </Button>
        </div>

        {/* Hidden file input */}
        <input
          ref={fileInputRef}
          type="file"
          accept="image/jpeg,image/png,image/gif"
          onChange={handleFileChange}
          className="hidden"
        />
      </div>

      {/* Status Messages */}
      {error && (
        <div className="p-4 bg-destructive/10 border border-destructive/20 rounded-md">
          <p className="text-sm text-destructive">{error}</p>
        </div>
      )}

      {success && (
        <div className="p-4 bg-green-500/10 border border-green-500/20 rounded-md">
          <p className="text-sm text-green-600">{success}</p>
        </div>
      )}

      {/* Info Section */}
      <div className="p-4 bg-muted/50 rounded-md">
        <h4 className="font-medium mb-2">Profile Picture Guidelines</h4>
        <ul className="text-sm text-muted-foreground space-y-1">
          <li>• Use a clear, high-quality image</li>
          <li>• Face should be clearly visible</li>
          <li>• Avoid busy backgrounds</li>
          <li>• Square images work best</li>
        </ul>
      </div>
    </div>
  );
}