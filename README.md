# Agency Website Template

### Deployment Links

- **Cloudflare Pages**: [https://illumen-digital.pages.dev](https://illumen-digital.pages.dev)
- **GitHub Pages**: [https://garrrvin.github.io/illumen-digital/](https://garrrvin.github.io/illumen-digital/)

This is a premium, dark-themed agency website template built with HTML, CSS, and vanilla JavaScript. It is designed for digital consultancies, creative studios, and B2B service providers.

## Features

- **Modern Dark Aesthetic**: sleek dark mode with purple neon accents.
- **Interactive Elements**: Particle background, typewriter effect, and scroll animations.
- **Responsive Design**: Fully responsive layout that works on all devices.
- **B2B Focused Sections**: Case Studies, Services, and tech stack showcase.

## Setup & Customization

### 1. Update Agency Information (`index.html`)

Open the `index.html` file in your text editor. Look for the following placeholders and update them:

- **Page Title**: Update `<title>Agency Name | Digital Solutions...</title>`.
- **Meta Description**: Update the `<meta name="description" ...>` tag with your value proposition.
- **Header**: Update `AGENCY.NAME` in the brand section.
- **Hero Section**:
  - Update the badge text `DIGITAL CONSULTANCY`.
  - Update the mission statement paragraph.
  - Update the `mailto:` links to your contact email.
- **Client Logos**:
  - Update the text in `client-logo` divs with your client names.
- **Featured Work**:
  - Replace the example projects with your agency's actual case studies.
  - Update stats (e.g., `CONVERSION LIFT`) to show client success metrics.
- **Services Section**:
  - Update the service categories (`STRATEGY`, `ENGINEERING`, `DESIGN`).
  - Update the bullet points to describe your specific service offerings.
- **Process**:
  - Update the timeline steps and weeks to match your agency workflow.
- **Technology Stack (About)**:
  - Update the categories and skill tags to reflect your team's expertise.
- **Footer**: Update the copyright notice and agency name.

### 2. Update Typewriter Effect (`assets/js/main.js`)

Open `assets/js/main.js` and locate the **Typewriter Effect** section (around line 175).

- Change the value of `textToType` from `"Digital Agency."` to your desired text.
- Adjust the `if (index < 8)` logic if your first part (the non-accented text) has a different length.
  - Example: If you want "Creative Studio.", the unaccented part "Creative " is 9 characters. You would change `8` to `9` in both `if (index < 8)` and `if (index === 8)`.

### 3. Styling (`assets/css/style.css`)

The styles are located in `assets/css/style.css`. You can modify:

- `--accent-color` and `--accent-glow` for different branding colors.
- `--font-main` for typography.

## Running Locally

Simply open `index.html` in your web browser to view the site. For a better development experience, use a local server like the Live Server extension in VS Code.
