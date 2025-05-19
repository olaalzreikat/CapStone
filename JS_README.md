# Celestial Garden - JavaScript Code Review

## Table of Contents
1. [Variable Naming & Indentation](#variable-naming--indentation)
2. [Function Naming & Modularity](#function-naming--modularity)
3. [Arrays & Objects Usage](#arrays--objects-usage)
4. [Array Methods](#array-methods)
5. [Looping/Iteration](#loopingiteration)
6. [JSON Handling](#json-handling)
7. [Web Storage](#web-storage)
8. [Saving/Retrieving User Data](#savingretrieving-user-data)
9. [Cookie Handling](#cookie-handling)
10. [DOM Manipulation](#dom-manipulation)
11. [CSS Manipulation](#css-manipulation)
12. [Theme Preference](#theme-preference)
13. [Code Comments & Readability](#code-comments--readability)
14. [Error Handling & Debugging](#error-handling--debugging)
15. [Regex for Validation](#regex-for-validation)
16. [Timer & Date Object](#timer--date-object)
17. [Math, String, Random methods](#math-string-random-methods)
18. [Event Listeners](#event-listeners)
19. [Search History](#search-history)
20. [Full CRUD Functionality](#full-crud-functionality)

## Variable Naming & Indentation
My code uses easy-to-understand variable names and keeps everything neatly spaced out.

**Example:**
```javascript
const loadingOverlay = document.getElementById('loading-overlay');
const loadingProgressBar = document.getElementById('loading-progress-bar');
const introModalOverlay = document.getElementById('intro-modal-overlay');
```

**Explanation:** These names clearly tell us what each variable is for. `loadingOverlay` is the screen that shows when the game is loading. The spaces and indents make the code easy to read.

## Function Naming & Modularity
Each function has a clear name that explains what it does, and it only does that one job.

**Example:**
```javascript
function updateEnvironmentSliders() {
    for (const [env, value] of Object.entries(gameData.environment)) {
        environmentSliders[env].value = value;
        environmentValues[env].textContent = `${value}%`;
    }
}
```

**Explanation:** This function only updates the environment sliders on the screen. It doesn't try to do anything else. 

## Arrays & Objects Usage
The code organizes related information together in arrays (lists) and objects (containers).

**Example:**
```javascript
// Garden plots as an array of objects
garden: Array(12).fill().map((_, i) => (
    { id: i, plantId: null, growthProgress: 0, plantedTime: null, harvested: 0 }
)),



// Plant information stored as objects in an array
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
    },
    // More plants...
];
```

**Simple Explanation:** Think of arrays like a list of things, and objects like containers with labeled compartments. Here, we have a list of 12 garden plots, and each plot is a container that holds information about what's planted there. The plant database is like a catalog where each plant has its own information card.

## Array Methods
My code uses `filter` and `map`to make lists easier.

**Example:**
```javascript
// Filter shows only plants that match certain conditions
const availablePlants = plantDatabase.filter(plant =>
    gameData.discoveredPlants.includes(plant.id) && gameData.resources.seeds >= plant.seedCost
);

// Map turns one list into another list
const stageTimeline = plant.stages.map((stage, index) => {
    const isActive = plot && plot.growthProgress >= (index * (100 / plant.stages.length));
    return `<div class="stage-point ${isActive ? 'active' : ''}"></div>`;
}).join('<div class="stage-connector"></div>');
```

**Explanation:** 
- `filter` is like using a strainer to keep only what you want. Here it keeps only plants the player has discovered AND has enough seeds to plant.
- `map` transforms each item into something new. Imagine turning a list of ingredients into a list of prepared dishes. Here it turns growth stages into visual points on a timeline.

## Looping/Iteration
My code uses different loop types depending on what works best.

**Example:**
```javascript
// Loop through object entries (name-value pairs)
for (const [env, slider] of Object.entries(environmentSliders)) {
    slider.addEventListener('input', () => {
        const value = slider.value;
        gameData.environment[env] = parseInt(value);
        environmentValues[env].textContent = `${value}%`;
    });
}

// Loop through a collection of elements
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

```

**Explanation:** The first example uses a `for...of` loop with `Object.entries()` which lets us get both the name and value at once. The second example uses `forEach` which is a simple way to do something with every item in a list.

## JSON Handling
The code converts JavaScript objects to text strings for storage, and back again when it's needed.

**Example:**
```javascript
// Convert game data to a string
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

// Convert string back to game data
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
```

**Simple Explanation:** 
- `JSON.stringify` turns the complex game data into a simple text string.
- `JSON.parse` turns that text string back into usable game data.
The code wraps these in `try/catch` blocks which is like having a safety net in case something goes wrong.

## Web Storage
My code tries different ways to save data in your browser, falling back to simpler methods if needed.

**Example:**
```javascript
// Check if localStorage works
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
```

**Simple Explanation:** Before using a storage method, the code tests if it works. It tries to write a test value, read it back, and remove it. If it does not work, it can try a different storage method instead.

## Saving/Retrieving User Data
The code saves all the game progress and can recover it even if something goes wrong.

**Example:**
```javascript
// Save game data using the best available method
async function saveGameData(manual = false) {
    if (!storageSystem.consentGiven || storageSystem.primaryMethod === null) {
        if (manual) {
            showToast('Unable to save: Storage consent not given or no storage available', 'error');
        }
        return false;
    }

    // Update playtime
    gameData.session.totalPlayTime += Math.floor((Date.now() - gameData.session.startTime) / 1000);
    gameData.session.startTime = Date.now();
    
    // Try to save using the best available method
    try {
        let success = false;
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
        
        // Show message if it was a manual save
        if (success && manual) {
            showToast('Game saved successfully!', 'success');
        }
        return success;
    } catch (error) {
        console.error('Save error:', error);
        if (manual) {
            showToast(`Failed to save game: ${error.message}`, 'error');
        }
        return false;
    }
}
```

**Simple Explanation:** This function will try multiple ways to help you. First, it updates how long you've been playing. Then it tries to save your game using the best method available. If that doesn't work, it tries other methods. It also tells you what's happening with little pop-up messages.

## Cookie Handling
The code can set, get, and delete cookies which are small pieces of data stored in your browser.

**Example:**
```javascript
// Set a cookie that expires after a certain number of days
function setCookie(name, value, days) {
    const date = new Date();
    date.setTime(date.getTime() + (days * 24 * 60 * 60 * 1000));
    const expires = `expires=${date.toUTCString()}`;
    document.cookie = `${name}=${value};${expires};path=/`;
}

// Find and read a specific cookie
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
```

**Simple Explanation:** Cookies are like little notes your browser keeps. `setCookie` writes a note with an expiration date. `getCookie` looks through all the notes to find the one with a specific name. Cookies help remember things like whether you accepted the terms or what your preferred settings are.

## DOM Manipulation
The code creates, modifies, and removes elements on the webpage to update what you see.

**Example:**
```javascript
// Render garden by creating and manipulating DOM elements
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
        } 
        gardenGrid.appendChild(plotElement);
    }
}
```

**Explanation:** This function rebuilds the garden display from scratch. First, it clears the garden area. Then for each garden plot in your game data, it creates a new plot element. Empty plots get a "Click to plant" message and planted plots show the plant. Each element gets an appropriate click action. Finally, all the new plot elements are added to the garden grid on the page.

## CSS Manipulation
The code changes how things look by updating CSS classes and styles.

**Example:**
```javascript
// Update progress bars for plant growth
function updateProgressBars() {
    const plotElements = document.querySelectorAll('.plot');

    for (let i = 0; i < gameData.garden.length; i++) {
        const plot = gameData.garden[i];

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
```

**Explanation:** This function updates how full the progress bars look for growing plants. For each plant that's growing, it finds its progress bar and changes the width to match how much the plant has grown. It also figures out which growth stage the plant is in (like "seed" or "sprout") and updates the text. This gives players visual feedback about their plants' progress.

## Theme Preference
The code lets players switch between light and dark themes and remembers their choice.

**Example:**
```javascript
// Toggle between light and dark theme
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

// Apply saved theme preference
function applyTheme() {
    const theme = gameData.settings.theme || 'dark';
    document.documentElement.setAttribute('data-theme', theme);
    themeIcon.textContent = theme === 'dark' ? '🌙' : '☀️';
}
```

**Explanation:** The `toggleTheme` function checks if the current theme is dark - if yes, it changes to light, and if no, it changes to dark. It updates several things: a data attribute that CSS uses, body classes for styling, the theme icon (moon or sun), and saves your choice. The `applyTheme` function loads your saved theme preference when the game starts.

## Code Comments & Readability
The code includes comments that explain what different parts do.

**Example:**
```javascript
// Storage system configuration
const STORAGE_CONFIG = {
    useIndexedDB: true,      // Trys IndexedDB as primary storage
    useLocalStorage: true,   // Trys localStorage as fallback
    useSessionStorage: true, // Trys sessionStorage as final fallback
    autoSaveInterval: 5 * 60 * 1000, // 5 minutes in milliseconds
    maxRetries: 3,           // Max retries for storage operations
    storageKeyPrefix: 'celestialGarden_',
    storageKeys: {
        saveData: 'saveData',
        consentStatus: 'consentStatus'
    }
};

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
}
```

**Explanation:** Comments are like little notes that explain what the code does. Some comments explain individual settings, like "5 minutes in milliseconds" next to the autosave interval. Other comments mark sections of code, like "Apply theme" before that step is in the initialization. These notes make it easier for people to understand what each part of the code does.

## Error Handling & Debugging
I have my code to expect things might go wrong and knows how to handle problems.

**Example:**
```javascript
// Handle storage errors with fallback mechanism
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

    // If we have no storage methods available, disable storage
    if (storageSystem.primaryMethod === null) {
        storageSystem.consentGiven = false;
        showToast('All storage methods failed. Your progress will not be saved.', 'error');
    }
}
```

**Explanation:** This function is like a problem-solver. When something goes wrong with saving your game, it:
1. Writes down what happened in the console log
2. Shows a friendly error message 
3. Tries a different way to save your game
4. If nothing works, it tells the use clearly that the progress won't be saved

This way, even when problems happen, the game doesn't crash - it adapts and keeps running.

## Regex for Validation
The code can check if text matches certain patterns 

**Example:**
```javascript
// A likely implementation for search validation
function validateSearchInput(term) {
    // Remove special characters that could break the search
    const sanitized = term.replace(/[^\w\s-]/g, '').trim();
    
    // Ensure minimum length
    if (sanitized.length < 2) {
        return '';
    }
    
    return sanitized;
}
```

**Explanation:** This function cleans up search text. The part with `/[^\w\s-]/g` is a pattern that matches any character that is NOT a letter, number, underscore, space, or hyphen. These unwanted characters get replaced with nothing or removed. This helps prevent errors from special characters and makes searches work better.

## Timer & Date Object
The code keeps track of time for gameplay and session tracking.

**Example:**
```javascript
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
```

**Explanation:** The first function sets up a timer that ticks every second (1000 milliseconds). The second function calculates how long the user has been playing by:
1. Getting the current time with `Date.now()`
2. Calculating seconds elapsed since you started this session
3. Adding any playtime from previous sessions
4. Converting the total seconds into hours, minutes, and seconds
5. Displaying the time in a 00:00:00 format

This clock keeps running as long as the user plays the game.

## Math, String, Random methods
The code uses math operations and random numbers to create gameplay mechanics.

**Example:**
```javascript
// Random chance for bonus seeds when harvesting
if (Math.random() < 0.3) {
    const bonusSeeds = Math.floor(Math.random() * 10) + 5;
    gameData.resources.seeds += bonusSeeds;
    harvestMessage += `<strong>BONUS: +${bonusSeeds} seeds!</strong>`;
}

// Calculate growth progress
const environmentMultiplier = calculateEnvironmentMultiplier(plant);
const growthRate = (deltaTime / plant.growthTime) * 100 * environmentMultiplier * growthMultiplier;
plot.growthProgress = Math.min(100, plot.growthProgress + growthRate);
```

**Simple Explanation:** 
- The first part uses `Math.random()` which gives a random number between 0 and 1. If that number is less than 0.3 (30% chance), the player gets bonus seeds. It then picks a random number between 5 and 14 for the bonus amount.
- The second part calculates plant growth using formulas. It figures out how fast the plant should grow based on several factors, then adds that amount to the current progress. `Math.min(100, value)` makes sure progress never goes above 100%.

## Event Listeners
The code sets up responses to different user actions like clicking buttons.

**Example:**
```javascript
// Initialize event listeners
function initEventListeners() {
    // Theme toggle
    themeToggle.addEventListener('click', toggleTheme);

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
    
    // Reset game button
    resetGameBtn.addEventListener('click', resetGame);
    
    // ... more event listeners ...
}
```

**Simple Explanation:** This function sets up all the ways the game responds to the users clicks. It's like connecting buttons to actions:
- When the user clicks the theme toggle, it switches between light and dark themes
- When the user clicks a navigation button, it highlights that button and shows the corresponding view
- When the user clicks the reset button, it runs the reset game function

This makes the game interactive - when you do something, the game responds appropriately.

## Search History
This code implements a search system that remembers previous searches.

**Example:**
```javascript
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
```

**Simple Explanation:** This code creates a smart search box:
1. As the user types, it immediately shows matching plants
2. It waits until the user stops typing for 1 second before saving your search
3. It remembers up to 5 recent searches
4. If the user searches for something they already searched before, it moves that term to the top
5. It shows the recent searches so they can click them instead of typing again

This makes searching faster and more convenient, especially for searches they might do often.

## Full CRUD Functionality
The code can perform all basic data operations - creating, reading, updating, and deleting game data.

**Example:**
```javascript
// Create new game data
function startNewGame() {
    console.log('Starting new game...');
    // Initialize game state with default values
    // ... code to set up new game ...
}

// Read existing game data
async function loadGameData(manual = false) {
    // ... code to load saved game ...
}

// Update existing game state
function updateGame() {
    const currentTime = Date.now();
    const deltaTime = (currentTime - gameData.lastUpdateTime) / 1000;
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

// Delete game data
function resetGame() {
    if (!confirm('Are you sure you want to reset your game? All progress will be lost!')) {
        return;
    }
    
    // Reset to default values
    Object.assign(gameData, {
        // ... default game state ...
    });
    
    // Clear storage
    resetStorage();
    
    // ... update UI ...
}
```

**Simple Explanation:** These functions handle the complete cycle of game data:
- `startNewGame` creates a fresh game with default values
- `loadGameData` reads saved game data from storage
- `updateGame` changes the game state as time passes
- `resetGame` deletes all progress and starts over

Together, these functions let the game create data when needed, load existing data, update it during gameplay, and delete it when requested. This is called "CRUD" - Create, Read, Update, Delete - and it's a fundamental pattern in programming.