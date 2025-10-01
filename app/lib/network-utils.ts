/**
 * Utilitaires pour gérer les réseaux blockchain
 */

export const ARBITRUM_SEPOLIA_CONFIG = {
  chainId: "0x66eee", // 421614 en hexadécimal
  chainName: "Arbitrum Sepolia",
  nativeCurrency: {
    name: "Ethereum",
    symbol: "ETH",
    decimals: 18,
  },
  rpcUrls: ["https://sepolia-rollup.arbitrum.io/rpc"],
  blockExplorerUrls: ["https://sepolia.arbiscan.io"],
}

// Aussi supporter Ethereum Sepolia comme alternative
export const ETHEREUM_SEPOLIA_CONFIG = {
  chainId: "0xaa36a7", // 11155111 en hexadécimal
  chainName: "Ethereum Sepolia",
  nativeCurrency: {
    name: "Ethereum",
    symbol: "ETH",
    decimals: 18,
  },
  rpcUrls: ["https://rpc.sepolia.org"],
  blockExplorerUrls: ["https://sepolia.etherscan.io"],
}

/**
 * Change le réseau vers Ethereum Sepolia (plus compatible avec Human Wallet)
 * Si le réseau n'existe pas, il sera ajouté automatiquement
 */
export async function switchToArbitrumSepolia(): Promise<boolean> {
  if (typeof window === "undefined") {
    return false
  }

  const provider = window.silk || window.ethereum

  if (!provider) {
    console.error("No wallet provider found")
    return false
  }

  try {
    console.log("Attempting to switch to Ethereum Sepolia...")
    
    // Utiliser Ethereum Sepolia car plus compatible avec Human Wallet
    await provider.request({
      method: "wallet_addEthereumChain",
      params: [ETHEREUM_SEPOLIA_CONFIG],
    })
    
    console.log("Successfully added/switched to Ethereum Sepolia")
    return true
  } catch (error: any) {
    console.error("Error switching to Ethereum Sepolia:", error)
    return false
  }
}

/**
 * Vérifie si l'utilisateur est sur le bon réseau (Ethereum Sepolia)
 */
export async function isOnArbitrumSepolia(): Promise<boolean> {
  if (typeof window === "undefined") {
    return false
  }

  const provider = window.silk || window.ethereum

  if (!provider) {
    return false
  }

  try {
    const chainId = await provider.request({ method: "eth_chainId" })
    return chainId === ETHEREUM_SEPOLIA_CONFIG.chainId
  } catch (error) {
    console.error("Error checking network:", error)
    return false
  }
}

/**
 * Demande à l'utilisateur de changer de réseau si nécessaire
 */
export async function ensureArbitrumSepolia(): Promise<boolean> {
  const isCorrectNetwork = await isOnArbitrumSepolia()
  
  if (isCorrectNetwork) {
    return true
  }
  
  console.log("Wrong network detected, attempting to switch...")
  return await switchToArbitrumSepolia()
}

