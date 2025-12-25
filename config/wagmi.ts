import { http, createConfig } from 'wagmi'
import { mainnet, polygon, arbitrum, mantle, mantleSepoliaTestnet } from 'wagmi/chains'
import { injected } from 'wagmi/connectors'

export const config = createConfig({
  chains: [mantleSepoliaTestnet, mantle, mainnet, polygon, arbitrum],
  connectors: [
    injected(),
  ],
  transports: {
    [mantleSepoliaTestnet.id]: http(),
    [mantle.id]: http(),
    [mainnet.id]: http(),
    [polygon.id]: http(),
    [arbitrum.id]: http(),
  },
})

declare module 'wagmi' {
  interface Register {
    config: typeof config
  }
}
