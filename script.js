// Standalone Vercel frontend script connecting to /api/generate
document.addEventListener('DOMContentLoaded', () => {
  const promptInput = document.getElementById('promptInput');
  const negativePromptInput = document.getElementById('negativePromptInput');
  const styleSelect = document.getElementById('styleSelect');
  const engineSelect = document.getElementById('engineSelect');
  const generateBtn = document.getElementById('generateBtn');
  const resultImage = document.getElementById('resultImage');
  const skeletonLoader = document.getElementById('skeletonLoader');
  const hologramScanner = document.getElementById('hologramScanner');
  const emptyState = document.getElementById('emptyState');
  const imageToolbar = document.getElementById('imageToolbar');
  const downloadBtn = document.getElementById('downloadBtn');
  const ratioBtns = document.querySelectorAll('.ratio-btn');

  let currentRatio = '1:1';
  let activeImageUrl = '';

  ratioBtns.forEach(btn => {
    btn.addEventListener('click', () => {
      ratioBtns.forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
      currentRatio = btn.getAttribute('data-ratio');
    });
  });

  generateBtn.addEventListener('click', async () => {
    const prompt = promptInput.value.trim();
    if (!prompt) return alert('Please enter a prompt!');

    generateBtn.disabled = true;
    emptyState.style.display = 'none';
    resultImage.style.display = 'none';
    skeletonLoader.style.display = 'flex';
    hologramScanner.style.display = 'block';

    try {
      const res = await fetch('/api/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          prompt,
          negativePrompt: negativePromptInput.value.trim(),
          style: styleSelect.value,
          aspectRatio: currentRatio,
          engine: engineSelect.value
        })
      });

      const data = await res.json();
      if (!res.ok || !data.success) throw new Error(data.error || 'Generation failed');

      activeImageUrl = data.imageUrl;
      resultImage.src = data.imageUrl;
      resultImage.onload = () => {
        skeletonLoader.style.display = 'none';
        hologramScanner.style.display = 'none';
        resultImage.style.display = 'block';
        resultImage.classList.add('loaded');
        imageToolbar.style.display = 'flex';
      };
    } catch (err) {
      alert('Error: ' + err.message);
      skeletonLoader.style.display = 'none';
      hologramScanner.style.display = 'none';
      emptyState.style.display = 'flex';
    } finally {
      generateBtn.disabled = false;
    }
  });

  downloadBtn.addEventListener('click', () => {
    if (!activeImageUrl) return;
    const a = document.createElement('a');
    a.href = activeImageUrl;
    a.download = 'ai-art.png';
    a.click();
  });
});