import { ethers } from "ethers"

async function sendTransactionViaHumanWallet(params: {
  from: string
  to: string
  data: string
  value: string
}): Promise<string> {
  if (typeof window === "undefined" || !window.waap) {
    throw new Error("Human Wallet non disponible")
  }

  try {
    // @ts-ignore
    const txHash = await window.waap.request({
      method: "eth_sendTransaction",
      params: [{ ...params, type: "0x1" }],
    })
    console.log("✅ Transaction envoyée (legacy type 0x1)")
    return txHash
  } catch (error: any) {
    console.log("⚠️ Type 0x1 échoué, essai sans type...")
    // @ts-ignore
    const txHash = await window.waap.request({
      method: "eth_sendTransaction",
      params: [params],
    })
    console.log("✅ Transaction envoyée (auto)")
    return txHash
  }
}

export const ESCROW_CONTRACT_ADDRESS = "0x286Ff160BB78e7D897eD137D5767FA123cFc7b8b"

export const USDC_TOKEN_ADDRESS = "0x1c7D4B196Cb0C7B01d743Fbc6116a902379C7238"

export const ERC20_ABI = [
  {
    inputs: [
      { name: "spender", type: "address" },
      { name: "amount", type: "uint256" },
    ],
    name: "approve",
    outputs: [{ name: "", type: "bool" }],
    stateMutability: "nonpayable",
    type: "function",
  },
  {
    inputs: [
      { name: "owner", type: "address" },
      { name: "spender", type: "address" },
    ],
    name: "allowance",
    outputs: [{ name: "", type: "uint256" }],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [{ name: "account", type: "address" }],
    name: "balanceOf",
    outputs: [{ name: "", type: "uint256" }],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [],
    name: "decimals",
    outputs: [{ name: "", type: "uint8" }],
    stateMutability: "view",
    type: "function",
  },
]

