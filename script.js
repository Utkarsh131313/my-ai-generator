/**
 * NovaGen - Client Script (script.js)
 * Production frontend logic connecting to /api/generate
 * Dedicated strictly to Perchance AI with Batch generation up to 50 images
 */

document.addEventListener('DOMContentLoaded', () => {
  const promptInput = document.getElementById('promptInput');
  const negativePromptInput = document.getElementById('negativePromptInput');
  const styleSelect = document.getElementById('styleSelect');
  const countSelect = document.getElementById('countSelect');
  const generateBtn = document.getElementById('generateBtn');
  const btnText = document.getElementById('btnText');
  const btnSpinner = document.getElementById('btnSpinner');

  const emptyState = document.getElementById('emptyState');
  const skeletonLoader = document.getElementById('skeletonLoader');
  const hologramScanner = document.getElementById('hologramScanner');
  const imageCanvas = document.getElementById('imageCanvas');
  const imageToolbar = document.getElementById('imageToolbar');
  const engineTag = document.getElementById('engineTag');
  const downloadBtn = document.getElementById('downloadBtn');
  const copyPromptBtn = document.getElementById('copyPromptBtn');
  const randomizeHint = document.getElementById('randomizeHint');
  const ratioBtns = document.querySelectorAll('.ratio-btn');
  const toast = document.getElementById('toastNotice');
  const toastMsg = document.getElementById('toastMsg');
  const batchGrid = document.getElementById('batchGrid');
  const batchContainer = document.getElementById('batchContainer');

  let currentAspectRatio = '1:1';
  let isGenerating = false;
  let activeImageUrl = '';
  let generatedBatch = [];

  const sampleIdeas = [
    "A futuristic cybernetic cyborg samurai standing in the neon rain of Neo-Tokyo, cinematic lighting, 8k resolution",
    "Ethereal bioluminescent elven temple hidden inside an ancient cavern waterfall, glowing cyan crystals, dark fantasy concept art",
    "Futuristic cyberpunk female hacker wearing glowing holographic visor and leather jacket, reflections in dark wet pavement",
    "Cosmic astronaut drifting inside an interstellar purple nebula shaped like a celestial dragon, hyperdetailed",
    "A retro 1980s DeLorean flying through a synthwave neon grid towards a digital sunset, chrome reflections, outrun aesthetic"
  ];

  // Aspect ratio helper CSS class mapping
  const ratioClasses = {
    '1:1': 'aspect-square',
    '16:9': 'aspect-video',
    '9:16': 'aspect-[9/16]',
    '4:3': 'aspect-[4/3]'
  };

  // Aspect ratio button toggle
  ratioBtns.forEach((btn) => {
    btn.addEventListener('click', () => {
      ratioBtns.forEach((b) => b.classList.remove('active'));
      btn.classList.add('active');
      currentAspectRatio = btn.getAttribute('data-ratio');
      updateCanvasAspectRatio();
    });
  });

  function updateCanvasAspectRatio() {
    if (!imageCanvas) return;
    imageCanvas.classList.remove('aspect-square', 'aspect-video', 'aspect-[9/16]', 'aspect-[4/3]');
    imageCanvas.classList.add(ratioClasses[currentAspectRatio] || 'aspect-square');
  }

  // Initial aspect ratio setup
  updateCanvasAspectRatio();

  // Randomize prompt
  if (randomizeHint) {
    randomizeHint.addEventListener('click', () => {
      const idea = sampleIdeas[Math.floor(Math.random() * sampleIdeas.length)];
      promptInput.value = idea;
      promptInput.focus();
      showToast('🎲 Random prompt loaded!');
    });
  }

  // Suggestion chips
  document.querySelectorAll('.suggestion-chip').forEach((chip) => {
    chip.addEventListener('click', () => {
      const text = chip.getAttribute('data-prompt');
      if (text) {
        promptInput.value = text;
        promptInput.focus();
      }
    });
  });

  // Ctrl/Cmd + Enter
  promptInput.addEventListener('keydown', (e) => {
    if ((e.ctrlKey || e.metaKey) && e.key === 'Enter') {
      e.preventDefault();
      handleGenerate();
    }
  });

  generateBtn.addEventListener('click', handleGenerate);

  async function handleGenerate() {
    const promptText = promptInput.value.trim();

    if (!promptText) {
      showToast('⚠️ Please enter an image prompt first.');
      promptInput.focus();
      return;
    }

    if (isGenerating) return;

    const countVal = countSelect ? parseInt(countSelect.value, 10) || 1 : 1;

    // Loading state
    isGenerating = true;
    generateBtn.disabled = true;
    btnText.textContent = countVal > 1 ? `Generating ${countVal} Images...` : 'Generating Image...';
    btnSpinner.style.display = 'inline-block';

    emptyState.style.display = 'none';
    if (batchContainer) batchContainer.style.display = 'none';
    imageToolbar.style.display = 'none';
    skeletonLoader.style.display = 'flex';
    hologramScanner.style.display = 'block';

    const payload = {
      prompt: promptText,
      negativePrompt: negativePromptInput ? negativePromptInput.value.trim() : '',
      style: styleSelect ? styleSelect.value : 'cinematic',
      aspectRatio: currentAspectRatio,
      count: countVal,
      seed: Math.floor(Math.random() * 10000000)
    };

    try {
      const response = await fetch('/api/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });

      const data = await response.json();

      if (!response.ok || !data.success) {
        throw new Error(data.error || 'Failed to render image.');
      }

      generatedBatch = data.images && data.images.length > 0 ? data.images : [{ imageUrl: data.imageUrl, prompt: promptText }];
      activeImageUrl = generatedBatch[0].imageUrl;

      skeletonLoader.style.display = 'none';
      hologramScanner.style.display = 'none';

      // Render images into the batch grid with exact CSS aspect ratio
      if (batchGrid) {
        batchGrid.innerHTML = '';
        generatedBatch.forEach((item, index) => {
          const card = document.createElement('div');
          card.className = `relative rounded-xl overflow-hidden border border-cyan-500/20 group bg-black/40 ${ratioClasses[currentAspectRatio] || 'aspect-square'}`;
          card.innerHTML = `
            <img src="${item.imageUrl}" alt="${promptText}" class="w-full h-full object-contain transition-transform duration-300 group-hover:scale-105" />
            <div class="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2 p-2">
              <button type="button" class="action-btn px-2.5 py-1 text-xs" onclick="window.downloadSingle('${item.imageUrl}', ${index})">💾 Save</button>
            </div>
          `;
          batchGrid.appendChild(card);
        });

        if (batchContainer) batchContainer.style.display = 'block';
      }

      imageToolbar.style.display = 'flex';
      if (engineTag) engineTag.textContent = `Perchance AI (${generatedBatch.length} rendered)`;

      showToast(`✨ Successfully generated ${generatedBatch.length} image(s)!`);

    } catch (err) {
      console.error('Generation Error:', err);
      skeletonLoader.style.display = 'none';
      hologramScanner.style.display = 'none';
      emptyState.style.display = 'flex';
      showToast(`❌ Error: ${err.message || 'Generation failed'}`);
    } finally {
      isGenerating = false;
      generateBtn.disabled = false;
      btnText.textContent = 'Generate Artwork';
      btnSpinner.style.display = 'none';
    }
  }

  // Global download single handler
  window.downloadSingle = (url, index) => {
    const link = document.createElement('a');
    link.href = url;
    link.download = `perchance-gen-${Date.now()}-${index + 1}.png`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    showToast('💾 Image downloaded!');
  };

  // Download All Batch handler
  if (downloadBtn) {
    downloadBtn.addEventListener('click', () => {
      if (!generatedBatch.length) return;
      generatedBatch.forEach((item, i) => {
        setTimeout(() => {
          window.downloadSingle(item.imageUrl, i);
        }, i * 300);
      });
      showToast(`💾 Downloading ${generatedBatch.length} artwork(s)...`);
    });
  }

  // Copy Prompt
  if (copyPromptBtn) {
    copyPromptBtn.addEventListener('click', async () => {
      if (!promptInput.value) return;
      try {
        await navigator.clipboard.writeText(promptInput.value);
        showToast('📋 Prompt copied to clipboard!');
      } catch {
        showToast('⚠️ Could not copy prompt.');
      }
    });
  }

  // Toast notification
  let toastTimer = null;
  function showToast(message) {
    if (!toast || !toastMsg) return;
    if (toastTimer) clearTimeout(toastTimer);
    toastMsg.textContent = message;
    toast.classList.add('show');
    toastTimer = setTimeout(() => {
      toast.classList.remove('show');
    }, 3800);
  }
});
