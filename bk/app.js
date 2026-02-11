document.addEventListener('DOMContentLoaded', () => {
    const track = document.getElementById('timeline-track');
    const zoomSlider = document.getElementById('zoom-slider');
    const sidePanel = document.getElementById('side-panel');
    const panelContent = document.getElementById('panel-content');
    const closePanel = document.getElementById('close-panel');
    const lightbox = document.getElementById('lightbox');
    const lightboxImg = document.getElementById('lightbox-img');
    const lightboxZoom = document.getElementById('lightbox-zoom');
    const closeLightbox = document.getElementById('close-lightbox');
    const loadingIndicator = document.getElementById('loading-indicator');

    // State
    let zoomLevel = 180; // px per unit
    let globalTimelineData = []; // Store fetched data

    // Initialize
    async function init() {
        setupEventListeners();
        await fetchTimelineData();
    }

    // Fetch Data from GAS
    async function fetchTimelineData() {
        try {
            if (loadingIndicator) loadingIndicator.style.display = 'flex';

            const url = `${APP_CONFIG.apiUrl}?action=${APP_CONFIG.action}&key=${APP_CONFIG.apiKey}`;
            const response = await fetch(url);
            const data = await response.json();

            if (data.error) {
                console.error("API Error:", data.error);
                showError(data.error);
                return;
            }

            globalTimelineData = data;
            render();
        } catch (error) {
            console.error("Fetch Error:", error);
            showError("Failed to load timeline data. Please check connection.");
        } finally {
            if (loadingIndicator) loadingIndicator.style.display = 'none';
        }
    }

    function showError(msg) {
        track.innerHTML = `<div class="error-msg"><i class="fas fa-exclamation-triangle"></i> ${msg}</div>`;
    }

    // Render Timeline
    function render() {
        track.innerHTML = ''; // Keep loading indicator logic separate

        if (globalTimelineData.length === 0) {
            track.innerHTML = '<div class="empty-msg">No data available</div>';
            return;
        }

        globalTimelineData.forEach(yearData => {
            const modelCount = yearData.models.length;
            // Ensure enough width for staggered nodes
            const spacing = zoomLevel;
            const blockWidth = Math.max(modelCount * spacing, 300); // Min width for description box

            // Create Year Block
            const yearBlock = document.createElement('div');
            yearBlock.className = 'year-block';
            yearBlock.style.width = `${blockWidth}px`;

            // Background Year Line Marker
            const marker = document.createElement('div');
            marker.className = 'year-marker';
            marker.setAttribute('data-year', yearData.year);
            yearBlock.appendChild(marker);

            // Large Background Number
            const numberLabel = document.createElement('div');
            numberLabel.className = 'year-label';
            numberLabel.innerText = yearData.year;
            yearBlock.appendChild(numberLabel);

            // Nodes Container
            const nodesContainer = document.createElement('div');
            nodesContainer.className = 'nodes-container';

            yearData.models.forEach((model, index) => {
                const node = document.createElement('div');
                // Alternating Top vs Bottom
                const isTop = index % 2 === 0;
                node.className = `node ${isTop ? 'node-top' : 'node-bottom'}`;

                // Position logic: Spread them out evenly in the block
                // Start a bit inward (e.g. 50px)
                const leftPos = 50 + (index * spacing);
                node.style.left = `${leftPos}px`;

                node.onclick = (e) => {
                    e.stopPropagation();
                    openSidePanel(model);
                };

                // Image Wrapper
                const imgWrap = document.createElement('div');
                imgWrap.className = 'node-img-wrapper';

                const img = document.createElement('img');
                if (model.image) {
                    img.src = model.image;
                } else {
                    img.src = `https://placehold.co/400x400/222/FFF?text=${model.model}`;
                }

                img.onerror = function () {
                    this.src = `https://placehold.co/400x400/222/FFF?text=${model.model}`;
                };
                imgWrap.appendChild(img);

                // Axis Dot
                const dot = document.createElement('div');
                dot.className = 'node-axis-dot';

                // Label Card
                const labelCard = document.createElement('div');
                labelCard.className = 'node-label';

                const brandSpan = document.createElement('div');
                brandSpan.className = 'node-brand';
                brandSpan.innerText = model.brand;

                const modelSpan = document.createElement('div');
                modelSpan.className = 'node-model';
                modelSpan.innerText = model.model;

                labelCard.appendChild(brandSpan);
                labelCard.appendChild(modelSpan);

                // Correct Dom Order for styles
                // For layout flex direction is column or col-reverse handled by CSS
                // But generally: Content -> Dot -> Line(pseudo)
                node.appendChild(imgWrap);
                node.appendChild(dot);
                node.appendChild(labelCard);
                nodesContainer.appendChild(node);
            });

            yearBlock.appendChild(nodesContainer);

            // Description Block (Era) - Collapsible Design
            if (yearData.title || yearData.description) {
                const desc = document.createElement('div');
                desc.className = 'year-description';

                // Header Container
                const header = document.createElement('div');
                header.className = 'desc-header';

                const titleHtml = document.createElement('h4');
                titleHtml.innerText = yearData.title || `${yearData.year} Market`;

                // Toggle Button
                const toggleBtn = document.createElement('button');
                toggleBtn.className = 'toggle-btn';
                toggleBtn.innerHTML = '<i class="fas fa-chevron-down"></i>';

                // Toggle Click Event
                toggleBtn.onclick = (e) => {
                    e.stopPropagation(); // Prevent bubbling if needed
                    desc.classList.toggle('collapsed');
                };

                header.appendChild(titleHtml);
                header.appendChild(toggleBtn);

                const textHtml = document.createElement('p');
                textHtml.innerText = yearData.description || '';

                desc.appendChild(header);
                if (yearData.description) desc.appendChild(textHtml);

                yearBlock.appendChild(desc);
            }

            track.appendChild(yearBlock);
        });

        // Reveal track after render
        requestAnimationFrame(() => {
            track.classList.add('loaded');
        });
    }

    // Event Listeners
    function setupEventListeners() {
        // Zoom
        zoomSlider.addEventListener('input', (e) => {
            zoomLevel = parseInt(e.target.value);
            render();
        });

        document.getElementById('zoom-in').onclick = () => {
            zoomSlider.value = Math.min(400, parseInt(zoomSlider.value) + 20);
            zoomSlider.dispatchEvent(new Event('input'));
        };

        document.getElementById('zoom-out').onclick = () => {
            zoomSlider.value = Math.max(100, parseInt(zoomSlider.value) - 20);
            zoomSlider.dispatchEvent(new Event('input'));
        };

        // Side Panel
        closePanel.onclick = () => {
            sidePanel.classList.remove('open');
        };

        // Lightbox
        closeLightbox.onclick = () => {
            lightbox.classList.remove('active');
        };

        lightboxZoom.addEventListener('input', (e) => {
            lightboxImg.style.transform = `scale(${e.target.value})`;
        });

        // Close lightbox on backdrop click
        document.querySelector('.lightbox-backdrop').onclick = () => {
            lightbox.classList.remove('active');
        };
    }

    function openSidePanel(model) {
        // Specs from new schema
        const specs = model.specs || {};

        // Render Reference Links (split by semicolon)
        let refLinksHtml = '';
        if (model.ref) {
            const urls = model.ref.split(';').map(u => u.trim()).filter(u => u);
            if (urls.length > 0) {
                refLinksHtml = `
                <div class="ref-links-group">
                    <h3>REFERENCES</h3>
                    <div class="ref-buttons">
                        ${urls.map((u, i) => `<a href="${u}" target="_blank" class="ref-btn"><i class="fas fa-external-link-alt"></i> Source ${i + 1}</a>`).join('')}
                    </div>
                </div>`;
            }
        }

        // Feature / Key Innovation
        const featureHtml = specs.feature ? `
            <div class="spec-full-width">
                <span class="spec-label-block">KEY INNOVATION</span>
                <p class="spec-text">${specs.feature}</p>
            </div>
        ` : '';

        panelContent.innerHTML = `
            <div class="detail-header">
                <div class="detail-title">${model.model}</div>
                <div class="detail-subtitle">${model.brand}</div>
            </div>
            
            <img src="${model.image}" class="detail-img" onerror="this.src='https://placehold.co/600x400/222/FFF?text=No+Image'">
            
            <div class="spec-grid">
                <div class="spec-item">
                    <span class="spec-label">TYPE</span>
                    <span class="spec-value">${specs.type || '-'}</span>
                </div>
                <div class="spec-item">
                    <span class="spec-label">BLADE</span>
                    <span class="spec-value">${specs.blade || '-'}</span>
                </div>
                <div class="spec-item">
                    <span class="spec-label">MOTOR</span>
                    <span class="spec-value">${specs.motor || '-'}</span>
                </div>
                <div class="spec-item">
                    <span class="spec-label">YEAR</span>
                    <span class="spec-value">${globalTimelineData.find(y => y.models.includes(model))?.year || '-'}</span>
                </div>
            </div>

            ${featureHtml}

            <h3>DESCRIPTION</h3>
            <p class="detail-desc">${model.desc || 'No detailed description available.'}</p>
            
            ${refLinksHtml}
        `;
        sidePanel.classList.add('open');
    }

    init();
});
