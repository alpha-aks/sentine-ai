#!/usr/bin/env bash

# ==============================================================================
# SentinelAI Startup & Dependency Setup Script
# ==============================================================================

set -e # Exit immediately if a command exits with a non-zero status

# Text Formatting Colors
GREEN='\033[0;32m'
BLUE='\033[0;34m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m' # No Color

echo -e "${BLUE}=== SentinelAI Automation Script ===${NC}"

# Check for required commands
command -v node >/dev/null 2>&1 || { echo -e "${RED}Error: Node.js is required but not installed.${NC}" >&2; exit 1; }
command -v python3 >/dev/null 2>&1 || { echo -e "${RED}Error: Python3 is required but not installed.${NC}" >&2; exit 1; }
command -v curl >/dev/null 2>&1 || { echo -e "${RED}Error: curl is required but not installed.${NC}" >&2; exit 1; }

echo -e "\n${YELLOW}[1/5] Installing Monorepo Dependencies...${NC}"
npm install

echo -e "\n${YELLOW}[2/5] Building Helper Packages...${NC}"
npx turbo run build --filter="@sentinel-ai/*"

echo -e "\n${YELLOW}[3/5] Database Initialization Check...${NC}"
echo -e "${GREEN}PostgreSQL database schema will be auto-initialized on service boot.${NC}"

echo -e "\n${YELLOW}[4/5] Configuring Python Environment for Vision Guard...${NC}"
cd services/vision-guard-service

# Create virtual environment if it does not exist
if [ ! -d "venv" ]; then
    echo -e "${BLUE}Creating Python Virtual Environment (venv)...${NC}"
    python3 -m venv venv
fi

# Activate virtual environment
source venv/bin/activate

# Install lightweight CPU-only PyTorch and deep learning dependencies
echo -e "${BLUE}Installing lightweight CPU-only PyTorch & dependencies...${NC}"
pip install --upgrade pip
pip install torch torchvision --index-url https://download.pytorch.org/whl/cpu
pip install ultralytics opencv-python-headless mediapipe numpy

# Download ONNX pre-trained weights if missing
mkdir -p models
if [ ! -f "models/yolov8n.onnx" ]; then
    echo -e "${BLUE}Downloading pre-trained YOLOv8 ONNX weights...${NC}"
    curl -L -o models/yolov8n.onnx https://github.com/ultralytics/assets/releases/download/v8.2.0/yolov8n.onnx
else
    echo -e "${GREEN}YOLOv8 ONNX weights already present.${NC}"
fi

# Deactivate venv and return to root
deactivate
cd ../..

echo -e "\n${YELLOW}[5/5] Ready to Start Services!${NC}"
echo -e "Choose how you want to run the platform:"
echo -e "  1. Run in developer-mode (Parallel logs using Turborepo)"
echo -e "  2. Run in background (PM2 Process Manager daemon)"
echo -e "  3. Exit script"
read -rp "Enter choice [1-3]: " choice

case $choice in
    1)
        echo -e "\n${GREEN}Starting all microservices and dashboards in parallel...${NC}"
        npm run dev
        ;;
    2)
        command -v pm2 >/dev/null 2>&1 || { 
            echo -e "${YELLOW}PM2 is not installed globally. Installing globally...${NC}"
            npm install -g pm2
        }
        echo -e "\n${GREEN}Compiling final assets and starting PM2 ecosystem...${NC}"
        npx turbo run build
        pm2 start ecosystem.config.js
        pm2 list
        echo -e "\n${GREEN}All services successfully started in the background.${NC}"
        echo -e "To view logs, run: ${BLUE}pm2 logs${NC}"
        echo -e "To stop services, run: ${BLUE}pm2 stop all${NC}"
        ;;
    *)
        echo -e "\n${GREEN}Setup completed successfully! Exiting.${NC}"
        exit 0
        ;;
esac