export const ESCROW_ABI = [
  {
    inputs: [
      { name: "_eventId", type: "uint256" },
      { name: "_ticketPrice", type: "uint256" },
      { name: "_eventEndTime", type: "uint256" },
      { name: "_redistributionPercentage", type: "uint256" },
    ],
    name: "createEvent",
    outputs: [],
    stateMutability: "nonpayable",
    type: "function",
  },
  {
    inputs: [{ name: "_eventId", type: "uint256" }],
    name: "purchaseTicket",
    outputs: [],
    stateMutability: "nonpayable",
    type: "function",
  },
  {
    inputs: [
      { name: "_eventId", type: "uint256" },
      { name: "_participant", type: "address" },
    ],
    name: "markAttendance",
    outputs: [],
    stateMutability: "nonpayable",
    type: "function",
  },
  {
    inputs: [
      { name: "_eventId", type: "uint256" },
      { name: "_participants", type: "address[]" },
    ],
    name: "markAttendanceBatch",
    outputs: [],
    stateMutability: "nonpayable",
    type: "function",
  },
  {
    inputs: [{ name: "_eventId", type: "uint256" }],
    name: "finalizeEvent",
    outputs: [],
    stateMutability: "nonpayable",
    type: "function",
  },
  {
    inputs: [{ name: "_eventId", type: "uint256" }],
    name: "withdrawRedistribution",
    outputs: [],
    stateMutability: "nonpayable",
    type: "function",
  },
  {
    inputs: [{ name: "_eventId", type: "uint256" }],
    name: "cancelEvent",
    outputs: [],
    stateMutability: "nonpayable",
    type: "function",
  },
  {
    inputs: [{ name: "_eventId", type: "uint256" }],
    name: "getEventInfo",
    outputs: [
      { name: "organizer", type: "address" },
      { name: "ticketPrice", type: "uint256" },
      { name: "eventEndTime", type: "uint256" },
      { name: "redistributionPercentage", type: "uint256" },
      { name: "totalFunds", type: "uint256" },
      { name: "isFinalized", type: "bool" },
      { name: "participantCount", type: "uint256" },
    ],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [
      { name: "_eventId", type: "uint256" },
      { name: "_participant", type: "address" },
    ],
    name: "getParticipantInfo",
    outputs: [
      { name: "hasPaid", type: "bool" },
      { name: "hasAttended", type: "bool" },
      { name: "hasWithdrawn", type: "bool" },
      { name: "amountPaid", type: "uint256" },
    ],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [{ name: "_eventId", type: "uint256" }],
    name: "getEventStats",
    outputs: [
      { name: "totalParticipants", type: "uint256" },
      { name: "attendeeCount", type: "uint256" },
      { name: "absenteeCount", type: "uint256" },
      { name: "totalAbsenteeFunds", type: "uint256" },
      { name: "redistributionAmount", type: "uint256" },
    ],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [
      { name: "_eventId", type: "uint256" },
      { name: "_participant", type: "address" },
    ],
    name: "calculatePotentialRedistribution",
    outputs: [{ name: "", type: "uint256" }],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [{ name: "_eventId", type: "uint256" }],
    name: "getParticipants",
    outputs: [{ name: "", type: "address[]" }],
    stateMutability: "view",
    type: "function",
  },
  {
    anonymous: false,
    inputs: [
      { indexed: true, name: "eventId", type: "uint256" },
      { indexed: true, name: "organizer", type: "address" },
      { indexed: false, name: "ticketPrice", type: "uint256" },
      { indexed: false, name: "eventEndTime", type: "uint256" },
      { indexed: false, name: "redistributionPercentage", type: "uint256" },
    ],
    name: "EventCreated",
    type: "event",
  },
  {
    anonymous: false,
    inputs: [
      { indexed: true, name: "eventId", type: "uint256" },
      { indexed: true, name: "participant", type: "address" },
      { indexed: false, name: "amount", type: "uint256" },
    ],
    name: "TicketPurchased",
    type: "event",
  },
  {
    anonymous: false,
    inputs: [
      { indexed: true, name: "eventId", type: "uint256" },
      { indexed: true, name: "participant", type: "address" },
    ],
    name: "AttendanceMarked",
    type: "event",
  },
  {
    anonymous: false,
    inputs: [
      { indexed: true, name: "eventId", type: "uint256" },
      { indexed: false, name: "totalRedistributed", type: "uint256" },
      { indexed: false, name: "attendeeCount", type: "uint256" },
    ],
    name: "FundsRedistributed",
    type: "event",
  },
  {
    anonymous: false,
    inputs: [
      { indexed: true, name: "eventId", type: "uint256" },
      { indexed: true, name: "organizer", type: "address" },
      { indexed: false, name: "amount", type: "uint256" },
    ],
    name: "OrganizerPaid",
    type: "event",
  },
]

export interface EscrowEventInfo {
  organizer: string
  ticketPrice: bigint
  eventEndTime: bigint
  redistributionPercentage: bigint
  totalFunds: bigint
  isFinalized: boolean
  participantCount: bigint
}

export interface EscrowParticipantInfo {
  hasPaid: boolean
  hasAttended: boolean
  hasWithdrawn: boolean
  amountPaid: bigint
}

export interface EscrowEventStats {
  totalParticipants: bigint
  attendeeCount: bigint
  absenteeCount: bigint
  totalAbsenteeFunds: bigint
  redistributionAmount: bigint
}

/**
 * Obtenir une instance du contrat EventEscrow
 */
export function getEscrowContract(provider: any, withSigner = false) {
  if (withSigner) {
    return new ethers.Contract(ESCROW_CONTRACT_ADDRESS, ESCROW_ABI, provider)
  }
  return new ethers.Contract(ESCROW_CONTRACT_ADDRESS, ESCROW_ABI, provider)
}

/**
 * NOTE: La fonction getLegacyTxOverrides a été supprimée car elle causait des erreurs
 * avec le provider Human Wallet. Nous utilisons maintenant une approche "fire-and-forget"
 * sans overrides de transaction pour maximiser la compatibilité.
 */

/**
 * Créer un événement sur la blockchain (avec support Human Wallet)
 */
