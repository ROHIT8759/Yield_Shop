import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  webpack: (config, { isServer }) => {
    if (!isServer) {
      config.resolve.fallback = {
        ...config.resolve.fallback,
        fs: false,
        net: false,
        tls: false,
      };
    }
    config.externals.push(
      'pino-pretty', 
      'lokijs', 
      'encoding',
      '@base-org/account',
      '@coinbase/wallet-sdk',
      '@gemini-wallet/core',
      '@safe-global/safe-apps-sdk',
      '@safe-global/safe-apps-provider',
      '@walletconnect/ethereum-provider',
      'porto',
      'porto/internal',
      '@react-native-async-storage/async-storage',
      'react-native',
      'react-native-webview',
      '@metamask/sdk'
    );
    return config;
  },
};

export default nextConfig;
