// SPDX-License-Identifier: MIT
pragma solidity ^0.8.30;

interface IERC20 {
    function transferFrom(address sender, address recipient, uint256 amount) external returns (bool);
    function transfer(address recipient, uint256 amount) external returns (bool);
    function balanceOf(address account) external view returns (uint256);
    function approve(address spender, uint256 amount) external returns (bool);
    function allowance(address owner, address spender) external view returns (uint256);
}

contract EventEscrow {
    
    IERC20 public usdcToken;
    
    struct Event {
        uint256 eventId;
        address organizer;
        uint256 ticketPrice;
        uint256 eventEndTime;
        uint256 redistributionPercentage;
        uint256 totalFunds;
        bool isFinalized;
        bool exists;
        mapping(address => Participant) participants;
        address[] participantAddresses;
    }
    
    struct Participant {
        bool hasPaid;
        bool hasAttended;
        bool hasWithdrawn;
        uint256 amountPaid;
    }
    
    mapping(uint256 => Event) public events;
    
    constructor(address _usdcAddress) {
        require(_usdcAddress != address(0), "Adresse USDC invalide");
        usdcToken = IERC20(_usdcAddress);
    }
    
    event EventCreated(
        uint256 indexed eventId,
        address indexed organizer,
        uint256 ticketPrice,
        uint256 eventEndTime,
        uint256 redistributionPercentage
    );
    
    event TicketPurchased(
        uint256 indexed eventId,
        address indexed participant,
        uint256 amount
    );
    
    event AttendanceMarked(
        uint256 indexed eventId,
        address indexed participant
    );
    
    event FundsRedistributed(
        uint256 indexed eventId,
        uint256 totalRedistributed,
        uint256 attendeeCount
    );
    
    event OrganizerPaid(
        uint256 indexed eventId,
        address indexed organizer,
        uint256 amount
    );
    
    event RefundIssued(
        uint256 indexed eventId,
        address indexed participant,
        uint256 amount
    );
    
    modifier onlyOrganizer(uint256 _eventId) {
        require(events[_eventId].exists, "Evenement inexistant");
        require(events[_eventId].organizer == msg.sender, "Seul l'organisateur peut effectuer cette action");
        _;
    }
    
    modifier eventExists(uint256 _eventId) {
        require(events[_eventId].exists, "Evenement inexistant");
        _;
    }
    
    modifier eventNotFinalized(uint256 _eventId) {
        require(!events[_eventId].isFinalized, "Evenement deja finalise");
        _;
    }
    
    modifier afterEventEnd(uint256 _eventId) {
        require(block.timestamp >= events[_eventId].eventEndTime, "Evenement pas encore termine");
        _;
    }
    
    function createEvent(
        uint256 _eventId,
        uint256 _ticketPrice,
        uint256 _eventEndTime,
        uint256 _redistributionPercentage
    ) external {
        require(!events[_eventId].exists, "Evenement deja existant");
        require(_eventEndTime > block.timestamp, "Date de fin invalide");
        require(_redistributionPercentage <= 100, "Pourcentage invalide (max 100)");
        
        Event storage newEvent = events[_eventId];
        newEvent.eventId = _eventId;
        newEvent.organizer = msg.sender;
        newEvent.ticketPrice = _ticketPrice;
        newEvent.eventEndTime = _eventEndTime;
        newEvent.redistributionPercentage = _redistributionPercentage;
        newEvent.totalFunds = 0;
        newEvent.isFinalized = false;
        newEvent.exists = true;
        
        emit EventCreated(_eventId, msg.sender, _ticketPrice, _eventEndTime, _redistributionPercentage);
    }
    
    function purchaseTicket(uint256 _eventId) external eventExists(_eventId) eventNotFinalized(_eventId) {
        Event storage evt = events[_eventId];
        
        require(block.timestamp < evt.eventEndTime, "Evenement deja termine");
        require(!evt.participants[msg.sender].hasPaid, "Billet deja achete");
        
        uint256 ticketPrice = evt.ticketPrice;
        
        if (ticketPrice > 0) {
            require(
                usdcToken.allowance(msg.sender, address(this)) >= ticketPrice,
                "Approbation USDC insuffisante"
            );
            
            require(
                usdcToken.transferFrom(msg.sender, address(this), ticketPrice),
                "Transfert USDC echoue"
            );
        }
        
        evt.participants[msg.sender] = Participant({
            hasPaid: true,
            hasAttended: false,
            hasWithdrawn: false,
            amountPaid: ticketPrice
        });
        
        evt.participantAddresses.push(msg.sender);
        evt.totalFunds += ticketPrice;
        
        emit TicketPurchased(_eventId, msg.sender, ticketPrice);
    }
    
    function markAttendance(uint256 _eventId, address _participant) 
        external 
        onlyOrganizer(_eventId) 
        eventNotFinalized(_eventId) 
    {
        Event storage evt = events[_eventId];
        require(evt.participants[_participant].hasPaid, "Participant n'a pas achete de billet");
        require(!evt.participants[_participant].hasAttended, "Presence deja marquee");
        
        evt.participants[_participant].hasAttended = true;
        
        emit AttendanceMarked(_eventId, _participant);
    }
    
    function markAttendanceBatch(uint256 _eventId, address[] calldata _participants) 
        external 
        onlyOrganizer(_eventId) 
        eventNotFinalized(_eventId) 
    {
        Event storage evt = events[_eventId];
        
        for (uint256 i = 0; i < _participants.length; i++) {
            address participant = _participants[i];
            if (evt.participants[participant].hasPaid && !evt.participants[participant].hasAttended) {
                evt.participants[participant].hasAttended = true;
                emit AttendanceMarked(_eventId, participant);
            }
        }
    }
    
    function finalizeEvent(uint256 _eventId) 
        external 
        onlyOrganizer(_eventId) 
        afterEventEnd(_eventId) 
        eventNotFinalized(_eventId) 
    {
        Event storage evt = events[_eventId];
        evt.isFinalized = true;
        
        uint256 attendeeCount = 0;
        uint256 absenteeCount = 0;
        uint256 totalAbsenteeFunds = 0;
        
        for (uint256 i = 0; i < evt.participantAddresses.length; i++) {
            address participant = evt.participantAddresses[i];
            if (evt.participants[participant].hasAttended) {
                attendeeCount++;
            } else {
                absenteeCount++;
                totalAbsenteeFunds += evt.participants[participant].amountPaid;
            }
        }
        
        uint256 redistributionAmount = (totalAbsenteeFunds * evt.redistributionPercentage) / 100;
        uint256 amountToOrganizer = evt.totalFunds - redistributionAmount;
        
        if (attendeeCount == 0) {
            amountToOrganizer = evt.totalFunds;
        }
        
        emit FundsRedistributed(_eventId, redistributionAmount, attendeeCount);
        
        if (amountToOrganizer > 0) {
            require(
                usdcToken.transfer(evt.organizer, amountToOrganizer),
                "Transfert USDC a l'organisateur echoue"
            );
            emit OrganizerPaid(_eventId, evt.organizer, amountToOrganizer);
        }
    }
    
    function withdrawRedistribution(uint256 _eventId) external eventExists(_eventId) {
        Event storage evt = events[_eventId];
        
        require(evt.isFinalized, "Evenement pas encore finalise");
        require(evt.participants[msg.sender].hasPaid, "Vous n'avez pas achete de billet");
        require(evt.participants[msg.sender].hasAttended, "Vous n'avez pas assiste a l'evenement");
        require(!evt.participants[msg.sender].hasWithdrawn, "Fonds deja retires");
        
        uint256 attendeeCount = 0;
        uint256 totalAbsenteeFunds = 0;
        
        for (uint256 i = 0; i < evt.participantAddresses.length; i++) {
            address participant = evt.participantAddresses[i];
            if (evt.participants[participant].hasAttended) {
                attendeeCount++;
            } else {
                totalAbsenteeFunds += evt.participants[participant].amountPaid;
            }
        }
        
        require(attendeeCount > 0, "Aucun participant present");
        
        uint256 redistributionAmount = (totalAbsenteeFunds * evt.redistributionPercentage) / 100;
        uint256 sharePerAttendee = redistributionAmount / attendeeCount;
        
        evt.participants[msg.sender].hasWithdrawn = true;
        
        if (sharePerAttendee > 0) {
            require(
                usdcToken.transfer(msg.sender, sharePerAttendee),
                "Transfert USDC echoue"
            );
        }
    }
    
    function cancelEvent(uint256 _eventId) 
        external 
        onlyOrganizer(_eventId) 
        eventNotFinalized(_eventId) 
    {
        Event storage evt = events[_eventId];
        evt.isFinalized = true;
        
        for (uint256 i = 0; i < evt.participantAddresses.length; i++) {
            address participant = evt.participantAddresses[i];
            if (evt.participants[participant].hasPaid && !evt.participants[participant].hasWithdrawn) {
                uint256 refundAmount = evt.participants[participant].amountPaid;
                evt.participants[participant].hasWithdrawn = true;
                
                if (refundAmount > 0) {
                    require(
                        usdcToken.transfer(participant, refundAmount),
                        "Remboursement USDC echoue"
                    );
                }
                
                emit RefundIssued(_eventId, participant, refundAmount);
            }
        }
    }
    
    function getEventInfo(uint256 _eventId) 
        external 
        view 
        eventExists(_eventId) 
        returns (
            address organizer,
            uint256 ticketPrice,
            uint256 eventEndTime,
            uint256 redistributionPercentage,
            uint256 totalFunds,
            bool isFinalized,
            uint256 participantCount
        ) 
    {
        Event storage evt = events[_eventId];
        return (
            evt.organizer,
            evt.ticketPrice,
            evt.eventEndTime,
            evt.redistributionPercentage,
            evt.totalFunds,
            evt.isFinalized,
            evt.participantAddresses.length
        );
    }
    
    function getParticipantInfo(uint256 _eventId, address _participant) 
        external 
        view 
        eventExists(_eventId) 
        returns (
            bool hasPaid,
            bool hasAttended,
            bool hasWithdrawn,
            uint256 amountPaid
        ) 
    {
        Participant storage participant = events[_eventId].participants[_participant];
        return (
            participant.hasPaid,
            participant.hasAttended,
            participant.hasWithdrawn,
            participant.amountPaid
        );
    }
    
    function getParticipants(uint256 _eventId) 
        external 
        view 
        eventExists(_eventId) 
        returns (address[] memory) 
    {
        return events[_eventId].participantAddresses;
    }
    
    function calculatePotentialRedistribution(uint256 _eventId, address _participant) 
        external 
        view 
        eventExists(_eventId) 
        returns (uint256) 
    {
        Event storage evt = events[_eventId];
        
        if (!evt.participants[_participant].hasAttended || evt.participants[_participant].hasWithdrawn) {
            return 0;
        }
        
        uint256 attendeeCount = 0;
        uint256 totalAbsenteeFunds = 0;
        
        for (uint256 i = 0; i < evt.participantAddresses.length; i++) {
            address p = evt.participantAddresses[i];
            if (evt.participants[p].hasAttended) {
                attendeeCount++;
            } else {
                totalAbsenteeFunds += evt.participants[p].amountPaid;
            }
        }
        
        if (attendeeCount == 0) {
            return 0;
        }
        
        uint256 redistributionAmount = (totalAbsenteeFunds * evt.redistributionPercentage) / 100;
        return redistributionAmount / attendeeCount;
    }
    
    function getEventStats(uint256 _eventId) 
        external 
        view 
        eventExists(_eventId) 
        returns (
            uint256 totalParticipants,
            uint256 attendeeCount,
            uint256 absenteeCount,
            uint256 totalAbsenteeFunds,
            uint256 redistributionAmount
        ) 
    {
        Event storage evt = events[_eventId];
        
        uint256 attended = 0;
        uint256 absent = 0;
        uint256 absenteeFunds = 0;
        
        for (uint256 i = 0; i < evt.participantAddresses.length; i++) {
            address participant = evt.participantAddresses[i];
            if (evt.participants[participant].hasAttended) {
                attended++;
            } else {
                absent++;
                absenteeFunds += evt.participants[participant].amountPaid;
            }
        }
        
        uint256 redistribution = (absenteeFunds * evt.redistributionPercentage) / 100;
        
        return (
            evt.participantAddresses.length,
            attended,
            absent,
            absenteeFunds,
            redistribution
        );
    }
}
