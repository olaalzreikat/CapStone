// Storage system configuration
const STORAGE_CONFIG = {
    useIndexedDB: true,      // Try IndexedDB as primary storage
    useLocalStorage: true,   // Try localStorage as fallback
    useSessionStorage: true, // Try sessionStorage as final fallback
    autoSaveInterval: 5 * 60 * 1000, // 5 minutes in milliseconds
    maxRetries: 3,           // Max retries for storage operations
    storageKeyPrefix: 'celestialGarden_',
    storageKeys: {
        saveData: 'saveData',
        consentStatus: 'consentStatus'
    }
};

// Storage state tracking
let storageSystem = {
    consentGiven: false,
    primaryMethod: null,  // Will be set to 'indexedDB', 'localStorage', 'sessionStorage', or null
    indexedDB: {
        available: false,
        db: null
    },
    localStorage: {
        available: false
    },
    sessionStorage: {
        available: false
    },
    autoSaveTimer: null
};

// Storage system initialization
async function initializeStorage() {
    console.log('Initializing storage system...');

    // Check each storage method availability
    if (STORAGE_CONFIG.useIndexedDB) {
        await checkIndexedDBAvailability();
    }

    if (STORAGE_CONFIG.useLocalStorage) {
        checkLocalStorageAvailability();
    }

    if (STORAGE_CONFIG.useSessionStorage) {
        checkSessionStorageAvailability();
    }

    // Determine best available storage method
    if (storageSystem.indexedDB.available) {
        storageSystem.primaryMethod = 'indexedDB';
        console.log('Using IndexedDB as primary storage method');
    } else if (storageSystem.localStorage.available) {
        storageSystem.primaryMethod = 'localStorage';
        console.log('Using localStorage as primary storage method');
    } else if (storageSystem.sessionStorage.available) {
        storageSystem.primaryMethod = 'sessionStorage';
        console.log('Using sessionStorage as primary storage method (data will be lost when tab is closed)');
    } else {
        storageSystem.primaryMethod = null;
        console.warn('No storage methods available! Game progress will not be saved.');
    }

    // Check for existing consent
    checkStorageConsent();

    return storageSystem.primaryMethod !== null;
}

// Check IndexedDB availability
async function checkIndexedDBAvailability() {
    if (!window.indexedDB) {
        console.log('IndexedDB not supported by this browser');
        storageSystem.indexedDB.available = false;
        return false;
    }

    try {
        // Try to open a test database
        const dbPromise = new Promise((resolve, reject) => {
            const request = indexedDB.open(`${STORAGE_CONFIG.storageKeyPrefix}test`, 1);

            request.onerror = (event) => {
                console.error('IndexedDB test failed:', event);
                reject(new Error('IndexedDB access denied'));
            };

            request.onupgradeneeded = (event) => {
                const db = event.target.result;
                // Create a test object store
                if (!db.objectStoreNames.contains('test')) {
                    db.createObjectStore('test', { keyPath: 'id' });
                }
            };

            request.onsuccess = (event) => {
                const db = event.target.result;
                // Test complete, close and delete test database
                db.close();

                // Try to delete the test database
                const deleteRequest = indexedDB.deleteDatabase(`${STORAGE_CONFIG.storageKeyPrefix}test`);
                deleteRequest.onsuccess = () => {
                    resolve(true);
                };
                deleteRequest.onerror = () => {
                    // Non-critical error, still mark as available
                    resolve(true);
                };
            };
        });

        await dbPromise;

        // If got here, IndexedDB is available
        storageSystem.indexedDB.available = true;

        // Initialize the actual game database
        await initializeGameDatabase();

        return true;
    } catch (error) {
        console.error('IndexedDB availability check failed:', error);
        storageSystem.indexedDB.available = false;
        return false;
    }
}

// Initialize the game database
async function initializeGameDatabase() {
    return new Promise((resolve, reject) => {
        const dbRequest = indexedDB.open(`${STORAGE_CONFIG.storageKeyPrefix}gameData`, 1);

        dbRequest.onerror = (event) => {
            console.error('Failed to open game database:', event);
            reject(new Error('Failed to open game database'));
        };

        dbRequest.onupgradeneeded = (event) => {
            const db = event.target.result;

            // Create object stores
            if (!db.objectStoreNames.contains('gameData')) {
                db.createObjectStore('gameData', { keyPath: 'id' });
            }
        };

        dbRequest.onsuccess = (event) => {
            storageSystem.indexedDB.db = event.target.result;
            console.log('Game database initialized successfully');
            resolve(true);
        };
    });
}

// Check localStorage availability
function checkLocalStorageAvailability() {
    try {
        const testKey = `${STORAGE_CONFIG.storageKeyPrefix}test`;
        localStorage.setItem(testKey, 'test');
        const result = localStorage.getItem(testKey);
        localStorage.removeItem(testKey);

        storageSystem.localStorage.available = (result === 'test');
        return storageSystem.localStorage.available;
    } catch (error) {
        console.warn('localStorage not available:', error);
        storageSystem.localStorage.available = false;
        return false;
    }
}

// Check sessionStorage availability
function checkSessionStorageAvailability() {
    try {
        const testKey = `${STORAGE_CONFIG.storageKeyPrefix}test`;
        sessionStorage.setItem(testKey, 'test');
        const result = sessionStorage.getItem(testKey);
        sessionStorage.removeItem(testKey);

        storageSystem.sessionStorage.available = (result === 'test');
        return storageSystem.sessionStorage.available;
    } catch (error) {
        console.warn('sessionStorage not available:', error);
        storageSystem.sessionStorage.available = false;
        return false;
    }
}

// Save game data using the best available method
async function saveGameData(manual = false) {
    if (!storageSystem.consentGiven || storageSystem.primaryMethod === null) {
        if (manual) {
            showToast('Unable to save: Storage consent not given or no storage available', 'error');
        }
        return false;
    }

    // Update session data in gameData
    gameData.session.totalPlayTime += Math.floor((Date.now() - gameData.session.startTime) / 1000);
    gameData.session.startTime = Date.now();
    gameData.lastSaveTime = Date.now();

    try {
        let success = false;

        // Use the appropriate storage method
        switch (storageSystem.primaryMethod) {
            case 'indexedDB':
                success = await saveToIndexedDB(gameData);
                break;
            case 'localStorage':
                success = saveToLocalStorage(gameData);
                break;
            case 'sessionStorage':
                success = saveToSessionStorage(gameData);
                break;
        }

        if (success) {
            if (manual) {
                showToast('Game saved successfully!', 'success');
                showGameNotification('Game Saved', 'Your cosmic garden has been safely stored!');
            }
            return true;
        } else {
            throw new Error('Save operation failed');
        }
    } catch (error) {
        console.error('Save error:', error);
        if (manual) {
            showToast(`Failed to save game: ${error.message}`, 'error');
        }
        return false;
    }
}

// Load game data using the best available method
async function loadGameData(manual = false) {
    if (!storageSystem.consentGiven || storageSystem.primaryMethod === null) {
        if (manual) {
            showToast('Unable to load: Storage consent not given or no storage available', 'error');
        }
        return false;
    }

    try {
        let loadedData = null;

        // Use the appropriate storage method
        switch (storageSystem.primaryMethod) {
            case 'indexedDB':
                loadedData = await loadFromIndexedDB();
                break;
            case 'localStorage':
                loadedData = loadFromLocalStorage();
                break;
            case 'sessionStorage':
                loadedData = loadFromSessionStorage();
                break;
        }

        if (loadedData) {
            // Merge saved data with default game data
            Object.assign(gameData, loadedData);

            // Reset session start time but preserve total playtime
            gameData.session.startTime = Date.now();

            // Set theme from saved data
            applyTheme();

            // Restore search inputs if they exist
            if (gameData.lastSearch) {
                plantSearch.value = gameData.lastSearch.term || '';
                plantFilter.value = gameData.lastSearch.filter || 'all';
            }

            // Update UI
            playerNameInput.value = gameData.player.name;
            notificationsEnabledCheckbox.checked = gameData.settings.notificationsEnabled;
            difficultySelect.value = gameData.settings.difficulty;

            // Update game display
            updateEnvironmentSliders();
            updateResourceDisplay();
            renderGame();

            if (manual) {
                showToast('Game loaded successfully!', 'success');
                showGameNotification('Game Loaded', 'Your cosmic garden has been restored!');
            }
            return true;
        } else {
            if (manual) {
                showToast('No saved game found', 'warning');
            }
            return false;
        }
    } catch (error) {
        console.error('Load error:', error);
        if (manual) {
            showToast(`Failed to load game: ${error.message}`, 'error');
        }
        return false;
    }
}

// Save data to IndexedDB
async function saveToIndexedDB(data) {
    return new Promise((resolve, reject) => {
        if (!storageSystem.indexedDB.db) {
            reject(new Error('IndexedDB not initialized'));
            return;
        }

        try {
            const transaction = storageSystem.indexedDB.db.transaction(['gameData'], 'readwrite');
            const store = transaction.objectStore('gameData');

            // Prepare data object with ID
            const saveData = {
                id: STORAGE_CONFIG.storageKeys.saveData,
                ...data
            };

            const request = store.put(saveData);

            request.onsuccess = () => {
                resolve(true);
            };

            request.onerror = (event) => {
                console.error('IndexedDB save error:', event);
                reject(new Error('Failed to save to IndexedDB'));
            };

            // Handle transaction errors
            transaction.onerror = (event) => {
                console.error('IndexedDB transaction error:', event);
                reject(new Error('IndexedDB transaction failed'));
            };
        } catch (error) {
            console.error('IndexedDB save exception:', error);
            reject(error);
        }
    });
}

// Load data from IndexedDB
async function loadFromIndexedDB() {
    return new Promise((resolve, reject) => {
        if (!storageSystem.indexedDB.db) {
            reject(new Error('IndexedDB not initialized'));
            return;
        }

        try {
            const transaction = storageSystem.indexedDB.db.transaction(['gameData'], 'readonly');
            const store = transaction.objectStore('gameData');
            const request = store.get(STORAGE_CONFIG.storageKeys.saveData);

            request.onsuccess = (event) => {
                const result = event.target.result;
                if (result) {
                    // Delete the ID property as it's not part of gameData structure
                    delete result.id;
                    resolve(result);
                } else {
                    resolve(null); // No saved data found
                }
            };

            request.onerror = (event) => {
                console.error('IndexedDB load error:', event);
                reject(new Error('Failed to load from IndexedDB'));
            };
        } catch (error) {
            console.error('IndexedDB load exception:', error);
            reject(error);
        }
    });
}

// Save data to localStorage
function saveToLocalStorage(data) {
    try {
        const saveString = JSON.stringify(data);
        localStorage.setItem(
            `${STORAGE_CONFIG.storageKeyPrefix}${STORAGE_CONFIG.storageKeys.saveData}`,
            saveString
        );
        return true;
    } catch (error) {
        console.error('localStorage save error:', error);
        return false;
    }
}

