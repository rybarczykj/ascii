import React from 'react';

interface StreamingVideoProcessorProps {
    videoFile: File | null;
    onVideoElementReady: (videoElement: HTMLVideoElement) => void;
    onError?: (error: string) => void;
    playbackSpeed?: number;
}

export const StreamingVideoProcessor: React.FC<StreamingVideoProcessorProps> = ({
    videoFile,
    onVideoElementReady,
    onError,
    playbackSpeed = 1,
}) => {
    const videoRef = React.useRef<HTMLVideoElement>(null);

    // Apply playback speed when it changes
    React.useEffect(() => {
        if (videoRef.current) {
            videoRef.current.playbackRate = playbackSpeed;
        }
    }, [playbackSpeed]);

    React.useEffect(() => {
        if (!videoFile || !videoRef.current) return;

        const video = videoRef.current;
        const videoUrl = URL.createObjectURL(videoFile);

        const handleLoadedMetadata = () => {
            console.log('Video loaded metadata - calling onVideoElementReady');
            // Set initial playback speed
            video.playbackRate = playbackSpeed;
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
    }, [videoFile, onVideoElementReady, onError, playbackSpeed]);

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

// Hook for managing video playback state
export const useVideoPlayback = (videoElement: HTMLVideoElement | null) => {
    const [isPlaying, setIsPlaying] = React.useState(false);
    const [currentTime, setCurrentTime] = React.useState(0);
    const [duration, setDuration] = React.useState(0);

    React.useEffect(() => {
        if (!videoElement) return;

        const handleTimeUpdate = () => {
            setCurrentTime(videoElement.currentTime);
        };

        const handleLoadedMetadata = () => {
            setDuration(videoElement.duration);
        };

        const handlePlay = () => {
            setIsPlaying(true);
        };

        const handlePause = () => {
            setIsPlaying(false);
        };

        const handleEnded = () => {
            setIsPlaying(false);
        };

        videoElement.addEventListener('timeupdate', handleTimeUpdate);
        videoElement.addEventListener('loadedmetadata', handleLoadedMetadata);
        videoElement.addEventListener('play', handlePlay);
        videoElement.addEventListener('pause', handlePause);
        videoElement.addEventListener('ended', handleEnded);

        return () => {
            videoElement.removeEventListener('timeupdate', handleTimeUpdate);
            videoElement.removeEventListener('loadedmetadata', handleLoadedMetadata);
            videoElement.removeEventListener('play', handlePlay);
            videoElement.removeEventListener('pause', handlePause);
            videoElement.removeEventListener('ended', handleEnded);
        };
    }, [videoElement]);

    const play = React.useCallback(() => {
        if (videoElement) {
            videoElement.play();
        }
    }, [videoElement]);

    const pause = React.useCallback(() => {
        if (videoElement) {
            videoElement.pause();
        }
    }, [videoElement]);

    const seek = React.useCallback((time: number) => {
        if (videoElement) {
            videoElement.currentTime = time;
        }
    }, [videoElement]);

    const restart = React.useCallback(() => {
        if (videoElement) {
            videoElement.currentTime = 0;
            videoElement.play();
        }
    }, [videoElement]);

    return {
        isPlaying,
        currentTime,
        duration,
        play,
        pause,
        seek,
        restart,
    };
}; 