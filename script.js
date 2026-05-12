// ===== CONFIGURATION =====
// UPDATE THESE WITH YOUR are.na CHANNEL NAMES
const ARENA_CHANNELS = {
    all: ['photography', 'design', 'inspiration'], // Multiple channels for "All"
    photography: 'photography',
    design: 'design',
    inspiration: 'inspiration'
};

const ARENA_API = 'https://api.are.na/v2/channels';
const PHOTOS_PER_CHANNEL = 50;

// ===== DOM Elements =====
const photosContainer = document.getElementById('photos');
const loadingElement = document.getElementById('loading');
const errorElement = document.getElementById('error');
const navLinks = document.querySelectorAll('.nav-link');

// ===== Event Listeners =====
navLinks.forEach(link => {
    link.addEventListener('click', (e) => {
        e.preventDefault();
        
        // Update active link
        navLinks.forEach(l => l.classList.remove('active'));
        link.classList.add('active');
        
        // Load photos
        const channel = link.dataset.channel;
        loadPhotos(channel);
    });
});

// ===== Functions =====

/**
 * Fetch photos from are.na channel(s)
 */
async function loadPhotos(channelKey) {
    photosContainer.innerHTML = '';
    loadingElement.style.display = 'block';
    errorElement.style.display = 'none';
    
    try {
        let allPhotos = [];
        
        // Handle "All" or single channel
        const channels = Array.isArray(ARENA_CHANNELS[channelKey]) 
            ? ARENA_CHANNELS[channelKey] 
            : [ARENA_CHANNELS[channelKey]];
        
        // Fetch from each channel
        for (const channel of channels) {
            try {
                const response = await fetch(
                    `${ARENA_API}/${channel}?per=${PHOTOS_PER_CHANNEL}`
                );
                
                if (!response.ok) {
                    throw new Error(`Channel "${channel}" not found`);
                }
                
                const data = await response.json();
                const photos = data.contents.filter(item => item.image);
                allPhotos = allPhotos.concat(photos);
            } catch (error) {
                console.error(`Error loading channel "${channel}":`, error);
            }
        }
        
        loadingElement.style.display = 'none';
        
        if (allPhotos.length === 0) {
            showError('No images found in this channel. Make sure your channel names are correct!');
            return;
        }
        
        // Display photos
        displayPhotos(allPhotos);
    } catch (error) {
        loadingElement.style.display = 'none';
        showError(`Error loading photos: ${error.message}`);
        console.error('Error:', error);
    }
}

/**
 * Display photos in grid
 */
function displayPhotos(photos) {
    photosContainer.innerHTML = '';
    
    photos.forEach(photo => {
        const card = document.createElement('div');
        card.className = 'photo-card';
        
        const imageUrl = photo.image.display.url;
        const title = photo.title || 'Untitled';
        const description = photo.description ? photo.description.substring(0, 100) : '';
        
        card.innerHTML = `
            <img src="${imageUrl}" alt="${title}" class="photo-image">
            <div class="photo-info">
                <h3 class="photo-title">${title}</h3>
                ${description ? `<p class="photo-description">${description}...</p>` : ''}
            </div>
        `;
        
        photosContainer.appendChild(card);
    });
}

/**
 * Show error message
 */
function showError(message) {
    errorElement.textContent = message;
    errorElement.style.display = 'block';
}

// ===== Initialize =====
// Load "All" channels on page load and set as active
window.addEventListener('DOMContentLoaded', () => {
    document.querySelector('[data-channel="all"]').classList.add('active');
    loadPhotos('all');
});