// Load data from localStorage
function loadFromLocalStorage() {
    try {
        const savedGame = localStorage.getItem(
            `${STORAGE_CONFIG.storageKeyPrefix}${STORAGE_CONFIG.storageKeys.saveData}`
        );

        if (savedGame) {
            return JSON.parse(savedGame);
        }
        return null;
    } catch (error) {
        console.error('localStorage load error:', error);
        return null;
    }
}

// Save data to sessionStorage
function saveToSessionStorage(data) {
    try {
        const saveString = JSON.stringify(data);
        sessionStorage.setItem(
            `${STORAGE_CONFIG.storageKeyPrefix}${STORAGE_CONFIG.storageKeys.saveData}`,
            saveString
        );
        return true;
    } catch (error) {
        console.error('sessionStorage save error:', error);
        return false;
    }
}

// Load data from sessionStorage
function loadFromSessionStorage() {
    try {
        const savedGame = sessionStorage.getItem(
            `${STORAGE_CONFIG.storageKeyPrefix}${STORAGE_CONFIG.storageKeys.saveData}`
        );

        if (savedGame) {
            return JSON.parse(savedGame);
        }
        return null;
    } catch (error) {
        console.error('sessionStorage load error:', error);
        return null;
    }
}

// Check storage consent
function checkStorageConsent() {
    let consentStatus = null;

    // Try to get consent from available storage methods
    if (storageSystem.localStorage.available) {
        consentStatus = localStorage.getItem(
            `${STORAGE_CONFIG.storageKeyPrefix}${STORAGE_CONFIG.storageKeys.consentStatus}`
        );
    } else if (storageSystem.sessionStorage.available) {
        consentStatus = sessionStorage.getItem(
            `${STORAGE_CONFIG.storageKeyPrefix}${STORAGE_CONFIG.storageKeys.consentStatus}`
        );
    }

    if (consentStatus === 'accepted') {
        enableStorage();
        return true;
    } else if (consentStatus === 'rejected') {
        disableStorage();
        return false;
    } else {
        // Show cookie consent prompt
        const cookieConsent = document.getElementById('cookie-consent');
        if (cookieConsent) {
            cookieConsent.style.display = 'block';
        }
        return false;
    }
}

// Enable storage
function enableStorage() {
    storageSystem.consentGiven = true;

    // Store consent in available storage methods
    if (storageSystem.localStorage.available) {
        localStorage.setItem(
            `${STORAGE_CONFIG.storageKeyPrefix}${STORAGE_CONFIG.storageKeys.consentStatus}`,
            'accepted'
        );
    }

    if (storageSystem.sessionStorage.available) {
        sessionStorage.setItem(
            `${STORAGE_CONFIG.storageKeyPrefix}${STORAGE_CONFIG.storageKeys.consentStatus}`,
            'accepted'
        );
    }

    // Update game settings
    gameData.settings.cookiesAccepted = true;

    // Hide cookie consent banner
    const cookieConsent = document.getElementById('cookie-consent');
    if (cookieConsent) {
        cookieConsent.style.display = 'none';
    }

    // Set up auto-save
    setupAutoSave();

    showToast('Game data will be saved automatically', 'success');
}

// Disable storage
function disableStorage() {
    storageSystem.consentGiven = false;

    // Store rejection in available storage methods
    if (storageSystem.localStorage.available) {
        localStorage.setItem(
            `${STORAGE_CONFIG.storageKeyPrefix}${STORAGE_CONFIG.storageKeys.consentStatus}`,
            'rejected'
        );
    }

    if (storageSystem.sessionStorage.available) {
        sessionStorage.setItem(
            `${STORAGE_CONFIG.storageKeyPrefix}${STORAGE_CONFIG.storageKeys.consentStatus}`,
            'rejected'
        );
    }

    // Update game settings
    gameData.settings.cookiesAccepted = false;

    // Hide cookie consent banner
    const cookieConsent = document.getElementById('cookie-consent');
    if (cookieConsent) {
        cookieConsent.style.display = 'none';
    }

    // Clear any auto-save timer
    if (storageSystem.autoSaveTimer) {
        clearInterval(storageSystem.autoSaveTimer);
        storageSystem.autoSaveTimer = null;
    }

    showToast('Game will continue without saving progress', 'warning');
}

// Set up auto-save
function setupAutoSave() {
    // Clear any existing timer
    if (storageSystem.autoSaveTimer) {
        clearInterval(storageSystem.autoSaveTimer);
    }

    // Set up new timer if consent given
    if (storageSystem.consentGiven && storageSystem.primaryMethod !== null) {
        storageSystem.autoSaveTimer = setInterval(() => {
            saveGameData(false);
        }, STORAGE_CONFIG.autoSaveInterval);
    }
}

// Set up storage event listeners
function initStorageEventListeners() {
    // Cookie consent buttons
    const acceptCookiesBtn = document.getElementById('accept-cookies');
    const rejectCookiesBtn = document.getElementById('reject-cookies');

    if (acceptCookiesBtn) {
        acceptCookiesBtn.addEventListener('click', () => {
            enableStorage();
            // Try to load existing game or start new one
            loadGameData(false).then(loaded => {
                if (!loaded) {
                    startNewGame();
                }
            });
        });
    }

    if (rejectCookiesBtn) {
        rejectCookiesBtn.addEventListener('click', () => {
            disableStorage();
            // Always start a new game if rejecting storage
            startNewGame();
        });
    }

    // Setup beforeunload handler to save game when leaving
    window.addEventListener('beforeunload', () => {
        if (storageSystem.consentGiven && storageSystem.primaryMethod !== null) {
            saveGameData(false);
        }
    });

    // Add manual save button event listener
    const manualSaveBtn = document.getElementById('manual-save-btn');
    if (manualSaveBtn) {
        manualSaveBtn.addEventListener('click', () => {
            saveGameData(true);
        });
    }

    // Add manual load button event listener
    const manualLoadBtn = document.getElementById('manual-load-btn');
    if (manualLoadBtn) {
        manualLoadBtn.addEventListener('click', () => {
            loadGameData(true);
        });
    }
}

// Handle storage errors
function handleStorageError(error, operation) {
    console.error(`Storage error during ${operation}:`, error);

    // Show error message to user
    showToast(`Storage error: ${error.message}`, 'error');

    // If this was the primary storage method, try to fall back to another method
    if (storageSystem.primaryMethod === 'indexedDB') {
        console.log('Falling back to localStorage');
        storageSystem.primaryMethod = storageSystem.localStorage.available ? 'localStorage' : null;
    } else if (storageSystem.primaryMethod === 'localStorage') {
        console.log('Falling back to sessionStorage');
        storageSystem.primaryMethod = storageSystem.sessionStorage.available ? 'sessionStorage' : null;
    }

    // If have no storage methods available, disable storage
    if (storageSystem.primaryMethod === null) {
        storageSystem.consentGiven = false;
        showToast('All storage methods failed. Your progress will not be saved.', 'error');
    }
}

// Reset storage system
function resetStorage() {
    // Clear all storage
    if (storageSystem.indexedDB.db) {
        try {
            const transaction = storageSystem.indexedDB.db.transaction(['gameData'], 'readwrite');
            const store = transaction.objectStore('gameData');
            store.clear();
        } catch (error) {
            console.error('Error clearing IndexedDB:', error);
        }
    }

    if (storageSystem.localStorage.available) {
        try {
            localStorage.removeItem(`${STORAGE_CONFIG.storageKeyPrefix}${STORAGE_CONFIG.storageKeys.saveData}`);
        } catch (error) {
            console.error('Error clearing localStorage:', error);
        }
    }

    if (storageSystem.sessionStorage.available) {
        try {
            sessionStorage.removeItem(`${STORAGE_CONFIG.storageKeyPrefix}${STORAGE_CONFIG.storageKeys.saveData}`);
        } catch (error) {
            console.error('Error clearing sessionStorage:', error);
        }
    }

    showToast('Game data has been reset', 'success');
}
// Game Data Structure
const gameData = {
// Player information
player: {
    name: "Cosmic Gardener",
    level: 1,
    experience: 0,
    experienceToNextLevel: 100
},

// Game settings
settings: {
    notificationsEnabled: false,
    theme: 'dark',
    cookiesAccepted: false,
    difficulty: 'normal', // new difficulty setting
    autoSaveEnabled: false // Changed to false for manual saving
},

// Session data
session: {
    startTime: Date.now(),
    totalPlayTime: 0, // tracked in seconds
    lastSaveTime: Date.now()
},

// Game resources with boosted starting values for easier gameplay
resources: {
    energy: 100,
    minerals: 100,
    seeds: 50,
    research: 40
},

// Resource production rates
resourceRates: {
    energy: 0,
    minerals: 0,
    seeds: 0,
    research: 0
},

// Garden environment settings
environment: {
    radiation: 50,
    gravity: 50,
    atmosphere: 50
},

// Garden plots (increased to 12 for more fun)
garden: Array(12).fill().map((_, i) => (
    { id: i, plantId: null, growthProgress: 0, plantedTime: null, harvested: 0 }
)),

// Discovered plants - start with first two 
discoveredPlants: ['cosmo_bloom', 'stellar_fern'],

// Completed research
completedResearch: [],

// Current selected plant for planting
selectedPlant: null,

// Current selected garden plot
selectedPlot: null,

// Recent searches
recentSearches: [],

// Last search data
lastSearch: {
    term: '',
    filter: 'all'
},

// Game version
version: "1.1.0" // Increment for the enhanced version
};

