import { useState } from 'react';
import './index.css';

function App() {
  const [prompt, setPrompt] = useState('A LARGE ORANGE OCTOPUS ON AN OCEAN FLOOR, CINEMATIC, 8K');
  const [negativePrompt, setNegativePrompt] = useState('');
  const [width, setWidth] = useState(512);
  const [height, setHeight] = useState(512);
  const [steps, setSteps] = useState(10);
  const [cfgScale, setCfgScale] = useState(1.0);
  const [seed, setSeed] = useState(-1);
  const [sampler, setSampler] = useState('euler_a');

  const [loading, setLoading] = useState(false);
  const [resultImg, setResultImg] = useState(null);
  const [logs, setLogs] = useState('');
  const [genTime, setGenTime] = useState(null);

  const sizes = [
    { label: "1:1 (256X256)", w: 256, h: 256 },
    { label: "1:1 (512X512)", w: 512, h: 512 },
    { label: "1:1 (768X768)", w: 768, h: 768 },
    { label: "1:1 (1024X1024)", w: 1024, h: 1024 },
    { label: "16:9 (640X384)", w: 640, h: 384 },
    { label: "16:9 (896X512)", w: 896, h: 512 },
    { label: "16:9 (1024X576)", w: 1024, h: 576 },
    { label: "9:16 (384X640)", w: 384, h: 640 },
    { label: "9:16 (512X896)", w: 512, h: 896 },
    { label: "9:16 (576X1024)", w: 576, h: 1024 }
  ];

  const handlePresetChange = (e) => {
    const selected = sizes.find(s => s.label === e.target.value);
    if (selected) {
      setWidth(selected.w);
      setHeight(selected.h);
    }
  };

  const generate = async () => {
    setLoading(true);
    setResultImg(null);
    setLogs('INITIALIZING GENERATION...');
    setGenTime(null);

    const formData = new FormData();
    formData.append('prompt', prompt);
    formData.append('negative_prompt', negativePrompt);
    formData.append('width', width);
    formData.append('height', height);
    formData.append('steps', steps);
    formData.append('cfg_scale', cfgScale);
    formData.append('seed', seed);
    formData.append('sampling_method', sampler);

    try {
      const response = await fetch('http://127.0.0.1:9000/api/generate', {
        method: 'POST',
        body: formData,
      });

      const data = await response.json();

      if (response.ok) {
        setResultImg(`http://127.0.0.1:9000${data.url}`);
        setLogs(data.log);
        setGenTime(data.time);
      } else {
        setLogs(data.error + '\n' + (data.details || ''));
      }
    } catch (err) {
      setLogs('REQUEST FAILED: ' + err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <div className="container">
        <header className="hero-header">
          <h1 className="glitch" data-text="TURBOFORGE">TURBOFORGE</h1>
          <p className="subtitle">NEXT-GEN AI SYNTHESIS</p>
        </header>

        <div className="main-layout">
          {/* Sidebar Controls */}
          <div className="sidebar glass-panel neon-border">
            <h2 className="section-title">PARAMETERS</h2>
            
            <div className="form-group">
              <label>PROMPT</label>
              <textarea
                value={prompt}
                onChange={(e) => setPrompt(e.target.value)}
                placeholder="DESCRIBE YOUR VISION..."
                className="glow-input"
              />
            </div>

            <div className="form-group">
              <label>NEGATIVE PROMPT</label>
              <textarea
                value={negativePrompt}
                onChange={(e) => setNegativePrompt(e.target.value)}
                placeholder="EXCLUDE ELEMENTS..."
                className="glow-input"
                style={{ minHeight: '80px' }}
              />
            </div>

            <div className="form-group">
              <label>RESOLUTION</label>
              <select onChange={handlePresetChange} defaultValue="1:1 (512X512)" className="glow-input">
                {sizes.map(s => <option key={s.label} value={s.label}>{s.label}</option>)}
              </select>
            </div>

            <div className="grid-2">
              <div className="form-group">
                <label>STEPS: <span className="highlight">{steps}</span></label>
                <input
                  type="range" min="1" max="50" step="1"
                  value={steps} onChange={(e) => setSteps(parseInt(e.target.value))}
                  className="cyber-slider"
                />
              </div>
              <div className="form-group">
                <label>CFG SCALE: <span className="highlight">{cfgScale}</span></label>
                <input
                  type="range" min="0.0" max="10.0" step="0.1"
                  value={cfgScale} onChange={(e) => setCfgScale(parseFloat(e.target.value))}
                  className="cyber-slider"
                />
              </div>
            </div>

            <div className="grid-2">
              <div className="form-group">
                <label>SEED</label>
                <input
                  type="number"
                  value={seed}
                  onChange={(e) => setSeed(parseInt(e.target.value) || 0)}
                  className="glow-input"
                />
              </div>
              <div className="form-group">
                <label>SAMPLER</label>
                <select value={sampler} onChange={(e) => setSampler(e.target.value)} className="glow-input">
                  <option value="euler">EULER</option>
                  <option value="euler_a">EULER A</option>
                  <option value="dpm++2m">DPM++ 2M</option>
                  <option value="lcm">LCM</option>
                </select>
              </div>
            </div>

            <button
              className="btn-cyberpunk"
              onClick={generate}
              disabled={loading}
            >
              {loading ? 'SYNTHESIZING...' : 'INITIALIZE GENERATION'}
              <div className="btn-glitch-layer"></div>
            </button>
          </div>

          {/* main preview area */}
          <div className="content-area glass-panel">
            <div className="image-preview-container">
              <div className="image-preview">
                {loading ? (
                  <div className="loading-state">
                    <div className="cyber-loader"></div>
                    <div className="cyber-text">PROCESSING NEURAL NETWORK...</div>
                  </div>
                ) : resultImg ? (
                  <img src={resultImg} alt="Generated result" className="result-image fade-in" />
                ) : (
                  <div className="empty-state">
                    <h3 className="cyber-text">SYSTEM STANDBY</h3>
                    <p>AWAITING PARAMETERS TO COMMENCE SYNTHESIS</p>
                  </div>
                )}
              </div>
            </div>

            <div className="meta-info">
              {genTime && (
                <div className="time-badge cyber-text">
                  RUNTIME: <span className="highlight">{genTime}s</span>
                </div>
              )}
            </div>

            {logs && (
              <div className="terminal-window">
                <div className="terminal-header">
                  <span className="dot red"></span>
                  <span className="dot yellow"></span>
                  <span className="dot green"></span>
                  <span className="terminal-title">SYSTEM_LOGS.exe</span>
                </div>
                <textarea
                  value={logs}
                  readOnly
                  className="terminal-body cyber-text"
                />
              </div>
            )}
          </div>
        </div>
      </div>

      <footer className="cyber-footer">
        <div className="credits">
          ENGINEERED BY <span className="neon-text">LLMUNIVERSE</span> & <span className="neon-text">NIKHIL KUSHWAHA</span>
        </div>
      </footer>
    </>
  );
}

export default App;
