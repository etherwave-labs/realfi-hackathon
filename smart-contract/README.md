# Smart Contract EventEscrow

## Description

Ce smart contract gère automatiquement les paiements et la redistribution des fonds pour tous les événements de l'application. Il fonctionne comme un système d'escrow (séquestre) qui:

1. ✅ **Récupère les fonds** lors de l'achat de billets
2. ✅ **Garde les fonds en sécurité** jusqu'à la fin de l'événement
3. ✅ **Vérifie la présence** des participants
4. ✅ **Redistribue automatiquement** un pourcentage des fonds des absents aux présents
5. ✅ **Transfère le reste** à l'organisateur

## Caractéristiques Principales

- 🎫 **Multi-événements**: Un seul contrat pour gérer tous vos événements
- 💰 **Redistribution équitable**: Les participants présents se partagent une partie des fonds des absents
- 🔒 **Sécurisé**: Fonds bloqués jusqu'à la finalisation de l'événement
- 📊 **Transparence**: Toutes les transactions sont visibles sur la blockchain
- ⚡ **Batch operations**: Marquer plusieurs présences en une seule transaction

## Architecture

### Structures de Données

#### Event (Événement)
```solidity
struct Event {
    uint256 eventId;                    // ID unique de l'événement
    address organizer;                  // Adresse de l'organisateur
    uint256 ticketPrice;                // Prix du billet en wei
    uint256 eventEndTime;               // Timestamp de fin
    uint256 redistributionPercentage;   // % à redistribuer (0-100)
    uint256 totalFunds;                 // Total des fonds collectés
    bool isFinalized;                   // Événement finalisé ou non
    mapping participants;               // Liste des participants
}
```

#### Participant
```solidity
struct Participant {
    bool hasPaid;       // A acheté un billet
    bool hasAttended;   // A assisté à l'événement
    bool hasWithdrawn;  // A retiré sa redistribution
    uint256 amountPaid; // Montant payé
}
```

## Fonctions Principales

### 1. Créer un Événement

```solidity
function createEvent(
    uint256 _eventId,
    uint256 _ticketPrice,
    uint256 _eventEndTime,
    uint256 _redistributionPercentage
) external
```

**Paramètres:**
- `_eventId`: ID unique de l'événement (depuis votre base de données)
- `_ticketPrice`: Prix du billet en wei (ex: 0.01 ETH = 10000000000000000 wei)
- `_eventEndTime`: Timestamp Unix de fin de l'événement
- `_redistributionPercentage`: Pourcentage (0-100) à redistribuer aux présents

**Exemple d'utilisation:**
```javascript
// Créer un événement avec billets à 0.01 ETH et 80% de redistribution
await contract.createEvent(
    1,                              // eventId
    ethers.parseEther("0.01"),     // 0.01 ETH
    Math.floor(Date.now() / 1000) + 86400, // Dans 24h
    80                              // 80% de redistribution
);
```

### 2. Acheter un Billet

```solidity
function purchaseTicket(uint256 _eventId) external payable
```

**Paramètres:**
- `_eventId`: ID de l'événement
- Envoyer le montant exact du billet avec la transaction

**Exemple:**
```javascript
await contract.purchaseTicket(1, {
    value: ethers.parseEther("0.01")
});
```

### 3. Marquer la Présence

```solidity
// Une seule personne
function markAttendance(uint256 _eventId, address _participant) external

// Plusieurs personnes (optimisé)
function markAttendanceBatch(uint256 _eventId, address[] calldata _participants) external
```

**Réservé à l'organisateur uniquement**

**Exemple:**
```javascript
// Marquer une personne
await contract.markAttendance(1, "0x123...");

// Marquer plusieurs personnes (plus efficace en gas)
await contract.markAttendanceBatch(1, [
    "0x123...",
    "0x456...",
    "0x789..."
]);
```

### 4. Finaliser l'Événement

```solidity
function finalizeEvent(uint256 _eventId) external
```

**Réservé à l'organisateur, après la fin de l'événement**

Cette fonction:
- Calcule automatiquement les fonds des absents
- Applique le pourcentage de redistribution
- Transfère la part de l'organisateur immédiatement
- Permet aux présents de retirer leur part

