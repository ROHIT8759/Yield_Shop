import { http, createConfig } from 'wagmi'
import { mainnet, polygon, arbitrum, mantle, mantleTestnet } from 'wagmi/chains'
import { injected } from 'wagmi/connectors'

export const config = createConfig({
  chains: [mantleTestnet, mantle, mainnet, polygon, arbitrum],
  connectors: [
    injected(),
  ],
  transports: {
    [mantleTestnet.id]: http(),
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
