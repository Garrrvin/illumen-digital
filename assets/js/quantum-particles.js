/**
 * Quantum Particles Animation
 * A lightweight Three.js implementation of a morphing particle sphere.
 * Adapted for Illumen's "Performance Engineered" aesthetic.
 */

const containerDiv = document.getElementById('quantum-container');

if (containerDiv) {
    // Configuration
    const CONFIG = {
        particleCount: 5000, 
        particleSize: 5,    
        sphereRadius: 180, 
        color: 0xffffff,     
        opacity: 1.0       // Full opacity for maximum brightness
    };

    let scene, camera, renderer, particles, geometry;
    let originalPositions = [];

    let targetPositions = []; // Positions for the sphere shape
    let vortexPositions = []; // Positions for the swirling torus/vortex
    let targetColors = []; // Blue/Purple gradient (Sphere)
    let strategyColors = []; // Gold/Sage gradient (Vortex)
    let initialColors = []; // All white

    let targetStrategyProgress = 0; // Target Progress toward "Strategy" section (0-1)
    let currentStrategyProgress = 0; // Current smoothed progress

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
        // Fog for depth fading - thinner for maximum brilliance
        scene.fog = new THREE.FogExp2(0x050505, 0.0007);

        camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 1, 3000);
        camera.position.z = 600;

        // Custom BufferGeometry
        geometry = new THREE.BufferGeometry();
        const positions = [];
        const colors = [];
        
        const sphereRadius = 250; 

        // Colors
        const colorInitial = new THREE.Color(0xffffff); // Pure white start for Section 1
        const colorBlue = new THREE.Color(0x0066ff); // Deep premium blue
        const colorPurple = new THREE.Color(0xbf00ff); // Radiant Purple
        
        // Vortex strategy colors
        const colorGold = new THREE.Color(0xffd700); 
        const colorSage = new THREE.Color(0x9cda9c); // Sophisticated Sage Green

        for (let i = 0; i < CONFIG.particleCount; i++) {
            // Section 1: "Vision" - A cinematic galaxy distribution (Full screen bleed)
            const x = Math.random() * 2600 - 1300;
            const y = Math.random() * 1600 - 800;
            const z = Math.random() * 800 - 400;

            positions.push(x, y, z);
            originalPositions.push({ x, y, z }); 

            const phi = Math.acos(1 - 2 * (i + 0.5) / CONFIG.particleCount);
            const theta = Math.PI * (1 + Math.sqrt(5)) * (i + 0.5);

            const sx = sphereRadius * Math.sin(phi) * Math.cos(theta);
            const sy = sphereRadius * Math.sin(phi) * Math.sin(theta);
            const sz = sphereRadius * Math.cos(phi);

            targetPositions.push({ x: sx, y: sy, z: sz });

            // Calculate Vortex Positions (Torus shape)
            const torusRadius = 300; 
            const tubeRadius = 100;
            
            const u = (i / CONFIG.particleCount) * Math.PI * 2; 
            const v = ((i % 100) / 100) * Math.PI * 2; 
            
            const vx = (torusRadius + tubeRadius * Math.cos(v)) * Math.cos(u);
            const vy = (torusRadius + tubeRadius * Math.cos(v)) * Math.sin(u);
            const vz = tubeRadius * Math.sin(v);
            
            vortexPositions.push({ x: vx, y: vy, z: vz, u: u, v: v });

            colors.push(colorInitial.r, colorInitial.g, colorInitial.b);
            initialColors.push({ r: colorInitial.r, g: colorInitial.g, b: colorInitial.b });

            const yNorm = sy / sphereRadius; 
            const mixFactor = (yNorm + 1) / 2;
            const targetColor = new THREE.Color().lerpColors(colorBlue, colorPurple, mixFactor);
            targetColors.push({ r: targetColor.r, g: targetColor.g, b: targetColor.b });

            // Vortex Colors (Gold/Sage)
            const stratColor = new THREE.Color().lerpColors(colorGold, colorSage, mixFactor);
            strategyColors.push({ r: stratColor.r, g: stratColor.g, b: stratColor.b });
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
        const scrollPos = window.scrollY;
        
        // 1. Sphere Formation Logic (Section 2 - Capabilities)
        const servicesSection = document.getElementById('services');
        if (servicesSection) {
            const rect = servicesSection.getBoundingClientRect();
            const startForming = window.innerHeight * 1.8; 
            const endForming = window.innerHeight * 0.3;   
            const progress = (startForming - rect.top) / (startForming - endForming);
            targetScroll = Math.max(0, Math.min(1, progress));
        } else {
            targetScroll = Math.min(scrollPos / window.innerHeight, 1);
        }

        // 2. Strategy Transition Logic (Section 3 - Strategy -> Footer)
        const aboutSection = document.getElementById('about');
        if (aboutSection) {
            const rect = aboutSection.getBoundingClientRect();
            const startMorph = window.innerHeight * 0.6; 
            const scrollBottom = document.documentElement.scrollHeight - window.innerHeight;
            
            let progress = 0;
            if (rect.top < startMorph) {
                const totalDist = (scrollBottom - (scrollPos + rect.top)) + startMorph;
                progress = (startMorph - rect.top) / totalDist;
            }
            
            targetStrategyProgress = Math.max(0, Math.min(1, progress));
        }

        // 3. Document/Theme Progress (for background/colors)
        const maxScroll = document.documentElement.scrollHeight - window.innerHeight;
        const scrollRatio = maxScroll > 0 ? scrollPos / maxScroll : 0;
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

        currentScroll += (targetScroll - currentScroll) * 0.03; 
        currentStrategyProgress += (targetStrategyProgress - currentStrategyProgress) * 0.03;

        // Base rotation with strategy tilt
        const targetRotX = currentStrategyProgress * (Math.PI / 2.5); 
        particles.rotation.x += (targetRotX + (mouseY * 0.0001) - particles.rotation.x) * 0.05;
        particles.rotation.y += (mouseX * 0.0001 - particles.rotation.y) * 0.05;
        particles.rotation.y += 0.001 * currentScroll * (1 - currentStrategyProgress);

        // Adjust Fog and Material
        let fogR = 5 + (docProgress * 235);
        let fogG = 5 + (docProgress * 243);
        let fogB = 5 + (docProgress * 250);

        if (currentStrategyProgress > 0) {
            fogR = fogR + (10 - fogR) * currentStrategyProgress;
            fogG = fogG + (15 - fogG) * currentStrategyProgress;
            fogB = fogB + (28 - fogB) * currentStrategyProgress;
        }

        scene.fog.color.setRGB(fogR / 255, fogG / 255, fogB / 255);
        
        const targetDensity = (docProgress > 0.5 && currentStrategyProgress < 0.5) ? 0.001 : 0.002;
        scene.fog.density += (targetDensity - scene.fog.density) * 0.05;
        
        // High opacity for brightness
        const baseOpacity = CONFIG.opacity * (1 - docProgress * 0.25); 
        particles.material.opacity = Math.min(1.0, baseOpacity + (currentStrategyProgress * 0.4));
        
        if (docProgress > 0.3 && currentStrategyProgress < 0.3) {
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
            const cStrat = strategyColors[i];
            
            const cloudAmp = 10 * (1 - currentScroll); 
            const freq = 0.004; 

            const waveX = Math.sin((orig.y + time * 100) * freq) * cloudAmp;
            const waveY = Math.cos((orig.x + time * 100) * freq) * cloudAmp;
            const waveZ = Math.sin((orig.z + time * 100) * freq) * cloudAmp;

            const tx_sphere = orig.x + (target.x - orig.x) * currentScroll;
            const ty_sphere = orig.y + (target.y - orig.y) * currentScroll;
            const tz_sphere = orig.z + (target.z - orig.z) * currentScroll;

            const vor = vortexPositions[i];
            const swirlSpeed = time * 0.2; 
            
            const currentU = vor.u + swirlSpeed;
            const currentV = vor.v + swirlSpeed * 1.5;
            
            const torusR = 300;
            const tubeR = 100;
            
            const tx_vortex = (torusR + tubeR * Math.cos(currentV)) * Math.cos(currentU);
            const ty_vortex = (torusR + tubeR * Math.cos(currentV)) * Math.sin(currentU);
            const tz_vortex = tubeR * Math.sin(currentV);

            const finalTargetX = tx_sphere + (tx_vortex - tx_sphere) * currentStrategyProgress;
            const finalTargetY = ty_sphere + (ty_vortex - ty_sphere) * currentStrategyProgress;
            const finalTargetZ = tz_sphere + (tz_vortex - tz_sphere) * currentStrategyProgress;

            let fx = 0, fy = 0, fz = 0;
            
            if (currentScroll > 0.1 && currentStrategyProgress < 0.8) {
                const dist = Math.sqrt(target.x*target.x + target.y*target.y + target.z*target.z);
                const nx = target.x / dist;
                const ny = target.y / dist;
                const nz = target.z / dist;

                const noise = Math.sin(i * 0.1 + time * FLARE_SPEED * 5) * Math.cos(i * 0.2 + time * FLARE_SPEED * 2);
                const jitter = noise * INSTABILITY_AMP * currentScroll * (1 - currentStrategyProgress);

                const flareWave = Math.sin(nx * 5 + time * 2) * Math.sin(ny * 5 + time * 3) * Math.sin(nz * 5 + time);
                const flarePush = Math.max(0, flareWave) * FLARE_AMP * currentScroll * (1 - currentStrategyProgress);

                fx = nx * (jitter + flarePush);
                fy = ny * (jitter + flarePush);
                fz = nz * (jitter + flarePush);
            }

            positions[i * 3]     = finalTargetX + waveX * (1 - currentStrategyProgress) + fx;
            positions[i * 3 + 1] = finalTargetY + waveY * (1 - currentStrategyProgress) + fy;
            positions[i * 3 + 2] = finalTargetZ + waveZ * (1 - currentStrategyProgress) + fz;

            // COLOR INTERPOLATION - Triple State Blend
            let r_sphere = cOrig.r + (cTarget.r - cOrig.r) * currentScroll;
            let g_sphere = cOrig.g + (cTarget.g - cOrig.g) * currentScroll;
            let b_sphere = cOrig.b + (cTarget.b - cOrig.b) * currentScroll;

            let r = r_sphere + (cStrat.r - r_sphere) * currentStrategyProgress;
            let g = g_sphere + (cStrat.g - g_sphere) * currentStrategyProgress;
            let b = b_sphere + (cStrat.b - b_sphere) * currentStrategyProgress;

            if (docProgress > 0.4 && currentStrategyProgress < 0.5) {
                const lightModeFactor = (docProgress - 0.4) / 0.6;
                r *= (1 - lightModeFactor * 0.40);
                g *= (1 - lightModeFactor * 0.40); 
                b *= (1 - lightModeFactor * 0.35); 
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
