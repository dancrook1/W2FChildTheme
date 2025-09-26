# W2F Child Theme

A custom WordPress child theme for **Wired2Fire** based on Hello Elementor, specifically designed to enhance WooCommerce composite product functionality and user experience.

## Overview

This child theme extends the Hello Elementor theme with specialized customizations for WooCommerce composite products, providing an improved interface for PC configuration and product selection.

## Features

### 🎨 Enhanced Composite Product Display
- **Same-row layout**: Component titles and selections display inline (e.g., "Case: Fractal Design North XL TG - Black")
- **Clean spacing**: Minimal padding with 1px bottom borders for visual separation
- **Hidden elements**: Removes clutter by hiding images, edit buttons, and availability text in summary

### 🔧 Interactive Components
- **Accordion functionality**: Collapsible component sections for better organization
- **Select2 integration**: Enhanced dropdown selection with search capabilities
- **Info buttons**: Context-sensitive help with modal popups
- **Responsive design**: Mobile-optimized layouts

### 📁 Custom Templates
- WooCommerce template overrides for composite products
- Custom JavaScript for enhanced user interactions
- Specialized CSS for consistent styling

## File Structure

```
├── assets/
│   ├── css/
│   │   ├── accordion.css          # Accordion component styles
│   │   ├── composite.css          # Main composite product styles
│   │   └── composite-select2.css  # Select2 dropdown styling
│   └── js/
│       ├── accordion.js           # Accordion functionality
│       ├── composite-select2-init.js # Select2 initialization
│       └── composite-tabs.js      # Tab navigation
├── woocommerce/
│   └── single-product/            # Template overrides
├── functions.php                  # Theme functions and enhancements
├── style.css                     # Main stylesheet with composite customizations
└── header.php                    # Custom header template
```

## Key Customizations

### 1. Composite Summary Layout
- Flexbox-based layout for title and selection alignment
- Consistent typography and spacing
- Removal of unnecessary UI elements

### 2. Component Selection Interface
- Enhanced dropdown functionality with Select2
- Accordion-style component organization
- Info modals for product details

### 3. Responsive Design
- Mobile-first approach
- Flexible layouts that adapt to different screen sizes
- Touch-friendly interface elements

## Installation

1. Upload the theme folder to `/wp-content/themes/`
2. Activate "Hello Elementor Child" in WordPress admin
3. Ensure WooCommerce and WooCommerce Composite Products plugins are active

## Dependencies

- **WordPress** 5.0+
- **Hello Elementor** (parent theme)
- **WooCommerce** plugin
- **WooCommerce Composite Products** plugin

## Browser Support

- Chrome 60+
- Firefox 60+
- Safari 12+
- Edge 79+

## Development

### CSS Architecture
- Component-based styling approach
- High specificity selectors to override plugin defaults
- Responsive breakpoints at 768px

### JavaScript Features
- jQuery-based interactions
- Select2 integration for enhanced dropdowns
- Modal system for product information

## Changelog

### v1.0.0 (Initial Release)
- Enhanced composite product summary layout
- Accordion functionality for component selection
- Select2 integration for dropdown components
- Responsive design improvements
- Custom WooCommerce template overrides

## Author

**Wired2Fire Development Team**
- Website: [wired2fire.co.uk](https://wired2fire.co.uk)
- Repository: [GitHub](https://github.com/dancrook1/W2FChildTheme)

## License

GNU General Public License v2 or later

---

*This theme is specifically designed for Wired2Fire's PC configuration system and may require customization for other use cases.*