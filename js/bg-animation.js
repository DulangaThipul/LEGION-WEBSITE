const canvas = document.createElement('canvas');
const ctx = canvas.getContext('2d');
canvas.id = 'bg-canvas';
document.body.prepend(canvas);

// Style the canvas to sit behind everything
canvas.style.position = 'fixed';
canvas.style.top = '0';
canvas.style.left = '0';
canvas.style.width = '100%';
canvas.style.height = '100%';
canvas.style.zIndex = '-1';
canvas.style.background = 'linear-gradient(to bottom, #0a0a0a, #1a1a1a)'; // Fallback/Base

// Ensure body background doesn't hide the canvas
document.body.style.backgroundColor = 'transparent';

let particlesArray;

// Get window size
let width = window.innerWidth;
let height = window.innerHeight;
canvas.width = width;
canvas.height = height;

// Handle resize
window.addEventListener('resize', () => {
    width = window.innerWidth;
    height = window.innerHeight;
    canvas.width = width;
    canvas.height = height;
    init();
});

// Particle class
class Particle {
    constructor() {
        this.x = Math.random() * width;
        this.y = Math.random() * height;
        this.directionX = (Math.random() * 0.5) - 0.25;
        this.directionY = (Math.random() * 0.5) - 0.25;
        this.size = Math.random() * 2;
        this.color = Math.random() > 0.5 ? '#00f3ff' : '#bc13fe'; // Neon Blue or Purple
    }

    // Method to draw individual particle
    draw() {
        ctx.beginPath();
        ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2, false);
        ctx.fillStyle = this.color;
        ctx.globalAlpha = 0.5; // Slight transparency
        ctx.fill();
    }

    // Check particle position, check mouse position, move the particle, draw the particle
    update() {
        // limit particles within canvas
        if (this.x > canvas.width || this.x < 0) {
            this.directionX = -this.directionX;
        }
        if (this.y > canvas.height || this.y < 0) {
            this.directionY = -this.directionY;
        }

        // move particle
        this.x += this.directionX;
        this.y += this.directionY;

        // draw particle
        this.draw();
    }
}

// Create particle array
function init() {
    particlesArray = [];
    let numberOfParticles = (canvas.height * canvas.width) / 15000; // Adjust density here
    // Increase density for mobile to make it look "fuller"
    if (width < 768) {
        numberOfParticles = (canvas.height * canvas.width) / 8000;
    }

    for (let i = 0; i < numberOfParticles; i++) {
        particlesArray.push(new Particle());
    }
}

// Animation Loop
function animate() {
    requestAnimationFrame(animate);
    ctx.clearRect(0, 0, innerWidth, innerHeight);

    for (let i = 0; i < particlesArray.length; i++) {
        particlesArray[i].update();
    }
    connect();
}

// Check if particles are close enough to draw line between them
function connect() {
    let opacityValue = 1;
    for (let a = 0; a < particlesArray.length; a++) {
        for (let b = a; b < particlesArray.length; b++) {
            let distance = ((particlesArray[a].x - particlesArray[b].x) * (particlesArray[a].x - particlesArray[b].x))
                + ((particlesArray[a].y - particlesArray[b].y) * (particlesArray[a].y - particlesArray[b].y));

            // Connection distance
            let connectDistance = (canvas.width / 7) * (canvas.height / 7);
            if (width < 768) connectDistance = 4000; // Smaller connection distance on mobile

            if (distance < connectDistance) {
                opacityValue = 1 - (distance / 20000);
                if (width < 768) opacityValue = 1 - (distance / 5000);

                ctx.strokeStyle = 'rgba(188, 19, 254,' + opacityValue * 0.2 + ')'; // Purple lines
                ctx.lineWidth = 1;
                ctx.beginPath();
                ctx.moveTo(particlesArray[a].x, particlesArray[a].y);
                ctx.lineTo(particlesArray[b].x, particlesArray[b].y);
                ctx.stroke();
            }
        }
    }
}

init();
animate();