// Plant Database
const plantDatabase = [
{
    id: "cosmo_bloom",
    name: "Cosmo Bloom",
    description: "A hardy cosmic flower that thrives in various conditions. Perfect for beginning gardeners.",
    rarity: "common",
    growthTime: 30, // seconds for testing, faster growth for easier gameplay
    stages: ["seed", "sprout", "growth", "bloom"],
    optimalConditions: {
        radiation: 50,
        gravity: 50,
        atmosphere: 50
    },
    tolerance: 40, // increased tolerance for easier gameplay
    yield: {
        energy: 15, // increased yields
        minerals: 8,
        seeds: 5,
        research: 3
    },
    yieldMultiplier: 1.0, // base multiplier for resource yield
    unlockLevel: 1,
    seedCost: 5,
    colors: ["#8A2BE2", "#9370DB"],
    svg: `
            <svg viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg">
                <circle cx="50" cy="50" r="20" fill="#8A2BE2" />
                <circle cx="50" cy="50" r="10" fill="#9370DB" />
            </svg>
        `
},
{
    id: "stellar_fern",
    name: "Stellar Fern",
    description: "A delicate fern-like plant that absorbs cosmic radiation efficiently.",
    rarity: "common",
    growthTime: 45,
    stages: ["seed", "sprout", "growth", "mature"],
    optimalConditions: {
        radiation: 70,
        gravity: 30,
        atmosphere: 60
    },
    tolerance: 35, // increased tolerance
    yield: {
        energy: 20, // increased yields
        minerals: 5,
        seeds: 6,
        research: 4
    },
    yieldMultiplier: 1.0,
    unlockLevel: 1,
    seedCost: 8,
    colors: ["#3CB371", "#98FB98"],
    svg: `
            <svg viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg">
                <path d="M50,20 Q60,40 50,60 Q40,40 50,20" fill="#3CB371" />
                <path d="M40,30 Q50,50 40,70 Q30,50 40,30" fill="#3CB371" />
                <path d="M60,30 Q70,50 60,70 Q50,50 60,30" fill="#3CB371" />
            </svg>
        `
},
{
    id: "lunar_crystalite",
    name: "Lunar Crystalite",
    description: "A crystalline plant that thrives in low gravity. Rich in minerals.",
    rarity: "uncommon",
    growthTime: 60,
    stages: ["seed", "cluster", "formation", "crystal"],
    optimalConditions: {
        radiation: 40,
        gravity: 20,
        atmosphere: 30
    },
    tolerance: 30,
    yield: {
        energy: 10,
        minerals: 25,
        seeds: 4,
        research: 8
    },
    yieldMultiplier: 1.0,
    unlockLevel: 2,
    seedCost: 12,
    colors: ["#4682B4", "#ADD8E6"],
    svg: `
            <svg viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg">
                <polygon points="50,20 60,40 50,60 40,40" fill="#4682B4" />
                <polygon points="30,35 40,55 30,75 20,55" fill="#ADD8E6" />
                <polygon points="70,35 80,55 70,75 60,55" fill="#ADD8E6" />
            </svg>
        `
},
{
    id: "nebula_pod",
    name: "Nebula Pod",
    description: "A mysterious pod that produces an abundance of seeds. Requires special atmospheric conditions.",
    rarity: "uncommon",
    growthTime: 75,
    stages: ["seed", "bulb", "swelling", "pod"],
    optimalConditions: {
        radiation: 30,
        gravity: 60,
        atmosphere: 80
    },
    tolerance: 25,
    yield: {
        energy: 8,
        minerals: 10,
        seeds: 30,
        research: 6
    },
    yieldMultiplier: 1.0,
    unlockLevel: 3,
    seedCost: 15,
    colors: ["#FF6347", "#FFA07A"],
    svg: `
            <svg viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg">
                <ellipse cx="50" cy="50" rx="25" ry="20" fill="#FF6347" />
                <circle cx="40" cy="45" r="5" fill="#FFA07A" />
                <circle cx="50" cy="55" r="5" fill="#FFA07A" />
                <circle cx="60" cy="45" r="5" fill="#FFA07A" />
            </svg>
        `
},
{
    id: "void_orchid",
    name: "Void Orchid",
    description: "A rare orchid that thrives in extreme conditions. Produces significant research data.",
    rarity: "rare",
    growthTime: 90,
    stages: ["seed", "seedling", "bud", "bloom"],
    optimalConditions: {
        radiation: 85,
        gravity: 15,
        atmosphere: 40
    },
    tolerance: 20,
    yield: {
        energy: 15,
        minerals: 12,
        seeds: 8,
        research: 25
    },
    yieldMultiplier: 1.0,
    unlockLevel: 5,
    seedCost: 20, 
    colors: ["#800080", "#DDA0DD"],
    svg: `
            <svg viewBox="0 0 100 100" xmlns="http://www.w3.org/2000.svg">
                <path d="M50,20 C70,30 70,50 50,60 C30,50 30,30 50,20" fill="#800080" />
                <path d="M40,40 C50,50 60,50 70,40 C60,60 40,60 30,40 C40,30 50,30 40,40" fill="#DDA0DD" />
            </svg>
        `
},
{
    id: "plasma_willow",
    name: "Plasma Willow",
    description: "A highly energetic plant that harnesses cosmic radiation to produce abundant energy.",
    rarity: "rare",
    growthTime: 100,
    stages: ["seed", "sapling", "juvenile", "mature"],
    optimalConditions: {
        radiation: 90,
        gravity: 60,
        atmosphere: 30
    },
    tolerance: 25,
    yield: {
        energy: 35,
        minerals: 8,
        seeds: 6,
        research: 12
    },
    yieldMultiplier: 1.0,
    unlockLevel: 7,
    seedCost: 25,
    colors: ["#00BFFF", "#87CEFA"],
    svg: `
            <svg viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg">
                <line x1="50" y1="20" x2="50" y2="70" stroke="#8B4513" stroke-width="3" />
                <path d="M50,20 C70,30 80,20 90,25" stroke="#00BFFF" stroke-width="2" fill="none" />
                <path d="M50,30 C70,40 80,30 90,35" stroke="#00BFFF" stroke-width="2" fill="none" />
                <path d="M50,40 C70,50 80,40 90,45" stroke="#00BFFF" stroke-width="2" fill="none" />
                <path d="M50,20 C30,30 20,20 10,25" stroke="#87CEFA" stroke-width="2" fill="none" />
                <path d="M50,30 C30,40 20,30 10,35" stroke="#87CEFA" stroke-width="2" fill="none" />
                <path d="M50,40 C30,50 20,40 10,45" stroke="#87CEFA" stroke-width="2" fill="none" />
            </svg>
        `
}
];

// Research Database
const researchDatabase = [
{
    id: "basic_cultivation",
    name: "Basic Cultivation Techniques",
    description: "Fundamental understanding of cosmic plant care.",
    cost: 10,
    benefits: ["Unlocks Stellar Fern", "10% faster growth for all plants"],
    unlocked: true,
    completed: false,
    requiresResearch: []
},
{
    id: "mineral_extraction",
    name: "Mineral Extraction",
    description: "Methods to improve mineral yield from cosmic plants.",
    cost: 20, 
    benefits: ["Unlocks Lunar Crystalite", "20% increased mineral yield"],
    unlocked: false,
    completed: false,
    requiresResearch: ["basic_cultivation"]
},
{
    id: "atmospheric_control",
    name: "Atmospheric Control",
    description: "Advanced techniques for manipulating garden atmosphere.",
    cost: 30, 
    benefits: ["Unlocks Nebula Pod", "Atmosphere adjustments 20% more effective"],
    unlocked: false,
    completed: false,
    requiresResearch: ["basic_cultivation"]
},
{
    id: "radiation_harnessing",
    name: "Radiation Harnessing",
    description: "Methods to safely increase and utilize cosmic radiation.",
    cost: 45, 
    benefits: ["Unlocks Void Orchid", "30% increased energy yield"],
    unlocked: false,
    completed: false,
    requiresResearch: ["basic_cultivation", "atmospheric_control"]
},
{
    id: "gravitic_manipulation",
    name: "Gravitic Manipulation",
    description: "Advanced techniques for controlling garden gravity.",
    cost: 60, 
    benefits: ["Unlocks Plasma Willow", "Gravity adjustments 30% more effective"],
    unlocked: false,
    completed: false,
    requiresResearch: ["mineral_extraction", "radiation_harnessing"]
}
];

// Achievement Database
const achievementDatabase = [
{
    id: "first_plant",
    name: "Cosmic Gardener",
    description: "Plant your first cosmic flora.",
    unlocked: false
},
{
    id: "first_harvest",
    name: "First Harvest",
    description: "Successfully harvest your first plant.",
    unlocked: false
},
{
    id: "plant_collector",
    name: "Plant Collector",
    description: "Discover 3 different plant species.",
    unlocked: false
},
{
    id: "researcher",
    name: "Cosmic Researcher",
    description: "Complete your first research project.",
    unlocked: false
},
{
    id: "garden_master",
    name: "Garden Master",
    description: "Have all garden plots filled with plants at once.",
    unlocked: false
},
{
    id: "resource_baron",
    name: "Resource Baron",
    description: "Accumulate 500 of each resource type.",
    unlocked: false
},
{
    id: "plant_whisperer",
    name: "Plant Whisperer",
    description: "Achieve perfect growing conditions for any plant.",
    unlocked: false
}
];

// DOM Elements
const loadingOverlay = document.getElementById('loading-overlay');
const loadingProgressBar = document.getElementById('loading-progress-bar');
const introModalOverlay = document.getElementById('intro-modal-overlay');
const startGameBtn = document.getElementById('start-game-btn');
const navButtons = document.querySelectorAll('.nav-button');
const views = document.querySelectorAll('.view');
const playerNameDisplay = document.getElementById('player-name');
const playerLevelDisplay = document.getElementById('player-level');
const themeToggle = document.getElementById('theme-toggle');
const themeIcon = themeToggle.querySelector('.theme-icon');
const cookieConsent = document.getElementById('cookie-consent');
const acceptCookiesBtn = document.getElementById('accept-cookies');
const rejectCookiesBtn = document.getElementById('reject-cookies');
const sessionTimerElement = document.getElementById('session-timer');
const gardenGrid = document.getElementById('garden-grid');
const plantCollection = document.getElementById('plant-collection');
const researchGrid = document.getElementById('research-grid');
const plantSearch = document.getElementById('plant-search');
const plantFilter = document.getElementById('plant-filter');
const recentSearchesContainer = document.getElementById('recent-searches');
const environmentSliders = {
radiation: document.getElementById('radiation-slider'),
gravity: document.getElementById('gravity-slider'),
atmosphere: document.getElementById('atmosphere-slider')
};
const environmentValues = {
radiation: document.getElementById('radiation-value'),
gravity: document.getElementById('gravity-value'),
atmosphere: document.getElementById('atmosphere-value')
};
const resourceValues = {
energy: document.getElementById('energy-value'),
minerals: document.getElementById('minerals-value'),
seeds: document.getElementById('seeds-value'),
research: document.getElementById('research-value')
};
const resourceRates = {
energy: document.getElementById('energy-rate'),
minerals: document.getElementById('minerals-rate'),
seeds: document.getElementById('seeds-rate'),
research: document.getElementById('research-rate')
};
const plantDetailModal = document.getElementById('plant-detail-modal');
const plantDetailTitle = document.getElementById('plant-detail-title');
const plantDetailContent = document.getElementById('plant-detail-content');
const plantDetailCloseBtn = document.getElementById('plant-detail-close');
const plantDetailCloseBtn2 = document.getElementById('plant-detail-close-btn');
const plantDetailHarvestBtn = document.getElementById('plant-detail-harvest-btn');
const plantSelectionModal = document.getElementById('plant-selection-modal');
const plantSelectionGrid = document.getElementById('plant-selection-grid');
const plantSelectionClose = document.getElementById('plant-selection-close');
const plantSelectionCancel = document.getElementById('plant-selection-cancel');
const plantSelectionConfirm = document.getElementById('plant-selection-confirm');
const toastContainer = document.getElementById('toast-container');
const playerNameInput = document.getElementById('player-name-input');
const notificationsEnabledCheckbox = document.getElementById('notifications-enabled');
const difficultySelect = document.getElementById('difficulty-setting');
const manualSaveBtn = document.getElementById('manual-save-btn');
const manualLoadBtn = document.getElementById('manual-load-btn');
const resetGameBtn = document.getElementById('reset-game');

