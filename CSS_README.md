# Celestial Garden CSS Code Review


## Table of Contents
1. [Global Reset & Box Model](#1-global-reset--box-model)
2. [Use of CSS Variables](#2-use-of-css-variables)
3. [Organized CSS Structure](#3-organized-css-structure)
4. [Responsive Design](#4-responsive-design)
5. [Typography Styling](#5-typography-styling)
6. [Color Scheme & Contrast](#6-color-scheme--contrast)
7. [Flexbox/Grid Usage](#7-flexboxgrid-usage)
8. [Button & Input Styling](#8-button--input-styling)
9. [Component Reusability](#9-component-reusability)
10. [CSS Transitions](#10-css-transitions)
11. [Hover/Focus Effects](#11-hoverfocus-effects)
12. [Layout Containers](#12-layout-containers)
13. [Layering with Z-Index](#13-layering-with-z-index)
14. [Utility Classes](#14-utility-classes)
15. [Use of Pseudo-classes/elements](#15-use-of-pseudo-classeselements)
16. [Shadows & Borders](#16-shadows--borders)
17. [Custom Scrollbars](#17-custom-scrollbars)
18. [Theme Customization](#18-theme-customization)
19. [Naming Conventions](#19-naming-conventions)
20. [Cleanliness & Commenting](#20-cleanliness--commenting)


### 1. Global Reset & Box Model
The CSS implements a universal selector reset to ensure consistent rendering across all browsers. The box-sizing property is set to border-box for predictable layout behavior.

```css
* {
    margin: 0;
    padding: 0;
    box-sizing: border-box;
    font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
    transition: background-color 0.3s ease, color 0.3s ease;
}
```

### 2. Use of CSS Variables
CSS custom properties (variables) are used for theming and consistent styling. Variables are defined at the root and reused throughout the stylesheet, making it easy to update colors, spacing, and other properties from a single location.

```css
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

### 3. Organized CSS Structure
The CSS is organized logically with related styles grouped together. Clear comments are used to separate different sections of the stylesheet, making navigation and maintenance easier.

```css
/* Light theme styles */
body.theme-light {
    background: linear-gradient(135deg, var(--background-dark), #f0f8ff);
}

/* Session timer styles */
.session-timer {
    position: fixed;
    top: 0.5rem;
    right: 0.5rem;
    background-color: var(--background-dark);
    color: var(--text-light);
    padding: 0.5rem;
    border-radius: 0.5rem;
    font-size: 0.8rem;
    z-index: 100;
    box-shadow: 0 2px 5px rgba(0, 0, 0, 0.2);
    transition: background-color 0.3s ease;
}
```

### 4. Responsive Design
Media queries are implemented to create a responsive layout that adapts to different screen sizes.

```css
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
}
```

### 5. Typography Styling
Typography is consistently styled with a clear hierarchy. Line height, font sizes, and weights are defined to ensure readability and visual hierarchy across the application.

```css
h1 {
    font-size: 1.5rem;
    background: linear-gradient(90deg, var(--accent-color), var(--primary-color));
    -webkit-background-clip: text;
    background-clip: text;
    -webkit-text-fill-color: transparent;
    margin: 0;
}

.plant-detail-description {
    margin-bottom: 1.5rem;
    line-height: 1.5;
}
```

### 6. Color Scheme & Contrast
The color scheme uses a consistent palette with sufficient contrast for accessibility. Colors are defined as variables and applied consistently throughout the UI to create visual coherence.

```css
background: linear-gradient(135deg, var(--background-dark), #131a2c);
color: var(--text-light);

.resource-icon.energy {
    background-color: var(--energy-color);
    color: var(--background-dark);
}
```

### 7. Flexbox/Grid Usage
Both Flexbox and CSS Grid are used appropriately for layout. The main container uses Grid for the overall page structure, while Flexbox is used for alignment within components.

```css
.container {
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

.plant-detail-yields-list {
    display: flex;
    gap: 1rem;
}
```

### 8. Button & Input Styling
Buttons and inputs are styled consistently with appropriate hover and focus states. Interactive elements have clear visual cues to indicate their function.

```css
.modal-button {
    padding: 0.5rem 1rem;
    border: none;
    border-radius: 0.5rem;
    font-weight: bold;
    cursor: pointer;
    transition: all 0.2s ease;
}

.modal-button:hover {
    transform: translateY(-2px);
    box-shadow: 0 4px 8px rgba(0, 0, 0, 0.2);
}
```

### 9. Component Reusability
Common styles are abstracted into reusable classes to maintain consistency and reduce code duplication. Components like cards, buttons, and modals share common styling patterns.

```css
.modal {
    background-color: var(--background-medium);
    border-radius: 1rem;
    width: 90%;
    max-width: 600px;
    max-height: 90vh;
    overflow-y: auto;
    padding: 1.5rem;
    box-shadow: 0 8px 32px rgba(0, 0, 0, 0.3);
}

.plant-selection-item, .research-card, .collection-card {
    background-color: var(--background-light);
    border-radius: 0.5rem;
    transition: all 0.2s ease;
}
```

### 10. CSS Transitions
Smooth transitions are applied to interactive elements. Animations use appropriate timing and easing functions for a better user experience.

```css
* {
    transition: background-color 0.3s ease, color 0.3s ease;
}

.modal-overlay.active .modal {
    transform: translateY(0);
}

.modal {
    transform: translateY(20px);
    transition: transform 0.3s ease;
}
```

### 11. Hover/Focus Effects
Interactive elements have clear hover and focus states to provide visual feedback. These states enhance usability by indicating which elements can be interacted with.

```css
.nav-button:hover {
    background-color: var(--primary-color);
    transform: translateY(-2px);
    box-shadow: 0 4px 8px rgba(0, 0, 0, 0.2);
}

.theme-toggle:hover {
    background-color: var(--background-light);
    transform: scale(1.1);
}
```

### 12. Layout Containers
Container classes are used for consistent layout spacing and maximum widths. These containers help maintain a clean, organized structure across the application.

```css
.container {
    max-width: 1400px;
    margin: 0 auto;
    padding: 0.5rem;
}

.settings-section {
    background-color: var(--background-light);
    border-radius: 0.5rem;
    padding: 1rem;
    margin-bottom: 1rem;
}
```

### 13. Layering with Z-Index
Z-index is used strategically to manage the stacking order of elements. Modals, toasts, and other overlays are given appropriate z-index values to ensure they appear above other content.

```css
.modal-overlay {
    position: fixed;
    z-index: 1000;
}

.session-timer {
    z-index: 100;
}

.toast-container {
    z-index: 1000;
}
```

### 14. Utility Classes
Utility classes are created for common styling needs, promoting reusability and consistency. These classes handle specific, repeatable styling patterns.

```css
.plant-image.excellent {
    box-shadow: 0 0 15px var(--success-color);
}

.plant-image.good {
    box-shadow: 0 0 15px var(--energy-color);
}

.plant-image.fair {
    box-shadow: 0 0 15px var(--warning-color);
}

.plant-image.poor {
    box-shadow: 0 0 15px var(--danger-color);
}
```

### 15. Use of Pseudo-classes/elements
Pseudo-classes and elements are used for advanced styling without adding unnecessary HTML.

```css
.stage-connector {
    position: absolute;
    top: 50%;
    left: 12px;
    height: 2px;
    background-color: var(--background-light);
    width: calc(100% - 24px);
    transform: translateY(-50%);
    z-index: -1;
}

.env-slider::-webkit-slider-thumb {
    -webkit-appearance: none;
    width: 16px;
    height: 16px;
    border-radius: 50%;
    background-color: var(--accent-color);
    cursor: pointer;
}
```

### 16. Shadows & Borders
Shadows and borders are used consistently to create depth and visual hierarchy.

```css
.plant-selection-item:hover {
    background-color: var(--background-dark);
    transform: translateY(-5px);
    box-shadow: 0 8px 16px rgba(0, 0, 0, 0.3);
}

header {
    box-shadow: 0 4px 20px rgba(0, 0, 0, 0.2);
    backdrop-filter: blur(5px);
}
```

### 17. Custom Scrollbars
Custom scrollbars are styled to match the overall theme of the application. 

```css
.env-slider {
            width: 100%;
            --webkit-appearance: none;
            height: 6px;
            background-color: var(--background-dark);
            border-radius: 3px;
            outline: none;
        }

```

### 18. Theme Customization
The application supports both light and dark themes through CSS variables and class-based theme switching. This enhances user experience by allowing personal preference customization.

```css
body.theme-light {
    --primary-color: #3498db;
    --secondary-color: #f1c40f;
    --accent-color: #e74c3c;
    --background-dark: #f9f9f9;
    --background-medium: #f2f2f2;
    --background-light: #ffffff;
    --text-light: #333333;
    --text-medium: #666666;
    --text-dark: #999999;
}

[data-theme="light"] .session-timer {
    background-color: var(--background-medium);
}
```

### 19. Naming Conventions
Class names follow a consistent naming convention based on BEM (Block Element Modifier) principles. This makes the codebase more readable and maintainable.

```css
.plant-detail-header {}
.plant-detail-image {}
.plant-detail-info {}
.plant-detail-name {}

.nav-section {}
.nav-title {}
.nav-button {}
.nav-icon {}
```

### 20. Cleanliness & Commenting
The CSS is well-organized with appropriate comments to explain different sections.

```css
/* Light theme styles */
body.theme-light {
    background: linear-gradient(135deg, var(--background-dark), #f0f8ff);
}

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


#