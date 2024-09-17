import { useEffect, useMemo, useRef, useState } from "react";
import Videojs from "./Videojs";
import throttle from "../throttle";

const VideojsInited = ({ videoSrc, startTime, onTimeUpdate }) => {
    // const videoRef = useRef();
    const [isLoadedMetadata, set_isLoadedMetadata] = useState(false)
    const playerRef = useRef(null);
    // console.log('log 3', videoSrc, startTime, onTimeUpdate)
    const videoJsOptions = useMemo(() => ({
        controls: true,
        autoplay: true,
        preload: 'auto',
        fluid: true,
        sources: [{
            src: videoSrc,
            type: 'video/mp4'
        }],
        html5: {
            nativeControlsForTouch: false,
        },
        playsinline: true,
    }), videoSrc);
    const throttledTimeUpdate = throttle(() => onTimeUpdate(playerRef.current.currentTime()), 200)

    const handlePlayerReady = (player) => {
        playerRef.current = player;
        console.log('log 1')
        set_isLoadedMetadata(true);
        try {
            console.log("occurances[playingOccuranceIndex].startTime", startTime);
            player.currentTime(startTime);
        } catch (error) {
            console.error('onLoadedMetadata error: ', error);
        }

        // You can handle player events here, for example:
        player.on('waiting', () => {
            console.log('player is waiting');
        });

        player.on('dispose', () => {
            console.log('player will dispose');
        });

        player.on('timeupdate', () => {
            if (onTimeUpdate && typeof onTimeUpdate === 'function') {
                throttledTimeUpdate()
            }
        })
    };

    async function playVideo() {
        console.log('play next')
        try {
            await playerRef.current.currentTime(startTime)
            await playerRef.current.play()
        } catch (error) {
            console.log('PLAY ERROR', error)
        }
    }

    useEffect(() => {
        if (isLoadedMetadata) {
            playVideo()
        }
    }, [startTime, isLoadedMetadata])

    return (
        <Videojs options={videoJsOptions} onReady={handlePlayerReady} />
    )
}

export default VideojsInited