export async function createEventOnChain(
  eventId: string,
  ticketPriceUSDC: number,
  eventEndTimestamp: number,
  redistributionPercentage: number,
  provider: any
): Promise<{ success: boolean; txHash?: string; error?: string }> {
  try {
    const signer = await provider.getSigner()
    const userAddress = await signer.getAddress()
    const contract = new ethers.Contract(ESCROW_CONTRACT_ADDRESS, ESCROW_ABI, signer)

    const numericEventId = parseInt(eventId.replace(/\D/g, '')) || parseInt(eventId) || Date.now()
    
    const ticketPriceUSDCUnits = ethers.parseUnits(ticketPriceUSDC.toString(), 6)

    console.log("Creating event on chain:", {
      originalEventId: eventId,
      numericEventId,
      ticketPriceUSDC: ticketPriceUSDC + " USDC",
      ticketPriceUSDCUnits: ticketPriceUSDCUnits.toString(),
      eventEndTimestamp,
      redistributionPercentage,
      contractAddress: ESCROW_CONTRACT_ADDRESS
    })

    const createEventData = contract.interface.encodeFunctionData("createEvent", [
      BigInt(numericEventId),
      ticketPriceUSDCUnits,
      BigInt(eventEndTimestamp),
      BigInt(redistributionPercentage)
    ])

    let txHash: string

    if (typeof window !== "undefined" && window.waap) {
      console.log("🚀 Envoi via Human Wallet...")
      txHash = await sendTransactionViaHumanWallet({
        from: userAddress,
        to: ESCROW_CONTRACT_ADDRESS,
        data: createEventData,
        value: "0x0",
      })
    } else {
      console.log("🚀 Envoi via fallback (ethers.js)...")
      const tx = await contract.createEvent(
        BigInt(numericEventId),
        ticketPriceUSDCUnits,
        BigInt(eventEndTimestamp),
        BigInt(redistributionPercentage)
      )
      txHash = tx.hash
      console.log("✅ Transaction envoyée! TX Hash:", txHash)
    }

    console.log("")
    console.log("⚠️ MODE FIRE-AND-FORGET ACTIVÉ")
    console.log("   La transaction va être minée dans quelques secondes.")
    console.log("   Aucune vérification n'est faite pour maximiser la compatibilité.")
    console.log("")
    console.log("✅ Vous pouvez utiliser l'événement immédiatement.")
    console.log(`   Vérifiez la tx sur l'explorateur: https://sepolia.etherscan.io/tx/${txHash}`)
    console.log("")
    
    return { success: true, txHash: txHash }
  } catch (error: any) {
    console.error("❌ Error creating event on chain:", error)
    
    let errorMessage = error.message || "Unknown error"
    
    if (error.reason) {
      errorMessage = error.reason
    } else if (error.data?.message) {
      errorMessage = error.data.message
    } else if (errorMessage.includes("user rejected")) {
      errorMessage = "Transaction rejetée par l'utilisateur"
    } else if (errorMessage.includes("insufficient funds")) {
      errorMessage = "Fonds insuffisants pour payer les frais de gas"
    } else if (errorMessage.includes("Evenement deja existant")) {
      errorMessage = "Cet événement existe déjà sur la blockchain"
    } else if (errorMessage.includes("Date de fin invalide")) {
      errorMessage = "La date de fin doit être dans le futur"
    } else if (errorMessage.includes("Prix du billet invalide")) {
      errorMessage = "Le prix du billet doit être supérieur à 0"
    } else if (errorMessage.includes("Pourcentage invalide")) {
      errorMessage = "Le pourcentage de redistribution doit être entre 0 et 100"
    }
    
    return { success: false, error: errorMessage }
  }
}

/**
 * Approuver le contrat Escrow à dépenser des USDC
 */
