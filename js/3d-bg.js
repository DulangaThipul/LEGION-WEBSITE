/**
 * MONOCHROME PRO AMOLED 3D Background
 * Black & White theme for high-end look
 */

class Background3D {
    constructor() {
        this.canvas = document.getElementById('bg-canvas');
        if (!this.canvas) return;

        this.scene = new THREE.Scene();
        this.camera = new THREE.PerspectiveCamera(70, window.innerWidth / window.innerHeight, 0.1, 1000);

        this.renderer = new THREE.WebGLRenderer({
            canvas: this.canvas,
            antialias: false, // Performance boost
            alpha: true,
            powerPreference: 'high-performance'
        });

        this.mouse = { x: 0, y: 0 };
        this.targetMouse = { x: 0, y: 0 };

        this.particles = null;
        this.bokehOrbs = [];
        this.particleCount = window.innerWidth < 768 ? 2000 : 8000; // Reduced from 4000/12000

        this.targetRotation = { x: 0, y: 0 };
        this.currentRotation = { x: 0, y: 0 };

        // Monochrome Colors for each section
        this.sectionColors = [
            0xffffff, // White
            0xcccccc, // Silver
            0x888888, // Gray
            0xeeeeee, // White
            0x666666  // Dark Silver
        ];

        this.init();
        this.animate();

        window.addEventListener('resize', () => this.onWindowResize());
        window.addEventListener('mousemove', (e) => this.onMouseMove(e));
    }

    init() {
        this.renderer.setSize(window.innerWidth, window.innerHeight);
        this.renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
        this.renderer.setClearColor(0x000000, 0); // Transparent again
        this.camera.position.z = 8; // Move camera back a bit more

        // --- PARTICLE NEBULA ---
        const geometry = new THREE.BufferGeometry();
        const positions = [];
        const colors = [];

        for (let i = 0; i < this.particleCount; i++) {
            positions.push((Math.random() - 0.5) * 30);
            positions.push((Math.random() - 0.5) * 30);
            positions.push((Math.random() - 0.5) * 30);

            colors.push(1, 1, 1);
        }

        geometry.setAttribute('position', new THREE.Float32BufferAttribute(positions, 3));
        geometry.setAttribute('color', new THREE.Float32BufferAttribute(colors, 3));

        const material = new THREE.PointsMaterial({
            size: 0.12,
            vertexColors: true,
            transparent: true,
            opacity: 0.8,
            blending: THREE.AdditiveBlending
        });

        this.particles = new THREE.Points(geometry, material);
        this.scene.add(this.particles);

        // --- BOKEH ORBS ---
        for (let i = 0; i < 15; i++) {
            this.addBokehOrb();
        }
    }

    addBokehOrb() {
        const geo = new THREE.SphereGeometry(Math.random() * 0.8 + 0.2, 16, 16);
        const mat = new THREE.MeshBasicMaterial({
            color: 0xffffff,
            transparent: true,
            opacity: 0.1
        });
        const orb = new THREE.Mesh(geo, mat);
        orb.position.set(
            (Math.random() - 0.5) * 30,
            (Math.random() - 0.5) * 30,
            (Math.random() - 0.5) * 15
        );
        orb.userData = {
            speedX: (Math.random() - 0.5) * 0.01,
            speedY: (Math.random() - 0.5) * 0.01,
            pulse: Math.random() * 0.005
        };
        this.bokehOrbs.push(orb);
        this.scene.add(orb);
    }

    onMouseMove(e) {
        this.targetMouse.x = (e.clientX / window.innerWidth) - 0.5;
        this.targetMouse.y = (e.clientY / window.innerHeight) - 0.5;
    }

    onWindowResize() {
        this.camera.aspect = window.innerWidth / window.innerHeight;
        this.camera.updateProjectionMatrix();
        this.renderer.setSize(window.innerWidth, window.innerHeight);
    }

    updateSection(index) {
        const newColor = new THREE.Color(this.sectionColors[index] || 0xffffff);
        if (this.particles) {
            const colors = this.particles.geometry.attributes.color.array;
            for (let i = 0; i < this.particleCount; i++) {
                const b = Math.random() * 0.5 + 0.5;
                colors[i * 3] = newColor.r * b;
                colors[i * 3 + 1] = newColor.g * b;
                colors[i * 3 + 2] = newColor.b * b;
            }
            this.particles.geometry.attributes.color.needsUpdate = true;
        }
        this.targetRotation.y = index * (Math.PI / 2);
    }

    animate() {
        requestAnimationFrame(() => this.animate());

        this.mouse.x += (this.targetMouse.x - this.mouse.x) * 0.05;
        this.mouse.y += (this.targetMouse.y - this.mouse.y) * 0.05;

        this.camera.position.x += (this.mouse.x * 3 - this.camera.position.x) * 0.05;
        this.camera.position.y += (-this.mouse.y * 3 - this.camera.position.y) * 0.05;
        this.camera.lookAt(0, 0, 0);

        this.currentRotation.y += (this.targetRotation.y - this.currentRotation.y) * 0.03;

        if (this.particles) {
            const speed = window.innerWidth < 768 ? 0.00003 : 0.00005;
            this.particles.rotation.y = this.currentRotation.y + (performance.now() * speed);
            this.particles.rotation.x = Math.sin(performance.now() * 0.0001) * 0.1;
        }

        this.bokehOrbs.forEach(orb => {
            orb.position.x += orb.userData.speedX;
            orb.position.y += orb.userData.speedY;
            const scale = (Math.sin(performance.now() * orb.userData.pulse) * 0.2 + 1);
            orb.scale.set(scale, scale, scale);
        });

        this.renderer.render(this.scene, this.camera);
    }
}

// Instantiation
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => { window.bg3d = new Background3D(); });
} else {
    window.bg3d = new Background3D();
}
