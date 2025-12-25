import { describe, it, expect } from '@jest/globals';
import fs from 'fs';
import path from 'path';

describe('Application Integration Tests', () => {
  describe('Configuration Files', () => {
    it('should have package.json', () => {
      const packagePath = path.join(process.cwd(), 'package.json');
      expect(fs.existsSync(packagePath)).toBe(true);
      
      const pkg = JSON.parse(fs.readFileSync(packagePath, 'utf-8'));
      expect(pkg.name).toBe('yield-shop');
      expect(pkg.type).toBe('module');
    });

    it('should have tsconfig.json', () => {
      const tsconfigPath = path.join(process.cwd(), 'tsconfig.json');
      expect(fs.existsSync(tsconfigPath)).toBe(true);
    });

    it('should have next.config.ts', () => {
      const nextConfigPath = path.join(process.cwd(), 'next.config.ts');
      expect(fs.existsSync(nextConfigPath)).toBe(true);
    });

    it('should have hardhat.config.ts', () => {
      const hardhatConfigPath = path.join(process.cwd(), 'hardhat.config.ts');
      expect(fs.existsSync(hardhatConfigPath)).toBe(true);
    });
  });

  describe('Component Files', () => {
    it('should have Hero component', () => {
      const heroPath = path.join(process.cwd(), 'components', 'Hero.tsx');
      expect(fs.existsSync(heroPath)).toBe(true);
    });

    it('should have Features component', () => {
      const featuresPath = path.join(process.cwd(), 'components', 'Features.tsx');
      expect(fs.existsSync(featuresPath)).toBe(true);
    });

    it('should have UserStats component', () => {
      const userStatsPath = path.join(process.cwd(), 'components', 'UserStats.tsx');
      expect(fs.existsSync(userStatsPath)).toBe(true);
    });

    it('should have WalletTracker component', () => {
      const walletTrackerPath = path.join(process.cwd(), 'components', 'WalletTracker.tsx');
      expect(fs.existsSync(walletTrackerPath)).toBe(true);
    });

    it('should have Navbar component', () => {
      const navbarPath = path.join(process.cwd(), 'components', 'Navbar.tsx');
      expect(fs.existsSync(navbarPath)).toBe(true);
    });

    it('should have Footer component', () => {
      const footerPath = path.join(process.cwd(), 'components', 'Footer.tsx');
      expect(fs.existsSync(footerPath)).toBe(true);
    });
  });

  describe('App Pages', () => {
    it('should have root page', () => {
      const pagePath = path.join(process.cwd(), 'app', 'page.tsx');
      expect(fs.existsSync(pagePath)).toBe(true);
    });

    it('should have layout', () => {
      const layoutPath = path.join(process.cwd(), 'app', 'layout.tsx');
      expect(fs.existsSync(layoutPath)).toBe(true);
    });

    it('should have bridge page', () => {
      const bridgePath = path.join(process.cwd(), 'app', 'bridge', 'page.tsx');
      expect(fs.existsSync(bridgePath)).toBe(true);
    });

    it('should have loans page', () => {
      const loansPath = path.join(process.cwd(), 'app', 'loans', 'page.tsx');
      expect(fs.existsSync(loansPath)).toBe(true);
    });

    it('should have shop page', () => {
      const shopPath = path.join(process.cwd(), 'app', 'shop', 'page.tsx');
      expect(fs.existsSync(shopPath)).toBe(true);
    });
  });

  describe('Lib Files', () => {
    it('should have Supabase client', () => {
      const supabasePath = path.join(process.cwd(), 'lib', 'supabase.ts');
      expect(fs.existsSync(supabasePath)).toBe(true);
      
      const content = fs.readFileSync(supabasePath, 'utf-8');
      expect(content).toContain('createClient');
      expect(content).toContain('saveWalletConnection');
      expect(content).toContain('getLocationFromIP');
    });
  });

  describe('Contract Files', () => {
    it('should have yield_shop.sol', () => {
      const contractPath = path.join(process.cwd(), 'contract', 'yield_shop.sol');
      expect(fs.existsSync(contractPath)).toBe(true);
    });
  });

  describe('Documentation', () => {
    it('should have README.md', () => {
      const readmePath = path.join(process.cwd(), 'README.md');
      expect(fs.existsSync(readmePath)).toBe(true);
    });

    it('should have TEST_GUIDE.md', () => {
      const testGuidePath = path.join(process.cwd(), 'TEST_GUIDE.md');
      expect(fs.existsSync(testGuidePath)).toBe(true);
    });
  });

  describe('Dependencies Check', () => {
    it('should have required dependencies installed', () => {
      const packagePath = path.join(process.cwd(), 'package.json');
      const pkg = JSON.parse(fs.readFileSync(packagePath, 'utf-8'));
      
      // Check production dependencies
      expect(pkg.dependencies).toHaveProperty('next');
      expect(pkg.dependencies).toHaveProperty('react');
      expect(pkg.dependencies).toHaveProperty('wagmi');
      expect(pkg.dependencies).toHaveProperty('viem');
      expect(pkg.dependencies).toHaveProperty('@supabase/supabase-js');
      expect(pkg.dependencies).toHaveProperty('@tanstack/react-query');
    });

    it('should have required dev dependencies installed', () => {
      const packagePath = path.join(process.cwd(), 'package.json');
      const pkg = JSON.parse(fs.readFileSync(packagePath, 'utf-8'));
      
      // Check dev dependencies
      expect(pkg.devDependencies).toHaveProperty('typescript');
      expect(pkg.devDependencies).toHaveProperty('hardhat');
      expect(pkg.devDependencies).toHaveProperty('jest');
    });
  });

  describe('Build Readiness', () => {
    it('should have test scripts configured', () => {
      const packagePath = path.join(process.cwd(), 'package.json');
      const pkg = JSON.parse(fs.readFileSync(packagePath, 'utf-8'));
      
      expect(pkg.scripts).toHaveProperty('test');
      expect(pkg.scripts).toHaveProperty('test:contracts');
      expect(pkg.scripts).toHaveProperty('test:database');
      expect(pkg.scripts).toHaveProperty('test:integration');
    });

    it('should have build scripts configured', () => {
      const packagePath = path.join(process.cwd(), 'package.json');
      const pkg = JSON.parse(fs.readFileSync(packagePath, 'utf-8'));
      
      expect(pkg.scripts).toHaveProperty('build');
      expect(pkg.scripts).toHaveProperty('dev');
      expect(pkg.scripts).toHaveProperty('start');
    });
  });
});