export async function approveUSDCForEscrow(
  amountUSDC: number,
  provider: any
): Promise<{ success: boolean; txHash?: string; error?: string }> {
  try {
    const signer = await provider.getSigner()
    const userAddress = await signer.getAddress()
    const usdcContract = new ethers.Contract(USDC_TOKEN_ADDRESS, ERC20_ABI, signer)

    const amountWithDecimals = ethers.parseUnits(amountUSDC.toString(), 6)

    console.log("💰 Approving USDC for Escrow:", {
      amount: amountUSDC,
      amountWithDecimals: amountWithDecimals.toString(),
      usdcAddress: USDC_TOKEN_ADDRESS,
      escrowAddress: ESCROW_CONTRACT_ADDRESS
    })

    const approveData = usdcContract.interface.encodeFunctionData("approve", [
      ESCROW_CONTRACT_ADDRESS,
      amountWithDecimals
    ])

    let txHash: string

    if (typeof window !== "undefined" && window.waap) {
      console.log("🚀 Envoi approbation via Human Wallet...")
      txHash = await sendTransactionViaHumanWallet({
        from: userAddress,
        to: USDC_TOKEN_ADDRESS,
        data: approveData,
        value: "0x0",
      })
    } else {
      console.log("🚀 Envoi approbation via fallback...")
      const tx = await usdcContract.approve(ESCROW_CONTRACT_ADDRESS, amountWithDecimals)
      txHash = tx.hash
      console.log("✅ Approbation envoyée! TX Hash:", txHash)
    }
    
    return { success: true, txHash: txHash }
  } catch (error: any) {
    console.error("❌ Error approving USDC:", error)
    
    let errorMessage = error.message || "Unknown error"
    if (error.reason) {
      errorMessage = error.reason
    } else if (errorMessage.includes("user rejected")) {
      errorMessage = "Approbation rejetée par l'utilisateur"
    }
    
    return { success: false, error: errorMessage }
  }
}

/**
 * Acheter un billet sur la blockchain (avec USDC)
 * IMPORTANT: L'utilisateur DOIT avoir approuvé le contrat AVANT d'appeler cette fonction !
 */
export async function purchaseTicketOnChain(
  eventId: string,
  ticketPriceUSDC: number,
  provider: any
): Promise<{ success: boolean; txHash?: string; error?: string }> {
  try {
    const signer = await provider.getSigner()
    const userAddress = await signer.getAddress()
    
    const usdcContract = new ethers.Contract(USDC_TOKEN_ADDRESS, ERC20_ABI, signer)
    const usdcBalance = await usdcContract.balanceOf(userAddress)
    const ticketPriceWithDecimals = ethers.parseUnits(ticketPriceUSDC.toString(), 6)
    
    console.log("💰 USDC Balance:", ethers.formatUnits(usdcBalance, 6), "USDC")
    console.log("💵 Ticket Price:", ticketPriceUSDC, "USDC")
    
    if (usdcBalance < ticketPriceWithDecimals) {
      return { 
        success: false, 
        error: `Solde USDC insuffisant. Vous avez ${ethers.formatUnits(usdcBalance, 6)} USDC, il faut ${ticketPriceUSDC} USDC. Utilisez le faucet: https://faucet.circle.com/` 
      }
    }
    
    const allowance = await usdcContract.allowance(userAddress, ESCROW_CONTRACT_ADDRESS)
    console.log("🔓 Current Allowance:", ethers.formatUnits(allowance, 6), "USDC")
    
    if (allowance < ticketPriceWithDecimals) {
      console.log("⚠️ Approbation insuffisante, approbation automatique...")
      const approvalResult = await approveUSDCForEscrow(ticketPriceUSDC, provider)
      
      if (!approvalResult.success) {
        return { success: false, error: `Échec de l'approbation USDC: ${approvalResult.error}` }
      }
      
      console.log("✅ USDC approuvé! Attendez 3 secondes...")
      await new Promise(resolve => setTimeout(resolve, 3000))
    }
    
    const contract = new ethers.Contract(ESCROW_CONTRACT_ADDRESS, ESCROW_ABI, signer)
    const numericEventId = parseInt(eventId.replace(/\D/g, '')) || parseInt(eventId) || 0

    console.log("🎫 Purchasing ticket on chain:", {
      originalEventId: eventId,
      numericEventId,
      ticketPrice: ticketPriceUSDC + " USDC",
      contractAddress: ESCROW_CONTRACT_ADDRESS
    })

    const purchaseData = contract.interface.encodeFunctionData("purchaseTicket", [
      BigInt(numericEventId)
    ])

    let txHash: string

    if (typeof window !== "undefined" && window.waap) {
      console.log("🚀 Envoi via Human Wallet...")
      txHash = await sendTransactionViaHumanWallet({
        from: userAddress,
        to: ESCROW_CONTRACT_ADDRESS,
        data: purchaseData,
        value: "0x0",
      })
    } else {
      console.log("🚀 Envoi via fallback...")
      const tx = await contract.purchaseTicket(BigInt(numericEventId))
      txHash = tx.hash
      console.log("✅ Transaction envoyée! TX Hash:", txHash)
    }

    console.log("⚠️ MODE FIRE-AND-FORGET: La transaction sera minée dans quelques secondes.")
    console.log(`   Vérifiez sur: https://sepolia.etherscan.io/tx/${txHash}`)
    
    return { success: true, txHash: txHash }
  } catch (error: any) {
    console.error("❌ Error purchasing ticket on chain:", error)
    
    let errorMessage = error.message || "Unknown error"
    
    if (error.reason) {
      errorMessage = error.reason
    } else if (errorMessage.includes("user rejected")) {
      errorMessage = "Transaction rejetée par l'utilisateur"
    } else if (errorMessage.includes("insufficient funds")) {
      errorMessage = "Fonds ETH insuffisants pour les frais de gas"
    } else if (errorMessage.includes("Approbation USDC insuffisante")) {
      errorMessage = "Veuillez approuver le contrat à utiliser vos USDC d'abord"
    }
    
    return { success: false, error: errorMessage }
  }
}

