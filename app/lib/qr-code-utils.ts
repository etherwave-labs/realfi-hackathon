export interface QRCodeData {
  registrationId: string
  eventId: string
  userAddress: string
  transactionHash: string
  timestamp: string
  signature: string
}

export function generateQRCodeData(
  registrationId: string,
  eventId: string,
  userAddress: string,
  transactionHash: string
): string {
  const timestamp = new Date().toISOString()
  
  const dataToSign = `${registrationId}|${eventId}|${userAddress}|${transactionHash}|${timestamp}`
  const signature = simpleHash(dataToSign)
  
  const qrData: QRCodeData = {
    registrationId,
    eventId,
    userAddress,
    transactionHash,
    timestamp,
    signature,
  }
  
  return JSON.stringify(qrData)
}

export function verifyQRCodeData(qrDataString: string, eventId: string): {
  valid: boolean
  data?: QRCodeData
  error?: string
} {
  try {
    const qrData: QRCodeData = JSON.parse(qrDataString)
    
    if (qrData.eventId !== eventId) {
      return {
        valid: false,
        error: "QR Code is not for this event",
      }
    }
    
    const dataToVerify = `${qrData.registrationId}|${qrData.eventId}|${qrData.userAddress}|${qrData.transactionHash}|${qrData.timestamp}`
    const expectedSignature = simpleHash(dataToVerify)
    
    if (qrData.signature !== expectedSignature) {
      return {
        valid: false,
        error: "Invalid QR Code signature",
      }
    }
    
    return {
      valid: true,
      data: qrData,
    }
  } catch (error) {
    return {
      valid: false,
      error: "Invalid QR Code format",
    }
  }
}

function simpleHash(input: string): string {
  let hash = 0
  for (let i = 0; i < input.length; i++) {
    const char = input.charCodeAt(i)
    hash = (hash << 5) - hash + char
    hash = hash & hash
  }
  return Math.abs(hash).toString(36)
}