// Game state
let gameInterval;
let isGamePaused = false;
let cookiesEnabled = false;
let localStorageEnabled = false;
let sessionTimerId = null;

// Cookie and Local Storage management
function checkStorageConsent() {
const consentCookie = getCookie('celestialGardenConsent');
if (consentCookie === 'accepted') {
    enableStorage();
    return true;
} else if (consentCookie === 'rejected') {
    disableStorage();
    return false;
} else {
    // Show cookie consent prompt
    setTimeout(() => {
        cookieConsent.classList.add('active');
    }, 1000);
    return false;
}
}

// Enable cookies and local storage
function enableStorage() {
cookiesEnabled = true;
localStorageEnabled = true;
gameData.settings.cookiesAccepted = true;

// Hide cookie consent banner
cookieConsent.classList.remove('active');

// Set cookie for remembering consent
setCookie('celestialGardenConsent', 'accepted', 365);

showToast('Cookies and local storage enabled', 'success');
}

// Disable cookies and local storage
function disableStorage() {
cookiesEnabled = false;
localStorageEnabled = false;
gameData.settings.cookiesAccepted = false;

// Hide cookie consent banner
cookieConsent.classList.remove('active');

// Set cookie for remembering rejection 
setCookie('celestialGardenConsent', 'rejected', 365);

showToast('Game will continue without saving progress', 'warning');
}

// Set a cookie
function setCookie(name, value, days) {
const date = new Date();
date.setTime(date.getTime() + (days * 24 * 60 * 60 * 1000));
const expires = `expires=${date.toUTCString()}`;
document.cookie = `${name}=${value};${expires};path=/`;
}

// Get a cookie
function getCookie(name) {
const cookieName = `${name}=`;
const cookies = document.cookie.split(';');

for (let i = 0; i < cookies.length; i++) {
    let cookie = cookies[i].trim();
    if (cookie.indexOf(cookieName) === 0) {
        return cookie.substring(cookieName.length, cookie.length);
    }
}

return null;
}

// Delete a cookie
function deleteCookie(name) {
document.cookie = `${name}=;expires=Thu, 01 Jan 1970 00:00:00 UTC;path=/;`;
}

// Session timer functions
function startSessionTimer() {
if (sessionTimerId) {
    clearInterval(sessionTimerId);
}

sessionTimerId = setInterval(updateSessionTimer, 1000);
updateSessionTimer(); // Update immediately on start
}

function updateSessionTimer() {
const now = Date.now();
let totalSeconds = Math.floor((now - gameData.session.startTime) / 1000) + gameData.session.totalPlayTime;

const hours = Math.floor(totalSeconds / 3600);
totalSeconds %= 3600;
const minutes = Math.floor(totalSeconds / 60);
const seconds = totalSeconds % 60;

sessionTimerElement.textContent = `Time played: ${String(hours).padStart(2, '0')}:${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`;
}

// Theme toggle
function toggleTheme() {
const currentTheme = document.documentElement.getAttribute('data-theme');
const newTheme = currentTheme === 'dark' ? 'light' : 'dark';

// Update theme
document.documentElement.setAttribute('data-theme', newTheme);
document.body.classList.toggle('theme-light');
document.body.classList.toggle('theme-dark');
gameData.settings.theme = newTheme;

// Update theme toggle icon
themeIcon.textContent = newTheme === 'dark' ? '🌙' : '☀️';

// Save setting if cookies accepted
if (cookiesEnabled) {
    saveGameData();
}

showToast(`${newTheme.charAt(0).toUpperCase() + newTheme.slice(1)} theme activated`, 'success');
}

// Apply theme from settings
function applyTheme() {
const theme = gameData.settings.theme || 'dark';
document.documentElement.setAttribute('data-theme', theme);
themeIcon.textContent = theme === 'dark' ? '🌙' : '☀️';
}

// Show toast notification
function showToast(message, type = 'info') {
const toast = document.createElement('div');
toast.classList.add('toast', type);

let icon = '';
switch (type) {
    case 'success':
        icon = '✅';
        break;
    case 'warning':
        icon = '⚠️';
        break;
    case 'error':
        icon = '❌';
        break;
    default:
        icon = 'ℹ️';
}

toast.innerHTML = `
    <span class="toast-icon">${icon}</span>
    <span>${message}</span>
`;

toastContainer.appendChild(toast);

// Remove toast after 3 seconds
setTimeout(() => {
    toast.remove();
}, 3000);
}

// Show game notification
function showGameNotification(title, message, duration = 5000) {
// Check if notifications are enabled
if (!gameData.settings.notificationsEnabled) return;

// Create notification element
const notification = document.createElement('div');
notification.classList.add('game-notification');

notification.innerHTML = `
    <div class="notification-title">
        <span>${title}</span>
        <span class="notification-close">&times;</span>
    </div>
    <div class="notification-message">${message}</div>
`;

// Add to document
document.body.appendChild(notification);

// Close button functionality
const closeBtn = notification.querySelector('.notification-close');
closeBtn.addEventListener('click', () => {
    notification.remove();
});

// Auto-remove after duration
setTimeout(() => {
    if (notification.parentNode) {
        notification.remove();
    }
}, duration);
}

// Initialize the game

async function initGame() {
console.log('Starting Celestial Garden initialization...');

// Start loading animation
loadingOverlay.style.display = 'flex';
loadingOverlay.style.opacity = '1';

// Simulate loading progress
let progress = 0;
const loadingInterval = setInterval(() => {
    progress += 5;
    loadingProgressBar.style.width = `${progress}%`;

    // Add specific loading messages
    if (progress === 20) {
        updateLoadingMessage('Initializing storage system...');
    } else if (progress === 40) {
        updateLoadingMessage('Preparing garden environment...');
    } else if (progress === 60) {
        updateLoadingMessage('Germinating cosmic seeds...');
    } else if (progress === 80) {
        updateLoadingMessage('Calibrating stellar radiation...');
    }

    if (progress >= 100) {
        clearInterval(loadingInterval);

        // Complete initialization when loading animation is done
        setTimeout(() => {
            loadingOverlay.style.opacity = 0;
            setTimeout(() => {
                loadingOverlay.style.display = 'none';
                completeInitialization();
            }, 500);
        }, 500);
    }
}, 100);

// Initialize storage system while loading animation runs
try {
    await initializeStorage();
    initStorageEventListeners();
} catch (error) {
    console.error('Storage initialization error:', error);
}
}

// Update loading message (add this helper function)
function updateLoadingMessage(message) {
const loadingText = document.querySelector('.loading-text');
if (loadingText) {
    loadingText.textContent = message;
}
}

// Complete game initialization after loading animation
async function completeInitialization() {
console.log('Completing game initialization...');

// Apply theme
applyTheme();

// Start the session timer
startSessionTimer();

// Initialize event listeners
initEventListeners();

// Check if should load saved game or show intro
let gameLoaded = false;

if (storageSystem.consentGiven && storageSystem.primaryMethod !== null) {
    try {
        gameLoaded = await loadGameData(false);

        if (gameLoaded) {
            console.log('Loaded saved game');
            startGameLoop();
        } else {
            console.log('No saved game found, showing intro');
            showIntroScreen();
        }
    } catch (error) {
        console.error('Error loading game:', error);
        showIntroScreen();
    }
} else {
    console.log('Storage not consented or available, showing intro');
    showIntroScreen();
}
}

// Show intro screen
function showIntroScreen() {
// Show intro modal
introModalOverlay.classList.add('active');

// Set up start button
startGameBtn.addEventListener('click', () => {
    introModalOverlay.classList.remove('active');
    startNewGame();
});
}

// Start a new game
function startNewGame() {
console.log('Starting new game...');

// Discover the first two plants for easier start
addPlantToDiscovery('cosmo_bloom');
addPlantToDiscovery('stellar_fern');

// Mark first research as available
updateResearchAvailability();

// Save initial game state if storage is enabled
if (storageSystem.consentGiven && storageSystem.primaryMethod !== null) {
    saveGameData(false);
}

// Welcome notification
setTimeout(() => {
    showGameNotification('Welcome to Celestial Garden', 'Plant your first cosmic flora and start your journey as a cosmic gardener!');
}, 2000);

// Start the game loop
startGameLoop();
}

// Modify reset game function to use our new storage system
function resetGame() {
if (!confirm('Are you sure you want to reset your game? All progress will be lost!')) {
    return;
}

// Store theme and notification settings before reset
const theme = gameData.settings.theme;
const notificationsEnabled = gameData.settings.notificationsEnabled;
const playerName = gameData.player.name;

// Create a fresh game state
Object.assign(gameData, {
    player: {
        name: playerName, // Keep name
        level: 1,
        experience: 0,
        experienceToNextLevel: 10
    },
    settings: {
        notificationsEnabled: notificationsEnabled,
        theme: theme,
        cookiesAccepted: storageSystem.consentGiven,
        difficulty: 'normal',
        autoSaveEnabled: true
    },
    session: {
        startTime: Date.now(),
        totalPlayTime: 0,
        lastSaveTime: Date.now()
    },
    resources: {
        energy: 100,
        minerals: 100,
        seeds: 50,
        research: 40
    },
    resourceRates: {
        energy: 0,
        minerals: 0,
        seeds: 0,
        research: 0
    },
    environment: {
        radiation: 50,
        gravity: 50,
        atmosphere: 50
    },
    garden: Array(12).fill().map((_, i) => (
        { id: i, plantId: null, growthProgress: 0, plantedTime: null, harvested: 0 }
    )),
    discoveredPlants: ['cosmo_bloom', 'stellar_fern'],
    completedResearch: [],
    selectedPlant: null,
    selectedPlot: null,
    recentSearches: [],
    lastSearch: {
        term: '',
        filter: 'all'
    },
    version: "1.1.0"
});

// Reset search UI
plantSearch.value = '';
plantFilter.value = 'all';

// Update difficulty display
difficultySelect.value = 'normal';

// Update UI
updateEnvironmentSliders();
updateResourceDisplay();
renderGame();
renderRecentSearches();

// Reset storage
resetStorage();

// Save the reset state if storage is enabled
if (storageSystem.consentGiven && storageSystem.primaryMethod !== null) {
    saveGameData(true);
}

showToast('Game has been reset', 'success');
showGameNotification('Game Reset', 'Your cosmic garden has been reset. Time to start fresh!');
}

// Start a new game
function startNewGame() {
    console.log('Starting new game...');

    // Discover plants but don't change resource values
    addPlantToDiscovery('cosmo_bloom');
    addPlantToDiscovery('stellar_fern');

    // Mark first research as available
    updateResearchAvailability();

    // Save initial game state if storage is enabled
    if (storageSystem.consentGiven && storageSystem.primaryMethod !== null) {
        saveGameData(false);
    }

    // Welcome notification
    setTimeout(() => {
        showGameNotification('Welcome to Celestial Garden', 'Plant your first cosmic flora and start your journey as a cosmic gardener!');
    }, 2000);

    // Start the game loop
    startGameLoop();
}