/**
 * Marquer la présence d'un participant
 */
export async function markAttendanceOnChain(
  eventId: string,
  participantAddress: string,
  provider: any
): Promise<{ success: boolean; txHash?: string; error?: string }> {
  try {
    const signer = await provider.getSigner()
    const userAddress = await signer.getAddress()
    const contract = new ethers.Contract(ESCROW_CONTRACT_ADDRESS, ESCROW_ABI, signer)

    const numericEventId = parseInt(eventId.replace(/\D/g, '')) || parseInt(eventId) || 0

    console.log("Marking attendance on chain:", { originalEventId: eventId, numericEventId, participantAddress })

    const markAttendanceData = contract.interface.encodeFunctionData("markAttendance", [
      BigInt(numericEventId),
      participantAddress
    ])

    let txHash: string

    if (typeof window !== "undefined" && window.waap) {
      txHash = await sendTransactionViaHumanWallet({
        from: userAddress,
        to: ESCROW_CONTRACT_ADDRESS,
        data: markAttendanceData,
        value: "0x0",
      })
    } else {
      const tx = await contract.markAttendance(BigInt(numericEventId), participantAddress)
      txHash = tx.hash
    }
    
    console.log("✅ Attendance transaction sent! TX Hash:", txHash)

    return { success: true, txHash: txHash }
  } catch (error: any) {
    console.error("❌ Error marking attendance on chain:", error)
    return { success: false, error: error.message }
  }
}

/**
 * Marquer plusieurs présences en une fois (optimisé en gas)
 */
export async function markAttendanceBatchOnChain(
  eventId: string,
  participantAddresses: string[],
  provider: any
): Promise<{ success: boolean; txHash?: string; error?: string }> {
  try {
    const signer = await provider.getSigner()
    const userAddress = await signer.getAddress()
    const contract = new ethers.Contract(ESCROW_CONTRACT_ADDRESS, ESCROW_ABI, signer)

    const numericEventId = parseInt(eventId.replace(/\D/g, '')) || parseInt(eventId) || 0

    console.log("Marking attendance batch on chain:", { originalEventId: eventId, numericEventId, count: participantAddresses.length })

    const batchData = contract.interface.encodeFunctionData("markAttendanceBatch", [
      BigInt(numericEventId),
      participantAddresses
    ])

    let txHash: string

    if (typeof window !== "undefined" && window.waap) {
      txHash = await sendTransactionViaHumanWallet({
        from: userAddress,
        to: ESCROW_CONTRACT_ADDRESS,
        data: batchData,
        value: "0x0",
      })
    } else {
      const tx = await contract.markAttendanceBatch(BigInt(numericEventId), participantAddresses)
      txHash = tx.hash
    }
    
    console.log("✅ Attendance batch transaction sent! TX Hash:", txHash)
    console.log(`   (${participantAddresses.length} présences seront enregistrées dans quelques secondes)`)

    return { success: true, txHash: txHash }
  } catch (error: any) {
    console.error("❌ Error marking attendance batch on chain:", error)
    return { success: false, error: error.message }
  }
}

