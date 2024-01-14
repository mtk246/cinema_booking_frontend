import { useState } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {
    faExpand,
    faMinimize,
} from '@fortawesome/free-solid-svg-icons';
import { Button } from 'react-bootstrap';

const FullscreenButton = () => {
    const [isFullscreen, setIsFullscreen] = useState(false);

    const toggleFullscreen = () => {
        if (!isFullscreen) {
            enterFullscreen();
        } else {
            exitFullscreen();
        }
    };

    const enterFullscreen = () => {
        const docEl = document.documentElement;

        if (docEl.requestFullscreen) {
            docEl.requestFullscreen();
        } else if (docEl.mozRequestFullScreen) {
            docEl.mozRequestFullScreen();
        } else if (docEl.webkitRequestFullscreen) {
            docEl.webkitRequestFullscreen();
        } else if (docEl.msRequestFullscreen) {
            docEl.msRequestFullscreen();
        }

        setIsFullscreen(true);
    };

    const exitFullscreen = () => {
        if (document.exitFullscreen) {
            document.exitFullscreen();
        } else if (document.mozCancelFullScreen) {
            document.mozCancelFullScreen();
        } else if (document.webkitExitFullscreen) {
            document.webkitExitFullscreen();
        } else if (document.msExitFullscreen) {
            document.msExitFullscreen();
        }

        setIsFullscreen(false);
    };

    return (
        <Button
            id="sidebarToggle"
            variant="primary"
            className="rounded-circle border-0 mx-2"
            onClick={toggleFullscreen}
        >
            {isFullscreen
                ? <FontAwesomeIcon icon={faMinimize} />
                : <FontAwesomeIcon icon={faExpand} />
            }
        </Button>
    );
};

export default FullscreenButton;
