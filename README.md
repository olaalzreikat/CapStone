# Celestial Garden: Cosmic Flora Evolution


## Overview

Celestial Garden is an immersive space-themed gardening simulation game where players cultivate exotic alien flora, manipulate cosmic environments, and discover rare plant species to create a thriving interstellar ecosystem. The game features resource management, plant collection, research mechanics, and environmental control systems.

## Table of Contents

### CSS Styles
2. [Global Reset & Box Model](#Global-Reset-&-Box-Model)
3. [CSS Variables](#CSSVariables)
4. [Responsive Design](#ResponsiveDesign)
5. [Typography Styling](#TypographyStyling)
6. [Color Scheme & Contrast](#ColorScheme&Contrast)
7. [Flexbox/Grid](#Flexbox/Grid)
8. [Button & Input Styling](#Button&InputStyling)
9. [Component Reusability](#ComponentReusability)
10. [CSS Transitions](#CSSTransitions)
11. [Hover/Focus Effects](#Hover/FocusEffects)
12. [Layout Containers](#LayoutContainers)
13. [Z-Index](#Z-Index)
14. [Utility Classes](#UtilityClasses)
15. [Pseudo-classes/elements](#Pseudo-classes/elements)
16. [Shadows & Borders](#Shadows&Borders)
17. [Custom Scrollbars](#CustomScrollbars)
18. [Theme Customization](#ThemeCustomization)
19. [Naming Conventions](#NamingConventions)
20. [Cleanliness & Commenting](#Cleanliness&Commenting)




### Global Reset & Box Model
```
 * {
     margin: 0;
     padding: 0;
     box-sizing: border-box;
     font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
     transition: background-color 0.3s ease, color 0.3s ease;
    }

```

### CSS Variables
```
:root {
        --primary-color: #5d3fd3;
        --secondary-color: #8066dc;
        --accent-color: #ff5470;
        --background-dark: #0f1c2e;
        --background-medium: #1f2f47;
        --background-light: #2f3f57;
        --text-light: #e2e6fc;
        --text-medium: #a5afd0;
        --text-dark: #67718d;
        --success-color: #42caaa;
        --warning-color: #ffcb47;
        --danger-color: #ff5757;
        --energy-color: #f7d002;
        --minerals-color: #2bc8e2;
        --seeds-color: #8be04e;
        --research-color: #b278ff;
        }
```

### Responsive Design
```
 /* Responsive styles */
        @media screen and (max-width: 1200px) {
            .container {
                grid-template-columns: 220px 1fr 250px;
            }

            .garden-grid {
                grid-template-columns: repeat(3, 1fr);
            }
        }

        @media screen and (max-width: 992px) {
            .container {
                grid-template-columns: 200px 1fr;
                grid-template-areas:
                    "header header"
                    "sidebar main"
                    "resources resources"
                    "footer footer";
            }

            .garden-grid {
                grid-template-columns: repeat(3, 1fr);
            }

            .plant-collection {
                grid-template-columns: repeat(2, 1fr);
            }

            .research-grid {
                grid-template-columns: 1fr;
            }

            .intro-features {
                grid-template-columns: 1fr;
            }
        }

        @media screen and (max-width: 768px) {
            .container {
                grid-template-columns: 1fr;
                grid-template-areas:
                    "header"
                    "main"
                    "sidebar"
                    "resources"
                    "footer";
            }

            header {
                flex-direction: column;
                align-items: flex-start;
            }

            .player-info {
                margin-top: 0.5rem;
                width: 100%;
                justify-content: space-between;
            }

            .garden-grid {
                grid-template-columns: repeat(2, 1fr);
            }

            .environment-controls {
                flex-direction: column;
            }

            .plant-selection-grid {
                grid-template-columns: repeat(2, 1fr);
            }

            .plant-detail-header {
                flex-direction: column;
                align-items: center;
                text-align: center;
            }

            .plant-detail-stats {
                grid-template-columns: 1fr;
            }
        }

        @media screen and (max-width: 576px) {
            .garden-grid {
                grid-template-columns: 1fr;
            }

            .collection-header {
                flex-direction: column;
                align-items: flex-start;
            }

            .search-filter {
                width: 100%;
                margin-top: 0.5rem;
            }

            .plant-collection {
                grid-template-columns: 1fr;
            }

            .plant-selection-grid {
                grid-template-columns: 1fr;
            }
        }

```

### Typography Styling
```
.plant-detail-description {
            margin-bottom: 1.5rem;
            line-height: 1.5;
        }

         * {
            margin: 0;
            padding: 0;
            box-sizing: border-box;
            font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
            transition: background-color 0.3s ease, color 0.3s ease;
            }
```

### Color Scheme & Contrast
```
        body {
            background: linear-gradient(135deg, var(--background-dark), #131a2c);
            color: var(--text-light);
            min-height: 100vh;
            overflow-x: hidden;
        }
```

### Flexbox/Grid
```
 header {
            grid-area: header;
            background-color: rgba(15, 25, 40, 0.7);
            padding: 1rem;
            border-radius: 0.5rem;
            display: flex;
            justify-content: space-between;
            align-items: center;
            box-shadow: 0 4px 20px rgba(0, 0, 0, 0.2);
            backdrop-filter: blur(5px);
        }
```

### Button & Input Styling
```
<div class="cookie-buttons">
            <button class="cookie-btn reject-cookies" id="reject-cookies">Reject</button>
            <button class="cookie-btn accept-cookies" id="accept-cookies">Accept</button>
     </div>

    <button class="start-button" id="start-game-btn">Begin Cultivation</button>

```

## Component Reusability
```  
.view {
        display: none;
        }

.view.active {
        display: block;
        }

.settings-section {
        background-color: var(--background-light);
        border-radius: 0.5rem;
        padding: 1rem;
        margin-bottom: 1rem;
        }


```


## CSS Transitions
```
.nav-button {
            display: flex;
            align-items: center;
            padding: 0.75rem;
            background-color: var(--background-light);
            border: none;
            border-radius: 0.5rem;
            color: var(--text-light);
            cursor: pointer;
            transition: all 0.2s ease;
            width: 100%;
            text-align: left;
            margin-bottom: 0.5rem;
        }

```

### Hover/Focus Effects
```
 .plot:hover {
            transform: translateY(-5px);
            box-shadow: 0 8px 16px rgba(0, 0, 0, 0.3);
        }

.modal-close:hover {
            color: var(--accent-color);
        }

.cookie-button:hover {
            transform: translateY(-2px);
            box-shadow: 0 4px 8px rgba(0, 0, 0, 0.2);
        }
```

### Layout Containers
```
.container {
            max-width: 1400px;
            margin: 0 auto;
            padding: 0.5rem;
            display: grid;
            grid-template-columns: 250px 1fr 300px;
            grid-template-rows: auto 1fr auto;
            grid-template-areas:
                "header header header"
                "sidebar main resources"
                "footer footer footer";
            gap: 1rem;
            height: 100vh;
        }
```

### Z-Index
```
 /* Modal styles */
        .modal-overlay {
            position: fixed;
            top: 0;
            left: 0;
            width: 100%;
            height: 100%;
            background-color: rgba(0, 0, 0, 0.7);
            display: flex;
            justify-content: center;
            align-items: center;
            z-index: 1000;
            opacity: 0;
            pointer-events: none;
            transition: opacity 0.3s ease;
        }
```

### Utility Classes
```
```

- **Header**: Contains game title, player information, and theme toggle













- **CSS Variables**: Defined in `:root` for consistent theming
- **Dark/Light Theme Support**: Theme variables and toggle functionality
- **Responsive Design**: Media queries for adapting to different screen sizes
- **Grid Layouts**: Used for organizing garden plots, research cards, and collection items
- **Animations**: For smooth transitions, loading sequences, and notifications
- **Modern CSS Features**: Flexbox, grid, transitions, and transforms

### Storage System

The storage system is designed to be robust with multiple fallbacks:

```javascript
// STORAGE_CONFIG defines settings for the storage system
const STORAGE_CONFIG = {
    useIndexedDB: true,     // Primary storage method
    useLocalStorage: true,  // Fallback option
    useSessionStorage: true // Last resort
    // Additional configuration...
};
```

The storage implementation includes:
- **Storage Initialization**: `initializeStorage()` checks available methods
- **Storage Operations**: `saveGameData()`, `loadGameData()` handle data persistence
- **Consent Management**: Functions to handle user consent for data storage
- **Error Handling**: Comprehensive error checking and fallback mechanisms

### Game Data & Objects

The game uses several key data structures:

1. **Game Data Object**:
```javascript
const gameData = {
    player: { /* Player info */ },
    settings: { /* Game settings */ },
    resources: { /* Resource amounts */ },
    resourceRates: { /* Production rates */ },
    environment: { /* Environment settings */ },
    garden: [ /* Garden plots array */ ],
    // Additional game state...
};
```

2. **Plant Database**:
```javascript
const plantDatabase = [
    {
        id: "cosmo_bloom",
        name: "Cosmo Bloom",
        description: "...",
        rarity: "common",
        growthTime: 30,
        // Plant properties...
        svg: `...` // SVG representation
    },
    // More plants...
];
```

3. **Research Database**:
```javascript
const researchDatabase = [
    {
        id: "basic_cultivation",
        name: "Basic Cultivation Techniques",
        description: "...",
        cost: 10,
        benefits: ["...", "..."],
        // Research properties...
    },
    // More research projects...
];
```

4. **Achievement Database**:
```javascript
const achievementDatabase = [
    {
        id: "first_plant",
        name: "Cosmic Gardener",
        description: "Plant your first cosmic flora.",
        unlocked: false
    },
    // More achievements...
];
```

## Core Game Mechanics

### Game Initialization

The game initialization process:

```javascript
async function initGame() {
    // Display loading animation
    // Initialize storage system
    await initializeStorage();
    // Setup event listeners
    // Check for saved game or show intro
    // Start game loop
}
```

### Game Loop

The main game loop updates growth, resources, and UI:

```javascript
function startGameLoop() {
    // Initial UI setup
    
    // Start interval for regular updates
    gameInterval = setInterval(() => {
        if (!isGamePaused) {
            updateGame();
        }
    }, 1000);
}

function updateGame() {
    // Calculate time delta
    // Update garden growth
    // Update resources
    // Update UI
    // Check achievements
}
```

### Plant Growth System

Plants grow based on time and environmental conditions:

```javascript
function updateGardenGrowth(deltaTime) {
    // For each garden plot with a plant
    // Calculate growth rate based on:
    //   - Base growth time
    //   - Environmental conditions
    //   - Difficulty settings
    // Update growth progress
}
```

### Environmental Effects

The environment affects plant growth and resource production:

```javascript
function calculateEnvironmentMultiplier(plant) {
    // Calculate difference between current and optimal conditions
    // Determine effectiveness based on plant tolerance
    // Return multiplier for growth rate and resource production
}
```

### Resource Production

Resources are generated based on mature plants:

```javascript
function updateResourceRates() {
    // Reset rates
    // For each mature plant:
    //   - Calculate production based on plant yields
    //   - Apply environmental multiplier
    //   - Update resource production rates
}
```

### Planting and Harvesting

Core gameplay functions:

```javascript
function plantSeed(plotIndex, plantId) {
    // Check seed cost and availability
    // Plant the seed in the plot
    // Update game state and UI
}

function harvestPlant(plotIndex) {
    // Calculate yield based on plant and conditions
    // Add resources to player's inventory
    // Clear the plot
    // Update game state and UI
}
```

### Research System

Allows unlocking new capabilities:

```javascript
function completeResearch(researchId) {
    // Check research points availability
    // Complete the research
    // Apply benefits
    // Update available research options
}
```

## UI Components

### Rendering Functions

The game uses several rendering functions to update the UI:

```javascript
function renderGame() {
    // Update player info
    // Update resources
    // Render garden, collection, research, achievements
}

function renderGarden() {
    // Create garden plot elements
    // Populate with plants or empty plots
    // Add click handlers for interaction
}

function renderPlantCollection() {
    // Filter plants based on search/filter
    // Create collection cards
    // Add click handlers for plant details
}

function renderResearch() {
    // Display available and completed research
    // Create research cards with appropriate buttons
}
```

### Modal Systems

Modals provide detailed interaction:

```javascript
function openPlantDetailModal(plantId, plotIndex) {
    // Get plant data
    // Populate modal with plant details
    // Show/hide harvest button based on readiness
    // Display the modal
}

function openPlantSelectionModal() {
    // Filter available plants
    // Create selection items
    // Set up handlers for selection
    // Display the modal
}
```

### Notification System

The game has multiple notification methods:

```javascript
function showToast(message, type) {
    // Create toast element
    // Add appropriate styling based on type
    // Display and auto-remove after timeout
}

function showGameNotification(title, message) {
    // Check if notifications are enabled
    // Create notification element
    // Display with title and message
    // Auto-remove after duration
}
```

## Storage System

### Multi-Layered Approach

The storage system implements fallbacks for browser compatibility:

```javascript
async function initializeStorage() {
    // Check IndexedDB availability
    await checkIndexedDBAvailability();
    
    // Check localStorage availability
    checkLocalStorageAvailability();
    
    // Check sessionStorage availability
    checkSessionStorageAvailability();
    
    // Determine best available method
    // Check for existing consent
}
```

### Save/Load Operations

Game state persistence is handled through:

```javascript
async function saveGameData(manual) {
    // Check consent and availability
    // Update session data
    // Use appropriate storage method
    // Handle errors and show notifications
}

async function loadGameData(manual) {
    // Check consent and availability
    // Load from appropriate storage method
    // Merge with game data
    // Update UI and show notifications
}
```

## Installation & Usage

1. Clone the repository
2. Open the `index.html` file in a modern web browser
3. No build process or dependencies required

```bash
git clone https://github.com/your-username/celestial-garden.git
cd celestial-garden
open index.html # or double-click the file in your file explorer
```

## Future Improvements

Potential enhancements for the codebase:

1. **Modularization**: Split code into separate files for better maintenance
2. **Build Process**: Implement a bundler for minification and optimization
3. **Testing**: Add unit tests for core game mechanics
4. **Localization**: Support for multiple languages
5. **Accessibility**: Improve screen reader support and keyboard navigation
6. **Multiplayer Features**: Plant trading or shared gardens
7. **Additional Content**: More plants, research, and achievements

## License

All rights reserved © 2025 Ola Alzreikat
1. index.html - Main HTML structure
2. styles.css - All CSS styling
3. main.js - Entry point, initialization, and game loop
4. storage.js - Storage system (IndexedDB, localStorage, sessionStorage)
5. data.js - Game data and databases (plants, research, achievements)
6. mechanics.js - Core game mechanics (growth, environment, resources)
7. garden.js - Garden-specific functionality and rendering
8. plants.js - Plant-related functions (planting, harvesting, collection)
9. research.js - Research system implementation
10. ui.js - UI rendering and modal systems
11. utils.js - Helper functions and utilities
12. notifications.js - Toast and notification system

