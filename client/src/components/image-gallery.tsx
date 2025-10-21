import { useEffect } from "react";
import { Button } from "@/components/ui/button";
import { PlusCircle, Video } from "lucide-react";
import { MediaWithCaption } from "@shared/schema";

interface ImageGalleryProps {
  images: MediaWithCaption[];
  rowId: string;
  onAddImage: () => void;
  editMode: boolean;
  onAccessDenied: () => void;
}

export function ImageGallery({
  images,
  rowId,
  onAddImage,
  editMode,
  onAccessDenied,
}: ImageGalleryProps) {
  useEffect(() => {
    let gallery: any = null;

    const loadLightGallery = async () => {
      if (typeof window !== "undefined" && images.length > 0) {
        try {
          // Wait a bit for DOM to be ready
          await new Promise((resolve) => setTimeout(resolve, 150));

          const galleryElement = document.getElementById(
            `lightgallery-${rowId}`,
          );
          if (!galleryElement) return;

          // Check if there are actual image links in the element
          const imageLinks = galleryElement.querySelectorAll("a[data-src]");
          if (imageLinks.length === 0) return;

          // Dynamically import lightgallery
          const { default: lightGallery } = await import("lightgallery");
          const lgThumbnail = await import("lightgallery/plugins/thumbnail");
          const lgZoom = await import("lightgallery/plugins/zoom");
          const lgAutoplay = await import("lightgallery/plugins/autoplay");
          const lgFullscreen = await import("lightgallery/plugins/fullscreen");
          const lgVideo = await import("lightgallery/plugins/video");

          // Import CSS
          await import("lightgallery/css/lightgallery.css");
          await import("lightgallery/css/lg-thumbnail.css");
          await import("lightgallery/css/lg-zoom.css");
          await import("lightgallery/css/lg-autoplay.css");
          await import("lightgallery/css/lg-fullscreen.css");
          await import("lightgallery/css/lg-video.css");

          gallery = lightGallery(galleryElement, {
            plugins: [
              lgThumbnail.default,
              lgZoom.default,
              lgAutoplay.default,
              lgFullscreen.default,
              lgVideo.default,
            ],
            speed: 800,
            mode: "lg-slide",
            download: false,
            selector: "a[data-src]",
            animateThumb: true,
            startClass: "lg-start-zoom",
            backdropDuration: 300,
            hideBarsDelay: 3000,
            mousewheel: true,
            enableSwipe: true,
            enableDrag: true,
            // Video plugin settings for smooth playback with native HTML5 controls
            autoplayFirstVideo: false,
            youTubePlayerParams: {
              modestbranding: 1,
              showinfo: 0,
              rel: 0,
              controls: 1,
              playsinline: 1
            },
            vimeoPlayerParams: {
              byline: 0,
              portrait: 0,
              color: '3B82F6',
              controls: 1,
              playsinline: 1
            }
          });
        } catch (error) {
          console.error("Failed to load LightGallery:", error);
        }
      }
    };

    loadLightGallery();

    return () => {
      if (gallery) {
        try {
          gallery.destroy();
        } catch (e) {
          console.warn("Error destroying lightGallery:", e);
        }
      }
    };
  }, [images, rowId]);

  if (images.length === 0) {
    return (
      <div
        className="flex items-center gap-2"
        data-testid={`image-gallery-${rowId}`}
      >
        <span className="text-xs text-muted-foreground">No media</span>
        <Button
          size="sm"
          variant="ghost"
          className="text-xs text-primary hover:text-primary/80"
          onClick={() => (editMode ? onAddImage() : onAccessDenied())}
          data-testid={`button-add-image-${rowId}`}
        >
          <PlusCircle className="w-4 h-4" />
        </Button>
      </div>
    );
  }

  return (
    <div
      className="flex items-center gap-2"
      id={`lightgallery-${rowId}`}
      data-testid={`image-gallery-${rowId}`}
    >
      {images.map((media, index) => {
        const isVideo = media.type === 'video';
        
        // Extract MIME type from data URL or use stored mimeType or detect from URL
        const getMimeType = () => {
          if (media.mimeType) return media.mimeType;
          if (media.url.startsWith('data:')) {
            const match = media.url.match(/^data:([^;]+)/);
            return match ? match[1] : 'video/mp4';
          }
          // URL-based detection for external URLs
          if (media.url.includes('.webm')) return 'video/webm';
          if (media.url.includes('.ogg')) return 'video/ogg';
          if (media.url.includes('.mov')) return 'video/quicktime';
          return 'video/mp4';
        };
        
        const videoData = isVideo ? JSON.stringify({ 
          source: [{ 
            src: media.url, 
            type: getMimeType()
          }], 
          attributes: { 
            preload: 'metadata', 
            controls: true,
            controlsList: 'nodownload',
            playsinline: true
          } 
        }) : undefined;
        
        return (
          <a
            key={index}
            href={media.url}
            data-src={media.url}
            data-sub-html={media.caption}
            data-video={videoData}
            data-poster={isVideo && media.thumbnail ? media.thumbnail : undefined}
            className="inline-block rounded overflow-hidden hover:scale-105 transition-transform"
            data-testid={`media-${rowId}-${index}`}
          >
            {isVideo ? (
              <div className="w-10 h-8 bg-gray-800 border border-border rounded flex items-center justify-center relative">
                <Video className="w-4 h-4 text-white" />
                {media.thumbnail && (
                  <img
                    src={media.thumbnail}
                    alt={media.caption || `Video ${index + 1}`}
                    className="absolute inset-0 w-full h-full object-cover rounded"
                  />
                )}
                <div className="absolute inset-0 flex items-center justify-center bg-black/30 rounded">
                  <div className="w-5 h-5 bg-white/20 rounded-full flex items-center justify-center">
                    <div className="w-0 h-0 border-l-[4px] border-l-white border-y-[3px] border-y-transparent ml-0.5"></div>
                  </div>
                </div>
              </div>
            ) : (
              <img
                src={media.url.startsWith('data:') ? media.url : `${media.url}?w=60&h=40&fit=crop`}
                alt={media.caption || `Image ${index + 1}`}
                className="w-10 h-8 object-cover border border-border"
              />
            )}
          </a>
        );
      })}
      <Button
        size="sm"
        variant="ghost"
        className="text-xs text-primary hover:text-primary/80 ml-1"
        onClick={() => (editMode ? onAddImage() : onAccessDenied())}
        data-testid={`button-add-image-${rowId}`}
      >
        <PlusCircle className="w-4 h-4" />
      </Button>
    </div>
  );
}