**Exemple:**
```javascript
await contract.finalizeEvent(1);
```

### 5. Retirer sa Redistribution

```solidity
function withdrawRedistribution(uint256 _eventId) external
```

**Pour les participants présents uniquement**

**Exemple:**
```javascript
await contract.withdrawRedistribution(1);
```

### 6. Annuler un Événement

```solidity
function cancelEvent(uint256 _eventId) external
```

**Réservé à l'organisateur, avant la fin de l'événement**

Rembourse automatiquement tous les participants.

## Fonctions de Lecture (View Functions)

### Informations de l'Événement

```solidity
function getEventInfo(uint256 _eventId) external view returns (
    address organizer,
    uint256 ticketPrice,
    uint256 eventEndTime,
    uint256 redistributionPercentage,
    uint256 totalFunds,
    bool isFinalized,
    uint256 participantCount
)
```

### Informations d'un Participant

```solidity
function getParticipantInfo(uint256 _eventId, address _participant) external view returns (
    bool hasPaid,
    bool hasAttended,
    bool hasWithdrawn,
    uint256 amountPaid
)
```

### Statistiques de l'Événement

```solidity
function getEventStats(uint256 _eventId) external view returns (
    uint256 totalParticipants,
    uint256 attendeeCount,
    uint256 absenteeCount,
    uint256 totalAbsenteeFunds,
    uint256 redistributionAmount
)
```

### Calculer la Redistribution Potentielle

```solidity
function calculatePotentialRedistribution(uint256 _eventId, address _participant) external view returns (uint256)
```

### Liste des Participants

```solidity
function getParticipants(uint256 _eventId) external view returns (address[] memory)
```

## Événements (Events/Logs)

Le contrat émet des événements pour chaque action importante:

```solidity
event EventCreated(uint256 indexed eventId, address indexed organizer, ...);
event TicketPurchased(uint256 indexed eventId, address indexed participant, uint256 amount);
event AttendanceMarked(uint256 indexed eventId, address indexed participant);
event FundsRedistributed(uint256 indexed eventId, uint256 totalRedistributed, uint256 attendeeCount);
event OrganizerPaid(uint256 indexed eventId, address indexed organizer, uint256 amount);
event RefundIssued(uint256 indexed eventId, address indexed participant, uint256 amount);
```

## Exemple de Flux Complet

### Scénario

Un événement avec 10 participants à 0.1 ETH par billet, avec 80% de redistribution, où seulement 7 personnes sont venues.

1. **Création de l'événement**
   ```javascript
   await contract.createEvent(
       1,
       ethers.parseEther("0.1"),
       eventEndTimestamp,
       80
   );
   ```

2. **Achat de billets** (10 personnes)
   ```javascript
   // Chaque participant achète un billet
   for (let i = 0; i < 10; i++) {
       await contract.connect(participant[i]).purchaseTicket(1, {
           value: ethers.parseEther("0.1")
       });
   }
   // Total collecté: 1 ETH
   ```

3. **Événement terminé - Marquage des présences** (7 présents)
   ```javascript
   await contract.markAttendanceBatch(1, [
       participant[0].address,
       participant[1].address,
       participant[2].address,
       participant[3].address,
       participant[4].address,
       participant[5].address,
       participant[6].address
   ]);
   ```

4. **Finalisation**
   ```javascript
   await contract.finalizeEvent(1);
   ```
   
   **Calculs automatiques:**
   - Fonds des absents: 3 × 0.1 = 0.3 ETH
   - Redistribution (80%): 0.3 × 0.8 = 0.24 ETH
   - Part de l'organisateur: 1 - 0.24 = 0.76 ETH (transféré immédiatement)
   - Part par présent: 0.24 / 7 ≈ 0.034 ETH

5. **Retrait des redistribués** (chaque présent)
   ```javascript
   await contract.connect(participant[0]).withdrawRedistribution(1);
   // Reçoit ~0.034 ETH
   ```

## Déploiement

### Prérequis

```bash
npm install --save-dev hardhat @nomicfoundation/hardhat-toolbox ethers
```

### Script de Déploiement

Créer `deploy.js`:

```javascript
const hre = require("hardhat");

async function main() {
    const EventEscrow = await hre.ethers.getContractFactory("EventEscrow");
    const eventEscrow = await EventEscrow.deploy();
    
    await eventEscrow.waitForDeployment();
    
    console.log("EventEscrow déployé à:", await eventEscrow.getAddress());
}

main().catch((error) => {
    console.error(error);
    process.exitCode = 1;
});
```

### Déployer

```bash
# Sur un réseau de test (ex: Sepolia)
npx hardhat run deploy.js --network sepolia

# Sur le mainnet
npx hardhat run deploy.js --network mainnet
```

## Sécurité

✅ **Mesures de sécurité implémentées:**

- Modificateurs pour restreindre l'accès aux fonctions
- Vérification des montants et des paramètres
- Protection contre les re-entrancy attacks (utilisation de `.call()` après modification de l'état)
- Events pour traçabilité complète
- Pas de boucles infinies ou de gas attacks possibles

⚠️ **Recommandations:**

1. **Auditer le contrat** avant le déploiement en production
2. **Tester extensivement** sur un testnet (Sepolia, Goerli)
3. **Considérer une assurance** pour les fonds importants
4. **Mettre en place un multisig** pour l'organisateur si nécessaire

## Gas Optimization

Le contrat est optimisé pour minimiser les frais de gas:

- `markAttendanceBatch()` pour marquer plusieurs présences en une fois
- Utilisation de `calldata` au lieu de `memory` quand possible
- Stockage optimisé avec des structures compactes
- Calculs effectués dans `finalizeEvent()` plutôt qu'à chaque opération

## Intégration avec votre Application

### Configuration

```javascript
import { ethers } from 'ethers';
import EventEscrowABI from './EventEscrow.json';

const CONTRACT_ADDRESS = "0x..."; // Adresse du contrat déployé

const provider = new ethers.BrowserProvider(window.ethereum);
const signer = await provider.getSigner();
const contract = new ethers.Contract(CONTRACT_ADDRESS, EventEscrowABI, signer);
```

### Créer un Événement depuis votre App

```javascript
async function createEventOnChain(eventData) {
    const tx = await contract.createEvent(
        eventData.id,
        ethers.parseEther(eventData.price.toString()),
        Math.floor(new Date(eventData.endDate).getTime() / 1000),
        eventData.redistributionPercentage
    );
    
    await tx.wait();
    console.log("Événement créé sur la blockchain");
}
```

### Écouter les Événements

```javascript
// Écouter les achats de billets
contract.on("TicketPurchased", (eventId, participant, amount) => {
    console.log(`Nouveau billet acheté pour l'événement ${eventId}`);
    // Mettre à jour votre base de données
});

// Écouter les présences
contract.on("AttendanceMarked", (eventId, participant) => {
    console.log(`Présence marquée pour ${participant}`);
    // Mettre à jour votre UI
});
```

## Tests

Exemple de tests avec Hardhat:

```javascript
const { expect } = require("chai");
const { ethers } = require("hardhat");

describe("EventEscrow", function () {
    let contract;
    let organizer, participant1, participant2;
    
    beforeEach(async function () {
        [organizer, participant1, participant2] = await ethers.getSigners();
        
        const EventEscrow = await ethers.getContractFactory("EventEscrow");
        contract = await EventEscrow.deploy();
    });
    
    it("Devrait créer un événement", async function () {
        await contract.createEvent(
            1,
            ethers.parseEther("0.1"),
            Math.floor(Date.now() / 1000) + 86400,
            80
        );
        
        const info = await contract.getEventInfo(1);
        expect(info.organizer).to.equal(organizer.address);
    });
    
    it("Devrait permettre l'achat de billets", async function () {
        await contract.createEvent(1, ethers.parseEther("0.1"), Math.floor(Date.now() / 1000) + 86400, 80);
        
        await contract.connect(participant1).purchaseTicket(1, {
            value: ethers.parseEther("0.1")
        });
        
        const info = await contract.getParticipantInfo(1, participant1.address);
        expect(info.hasPaid).to.be.true;
    });
});
```

## Support et Contribution

Pour toute question ou amélioration, n'hésitez pas à ouvrir une issue ou une pull request.

## Licence

MIT License