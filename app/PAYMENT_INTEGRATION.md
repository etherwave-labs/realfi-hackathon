# Intégration des Paiements USDC

## 🎉 Système de Paiement Implémenté

Votre application dispose maintenant d'un **vrai système de paiement en USDC** qui transfère directement les fonds au wallet de l'organisateur !

## 🏗️ Architecture

### 1. Service de Paiement (`lib/payment-service.ts`)

Le service gère toutes les transactions USDC :

- **`sendUSDCPayment()`** : Transfère des USDC vers le wallet de l'organisateur
- **`getUSDCBalance()`** : Récupère le solde USDC d'une adresse
- **`getEthereumProvider()`** : Obtient le provider Ethereum (Human Wallet ou MetaMask)

**Configuration actuelle** :
- 🌐 **Réseau** : Arbitrum Sepolia Testnet (pour le développement)
- 💰 **Token** : USDC Testnet
- 📍 **Contrat** : `0x75faf114eafb1BDbe2F0316DF893fd58CE46AA4d`

### 2. Hook React (`hooks/use-payment.ts`)

Un hook personnalisé pour faciliter les paiements dans les composants :

```typescript
const { sendPayment, isProcessing, error } = usePayment()

// Effectuer un paiement
const result = await sendPayment(organizerAddress, amountUSDC)
```

### 3. Modal de Paiement (`components/registration/payment-modal.tsx`)

Le modal :
- ✅ Affiche le solde USDC en temps réel de l'utilisateur
- ✅ Affiche l'adresse du wallet de l'organisateur
- ✅ Vérifie que l'utilisateur a assez de USDC
- ✅ Effectue la transaction et retourne le hash
- ✅ Gère les erreurs de manière élégante

### 4. Événements Mis à Jour (`lib/events-store.ts`)

Chaque organisateur a maintenant une adresse wallet :

```typescript
organizer: {
  name: "SF Web3 Community",
  walletAddress: "0x742d35Cc6634C0532925a3b844Bc9e7595f0bEb0",
  verified: true
}
```

## 🚀 Comment ça fonctionne

### Flux de Paiement

1. **L'utilisateur se connecte** avec Human Wallet
2. **Il sélectionne un événement** et clique sur "Register now"
3. **Le modal de paiement s'ouvre** :
   - Affiche le prix en USDC
   - Charge et affiche le solde USDC de l'utilisateur
   - Montre l'adresse du wallet de l'organisateur
4. **L'utilisateur clique sur "Pay X USDC"** :
   - Le wallet demande confirmation
   - La transaction est envoyée sur Sepolia
   - Le modal attend la confirmation
5. **Une fois confirmé** :
   - Le hash de transaction est enregistré
   - Le modal de confirmation s'affiche
   - L'utilisateur est inscrit à l'événement

### Code de Transaction

```typescript
// Créer le contrat USDC
const usdcContract = new ethers.Contract(
  USDC_CONTRACT_ADDRESS, 
  USDC_ABI, 
  signer
)

// Convertir le montant (USDC a 6 décimales)
const amount = ethers.parseUnits(amountUSDC.toString(), 6)

// Effectuer le transfert
const tx = await usdcContract.transfer(recipientAddress, amount)

// Attendre la confirmation
const receipt = await tx.wait()
```

## 🔧 Configuration

### Mode Développement (Actuel)

