#!/bin/bash

# Claude Developer OS Installation Script
set -e

echo "🚀 Installing Claude Developer OS..."
echo ""

# Check Node.js
if ! command -v node >/dev/null 2>&1; then
    echo "❌ Node.js is required but not installed."
    echo "   Please install Node.js 18+ and try again."
    echo "   https://nodejs.org/"
    exit 1
fi

NODE_VERSION=$(node --version | cut -d'v' -f2 | cut -d'.' -f1)
if [ "$NODE_VERSION" -lt 18 ]; then
    echo "❌ Node.js 18+ is required (found v$NODE_VERSION)"
    echo "   Please upgrade Node.js and try again."
    exit 1
fi

echo "✅ Node.js $(node --version) found"

# Install globally
echo "📦 Installing claude-dev globally..."
npm install -g .

echo ""
echo "✅ Installation completed!"
echo ""
echo "🎉 Claude Developer OS is now available globally."
echo ""
echo "🚀 Quick start:"
echo "   1. cd your-project"
echo "   2. claude-dev"
echo ""
echo "💡 Optional tools for full features:"
echo "   • Task: brew install go-task/tap/go-task"
echo "   • Docker: https://docker.com/get-started"
echo "   • Vercel CLI: npm i -g vercel"
echo "   • Supabase CLI: npm i -g supabase"
echo "   • Claude Code CLI: https://claude.ai/code"
echo ""
echo "📚 Documentation: https://github.com/your-org/claude-code-agent-system"
echo ""
echo "Happy coding! 🚀"