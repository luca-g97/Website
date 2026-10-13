import createGlobe from "https://cdn.jsdelivr.net/npm/cobe@0.6.3/+esm";

const canvas = document.getElementById("cobe-globe");

if (canvas) {
    let phi = 0;
    let globe = null;

    const resizeObserver = new ResizeObserver(() => {
        if (canvas.offsetWidth > 0 && !globe) {
            globe = createGlobe(canvas, {
                devicePixelRatio: 2,
                width: canvas.offsetWidth * 2,
                height: canvas.offsetHeight * 2,
                phi: 0,
                theta: 0.1,
                dark: 1,
                diffuse: 1.2,
                mapSamples: 20000,
                mapBrightness: 6,
                baseColor: [0.08, 0.08, 0.08],
                markerColor: [0.7, 0.1, 0.1], // Hagenberg Red
                glowColor: [0.03, 0.03, 0.03],
                markers: [
                    { location: [48.368, 14.513], size: 0.07 }
                ],
                onRender: (state) => {
                    state.phi = phi;
                    phi += 0.004;
                    state.width = canvas.offsetWidth * 2;
                    state.height = canvas.offsetHeight * 2;
                }
            });
            resizeObserver.disconnect();
        }
    });
    resizeObserver.observe(canvas.parentElement);
}