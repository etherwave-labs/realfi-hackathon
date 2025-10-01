import { ethers } from "ethers"

// Adresse du contrat USDC sur Ethereum Sepolia testnet (pour le développement)
// En production, utiliser l'adresse mainnet selon le réseau :
// - Ethereum: 0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48
// - Arbitrum: 0xaf88d065e77c8cC2239327C5EDb3A432268e5831
// - Base: 0x833589fCD6eDb6E08f4c7C32D4f71b54bdA02913
export const USDC_CONTRACT_ADDRESS = "0x1c7D4B196Cb0C7B01d743Fbc6116a902379C7238" // USDC sur Ethereum Sepolia

// ABI complet pour les transfers ERC20
export const USDC_ABI = [
  {
    constant: false,
    inputs: [
      { name: "_to", type: "address" },
      { name: "_value", type: "uint256" },
    ],
    name: "transfer",
    outputs: [{ name: "", type: "bool" }],
    type: "function",
  },
  {
    constant: true,
    inputs: [{ name: "_owner", type: "address" }],
    name: "balanceOf",
    outputs: [{ name: "balance", type: "uint256" }],
    type: "function",
  },
  {
    constant: true,
    inputs: [],
    name: "decimals",
    outputs: [{ name: "", type: "uint8" }],
    type: "function",
  },
  {
    constant: true,
    inputs: [],
    name: "symbol",
    outputs: [{ name: "", type: "string" }],
    type: "function",
  },
]

export interface PaymentParams {
  recipientAddress: string
  amountUSDC: number
  provider: any // ethers provider from wallet
}

export interface PaymentResult {
  success: boolean
  transactionHash?: string
  error?: string
}

/**
 * Transfère des USDC vers le wallet de l'organisateur
 */
export async function sendUSDCPayment(params: PaymentParams): Promise<PaymentResult> {
  try {
    const { recipientAddress, amountUSDC, provider } = params

    // Vérifier que l'adresse du destinataire est valide
    if (!recipientAddress) {
      throw new Error("Recipient address is missing")
    }

    // Étape 1: Vérifier si c'est une adresse valide (sans checksum strict)
    if (!ethers.isAddress(recipientAddress)) {
      console.error("❌ Not a valid Ethereum address:", recipientAddress)
      throw new Error(`Invalid Ethereum address: ${recipientAddress}`)
    }

    // Étape 2: Normaliser l'adresse au format checksum correct
    // getAddress() convertit n'importe quelle adresse valide au format checksum EIP-55
    const normalizedAddress = ethers.getAddress(recipientAddress)

    // Vérifier le réseau avant de continuer
    const network = await provider.getNetwork()
    const chainId = Number(network.chainId)
    // Ethereum Sepolia = 11155111
    if (chainId !== 11155111) {
      throw new Error("Please switch to Ethereum Sepolia network (Chain ID: 11155111)")
    }

    // Créer un signer à partir du provider
    const signer = await provider.getSigner()

    // Créer l'instance du contrat USDC
    const usdcContract = new ethers.Contract(USDC_CONTRACT_ADDRESS, USDC_ABI, signer)

    // Convertir le montant en unités USDC (6 décimales)
    const amount = ethers.parseUnits(amountUSDC.toString(), 6)

    console.log("Sending payment:", {
      to: normalizedAddress,
      amount: amountUSDC,
      amountWei: amount.toString(),
    })

    // Vérifier le solde avant de transférer
    const userAddress = await signer.getAddress()
    
    // Vérifier le solde ETH EN PREMIER (pour les gas fees)
    const ethBalance = await provider.getBalance(userAddress)
    
    const minEthRequired = ethers.parseEther("0.001") // Minimum 0.001 ETH requis
    if (ethBalance < minEthRequired) {
      throw new Error(`❌ Vous n'avez pas assez d'ETH pour payer les frais de transaction. Vous avez ${ethers.formatEther(ethBalance)} ETH, minimum requis : 0.001 ETH. Obtenez des ETH gratuits sur https://sepoliafaucet.com/`)
    }
    
    // Vérifier le solde USDC
    const balance = await usdcContract.balanceOf(userAddress)

    if (balance < amount) {
      throw new Error("Insufficient USDC balance")
    }

    // Effectuer le transfert avec Human Wallet
    // Encoder les données de la fonction transfer
    const transferData = usdcContract.interface.encodeFunctionData("transfer", [
      normalizedAddress,
      amount,
    ])

    // Envoyer la transaction via window.silk (Human Wallet)
    let txHash: string
    
    if (typeof window !== "undefined" && window.silk) {
      // @ts-ignore
      txHash = await window.silk.request({
        method: "eth_sendTransaction",
        params: [
          {
            from: userAddress,
            to: USDC_CONTRACT_ADDRESS,
            data: transferData,
            value: "0x0", // Pas d'ETH envoyé, juste des tokens
          },
        ],
      })
      console.log("✅ Transaction réussie:", txHash)
    } else {
      // Fallback avec ethers (si pas Human Wallet)
      const tx = await usdcContract.transfer(normalizedAddress, amount)
      txHash = tx.hash
      await tx.wait()
      console.log("✅ Transaction réussie:", txHash)
    }

    return {
      success: true,
      transactionHash: txHash,
    }
  } catch (error: any) {
    console.error("Payment error:", error)
    return {
      success: false,
      error: error.message || "Payment failed",
    }
  }
}

/**
 * Obtient le solde USDC d'une adresse
 */
export async function getUSDCBalance(address: string, provider: any): Promise<string> {
  try {
    // Vérifier le réseau
    const network = await provider.getNetwork()
    console.log("Current network:", network)
    
    // Ethereum Sepolia chainId = 11155111
    const chainId = Number(network.chainId)
    if (chainId !== 11155111) {
      console.warn("Wrong network. Please switch to Ethereum Sepolia (Chain ID: 11155111)")
      return "0 (Wrong Network)"
    }

    const usdcContract = new ethers.Contract(USDC_CONTRACT_ADDRESS, USDC_ABI, provider)
    const balance = await usdcContract.balanceOf(address)
    return ethers.formatUnits(balance, 6)
  } catch (error: any) {
    console.error("Error getting balance:", error)
    // Si c'est une erreur de réseau, retourner un message informatif
    if (error.message?.includes("could not decode")) {
      return "N/A"
    }
    return "0"
  }
}

/**
 * Obtient un provider Ethereum depuis window.ethereum ou Human Wallet
 */
export function getEthereumProvider(): any {
  if (typeof window === "undefined") {
    return null
  }

  // Essayer d'abord Human Wallet (silk)
  if (window.silk) {
    return new ethers.BrowserProvider(window.silk as any)
  }

  // Sinon utiliser window.ethereum (MetaMask, etc.)
  if (window.ethereum) {
    return new ethers.BrowserProvider(window.ethereum as any)
  }

  return null
}

// Types pour window
declare global {
  interface Window {
    ethereum?: any
  }
}

