document.addEventListener('DOMContentLoaded', () => {
  const startBtn = document.getElementById('start-mix-btn');
  const sliders = document.querySelectorAll('.volume-slider');
  
  let audioCtx;
  const tracks = [];
  let isPlaying = false;

  // Convert dB to linear amplitude (gain)
  // Gain = 10 ^ (dB / 20)
  // If dB is -60 or lower, consider it 0 (silence)
  function dbToGain(db) {
    if (db <= -60) return 0;
    return Math.pow(10, db / 20);
  }

  // Update dB readout next to slider
  function updateReadout(slider) {
    const readout = slider.nextElementSibling;
    if (slider.value <= -60) {
      readout.textContent = '-Inf dB';
    } else {
      // Add '+' sign for positive values
      const val = parseFloat(slider.value);
      readout.textContent = (val > 0 ? '+' : '') + val.toFixed(1) + ' dB';
    }
  }

  // Fetch and decode an audio file
  async function loadTrack(ctx, url) {
    const response = await fetch(url);
    const arrayBuffer = await response.arrayBuffer();
    const audioBuffer = await ctx.decodeAudioData(arrayBuffer);
    return audioBuffer;
  }

  async function initAudio() {
    startBtn.disabled = true;
    startBtn.textContent = 'Initializing...';
    
    // Create AudioContext
    audioCtx = new (window.AudioContext || window.webkitAudioContext)();
    
    try {
      // Step 1: Gather URLs and map to loading promises
      const loadPromises = Array.from(sliders).map(async (slider, index) => {
        const url = slider.dataset.trackUrl;
        startBtn.textContent = `Loading track ${index + 1}/${sliders.length}...`;
        
        const buffer = await loadTrack(audioCtx, url);
        
        // Create nodes
        const source = audioCtx.createBufferSource();
        const gainNode = audioCtx.createGain();
        
        source.buffer = buffer;
        source.loop = true;
        
        // Initial gain is whatever the slider is at
        const initialDb = parseFloat(slider.value);
        gainNode.gain.value = dbToGain(initialDb);
        
        // Connect nodes
        source.connect(gainNode);
        gainNode.connect(audioCtx.destination);
        
        // Handle UI interaction
        slider.addEventListener('input', (e) => {
          const db = parseFloat(e.target.value);
          // Optional: use exponentialRampToValueAtTime for smooth volume changes to avoid clicks
          // But direct assignment is fine for quick adjustments
          const newGain = dbToGain(db);
          // Smoothing (10ms)
          gainNode.gain.setTargetAtTime(newGain, audioCtx.currentTime, 0.01);
          updateReadout(slider);
        });

        // Initialize readout
        updateReadout(slider);
        
        return { source, gainNode, slider };
      });

      // Wait for all to download and decode
      const loadedTracks = await Promise.all(loadPromises);
      tracks.push(...loadedTracks);

      // Enable UI
      sliders.forEach(s => s.disabled = false);
      
      // If context was suspended (browser policy), resume it
      if (audioCtx.state === 'suspended') {
        audioCtx.resume();
      }
      
      // Start all sources precisely at the same future time
      const startTime = audioCtx.currentTime + 0.1;
      tracks.forEach(track => {
        track.source.start(startTime);
      });
      
      isPlaying = true;
      startBtn.textContent = 'Playing (Seamless Loop)';
      startBtn.style.background = '#2e8c4a'; // green-ish to indicate active
      // Disable button so they don't click start again (can't call start() twice on BufferSource)
      startBtn.disabled = true;
      
    } catch (err) {
      console.error('Error loading audio:', err);
      startBtn.textContent = 'Error loading audio';
    }
  }

  // Initial state logic
  startBtn.textContent = 'Initialize';
  startBtn.addEventListener('click', () => {
    if (!audioCtx) {
      initAudio();
    }
  });

});