function updateProgressBars() {
    const plotElements = document.querySelectorAll('.plot');

    for (let i = 0; i < gameData.garden.length; i++) {
        const plot = gameData.garden[i];

        // Make sure plotElements[i] exists and has a plant
        if (plotElements[i] && plot.plantId !== null) {
            const progressFill = plotElements[i].querySelector('.progress-fill');

            if (progressFill) {
                // Update the width of the progress bar
                progressFill.style.width = `${plot.growthProgress}%`;

                // Also update the growth stage text
                const plant = getPlantById(plot.plantId);
                if (plant) {
                    const stageIndex = Math.min(
                        Math.floor(plot.growthProgress / (100 / plant.stages.length)),
                        plant.stages.length - 1
                    );
                    const currentStage = plant.stages[stageIndex];
                    const stageElement = plotElements[i].querySelector('.plant-stage');

                    if (stageElement) {
                        stageElement.textContent = currentStage;
                    }
                }
            }
        }
    }
}

// Initialize event listeners
function initEventListeners() {
// Cookie consent buttons
// Add event listeners to the accept and reject buttons
acceptCookiesBtn.addEventListener('click', () => {
    enableStorage();

    // Remove the cookie consent banner
    cookieConsent.remove();
});
rejectCookiesBtn.addEventListener('click', () => {
        disableStorage();

    // Remove the cookie consent banner
    cookieConsent.remove();
});
// Theme toggle
themeToggle.addEventListener('click', toggleTheme);

// Start game button
startGameBtn.addEventListener('click', () => {
    introModalOverlay.classList.remove('active');
    startGameLoop();
});

// Navigation buttons
navButtons.forEach(button => {
    button.addEventListener('click', () => {
        const viewId = button.dataset.view;

        // Update active button
        navButtons.forEach(btn => btn.classList.remove('active'));
        button.classList.add('active');

        // Show selected view
        views.forEach(view => view.classList.remove('active'));
        document.getElementById(`${viewId}-view`).classList.add('active');
    });
});

// Environment sliders
for (const [env, slider] of Object.entries(environmentSliders)) {
    slider.addEventListener('input', () => {
        const value = slider.value;
        gameData.environment[env] = parseInt(value);
        environmentValues[env].textContent = `${value}%`;

        // Update plant growth rates based on new environment
        updateResourceRates();
    });
}

// Enhanced search with recent searches tracking
plantSearch.addEventListener('input', (e) => {
    renderPlantCollection();

    // Only add to recent searches when user stops typing
    clearTimeout(plantSearch.searchTimeout);
    plantSearch.searchTimeout = setTimeout(() => {
        if (e.target.value.trim().length >= 2) {
            addToRecentSearches(e.target.value.trim());
        }
    }, 1000);
});

plantFilter.addEventListener('change', renderPlantCollection);

// Plant detail modal close buttons
plantDetailCloseBtn.addEventListener('click', () => {
    plantDetailModal.classList.remove('active');
});

plantDetailCloseBtn2.addEventListener('click', () => {
    plantDetailModal.classList.remove('active');
});

// Plant detail harvest button
plantDetailHarvestBtn.addEventListener('click', () => {
    harvestPlant(gameData.selectedPlot);
    plantDetailModal.classList.remove('active');
});



// Plant selection modal close buttons
plantSelectionClose.addEventListener('click', () => {
    plantSelectionModal.classList.remove('active');
    gameData.selectedPlot = null;
});

plantSelectionCancel.addEventListener('click', () => {
    plantSelectionModal.classList.remove('active');
    gameData.selectedPlot = null;
});

// Plant selection confirm button
plantSelectionConfirm.addEventListener('click', () => {
    if (gameData.selectedPlant && gameData.selectedPlot !== null) {
        plantSeed(gameData.selectedPlot, gameData.selectedPlant);
        plantSelectionModal.classList.remove('active');
    } else {
        showToast('Please select a plant first', 'warning');
    }
});

// Settings form
playerNameInput.value = gameData.player.name;
notificationsEnabledCheckbox.checked = gameData.settings.notificationsEnabled;
difficultySelect.value = gameData.settings.difficulty;

// Notifications toggle
notificationsEnabledCheckbox.addEventListener('change', (e) => {
    gameData.settings.notificationsEnabled = e.target.checked;

    if (e.target.checked) {
        showGameNotification('Notifications Enabled', 'You will now receive game notifications about important events!');
    }
});

// Difficulty setting
difficultySelect.addEventListener('change', (e) => {
    gameData.settings.difficulty = e.target.value;
    showToast(`Difficulty set to ${e.target.value}`, 'success');
});

// Manual save, load, reset buttons
manualSaveBtn.addEventListener('click', () => {
    saveGameData(true);
});

manualLoadBtn.addEventListener('click', () => {
    loadGameData(true);
});

resetGameBtn.addEventListener('click', resetGame);
}


// Start the game loop
function startGameLoop() {
// Update initial UI
updateResourceDisplay();
updateEnvironmentSliders();
renderGarden();
renderPlantCollection();
renderResearch();
renderAchievements();
renderRecentSearches();

gameData.lastUpdateTime = Date.now();


// Start the game interval
gameInterval = setInterval(() => {
    if (!isGamePaused) {
        updateGame();
    }
}, 1000); // Update every second
}

function updateResources(deltaTime) {
// Add resources based on production rates
for (const resource in gameData.resources) {
gameData.resources[resource] += gameData.resourceRates[resource] * deltaTime;
}
}
// Main game update function
function updateGame() {
const currentTime = Date.now();
const deltaTime = (currentTime - gameData.lastUpdateTime) / 1000; // Convert to seconds
gameData.lastUpdateTime = currentTime;

// Update garden growth
updateGardenGrowth(deltaTime);

// Update resources
updateResources(deltaTime);

// Update display
updateResourceDisplay();
renderGarden();

updateProgressBars();

// Check for achievements
checkAchievements();
}

// Apply difficulty settings to gameplay
function applyDifficultySettings() {
const difficulty = gameData.settings.difficulty;

// Growth rate multipliers based on difficulty
let growthMultiplier = 1.0;
let yieldMultiplier = 1.0;
let costMultiplier = 1.0;

switch (difficulty) {
    case 'easy':
        growthMultiplier = 2.0;  // Plants grow twice as fast
        yieldMultiplier = 1.5;   // 50% more resources
        costMultiplier = 0.5;    // Half the seed cost
        break;
    case 'normal':
        growthMultiplier = 1.0;  // Normal growth
        yieldMultiplier = 1.0;   // Normal yields
        costMultiplier = 1.0;    // Normal costs
        break;
    case 'hard':
        growthMultiplier = 0.7;  // 30% slower growth
        yieldMultiplier = 0.8;   // 20% less resources
        costMultiplier = 1.2;    // 20% more expensive
        break;
}

// Return multipliers to be used in relevant functions
return { growthMultiplier, yieldMultiplier, costMultiplier };
}

// Update garden growth
function updateGardenGrowth(deltaTime) {
    const { growthMultiplier } = applyDifficultySettings();

    for (let i = 0; i < gameData.garden.length; i++) {
        const plot = gameData.garden[i];

        if (plot.plantId) {
            const plant = getPlantById(plot.plantId);
            if (!plant) continue;

            // Calculate growth rate based on environment and difficulty
            const environmentMultiplier = calculateEnvironmentMultiplier(plant);
            const growthRate = (deltaTime / plant.growthTime) * 100 * environmentMultiplier * growthMultiplier;

            // Update growth progress
            plot.growthProgress = Math.min(100, plot.growthProgress + growthRate);

        }
    }
}



// Update resources
for (const resource in resourceValues) {
    const value = gameData.resources[resource];
    const rate = gameData.resourceRates[resource];

    resourceValues[resource].textContent =
        isNaN(value) ? '0' : value.toFixed(0);

    resourceRates[resource].textContent =
        isNaN(rate) ? '+0.0/s' : `+${rate.toFixed(1)}/s`;
}

// Update resource rates
function updateResourceRates() {
// Reset production rates
for (const resource in gameData.resourceRates) {
    gameData.resourceRates[resource] = 0;
}

// Calculate production from mature plants
for (let i = 0; i < gameData.garden.length; i++) {
    const plot = gameData.garden[i];

    if (plot.plantId && plot.growthProgress >= 100) {
        const plant = getPlantById(plot.plantId);
        if (!plant) continue;

        // Calculate production multiplier based on environment
        const environmentMultiplier = calculateEnvironmentMultiplier(plant);

        // Update resource rates
        for (const [resource, amount] of Object.entries(plant.yield)) {
            const productionRate = (amount * environmentMultiplier * plant.yieldMultiplier) / 60; // Per second
            gameData.resourceRates[resource] += productionRate;
        }
    }
}
}

// Calculate environment multiplier for a plant
function calculateEnvironmentMultiplier(plant) {
// Calculate how close the environment is to optimal for the plant
let radiationDiff = Math.abs(gameData.environment.radiation - plant.optimalConditions.radiation);
let gravityDiff = Math.abs(gameData.environment.gravity - plant.optimalConditions.gravity);
let atmosphereDiff = Math.abs(gameData.environment.atmosphere - plant.optimalConditions.atmosphere);

// Convert differences to percentages (0-100)
radiationDiff = (radiationDiff / 100) * 100;
gravityDiff = (gravityDiff / 100) * 100;
atmosphereDiff = (atmosphereDiff / 100) * 100;

// Average difference as percentage
const avgDiff = (radiationDiff + gravityDiff + atmosphereDiff) / 3;

// Calculate multiplier (1.0 if perfect, down to 0.2 if completely wrong)
let multiplier;
if (avgDiff <= plant.tolerance) {
    // Within tolerance - full efficiency to slight reduction
    multiplier = 1.0 - (avgDiff / plant.tolerance) * 0.2;
} else {
    // Outside tolerance - reduced efficiency
    multiplier = 0.8 * (1 - Math.min(1, (avgDiff - plant.tolerance) / (100 - plant.tolerance)));
}

// Check for perfect conditions achievement
if (radiationDiff < 5 && gravityDiff < 5 && atmosphereDiff < 5) {
    checkAchievement('plant_whisperer');
}

return Math.max(0.2, multiplier);
}



