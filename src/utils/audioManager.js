class AudioManager {
  constructor() {
    this.audioCtx = null;
    this.bgmAudio = new Audio();
    this.bgmAudio.loop = true;
    this.bgmAudio.volume = 0.5; // Increased from 0.2
    this.isMuted = false;
  }

  init() {
    if (!this.audioCtx) {
      this.audioCtx = new (window.AudioContext || window.webkitAudioContext)();
    }
    if (this.audioCtx.state === 'suspended') {
      this.audioCtx.resume();
    }
  }

  toggleMute() {
    this.isMuted = !this.isMuted;
    this.bgmAudio.muted = this.isMuted;
    return this.isMuted;
  }

  playBGM(url) {
    if (this.isMuted) return;
    if (this.bgmAudio.src !== url && url) {
      this.bgmAudio.src = url;
    }
    // Only play if it has a src
    if (this.bgmAudio.src) {
      // Force play
      this.bgmAudio.play().catch(e => console.log('BGM play prevented by browser', e));
    }
  }

  stopBGM() {
    this.bgmAudio.pause();
    this.bgmAudio.currentTime = 0;
  }

  playSFX(type) {
    if (this.isMuted) return;
    this.init();
    
    const now = this.audioCtx.currentTime;
    const osc = this.audioCtx.createOscillator();
    const gainNode = this.audioCtx.createGain();
    
    osc.connect(gainNode);
    gainNode.connect(this.audioCtx.destination);
    
    if (type === 'hover') {
      osc.type = 'sine';
      osc.frequency.setValueAtTime(300, now);
      osc.frequency.exponentialRampToValueAtTime(500, now + 0.05);
      gainNode.gain.setValueAtTime(0.2, now); // Increased from 0.05
      gainNode.gain.linearRampToValueAtTime(0, now + 0.05);
      osc.start(now);
      osc.stop(now + 0.05);
    } 
    else if (type === 'click') {
      osc.type = 'square';
      osc.frequency.setValueAtTime(150, now);
      gainNode.gain.setValueAtTime(0.3, now); // Increased from 0.05
      gainNode.gain.exponentialRampToValueAtTime(0.01, now + 0.1);
      osc.start(now);
      osc.stop(now + 0.1);
    } 
    else if (type === 'success') {
      osc.type = 'sine';
      osc.frequency.setValueAtTime(400, now);
      osc.frequency.setValueAtTime(600, now + 0.1);
      osc.frequency.setValueAtTime(1000, now + 0.2);
      gainNode.gain.setValueAtTime(0.5, now); // Increased from 0.1
      gainNode.gain.linearRampToValueAtTime(0, now + 0.3);
      osc.start(now);
      osc.stop(now + 0.3);
    } 
    else if (type === 'wrong') {
      osc.type = 'sawtooth';
      osc.frequency.setValueAtTime(150, now);
      osc.frequency.exponentialRampToValueAtTime(50, now + 0.3);
      gainNode.gain.setValueAtTime(0.5, now); // Increased from 0.1
      gainNode.gain.linearRampToValueAtTime(0, now + 0.3);
      osc.start(now);
      osc.stop(now + 0.3);
    } 
    else if (type === 'slice') {
      // White noise for sword slice
      const bufferSize = this.audioCtx.sampleRate * 0.15; 
      const buffer = this.audioCtx.createBuffer(1, bufferSize, this.audioCtx.sampleRate);
      const data = buffer.getChannelData(0);
      for (let i = 0; i < bufferSize; i++) {
        data[i] = Math.random() * 2 - 1;
      }
      const noise = this.audioCtx.createBufferSource();
      noise.buffer = buffer;
      
      const filter = this.audioCtx.createBiquadFilter();
      filter.type = 'bandpass';
      filter.frequency.value = 1000;
      
      noise.connect(filter);
      filter.connect(gainNode);
      
      gainNode.gain.setValueAtTime(0.6, now); // Increased from 0.15
      gainNode.gain.exponentialRampToValueAtTime(0.01, now + 0.15);
      
      noise.start(now);
      noise.stop(now + 0.15);
      return; // return early as we didn't use the oscillator
    }
  }
}

export const audio = new AudioManager();
