/**
 * Quantum Particles Animation
 * A lightweight Three.js implementation of a morphing particle sphere.
 * Adapted for Illumen's "Performance Engineered" aesthetic.
 */

const containerDiv = document.getElementById('quantum-container');

if (containerDiv) {
    // Configuration
    const CONFIG = {
        particleCount: 2200, 
        particleSize: 5,    // Reverted size as requested
        sphereRadius: 180, 
        color: 0xffffff,     
        opacity: 0.7       // Reduced for better text readability
    };

    let scene, camera, renderer, particles, geometry;
    let originalPositions = [];

    let targetPositions = []; // Positions for the sphere shape
    let initialColors = []; // All white
    let targetColors = []; // Cyan/Purple gradient

    // Solar Flare Config
    const FLARE_SPEED = 2;
    const INSTABILITY_AMP = 5; // Base jitters
    const FLARE_AMP = 30; // Occasional bursts

    let currentScroll = 0;
    let targetScroll = 0;
    let docProgress = 0; // Document-wide scroll progress (0-1)
    let time = 0;

    // Mouse Interaction
    let mouseX = 0;
    let mouseY = 0;
    let windowHalfX = window.innerWidth / 2;
    let windowHalfY = window.innerHeight / 2;

    function init() {
        scene = new THREE.Scene();
        // Fog for depth fading - will need update on scroll
        scene.fog = new THREE.FogExp2(0x050505, 0.002);

        camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 1, 3000);
        camera.position.z = 600;

        // Custom BufferGeometry
        geometry = new THREE.BufferGeometry();
        const positions = [];
        const colors = [];
        
        // ... rest of init setup ...
        const sphereRadius = 250; 

        // Colors
        const colorInitial = new THREE.Color(0xbbccdd); // Brighter, icy blue-grey for a premium start
        const colorCyan = new THREE.Color(0x00ffff);
        const colorPurple = new THREE.Color(0xbf00ff); 

        for (let i = 0; i < CONFIG.particleCount; i++) {
            const x = Math.random() * 800 - 400;
            const y = Math.random() * 800 - 400;
            const z = Math.random() * 800 - 400;

            positions.push(x, y, z);
            originalPositions.push({ x, y, z }); 

            const phi = Math.acos(1 - 2 * (i + 0.5) / CONFIG.particleCount);
            const theta = Math.PI * (1 + Math.sqrt(5)) * (i + 0.5);

            const sx = sphereRadius * Math.sin(phi) * Math.cos(theta);
            const sy = sphereRadius * Math.sin(phi) * Math.sin(theta);
            const sz = sphereRadius * Math.cos(phi);

            targetPositions.push({ x: sx, y: sy, z: sz });

            colors.push(colorInitial.r, colorInitial.g, colorInitial.b);
            initialColors.push({ r: colorInitial.r, g: colorInitial.g, b: colorInitial.b });

            const yNorm = sy / sphereRadius; 
            const mixFactor = (yNorm + 1) / 2; 

            const targetColor = new THREE.Color().lerpColors(colorPurple, colorCyan, mixFactor);
            targetColors.push({ r: targetColor.r, g: targetColor.g, b: targetColor.b });
        }

        geometry.setAttribute('position', new THREE.Float32BufferAttribute(positions, 3));
        geometry.setAttribute('color', new THREE.Float32BufferAttribute(colors, 3));

        function createCircleTexture() {
            const size = 32;
            const canvas = document.createElement('canvas');
            canvas.width = size;
            canvas.height = size;
            const context = canvas.getContext('2d');

            context.beginPath();
            context.arc(size / 2, size / 2, size / 2, 0, Math.PI * 2);
            context.fillStyle = '#ffffff';
            context.fill();

            return new THREE.CanvasTexture(canvas);
        }

        const material = new THREE.PointsMaterial({
            color: CONFIG.color,
            size: CONFIG.particleSize, 
            map: createCircleTexture(),
            transparent: true,
            opacity: CONFIG.opacity,
            vertexColors: true, 
            blending: THREE.AdditiveBlending,
            depthWrite: false, 
            depthTest: true,
            alphaTest: 0.01,
            sizeAttenuation: true
        });

        particles = new THREE.Points(geometry, material);
        scene.add(particles);

        renderer = new THREE.WebGLRenderer({ alpha: true, antialias: true });
        renderer.setPixelRatio(window.devicePixelRatio);
        renderer.setSize(window.innerWidth, window.innerHeight);
        containerDiv.appendChild(renderer.domElement);

        document.addEventListener('mousemove', onDocumentMouseMove);
        window.addEventListener('resize', onWindowResize);
        window.addEventListener('scroll', onScroll);
        onScroll(); // Initial position sync
        
        animate();
    }

    function onScroll() {
        const maxScroll = document.documentElement.scrollHeight - window.innerHeight;
        const scrollPos = window.scrollY;
        
        targetScroll = Math.min(scrollPos / window.innerHeight, 1);
        const scrollRatio = maxScroll > 0 ? scrollPos / maxScroll : 0;
        // Stay at 0 until 10% scroll, then transition to 1 by 25% scroll (synced with main.js)
        docProgress = Math.max(0, Math.min(1, (scrollRatio - 0.1) / (0.25 - 0.1)));
    }

    function onDocumentMouseMove(event) {
        mouseX = (event.clientX - windowHalfX) * 0.5;
        mouseY = (event.clientY - windowHalfY) * 0.5;
    }

    function onWindowResize() {
        windowHalfX = window.innerWidth / 2;
        windowHalfY = window.innerHeight / 2;
        camera.aspect = window.innerWidth / window.innerHeight;
        camera.updateProjectionMatrix();
        renderer.setSize(window.innerWidth, window.innerHeight);
    }

    function animate() {
        requestAnimationFrame(animate);

        time += 0.002;

        currentScroll += (targetScroll - currentScroll) * 0.05;

        particles.rotation.x += (mouseY * 0.0005 - particles.rotation.x) * 0.05;
        particles.rotation.y += (mouseX * 0.0005 - particles.rotation.y) * 0.05;
        particles.rotation.y += 0.002 * currentScroll; 

        // Adjust Fog and Material for icy white background
        const fogR = 5 + (docProgress * 235);
        const fogG = 5 + (docProgress * 243);
        const fogB = 5 + (docProgress * 250);
        scene.fog.color.setRGB(fogR / 255, fogG / 255, fogB / 255);
        // Reduce fog density on scroll to see "deeper" into the sphere
        scene.fog.density = 0.002 * (1 - docProgress * 0.5); 
        
        // Keep them more visible on the light background
        particles.material.opacity = CONFIG.opacity * (1 - docProgress * 0.4); 
        
        // Switch to NormalBlending MUCH earlier to prevent "washing out" on light colors
        if (docProgress > 0.3) {
            particles.material.blending = THREE.NormalBlending;
        } else {
            particles.material.blending = THREE.AdditiveBlending;
        }

        const positions = geometry.attributes.position.array;
        const colors = geometry.attributes.color.array;
        
        for (let i = 0; i < CONFIG.particleCount; i++) {
            const orig = originalPositions[i];
            const target = targetPositions[i];
            const cOrig = initialColors[i];
            const cTarget = targetColors[i];
            
            const cloudAmp = 20 * (1 - currentScroll); 
            const freq = 0.005;

            const waveX = Math.sin((orig.y + time * 100) * freq) * cloudAmp;
            const waveY = Math.cos((orig.x + time * 100) * freq) * cloudAmp;
            const waveZ = Math.sin((orig.z + time * 100) * freq) * cloudAmp;

            const tx = orig.x + (target.x - orig.x) * currentScroll;
            const ty = orig.y + (target.y - orig.y) * currentScroll;
            const tz = orig.z + (target.z - orig.z) * currentScroll;

            let fx = 0, fy = 0, fz = 0;
            
            if (currentScroll > 0.1) {
                const dist = Math.sqrt(target.x*target.x + target.y*target.y + target.z*target.z);
                const nx = target.x / dist;
                const ny = target.y / dist;
                const nz = target.z / dist;

                const noise = Math.sin(i * 0.1 + time * FLARE_SPEED * 5) * Math.cos(i * 0.2 + time * FLARE_SPEED * 2);
                const jitter = noise * INSTABILITY_AMP * currentScroll;

                const flareWave = Math.sin(nx * 5 + time * 2) * Math.sin(ny * 5 + time * 3) * Math.sin(nz * 5 + time);
                const flarePush = Math.max(0, flareWave) * FLARE_AMP * currentScroll;

                const radialOffset = jitter + flarePush;

                fx = nx * radialOffset;
                fy = ny * radialOffset;
                fz = nz * radialOffset;
            }

            positions[i * 3]     = tx + waveX + fx;
            positions[i * 3 + 1] = ty + waveY + fy;
            positions[i * 3 + 2] = tz + waveZ + fz;

            // COLOR INTERPOLATION - Sync with both morph (currentScroll) and theme (docProgress)
            // This ensures they are colorful as soon as the background lightens
            const colorProgress = Math.max(currentScroll, docProgress);
            
            let r = cOrig.r + (cTarget.r - cOrig.r) * colorProgress;
            let g = cOrig.g + (cTarget.g - cOrig.g) * colorProgress;
            let b = cOrig.b + (cTarget.b - cOrig.b) * colorProgress;

            if (docProgress > 0.1) {
                // For white background, we want them to be MORE saturated, not just darker
                // We'll keep the hue strong but lower the brightness so they stand out
                const lightModeFactor = docProgress;
                r *= (1 - lightModeFactor * 0.5);
                g *= (1 - lightModeFactor * 0.4); // Darken G less to keep the Cyan feel
                b *= (1 - lightModeFactor * 0.3); // Darken B the least to keep the blue/purple pop
            }

            colors[i * 3]     = r;
            colors[i * 3 + 1] = g;
            colors[i * 3 + 2] = b;
        }
        
        geometry.attributes.position.needsUpdate = true;
        geometry.attributes.color.needsUpdate = true;

        renderer.render(scene, camera);
    }

    init();
}
