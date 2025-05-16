# Celestial Garden: Cosmic Flora Evolution

![Celestial Garden Logo](https://via.placeholder.com/150/5d3fd3/ffffff?text=🌱)

## Overview

Celestial Garden is an immersive space-themed gardening simulation game where players cultivate exotic alien flora, manipulate cosmic environments, and discover rare plant species to create a thriving interstellar ecosystem. The game features resource management, plant collection, research mechanics, and environmental control systems.

## Table of Contents

1. [Features](#features)
2. [Code Structure](#code-structure)
3. [Technical Breakdown](#technical-breakdown)
4. [Game Data & Objects](#game-data--objects)
5. [Core Game Mechanics](#core-game-mechanics)
6. [Storage System](#storage-system)
7. [UI Components](#ui-components)
8. [Installation & Usage](#installation--usage)
9. [Future Improvements](#future-improvements)
10. [License](#license)

## Features

### Cosmic Cultivation
- Plant and nurture exotic alien flora with unique growth patterns and evolutionary paths
- Manage garden plots with different plant species
- Monitor growth progress of your plants from seed to full bloom

### Environment Manipulation
- Adjust cosmic radiation, gravity, and atmosphere to create ideal growing conditions
- Different plants thrive in different environmental conditions
- Experiment to find optimal settings for maximum resource yields

### Resource Management
- Collect and manage four types of resources:
  - Energy ⚡
  - Minerals 🔷
  - Seeds 🌱
  - Research 🔬
- Balance resource usage for planting, harvesting, and research

### Plant Collection
- Discover various plant species with unique properties and aesthetics
- View detailed information about each plant's requirements and yields
- Track your collection progress with filters and search functionality

### Research System
- Complete research projects to unlock new technologies and plant varieties
- Invest research points to improve your gardening capabilities
- Unlock advanced environmental controls and resource production methods

### Achievements
- Complete various milestones to earn achievements
- Track your progress through the game

### Game Saving
- Automatic and manual save options
- Multiple storage fallback methods (IndexedDB, localStorage, sessionStorage)
- Robust storage solution designed for web environments

## Code Structure

The game is structured into several major components:

```
index.html
├── CSS Styles
├── HTML Structure
└── JavaScript
    ├── Storage System
    ├── Game Data & Objects
    ├── Core Game Mechanics
    ├── UI Rendering
    ├── Event Handlers
    └── Helper Functions
```

## Technical Breakdown

### HTML Structure

The HTML provides the skeleton for the game's interface with key sections:

- **Header**: Contains game title, player information, and theme toggle
- **Navigation Sidebar**: Provides access to different views (Garden, Collection, Research, Achievements, Settings)
- **Main Content Area**: Displays the active view (garden, collection, research, etc.)
- **Resources Panel**: Shows current resource counts and production rates
- **Modals**: For plant details, plant selection, and other interactive elements
- **Notification System**: Toast notifications and game alerts

### CSS Styling

The CSS uses modern techniques for a responsive and visually appealing interface:

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