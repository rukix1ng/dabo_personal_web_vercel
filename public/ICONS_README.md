# PWA Icons

This project uses Next.js dynamic icon generation for favicons and app icons.

For PWA icons (icon-192.png and icon-512.png), you need to:

1. Create actual PNG files with the following specifications:
   - icon-192.png: 192x192 pixels
   - icon-512.png: 512x512 pixels

2. Place them in the /public directory

3. Design suggestions:
   - Use a simple, recognizable logo or letter (e.g., "D" for Dabo)
   - Use a gradient background (e.g., #667eea to #764ba2)
   - Ensure good contrast for visibility
   - Make it work on both light and dark backgrounds

You can use tools like:
- Figma, Sketch, or Adobe Illustrator for design
- Online favicon generators
- ImageMagick or similar tools for batch generation

Example command to create placeholder icons (requires ImageMagick):
```bash
convert -size 192x192 -background "#667eea" -fill white -gravity center -pointsize 140 -font Arial-Bold label:D public/icon-192.png
convert -size 512x512 -background "#667eea" -fill white -gravity center -pointsize 380 -font Arial-Bold label:D public/icon-512.png
```
