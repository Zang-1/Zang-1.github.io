// Firebase Config provided by User
const firebaseConfig = {
  apiKey: "AIzaSyBp8Ka6AFVupP_fUS7Y-fZNMq8AVTG3-qc",
  authDomain: "zang-portfolio.firebaseapp.com",
  projectId: "zang-portfolio",
  storageBucket: "zang-portfolio.firebasestorage.app",
  messagingSenderId: "498517273686",
  appId: "1:498517273686:web:edbedcf156e77505bb5ff7",
  measurementId: "G-XZ1SV2NKM8"
};

const app = firebase.initializeApp(firebaseConfig);
const auth = firebase.auth();
const db = firebase.firestore();
const storage = firebase.storage();

// DOM Elements
const loader = document.getElementById('loader');
const loginContainer = document.getElementById('login-container');
const dashboardContainer = document.getElementById('dashboard-container');
const loginForm = document.getElementById('login-form');
const loginError = document.getElementById('login-error');
const userEmailText = document.getElementById('user-email');
const logoutBtn = document.getElementById('logout-btn');
const dataForm = document.getElementById('data-form');
const saveStatus = document.getElementById('save-status');

// Cropper DOM Elements
const cropperModal = document.getElementById('cropper-modal');
const cropperImage = document.getElementById('cropper-image');
const cropCancelBtn = document.getElementById('crop-cancel-btn');
const cropSaveBtn = document.getElementById('crop-save-btn');

let cropper = null;
let currentCropTarget = null;
let croppedBlobs = {};
let isRealtimeListenerSet = false;

// Auth State Observer
auth.onAuthStateChanged((user) => {
    if (user) {
        userEmailText.textContent = user.email;
        loginContainer.style.display = 'none';
        dashboardContainer.style.display = 'block';
        setupRealtimeListener();
    } else {
        loginContainer.style.display = 'flex';
        dashboardContainer.style.display = 'none';
        loader.classList.remove('active');
    }
});

// Login
loginForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    loginError.textContent = '';
    const email = document.getElementById('email').value;
    const password = document.getElementById('password').value;
    
    loader.classList.add('active');
    try {
        await auth.signInWithEmailAndPassword(email, password);
    } catch (error) {
        loader.classList.remove('active');
        loginError.textContent = 'Đăng nhập thất bại. Vui lòng kiểm tra lại Email và Mật khẩu.';
        console.error(error);
    }
});

// Logout
logoutBtn.addEventListener('click', () => {
    auth.signOut();
});

// Realtime Listener from Firestore
function setupRealtimeListener() {
    if (isRealtimeListenerSet) return;
    isRealtimeListenerSet = true;
    
    loader.classList.add('active');
    const docRef = db.collection('portfolio').doc('content');
    
    docRef.onSnapshot((docSnap) => {
        loader.classList.remove('active');
        if (docSnap.exists) {
            const data = docSnap.data();
            populateForm(data);
        } else {
            console.log("No data found, using defaults. Save to initialize DB.");
        }
    }, (error) => {
        console.error("Error fetching realtime data:", error);
        loader.classList.remove('active');
    });
}

// Safely set value without overwriting what user is currently typing
function safeSetValue(elementId, value) {
    const el = document.getElementById(elementId);
    if (el && document.activeElement !== el) {
        // Only overwrite if it is not currently focused by the user
        // and if it's not currently marked as "[Cropped Image Ready to Save]"
        if (el.value !== '[Cropped Image Ready to Save]') {
            el.value = value || '';
        }
    }
}

// Populate the form with data
function populateForm(data) {
    if (data.avatar) {
        safeSetValue('avatar-url', data.avatar);
    }

    if (data.music && Array.isArray(data.music)) {
        safeSetValue('music-links', data.music.join('\n'));
    }
    
    if (data.gallery) {
        const cats = ['billiards', 'motorcycles', 'life'];
        cats.forEach(cat => {
            if (data.gallery[cat]) {
                safeSetValue(`${cat}-cover`, data.gallery[cat].cover);
                if (data.gallery[cat].images) {
                    safeSetValue(`${cat}-images`, data.gallery[cat].images.join('\n'));
                }
            }
        });
    }
}

// Auto-newline for textareas
const textareas = document.querySelectorAll('textarea');
textareas.forEach(ta => {
    ta.addEventListener('paste', (e) => {
        e.preventDefault();
        const text = (e.clipboardData || window.clipboardData).getData('text').trim();
        const start = ta.selectionStart;
        const end = ta.selectionEnd;
        const before = ta.value.substring(0, start);
        const after = ta.value.substring(end);
        
        // Thêm newline sau link vừa dán
        const insertText = text + '\n';
        ta.value = before + insertText + after;
        
        // Di chuyển con trỏ xuống dòng mới
        ta.selectionStart = ta.selectionEnd = start + insertText.length;
    });
});

// Cropper Initialization
function initCropperForInput(fileInputId, urlInputId, type) {
    const fileInput = document.getElementById(fileInputId);
    if (!fileInput) return;
    
    fileInput.addEventListener('change', (e) => {
        if (e.target.files && e.target.files.length > 0) {
            const file = e.target.files[0];
            const reader = new FileReader();
            reader.onload = (event) => {
                cropperImage.src = event.target.result;
                cropperModal.classList.add('active');
                
                currentCropTarget = { id: urlInputId, type: type, fileId: fileInputId };
                
                // 1:1 for Avatar, Free for Cover (NaN)
                let aspectRatio = type === 'avatar' ? 1 / 1 : NaN; 
                
                cropper = new Cropper(cropperImage, {
                    aspectRatio: aspectRatio,
                    viewMode: 1,
                    dragMode: 'move', // Move image instead of drawing new crop boxes
                    background: true,
                    autoCropArea: 0.9,
                    responsive: true,
                    guides: true,
                    highlight: false,
                    cropBoxMovable: true,
                    cropBoxResizable: true,
                    toggleDragModeOnDblclick: false
                });
                
                // Prevent body scrolling on mobile while cropping
                document.body.style.overflow = 'hidden';
            };
            reader.readAsDataURL(file);
        }
    });
}

