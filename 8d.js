function enable8DAudio(audio) {
    if (!enabled8d) {
        return;
    }
    if (!audioCtx) {
        audioCtx = new (window.AudioContext || window.webkitAudioContext)();
    }

    if (!sourceNode) {
        sourceNode = audioCtx.createMediaElementSource(audio);
    }

    if (panner) {
        panner.disconnect();
    }
    if (rotateInterval) {
        clearInterval(rotateInterval);
    }

    const gainNode = audioCtx.createGain();
    gainNode.gain.value = 3.5;

    panner = audioCtx.createPanner();
    panner.panningModel = 'HRTF';
    panner.distanceModel = 'inverse';
    panner.setPosition(1, 0, 0);

    sourceNode.disconnect(); 

    sourceNode.connect(gainNode);
    gainNode.connect(panner);
    panner.connect(audioCtx.destination);

    rotationAngle = 0;
    rotateInterval = setInterval(() => {
        rotationAngle += 0.03;
        const radius = 2;
        const x = Math.sin(rotationAngle) * radius;
        const z = Math.cos(rotationAngle) * radius;

        panner.setPosition(x, 0, z);
        panner.setOrientation(-x, 0, -z);
    }, 30);
}