/**
 * Finaliser l'événement et redistribuer les fonds
 */
export async function finalizeEventOnChain(
  eventId: string,
  provider: any
): Promise<{ success: boolean; txHash?: string; error?: string }> {
  try {
    const signer = await provider.getSigner()
    const userAddress = await signer.getAddress()
    const contract = new ethers.Contract(ESCROW_CONTRACT_ADDRESS, ESCROW_ABI, signer)

    const numericEventId = parseInt(eventId.replace(/\D/g, '')) || parseInt(eventId) || 0

    console.log("Finalizing event on chain:", { originalEventId: eventId, numericEventId })

    const finalizeData = contract.interface.encodeFunctionData("finalizeEvent", [
      BigInt(numericEventId)
    ])

    let txHash: string

    if (typeof window !== "undefined" && window.waap) {
      txHash = await sendTransactionViaHumanWallet({
        from: userAddress,
        to: ESCROW_CONTRACT_ADDRESS,
        data: finalizeData,
        value: "0x0",
      })
    } else {
      const tx = await contract.finalizeEvent(BigInt(numericEventId))
      txHash = tx.hash
    }
    
    console.log("✅ Event finalization transaction sent! TX Hash:", txHash)
    console.log("   (La finalisation sera effective dans quelques secondes)")

    return { success: true, txHash: txHash }
  } catch (error: any) {
    console.error("❌ Error finalizing event on chain:", error)
    return { success: false, error: error.message }
  }
}

/**
 * Retirer sa redistribution
 */
export async function withdrawRedistributionOnChain(
  eventId: string,
  provider: any
): Promise<{ success: boolean; txHash?: string; error?: string }> {
  try {
    const signer = await provider.getSigner()
    const userAddress = await signer.getAddress()
    const contract = new ethers.Contract(ESCROW_CONTRACT_ADDRESS, ESCROW_ABI, signer)

    const numericEventId = parseInt(eventId.replace(/\D/g, '')) || parseInt(eventId) || 0

    console.log("Withdrawing redistribution on chain:", { originalEventId: eventId, numericEventId })

    const withdrawData = contract.interface.encodeFunctionData("withdrawRedistribution", [
      BigInt(numericEventId)
    ])

    let txHash: string

    if (typeof window !== "undefined" && window.waap) {
      txHash = await sendTransactionViaHumanWallet({
        from: userAddress,
        to: ESCROW_CONTRACT_ADDRESS,
        data: withdrawData,
        value: "0x0",
      })
    } else {
      const tx = await contract.withdrawRedistribution(BigInt(numericEventId))
      txHash = tx.hash
    }
    
    console.log("✅ Withdrawal transaction sent! TX Hash:", txHash)
    console.log("   (Les fonds arriveront dans votre wallet dans quelques secondes)")

    return { success: true, txHash: txHash }
  } catch (error: any) {
    console.error("❌ Error withdrawing redistribution on chain:", error)
    return { success: false, error: error.message }
  }
}

/**
 * Obtenir les informations d'un événement depuis la blockchain
 */
export async function getEventInfoOnChain(
  eventId: string,
  provider: any
): Promise<EscrowEventInfo | null> {
  try {
    const contract = new ethers.Contract(ESCROW_CONTRACT_ADDRESS, ESCROW_ABI, provider)

    const numericEventId = parseInt(eventId.replace(/\D/g, '')) || parseInt(eventId) || 0

    const [organizer, ticketPrice, eventEndTime, redistributionPercentage, totalFunds, isFinalized, participantCount] =
      await contract.getEventInfo(BigInt(numericEventId))

    return {
      organizer,
      ticketPrice,
      eventEndTime,
      redistributionPercentage,
      totalFunds,
      isFinalized,
      participantCount,
    }
  } catch (error: any) {
    console.error("❌ Error getting event info on chain:", error)
    return null
  }
}

