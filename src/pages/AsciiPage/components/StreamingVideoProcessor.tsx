import React from 'react';

interface StreamingVideoProcessorProps {
    videoFile: File | null;
    onVideoElementReady: (videoElement: HTMLVideoElement) => void;
    onError?: (error: string) => void;
}

export const StreamingVideoProcessor: React.FC<StreamingVideoProcessorProps> = ({
    videoFile,
    onVideoElementReady,
    onError,
}) => {
    const videoRef = React.useRef<HTMLVideoElement>(null);

    React.useEffect(() => {
        if (!videoFile || !videoRef.current) return;

        const video = videoRef.current;
        const videoUrl = URL.createObjectURL(videoFile);

        const handleLoadedMetadata = () => {
            onVideoElementReady(video);
            // Start playing automatically
            video.play().catch((error) => {
                console.warn('Auto-play failed:', error);
                onError?.('Auto-play failed: ' + error.message);
            });
        };

        const handleError = (event: Event) => {
            const error = event.target as HTMLVideoElement;
            console.error('Video loading error:', error.error);
            onError?.('Failed to load video file: ' + (error.error?.message || 'Unknown error'));
        };

        const handleEnded = () => {
            // Loop the video
            video.currentTime = 0;
            video.play().catch((error) => {
                console.warn('Loop play failed:', error);
                onError?.('Loop play failed: ' + error.message);
            });
        };

        video.addEventListener('loadedmetadata', handleLoadedMetadata);
        video.addEventListener('error', handleError);
        video.addEventListener('ended', handleEnded);

        video.src = videoUrl;

        return () => {
            video.removeEventListener('loadedmetadata', handleLoadedMetadata);
            video.removeEventListener('error', handleError);
            video.removeEventListener('ended', handleEnded);
            URL.revokeObjectURL(videoUrl);
        };
    }, [videoFile, onVideoElementReady, onError]);

    if (!videoFile) {
        return null;
    }

    return (
        <video
            ref={videoRef}
            style={{ display: 'none' }}
            controls={false}
            muted
            playsInline
            loop
        />
    );
};


