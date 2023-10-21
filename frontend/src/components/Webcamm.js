import React, { useState, useRef } from 'react';
import Webcam from 'react-webcam';
import axios from 'axios';
import './Webcamm.css';

function Webcamm() {
    const webcamRef = useRef(null);
    const [capturedImage, setCapturedImage] = useState(null);
    const [capturing, setCapturing] = useState(false);
    const [isCameraOn, setIsCameraOn] = useState(false);
    const [isFlashlightOn, setIsFlashlightOn] = useState(false);

    const toggleCamera = async () => {
        try {
            if (isCameraOn) {
                const tracks = webcamRef.current.video.srcObject.getTracks();
                tracks.forEach(track => track.stop());
                webcamRef.current.video.srcObject = null;

                // Turn off flashlight (if supported)
                const videoTracks = tracks.filter(track => track.kind === 'video');
                if (videoTracks.length > 0) {
                    const capabilities = videoTracks[0].getCapabilities();
                    if (capabilities.torch && capabilities.torch === true) {
                        videoTracks[0].applyConstraints({ advanced: [{ torch: false }] });
                    }
                }
            } else {
                const stream = await navigator.mediaDevices.getUserMedia({ video: true });
                webcamRef.current.video.srcObject = stream;
            }

            setIsCameraOn(prev => !prev);
        } catch (error) {
            console.error('Error accessing the camera:', error);
        }
    };

    const toggleFlashlight = () => {
        if (webcamRef.current && webcamRef.current.video && webcamRef.current.video.srcObject) {
            setIsFlashlightOn(prev => !prev);
            const videoTracks = webcamRef.current.video.srcObject.getVideoTracks();
            videoTracks.forEach(track => {
                const capabilities = track.getCapabilities();
                if (capabilities.torch) {
                    track.applyConstraints({ advanced: [{ torch: !isFlashlightOn }] });
                }
            });
        }
    };


    const startCapture = () => {
        if (isCameraOn) {
            setCapturing(true);
        }
    };

    const stopCapture = () => {
        setCapturing(false);
        const imageSrc = webcamRef.current.getScreenshot();
        const imageBlob = dataURItoBlob(imageSrc);

        setCapturedImage(imageBlob);

        saveFrame(imageBlob);
    };

    const saveFrame = (imageData) => {
        const formData = new FormData();
        formData.append('image', imageData);

        axios.post('http://localhost:3001/saveFrame', formData)
            .then((response) => {
                console.log(response.data.message);
            })
            .catch((error) => {
                console.error('Error saving frame:', error);
            });
    };

    function dataURItoBlob(dataURI) {
        const byteString = atob(dataURI.split(',')[1]);
        const mimeString = dataURI.split(',')[0].split(':')[1].split(';')[0];
        const ab = new ArrayBuffer(byteString.length);
        const ia = new Uint8Array(ab);

        for (let i = 0; i < byteString.length; i++) {
            ia[i] = byteString.charCodeAt(i);
        }

        return new Blob([ab], { type: mimeString });
    }

    return (
        <div className="webcam-container">
            <Webcam
                audio={false}
                ref={webcamRef}
                screenshotFormat="image/jpeg"
            />
            <h2 className="button-text">Let's Communicate to the Art of Signing!</h2>
            <div className="button-container">
                <button onClick={toggleCamera}>
                    {isCameraOn ? 'Turn off Camera' : 'Turn on Camera'}
                </button>
                <button onClick={toggleFlashlight}>
                    {isFlashlightOn ? 'Turn off Flashlight' : 'Turn on Flashlight'}
                </button>
                {isCameraOn && !capturing && (
                    <button onClick={startCapture}>Start Capture</button>
                )}
                {isCameraOn && capturing && (
                    <button onClick={stopCapture}>Stop Capture</button>
                )}
            </div>
        </div>
    );
}

export default Webcamm;