/**
 * Obtenir les informations d'un participant
 */
export async function getParticipantInfoOnChain(
  eventId: string,
  participantAddress: string,
  provider: any
): Promise<EscrowParticipantInfo | null> {
  try {
    const contract = new ethers.Contract(ESCROW_CONTRACT_ADDRESS, ESCROW_ABI, provider)

    const numericEventId = parseInt(eventId.replace(/\D/g, '')) || parseInt(eventId) || 0

    const [hasPaid, hasAttended, hasWithdrawn, amountPaid] = await contract.getParticipantInfo(
      BigInt(numericEventId),
      participantAddress
    )

    return {
      hasPaid,
      hasAttended,
      hasWithdrawn,
      amountPaid,
    }
  } catch (error: any) {
    console.error("❌ Error getting participant info on chain:", error)
    return null
  }
}

/**
 * Obtenir les statistiques d'un événement
 */
export async function getEventStatsOnChain(eventId: string, provider: any): Promise<EscrowEventStats | null> {
  try {
    const contract = new ethers.Contract(ESCROW_CONTRACT_ADDRESS, ESCROW_ABI, provider)

    const numericEventId = parseInt(eventId.replace(/\D/g, '')) || parseInt(eventId) || 0

    const [totalParticipants, attendeeCount, absenteeCount, totalAbsenteeFunds, redistributionAmount] =
      await contract.getEventStats(BigInt(numericEventId))

    return {
      totalParticipants,
      attendeeCount,
      absenteeCount,
      totalAbsenteeFunds,
      redistributionAmount,
    }
  } catch (error: any) {
    console.error("❌ Error getting event stats on chain:", error)
    return null
  }
}

/**
 * Calculer la redistribution potentielle pour un participant
 */
export async function calculatePotentialRedistributionOnChain(
  eventId: string,
  participantAddress: string,
  provider: any
): Promise<bigint | null> {
  try {
    const contract = new ethers.Contract(ESCROW_CONTRACT_ADDRESS, ESCROW_ABI, provider)

    const numericEventId = parseInt(eventId.replace(/\D/g, '')) || parseInt(eventId) || 0

    const amount = await contract.calculatePotentialRedistribution(BigInt(numericEventId), participantAddress)

    return amount
  } catch (error: any) {
    console.error("❌ Error calculating potential redistribution on chain:", error)
    return null
  }
}

/**
 * Annuler un événement et rembourser tous les participants
 */
export async function cancelEventOnChain(
  eventId: string,
  provider: any
): Promise<{ success: boolean; txHash?: string; error?: string }> {
  try {
    const signer = await provider.getSigner()
    const userAddress = await signer.getAddress()
    const contract = new ethers.Contract(ESCROW_CONTRACT_ADDRESS, ESCROW_ABI, signer)

    const numericEventId = parseInt(eventId.replace(/\D/g, '')) || parseInt(eventId) || 0

    console.log("Canceling event on chain:", { originalEventId: eventId, numericEventId })

    const cancelData = contract.interface.encodeFunctionData("cancelEvent", [
      BigInt(numericEventId)
    ])

    let txHash: string

    if (typeof window !== "undefined" && window.waap) {
      txHash = await sendTransactionViaHumanWallet({
        from: userAddress,
        to: ESCROW_CONTRACT_ADDRESS,
        data: cancelData,
        value: "0x0",
      })
    } else {
      const tx = await contract.cancelEvent(BigInt(numericEventId))
      txHash = tx.hash
    }
    
    console.log("✅ Event cancellation transaction sent! TX Hash:", txHash)
    console.log("   (L'annulation et les remboursements seront effectifs dans quelques secondes)")

    return { success: true, txHash: txHash }
  } catch (error: any) {
    console.error("❌ Error canceling event on chain:", error)
    return { success: false, error: error.message }
  }
}
