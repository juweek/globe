/*
------------------------------
Every Threejs code project needs three things: a scene, a camera, and a renderer. we render the scene with the camera and attach it to the dom
------------------------------
*/
const markerSvg = `<svg viewBox="-4 0 36 36">
      <path fill="currentColor" d="M14,0 C21.732,0 28,5.641 28,12.6 C28,23.963 14,36 14,36 C14,36 0,24.064 0,12.6 C0,5.641 6.268,0 14,0 Z"></path>
      <circle fill="black" cx="14" cy="14" r="7"></circle>
    </svg>`;

    // Gen random data for the markers on the globe
    const N = 30;
    const gData = [...Array(N).keys()].map(() => ({
      lat: (Math.random() - 0.5) * 180,
      lng: (Math.random() - 0.5) * 360,
      size: 7 + Math.random() * 30,
      color: ['red', 'white', 'blue', 'green'][Math.round(Math.random() * 3)]
    }));

    // load in the maps to apply to the geospatial data
    const Globe = new ThreeGlobe()
      .globeImageUrl('https://raw.githubusercontent.com/juweek/datasets/main/maps/earth-light.jpg')
      .bumpImageUrl('https://unpkg.com/three-globe@2.24.4/example/img/earth-topology.png')
      .htmlElementsData(gData)
      .htmlElement(d => {
        const el = document.createElement('div');
        el.innerHTML = markerSvg;
        el.style.color = d.color;
        el.style.width = `${d.size}px`;
        return el;
      });

    // Setup renderers
    const renderers = [new THREE.WebGLRenderer(), new THREE.CSS2DRenderer()];
    renderers.forEach((r, idx) => {
      r.setSize(window.innerWidth, window.innerHeight);
      if (idx > 0) {
        // overlay additional on top of main renderer
        r.domElement.style.position = 'absolute';
        r.domElement.style.top = '0px';
        r.domElement.style.pointerEvents = 'none';
      }
      document.getElementById('globeViz').appendChild(r.domElement);
    });

    // Setup scene
    const scene = new THREE.Scene();
    scene.add(Globe);
    scene.add(new THREE.AmbientLight(0xbbbbbb));
    scene.add(new THREE.DirectionalLight(0xffffff, 0.6));

    // Setup camera
    const camera = new THREE.PerspectiveCamera();
    camera.aspect = window.innerWidth/window.innerHeight;
    camera.updateProjectionMatrix();
    camera.position.z = 500;

    // Add camera controls
    const tbControls = new THREE.TrackballControls(camera, renderers[0].domElement);
    tbControls.minDistance = 101;
    tbControls.rotateSpeed = 5;
    tbControls.zoomSpeed = 0.8;

    // Update pov when camera moves
    Globe.setPointOfView(camera.position, Globe.position);
    tbControls.addEventListener('change', () => Globe.setPointOfView(camera.position, Globe.position));

    // Kick-off renderers
    (function animate() { // IIFE
      // Frame cycle
      tbControls.update();
      renderers.forEach(r => r.render(scene, camera));
      requestAnimationFrame(animate);
    })();