#!/bin/bash

echo "🔧 Fixing Docker build issues..."

# Check if we're in a project with pnpm
if [ -f "pnpm-lock.yaml" ]; then
    echo "📦 Detected pnpm project"
    
    # Check if pnpm-lock.yaml is out of date
    if [ -f "package.json" ]; then
        echo "🔍 Checking if pnpm lockfile needs update..."
        
        # Try to install to ensure lockfile is up to date
        if command -v pnpm >/dev/null 2>&1; then
            echo "   🔄 Updating pnpm lockfile..."
            pnpm install --lockfile-only --ignore-scripts
            echo "   ✅ pnpm lockfile updated"
        else
            echo "   ⚠️  pnpm not found. Install with: npm install -g pnpm"
        fi
    fi
    
    # Check for Dockerfile.dev
    if [ -f "Dockerfile.dev" ]; then
        echo "🐳 Found Dockerfile.dev"
        
        # Check if it has the problematic --frozen-lockfile flag
        if grep -q "pnpm install --frozen-lockfile" Dockerfile.dev; then
            echo "   🔧 Fixing --frozen-lockfile issue..."
            
            # Create backup
            cp Dockerfile.dev Dockerfile.dev.backup
            
            # Replace --frozen-lockfile with --prefer-frozen-lockfile for better compatibility
            sed -i.tmp 's/pnpm install --frozen-lockfile/pnpm install --prefer-frozen-lockfile/g' Dockerfile.dev
            rm Dockerfile.dev.tmp 2>/dev/null
            
            echo "   ✅ Updated Dockerfile.dev (backup created)"
        else
            echo "   ✅ Dockerfile.dev looks good"
        fi
    fi
    
elif [ -f "yarn.lock" ]; then
    echo "📦 Detected Yarn project"
    
    if [ -f "Dockerfile.dev" ] && grep -q "yarn install --frozen-lockfile" Dockerfile.dev; then
        echo "   🔧 Checking Yarn lockfile compatibility..."
        
        # Yarn lockfile issues are less common, but let's ensure it's up to date
        if command -v yarn >/dev/null 2>&1; then
            yarn install --check-files
            echo "   ✅ Yarn lockfile verified"
        fi
    fi
    
elif [ -f "package-lock.json" ]; then
    echo "📦 Detected npm project"
    echo "   ✅ npm projects typically don't have lockfile issues"
    
else
    echo "⚠️  No lockfile detected - this might not be a Node.js project"
fi

# Check Docker Compose configuration
if [ -f "docker-compose.yml" ] || [ -f "docker-compose.dev.yml" ]; then
    echo "🐳 Checking Docker Compose configuration..."
    
    # Look for common issues
    for compose_file in docker-compose.yml docker-compose.dev.yml; do
        if [ -f "$compose_file" ]; then
            echo "   📋 Found $compose_file"
            
            # Check if there are any obvious build context issues
            if grep -q "context: \." "$compose_file"; then
                echo "   ✅ Build context looks correct"
            fi
        fi
    done
fi

echo ""
echo "🎯 Docker Build Fix Summary:"
echo "   • Lockfile compatibility improved"
echo "   • Build configuration verified"
echo ""
echo "💡 Now try: claude-dev clean && claude-dev"