initCropperForInput('avatar-file', 'avatar-url', 'avatar');
initCropperForInput('billiards-cover-file', 'billiards-cover', 'cover');
initCropperForInput('motorcycles-cover-file', 'motorcycles-cover', 'cover');
initCropperForInput('life-cover-file', 'life-cover', 'cover');

cropCancelBtn.addEventListener('click', () => {
    cropperModal.classList.remove('active');
    document.body.style.overflow = ''; // Restore scrolling
    if (cropper) { cropper.destroy(); cropper = null; }
    if (currentCropTarget) {
        document.getElementById(currentCropTarget.fileId).value = ''; // Reset file input
    }
});

cropSaveBtn.addEventListener('click', () => {
    if (!cropper) return;
    
    // Tối ưu kích thước: Avatar nhỏ hơn ảnh Cover
    const isAvatar = currentCropTarget.type === 'avatar';
    const canvas = cropper.getCroppedCanvas({
        maxWidth: isAvatar ? 512 : 1280,
        maxHeight: isAvatar ? 512 : 1280,
        imageSmoothingEnabled: true,
        imageSmoothingQuality: 'high',
    });
    
    // Nén ảnh xuống chất lượng 0.8 để nhẹ hơn, upload nhanh hơn
    canvas.toBlob((blob) => {
        croppedBlobs[currentCropTarget.id] = blob;
        document.getElementById(currentCropTarget.id).value = `[Cropped Image Ready to Save]`;
        
        cropperModal.classList.remove('active');
        document.body.style.overflow = ''; // Restore scrolling
        cropper.destroy(); 
        cropper = null;
    }, 'image/jpeg', 0.8);
});

// Helper to upload a Blob (from Cropper)
async function uploadBlob(blob, folder) {
    const fileName = `${Date.now()}_cropped.jpg`;
    const storageRef = storage.ref(`portfolio/${folder}/${fileName}`);
    await storageRef.put(blob);
    return await storageRef.getDownloadURL();
}

// Helper to upload a single raw file (Inside images)
async function uploadFile(file, folder) {
    const fileName = `${Date.now()}_${file.name}`;
    const storageRef = storage.ref(`portfolio/${folder}/${fileName}`);
    await storageRef.put(file);
    return await storageRef.getDownloadURL();
}

// Save Data to Firestore
dataForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    const saveBtn = document.getElementById('save-btn');
    const originalText = saveBtn.innerHTML;
    saveBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Uploading & Saving...';
    saveBtn.disabled = true;
    saveStatus.textContent = 'Please wait, processing and uploading images...';
    saveStatus.style.color = 'var(--text-color)';

    try {
        // Upload Avatar if cropped
        let avatarUrl = document.getElementById('avatar-url').value.trim();
        if (croppedBlobs['avatar-url']) {
            avatarUrl = await uploadBlob(croppedBlobs['avatar-url'], 'avatar');
            delete croppedBlobs['avatar-url'];
            document.getElementById('avatar-url').value = avatarUrl;
        } else if (avatarUrl === '[Cropped Image Ready to Save]') {
            avatarUrl = ''; // Fallback if something went wrong
        }

        const musicLines = document.getElementById('music-links').value.split('\n').map(s => s.trim()).filter(s => s);
        
        const parseGallery = async (cat) => {
            const coverInputId = `${cat}-cover`;
            let coverUrl = document.getElementById(coverInputId).value.trim();
            
            // Upload Cover if cropped
            if (croppedBlobs[coverInputId]) {
                coverUrl = await uploadBlob(croppedBlobs[coverInputId], cat);
                delete croppedBlobs[coverInputId];
                document.getElementById(coverInputId).value = coverUrl; 
            } else if (coverUrl === '[Cropped Image Ready to Save]') {
                coverUrl = '';
            }

            // Upload multiple inside images (raw files)
            let images = document.getElementById(`${cat}-images`).value.split('\n').map(s => s.trim()).filter(s => s);
            const imageFiles = document.getElementById(`${cat}-images-file`).files;
            if (imageFiles.length > 0) {
                for (let i = 0; i < imageFiles.length; i++) {
                    const url = await uploadFile(imageFiles[i], cat);
                    images.push(url);
                }
                document.getElementById(`${cat}-images`).value = images.join('\n');
            }

            return {
                cover: coverUrl,
                images: images
            };
        };

        const newData = {
            avatar: avatarUrl,
            music: musicLines,
            gallery: {
                billiards: await parseGallery('billiards'),
                motorcycles: await parseGallery('motorcycles'),
                life: await parseGallery('life')
            }
        };

        await db.collection('portfolio').doc('content').set(newData);
        
        // Clear file inputs
        document.getElementById('avatar-file').value = '';
        ['billiards', 'motorcycles', 'life'].forEach(cat => {
            document.getElementById(`${cat}-cover-file`).value = '';
            document.getElementById(`${cat}-images-file`).value = '';
        });

        saveStatus.textContent = 'Changes saved successfully!';
        saveStatus.style.color = 'var(--success-color)';
        setTimeout(() => saveStatus.textContent = '', 3000);
    } catch (error) {
        console.error("Error saving data:", error);
        saveStatus.textContent = 'Error saving changes. Check console.';
        saveStatus.style.color = 'var(--error-color)';
    } finally {
        saveBtn.innerHTML = originalText;
        saveBtn.disabled = false;
    }
});
