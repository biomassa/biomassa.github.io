document.addEventListener('DOMContentLoaded', () => {
  const startBtn = document.getElementById('start-mix-btn');
  const container = document.getElementById('mixer-container');
  
  // randomize track order in dom
  const trackControls = Array.from(container.children);
  for (let i = trackControls.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [trackControls[i], trackControls[j]] = [trackControls[j], trackControls[i]];
  }
  trackControls.forEach(ctrl => container.appendChild(ctrl));

  const sliders = document.querySelectorAll('.volume-slider');
  
  let audioCtx;
  let tracks = [];
  let isPlaying = false;
  let isLoaded = false;

  function dbToGain(db) {
    if (db <= -60) return 0;
    return Math.pow(10, db / 20);
  }

  async function loadTrack(ctx, url) {
    const response = await fetch(url);
    const arrayBuffer = await response.arrayBuffer();
    return await ctx.decodeAudioData(arrayBuffer);
  }

  async function initAndPlay() {
    startBtn.disabled = true;
    startBtn.textContent = 'loading...';
    
    if (!audioCtx) {
      audioCtx = new (window.AudioContext || window.webkitAudioContext)();
    }
    
    try {
      if (!isLoaded) {
        const loadPromises = Array.from(sliders).map(async (slider) => {
          const url = slider.dataset.trackUrl;
          const buffer = await loadTrack(audioCtx, url);
          const gainNode = audioCtx.createGain();
          
          gainNode.gain.value = 0;
          gainNode.connect(audioCtx.destination);
          
          slider.addEventListener('input', (e) => {
            const db = parseFloat(e.target.value);
            const newGain = dbToGain(db);
            gainNode.gain.setTargetAtTime(newGain, audioCtx.currentTime, 0.01);
          });
          
          return { buffer, gainNode, slider };
        });

        tracks = await Promise.all(loadPromises);
        isLoaded = true;
      }
      
      // reset all sliders and gains
      sliders.forEach(s => s.value = -60);
      tracks.forEach(t => t.gainNode.gain.value = 0);
      
      // pick 3 random tracks
      const randomIndices = [];
      while(randomIndices.length < 3 && randomIndices.length < tracks.length) {
        const r = Math.floor(Math.random() * tracks.length);
        if(!randomIndices.includes(r)) randomIndices.push(r);
      }
      
      // set random volumes between -10 and -3
      randomIndices.forEach(idx => {
        const randomDb = -10 + Math.random() * 7;
        tracks[idx].slider.value = randomDb;
        tracks[idx].gainNode.gain.value = dbToGain(randomDb);
      });

      sliders.forEach(s => s.disabled = false);
      
      if (audioCtx.state === 'suspended') {
        audioCtx.resume();
      }
      
      const startTime = audioCtx.currentTime + 0.1;
      tracks.forEach(track => {
        const source = audioCtx.createBufferSource();
        source.buffer = track.buffer;
        source.loop = true;
        source.connect(track.gainNode);
        source.start(startTime);
        track.source = source; // store reference to stop it later
      });
      
      isPlaying = true;
      startBtn.textContent = 'playing. click to stop';
      startBtn.disabled = false;
      
    } catch (err) {
      console.error(err);
      startBtn.textContent = 'error';
    }
  }

  function stopAudio() {
    if (isPlaying) {
      tracks.forEach(t => {
        if (t.source) {
          t.source.stop();
          t.source.disconnect();
        }
      });
      isPlaying = false;
      startBtn.textContent = 'initialize';
      sliders.forEach(s => {
        s.disabled = true;
        s.value = -60;
      });
    }
  }

  startBtn.textContent = 'initialize';
  startBtn.addEventListener('click', () => {
    if (isPlaying) {
      stopAudio();
    } else {
      initAndPlay();
    }
  });
});
