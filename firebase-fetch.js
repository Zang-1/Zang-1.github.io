const firebaseConfig = {
    apiKey: "AIzaSyBp8Ka6AFVupP_fUS7Y-fZNMq8AVTG3-qc",
    authDomain: "zang-portfolio.firebaseapp.com",
    projectId: "zang-portfolio",
    storageBucket: "zang-portfolio.firebasestorage.app",
    messagingSenderId: "498517273686",
    appId: "1:498517273686:web:edbedcf156e77505bb5ff7",
    measurementId: "G-XZ1SV2NKM8"
};

// Ensure firebase is defined before initializing (it should be since the script is included above this one)
if (typeof firebase !== 'undefined') {
    firebase.initializeApp(firebaseConfig);
    const db = firebase.firestore();

    async function fetchAndInjectContent() {
        try {
            const docRef = db.collection('portfolio').doc('content');
            const docSnap = await docRef.get();

            if (docSnap.exists) {
                const data = docSnap.data();
                
                // 1. Update Music Sections
                if (data.music && Array.isArray(data.music)) {
                    updateMusicLinks(data.music);
                }

                // 2. Update Galleries
                if (data.gallery) {
                    updateGallery('billiards', data.gallery.billiards);
                    updateGallery('motorcycles', data.gallery.motorcycles);
                    updateGallery('life', data.gallery.life);
                }
            }
        } catch (error) {
            console.error("Error fetching content from Firebase:", error);
        }
    }

    function updateMusicLinks(musicUrls) {
        const swiperWrapper = document.querySelector('.music-swiper .swiper-wrapper');
        if (!swiperWrapper || musicUrls.length === 0) return;

        // Clear existing slides
        swiperWrapper.innerHTML = '';

        // Add new slides from Firebase
        musicUrls.forEach(inputUrl => {
            let url = inputUrl.trim();
            
            // 1. If user pasted the whole <iframe> tag, extract the src
            const srcMatch = url.match(/src=["'](.*?)["']/);
            if (srcMatch) {
                url = srcMatch[1];
            }
            
            // 2. If user pasted a normal Spotify link instead of an embed link
            if (url.includes('spotify.com/track/') && !url.includes('/embed/')) {
                url = url.replace('spotify.com/track/', 'spotify.com/embed/track/');
            } else if (url.includes('spotify.com/playlist/') && !url.includes('/embed/')) {
                url = url.replace('spotify.com/playlist/', 'spotify.com/embed/playlist/');
            }

            const slide = document.createElement('div');
            slide.className = 'swiper-slide';
            slide.innerHTML = `
                <div class="spotify-embed">
                    <iframe style="border-radius:12px" src="${url}" width="100%" height="352" frameBorder="0" allowfullscreen="" allow="autoplay; clipboard-write; encrypted-media; fullscreen; picture-in-picture" loading="lazy"></iframe>
                </div>
            `;
            swiperWrapper.appendChild(slide);
        });

        // Re-initialize swiper by finding the DOM element and re-applying the config
        if (typeof Swiper !== 'undefined') {
            const swiperEl = document.querySelector('.music-swiper');
            if (swiperEl && swiperEl.swiper) {
                swiperEl.swiper.destroy(true, true);
            }

            new Swiper('.music-swiper', {
                effect: 'coverflow',
                grabCursor: true,
                centeredSlides: true,
                slidesPerView: 'auto',
                loop: true,
                speed: 600,
                coverflowEffect: {
                    rotate: 40,
                    stretch: 0,
                    depth: 150,
                    modifier: 1,
                    slideShadows: false,
                },
                navigation: {
                    nextEl: '.swiper-button-next',
                    prevEl: '.swiper-button-prev',
                },
                pagination: {
                    el: '.swiper-pagination',
                    clickable: true,
                }
            });
        }
    }

    function updateGallery(categoryId, categoryData) {
        if (!categoryData) return;

        // Update Cover
        if (categoryData.cover) {
            const coverImg = document.querySelector(`#frame-${categoryId} .frame-cover-image img`);
            if (coverImg) {
                coverImg.src = categoryData.cover;
            }
        }

        // Update Inside Images
        if (categoryData.images && Array.isArray(categoryData.images)) {
            const grid = document.getElementById(`grid-${categoryId}`);
            if (grid) {
                grid.innerHTML = '';
                categoryData.images.forEach((url, index) => {
                    const item = document.createElement('div');
                    item.className = 'gallery-item';
                    item.onclick = function() { openLightbox(this, url, ''); };
                    item.innerHTML = `
                        <img loading="lazy" src="${url}" alt="${categoryId} Slot ${index + 1}" onerror="handleImageError(this, '')">
                        <div class="item-overlay"><i class="fas fa-search-plus"></i></div>
                    `;
                    grid.appendChild(item);
                });
            }
        }
    }

    // Run immediately
    fetchAndInjectContent();
}