// Plant a seed in a garden plot
function plantSeed(plotIndex, plantId) {
const plant = getPlantById(plantId);
if (!plant) return false;

// Apply difficulty settings to seed cost
const { costMultiplier } = applyDifficultySettings();
const adjustedCost = Math.max(1, Math.floor(plant.seedCost * costMultiplier));

// Check if have enough seeds
if (gameData.resources.seeds < adjustedCost) {
    showToast(`Not enough seeds. Need ${adjustedCost}`, 'error');
    return false;
}

// Check if the plot is empty
if (gameData.garden[plotIndex].plantId !== null) {
    showToast('This plot already has a plant', 'error');
    return false;
}

// Plant the seed
gameData.garden[plotIndex].plantId = plantId;
gameData.garden[plotIndex].growthProgress = 0;
gameData.garden[plotIndex].plantedTime = Date.now();
gameData.garden[plotIndex].harvested = 0;

// Deduct seeds
gameData.resources.seeds -= adjustedCost;

// Update display
updateResourceDisplay();
renderGarden();

// Add to discovered plants if not already there
addPlantToDiscovery(plantId);

// Show planting notification
showGameNotification('New Plant', `You've planted a ${plant.name}. Adjust the environment to help it grow!`);

// Check achievement for first plant
checkAchievement('first_plant');

showToast(`Planted ${plant.name} (Cost: ${adjustedCost} seeds)`, 'success');
return true;
}

// Harvest a plant
function harvestPlant(plotIndex) {
const plot = gameData.garden[plotIndex];

if (!plot.plantId || plot.growthProgress < 100) {
    showToast('Plant is not ready for harvest', 'warning');
    return false;
}

const plant = getPlantById(plot.plantId);
if (!plant) return false;

// Apply difficulty settings
const { yieldMultiplier } = applyDifficultySettings();

// Calculate yield based on environment and difficulty
const environmentMultiplier = calculateEnvironmentMultiplier(plant);
const totalMultiplier = plant.yieldMultiplier * environmentMultiplier * yieldMultiplier;

// Add resources
let harvestMessage = `Harvested ${plant.name}:<br>`;
let totalYield = 0;

for (const [resource, amount] of Object.entries(plant.yield)) {
    const yieldAmount = Math.floor(amount * totalMultiplier);
    gameData.resources[resource] += yieldAmount;
    harvestMessage += `+${yieldAmount} ${resource}<br>`;
    totalYield += yieldAmount;
}

// Bonus seeds with 30% chance for easier progression
if (Math.random() < 0.3) {
    const bonusSeeds = Math.floor(Math.random() * 10) + 5;
    gameData.resources.seeds += bonusSeeds;
    harvestMessage += `<strong>BONUS: +${bonusSeeds} seeds!</strong>`;
}

// Clear plot
plot.plantId = null;
plot.growthProgress = 0;
plot.plantedTime = null;
plot.harvested++;

// Update display
updateResourceDisplay();
renderGarden();

// Check achievement for first harvest
checkAchievement('first_harvest');

// Auto-discover more plants based on harvest count for easier progression
checkAutoDiscovery(plot.harvested);

// Check for resource baron achievement
checkResourceAchievements();

// Show notification for good harvests
if (totalYield > 30) {
    showGameNotification('Bountiful Harvest!', `Your ${plant.name} yielded an exceptional harvest of resources!`);
}

// Show toast
showToast(harvestMessage, 'success');
return true;
}

// Auto-discover plants based on harvest count to make game easier
function checkAutoDiscovery(harvestCount) {
// Unlock uncommon plants after 5 harvests
if (harvestCount === 5) {
    if (!gameData.discoveredPlants.includes('lunar_crystalite')) {
        addPlantToDiscovery('lunar_crystalite');
        showGameNotification('New Plant Discovered!', 'You\'ve discovered Lunar Crystalite! Check your collection to learn more.');
    }
}

// Unlock more plants after 10 harvests
if (harvestCount === 10) {
    if (!gameData.discoveredPlants.includes('nebula_pod')) {
        addPlantToDiscovery('nebula_pod');
        showGameNotification('New Plant Discovered!', 'You\'ve discovered Nebula Pod! Check your collection to learn more.');
    }
}

// Unlock rare plants after 15 harvests
if (harvestCount === 15) {
    if (!gameData.discoveredPlants.includes('void_orchid')) {
        addPlantToDiscovery('void_orchid');
        showGameNotification('Rare Plant Discovered!', 'You\'ve discovered the rare Void Orchid! Check your collection to learn more.');
    }
}

// Unlock final plant after 20 harvests
if (harvestCount === 20) {
    if (!gameData.discoveredPlants.includes('plasma_willow')) {
        addPlantToDiscovery('plasma_willow');
        showGameNotification('Rare Plant Discovered!', 'You\'ve discovered the powerful Plasma Willow! Check your collection to learn more.');
    }
}
}

// Check resource related achievements
function checkResourceAchievements() {
// Check for resource baron achievement
if (gameData.resources.energy >= 500 &&
    gameData.resources.minerals >= 500 &&
    gameData.resources.seeds >= 500 &&
    gameData.resources.research >= 500) {

    checkAchievement('resource_baron');
}
}

// Complete a research project
function completeResearch(researchId) {
const research = getResearchById(researchId);
if (!research) return false;

// Check if already completed
if (research.completed) {
    showToast('Research already completed', 'warning');
    return false;
}

// Check if unlocked
if (!research.unlocked) {
    showToast('Research not available yet', 'error');
    return false;
}

// Check if enough research points
if (gameData.resources.research < research.cost) {
    showToast(`Not enough research points. Need ${research.cost}`, 'error');
    return false;
}

// Complete research
gameData.resources.research -= research.cost;
gameData.completedResearch.push(researchId);
research.completed = true;

// Apply research benefits
applyResearchBenefits(research);

// Update research availability
updateResearchAvailability();

// Update display
updateResourceDisplay();
renderResearch();

// Check achievement
checkAchievement('researcher');

// Show notification
showGameNotification('Research Complete', `You've completed research on ${research.name}! New benefits unlocked.`);

showToast(`Completed research: ${research.name}`, 'success');
return true;
}

// Apply research benefits
function applyResearchBenefits(research) {
// This would implement the specific benefits from each research
// For now, just log the benefits for demonstration
console.log(`Applied research benefits: ${research.benefits.join(', ')}`);

// Unlock plants based on research
if (research.id === 'basic_cultivation') {
    // Already have stellar fern from start for easier gameplay
    // But still show the benefit message
    showToast('Unlocked: Stellar Fern + 10% faster growth', 'success');
}
else if (research.id === 'mineral_extraction') {
    addPlantToDiscovery('lunar_crystalite');
    showToast('Unlocked: Lunar Crystalite + 20% mineral yield', 'success');
}
else if (research.id === 'atmospheric_control') {
    addPlantToDiscovery('nebula_pod');
    showToast('Unlocked: Nebula Pod + improved atmosphere control', 'success');
}
else if (research.id === 'radiation_harnessing') {
    addPlantToDiscovery('void_orchid');
    showToast('Unlocked: Void Orchid + 30% energy yield', 'success');
}
else if (research.id === 'gravitic_manipulation') {
    addPlantToDiscovery('plasma_willow');
    showToast('Unlocked: Plasma Willow + gravity control', 'success');
}
}

// Update research availability based on completed research
function updateResearchAvailability() {
for (const research of researchDatabase) {
    if (!research.completed) {
        // Check if all required research is completed
        const requirementsMet = research.requiresResearch.every(reqId => {
            return gameData.completedResearch.includes(reqId);
        });

        research.unlocked = requirementsMet;
    }
}

// Render research grid to reflect changes
renderResearch();
}

// Check achievements
function checkAchievements() {
// Check garden master achievement
let allPlotsFilled = true;
for (const plot of gameData.garden) {
    if (plot.plantId === null) {
        allPlotsFilled = false;
        break;
    }
}

if (allPlotsFilled) {
    checkAchievement('garden_master');
}
}

// Check and unlock a specific achievement
function checkAchievement(achievementId) {
const achievement = getAchievementById(achievementId);
if (!achievement || achievement.unlocked) return;

achievement.unlocked = true;
showToast(`Achievement unlocked: ${achievement.name}`, 'success');
showGameNotification('Achievement Unlocked!', `${achievement.name}: ${achievement.description}`);
renderAchievements();
}

// Add a plant to the discovered plants list
function addPlantToDiscovery(plantId) {
if (!gameData.discoveredPlants.includes(plantId)) {
    gameData.discoveredPlants.push(plantId);
    renderPlantCollection();

    // Check achievement for plant collection
    if (gameData.discoveredPlants.length >= 3) {
        checkAchievement('plant_collector');
    }
}
}

// Add a search term to recent searches
function addToRecentSearches(term) {
if (!term || term.length < 2) return;

// Remove if already exists
gameData.recentSearches = gameData.recentSearches.filter(s => s !== term);

// Add to beginning
gameData.recentSearches.unshift(term);

// Keep only 5 most recent
if (gameData.recentSearches.length > 5) {
    gameData.recentSearches.pop();
}

// Update UI
renderRecentSearches();
}

// Render recent searches UI
function renderRecentSearches() {
recentSearchesContainer.innerHTML = '';

if (gameData.recentSearches.length === 0) return;

// Add label
const label = document.createElement('span');
label.textContent = 'Recent: ';
label.style.fontSize = '0.8rem';
label.style.color = 'var(--text-medium)';
recentSearchesContainer.appendChild(label);

// Add search tags
gameData.recentSearches.forEach(term => {
    const tag = document.createElement('div');
    tag.classList.add('recent-search-tag');
    tag.textContent = term;

    tag.addEventListener('click', () => {
        plantSearch.value = term;
        renderPlantCollection();
    });

    recentSearchesContainer.appendChild(tag);
});
}

// Enhanced search and filter functionality for plant collection
function searchAndFilterPlants() {
const searchTerm = plantSearch.value.toLowerCase();
const filterType = plantFilter.value;

// Save the search state for persistence
gameData.lastSearch.term = searchTerm;
gameData.lastSearch.filter = filterType;

let filteredPlants = plantDatabase.filter(plant => {
    // Only show discovered plants
    if (!gameData.discoveredPlants.includes(plant.id)) {
        return false;
    }

    // Apply search filter across multiple fields
    if (searchTerm &&
        !plant.name.toLowerCase().includes(searchTerm) &&
        !plant.description.toLowerCase().includes(searchTerm) &&
        !plant.rarity.toLowerCase().includes(searchTerm)) {
        return false;
    }

    // Apply category filter
    if (filterType !== 'all') {
        switch (filterType) {
            case 'rare':
            case 'common':
            case 'uncommon':
                return plant.rarity === filterType;
            case 'energy':
                return plant.yield.energy >= 15;
            case 'minerals':
                return plant.yield.minerals >= 15;
            case 'seeds':
                return plant.yield.seeds >= 10;
            case 'research':
                return plant.yield.research >= 10;
            case 'discovered':
                return true; // Already filtered for discovered plants
            default:
                return true;
        }
    }

    return true;
});

return filteredPlants;
}

