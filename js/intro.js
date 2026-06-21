document.addEventListener("DOMContentLoaded", () => {
    // Initialize Systems
    const effects = new EffectSystem('effects-canvas');
    const audio = new AudioEngine();
    
    // Create Flash overlay
    const flashOverlay = document.createElement('div');
    flashOverlay.style.position = 'fixed';
    flashOverlay.style.top = '0';
    flashOverlay.style.left = '0';
    flashOverlay.style.width = '100vw';
    flashOverlay.style.height = '100vh';
    flashOverlay.style.backgroundColor = '#ffffff';
    flashOverlay.style.opacity = '0';
    flashOverlay.style.pointerEvents = 'none';
    flashOverlay.style.zIndex = '40';
    document.body.appendChild(flashOverlay);

    // Elements
    const letterWrappers = document.querySelectorAll('.letter-wrapper');
    const fontsDefault = document.querySelectorAll('.font-default');
    const fontsAquire = document.querySelectorAll('.font-aquire');
    const wordAnimation = document.getElementById('word-animation');
    const logoContainer = document.getElementById('logo-container');
    const introContainer = document.getElementById('intro-container');

    // Configuration
    const MASTER_TIMELINE = gsap.timeline({ delay: 0.5 });
    
    // Letters fall individually using simple default font.
    // Start audio on first tick since overlay is gone, may block on strict browsers but user requested bypass.
    MASTER_TIMELINE.call(() => audio.init(), [], 0);
    letterWrappers.forEach((wrapper, index) => {
        MASTER_TIMELINE.to(wrapper, {
            y: 0,
            opacity: 1,
            duration: 0.4,
            ease: "power4.in", // Hard slam
            onStart: () => {
                if(index === 0) audio.init(); // Try to init early
            },
            onComplete: () => {
                audio.playDrop();
                // Subtle impact and realistic camera shake per letter
                gsap.to(introContainer, {
                    y: "random(2, 6)",
                    duration: 0.05,
                    yoyo: true,
                    repeat: 1,
                    onComplete: () => gsap.set(introContainer, { y: 0 })
                });
            }
        }, index * 0.15); // Faster drop spacing
    });

    // --- PHASE 2: ANTICIPATION PAUSE ---
    MASTER_TIMELINE.addLabel("anticipation", "+=0.5"); // Faster pause

    // --- PHASE 3: THE GATHERING ---
    // Purple and white energy begins gathering, camera slowly zooms in
    MASTER_TIMELINE.addLabel("gather", "anticipation");
    
    MASTER_TIMELINE.call(() => {
        effects.startEnergyBuildUp();
        audio.playVacuum(1.8);
        letterWrappers.forEach(w => w.classList.add('glow-charging'));
    }, [], "gather");

    // Slow cinematic camera zoom and tension shake
    MASTER_TIMELINE.to(introContainer, {
        scale: 1.25,
        duration: 2,
        ease: "power2.in"
    }, "gather");

    MASTER_TIMELINE.to(introContainer, {
        x: "random(-3, 3)",
        y: "random(-3, 3)",
        duration: 0.05,
        repeat: 80,
        ease: "none"
    }, "gather");

    // Animate build-up intensity in canvas
    let buildUpProxy = { intensity: 0 };
    MASTER_TIMELINE.to(buildUpProxy, {
        intensity: 1,
        duration: 1.8,
        ease: "power3.in",
        onUpdate: () => effects.setBuildupIntensity(buildUpProxy.intensity)
    }, "gather");

    // --- THE BLACKOUT (Dead Silence Before the Boom) ---
    MASTER_TIMELINE.addLabel("blackout", "gather+=1.8");
    MASTER_TIMELINE.call(() => {
        effects.triggerBlackout();
        audio.stopVacuum();
    }, [], "blackout");
    MASTER_TIMELINE.to(introContainer, { scale: 1.2, duration: 0.1, x: 0, y: 0 }, "blackout");
    // Hide letters momentarily
    letterWrappers.forEach((wrapper) => {
        MASTER_TIMELINE.call(() => wrapper.classList.remove('glow-charging'), [], "blackout");
        MASTER_TIMELINE.to(wrapper, { opacity: 0, duration: 0.05 }, "blackout");
    });

    // --- PHASE 4: THE AWAKENING & TRANSFORMATION (THE BOOM) ---
    MASTER_TIMELINE.addLabel("transform", "blackout+=0.15");

    MASTER_TIMELINE.call(() => {
        const logoRect = logoContainer.getBoundingClientRect();
        effects.fireStrike(logoRect.left + logoRect.width / 2, logoRect.top + logoRect.height / 2);
        audio.playBoom();
        
        // Quick flash that doesn't overwhelm (No massive light show)
        gsap.to(flashOverlay, { opacity: 0.5, duration: 0.05 });
        gsap.to(flashOverlay, { opacity: 0, duration: 1.0, ease: "power4.out", delay: 0.05 });
        
        // Violent camera punch
        gsap.set(introContainer, { scale: 1.5 });
        gsap.to(introContainer, { scale: 1.2, duration: 1.5, ease: "elastic.out(1, 0.3)" });

        // Heavy camera shake
        gsap.to(introContainer, {
            x: "random(-20, 20)",
            y: "random(-20, 20)",
            duration: 0.05,
            repeat: 20,
            ease: "none",
            onComplete: () => gsap.set(introContainer, { x: 0, y: 0 })
        });
        
    }, [], "transform");

    // Font Transformation: Fade out default, Fade in Aquire with blur -> sharp
    letterWrappers.forEach((wrapper, index) => {
        // Activate glow class
        MASTER_TIMELINE.call(() => wrapper.classList.add('glow-active'), [], "transform");
        
        MASTER_TIMELINE.to(wrapper, { opacity: 1, duration: 0.01 }, "transform"); // Restore from blackout
        
        MASTER_TIMELINE.to(fontsDefault[index], {
            opacity: 0,
            duration: 0.1
        }, "transform");
        
        MASTER_TIMELINE.to(fontsAquire[index], {
            opacity: 1,
            filter: "blur(0px)",
            duration: 0.3,
            ease: "power2.out"
        }, "transform");
    });

    // Subtext reveal with white glow
    MASTER_TIMELINE.to(wordAnimation, {
        opacity: 1,
        y: 0,
        textShadow: "0 0 10px rgba(255,255,255,0.8), 0 0 20px rgba(255,255,255,0.5)",
        duration: 1.5,
        ease: "power3.out"
    }, "transform+=0.2");

    // --- PHASE 5: CONSTELLATION & ATMOSPHERE ---
    MASTER_TIMELINE.addLabel("constellation", "transform+=1.5");
    
    MASTER_TIMELINE.call(() => {
        effects.startConstellation();
        audio.playConstellation();
    }, [], "constellation");

    // Subtle cinematic camera drift after the boom
    MASTER_TIMELINE.to(introContainer, {
        scale: 1.05,
        rotation: 1, // tiny rotation for orbital feel
        duration: 4,
        ease: "sine.inOut"
    }, "constellation");

    // --- PHASE 6: CINEMATIC FADE OUT ---
    // Build tension with a brief moment of silence (about 2 seconds of holding the stars)
    MASTER_TIMELINE.addLabel("fadeout", "constellation+=2.5");

    // Gradually fade out all elements over 2 seconds
    MASTER_TIMELINE.to(introContainer, {
        opacity: 0,
        duration: 2.0,
        ease: "power2.inOut"
    }, "fadeout");

    // Redirect to index.html to begin the Hero typewriter effect
    MASTER_TIMELINE.call(() => {
        window.location.href = "index.html";
    }, [], "fadeout+=2.1");
});
