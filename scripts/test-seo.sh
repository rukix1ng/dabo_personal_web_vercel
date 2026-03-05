#!/bin/bash

# Test script to verify SEO optimizations

echo "=== SEO Optimization Test ==="
echo ""

# Check if server is running
if ! curl -s http://localhost:3000 > /dev/null 2>&1; then
    echo "⚠️  Server is not running. Starting server..."
    echo "Please run: npm run dev"
    echo ""
    exit 1
fi

echo "✓ Server is running"
echo ""

# Test sitemap
echo "Testing sitemap.xml..."
SITEMAP=$(curl -s http://localhost:3000/sitemap.xml)
if echo "$SITEMAP" | grep -q "urlset"; then
    echo "✓ Sitemap is accessible"
    URLS=$(echo "$SITEMAP" | grep -o "<url>" | wc -l)
    echo "  Found $URLS URLs in sitemap"
else
    echo "✗ Sitemap not found or invalid"
fi
echo ""

# Test robots.txt
echo "Testing robots.txt..."
ROBOTS=$(curl -s http://localhost:3000/robots.txt)
if echo "$ROBOTS" | grep -q "User-agent"; then
    echo "✓ Robots.txt is accessible"
else
    echo "✗ Robots.txt not found"
fi
echo ""

# Test manifest
echo "Testing manifest.json..."
MANIFEST=$(curl -s http://localhost:3000/manifest.webmanifest)
if echo "$MANIFEST" | grep -q "name"; then
    echo "✓ Manifest is accessible"
else
    echo "✗ Manifest not found"
fi
echo ""

# Test icons
echo "Testing icons..."
for icon in "/icon.png" "/apple-icon.png" "/opengraph-image"; do
    if curl -s -o /dev/null -w "%{http_code}" http://localhost:3000$icon | grep -q "200"; then
        echo "✓ $icon is accessible"
    else
        echo "⚠️  $icon returned non-200 status"
    fi
done
echo ""

echo "=== Test Complete ==="
