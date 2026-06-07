import { useState, useEffect, useRef, ChangeEvent } from 'react';
import { Play, Pause, Volume2, RotateCcw, VolumeX, Maximize, Settings, Subtitles, Cpu, Tv, Lock, Unlock, ExternalLink } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { Lesson } from '../types';

function getYouTubeId(url?: string): string | null {
  if (!url) return null;
  const regExp = /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|\&v=)([^#\&\?]*).*/;
  const match = url.match(regExp);
  return (match && match[2].length === 11) ? match[2] : null;
}

interface VideoPlayerProps {
  lesson: Lesson;
  onToggleComplete: () => void;
}

export default function VideoPlayer({ lesson, onToggleComplete }: VideoPlayerProps) {
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [volume, setVolume] = useState(80);
  const [isMuted, setIsMuted] = useState(false);
  const [showCaptions, setShowCaptions] = useState(true);
  const [useSimulation, setUseSimulation] = useState(false); // Default to beautiful Camera Broadcast Feed so standard video plays immediately!
  
  const intervalRef = useRef<NodeJS.Timeout | null>(null);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const particlesRef = useRef<any[]>([]);
  const lastSpokenTextRef = useRef<string>("");

  // Parse time string (like "18:45" or "5:00") to seconds
  const parseTimeToSeconds = (timeStr: string) => {
    if (!timeStr) return 85;
    const parts = timeStr.split(':');
    if (parts.length === 2) {
      return parseInt(parts[0], 10) * 60 + parseInt(parts[1], 10);
    }
    return 85;
  };

  const duration = parseTimeToSeconds(lesson.duration);
  const [videoDuration, setVideoDuration] = useState(duration);

  // Captions array with timing
  const defaultSolvedCaptions = [
    { start: 0, end: 5, text: `Let's solve a tutorial problem for ${lesson.title}.` },
    { start: 5, end: 15, text: "First, we look at the given parameters and state our assumptions." },
    { start: 15, end: 28, text: "We'll apply the appropriate equations step by step." },
    { start: 28, end: 42, text: "Notice how the units cancel out to give us the final answer." },
    { start: 42, end: 60, text: "Make sure you can replicate this derivation yourself." },
    { start: 60, end: 1000, text: "Great work! Let's move on to the next problem." }
  ];

  const captions = lesson.solvedCaptions || defaultSolvedCaptions;

  // Active caption
  const activeCaption = captions.find(c => currentTime >= c.start && currentTime <= c.end)?.text || "";

  const videoRef = useRef<HTMLVideoElement | null>(null);

  // Reliable Google CDN MP4 video assets that never block embedding/iframes with CORS or hotlinking tokens
  const getChemicalEngineeringVideo = (lessonId: string) => {
    if (lesson.solvedVideoUrl) return lesson.solvedVideoUrl;
    if (lesson.videoUrl) return lesson.videoUrl;
    return undefined;
  };

  const currentVideoSrc = lesson.solvedVideoUrl || lesson.videoUrl;
  const youtubeId = getYouTubeId(currentVideoSrc);

  // Authorization Checks for premium videos
  const isUserPremium = localStorage.getItem('simulate_premium') === 'true' || localStorage.getItem('simulate_admin') === 'true';
  const showPremiumLock = lesson.isPremium && !isUserPremium;

  // Switch or update duration whenever lesson changes
  useEffect(() => {
    setVideoDuration(duration);
  }, [lesson.duration]);

  // Unified interval timer to advance currentTime beautifully and reliably
  useEffect(() => {
    if (isPlaying) {
      intervalRef.current = setInterval(() => {
        setCurrentTime((prev) => {
          const nextVal = prev + 1;
          if (nextVal >= videoDuration) {
            setIsPlaying(false);
            if (intervalRef.current) clearInterval(intervalRef.current);
            return videoDuration;
          }
          if (videoRef.current && !useSimulation) {
            videoRef.current.currentTime = nextVal;
          }
          return nextVal;
        });
      }, 1000);
    } else {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    }
    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, [isPlaying, videoDuration, useSimulation]);

  // Handle standard audio properties sync for video elements
  useEffect(() => {
    if (videoRef.current) {
      videoRef.current.volume = isMuted ? 0 : volume / 100;
      videoRef.current.muted = isMuted;
    }
  }, [volume, isMuted]);

  // Reset progress and states on switching lesson
  useEffect(() => {
    setCurrentTime(0);
    setIsPlaying(false);
    if (videoRef.current) {
      videoRef.current.load();
    }
  }, [lesson.id]);

  // Speak captions dynamically using Web Speech Synthesis with absolute fluidity (no delays or chops)
  useEffect(() => {
    if (!('speechSynthesis' in window)) return;

    if (!isPlaying || !showCaptions || isMuted || volume === 0 || !activeCaption) {
      window.speechSynthesis.cancel();
      lastSpokenTextRef.current = "";
      return;
    }

    // Only speak if the caption content actually changed to avoid restart lag
    if (activeCaption === lastSpokenTextRef.current) {
      return;
    }

    const speakText = () => {
      window.speechSynthesis.cancel();
      
      const utterance = new SpeechSynthesisUtterance(activeCaption);
      const voices = window.speechSynthesis.getVoices();
      
      // Use the native default system voice as requested ("use my voice" / natural system default)
      const defaultVoice = voices.find(v => v.default) || voices[0];
      if (defaultVoice) {
        utterance.voice = defaultVoice;
      }
      
      // Flow fast: 1.12 speech rate, normal natural pitch 1.0
      utterance.rate = 1.12; 
      utterance.pitch = 1.0; 
      utterance.volume = volume / 100;

      utterance.onerror = (e) => {
        if (e.error !== 'interrupted') {
          console.warn('Speech synthesis state warning:', e.error);
        }
      };

      window.speechSynthesis.speak(utterance);
      lastSpokenTextRef.current = activeCaption;
    };

    speakText();

    const handleVoicesChanged = () => {
      if (!window.speechSynthesis.speaking && lastSpokenTextRef.current !== activeCaption) {
        speakText();
      }
    };

    window.speechSynthesis.addEventListener('voiceschanged', handleVoicesChanged);

    return () => {
      window.speechSynthesis.removeEventListener('voiceschanged', handleVoicesChanged);
    };
  }, [activeCaption, isPlaying, isMuted, volume, showCaptions]);

  const handleTimeUpdate = () => {
    if (videoRef.current && !useSimulation) {
      setCurrentTime(Math.floor(videoRef.current.currentTime));
    }
  };

  const handleLoadedMetadata = () => {
    if (videoRef.current && videoRef.current.duration && !useSimulation) {
      setVideoDuration(Math.round(videoRef.current.duration));
    }
  };

  const handleVideoEnded = () => {
    setIsPlaying(false);
    setCurrentTime(videoDuration);
  };

  const formatTime = (secs: number) => {
    const mins = Math.floor(secs / 60);
    const remaining = secs % 60;
    return `${mins}:${remaining < 10 ? '0' : ''}${remaining}`;
  };

  const handleScrub = (e: ChangeEvent<HTMLInputElement>) => {
    const targetVal = Number(e.target.value);
    setCurrentTime(targetVal);
    if (videoRef.current) {
      videoRef.current.currentTime = targetVal;
    }
  };

  const clickPlayOverlay = () => {
    if (youtubeId && !useSimulation) return;
    setIsPlaying(!isPlaying);
  };

  const getSimType = () => {
    if (lesson.id.startsWith('cre_')) return 'cre';
    if (lesson.id.startsWith('ht_')) return 'ht';
    return 'thermo';
  };

  const simType = getSimType();

  // Initialize particles once based on simulation type
  const initParticles = (type: string) => {
    const list = [];
    if (type === 'thermo') {
      for (let i = 0; i < 30; i++) {
        list.push({
          x: 160 + Math.random() * 180,
          y: 110 + Math.random() * 140,
          vx: (Math.random() - 0.5) * 4.5,
          vy: (Math.random() - 0.5) * 4.5,
          r: 5 + Math.random() * 3,
        });
      }
    } else if (type === 'cre') {
      for (let i = 0; i < 35; i++) {
        list.push({
          x: 120 + Math.random() * 200,
          y: 110 + Math.random() * 110,
          vx: (Math.random() - 0.5) * 3,
          vy: (Math.random() - 0.5) * 3,
          r: 4.5,
          color: '#38bdf8', // Reactant Blue
          life: Math.random() * 100,
        });
      }
    } else {
      // heat transfer
      for (let i = 0; i < 40; i++) {
        const isHot = i < 20;
        list.push({
          x: Math.random() * 300 + 60,
          y: isHot ? 125 + Math.random() * 10 : 165 + Math.random() * 10,
          vx: isHot ? (1.5 + Math.random() * 1.5) : -(1.5 + Math.random() * 1.5),
          vy: 0,
          r: 4,
          isHot,
        });
      }
    }
    particlesRef.current = list;
  };

  useEffect(() => {
    initParticles(simType);
  }, [lesson.id, simType]);

  // High fidelity canvas drawing loop
  useEffect(() => {
    let frameId: number;
    let rotation = 0;

    const draw = () => {
      const canvas = canvasRef.current;
      if (!canvas) {
        frameId = requestAnimationFrame(draw);
        return;
      }
      const ctx = canvas.getContext('2d');
      if (!ctx) {
        frameId = requestAnimationFrame(draw);
        return;
      }

      const W = canvas.width;
      const H = canvas.height;

      // Dark Slate Industrial Cyber Theme background
      ctx.fillStyle = '#111827';
      ctx.fillRect(0, 0, W, H);

      // Cyber grid
      ctx.strokeStyle = 'rgba(71, 85, 105, 0.08)';
      ctx.lineWidth = 1;
      const step = 20;
      for (let x = 0; x < W; x += step) {
        ctx.beginPath();
        ctx.moveTo(x, 0);
        ctx.lineTo(x, H);
        ctx.stroke();
      }
      for (let y = 0; y < H; y += step) {
        ctx.beginPath();
        ctx.moveTo(0, y);
        ctx.lineTo(W, y);
        ctx.stroke();
      }

      const progressFactor = currentTime / (videoDuration || 1);

      if (simType === 'thermo') {
        // PVT / Compression simulation
        const cycle = isPlaying ? Date.now() * 0.0015 : 0;
        const compression = 0.51 + Math.sin(cycle) * 0.35; // moves between 0.16 and 0.86
        const pistonY = 70 + compression * 140; // slider level

        // Draw physical chamber boundaries
        ctx.strokeStyle = '#374151';
        ctx.lineWidth = 6;
        ctx.lineCap = 'round';
        ctx.beginPath();
        ctx.moveTo(150, 60);
        ctx.lineTo(150, 260);
        ctx.lineTo(350, 260);
        ctx.lineTo(350, 60);
        ctx.stroke();

        // Draw piston head block
        ctx.fillStyle = '#4b5563';
        ctx.fillRect(153, pistonY - 20, 194, 20);

        // Draw metal shaft rod
        ctx.fillStyle = '#9ca3af';
        ctx.fillRect(240, 20, 20, pistonY - 20);

        // Update and paint gas particles
        const particles = particlesRef.current;
        // Gas dynamic color transitions based on temperature
        ctx.fillStyle = `hsl(${190 + (1 - compression) * 160}, 100%, 65%)`;

        particles.forEach((p) => {
          if (isPlaying) {
            const tempFactor = 1 / compression;
            p.x += p.vx * tempFactor * 0.35;
            p.y += p.vy * tempFactor * 0.35;

            // Collision parameters
            if (p.x - p.r < 155 || p.x + p.r > 345) {
              p.vx = -p.vx;
              p.x = p.x - p.r < 155 ? 155 + p.r : 345 - p.r;
            }
            if (p.y - p.r < pistonY || p.y + p.r > 255) {
              p.vy = -p.vy;
              p.y = p.y - p.r < pistonY ? pistonY + p.r : 255 - p.r;
            }
          }

          ctx.beginPath();
          ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
          ctx.fill();
        });

        // Numerical calculation readings
        const pressureVal = (1.1 + (1 / compression) * 12.4).toFixed(1);
        const volumeVal = (compression * 3.5).toFixed(2);
        const tempVal = (300 + (1 - compression) * 340).toFixed(0);

        // Render sleek instrument Panel Overlay
        ctx.fillStyle = 'rgba(17, 24, 39, 0.9)';
        ctx.fillRect(400, 30, 215, 290);
        ctx.strokeStyle = '#1f2937';
        ctx.strokeRect(400, 30, 215, 290);

        ctx.fillStyle = '#00A896';
        ctx.font = 'bold 11px monospace';
        ctx.fillText('⚡ THERMAL CO-CYLINDER', 415, 55);

        ctx.strokeStyle = '#00A896';
        ctx.lineWidth = 1;
        ctx.beginPath();
        ctx.moveTo(415, 65);
        ctx.lineTo(595, 65);
        ctx.stroke();

        ctx.fillStyle = '#f9fafc';
        ctx.font = 'bold 13px monospace';
        ctx.fillText(`PRESSURE : ${pressureVal} bar`, 415, 100);

        ctx.fillStyle = '#d1d5db';
        ctx.font = '11px monospace';
        ctx.fillText(`VOLUME   : ${volumeVal} m³`, 415, 130);
        ctx.fillText(`TEMP (T) : ${tempVal} K`, 415, 160);
        ctx.fillText(`ENTHALPY : ${(120 + (1 - compression)*240).toFixed(1)} kJ`, 415, 190);

        // State dynamic status indicator box
        ctx.fillStyle = pressureVal > '45' ? '#f87171' : '#60a5fa';
        ctx.font = 'bold 9px sans-serif';
        ctx.fillText(pressureVal > '45' ? '▲ CRITICAL FLUID LIMITS' : '● CONSTANT ENTHALPY EXP.', 415, 230);

        // Miniature PV curve trace schematic
        ctx.strokeStyle = '#374151';
        ctx.lineWidth = 1;
        ctx.beginPath();
        ctx.moveTo(415, 295);
        ctx.lineTo(595, 295);
        ctx.stroke();

        ctx.strokeStyle = '#00A896';
        ctx.beginPath();
        for (let ix = 0; ix < 100; ix++) {
          const iv = 0.16 + (ix / 100) * 0.7;
          const ip = 1.1 + (1 / iv) * 12.4;
          const cx = 415 + (ix / 100) * 160;
          const cy = 295 - (ip / 100) * 55;
          if (ix === 0) ctx.moveTo(cx, cy);
          else ctx.lineTo(cx, cy);
        }
        ctx.stroke();

        const curX = 415 + ((compression - 0.16) / 0.7) * 160;
        const curY = 295 - (Number(pressureVal) / 100) * 55;
        ctx.fillStyle = '#f97316';
        ctx.beginPath();
        ctx.arc(curX, curY, 4, 0, Math.PI * 2);
        ctx.fill();

      } else if (simType === 'cre') {
        const isCSTR = !lesson.id.includes('l2_2') && !lesson.title.toLowerCase().includes('pfr');
        
        if (isCSTR) {
          if (isPlaying) rotation += 0.08;

          // Main stirring tank wall
          ctx.strokeStyle = '#6b7280';
          ctx.lineWidth = 5;
          ctx.beginPath();
          ctx.moveTo(130, 70);
          ctx.lineTo(130, 230);
          ctx.arc(230, 230, 100, Math.PI, 0, true);
          ctx.lineTo(330, 70);
          ctx.stroke();

          // Coolant Jacket overlay
          ctx.strokeStyle = 'rgba(14, 165, 233, 0.2)';
          ctx.lineWidth = 12;
          ctx.beginPath();
          ctx.moveTo(115, 110);
          ctx.lineTo(115, 235);
          ctx.arc(230, 235, 115, Math.PI, 0, true);
          ctx.lineTo(345, 110);
          ctx.stroke();

          // Left Feed pipe
          ctx.strokeStyle = '#374151';
          ctx.lineWidth = 12;
          ctx.beginPath();
          ctx.moveTo(60, 90);
          ctx.lineTo(128, 90);
          ctx.stroke();

          // Bottom right outlet pipe
          ctx.beginPath();
          ctx.moveTo(328, 220);
          ctx.lineTo(395, 220);
          ctx.stroke();

          // Central core shaft spinner
          ctx.strokeStyle = '#9ca3af';
          ctx.lineWidth = 4;
          ctx.beginPath();
          ctx.moveTo(230, 30);
          ctx.lineTo(230, 200);
          ctx.stroke();

          // Propeller blade rotating transform
          ctx.save();
          ctx.translate(230, 200);
          ctx.rotate(rotation);
          ctx.fillStyle = '#4b5563';
          ctx.fillRect(-45, -8, 90, 16);
          ctx.fillStyle = '#374151';
          ctx.fillRect(-40, -4, 80, 8);
          ctx.restore();

          // Particles fluid reacting simulation
          const particles = particlesRef.current;
          particles.forEach((p) => {
            if (isPlaying) {
              const dx = 230 - p.x;
              const dy = 180 - p.y;
              const d = Math.sqrt(dx*dx + dy*dy);

              if (d < 100) {
                const angle = Math.atan2(dy, dx) + 0.06;
                const tx = 230 - Math.cos(angle) * d;
                const ty = 180 - Math.sin(angle) * d;
                p.x += (tx - p.x) * 0.12;
                p.y += (ty - p.y) * 0.12;
              } else {
                p.x += p.vx * 0.6;
                p.y += p.vy * 0.6;
              }

              // Boundary constraint limits
              const r_dx = p.x - 230;
              const r_dy = p.y - 180;
              const distC = Math.sqrt(r_dx*r_dx + r_dy*r_dy);
              if (distC > 92) {
                const nx = r_dx / distC;
                const ny = r_dy / distC;
                p.x = 230 + nx * 90;
                p.vx = -p.vx;
              }
              if (p.y < 100) {
                p.vy = -p.vy;
                p.y = 100;
              }

              p.life += 0.35;
              if (p.life > 100) {
                p.life = 0;
                p.x = 90;
                p.y = 90;
                p.color = '#00A896'; // Cyan reactant is back
              } else if (p.life > 45) {
                p.color = '#e97426'; // orange product conversion state!
              }
            }

            ctx.fillStyle = p.color;
            ctx.beginPath();
            ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
            ctx.fill();
          });

          // Draw HUD
          ctx.fillStyle = 'rgba(17, 24, 39, 0.9)';
          ctx.fillRect(400, 30, 215, 290);
          ctx.strokeStyle = '#1f2937';
          ctx.strokeRect(400, 30, 215, 290);

          ctx.fillStyle = '#10b981';
          ctx.font = 'bold 11px monospace';
          ctx.fillText('🔬 STEADY-STATE CSTR', 415, 55);

          ctx.strokeStyle = '#10b981';
          ctx.lineWidth = 1;
          ctx.beginPath();
          ctx.moveTo(415, 65);
          ctx.lineTo(595, 65);
          ctx.stroke();

          ctx.fillStyle = '#f9fafc';
          ctx.font = 'bold 13px monospace';
          const rConv = Math.round(10 + progressFactor * 75);
          ctx.fillText(`CONVERSION X: ${rConv}%`, 415, 100);

          ctx.fillStyle = '#d1d5db';
          ctx.font = '11px monospace';
          ctx.fillText(`RESIDENCE τ : 12.4 min`, 415, 130);
          ctx.fillText(`FLOW IN F₀  : 8.5 L/s`, 415, 160);
          ctx.fillText(`REACTION rA : -1.24 kg/s`, 415, 190);
          ctx.fillText(`VOL V_cstr  : 2.50 m³`, 415, 220);

          ctx.fillStyle = '#10b981';
          ctx.font = 'bold 9px sans-serif';
          ctx.fillText('● EQUILIBRIUM ACHIEVED', 415, 260);

        } else {
          // PFR Catalyst tubular simulation
          ctx.strokeStyle = '#4b5563';
          ctx.lineWidth = 5;
          ctx.strokeRect(50, 110, 330, 110);

          // Catalyst bed granules sketch
          ctx.fillStyle = 'rgba(75, 85, 99, 0.15)';
          for (let cx = 70; cx < 360; cx += 25) {
            for (let cy = 125; cy < 210; cy += 20) {
              ctx.beginPath();
              ctx.arc(cx + (cy%12), cy, 7, 0, Math.PI * 2);
              ctx.fill();
            }
          }

          // Inflow/Outflow pipes
          ctx.strokeStyle = '#374151';
          ctx.lineWidth = 10;
          ctx.beginPath();
          ctx.moveTo(10, 165);
          ctx.lineTo(50, 165);
          ctx.moveTo(380, 165);
          ctx.lineTo(420, 165);
          ctx.stroke();

          // Flow dynamics
          const pList = particlesRef.current;
          pList.forEach((p) => {
            if (isPlaying) {
              p.x += p.vx * 0.75;
              if (p.x > 370) {
                p.x = 60;
                p.y = 120 + Math.random() * 90;
              }
            }

            const ratio = (p.x - 60) / 310;
            if (ratio < 0.3) {
              ctx.fillStyle = '#00A896'; // Reactant A (cyan)
            } else if (ratio < 0.7) {
              ctx.fillStyle = '#a855f7'; // catalyst boundary intermediate
            } else {
              ctx.fillStyle = '#f97316'; // Product B (orange)
            }

            ctx.beginPath();
            ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
            ctx.fill();
          });

          // Draw PFR Digital Readout HUD
          ctx.fillStyle = 'rgba(17, 24, 39, 0.9)';
          ctx.fillRect(400, 30, 215, 290);
          ctx.strokeStyle = '#1f2937';
          ctx.strokeRect(400, 30, 215, 290);

          ctx.fillStyle = '#a855f7';
          ctx.font = 'bold 11px monospace';
          ctx.fillText('⚙️ PLUG FLOW BED (PFR)', 415, 55);

          ctx.strokeStyle = '#a855f7';
          ctx.lineWidth = 1;
          ctx.beginPath();
          ctx.moveTo(415, 65);
          ctx.lineTo(595, 65);
          ctx.stroke();

          ctx.fillStyle = '#f9fafc';
          ctx.font = 'bold 13px monospace';
          const pfrC = Math.round(5 + progressFactor * 85);
          ctx.fillText(`OUTLET X_pfr: ${pfrC}%`, 415, 100);

          ctx.fillStyle = '#d1d5db';
          ctx.font = '11px monospace';
          ctx.fillText(`VOLUME V    : 420 L`, 415, 130);
          ctx.fillText(`VELOCITY u  : 1.8 m/s`, 415, 160);
          ctx.fillText(`BED CONST. ε: 0.38`, 415, 190);
          ctx.fillText(`DP (PACKED) : 1.1 kPa`, 415, 220);

          ctx.fillStyle = '#a855f7';
          ctx.font = 'bold 10px sans-serif';
          ctx.fillText('● REACTION RATE HIGHER AT INLET', 415, 260);
        }

      } else {
        // Heat Transfer concentric pipe exchanger
        ctx.strokeStyle = '#475569';
        ctx.lineWidth = 5;
        // shell outer boundaries
        ctx.strokeRect(50, 100, 320, 120);
        // Inner pipe
        ctx.strokeRect(50, 135, 320, 50);

        // Render fluid flow particles
        const pList = particlesRef.current;
        pList.forEach((p) => {
          if (isPlaying) {
            p.x += p.vx * 0.95;
            if (p.isHot) {
              if (p.x > 360) p.x = 60;
            } else {
              if (p.x < 60) p.x = 360;
            }
          }

          if (p.isHot) {
            // Hot cooling fluid (red turning orange)
            const coolR = (p.x - 60) / 300;
            ctx.fillStyle = `rgb(239, 68, ${Math.floor(68 + coolR * 120)})`;
          } else {
            // Cold incoming counter current heating fluid (blue turning magenta)
            const warmR = (360 - p.x) / 300;
            ctx.fillStyle = `rgb(${Math.floor(59 + warmR * 140)}, 139, 246)`;
          }

          ctx.beginPath();
          ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
          ctx.fill();
        });

        // Delicate convective arrow visualizers
        if (isPlaying && Date.now() % 60 < 15) {
          ctx.strokeStyle = '#ef4444';
          ctx.lineWidth = 1;
          const sparkX = 70 + Math.random() * 260;
          ctx.beginPath();
          ctx.moveTo(sparkX, 125);
          ctx.lineTo(sparkX, 145);
          ctx.stroke();
        }

        // Draw Heat HUD
        ctx.fillStyle = 'rgba(17, 24, 39, 0.9)';
        ctx.fillRect(400, 30, 215, 290);
        ctx.strokeStyle = '#1f2937';
        ctx.strokeRect(400, 30, 215, 290);

        ctx.fillStyle = '#38bdf8';
        ctx.font = 'bold 11px monospace';
        ctx.fillText('🔥 CON-HEATING EXCHANGE', 415, 55);

        ctx.strokeStyle = '#38bdf8';
        ctx.lineWidth = 1;
        ctx.beginPath();
        ctx.moveTo(415, 65);
        ctx.lineTo(595, 65);
        ctx.stroke();

        ctx.fillStyle = '#f9fafc';
        ctx.font = 'bold 13px monospace';
        ctx.fillText(`HT LOAD Q  : 34.2 kW`, 415, 100);

        ctx.fillStyle = '#d1d5db';
        ctx.font = '11px monospace';
        ctx.fillText(`T_hot IN   : 125.0 °C`, 415, 130);
        ctx.fillText(`T_hot OUT  : ${(82 - progressFactor*8).toFixed(1)} °C`, 415, 160);
        ctx.fillText(`T_cold IN  : 16.0 °C`, 415, 190);
        ctx.fillText(`T_cold OUT : ${(44 + progressFactor*6).toFixed(1)} °C`, 415, 220);

        ctx.fillStyle = '#38bdf8';
        ctx.font = 'bold 10px sans-serif';
        ctx.fillText('● LMTD PROFILE STEADY', 415, 260);
      }

      frameId = requestAnimationFrame(draw);
    };

    frameId = requestAnimationFrame(draw);
    return () => cancelAnimationFrame(frameId);
  }, [isPlaying, simType, currentTime, videoDuration]);

  return (
    <motion.div 
      initial={{ opacity: 0, y: 30 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6, ease: 'easeOut' }}
      className="bg-[#101726] rounded-2xl overflow-hidden shadow-[0_20px_50px_rgba(16,23,38,0.25)] border border-slate-800 flex flex-col relative group" 
      id="video-player-container"
    >
      {/* OS Sim Bottom Window with simulation stream selectors */}
      <div className="bg-[#0b0f19] px-4 py-3 flex flex-col sm:flex-row sm:items-center sm:justify-between border-b border-slate-900 select-none gap-2" id="player-mac-bar">
        <div className="flex items-center space-x-2" id="mac-dots">
          <motion.span whileHover={{ scale: 1.2 }} className="w-3 h-3 rounded-full bg-[#ff5f56] block cursor-pointer" />
          <motion.span whileHover={{ scale: 1.2 }} className="w-3 h-3 rounded-full bg-[#ffbd2e] block cursor-pointer" />
          <motion.span whileHover={{ scale: 1.2 }} className="w-3 h-3 rounded-full bg-[#27c93f] block cursor-pointer" />
          <span className="text-xs text-slate-400 font-bold font-mono uppercase tracking-wider pl-2 truncate max-w-[200px]" id="mac-title-text">
            Studio Model :: {lesson.title}
          </span>
        </div>
        
        {/* Dynamic visual source switch controls */}
        <div className="flex bg-[#111827] p-1 rounded-lg border border-slate-800/80 gap-1 self-start sm:self-auto" id="feed-toggle">
          <button
            onClick={() => setUseSimulation(true)}
            className={`px-3 py-1 rounded text-[9px] font-bold tracking-wider uppercase transition-all flex items-center space-x-1 cursor-pointer ${
              useSimulation ? 'bg-[#00A896] text-white shadow' : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <Cpu className="w-3.5 h-3.5" />
            <span>🔧 Live Simulation</span>
          </button>
          <button
            onClick={() => setUseSimulation(false)}
            className={`px-3 py-1 rounded text-[9px] font-bold tracking-wider uppercase transition-all flex items-center space-x-1 cursor-pointer ${
              !useSimulation ? 'bg-[#00A896] text-white shadow' : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <Tv className="w-3.5 h-3.5" />
            <span>🎥 Camera Broadcast Feed</span>
          </button>
        </div>
      </div>

      {/* Screen Frame Content */}
      <div className="relative aspect-video bg-black flex items-center justify-center overflow-hidden" id="video-screen-frame">
        
        {showPremiumLock ? (
          /* PREMIUM SUBSCRIPTION LOCK WALL */
          <div className="absolute inset-0 z-30 bg-gradient-to-br from-[#0b101d] via-[#101726] to-[#080d1a] border border-slate-800 flex flex-col items-center justify-center p-6 text-center select-none" id="premium-lock-overlay">
            <div className="w-16 h-16 bg-[#ffbd2e]/10 text-[#ffbd2e] rounded-full flex items-center justify-center border border-[#ffbd2e]/20 mb-4 animate-pulse shadow-[0_0_30px_rgba(255,189,46,0.15)]">
              <Lock className="w-7 h-7" />
            </div>
            
            <span className="text-[10px] bg-[#E97426] text-white font-extrabold px-3 py-1 rounded-full uppercase tracking-wider mb-2 select-none shadow-md">
              👑 Premium Walkthrough Solution
            </span>
            
            <h3 className="text-lg md:text-xl font-extrabold text-white tracking-tight leading-snug max-w-md font-sans">
              Unlock Step-by-Step Chemical Walkthrough
            </h3>
            
            <p className="text-xs text-slate-405 font-medium max-w-md mt-2 leading-relaxed">
              This video guide and formula workout handout requires active Premium access. Click below to upgrade instantly and view HD lecture streams, formulas code, and tutor discussion boards.
            </p>
            
            <div className="mt-5 flex flex-col sm:flex-row gap-3">
              <button
                onClick={() => {
                  localStorage.setItem('simulate_premium', 'true');
                  window.location.reload();
                }}
                className="bg-gradient-to-r from-amber-500 to-yellow-500 hover:from-amber-600 hover:to-yellow-600 text-slate-950 font-bold px-6 py-2.5 rounded-xl text-xs flex items-center justify-center space-x-2 shadow-lg transition-transform active:scale-95 cursor-pointer"
              >
                <Unlock className="w-4 h-4 shrink-0" />
                <span>Simulate Upgrade & Unlock Video</span>
              </button>
              
              <button
                onClick={() => {
                  alert("Redirecting to subscriber payment gateway... (Tip: You can bypass this flow by turning on 'Premium subscription Simulation' in App Settings!)");
                }}
                className="bg-slate-800 hover:bg-slate-700 text-slate-200 font-semibold px-5 py-2.5 rounded-xl text-xs flex items-center justify-center space-x-1.5 transition-transform active:scale-95 cursor-pointer border border-slate-705"
              >
                <span>Purchase Membership Plan</span>
              </button>
            </div>
            
            <span className="text-[10px] text-slate-500 font-semibold font-mono mt-4 leading-none">
              Pro tip: You can toggle 'Premium subscription Simulation' inside Settings tab on 1 click.
            </span>
          </div>
        ) : (
          <>
            {/* RENDER MODE A: Canvas Process Simulation Workspace */}
            {useSimulation ? (
              <canvas
                ref={canvasRef}
                width={640}
                height={360}
                className="w-full h-full object-cover select-none absolute inset-0 cursor-pointer"
                onClick={clickPlayOverlay}
                id="simulation-canvas-core"
              />
            ) : youtubeId ? (
              /* YOUTUBE EMBED PLAYER */
              <div className="w-full h-full absolute inset-0 bg-slate-950" id="youtube-embed-wrapper">
                <iframe
                  src={`https://www.youtube.com/embed/${youtubeId}?autoplay=0&modestbranding=1&rel=0`}
                  title={lesson.title}
                  frameBorder="0"
                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                  allowFullScreen
                  className="w-full h-full object-cover select-none absolute inset-0"
                />
              </div>
            ) : (
              /* RENDER MODE B: Backplane HTML5 video player block */
              <video
                ref={videoRef}
                src={getChemicalEngineeringVideo(lesson.id)}
                onTimeUpdate={handleTimeUpdate}
                onLoadedMetadata={handleLoadedMetadata}
                onEnded={handleVideoEnded}
                onClick={clickPlayOverlay}
                className="w-full h-full object-cover select-none absolute inset-0 cursor-pointer"
                playsInline
                id="video-media-core"
              />
            )}

            {/* Dim overlay when paused */}
            {(!youtubeId || useSimulation) && (
              <div 
                onClick={clickPlayOverlay}
                className={`absolute inset-0 bg-black/40 transition-opacity duration-300 cursor-pointer ${isPlaying ? 'opacity-0 pointer-events-none' : 'opacity-100'}`} 
              />
            )}

            {/* Floating Circular Play Overlay inside Center */}
            <AnimatePresence>
              {!isPlaying && (!youtubeId || useSimulation) && (
                <motion.button
                  initial={{ opacity: 0, scale: 0.4 }}
                  animate={{ 
                    opacity: 1, 
                    scale: 1,
                    boxShadow: ["0px 0px 0px 0px rgba(0, 168, 150, 0)", "0px 0px 0px 15px rgba(0, 168, 150, 0.2)", "0px 0px 0px 0px rgba(0, 168, 150, 0)"]
                  }}
                  exit={{ opacity: 0, scale: 0.5 }}
                  transition={{ 
                    opacity: { duration: 0.2 },
                    scale: { type: 'spring', stiffness: 350, damping: 25 },
                    boxShadow: { repeat: Infinity, duration: 2, ease: "easeInOut" }
                  }}
                  whileHover={{ scale: 1.1, backgroundColor: "#00c2ad" }}
                  whileTap={{ scale: 0.9 }}
                  onClick={clickPlayOverlay}
                  className="absolute z-10 w-20 h-20 bg-[#00A896]/95 text-white rounded-full flex items-center justify-center shadow-2xl cursor-pointer"
                  id="center-play-trigger"
                >
                  <Play className="w-10 h-10 fill-white text-white translate-x-1" />
                </motion.button>
              )}
            </AnimatePresence>

            {/* Custom Closed Caption Render Layer */}
            <AnimatePresence>
              {showCaptions && isPlaying && activeCaption && (
                <motion.div 
                  initial={{ opacity: 0, y: 15 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: 15 }}
                  className="absolute bottom-16 inset-x-4 flex justify-center text-center select-none z-20 pointer-events-none" 
                  id="caption-overlay-layer"
                >
                  <span className="bg-black/90 text-white px-5 py-2.5 rounded-xl text-xs md:text-sm font-semibold max-w-xl font-sans leading-relaxed shadow-2xl border border-white/10 backdrop-blur-md">
                    {activeCaption}
                  </span>
                </motion.div>
              )}
            </AnimatePresence>
          </>
        )}
      </div>

      {/* Customized Bottom Control System */}
      <div className="bg-gradient-to-t from-black/95 via-black/90 to-[#0b0f19] p-4 border-t border-slate-900 select-none text-white flex flex-col gap-3" id="player-controls-belt">
        
        {/* Progress Bar scrubbing belt */}
        <div className="flex items-center space-x-3 w-full" id="scrubber-row">
          <input
            type="range"
            min={0}
            max={videoDuration}
            value={currentTime}
            onChange={handleScrub}
            className="w-full h-1.5 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-[#00A896] hover:accent-[#00c2ad] transition-all"
            id="video-scrub-input"
          />
        </div>

        {/* Playback action deck */}
        <div className="flex items-center justify-between" id="playback-hud-deck">
          <div className="flex items-center space-x-4.5" id="hud-deck-left">
            {/* Play/Pause state togglers */}
            <motion.button
              whileHover={{ scale: 1.15 }}
              whileTap={{ scale: 0.9 }}
              onClick={() => setIsPlaying(!isPlaying)}
              className="hover:text-[#00A896] transition-colors cursor-pointer"
              id="hud-play-pause-btn"
            >
              {isPlaying ? <Pause className="w-5 h-5 fill-white" /> : <Play className="w-5 h-5 fill-white" />}
            </motion.button>

            {/* Restart/Rewind */}
            <motion.button
              whileHover={{ scale: 1.15, rotate: -45 }}
              whileTap={{ scale: 0.9 }}
              onClick={() => setCurrentTime(0)}
              className="hover:text-[#00A896] transition-colors cursor-pointer"
              title="Restart"
            >
              <RotateCcw className="w-4 h-4" />
            </motion.button>

            {/* Volume items */}
            <div className="flex items-center space-x-2" id="volume-subset">
              <motion.button
                whileHover={{ scale: 1.15 }}
                onClick={() => setIsMuted(!isMuted)}
                className="hover:text-[#00A896] transition-colors cursor-pointer"
                id="hud-volume-icon-toggle"
              >
                {isMuted || volume === 0 ? <VolumeX className="w-4 h-4" /> : <Volume2 className="w-4 h-4" />}
              </motion.button>
              <input
                type="range"
                min={0}
                max={100}
                value={isMuted ? 0 : volume}
                onChange={(e) => {
                  setVolume(Number(e.target.value));
                  setIsMuted(false);
                }}
                className="w-16 h-1 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-[#00A896]"
                id="volume-slider"
              />
            </div>

            {/* Time code status */}
            <span className="text-xs text-slate-400 font-mono tracking-wider" id="hud-duration-readout">
              {formatTime(currentTime)} <span className="text-slate-600">/</span> {formatTime(videoDuration)}
            </span>
          </div>

          <div className="flex items-center space-x-3.5" id="hud-deck-right">
            {/* Watch on YouTube deep link dynamic option */}
            {youtubeId && (
              <motion.a
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                href={currentVideoSrc}
                target="_blank"
                rel="noreferrer"
                className="text-[9px] uppercase font-black px-3 py-1.5 rounded-lg bg-red-600/20 text-red-400 border border-red-500/30 hover:bg-red-600/30 hover:text-white transition-all duration-200 cursor-pointer flex items-center space-x-1 shrink-0"
                id="hud-deep-link-youtube"
              >
                <ExternalLink className="w-3 h-3 text-red-500" />
                <span>Watch on YouTube</span>
              </motion.a>
            )}

            {/* COMPLETED Toggle badge */}
            <motion.button
              whileHover={{ scale: 1.03 }}
              whileTap={{ scale: 0.97 }}
              onClick={onToggleComplete}
              className={`text-[9px] uppercase font-bold px-3 py-1.5 rounded-lg transition-all duration-200 cursor-pointer ${
                lesson.completed
                  ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'
                  : 'bg-slate-800/40 text-slate-400 border border-slate-700/50 hover:bg-slate-800/80 hover:text-white'
              }`}
              id="hud-toggle-completed"
            >
              {lesson.completed ? '● COMPLETED' : '○ MARK AS DONE'}
            </motion.button>

            {/* Subtitles (CC) Button */}
            <motion.button
              whileHover={{ scale: 1.1 }}
              onClick={() => setShowCaptions(!showCaptions)}
              className={`transition-colors cursor-pointer ${showCaptions ? 'text-[#00A896]' : 'text-slate-400 hover:text-slate-200'}`}
              title="Toggle Captions"
              id="hud-cc-trigger"
            >
              <Subtitles className="w-4.5 h-4.5" />
            </motion.button>

            {/* Settings */}
            <motion.button
              whileHover={{ scale: 1.1, rotate: 30 }}
              className="text-slate-400 hover:text-slate-200 transition-colors cursor-pointer"
              title="Playback Settings"
            >
              <Settings className="w-4.5 h-4.5" />
            </motion.button>

            {/* Maximize */}
            <motion.button
              whileHover={{ scale: 1.1 }}
              className="text-slate-400 hover:text-slate-200 transition-colors cursor-pointer"
              title="Fullscreen"
            >
              <Maximize className="w-4.5 h-4.5" />
            </motion.button>
          </div>
        </div>
      </div>
    </motion.div>
  );
}