- **Réseau** : Arbitrum Sepolia Testnet
- **USDC** : `0x75faf114eafb1BDbe2F0316DF893fd58CE46AA4d`
- **Faucet USDC** : [https://faucet.circle.com/](https://faucet.circle.com/)
- **Bridge vers Arbitrum** : [https://bridge.arbitrum.io/](https://bridge.arbitrum.io/)

### Passer en Production

1. **Mettre à jour l'adresse du contrat USDC** dans `lib/payment-service.ts` :

```typescript
// Mainnet Ethereum
export const USDC_CONTRACT_ADDRESS = "0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48"

// Ou Polygon
export const USDC_CONTRACT_ADDRESS = "0x2791Bca1f2de4661ED88A30C99A7a9449Aa84174"

// Ou Base
export const USDC_CONTRACT_ADDRESS = "0x833589fCD6eDb6E08f4c7C32D4f71b54bdA02913"
```

2. **Mettre à jour le provider** pour utiliser le bon réseau

3. **Mettre à jour Human Wallet** en mode production (`useStaging: false`)

## 💡 Fonctionnalités

### ✅ Déjà Implémenté

- [x] Paiement en USDC vers le wallet de l'organisateur
- [x] Vérification du solde avant le paiement
- [x] Affichage du hash de transaction
- [x] Gestion des erreurs
- [x] Interface utilisateur moderne
- [x] Intégration avec Human Wallet
- [x] Support Sepolia Testnet

### 🔮 Améliorations Futures

- [ ] Smart contract pour gérer les remboursements automatiques
- [ ] Système de no-show et redistribution
- [ ] Support multi-chaînes (Polygon, Base, Arbitrum)
- [ ] Paiements en d'autres stablecoins (USDT, DAI)
- [ ] Système de fees pour la plateforme
- [ ] Historique des transactions
- [ ] Export des reçus en PDF

## 📝 Tester les Paiements

### 1. Obtenir des USDC Testnet sur Arbitrum Sepolia

**Option 1 : Via le faucet Circle**
1. Allez sur [https://faucet.circle.com/](https://faucet.circle.com/)
2. Sélectionnez "Arbitrum Sepolia"
3. Entrez votre adresse wallet
4. Demandez des USDC testnet

**Option 2 : Bridge depuis Ethereum Sepolia**
1. Obtenez des USDC sur Ethereum Sepolia via le faucet
2. Utilisez le bridge Arbitrum : [https://bridge.arbitrum.io/](https://bridge.arbitrum.io/)
3. Bridgez vos USDC vers Arbitrum Sepolia

### 2. Tester un Paiement

1. Connectez-vous avec Human Wallet
2. Allez sur un événement
3. Cliquez sur "Register now"
4. Dans le modal de paiement :
   - Vérifiez votre solde USDC
   - Cliquez sur "Pay X USDC"
5. Confirmez dans votre wallet
6. Attendez la confirmation (environ 15-30 secondes sur Sepolia)
7. Récupérez votre hash de transaction

### 3. Vérifier la Transaction

Vérifiez sur [Arbiscan Sepolia](https://sepolia.arbiscan.io/) :

```
https://sepolia.arbiscan.io/tx/[VOTRE_TX_HASH]
```

## 🔒 Sécurité

- ✅ Les paiements sont faits directement on-chain
- ✅ Aucun fonds ne transite par l'application
- ✅ L'utilisateur doit approuver chaque transaction
- ✅ Vérification du solde avant transaction
- ✅ Gestion d'erreurs robuste
- ✅ Addresses wallet validées

## 🐛 Dépannage

### "No Ethereum provider found"
- Assurez-vous d'être connecté avec Human Wallet
- Vérifiez que window.silk ou window.ethereum est disponible

### "Insufficient USDC balance"
- Obtenez des USDC testnet depuis le faucet
- Vérifiez que vous êtes sur le bon réseau (Sepolia)

### Transaction échoue
- Vérifiez que vous avez assez d'ETH pour les gas fees
- Vérifiez l'adresse du wallet de l'organisateur
- Consultez les logs dans la console

## 📊 Exemple de Transaction

```json
{
  "from": "0x742d35Cc6634C0532925a3b844Bc9e7595f0bEb0",
  "to": "0x8626f6940E2eb28930eFb4CeF49B2d1F2C9C1199",
  "amount": "25000000", // 25 USDC (6 decimals)
  "token": "USDC",
  "network": "Sepolia",
  "hash": "0xabcd..."
}
```

## 🎯 Prochaines Étapes

Pour améliorer le système de paiement :

1. **Smart Contract d'Événement** :
   - Créer un contrat qui gère les inscriptions
   - Implémenter la logique de remboursement automatique
   - Gérer les no-shows et la redistribution

2. **Système de Check-in** :
   - QR code pour le check-in
   - Signature on-chain de la présence
   - Déclenchement automatique des remboursements

3. **Multi-token Support** :
   - Ajouter USDT, DAI, etc.
   - Permettre à l'organisateur de choisir

4. **Analytics** :
   - Tableau de bord des paiements
   - Statistiques pour les organisateurs
   - Export des données

## 📚 Ressources

- [Circle USDC Docs](https://developers.circle.com/stablecoins)
- [Ethers.js Documentation](https://docs.ethers.org/)
- [Human Wallet Docs](https://docs.wallet.human.tech)
- [Sepolia Faucet](https://faucet.circle.com/)
- [Sepolia Explorer](https://sepolia.etherscan.io/)

