#!/usr/bin/env bash
set -e

# Resolve project root directory regardless of invocation path
PROJECT_ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
cd "$PROJECT_ROOT"

# ANSI Color Codes
BOLD='\033[1m'
CYAN='\033[36m'
GREEN='\033[32m'
YELLOW='\033[33m'
MAGENTA='\033[35m'
RED='\033[31m'
NC='\033[0m' # No Color

echo -e "${BOLD}${CYAN}========================================================${NC}"
echo -e "${BOLD}${CYAN}🚀  BookSaathi — Indian Professional Booking Platform  ${NC}"
echo -e "${BOLD}${CYAN}========================================================${NC}"

# Parse command line flags
RUN_TESTS=false
RUN_SEED=false
RUN_BUILD=false

for arg in "$@"; do
  case $arg in
    --test|-t)
      RUN_TESTS=true
      shift
      ;;
    --seed|-s)
      RUN_SEED=true
      shift
      ;;
    --build|-b)
      RUN_BUILD=true
      shift
      ;;
    --help|-h)
      echo -e "${BOLD}Usage:${NC} ./run.sh [options]"
      echo ""
      echo "Options:"
      echo "  -t, --test   Run backend test suites before starting servers"
      echo "  -s, --seed   Seed initial demo & mock data into database"
      echo "  -b, --build  Run production build check before starting"
      echo "  -h, --help   Show this help message"
      exit 0
      ;;
    *)
      ;;
  esac
done

# Step 1: Environment File Verification
echo -e "${YELLOW}⚙️  Verifying environment configurations...${NC}"
if [ ! -f "backend/.env" ] && [ -f "backend/.env.example" ]; then
  cp backend/.env.example backend/.env
  echo -e "   ${GREEN}✓ Created backend/.env from .env.example${NC}"
fi

if [ ! -f "frontend/.env.local" ] && [ -f "frontend/.env.example" ]; then
  cp frontend/.env.example frontend/.env.local
  echo -e "   ${GREEN}✓ Created frontend/.env.local from .env.example${NC}"
fi

# Step 2: Clear Port Conflicts (3000 & 5000)
echo -e "${YELLOW}🧹 Clearing existing processes on ports 3000 and 5000...${NC}"
if command -v powershell.exe >/dev/null 2>&1; then
  powershell.exe -NoProfile -Command "Get-NetTCPConnection -LocalPort 5000,3000 -ErrorAction SilentlyContinue | Select-Object -ExpandProperty OwningProcess | Unique | ForEach-Object { Stop-Process -Id \$_ -Force -ErrorAction SilentlyContinue }" 2>/dev/null || true
fi
npx --yes kill-port 3000 5000 2>/dev/null || true

export NODE_OPTIONS="--max-old-space-size=4096"

BACKEND_PID=""
FRONTEND_PID=""

cleanup() {
  trap - EXIT INT TERM
  echo ""
  echo -e "${MAGENTA}🛑 Stopping BookSaathi servers...${NC}"
  if [ -n "$BACKEND_PID" ]; then
    kill $BACKEND_PID 2>/dev/null || true
  fi
  if [ -n "$FRONTEND_PID" ]; then
    kill $FRONTEND_PID 2>/dev/null || true
  fi
  npx --yes kill-port 3000 5000 2>/dev/null || true
  echo -e "${GREEN}✓ All BookSaathi processes terminated cleanly.${NC}"
  exit 0
}

trap cleanup EXIT INT TERM

# Step 3: Install & Prepare Backend
echo -e "${YELLOW}📦 Checking Backend dependencies...${NC}"
cd "$PROJECT_ROOT/backend"
if [ ! -d "node_modules" ]; then
  npm install
fi

# Optional: Run Tests if requested
if [ "$RUN_TESTS" = true ]; then
  echo -e "${CYAN}🧪 Running Backend test suites...${NC}"
  npm run test:concurrency
  npm run test:payments
  echo -e "${GREEN}✅ Backend tests passed successfully!${NC}"
fi

# Optional: Run Seed if requested
if [ "$RUN_SEED" = true ]; then
  echo -e "${CYAN}🌱 Seeding database with demo data...${NC}"
  npm run seed
fi

# Step 4: Start Backend API
echo -e "${CYAN}🩺 Starting Backend REST API on http://localhost:5000...${NC}"
npm run dev &
BACKEND_PID=$!

# Step 5: Install & Prepare Frontend
echo -e "${YELLOW}💻 Checking Frontend dependencies...${NC}"
cd "$PROJECT_ROOT/frontend"
if [ ! -d "node_modules" ]; then
  npm install
fi

# Optional: Run build check if requested
if [ "$RUN_BUILD" = true ]; then
  echo -e "${CYAN}🔨 Running Frontend production build check...${NC}"
  npm run build
fi

# Step 6: Start Frontend Application
echo -e "${CYAN}🌐 Starting Frontend Web Application on http://localhost:3000...${NC}"
rm -rf .next/cache 2>/dev/null || true
npm run dev &
FRONTEND_PID=$!

cd "$PROJECT_ROOT"

echo ""
echo -e "${BOLD}${GREEN}========================================================${NC}"
echo -e "${BOLD}${GREEN}✅ BookSaathi is running live!${NC}"
echo -e "${BOLD}   - Landing Page:  ${CYAN}http://localhost:3000${NC}"
echo -e "${BOLD}   - Demo Subdomain:${CYAN}http://dr-rajesh.localhost:3000${NC}"
echo -e "${BOLD}   - Dashboard:     ${CYAN}http://localhost:3000/dashboard${NC}"
echo -e "${BOLD}   - QR Banner:     ${CYAN}http://localhost:3000/dashboard/qr-banner${NC}"
echo -e "${BOLD}   - Backend API:   ${CYAN}http://localhost:5000/api/health${NC}"
echo -e "${BOLD}${GREEN}========================================================${NC}"
echo -e "${YELLOW}💡 Press [Ctrl + C] anytime to safely shut down all services.${NC}"
echo ""

# Wait for both background processes
wait $BACKEND_PID $FRONTEND_PID
