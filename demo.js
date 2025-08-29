class Demo {
    constructor() {
        this.canvas = document.getElementById('main-canvas');
        this.ctx = this.canvas.getContext('2d');
        this.time = 0;
        this.plasmaData = [];
        this.effectMode = 0;
        this.maxModes = 17; // Maximum demoscene power!
        this.sceneStartTime = 0;
        this.sceneLength = 300; // frames per scene
        this.autoTransition = true;
        this.bouncingBalls = [];
        this.rasterBars = [];
        this.cubeRotation = { x: 0, y: 0, z: 0 };
        this.triangles = [];
        this.triangleRotation = { x: 0, y: 0, z: 0 };
        this.credits = [
            "CODER: m0s",
            "MUSIC: RAZOR02 BY MAKTONE", 
            "RAZOR 1911",
            "GREETINGS TO:",
            "THE SILENTS",
            "FAIRLIGHT", 
            "TRIAD",
            "RAZOR 1911"
        ];
        this.creditsIndex = 0;
        this.audioElement = null;
        
        this.setupCanvas();
        this.initPlasma();
        this.initBouncingBalls();
        this.initRasterBars();
        this.init3DTriangles();
        this.initAudio();
        this.animate();
        
        document.addEventListener('keydown', this.handleKeyPress.bind(this));
        document.addEventListener('click', this.handleClick.bind(this));
    }
    
    setupCanvas() {
        // Lower resolution for pixelated look
        this.lowResWidth = Math.floor(window.innerWidth / 3);
        this.lowResHeight = Math.floor(window.innerHeight / 3);
        
        this.canvas.width = this.lowResWidth;
        this.canvas.height = this.lowResHeight;
        
        // Scale canvas up with CSS for pixel doubling effect
        this.canvas.style.width = window.innerWidth + 'px';
        this.canvas.style.height = window.innerHeight + 'px';
        this.canvas.style.imageRendering = 'pixelated';
        
        // Disable smoothing for sharp pixels
        this.ctx.imageSmoothingEnabled = false;
        this.ctx.webkitImageSmoothingEnabled = false;
        this.ctx.mozImageSmoothingEnabled = false;
        this.ctx.msImageSmoothingEnabled = false;
        
        window.addEventListener('resize', () => {
            this.lowResWidth = Math.floor(window.innerWidth / 3);
            this.lowResHeight = Math.floor(window.innerHeight / 3);
            
            this.canvas.width = this.lowResWidth;
            this.canvas.height = this.lowResHeight;
            this.canvas.style.width = window.innerWidth + 'px';
            this.canvas.style.height = window.innerHeight + 'px';
            
            this.ctx.imageSmoothingEnabled = false;
            this.initPlasma();
        });
    }
    
    initBouncingBalls() {
        for (let i = 0; i < 5; i++) {
            this.bouncingBalls.push({
                x: Math.random() * this.canvas.width,
                y: Math.random() * this.canvas.height,
                vx: (Math.random() - 0.5) * 4,
                vy: (Math.random() - 0.5) * 4,
                color: `hsl(${Math.random() * 360}, 100%, 50%)`,
                radius: 5 + Math.random() * 10
            });
        }
    }
    
    initRasterBars() {
        for (let i = 0; i < 8; i++) {
            this.rasterBars.push({
                y: i * 40,
                speed: 1 + Math.random() * 2,
                color: `hsl(${i * 45}, 100%, 50%)`,
                height: 20
            });
        }
    }
    
    init3DTriangles() {
        // Create multiple 3D triangles at different positions
        for (let i = 0; i < 12; i++) {
            const triangle = {
                vertices: [
                    [0, -30, 0],      // top vertex
                    [-25, 20, 0],     // bottom left
                    [25, 20, 0]       // bottom right
                ],
                position: [
                    (Math.random() - 0.5) * 200,
                    (Math.random() - 0.5) * 200,
                    (Math.random() - 0.5) * 100
                ],
                rotation: {
                    x: Math.random() * Math.PI * 2,
                    y: Math.random() * Math.PI * 2,
                    z: Math.random() * Math.PI * 2
                },
                rotationSpeed: {
                    x: (Math.random() - 0.5) * 0.08,
                    y: (Math.random() - 0.5) * 0.08,
                    z: (Math.random() - 0.5) * 0.08
                },
                colorPhase: Math.random() * Math.PI * 2
            };
            this.triangles.push(triangle);
        }
    }
    
    draw3DTriangles() {
        const centerX = this.canvas.width / 2;
        const centerY = this.canvas.height / 2;
        
        this.triangles.forEach((triangle, index) => {
            // Update rotation
            triangle.rotation.x += triangle.rotationSpeed.x;
            triangle.rotation.y += triangle.rotationSpeed.y;
            triangle.rotation.z += triangle.rotationSpeed.z;
            
            // Calculate color based on time and triangle index
            const hue = (this.time * 2 + triangle.colorPhase + index * 30) % 360;
            const color = `hsl(${hue}, 100%, 60%)`;
            
            // Transform vertices
            const transformedVertices = triangle.vertices.map(([x, y, z]) => {
                // Apply triangle's local rotation
                let newX = x;
                let newY = y;
                let newZ = z;
                
                // Rotate around X axis
                const cosX = Math.cos(triangle.rotation.x);
                const sinX = Math.sin(triangle.rotation.x);
                const tempY = newY * cosX - newZ * sinX;
                newZ = newY * sinX + newZ * cosX;
                newY = tempY;
                
                // Rotate around Y axis
                const cosY = Math.cos(triangle.rotation.y);
                const sinY = Math.sin(triangle.rotation.y);
                const tempX = newX * cosY - newZ * sinY;
                newZ = newX * sinY + newZ * cosY;
                newX = tempX;
                
                // Rotate around Z axis
                const cosZ = Math.cos(triangle.rotation.z);
                const sinZ = Math.sin(triangle.rotation.z);
                const finalX = newX * cosZ - newY * sinZ;
                const finalY = newX * sinZ + newY * cosZ;
                
                // Apply triangle position
                const worldX = finalX + triangle.position[0];
                const worldY = finalY + triangle.position[1];
                const worldZ = newZ + triangle.position[2];
                
                // Apply global scene rotation
                const globalCosY = Math.cos(this.time * 0.01);
                const globalSinY = Math.sin(this.time * 0.01);
                const rotatedX = worldX * globalCosY - worldZ * globalSinY;
                const rotatedZ = worldX * globalSinY + worldZ * globalCosY;
                
                // Project to 2D with perspective
                const perspective = 1 / (1 + (rotatedZ + 300) * 0.003);
                return [
                    centerX + rotatedX * perspective,
                    centerY + worldY * perspective,
                    rotatedZ
                ];
            });
            
            // Draw triangle with glow effect
            this.ctx.fillStyle = color;
            this.ctx.strokeStyle = color;
            this.ctx.lineWidth = 2;
            this.ctx.shadowBlur = 15;
            this.ctx.shadowColor = color;
            this.ctx.globalAlpha = 0.8;
            
            this.ctx.beginPath();
            this.ctx.moveTo(transformedVertices[0][0], transformedVertices[0][1]);
            this.ctx.lineTo(transformedVertices[1][0], transformedVertices[1][1]);
            this.ctx.lineTo(transformedVertices[2][0], transformedVertices[2][1]);
            this.ctx.closePath();
            this.ctx.fill();
            this.ctx.stroke();
            
            this.ctx.shadowBlur = 0;
            this.ctx.globalAlpha = 1;
        });
    }
    
    drawVectorBalls() {
        const centerX = this.canvas.width / 2;
        const centerY = this.canvas.height / 2;
        
        for (let i = 0; i < 6; i++) {
            const angle = (this.time * 0.02) + (i * Math.PI * 2 / 6);
            const radius = 80 + Math.sin(this.time * 0.015 + i) * 30;
            
            const x = centerX + Math.cos(angle) * radius;
            const y = centerY + Math.sin(angle) * radius;
            
            const ballRadius = 15 + Math.sin(this.time * 0.03 + i * 2) * 8;
            const hue = (this.time * 3 + i * 60) % 360;
            const color = `hsl(${hue}, 100%, 70%)`;
            
            // Draw ball with trail effect
            this.ctx.fillStyle = color;
            this.ctx.shadowBlur = 20;
            this.ctx.shadowColor = color;
            this.ctx.globalAlpha = 0.9;
            
            this.ctx.beginPath();
            this.ctx.arc(x, y, ballRadius, 0, Math.PI * 2);
            this.ctx.fill();
            
            // Draw connecting lines
            if (i > 0) {
                const prevAngle = (this.time * 0.02) + ((i-1) * Math.PI * 2 / 6);
                const prevRadius = 80 + Math.sin(this.time * 0.015 + (i-1)) * 30;
                const prevX = centerX + Math.cos(prevAngle) * prevRadius;
                const prevY = centerY + Math.sin(prevAngle) * prevRadius;
                
                this.ctx.strokeStyle = color;
                this.ctx.lineWidth = 3;
                this.ctx.globalAlpha = 0.6;
                this.ctx.beginPath();
                this.ctx.moveTo(prevX, prevY);
                this.ctx.lineTo(x, y);
                this.ctx.stroke();
            }
        }
        
        this.ctx.shadowBlur = 0;
        this.ctx.globalAlpha = 1;
    }
    
    initAudio() {
        this.audioElement = document.getElementById('mod-audio');
        console.log('Audio element found:', !!this.audioElement);
    }
    
    startMusic() {
        if (this.audioElement) {
            this.audioElement.play().then(() => {
                console.log('Audio started playing');
            }).catch(error => {
                console.error('Failed to play audio:', error);
                // Fallback: show message to user
                alert('Click to enable audio, then press M to toggle music');
            });
        }
    }
    
    stopMusic() {
        if (this.audioElement && !this.audioElement.paused) {
            this.audioElement.pause();
            this.audioElement.currentTime = 0;
            console.log('Audio stopped');
        }
    }
    
    initPlasma() {
        const width = this.canvas.width;
        const height = this.canvas.height;
        this.plasmaData = [];
        
        for (let y = 0; y < height; y += 4) {
            for (let x = 0; x < width; x += 4) {
                this.plasmaData.push({ x, y });
            }
        }
    }
    
    drawPlasma() {
        const imageData = this.ctx.createImageData(this.canvas.width, this.canvas.height);
        const data = imageData.data;
        
        // Use bigger pixels for more retro look
        for (let y = 0; y < this.canvas.height; y += 1) {
            for (let x = 0; x < this.canvas.width; x += 1) {
                const plasma = this.calculatePlasma(x * 3, y * 3, this.time);
                const color = this.plasmaToColor(plasma);
                
                const index = (y * this.canvas.width + x) * 4;
                if (index < data.length) {
                    data[index] = color.r;
                    data[index + 1] = color.g;
                    data[index + 2] = color.b;
                    data[index + 3] = 150; // Slightly more visible
                }
            }
        }
        
        this.ctx.putImageData(imageData, 0, 0);
    }
    
    calculatePlasma(x, y, time) {
        const centerX = this.canvas.width / 2;
        const centerY = this.canvas.height / 2;
        
        const dist1 = Math.sqrt((x - centerX) ** 2 + (y - centerY) ** 2);
        const dist2 = Math.sqrt((x - centerX / 2) ** 2 + (y - centerY / 2) ** 2);
        
        const plasma = 
            Math.sin(dist1 / 30 + time * 0.02) +
            Math.sin(dist2 / 40 + time * 0.03) +
            Math.sin(x / 50 + time * 0.01) +
            Math.sin(y / 60 + time * 0.015) +
            Math.sin((x + y) / 80 + time * 0.025);
            
        return plasma;
    }
    
    plasmaToColor(plasma) {
        const normalized = (plasma + 5) / 10; // Normalize to 0-1
        
        const r = Math.floor(128 + 127 * Math.sin(normalized * Math.PI * 2));
        const g = Math.floor(128 + 127 * Math.sin(normalized * Math.PI * 2 + 2));
        const b = Math.floor(128 + 127 * Math.sin(normalized * Math.PI * 2 + 4));
        
        return { r, g, b };
    }
    
    drawSineWaves() {
        this.ctx.strokeStyle = '#00ffff';
        this.ctx.lineWidth = 2;
        this.ctx.globalAlpha = 0.7;
        
        for (let wave = 0; wave < 3; wave++) {
            this.ctx.beginPath();
            
            for (let x = 0; x < this.canvas.width; x += 5) {
                const y = this.canvas.height * 0.3 + 
                         Math.sin((x * 0.01 + this.time * 0.02 + wave * 2)) * 50 +
                         Math.sin((x * 0.005 + this.time * 0.015 + wave * 3)) * 30;
                
                if (x === 0) {
                    this.ctx.moveTo(x, y);
                } else {
                    this.ctx.lineTo(x, y);
                }
            }
            
            this.ctx.stroke();
        }
        
        this.ctx.globalAlpha = 1;
    }
    
    drawTunnel() {
        const centerX = this.canvas.width / 2;
        const centerY = this.canvas.height / 2;
        
        this.ctx.strokeStyle = '#ff0080';
        this.ctx.lineWidth = 1;
        this.ctx.globalAlpha = 0.5;
        
        for (let i = 1; i < 20; i++) {
            const radius = i * 30 + this.time * 2;
            const x = centerX + Math.sin(this.time * 0.01 + i * 0.3) * 50;
            const y = centerY + Math.cos(this.time * 0.015 + i * 0.2) * 30;
            
            this.ctx.beginPath();
            this.ctx.arc(x, y, radius % (this.canvas.width / 2), 0, Math.PI * 2);
            this.ctx.stroke();
        }
        
        this.ctx.globalAlpha = 1;
    }
    
    draw3DCube() {
        const centerX = this.canvas.width / 2;
        const centerY = this.canvas.height / 2;
        const size = 50;
        
        // 3D cube vertices
        const vertices = [
            [-1, -1, -1], [1, -1, -1], [1, 1, -1], [-1, 1, -1], // back face
            [-1, -1, 1], [1, -1, 1], [1, 1, 1], [-1, 1, 1]      // front face
        ];
        
        // Rotate vertices
        const rotatedVertices = vertices.map(([x, y, z]) => {
            // Rotate around Y axis
            const cosY = Math.cos(this.cubeRotation.y);
            const sinY = Math.sin(this.cubeRotation.y);
            const newX = x * cosY - z * sinY;
            const newZ = x * sinY + z * cosY;
            
            // Rotate around X axis
            const cosX = Math.cos(this.cubeRotation.x);
            const sinX = Math.sin(this.cubeRotation.x);
            const finalY = y * cosX - newZ * sinX;
            const finalZ = y * sinX + newZ * cosX;
            
            // Project to 2D
            const perspective = 1 / (1 + finalZ * 0.5);
            return [
                centerX + newX * size * perspective,
                centerY + finalY * size * perspective,
                finalZ
            ];
        });
        
        // Draw cube edges
        const edges = [
            [0,1], [1,2], [2,3], [3,0], // back face
            [4,5], [5,6], [6,7], [7,4], // front face
            [0,4], [1,5], [2,6], [3,7]  // connecting edges
        ];
        
        this.ctx.strokeStyle = '#00ffff';
        this.ctx.lineWidth = 2;
        
        edges.forEach(([start, end]) => {
            this.ctx.beginPath();
            this.ctx.moveTo(rotatedVertices[start][0], rotatedVertices[start][1]);
            this.ctx.lineTo(rotatedVertices[end][0], rotatedVertices[end][1]);
            this.ctx.stroke();
        });
        
        // Update rotation
        this.cubeRotation.x += 0.02;
        this.cubeRotation.y += 0.03;
    }
    
    drawTransparentCube() {
        const centerX = this.canvas.width / 2;
        const centerY = this.canvas.height / 2;
        const size = 80;
        
        // 3D cube vertices
        const vertices = [
            [-1, -1, -1], [1, -1, -1], [1, 1, -1], [-1, 1, -1], // back face
            [-1, -1, 1], [1, -1, 1], [1, 1, 1], [-1, 1, 1]      // front face
        ];
        
        // Rotate vertices
        const rotatedVertices = vertices.map(([x, y, z]) => {
            // Rotate around Y axis
            const cosY = Math.cos(this.cubeRotation.y);
            const sinY = Math.sin(this.cubeRotation.y);
            const newX = x * cosY - z * sinY;
            const newZ = x * sinY + z * cosY;
            
            // Rotate around X axis
            const cosX = Math.cos(this.cubeRotation.x);
            const sinX = Math.sin(this.cubeRotation.x);
            const finalY = y * cosX - newZ * sinX;
            const finalZ = y * sinX + newZ * cosX;
            
            // Project to 2D with perspective
            const perspective = 1 / (1 + finalZ * 0.3);
            return [
                centerX + newX * size * perspective,
                centerY + finalY * size * perspective,
                finalZ
            ];
        });
        
        // Define cube faces with their vertices and colors
        const faces = [
            { vertices: [0, 1, 2, 3], color: 'rgba(255, 0, 0, 0.6)', name: 'back' },    // Red back
            { vertices: [4, 7, 6, 5], color: 'rgba(0, 255, 0, 0.6)', name: 'front' },   // Green front  
            { vertices: [0, 4, 5, 1], color: 'rgba(0, 0, 255, 0.6)', name: 'bottom' },  // Blue bottom
            { vertices: [2, 6, 7, 3], color: 'rgba(255, 255, 0, 0.6)', name: 'top' },   // Yellow top
            { vertices: [0, 3, 7, 4], color: 'rgba(255, 0, 255, 0.6)', name: 'left' },  // Magenta left
            { vertices: [1, 5, 6, 2], color: 'rgba(0, 255, 255, 0.6)', name: 'right' }  // Cyan right
        ];
        
        // Calculate face centers for z-sorting (painter's algorithm)
        const facesWithDepth = faces.map(face => {
            const faceCenter = face.vertices.reduce((sum, vertexIndex) => {
                return sum + rotatedVertices[vertexIndex][2];
            }, 0) / face.vertices.length;
            
            return { ...face, depth: faceCenter };
        });
        
        // Sort faces by depth (back to front for transparency)
        facesWithDepth.sort((a, b) => a.depth - b.depth);
        
        // Draw faces with transparency
        facesWithDepth.forEach(face => {
            // Add some color cycling based on time
            const timeOffset = this.time * 0.02;
            let color = face.color;
            
            if (face.name === 'front') color = `hsla(${(120 + timeOffset * 60) % 360}, 100%, 50%, 0.6)`;
            if (face.name === 'back') color = `hsla(${(0 + timeOffset * 60) % 360}, 100%, 50%, 0.6)`;
            if (face.name === 'left') color = `hsla(${(300 + timeOffset * 60) % 360}, 100%, 50%, 0.6)`;
            if (face.name === 'right') color = `hsla(${(180 + timeOffset * 60) % 360}, 100%, 50%, 0.6)`;
            if (face.name === 'top') color = `hsla(${(60 + timeOffset * 60) % 360}, 100%, 50%, 0.6)`;
            if (face.name === 'bottom') color = `hsla(${(240 + timeOffset * 60) % 360}, 100%, 50%, 0.6)`;
            
            this.ctx.fillStyle = color;
            this.ctx.strokeStyle = color.replace('0.6', '1.0'); // Solid edges
            this.ctx.lineWidth = 2;
            
            // Draw face
            this.ctx.beginPath();
            this.ctx.moveTo(rotatedVertices[face.vertices[0]][0], rotatedVertices[face.vertices[0]][1]);
            
            for (let i = 1; i < face.vertices.length; i++) {
                this.ctx.lineTo(rotatedVertices[face.vertices[i]][0], rotatedVertices[face.vertices[i]][1]);
            }
            
            this.ctx.closePath();
            this.ctx.fill();
            this.ctx.stroke();
        });
        
        // Draw some wireframe highlights for extra effect
        this.ctx.strokeStyle = 'rgba(255, 255, 255, 0.3)';
        this.ctx.lineWidth = 1;
        
        const edges = [
            [0,1], [1,2], [2,3], [3,0], // back face
            [4,5], [5,6], [6,7], [7,4], // front face
            [0,4], [1,5], [2,6], [3,7]  // connecting edges
        ];
        
        edges.forEach(([start, end]) => {
            this.ctx.beginPath();
            this.ctx.moveTo(rotatedVertices[start][0], rotatedVertices[start][1]);
            this.ctx.lineTo(rotatedVertices[end][0], rotatedVertices[end][1]);
            this.ctx.stroke();
        });
    }
    
    drawRotozoom() {
        // Classic rotozoomer effect - texture rotation and zoom
        const centerX = this.canvas.width / 2;
        const centerY = this.canvas.height / 2;
        
        this.ctx.save();
        this.ctx.translate(centerX, centerY);
        
        // Create checkerboard pattern
        const scale = 2 + Math.sin(this.time * 0.02) * 1.5;
        const rotation = this.time * 0.03;
        
        this.ctx.rotate(rotation);
        this.ctx.scale(scale, scale);
        
        const tileSize = 20;
        const tilesX = Math.ceil(this.canvas.width / tileSize) + 4;
        const tilesY = Math.ceil(this.canvas.height / tileSize) + 4;
        
        for (let y = -tilesY/2; y < tilesY/2; y++) {
            for (let x = -tilesX/2; x < tilesX/2; x++) {
                const isEven = (x + y) % 2 === 0;
                const hue = (this.time * 2 + (x + y) * 10) % 360;
                
                this.ctx.fillStyle = isEven ? `hsl(${hue}, 100%, 50%)` : '#000000';
                this.ctx.fillRect(x * tileSize, y * tileSize, tileSize, tileSize);
            }
        }
        
        this.ctx.restore();
    }
    
    drawFire() {
        // Pixelated fire effect - reaches 50% screen height
        const width = this.canvas.width;
        const height = this.canvas.height;
        const pixelSize = 6; // Large pixels for retro look
        const fireHeight = Math.floor(height * 0.5); // 50% screen height
        
        // Classic fire palette - more vivid colors
        const fireColors = [
            [0, 0, 0],         // 0: Black
            [64, 0, 0],        // 1: Dark red
            [128, 0, 0],       // 2: Red
            [192, 32, 0],      // 3: Dark orange
            [255, 64, 0],      // 4: Orange
            [255, 128, 0],     // 5: Light orange
            [255, 192, 0],     // 6: Yellow-orange
            [255, 255, 0],     // 7: Yellow
            [255, 255, 128],   // 8: Light yellow
            [255, 255, 255]    // 9: White
        ];
        
        // Initialize fire buffer if not exists
        if (!this.fireBuffer || this.fireBuffer.length !== Math.ceil(width/pixelSize) * Math.ceil(fireHeight/pixelSize)) {
            const bufferWidth = Math.ceil(width / pixelSize);
            const bufferHeight = Math.ceil(fireHeight / pixelSize);
            this.fireBuffer = new Array(bufferWidth * bufferHeight).fill(0);
        }
        
        const bufferWidth = Math.ceil(width / pixelSize);
        const bufferHeight = Math.ceil(fireHeight / pixelSize);
        
        // Generate hot base at bottom
        for (let x = 0; x < bufferWidth; x++) {
            const baseIndex = (bufferHeight - 1) * bufferWidth + x;
            // Random intense fire at base with some variation
            this.fireBuffer[baseIndex] = 7 + Math.floor(Math.random() * 3); // 7-9 intensity
        }
        
        // Propagate fire upwards with cooling and spread
        for (let y = bufferHeight - 2; y >= 0; y--) {
            for (let x = 0; x < bufferWidth; x++) {
                const currentIndex = y * bufferWidth + x;
                
                // Sample from pixels below and around for fire spread
                const below = (y + 1) * bufferWidth + x;
                const belowLeft = (y + 1) * bufferWidth + Math.max(0, x - 1);
                const belowRight = (y + 1) * bufferWidth + Math.min(bufferWidth - 1, x + 1);
                const belowCenter = (y + 2 < bufferHeight) ? (y + 2) * bufferWidth + x : below;
                
                // Average nearby pixels and cool down
                const avg = (
                    (this.fireBuffer[below] || 0) +
                    (this.fireBuffer[belowLeft] || 0) +
                    (this.fireBuffer[belowRight] || 0) +
                    (this.fireBuffer[belowCenter] || 0)
                ) / 4;
                
                // Cool down with some randomness and wind effect
                const cooling = 0.8 + Math.random() * 0.4; // 0.8 to 1.2
                const wind = Math.sin(this.time * 0.08 + x * 0.3) * 0.1; // Subtle wind
                
                this.fireBuffer[currentIndex] = Math.max(0, avg * cooling + wind);
            }
        }
        
        // Render pixelated fire
        for (let y = 0; y < bufferHeight; y++) {
            for (let x = 0; x < bufferWidth; x++) {
                const intensity = this.fireBuffer[y * bufferWidth + x];
                
                if (intensity > 0.5) {
                    const colorIndex = Math.min(9, Math.floor(intensity));
                    const [r, g, b] = fireColors[colorIndex];
                    
                    // Add subtle flickering
                    const flicker = Math.sin(this.time * 0.2 + x * 0.5 + y * 0.3) * 20;
                    const finalR = Math.min(255, Math.max(0, r + flicker));
                    const finalG = Math.min(255, Math.max(0, g + flicker * 0.7));
                    const finalB = Math.min(255, Math.max(0, b + flicker * 0.3));
                    
                    this.ctx.fillStyle = `rgb(${finalR}, ${finalG}, ${finalB})`;
                    
                    // Draw large pixel
                    const screenX = x * pixelSize;
                    const screenY = height - (y + 1) * pixelSize; // Flip Y coordinate
                    
                    this.ctx.fillRect(screenX, screenY, pixelSize, pixelSize);
                }
            }
        }
    }
    
    drawBobs() {
        // Classic "bobs" (blitter objects) - multiple bouncing sprites
        const centerX = this.canvas.width / 2;
        const centerY = this.canvas.height / 2;
        
        for (let i = 0; i < 8; i++) {
            const angle = this.time * 0.02 + i * Math.PI / 4;
            const radius = 80 + Math.sin(this.time * 0.01 + i) * 40;
            
            const x = centerX + Math.cos(angle) * radius + Math.sin(this.time * 0.03 + i * 2) * 30;
            const y = centerY + Math.sin(angle) * radius + Math.cos(this.time * 0.025 + i * 3) * 25;
            
            const size = 15 + Math.sin(this.time * 0.04 + i) * 8;
            const hue = (this.time * 3 + i * 45) % 360;
            
            // Draw bob with multiple circles for classic look
            for (let layer = 3; layer >= 0; layer--) {
                const layerSize = size * (1 - layer * 0.2);
                const alpha = 0.8 - layer * 0.15;
                
                this.ctx.fillStyle = `hsla(${hue}, 100%, ${70 - layer * 10}%, ${alpha})`;
                this.ctx.shadowBlur = 15;
                this.ctx.shadowColor = `hsl(${hue}, 100%, 50%)`;
                
                this.ctx.beginPath();
                this.ctx.arc(x, y, layerSize, 0, Math.PI * 2);
                this.ctx.fill();
            }
            this.ctx.shadowBlur = 0;
        }
    }
    
    drawMetaballs() {
        // Metaballs/blob effect - classic organic shapes
        const imageData = this.ctx.createImageData(this.canvas.width, this.canvas.height);
        const data = imageData.data;
        
        // Define metaballs
        const balls = [];
        for (let i = 0; i < 6; i++) {
            balls.push({
                x: this.canvas.width / 2 + Math.sin(this.time * 0.02 + i * 2) * 120,
                y: this.canvas.height / 2 + Math.cos(this.time * 0.025 + i * 1.5) * 80,
                r: 50 + Math.sin(this.time * 0.03 + i * 3) * 30
            });
        }
        
        // Calculate metaball field - sample every 3 pixels for performance
        for (let y = 0; y < this.canvas.height; y += 3) {
            for (let x = 0; x < this.canvas.width; x += 3) {
                let field = 0;
                
                balls.forEach(ball => {
                    const dx = x - ball.x;
                    const dy = y - ball.y;
                    const dist = Math.sqrt(dx * dx + dy * dy);
                    if (dist > 0) {
                        field += ball.r / dist;
                    }
                });
                
                // Fill 3x3 block if field is strong enough
                if (field > 1.2) {
                    const intensity = Math.min(1, (field - 1.2) * 2);
                    const hue = (this.time * 2 + x * 0.5 + y * 0.3) % 360;
                    const [r, g, b] = this.hslToRgb(hue, 100, 50 + intensity * 30);
                    
                    for (let py = 0; py < 3; py++) {
                        for (let px = 0; px < 3; px++) {
                            const index = ((y + py) * this.canvas.width + (x + px)) * 4;
                            if (index < data.length) {
                                data[index] = r * intensity;
                                data[index + 1] = g * intensity;
                                data[index + 2] = b * intensity;
                                data[index + 3] = 255;
                            }
                        }
                    }
                }
            }
        }
        
        this.ctx.putImageData(imageData, 0, 0);
    }
    
    hslToRgb(h, s, l) {
        h /= 360;
        s /= 100;
        l /= 100;
        
        const a = s * Math.min(l, 1 - l);
        const f = n => {
            const k = (n + h * 12) % 12;
            return l - a * Math.max(Math.min(k - 3, 9 - k, 1), -1);
        };
        
        return [f(0) * 255, f(8) * 255, f(4) * 255];
    }
    
    drawTwister() {
        // Classic twister/helix effect
        const centerX = this.canvas.width / 2;
        const centerY = this.canvas.height / 2;
        
        this.ctx.strokeStyle = '#ffffff';
        this.ctx.lineWidth = 3;
        
        for (let twist = 0; twist < 4; twist++) {
            const baseHue = twist * 90;
            
            this.ctx.beginPath();
            
            for (let i = 0; i <= 100; i++) {
                const t = i / 100;
                const y = (t - 0.5) * this.canvas.height * 1.2;
                const angle = t * Math.PI * 8 + this.time * 0.05 + twist * Math.PI / 2;
                const radius = 60 * (1 - Math.abs(t - 0.5) * 2) + Math.sin(this.time * 0.03 + t * 10) * 20;
                
                const x = centerX + Math.cos(angle) * radius;
                const screenY = centerY + y;
                
                if (i === 0) {
                    this.ctx.moveTo(x, screenY);
                } else {
                    this.ctx.lineTo(x, screenY);
                }
            }
            
            const hue = (baseHue + this.time * 2) % 360;
            this.ctx.strokeStyle = `hsl(${hue}, 100%, 60%)`;
            this.ctx.shadowBlur = 10;
            this.ctx.shadowColor = `hsl(${hue}, 100%, 50%)`;
            this.ctx.stroke();
        }
        
        this.ctx.shadowBlur = 0;
    }
    
    drawStarfield() {
        // 3D starfield effect
        const numStars = 150;
        
        // Generate or update stars
        if (!this.starfield) {
            this.starfield = [];
            for (let i = 0; i < numStars; i++) {
                this.starfield.push({
                    x: (Math.random() - 0.5) * 2000,
                    y: (Math.random() - 0.5) * 2000,
                    z: Math.random() * 1000
                });
            }
        }
        
        const centerX = this.canvas.width / 2;
        const centerY = this.canvas.height / 2;
        
        this.starfield.forEach(star => {
            // Move star towards viewer
            star.z -= 5 + Math.sin(this.time * 0.01) * 3;
            
            // Reset star when it passes
            if (star.z <= 0) {
                star.x = (Math.random() - 0.5) * 2000;
                star.y = (Math.random() - 0.5) * 2000;
                star.z = 1000;
            }
            
            // Project to 2D
            const scale = 1000 / star.z;
            const x2d = centerX + star.x * scale;
            const y2d = centerY + star.y * scale;
            
            // Only draw if on screen
            if (x2d >= 0 && x2d < this.canvas.width && y2d >= 0 && y2d < this.canvas.height) {
                const brightness = 1 - star.z / 1000;
                const size = brightness * 3;
                
                this.ctx.fillStyle = `rgba(255, 255, 255, ${brightness})`;
                this.ctx.fillRect(x2d - size/2, y2d - size/2, size, size);
                
                // Draw star trail
                const trailLength = brightness * 10;
                this.ctx.fillStyle = `rgba(255, 255, 255, ${brightness * 0.3})`;
                this.ctx.fillRect(x2d - trailLength, y2d - 1, trailLength, 2);
            }
        });
    }
    
    drawBouncingBalls() {
        this.bouncingBalls.forEach(ball => {
            // Update position
            ball.x += ball.vx;
            ball.y += ball.vy;
            
            // Bounce off walls
            if (ball.x + ball.radius > this.canvas.width || ball.x - ball.radius < 0) {
                ball.vx = -ball.vx;
                ball.color = `hsl(${Math.random() * 360}, 100%, 50%)`; // Change color on bounce
            }
            if (ball.y + ball.radius > this.canvas.height || ball.y - ball.radius < 0) {
                ball.vy = -ball.vy;
                ball.color = `hsl(${Math.random() * 360}, 100%, 50%)`;
            }
            
            // Draw ball
            this.ctx.fillStyle = ball.color;
            this.ctx.shadowBlur = 10;
            this.ctx.shadowColor = ball.color;
            this.ctx.beginPath();
            this.ctx.arc(ball.x, ball.y, ball.radius, 0, Math.PI * 2);
            this.ctx.fill();
            this.ctx.shadowBlur = 0;
        });
    }
    
    drawRasterBars() {
        this.rasterBars.forEach(bar => {
            bar.y += bar.speed;
            if (bar.y > this.canvas.height + bar.height) {
                bar.y = -bar.height;
            }
            
            // Create gradient effect
            const gradient = this.ctx.createLinearGradient(0, bar.y, 0, bar.y + bar.height);
            gradient.addColorStop(0, 'transparent');
            gradient.addColorStop(0.5, bar.color);
            gradient.addColorStop(1, 'transparent');
            
            this.ctx.fillStyle = gradient;
            this.ctx.fillRect(0, bar.y, this.canvas.width, bar.height);
        });
    }
    
    drawDotMatrix() {
        const dotSize = 3;
        const spacing = 8;
        
        this.ctx.fillStyle = '#ffff00';
        
        for (let y = 0; y < this.canvas.height; y += spacing) {
            for (let x = 0; x < this.canvas.width; x += spacing) {
                const intensity = Math.sin((x + this.time) * 0.1) * Math.cos((y + this.time) * 0.08);
                if (intensity > 0.3) {
                    this.ctx.beginPath();
                    this.ctx.arc(x, y, dotSize * intensity, 0, Math.PI * 2);
                    this.ctx.fill();
                }
            }
        }
    }
    
    drawCredits() {
        const centerX = this.canvas.width / 2;
        const centerY = this.canvas.height / 2;
        
        this.ctx.fillStyle = '#ffffff';
        this.ctx.font = '16px Share Tech Mono';
        this.ctx.textAlign = 'center';
        this.ctx.shadowBlur = 5;
        this.ctx.shadowColor = '#ffffff';
        
        // Show credit text with fade effect (slower transition for longer credits)
        const currentCredit = this.credits[Math.floor(this.time / 180) % this.credits.length];
        const fadePhase = (this.time / 180) % 1;
        const alpha = fadePhase < 0.8 ? 1 : (1 - fadePhase) / 0.2;
        
        this.ctx.globalAlpha = alpha;
        this.ctx.fillText(currentCredit, centerX, centerY);
        this.ctx.globalAlpha = 1;
        this.ctx.shadowBlur = 0;
    }
    
    drawStars() {
        this.ctx.fillStyle = '#ffffff';
        
        for (let i = 0; i < 50; i++) {
            const x = (this.canvas.width * Math.sin(i * 13.7 + this.time * 0.001));
            const y = (this.canvas.height * Math.cos(i * 7.3 + this.time * 0.002));
            const size = 1 + Math.sin(i + this.time * 0.01) * 0.5;
            
            this.ctx.beginPath();
            this.ctx.arc(x % this.canvas.width, y % this.canvas.height, size, 0, Math.PI * 2);
            this.ctx.fill();
        }
    }
    
    animate() {
        this.time++;
        
        // Auto scene transition (credits scene runs longer)
        const currentSceneLength = this.effectMode === 5 ? 1800 : this.sceneLength; // 30 seconds for credits
        if (this.autoTransition && this.time - this.sceneStartTime > currentSceneLength) {
            this.effectMode = (this.effectMode + 1) % this.maxModes;
            this.sceneStartTime = this.time;
            
            // Update title
            const title = document.getElementById('title');
            const modeNames = ['PLASMA', '3D CUBE', 'BOUNCING BALLS', 'RASTER BARS', 
                             'DOT MATRIX', 'CREDITS', 'TUNNEL & WAVES', 'ALL EFFECTS'];
            title.innerHTML = `JS-DEMO<br><span style="font-size: 24px; color: #00ffff;"></span>`;
        }
        
        // Clear canvas
        this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
        
        // Draw effects based on current mode
        switch(this.effectMode) {
            case 0: // Plasma
                this.drawPlasma();
                break;
            case 1: // 3D Cube
                this.draw3DCube();
                break;
            case 2: // Bouncing balls
                this.drawBouncingBalls();
                break;
            case 3: // Raster bars
                this.drawRasterBars();
                break;
            case 4: // Dot matrix
                this.drawDotMatrix();
                break;
            case 5: // Credits
                this.drawCredits();
                break;
            case 6: // Tunnel and waves
                this.drawTunnel();
                this.drawSineWaves();
                break;
            case 7: // 3D Triangles
                this.drawStars();
                this.draw3DTriangles();
                break;
            case 8: // Vector balls
                this.drawVectorBalls();
                break;
            case 9: // Transparent cube
                this.drawStars();
                this.drawTransparentCube();
                break;
            case 10: // Rotozoomer
                this.drawRotozoom();
                break;
            case 11: // Fire effect
                this.drawFire();
                break;
            case 12: // Bobs
                this.drawBobs();
                break;
            case 13: // Metaballs
                this.drawMetaballs();
                break;
            case 14: // Twister
                this.drawTwister();
                break;
            case 15: // Starfield
                this.drawStarfield();
                break;
            case 16: // All effects combined
                this.drawPlasma();
                this.drawStars();
                this.drawSineWaves();
                break;
        }
        
        requestAnimationFrame(() => this.animate());
    }
    
    handleKeyPress(event) {
        if (event.key === ' ') {
            // Toggle auto transition
            this.autoTransition = !this.autoTransition;
            console.log('Auto transition:', this.autoTransition ? 'ON' : 'OFF');
        } else if (event.key === 'm' || event.key === 'M') {
            // Toggle music
            if (this.audioElement && !this.audioElement.paused) {
                this.stopMusic();
            } else {
                this.startMusic();
            }
        } else {
            // Manual scene change
            this.effectMode = (this.effectMode + 1) % this.maxModes;
            this.sceneStartTime = this.time; // Reset scene timer
            console.log('Effect mode changed to:', this.effectMode);
            
            // Update title to show current mode
            const title = document.getElementById('title');
            title.innerHTML = `JS-DEMO 2025`
        }
    }
    
    handleClick() {
        // Start music on first click
        this.startMusic();
        
        // Change colors and add visual feedback
        const title = document.getElementById('title');
        const verticalScroller = document.getElementById('vertical-scroller');
        
        // Random colors for title
        title.style.color = `hsl(${Math.random() * 360}, 100%, 50%)`;
        title.style.textShadow = `0 0 20px hsl(${Math.random() * 360}, 100%, 50%)`;
        
        // Change vertical scroller color
        const scrollerColor = `hsl(${Math.random() * 360}, 100%, 70%)`;
        verticalScroller.style.color = scrollerColor;
        verticalScroller.style.textShadow = `0 0 10px ${scrollerColor}`;
        
        // Add pulsing effect
        title.style.transform = 'translateX(-50%) scale(1.2)';
        setTimeout(() => {
            title.style.transform = 'translateX(-50%) scale(1)';
        }, 200);
    }
}

// Start the demo when page loads
document.addEventListener('DOMContentLoaded', () => {
    new Demo();
});