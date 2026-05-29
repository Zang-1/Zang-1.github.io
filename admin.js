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

// Auth State Observer
auth.onAuthStateChanged((user) => {
    if (user) {
        userEmailText.textContent = user.email;
        loginContainer.style.display = 'none';
        dashboardContainer.style.display = 'block';
        fetchData();
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

// Fetch Data from Firestore
async function fetchData() {
    loader.classList.add('active');
    try {
        const docRef = db.collection('portfolio').doc('content');
        const docSnap = await docRef.get();

        if (docSnap.exists) {
            const data = docSnap.data();
            populateForm(data);
        } else {
            console.log("No data found, using defaults. Save to initialize DB.");
        }
    } catch (error) {
        console.error("Error fetching data:", error);
    } finally {
        loader.classList.remove('active');
    }
}

// Populate the form with data
function populateForm(data) {
    if (data.music && Array.isArray(data.music)) {
        document.getElementById('music-links').value = data.music.join('\n');
    }
    
    if (data.gallery) {
        const cats = ['billiards', 'motorcycles', 'life'];
        cats.forEach(cat => {
            if (data.gallery[cat]) {
                document.getElementById(`${cat}-cover`).value = data.gallery[cat].cover || '';
                if (data.gallery[cat].images) {
                    document.getElementById(`${cat}-images`).value = data.gallery[cat].images.join('\n');
                }
            }
        });
    }
}

// Helper to upload a single file
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
    saveStatus.textContent = 'Please wait, uploading images...';
    saveStatus.style.color = 'var(--text-color)';

    const musicLines = document.getElementById('music-links').value.split('\n').map(s => s.trim()).filter(s => s);
    
    const parseGallery = async (cat) => {
        let coverUrl = document.getElementById(`${cat}-cover`).value.trim();
        const coverFile = document.getElementById(`${cat}-cover-file`).files[0];
        if (coverFile) {
            coverUrl = await uploadFile(coverFile, cat);
            document.getElementById(`${cat}-cover`).value = coverUrl; // Update UI
        }

        let images = document.getElementById(`${cat}-images`).value.split('\n').map(s => s.trim()).filter(s => s);
        const imageFiles = document.getElementById(`${cat}-images-file`).files;
        if (imageFiles.length > 0) {
            for (let i = 0; i < imageFiles.length; i++) {
                const url = await uploadFile(imageFiles[i], cat);
                images.push(url);
            }
            document.getElementById(`${cat}-images`).value = images.join('\n'); // Update UI
        }

        return {
            cover: coverUrl,
            images: images
        };
    };

    try {
        const newData = {
            music: musicLines,
            gallery: {
                billiards: await parseGallery('billiards'),
                motorcycles: await parseGallery('motorcycles'),
                life: await parseGallery('life')
            }
        };

        await db.collection('portfolio').doc('content').set(newData);
        
        // Clear file inputs
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
