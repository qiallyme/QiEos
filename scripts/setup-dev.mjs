#!/usr/bin/env node

/**
 * QiEOS Development Setup Script
 * Sets up the development environment and validates configuration
 */

import { readFileSync, writeFileSync, existsSync } from 'fs';
import { execSync } from 'child_process';
import path from 'path';

const colors = {
  green: '\x1b[32m',
  red: '\x1b[31m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  reset: '\x1b[0m',
  bold: '\x1b[1m'
};

function log(message, color = 'reset') {
  console.log(`${colors[color]}${message}${colors.reset}`);
}

function checkCommand(command) {
  try {
    execSync(`which ${command}`, { stdio: 'ignore' });
    return true;
  } catch {
    return false;
  }
}

function checkFile(filePath) {
  return existsSync(filePath);
}

async function main() {
  log('🚀 QiEOS Development Setup', 'bold');
  log('============================', 'blue');

  // Check prerequisites
  log('\n📋 Checking Prerequisites...', 'bold');

  const checks = [
    { name: 'Node.js 18+', check: () => checkCommand('node') },
    { name: 'pnpm', check: () => checkCommand('pnpm') },
    { name: 'Git', check: () => checkCommand('git') },
    { name: 'Wrangler CLI', check: () => checkCommand('wrangler') }
  ];

  let allGood = true;
  for (const { name, check } of checks) {
    if (check()) {
      log(`✅ ${name}`, 'green');
    } else {
      log(`❌ ${name} - Please install this first`, 'red');
      allGood = false;
    }
  }

  if (!allGood) {
    log('\n❌ Please install missing prerequisites before continuing', 'red');
    process.exit(1);
  }

  // Check project structure
  log('\n📁 Checking Project Structure...', 'bold');

  const requiredFiles = [
    'package.json',
    'pnpm-workspace.yaml',
    'apps/web/package.json',
    'workers/api/package.json',
    'packages/ui/package.json',
    'packages/types/package.json',
    'packages/utils/package.json'
  ];

  for (const file of requiredFiles) {
    if (checkFile(file)) {
      log(`✅ ${file}`, 'green');
    } else {
      log(`❌ ${file} - Missing required file`, 'red');
      allGood = false;
    }
  }

  if (!allGood) {
    log('\n❌ Project structure is incomplete', 'red');
    process.exit(1);
  }

  // Install dependencies
  log('\n📦 Installing Dependencies...', 'bold');
  try {
    execSync('pnpm install', { stdio: 'inherit' });
    log('✅ Dependencies installed', 'green');
  } catch (error) {
    log('❌ Failed to install dependencies', 'red');
    process.exit(1);
  }

  // Build packages
  log('\n🔨 Building Packages...', 'bold');
  try {
    execSync('pnpm build', { stdio: 'inherit' });
    log('✅ Packages built successfully', 'green');
  } catch (error) {
    log('❌ Failed to build packages', 'red');
    process.exit(1);
  }

  // Check environment files
  log('\n🔧 Environment Configuration...', 'bold');

  const envFiles = [
    { path: 'infra/cloudflare/env.example', name: 'Cloudflare Environment' },
    { path: 'apps/web/.env.example', name: 'Web App Environment' },
    { path: 'workers/api/.env.example', name: 'Worker Environment' }
  ];

  for (const { path: envPath, name } of envFiles) {
    if (checkFile(envPath)) {
      log(`✅ ${name} template exists`, 'green');
      log(`   Copy ${envPath} to .env and fill in your values`, 'yellow');
    } else {
      log(`⚠️  ${name} template missing - you may need to create this manually`, 'yellow');
    }
  }

  // Database setup instructions
  log('\n🗄️  Database Setup...', 'bold');
  log('To set up your Supabase database:', 'blue');
  log('1. Create a new Supabase project', 'blue');
  log('2. Run the SQL script: scripts/create-migrations.sql', 'blue');
  log('3. Update your environment variables with Supabase credentials', 'blue');

  // Cloudflare setup instructions
  log('\n☁️  Cloudflare Setup...', 'bold');
  log('To set up Cloudflare:', 'blue');
  log('1. Create Cloudflare account and get API token', 'blue');
  log('2. Create R2 buckets: qieos-files and qieos-files-dev', 'blue');
  log('3. Set up wrangler secrets: wrangler secret put SUPABASE_URL', 'blue');
  log('4. Deploy worker: pnpm --filter qieos-api deploy', 'blue');

  // Development commands
  log('\n🚀 Development Commands...', 'bold');
  log('Start development servers:', 'blue');
  log('  pnpm dev                    # Start all services', 'blue');
  log('  pnpm --filter qieos-web dev # Web app only', 'blue');
  log('  pnpm --filter qieos-api dev # Worker only', 'blue');

  log('\nBuild and deploy:', 'blue');
  log('  pnpm build                  # Build all packages', 'blue');
  log('  pnpm --filter qieos-web build # Build web app', 'blue');
  log('  pnpm --filter qieos-api deploy # Deploy worker', 'blue');

  // Validation checklist
  log('\n✅ Setup Complete!', 'green');
  log('\n📋 Next Steps Checklist:', 'bold');
  log('□ Set up Supabase project and run migrations', 'blue');
  log('□ Configure Cloudflare and deploy worker', 'blue');
  log('□ Set up environment variables', 'blue');
  log('□ Test authentication flow', 'blue');
  log('□ Deploy web app to Cloudflare Pages', 'blue');

  log('\n🎉 Happy coding!', 'green');
}

main().catch(console.error);
