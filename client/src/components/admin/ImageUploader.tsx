import { useState, useRef } from "react";
import { Button } from "@/components/ui/button";
import { UploadCloud, Trash2, Image } from "lucide-react";
import { Card } from "@/components/ui/card";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";

interface ImageUploaderProps {
  onImageUploaded: (imageUrl: string) => void;
  existingImageUrl?: string;
  className?: string;
  label?: string;
}

export function ImageUploader({
  onImageUploaded,
  existingImageUrl,
  className = "",
  label = "Încarcă imagine"
}: ImageUploaderProps) {
  const [isUploading, setIsUploading] = useState(false);
  const [previewUrl, setPreviewUrl] = useState<string | null>(existingImageUrl || null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { toast } = useToast();

  const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Validare tip fișier și dimensiune
    if (!file.type.startsWith('image/')) {
      toast({
        title: "Tip fișier invalid",
        description: "Vă rugăm să selectați o imagine (JPG, PNG, GIF, etc.)",
        variant: "destructive",
      });
      return;
    }

    if (file.size > 5 * 1024 * 1024) { // 5MB max
      toast({
        title: "Fișier prea mare",
        description: "Imaginea trebuie să fie mai mică de 5MB",
        variant: "destructive",
      });
      return;
    }

    try {
      setIsUploading(true);
      
      // Creare formData pentru upload
      const formData = new FormData();
      formData.append('image', file);
      
      // Apelare API de upload
      const response = await fetch('/api/upload', {
        method: 'POST',
        body: formData,
      });
      
      if (!response.ok) {
        throw new Error('Eroare la încărcarea imaginii');
      }
      
      const data = await response.json();
      const imageUrl = data.url;
      
      // Setare preview și transmitere URL către parent
      setPreviewUrl(imageUrl);
      onImageUploaded(imageUrl);
      
      toast({
        title: "Imagine încărcată cu succes",
        variant: "default",
      });
    } catch (error) {
      console.error('Eroare la încărcarea imaginii:', error);
      toast({
        title: "Eroare la încărcare",
        description: "Nu am putut încărca imaginea. Încercați din nou.",
        variant: "destructive",
      });
    } finally {
      setIsUploading(false);
    }
  };

  const handleRemoveImage = () => {
    setPreviewUrl(null);
    onImageUploaded("");
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  return (
    <div className={`flex flex-col space-y-3 ${className}`}>
      <input
        type="file"
        ref={fileInputRef}
        onChange={handleFileSelect}
        accept="image/*"
        className="hidden"
      />
      
      {previewUrl ? (
        <div className="relative w-full">
          <Card className="overflow-hidden">
            <img 
              src={previewUrl} 
              alt="Previzualizare" 
              className="w-full h-48 object-cover"
              onError={() => setPreviewUrl(null)}
            />
            <Button
              type="button"
              variant="destructive"
              size="sm"
              className="absolute top-2 right-2"
              onClick={handleRemoveImage}
            >
              <Trash2 className="h-4 w-4" />
            </Button>
          </Card>
        </div>
      ) : (
        <Button
          type="button"
          variant="outline"
          className="h-48 w-full border-dashed"
          onClick={() => fileInputRef.current?.click()}
          disabled={isUploading}
        >
          {isUploading ? (
            <div className="flex flex-col items-center justify-center">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mb-2"></div>
              <span>Se încarcă...</span>
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center">
              <UploadCloud className="h-10 w-10 mb-2 text-muted-foreground" />
              <span className="text-sm text-muted-foreground">{label}</span>
              <span className="text-xs text-muted-foreground mt-1">JPG, PNG, GIF (max. 5MB)</span>
            </div>
          )}
        </Button>
      )}
    </div>
  );
}

interface MultipleImageUploaderProps {
  onImagesChange: (imageUrls: string[]) => void;
  existingImageUrls?: string[];
  className?: string;
  maxImages?: number;
}

export function MultipleImageUploader({
  onImagesChange,
  existingImageUrls = [],
  className = "",
  maxImages = 10
}: MultipleImageUploaderProps) {
  const [images, setImages] = useState<string[]>(existingImageUrls || []);
  const [isUploading, setIsUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { toast } = useToast();

  const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Verifică dacă s-a atins numărul maxim de imagini
    if (images.length >= maxImages) {
      toast({
        title: "Număr maxim de imagini atins",
        description: `Puteți încărca maximum ${maxImages} imagini.`,
        variant: "destructive",
      });
      return;
    }

    // Validare tip fișier și dimensiune
    if (!file.type.startsWith('image/')) {
      toast({
        title: "Tip fișier invalid",
        description: "Vă rugăm să selectați o imagine (JPG, PNG, GIF, etc.)",
        variant: "destructive",
      });
      return;
    }

    if (file.size > 5 * 1024 * 1024) { // 5MB max
      toast({
        title: "Fișier prea mare",
        description: "Imaginea trebuie să fie mai mică de 5MB",
        variant: "destructive",
      });
      return;
    }

    try {
      setIsUploading(true);
      
      // Creare formData pentru upload
      const formData = new FormData();
      formData.append('image', file);
      
      // Apelare API de upload
      const response = await fetch('/api/upload', {
        method: 'POST',
        body: formData,
      });
      
      if (!response.ok) {
        throw new Error('Eroare la încărcarea imaginii');
      }
      
      const data = await response.json();
      const imageUrl = data.url;
      
      // Adaugă noua imagine la lista existentă
      const updatedImages = [...images, imageUrl];
      setImages(updatedImages);
      onImagesChange(updatedImages);
      
      toast({
        title: "Imagine încărcată cu succes",
        variant: "default",
      });
    } catch (error) {
      console.error('Eroare la încărcarea imaginii:', error);
      toast({
        title: "Eroare la încărcare",
        description: "Nu am putut încărca imaginea. Încercați din nou.",
        variant: "destructive",
      });
    } finally {
      setIsUploading(false);
      if (fileInputRef.current) {
        fileInputRef.current.value = "";
      }
    }
  };

  const handleRemoveImage = (index: number) => {
    const updatedImages = [...images];
    updatedImages.splice(index, 1);
    setImages(updatedImages);
    onImagesChange(updatedImages);
  };

  return (
    <div className={`space-y-3 ${className}`}>
      <input
        type="file"
        ref={fileInputRef}
        onChange={handleFileSelect}
        accept="image/*"
        className="hidden"
      />
      
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
        {images.map((imageUrl, index) => (
          <div key={index} className="relative">
            <Card className="overflow-hidden">
              <img 
                src={imageUrl} 
                alt={`Imagine ${index + 1}`} 
                className="w-full h-48 object-cover" 
                onError={(e) => (e.target as HTMLImageElement).src = "/images/default-monastery.svg"}
              />
              <Button
                type="button"
                variant="destructive"
                size="sm"
                className="absolute top-2 right-2"
                onClick={() => handleRemoveImage(index)}
              >
                <Trash2 className="h-4 w-4" />
              </Button>
            </Card>
          </div>
        ))}
        
        {images.length < maxImages && (
          <Button
            type="button"
            variant="outline"
            className="h-48 w-full border-dashed"
            onClick={() => fileInputRef.current?.click()}
            disabled={isUploading}
          >
            {isUploading ? (
              <div className="flex flex-col items-center justify-center">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mb-2"></div>
                <span>Se încarcă...</span>
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center">
                <Image className="h-10 w-10 mb-2 text-muted-foreground" />
                <span className="text-sm text-muted-foreground">Adaugă imagine</span>
                <span className="text-xs text-muted-foreground mt-1">JPG, PNG, GIF (max. 5MB)</span>
              </div>
            )}
          </Button>
        )}
      </div>
    </div>
  );
}