#!/bin/bash

# HabibiStay Environment Setup Script
# This script helps configure the environment for deployment

set -e

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Print colored output
print_status() {
    echo -e "${BLUE}[INFO]${NC} $1"
}

print_success() {
    echo -e "${GREEN}[SUCCESS]${NC} $1"
}

print_warning() {
    echo -e "${YELLOW}[WARNING]${NC} $1"
}

print_error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

# Function to check if required tools are installed
check_requirements() {
    print_status "Checking system requirements..."
    
    # Check Node.js
    if ! command -v node &> /dev/null; then
        print_error "Node.js is not installed. Please install Node.js 18+ first."
        exit 1
    fi
    
    local node_version=$(node --version | cut -d'v' -f2 | cut -d'.' -f1)
    if [ "$node_version" -lt 18 ]; then
        print_error "Node.js version 18 or higher is required. Current version: $(node --version)"
        exit 1
    fi
    
    # Check npm
    if ! command -v npm &> /dev/null; then
        print_error "npm is not installed"
        exit 1
    fi
    
    # Check Docker (optional)
    if command -v docker &> /dev/null; then
        print_success "Docker found: $(docker --version)"
    else
        print_warning "Docker not found (optional for local development)"
    fi
    
    print_success "System requirements met"
}

# Function to setup environment file
setup_environment() {
    print_status "Setting up environment configuration..."
    
    if [ ! -f ".env" ]; then
        if [ -f ".env.example" ]; then
            cp .env.example .env
            print_success "Created .env file from .env.example"
        else
            print_error ".env.example file not found"
            exit 1
        fi
    else
        print_warning ".env file already exists"
        read -p "Do you want to overwrite it? (y/N): " -n 1 -r
        echo
        if [[ $REPLY =~ ^[Yy]$ ]]; then
            cp .env.example .env
            print_success "Overwritten .env file"
        fi
    fi
    
    # Generate secure secrets
    print_status "Generating secure secrets..."
    
    JWT_SECRET=$(openssl rand -hex 32)
    SESSION_SECRET=$(openssl rand -hex 32)
    
    # Update .env with generated secrets
    sed -i.bak "s/your_super_secure_jwt_secret_at_least_32_characters_long/$JWT_SECRET/" .env
    sed -i.bak "s/your_session_secret_key_for_csrf_protection_32_chars_min/$SESSION_SECRET/" .env
    rm .env.bak
    
    print_success "Generated JWT and session secrets"
}

# Function to install dependencies
install_dependencies() {
    print_status "Installing dependencies..."
    
    if npm install --legacy-peer-deps; then
        print_success "Dependencies installed successfully"
    else
        print_error "Failed to install dependencies"
        exit 1
    fi
}

# Function to setup database (local development)
setup_database() {
    print_status "Setting up local development database..."
    
    # Check if Docker is available for database setup
    if command -v docker &> /dev/null && command -v docker-compose &> /dev/null; then
        print_status "Starting PostgreSQL with Docker..."
        
        if docker-compose -f docker-compose.dev.yml up -d postgres redis 2>/dev/null; then
            print_success "PostgreSQL and Redis started with Docker"
            
            # Wait for database to be ready
            print_status "Waiting for database to be ready..."
            sleep 5
            
            # Run migrations if available
            if [ -d "migrations" ]; then
                print_status "Running database migrations..."
                npm run migrate 2>/dev/null || print_warning "Migrations not available or failed"
            fi
        else
            print_warning "Could not start database with Docker. Please set up PostgreSQL manually."
        fi
    else
        print_warning "Docker not available. Please set up PostgreSQL manually:"
        echo "1. Install PostgreSQL 15+"
        echo "2. Create database 'habibistay'"
        echo "3. Update DB_URL in .env file"
        echo "4. Run 'npm run migrate' to set up tables"
    fi
}

# Function to validate configuration
validate_config() {
    print_status "Validating configuration..."
    
    # Check if required environment variables are set
    source .env
    
    local required_vars=("DB_URL" "JWT_SECRET" "SESSION_SECRET")
    local missing_vars=()
    
    for var in "${required_vars[@]}"; do
        if [ -z "${!var}" ]; then
            missing_vars+=("$var")
        fi
    done
    
    if [ ${#missing_vars[@]} -gt 0 ]; then
        print_error "Missing required environment variables:"
        for var in "${missing_vars[@]}"; do
            echo "  - $var"
        done
        print_warning "Please update .env file with actual values"
    else
        print_success "Basic configuration is valid"
    fi
}

# Function to build the project
build_project() {
    print_status "Building project..."
    
    if npm run type-check; then
        print_success "TypeScript compilation successful"
    else
        print_error "TypeScript compilation failed"
        exit 1
    fi
    
    if npm run build; then
        print_success "Project build successful"
    else
        print_error "Project build failed"
        exit 1
    fi
}

# Function to run tests
run_tests() {
    print_status "Running tests..."
    
    if npm run test:run; then
        print_success "All tests passed"
    else
        print_warning "Some tests failed. Check output above."
    fi
}

# Function to print next steps
print_next_steps() {
    print_success "Setup completed successfully!"
    echo
    echo -e "${BLUE}Next Steps:${NC}"
    echo "1. Update .env file with your actual API keys and configuration"
    echo "2. Start development server: npm run dev"
    echo "3. Visit http://localhost:5173 to access the setup wizard"
    echo "4. For production deployment, see DEPLOYMENT.md"
    echo
    echo -e "${BLUE}Required API Keys:${NC}"
    echo "- OpenAI API key for AI chat features"
    echo "- MyFatoorah API key for payments"
    echo "- @getmocha OAuth credentials"
    echo "- Email provider API keys (Resend/SendGrid)"
    echo
    echo -e "${BLUE}Optional Configuration:${NC}"
    echo "- PayPal credentials for additional payment options"
    echo "- Cloudflare R2/AWS S3 for file uploads"
    echo "- Sentry DSN for error tracking"
}

# Main execution
main() {
    echo -e "${GREEN}==================================${NC}"
    echo -e "${GREEN}  HabibiStay Environment Setup    ${NC}"
    echo -e "${GREEN}==================================${NC}"
    echo
    
    check_requirements
    setup_environment
    install_dependencies
    setup_database
    validate_config
    build_project
    run_tests
    print_next_steps
}

# Run main function if script is executed directly
if [[ "${BASH_SOURCE[0]}" == "${0}" ]]; then
    main "$@"
fi