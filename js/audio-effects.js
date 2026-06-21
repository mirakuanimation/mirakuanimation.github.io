class AudioEngine {
    constructor() {
        // Initialize on first user interaction to bypass browser autoplay policies
        this.initialized = false;
        
        // We will initialize this when the first sound plays
        this.ctx = null;
    }

    init() {
        if (this.initialized) return;
        const AudioContext = window.AudioContext || window.webkitAudioContext;
        this.ctx = new AudioContext();
        
        // Main compressor to avoid clipping
        this.compressor = this.ctx.createDynamicsCompressor();
        this.compressor.threshold.value = -10;
        this.compressor.knee.value = 40;
        this.compressor.ratio.value = 12;
        this.compressor.attack.value = 0;
        this.compressor.release.value = 0.25;
        this.compressor.connect(this.ctx.destination);
        
        this.initialized = true;
    }

    playDrop() {
        this.init();
        if(this.ctx.state === 'suspended') this.ctx.resume();
        
        const t = this.ctx.currentTime;
        const osc = this.ctx.createOscillator();
        const gain = this.ctx.createGain();
        
        osc.type = 'sine';
        // Deep thud
        osc.frequency.setValueAtTime(150, t);
        osc.frequency.exponentialRampToValueAtTime(30, t + 0.1);
        
        gain.gain.setValueAtTime(1, t);
        gain.gain.exponentialRampToValueAtTime(0.001, t + 0.3);
        
        osc.connect(gain);
        gain.connect(this.compressor);
        
        osc.start(t);
        osc.stop(t + 0.4);
    }

    playVacuum(duration) {
        this.init();
        if(this.ctx.state === 'suspended') this.ctx.resume();
        
        const t = this.ctx.currentTime;
        
        // Riser oscillator
        const osc = this.ctx.createOscillator();
        const gain = this.ctx.createGain();
        
        osc.type = 'sawtooth';
        osc.frequency.setValueAtTime(50, t);
        osc.frequency.exponentialRampToValueAtTime(800, t + duration); // Rises over duration
        
        gain.gain.setValueAtTime(0.01, t);
        gain.gain.exponentialRampToValueAtTime(0.3, t + duration);
        
        // Filter to make it sound "sucky"
        const filter = this.ctx.createBiquadFilter();
        filter.type = 'lowpass';
        filter.frequency.setValueAtTime(100, t);
        filter.frequency.exponentialRampToValueAtTime(5000, t + duration);
        
        osc.connect(filter);
        filter.connect(gain);
        gain.connect(this.compressor);
        
        osc.start(t);
        
        // Save reference to stop it exactly at blackout
        this.vacuumOsc = osc;
        this.vacuumGain = gain;
    }

    stopVacuum() {
        if(this.vacuumOsc && this.vacuumGain) {
            const t = this.ctx.currentTime;
            this.vacuumGain.gain.cancelScheduledValues(t);
            this.vacuumGain.gain.setValueAtTime(this.vacuumGain.gain.value, t);
            this.vacuumGain.gain.exponentialRampToValueAtTime(0.001, t + 0.1);
            this.vacuumOsc.stop(t + 0.2);
        }
    }

    playBoom() {
        this.init();
        if(this.ctx.state === 'suspended') this.ctx.resume();
        
        const t = this.ctx.currentTime;
        
        // 1. White Noise Explosion
        const bufferSize = this.ctx.sampleRate * 3; // 3 seconds of noise
        const buffer = this.ctx.createBuffer(1, bufferSize, this.ctx.sampleRate);
        const data = buffer.getChannelData(0);
        for (let i = 0; i < bufferSize; i++) {
            data[i] = Math.random() * 2 - 1;
        }
        
        const noise = this.ctx.createBufferSource();
        noise.buffer = buffer;
        
        const noiseFilter = this.ctx.createBiquadFilter();
        noiseFilter.type = 'lowpass';
        noiseFilter.frequency.setValueAtTime(1000, t);
        noiseFilter.frequency.exponentialRampToValueAtTime(100, t + 2);
        
        const noiseGain = this.ctx.createGain();
        noiseGain.gain.setValueAtTime(1, t);
        noiseGain.gain.exponentialRampToValueAtTime(0.001, t + 2.5);
        
        noise.connect(noiseFilter);
        noiseFilter.connect(noiseGain);
        noiseGain.connect(this.compressor);
        noise.start(t);
        
        // 2. Sub Bass Impact
        const sub = this.ctx.createOscillator();
        const subGain = this.ctx.createGain();
        sub.type = 'sine';
        sub.frequency.setValueAtTime(150, t);
        sub.frequency.exponentialRampToValueAtTime(20, t + 0.5);
        
        subGain.gain.setValueAtTime(1.5, t); // Heavy punch
        subGain.gain.exponentialRampToValueAtTime(0.001, t + 2);
        
        sub.connect(subGain);
        subGain.connect(this.compressor);
        sub.start(t);
        sub.stop(t + 2.5);
    }
    
    playConstellation() {
        this.init();
        if(this.ctx.state === 'suspended') this.ctx.resume();
        
        // Play a few random chime sounds
        for(let i=0; i<5; i++) {
            const t = this.ctx.currentTime + Math.random() * 1.5;
            const osc = this.ctx.createOscillator();
            const gain = this.ctx.createGain();
            
            osc.type = 'sine';
            osc.frequency.value = 800 + Math.random() * 1200; // High pitch
            
            gain.gain.setValueAtTime(0, t);
            gain.gain.linearRampToValueAtTime(0.1, t + 0.05);
            gain.gain.exponentialRampToValueAtTime(0.001, t + 1.5);
            
            osc.connect(gain);
            gain.connect(this.compressor);
            
            osc.start(t);
            osc.stop(t + 1.6);
        }
    }
}