// Manual save game data
function saveGameData(manual = false) {
if (!localStorageEnabled) {
    if (manual) {
        showToast('Local storage is disabled. Enable cookies to save your game.', 'warning');
    }
    return false;
}

// Update session data
gameData.session.totalPlayTime += Math.floor((Date.now() - gameData.session.startTime) / 1000);
gameData.session.startTime = Date.now();
gameData.lastSaveTime = Date.now();

try {
    localStorage.setItem('celestialGardenSave', JSON.stringify(gameData));

    if (manual) {
        showToast('Game saved successfully!', 'success');
        showGameNotification('Game Saved', 'Your cosmic garden has been safely stored in local storage.');
    }
    return true;
} catch (error) {
    if (manual) {
        showToast('Failed to save game', 'error');
    }
    console.error('Save error:', error);
    return false;
}
}

// Manual load game data
function loadGameData(manual = false) {
if (!localStorageEnabled) {
    if (manual) {
        showToast('Local storage is disabled. Enable cookies to load your game.', 'warning');
    }
    return false;
}

try {
    const savedGame = localStorage.getItem('celestialGardenSave');

    if (savedGame) {
        const parsedData = JSON.parse(savedGame);

        // Store current session time before overwriting
        const currentSessionTime = Math.floor((Date.now() - gameData.session.startTime) / 1000);

        // Merge saved data with default game data
        Object.assign(gameData, parsedData);

        // Reset session start time but preserve total playtime
        gameData.session.startTime = Date.now();

        // Set theme from saved data
        applyTheme();

        // Restore search inputs if they exist
        if (gameData.lastSearch) {
            plantSearch.value = gameData.lastSearch.term || '';
            plantFilter.value = gameData.lastSearch.filter || 'all';
        }

        // Update UI
        playerNameInput.value = gameData.player.name;
        notificationsEnabledCheckbox.checked = gameData.settings.notificationsEnabled;
        difficultySelect.value = gameData.settings.difficulty;

        // Update game display
        updateEnvironmentSliders();
        updateResourceDisplay();
        renderGame();

        if (manual) {
            showToast('Game loaded successfully!', 'success');
            showGameNotification('Game Loaded', 'Your cosmic garden has been restored from local storage.');
        }
        return true;
    } else {
        if (manual) {
            showToast('No saved game found', 'warning');
        }
        return false;
    }
} catch (error) {
    if (manual) {
        showToast('Failed to load game', 'error');
    }
    console.error('Load error:', error);
    return false;
}
}

// Reset game
function resetGame() {
if (!confirm('Are you sure you want to reset your game? All progress will be lost!')) {
    return;
}

// Store theme and notification settings before reset
const theme = gameData.settings.theme;
const notificationsEnabled = gameData.settings.notificationsEnabled;
const playerName = gameData.player.name;

// Create a fresh game state
Object.assign(gameData, {
    player: {
        name: playerName, // Keep name
        level: 1,
        experience: 0,
        experienceToNextLevel: 10
    },
    settings: {
        notificationsEnabled: notificationsEnabled,
        theme: theme,
        cookiesAccepted: gameData.settings.cookiesAccepted,
        difficulty: 'normal',
        autoSaveEnabled: false
    },
    session: {
        startTime: Date.now(),
        totalPlayTime: 0,
        lastSaveTime: Date.now()
    },
    resources: {
        energy: 100,
        minerals: 100,
        seeds: 50,
        research: 40
    },
    resourceRates: {
        energy: 0,
        minerals: 0,
        seeds: 0,
        research: 0
    },
    environment: {
        radiation: 50,
        gravity: 50,
        atmosphere: 50
    },
    garden: Array(12).fill().map((_, i) => (
        { id: i, plantId: null, growthProgress: 0, plantedTime: null, harvested: 0 }
    )),
    discoveredPlants: ['cosmo_bloom', 'stellar_fern'],
    completedResearch: [],
    selectedPlant: null,
    selectedPlot: null,
    recentSearches: [],
    lastSearch: {
        term: '',
        filter: 'all'
    },
    version: "1.1.0"
});

// Reset search UI
plantSearch.value = '';
plantFilter.value = 'all';

// Update difficulty display
difficultySelect.value = 'normal';

// Update UI
updateEnvironmentSliders();
updateResourceDisplay();
renderGame();
renderRecentSearches();

// Save the reset state if storage is enabled
if (localStorageEnabled && gameData.settings.cookiesAccepted) {
    saveGameData(true);
}

showToast('Game has been reset', 'success');
showGameNotification('Game Reset', 'Your cosmic garden has been reset. Time to start fresh!');
}

// Render the entire game state
function renderGame() {
playerNameDisplay.textContent = gameData.player.name;
playerLevelDisplay.textContent = `Level ${gameData.player.level}`;

updateResourceDisplay();
renderGarden();
renderPlantCollection();
renderResearch();
renderAchievements();
}

// Update resource display
function updateResourceDisplay() {
for (const [resource, value] of Object.entries(gameData.resources)) {
    resourceValues[resource].textContent = Math.floor(value);
    resourceRates[resource].textContent = `+${gameData.resourceRates[resource].toFixed(1)}/s`;
}
}

// Update environment sliders
function updateEnvironmentSliders() {
for (const [env, value] of Object.entries(gameData.environment)) {
    environmentSliders[env].value = value;
    environmentValues[env].textContent = `${value}%`;
}
}

// Render garden
function renderGarden() {
    gardenGrid.innerHTML = '';

    for (let i = 0; i < gameData.garden.length; i++) {
        const plot = gameData.garden[i];
        const plotElement = document.createElement('div');
        plotElement.classList.add('plot');
        plotElement.dataset.id = i;

        if (plot.plantId === null) {
            // Empty plot
            plotElement.classList.add('empty');
            plotElement.innerHTML = `
    <div class="plot-content">
        <div>Click to plant</div>
    </div>
`;

            plotElement.addEventListener('click', () => {
                gameData.selectedPlot = i;
                openPlantSelectionModal();
            });
        } else {
            // Plot with plant
            const plant = getPlantById(plot.plantId);
            if (!plant) continue;

            // Calculate current growth stage
            const stageIndex = Math.min(
                Math.floor(plot.growthProgress / (100 / plant.stages.length)),
                plant.stages.length - 1
            );
            const currentStage = plant.stages[stageIndex];

            // Calculate environment compatibility for visual cue
            const environmentMultiplier = calculateEnvironmentMultiplier(plant);
            let compatibilityClass = '';

            if (environmentMultiplier >= 0.9) {
                compatibilityClass = 'excellent';
            } else if (environmentMultiplier >= 0.7) {
                compatibilityClass = 'good';
            } else if (environmentMultiplier >= 0.4) {
                compatibilityClass = 'fair';
            } else {
                compatibilityClass = 'poor';
            }

            plotElement.innerHTML = `
    <div class="plot-content">
        <div class="plant-image ${compatibilityClass}">
            ${plant.svg}
        </div>
        <div class="plant-info">
            <div class="plant-name">${plant.name}</div>
            <div class="plant-stage">${currentStage}</div>
            <div class="progress-bar">
                <div class="progress-fill" style="width: ${plot.growthProgress}%"></div>
            </div>
        </div>
    </div>
    <div class="plot-background"></div>
`;

            // Set click handler to show plant detail
            plotElement.addEventListener('click', () => {
                gameData.selectedPlot = i;
                openPlantDetailModal(plot.plantId, i);
            });
        }

        gardenGrid.appendChild(plotElement);
    }
}


// Render plant collection
function renderPlantCollection() {
plantCollection.innerHTML = '';

// Get filtered plants
const filteredPlants = searchAndFilterPlants();

if (filteredPlants.length === 0) {
    plantCollection.innerHTML = '<div class="no-results">No plants found matching your criteria</div>';
    return;
}

// Sort plants (by rarity then name)
const rarityRank = { 'rare': 0, 'uncommon': 1, 'common': 2 };
filteredPlants.sort((a, b) => {
    // First sort by rarity
    if (rarityRank[a.rarity] !== rarityRank[b.rarity]) {
        return rarityRank[a.rarity] - rarityRank[b.rarity];
    }
    // Then by name
    return a.name.localeCompare(b.name);
});

// Create plant collection cards with highlighting for search terms
for (const plant of filteredPlants) {
    const card = document.createElement('div');
    card.classList.add('collection-card');

    // Highlight search term in name and description if present
    let highlightedName = plant.name;
    let highlightedDescription = plant.description;

    if (gameData.lastSearch.term) {
        const searchTerm = gameData.lastSearch.term;
        const regex = new RegExp(`(${searchTerm})`, 'gi');
        highlightedName = plant.name.replace(regex, '<mark>$1</mark>');
        highlightedDescription = plant.description.replace(regex, '<mark>$1</mark>');
    }

    card.innerHTML = `
        <div class="collection-card-image">
            ${plant.svg}
        </div>
        <div class="collection-card-content">
            <div class="collection-card-title">
                <span>${highlightedName}</span>
                <span class="collection-card-rarity">${plant.rarity}</span>
            </div>
            <div>${highlightedDescription.substring(0, 80)}${highlightedDescription.length > 80 ? '...' : ''}</div>
            <div class="collection-card-stats">
                <div class="collection-card-stat">
                    <span class="collection-card-stat-label">Energy:</span>
                    <span>${plant.yield.energy}</span>
                </div>
                <div class="collection-card-stat">
                    <span class="collection-card-stat-label">Minerals:</span>
                    <span>${plant.yield.minerals}</span>
                </div>
                <div class="collection-card-stat">
                    <span class="collection-card-stat-label">Seeds:</span>
                    <span>${plant.yield.seeds}</span>
                </div>
                <div class="collection-card-stat">
                    <span class="collection-card-stat-label">Research:</span>
                    <span>${plant.yield.research}</span>
                </div>
            </div>
        </div>
    `;

    card.addEventListener('click', () => {
        openPlantDetailModal(plant.id);
    });

    plantCollection.appendChild(card);
}
}



