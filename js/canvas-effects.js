class EffectSystem {
    constructor(canvasId) {
        this.canvas = document.getElementById(canvasId);
        this.ctx = this.canvas.getContext('2d', { alpha: true });
        
        this.width = window.innerWidth;
        this.height = window.innerHeight;
        // Optimization: render canvas at 50% physical resolution
        this.canvas.width = this.width / 2;
        this.canvas.height = this.height / 2;
        this.canvas.style.width = '100%';
        this.canvas.style.height = '100%';
        this.ctx.scale(0.5, 0.5);
        
        this.particles = [];
        this.beams = [];
        this.flares = [];
        
        this.state = {
            phase: 'idle', // idle, buildup, strike, hero
            buildupIntensity: 0,
            centerX: this.width / 2,
            centerY: this.height / 2,
            strikeProgress: 0
        };

        window.addEventListener('resize', () => this.resize());
        
        // Spawn ambient depth-of-field particles already in the background
        for(let i=0; i<80; i++) {
            this.particles.push({
                x: Math.random() * this.width,
                y: Math.random() * this.height,
                vx: (Math.random() - 0.5) * 0.5,
                vy: (Math.random() - 0.5) * 0.5,
                size: Math.random() * 3 + 0.5,
                color: Math.random() > 0.3 ? '#ffffff' : '#b666d2',
                alpha: Math.random() * 0.5 + 0.1,
                targetAlpha: Math.random() * 0.5 + 0.1,
                isAmbient: true,
                isFlowing: false,
                blur: Math.random() > 0.7 ? true : false,
                isSpark: false,
                life: 1,
                maxLife: 9999
            });
        }

        this.loop();
    }

    resize() {
        this.width = window.innerWidth;
        this.height = window.innerHeight;
        this.canvas.width = this.width / 2;
        this.canvas.height = this.height / 2;
        this.ctx.scale(0.5, 0.5);
        this.state.centerX = this.width / 2;
        this.state.centerY = this.height / 2;
    }

    // Phase 2: Build Up
    startEnergyBuildUp() {
        this.state.phase = 'buildup';
        
        // Convert existing ambient background particles into flowing particles so it looks like it's absorbing them
        this.particles.forEach(p => {
            if (p.isAmbient) {
                p.isAmbient = false;
                p.isFlowing = true;
                p.targetX = this.state.centerX;
                p.targetY = this.state.centerY;
                p.targetAlpha = Math.random() * 0.8 + 0.2;
            }
        });

        // Spawn some additional energy streams flowing to center
        for(let i=0; i<40; i++) {
            let angle = Math.random() * Math.PI * 2;
            let dist = Math.random() * 800 + 300;
            this.particles.push({
                x: this.state.centerX + Math.cos(angle) * dist,
                y: this.state.centerY + Math.sin(angle) * dist,
                vx: 0,
                vy: 0,
                targetX: this.state.centerX,
                targetY: this.state.centerY,
                size: Math.random() * 2 + 0.5,
                color: Math.random() > 0.4 ? '#ffffff' : '#b666d2',
                alpha: 0,
                targetAlpha: Math.random() * 0.8 + 0.2,
                isAmbient: false,
                isFlowing: true,
                blur: false,
                life: 1,
                maxLife: 200
            });
        }
    }

    // Constellation Effect
    startConstellation() {
        this.state.phase = 'constellation';
        this.constellationStars = [];
        
        // Spawn 40 stars in an elliptical pattern around the logo
        for(let i=0; i<40; i++) {
            let baseAngle = Math.random() * Math.PI * 2;
            let radiusX = Math.random() * 300 + 150; // width of constellation
            let radiusY = Math.random() * 100 + 60;  // height of constellation
            
            this.constellationStars.push({
                baseAngle: baseAngle,
                radiusX: radiusX,
                radiusY: radiusY,
                orbitSpeed: (Math.random() * 0.005 + 0.001) * (Math.random() > 0.5 ? 1 : -1),
                driftX: this.state.centerX,
                driftY: this.state.centerY,
                x: 0,
                y: 0,
                alpha: 0,
                targetAlpha: Math.random() * 0.5 + 0.3,
                size: Math.random() * 1.5 + 0.5,
                fadingOut: false
            });
        }
    }

    setBuildupIntensity(val) {
        this.state.buildupIntensity = val;
    }

    triggerBlackout() {
        this.state.phase = 'blackout';
    }

    // Phase 3: Strike & Awakening
    fireStrike(targetX, targetY) {
        this.state.phase = 'strike';
        this.state.strikeProgress = 1;

        // Cinematic lens flare
        this.flares.push({
            x: targetX,
            y: targetY,
            width: 10,
            maxWidth: this.width * 1.5,
            alpha: 1
        });
        
        // Explosion particles (NO rings, just high-velocity sparks and dust)
        for(let i=0; i<250; i++) {
            let angle = Math.random() * Math.PI * 2;
            let speed = Math.random() * 60 + 10; // Much faster
            this.particles.push({
                x: targetX,
                y: targetY,
                vx: Math.cos(angle) * speed,
                vy: Math.sin(angle) * speed,
                size: Math.random() * 3 + 1,
                color: Math.random() > 0.5 ? '#ffffff' : '#b666d2',
                alpha: 1,
                targetAlpha: 1,
                isAmbient: false,
                isFlowing: false,
                blur: false,
                isSpark: true, // Tag as spark for long streaks
                life: 1,
                maxLife: Math.random() * 60 + 20
            });
        }
        
        // Massive cinematic dust (Depth of field smoke)
        for(let i=0; i<60; i++) {
            this.particles.push({
                x: targetX + (Math.random()-0.5)*200,
                y: targetY + (Math.random()-0.5)*200,
                vx: (Math.random() - 0.5) * 4,
                vy: (Math.random() - 0.5) * 4,
                size: Math.random() * 80 + 40, // Huger smoke
                color: Math.random() > 0.3 ? '#ffffff' : '#b666d2',
                alpha: 0.25,
                targetAlpha: 0.25,
                isAmbient: false,
                isFlowing: false,
                blur: true,
                life: 1,
                maxLife: Math.random() * 250 + 100
            });
        }
    }

    loop() {
        this.update();
        this.draw();
        requestAnimationFrame(() => this.loop());
    }

    update() {
        // Particles
        for (let i = this.particles.length - 1; i >= 0; i--) {
            let p = this.particles[i];
            
            if (p.isAmbient) {
                p.x += p.vx;
                p.y += p.vy;
                if(p.alpha < p.targetAlpha) p.alpha += 0.01;
                
                if (p.x < 0) p.x = this.width;
                if (p.x > this.width) p.x = 0;
                if (p.y < 0) p.y = this.height;
                if (p.y > this.height) p.y = 0;
            } else if (p.isFlowing && this.state.phase === 'buildup') {
                let dx = p.targetX - p.x;
                let dy = p.targetY - p.y;
                let angle = Math.atan2(dy, dx);
                let speed = this.state.buildupIntensity * 25 + 2;
                
                // Add organic wave motion to the streams
                let perpAngle = angle + Math.PI/2;
                let orbit = Math.sin(Date.now() * 0.005 + p.size * 10) * (this.state.buildupIntensity * 8);
                
                p.x += Math.cos(angle) * speed + Math.cos(perpAngle) * orbit;
                p.y += Math.sin(angle) * speed + Math.sin(perpAngle) * orbit;
                
                if(p.alpha < p.targetAlpha) p.alpha += 0.05;
                
                // Respawn if too close to center
                if (Math.hypot(dx, dy) < 30) {
                    let newAngle = Math.random() * Math.PI * 2;
                    let dist = Math.random() * 600 + 400;
                    p.x = this.state.centerX + Math.cos(newAngle) * dist;
                    p.y = this.state.centerY + Math.sin(newAngle) * dist;
                    p.alpha = 0;
                }
            } else if (p.isFlowing && this.state.phase === 'strike') {
                // If it was a stream and strike happened, blast them outward
                p.isFlowing = false;
                p.vx = (Math.random() - 0.5) * 15;
                p.vy = (Math.random() - 0.5) * 15;
                p.maxLife = 60;
            } else {
                // Explosion / Dust
                p.x += p.vx;
                p.y += p.vy;
                p.vx *= 0.96; // friction
                p.vy *= 0.96;
                p.alpha -= 1/p.maxLife;
                if(p.alpha <= 0) {
                    this.particles.splice(i, 1);
                }
            }
        }

        // Constellation
        if (this.state.phase === 'constellation' || this.state.phase === 'settle') {
            for(let i=this.constellationStars.length-1; i>=0; i--) {
                let s = this.constellationStars[i];
                
                // Orbit math
                s.baseAngle += s.orbitSpeed;
                // Add a very subtle upward drift to the entire system
                s.driftY -= 0.1;
                
                s.x = s.driftX + Math.cos(s.baseAngle) * s.radiusX;
                s.y = s.driftY + Math.sin(s.baseAngle) * s.radiusY;
                
                if (s.fadingOut) {
                    s.alpha -= 0.02;
                    if(s.alpha <= 0) this.constellationStars.splice(i, 1);
                } else if (s.alpha < s.targetAlpha) {
                    s.alpha += 0.01;
                }
            }
        }

        // Lens Flares
        for(let i=this.flares.length-1; i>=0; i--) {
            let f = this.flares[i];
            f.width += (f.maxWidth - f.width) * 0.2;
            f.alpha -= 0.03;
            if(f.alpha <= 0) this.flares.splice(i, 1);
        }
    }

    draw() {
        if (this.state.phase === 'blackout') {
            this.ctx.fillStyle = '#050505';
            this.ctx.fillRect(0, 0, this.width, this.height);
            return;
        }

        // Clear with slight trailing effect for motion blur
        this.ctx.fillStyle = `rgba(5, 5, 10, ${this.state.phase === 'strike' ? 0.2 : 0.7})`;
        this.ctx.fillRect(0, 0, this.width, this.height);

        // Draw Particles
        this.particles.forEach(p => {
            this.ctx.beginPath();
            this.ctx.arc(p.x, p.y, p.size, 0, Math.PI*2);
            this.ctx.fillStyle = p.color;
            this.ctx.globalAlpha = p.alpha;
            
            // Depth of field blur simulation
            if (p.blur) {
                this.ctx.shadowBlur = 15;
                this.ctx.shadowColor = p.color;
            } else {
                this.ctx.shadowBlur = 0;
            }
            
            this.ctx.fill();
            
            if (p.isFlowing && this.state.buildupIntensity > 0.5) {
                // Streaks for flowing energy
                this.ctx.beginPath();
                this.ctx.moveTo(p.x, p.y);
                this.ctx.lineTo(p.x - Math.cos(Math.atan2(p.targetY-p.y, p.targetX-p.x)) * 20, 
                                p.y - Math.sin(Math.atan2(p.targetY-p.y, p.targetX-p.x)) * 20);
                this.ctx.strokeStyle = p.color;
                this.ctx.lineWidth = p.size;
                this.ctx.stroke();
            } else if (p.isSpark) {
                // Long streaks for explosion sparks
                this.ctx.beginPath();
                this.ctx.moveTo(p.x, p.y);
                this.ctx.lineTo(p.x - p.vx * 1.5, p.y - p.vy * 1.5);
                this.ctx.strokeStyle = p.color;
                this.ctx.lineWidth = p.size;
                this.ctx.stroke();
            }
        });
        
        this.ctx.shadowBlur = 0;
        this.ctx.globalAlpha = 1;

        // Draw Constellation Stars
        if (this.state.phase === 'constellation' || this.state.phase === 'settle') {
            this.constellationStars.forEach(s => {
                this.ctx.beginPath();
                this.ctx.arc(s.x, s.y, s.size, 0, Math.PI*2);
                this.ctx.fillStyle = '#ffffff';
                this.ctx.globalAlpha = s.alpha;
                this.ctx.shadowBlur = 10;
                this.ctx.shadowColor = '#ffffff';
                this.ctx.fill();
            });
            this.ctx.shadowBlur = 0;
            this.ctx.globalAlpha = 1;
        }

        // Draw Lens Flares
        this.flares.forEach(f => {
            // Horizontal streak
            let grad = this.ctx.createLinearGradient(f.x - f.width/2, f.y, f.x + f.width/2, f.y);
            grad.addColorStop(0, `rgba(182, 102, 210, 0)`);
            grad.addColorStop(0.5, `rgba(255, 255, 255, ${f.alpha})`);
            grad.addColorStop(1, `rgba(182, 102, 210, 0)`);
            
            this.ctx.fillStyle = grad;
            this.ctx.fillRect(f.x - f.width/2, f.y - 2, f.width, 4);
            
            // Core bright streak
            let gradCore = this.ctx.createLinearGradient(f.x - f.width/4, f.y, f.x + f.width/4, f.y);
            gradCore.addColorStop(0, `rgba(255, 255, 255, 0)`);
            gradCore.addColorStop(0.5, `rgba(255, 255, 255, ${f.alpha})`);
            gradCore.addColorStop(1, `rgba(255, 255, 255, 0)`);
            
            this.ctx.fillStyle = gradCore;
            this.ctx.fillRect(f.x - f.width/4, f.y - 1, f.width/2, 2);
        });
    }
}
