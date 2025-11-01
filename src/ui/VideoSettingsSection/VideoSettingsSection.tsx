import { Slider } from '../Slider/Slider';
import React from 'react';

export const VideoSettingsSection: React.FC<{
    playbackSpeed: number;
    onPlaybackSpeedChange: (speed: number) => void;
}> = ({
    playbackSpeed,
    onPlaybackSpeedChange,
}) => {
    return (
        <>
            <div className="menu-entry">
                <div className="menu-entry-label">Video Settings</div>
            </div>
            <Slider
                title="playback speed:"
                onChange={onPlaybackSpeedChange}
                value={playbackSpeed}
                min={0.1}
                max={3}
                step={0.1}
                label={playbackSpeed.toFixed(1) + 'x'}
            />
        </>
    );
};