// Render research
function renderResearch() {
researchGrid.innerHTML = '';

// Filter to show only unlocked research
const availableResearch = researchDatabase.filter(research =>
    research.unlocked && !research.completed
);

if (availableResearch.length === 0) {
    researchGrid.innerHTML = '<div class="no-results">No research available at this time</div>';

    // If there's completed research, show it
    if (gameData.completedResearch.length > 0) {
        const completedSection = document.createElement('div');
        completedSection.innerHTML = '<h3>Completed Research</h3>';
        researchGrid.appendChild(completedSection);

        const completedGrid = document.createElement('div');
        completedGrid.className = 'research-grid';

        gameData.completedResearch.forEach(id => {
            const research = getResearchById(id);
            if (!research) return;

            const card = document.createElement('div');
            card.classList.add('research-card');
            card.style.opacity = '0.7';

            card.innerHTML = `
                <div class="research-card-header">
                    <span class="research-card-title">${research.name}</span>
                    <span class="research-card-cost">Completed</span>
                </div>
                <div class="research-card-description">${research.description}</div>
                <div class="research-card-benefits">
                    ${research.benefits.map(benefit =>
                `<div class="research-benefit">${benefit}</div>`
            ).join('')}
                </div>
            `;

            completedGrid.appendChild(card);
        });

        researchGrid.appendChild(completedGrid);
    }

    return;
}

// Create research cards
for (const research of availableResearch) {
    const card = document.createElement('div');
    card.classList.add('research-card');

    const canAfford = gameData.resources.research >= research.cost;

    card.innerHTML = `
        <div class="research-card-header">
            <span class="research-card-title">${research.name}</span>
            <span class="research-card-cost">${research.cost} 🔬</span>
        </div>
        <div class="research-card-description">${research.description}</div>
        <div class="research-card-benefits">
            ${research.benefits.map(benefit =>
        `<div class="research-benefit">${benefit}</div>`
    ).join('')}
        </div>
        <button class="research-card-button" ${canAfford ? '' : 'disabled'}>
            ${canAfford ? 'Research' : 'Not enough points'}
        </button>
    `;

    const researchButton = card.querySelector('.research-card-button');
    researchButton.addEventListener('click', () => {
        if (canAfford) {
            completeResearch(research.id);
        } else {
            showToast(`Need ${research.cost} research points`, 'warning');
        }
    });

    researchGrid.appendChild(card);
}

// Add completed research section if there are any
if (gameData.completedResearch.length > 0) {
    const completedSection = document.createElement('div');
    completedSection.innerHTML = '<h3>Completed Research</h3>';
    researchGrid.appendChild(completedSection);

    const completedGrid = document.createElement('div');
    completedGrid.className = 'research-grid';

    gameData.completedResearch.forEach(id => {
        const research = getResearchById(id);
        if (!research) return;

        const card = document.createElement('div');
        card.classList.add('research-card');
        card.style.opacity = '0.7';

        card.innerHTML = `
            <div class="research-card-header">
                <span class="research-card-title">${research.name}</span>
                <span class="research-card-cost">Completed</span>
            </div>
            <div class="research-card-description">${research.description}</div>
            <div class="research-card-benefits">
                ${research.benefits.map(benefit =>
            `<div class="research-benefit">${benefit}</div>`
        ).join('')}
            </div>
        `;

        completedGrid.appendChild(card);
    });

    researchGrid.appendChild(completedGrid);
}
}

// Render achievements
function renderAchievements() {
const achievementsGrid = document.getElementById('achievements-grid');
if (!achievementsGrid) return;

achievementsGrid.innerHTML = '';

for (const achievement of achievementDatabase) {
    const card = document.createElement('div');
    card.classList.add('achievement-card');

    if (achievement.unlocked) {
        card.classList.add('unlocked');
        card.innerHTML = `
            <div class="achievement-icon">🏆</div>
            <div class="achievement-content">
                <div class="achievement-title">${achievement.name}</div>
                <div class="achievement-description">${achievement.description}</div>
            </div>
        `;
    } else {
        card.innerHTML = `
            <div class="achievement-icon">🔒</div>
            <div class="achievement-content">
                <div class="achievement-title">???</div>
                <div class="achievement-description">${achievement.description}</div>
            </div>
        `;
    }

    achievementsGrid.appendChild(card);
}
}

// Open plant detail modal
function openPlantDetailModal(plantId, plotIndex = null) {
const plant = getPlantById(plantId);
if (!plant) return;

const plot = plotIndex !== null ? gameData.garden[plotIndex] : null;

plantDetailTitle.textContent = plant.name;

// Create modal content
let detailContent = `
    <div class="plant-detail-header">
        <div class="plant-detail-image">
            ${plant.svg}
        </div>
        <div class="plant-detail-info">
            <div class="plant-detail-name">${plant.name}</div>
            <div class="plant-detail-type">${plant.rarity.charAt(0).toUpperCase() + plant.rarity.slice(1)} Plant</div>
            <div class="plant-detail-stats">
                <div class="plant-detail-stat">
                    <span class="plant-detail-stat-label">Growth Time:</span>
                    <span>${Math.floor(plant.growthTime / 60)} min ${plant.growthTime % 60} sec</span>
                </div>
                <div class="plant-detail-stat">
                    <span class="plant-detail-stat-label">Seed Cost:</span>
                    <span>${plant.seedCost}</span>
                </div>
                <div class="plant-detail-stat">
                    <span class="plant-detail-stat-label">Optimal Radiation:</span>
                    <span>${plant.optimalConditions.radiation}%</span>
                </div>
                <div class="plant-detail-stat">
                    <span class="plant-detail-stat-label">Optimal Gravity:</span>
                    <span>${plant.optimalConditions.gravity}%</span>
                </div>
                <div class="plant-detail-stat">
                    <span class="plant-detail-stat-label">Optimal Atmosphere:</span>
                    <span>${plant.optimalConditions.atmosphere}%</span>
                </div>
                <div class="plant-detail-stat">
                    <span class="plant-detail-stat-label">Tolerance:</span>
                    <span>±${plant.tolerance}%</span>
                </div>
            </div>
        </div>
    </div>
    <div class="plant-detail-description">
        ${plant.description}
    </div>
    <div class="plant-detail-yields">
        <div class="plant-detail-yields-title">Resource Yields:</div>
        <div class="plant-detail-yields-list">
            <div class="plant-yield">
                <div class="resource-icon energy">⚡</div>
                <span>${plant.yield.energy} Energy</span>
            </div>
            <div class="plant-yield">
                <div class="resource-icon minerals">🔷</div>
                <span>${plant.yield.minerals} Minerals</span>
            </div>
            <div class="plant-yield">
                <div class="resource-icon seeds">🌱</div>
                <span>${plant.yield.seeds} Seeds</span>
            </div>
            <div class="plant-yield">
                <div class="resource-icon research">🔬</div>
                <span>${plant.yield.research} Research</span>
            </div>
        </div>
    </div>
    <div class="plant-detail-stages">
        <div class="plant-detail-stages-title">Growth Stages:</div>
        <div class="stage-timeline">
            ${plant.stages.map((stage, index) => {
    const isActive = plot && plot.growthProgress >= (index * (100 / plant.stages.length));
    return `<div class="stage-point ${isActive ? 'active' : ''}"></div>`;
}).join('<div class="stage-connector"></div>')}
        </div>
        <div class="stage-labels">
            ${plant.stages.map(stage =>
    `<div class="stage-label">${stage}</div>`
).join('')}
        </div>
    </div>
`;

plantDetailContent.innerHTML = detailContent;

// Show/hide harvest button based on plant readiness
if (plot && plot.plantId === plantId) {
    plantDetailHarvestBtn.style.display = plot.growthProgress >= 99.9 ? 'block' : 'none';
} else {
    plantDetailHarvestBtn.style.display = 'none';
}

// Show modal
plantDetailModal.classList.add('active');
}

// Open plant selection modal
function openPlantSelectionModal() {
plantSelectionGrid.innerHTML = '';

// Filter plants that the player can plant
const availablePlants = plantDatabase.filter(plant =>
    gameData.discoveredPlants.includes(plant.id) && gameData.resources.seeds >= plant.seedCost
);

if (availablePlants.length === 0) {
    plantSelectionGrid.innerHTML = '<div class="no-results">No plants available to plant. Collect more seeds!</div>';
    gameData.selectedPlant = null;
    plantSelectionConfirm.disabled = true;
} else {
    // Create plant selection items
    for (const plant of availablePlants) {
        const selectionItem = document.createElement('div');
        selectionItem.classList.add('plant-selection-item');
        selectionItem.dataset.id = plant.id;

        selectionItem.innerHTML = `
            <div class="plant-selection-image">
                ${plant.svg}
            </div>
            <div class="plant-selection-name">${plant.name}</div>
            <div class="plant-selection-cost">
                <div class="resource-icon seeds">🌱</div>
                <span>${plant.seedCost}</span>
            </div>
        `;

        selectionItem.addEventListener('click', () => {
            // Update selected plant
            gameData.selectedPlant = plant.id;

            // Update UI
            document.querySelectorAll('.plant-selection-item').forEach(item => {
                item.classList.remove('selected');
            });
            selectionItem.classList.add('selected');

            // Enable confirm button
            plantSelectionConfirm.disabled = false;
        });

        plantSelectionGrid.appendChild(selectionItem);
    }
}

// Show modal
plantSelectionModal.classList.add('active');
}

// Calculate offline progress
function calculateOfflineProgress(offlineTime) {
const offlineSeconds = offlineTime / 1000;
};
// Calculate resource generation from plants
let offlineResources = {
energy: 0,
minerals: 0,
seeds: 0,
research: 0
};

// Process garden growth
// Calculate offline progress
function calculateOfflineProgress(offlineTime) {
const offlineSeconds = offlineTime / 1000;

// Calculate resource generation from plants
let offlineResources = {
    energy: 0,
    minerals: 0,
    seeds: 0,
    research: 0
};

// Process garden growth and resource generation
for (let plot of gameData.garden) {
    if (plot.plantId) {
        const plant = getPlantById(plot.plantId);
        if (!plant) continue;

        // Calculate growth progress
        const totalGrowthNeeded = plant.growthTime;
        let newGrowthProgress = plot.growthProgress + (offlineSeconds / totalGrowthNeeded) * 100;

        // If plant was ready for harvest
        if (newGrowthProgress >= 100) {
            newGrowthProgress = 100;

            // Calculate resources generated (at reduced rate for offline)
            const offlineMultiplier = 0.5; // 50% efficiency when offline
            const environmentMultiplier = calculateEnvironmentMultiplier(plant);
            const totalMultiplier = plant.yieldMultiplier * environmentMultiplier * offlineMultiplier;

            for (const [resource, amount] of Object.entries(plant.yield)) {
                offlineResources[resource] += amount * totalMultiplier;
            }
        }

        // Update plot growth progress
        plot.growthProgress = newGrowthProgress;
    }
}

// Add offline resources
for (const [resource, amount] of Object.entries(offlineResources)) {
    gameData.resources[resource] += Math.floor(amount);
}

// Show offline progress toast
let offlineMessage = 'While you were away: ';
let resourcesGenerated = false;

for (const [resource, amount] of Object.entries(offlineResources)) {
    if (amount > 0) {
        offlineMessage += `+${Math.floor(amount)} ${resource}, `;
        resourcesGenerated = true;
    }
}

if (resourcesGenerated) {
    offlineMessage = offlineMessage.slice(0, -2); // Remove trailing comma and space
    showToast(offlineMessage, 'success');
    showGameNotification('Offline Progress', 'Your plants continued to grow while you were away!');
}
}

// Helper function to get plant by ID
function getPlantById(plantId) {
return plantDatabase.find(plant => plant.id === plantId);
}

// Helper function to get research by ID
function getResearchById(researchId) {
return researchDatabase.find(research => research.id === researchId);
}

// Helper function to get achievement by ID
function getAchievementById(achievementId) {
return achievementDatabase.find(achievement => achievement.id === achievementId);
}

// Initialize the game when page loads
window.addEventListener('load', initGame);

