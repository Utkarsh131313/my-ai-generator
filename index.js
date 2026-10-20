<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>NovaGen - Uncensored AI Image Studio</title>
  <link rel="stylesheet" href="style.css">
</head>
<body>
  <div class="top-glow-line"></div>
  <div class="app-container">
    <header class="app-header">
      <div class="brand-badge">⚡ Free &amp; Uncensored AI Pipeline</div>
      <h1 class="brand-title">NovaGen Studio</h1>
      <p class="brand-subtitle">Powered by unofficial Perchance AI with zero paywalls.</p>
    </header>

    <main class="studio-grid">
      <!-- Input Panel -->
      <section class="glass-card">
        <div class="input-group">
          <label class="input-label" for="promptInput">Prompt Description</label>
          <textarea id="promptInput" class="prompt-textarea" rows="4" placeholder="Describe anything..."></textarea>
        </div>

        <div class="input-group">
          <label class="input-label" for="negativePromptInput">Negative Prompt (Optional)</label>
          <input type="text" id="negativePromptInput" class="text-input" placeholder="blurry, distorted, bad quality">
        </div>

        <div class="controls-row">
          <select id="styleSelect" class="select-dropdown">
            <option value="cinematic">Cinematic 8K</option>
            <option value="cyberpunk">Cyberpunk Neon</option>
            <option value="anime">Anime Artwork</option>
            <option value="photorealistic">Photoreal RAW</option>
          </select>
          <select id="engineSelect" class="select-dropdown">
            <option value="auto">Auto (Perchance + Failover)</option>
            <option value="perchance">Perchance AI</option>
            <option value="flux">Flux.1 Uncensored</option>
          </select>
        </div>

        <div class="ratio-grid">
          <button type="button" class="ratio-btn active" data-ratio="1:1">1:1 Square</button>
          <button type="button" class="ratio-btn" data-ratio="16:9">16:9 Cinema</button>
          <button type="button" class="ratio-btn" data-ratio="9:16">9:16 Story</button>
          <button type="button" class="ratio-btn" data-ratio="4:3">4:3 Standard</button>
        </div>

        <button type="button" id="generateBtn" class="btn-generate">
          <span id="btnSpinner" style="display: none;">🌀</span>
          <span id="btnText">Generate Artwork</span>
        </button>
      </section>

      <!-- Canvas Output -->
      <section class="glass-card display-card">
        <div class="display-header">
          <h2 class="display-title">🖼️ Render Canvas</h2>
          <span id="engineTag" class="engine-tag">Ready</span>
        </div>

        <div id="imageCanvas" class="image-canvas-wrapper">
          <div id="hologramScanner" class="hologram-scanner"></div>
          <div id="emptyState" class="empty-state">
            <div class="empty-icon">🌌</div>
            <h3>Your Creation Awaits</h3>
            <p>Input your visionary prompt and strike Generate.</p>
          </div>
          <div id="skeletonLoader" class="skeleton-container">
            <div class="hologram-ring"></div>
            <p class="loader-text">Synthesizing Neural Latents...</p>
          </div>
          <img id="resultImage" class="generated-image" style="display: none;" alt="Generated Artwork" />
        </div>

        <div id="imageToolbar" class="image-toolbar" style="display: none;">
          <button type="button" id="copyPromptBtn" class="action-btn">📋 Copy Prompt</button>
          <button type="button" id="downloadBtn" class="action-btn">💾 Download HD</button>
        </div>
      </section>
    </main>
  </div>
  <script src="script.js"></script>
</body>
</html>