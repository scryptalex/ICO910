// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import "@openzeppelin/contracts/token/ERC20/utils/SafeERC20.sol";

interface IBurnable is IERC20 {
    function burn(uint256 amount) external;
}

contract TournamentManager is Ownable {
    using SafeERC20 for IERC20;

    IBurnable public gameToken;

    struct Tournament {
        uint256 id;
        string name;
        uint256 entryFee; // GTK (18)
        uint256 prizePool; // GTK (18)
        uint256 maxParticipants;
        uint256 currentParticipants;
        uint256 startTime;
        uint256 endTime;
        bool isActive;
        bool isCompleted;
        address[] participants;
        mapping(address => bool) hasJoined;
    }

    mapping(uint256 => Tournament) public tournaments;
    uint256 public tournamentCounter;

    uint256 public constant BURN_PERCENTAGE = 50; // 50%

    event TournamentCreated(uint256 indexed tournamentId, string name, uint256 entryFee);
    event PlayerJoined(uint256 indexed tournamentId, address indexed player);
    event TournamentCompleted(uint256 indexed tournamentId, address[] winners);
    event RevenueBurned(uint256 indexed tournamentId, uint256 amount);

    constructor(address _gameToken) {
        require(_gameToken != address(0), "zero addr");
        gameToken = IBurnable(_gameToken);
    }

    function createTournament(
        string memory _name,
        uint256 _entryFee,
        uint256 _maxParticipants,
        uint256 _startTime,
        uint256 _endTime
    ) external onlyOwner {
        require(_startTime < _endTime, "bad time");
        tournamentCounter++;
        Tournament storage t = tournaments[tournamentCounter];
        t.id = tournamentCounter;
        t.name = _name;
        t.entryFee = _entryFee;
        t.maxParticipants = _maxParticipants;
        t.startTime = _startTime;
        t.endTime = _endTime;
        t.isActive = true;
        emit TournamentCreated(tournamentCounter, _name, _entryFee);
    }

    function joinTournament(uint256 _tournamentId) external {
        Tournament storage t = tournaments[_tournamentId];
        require(t.isActive, "inactive");
        require(!t.hasJoined[msg.sender], "joined");
        require(t.currentParticipants < t.maxParticipants, "full");
        require(block.timestamp < t.startTime, "closed");

        IERC20(address(gameToken)).safeTransferFrom(msg.sender, address(this), t.entryFee);
        t.participants.push(msg.sender);
        t.hasJoined[msg.sender] = true;
        t.currentParticipants++;
        t.prizePool += t.entryFee;
        emit PlayerJoined(_tournamentId, msg.sender);
    }

    function completeTournament(
        uint256 _tournamentId,
        address[] memory _winners,
        uint256[] memory _payouts
    ) external onlyOwner {
        Tournament storage t = tournaments[_tournamentId];
        require(t.isActive, "inactive");
        require(block.timestamp >= t.endTime, "not ended");
        require(_winners.length == _payouts.length, "mismatch");

        uint256 totalPayout = 0;
        for (uint256 i = 0; i < _payouts.length; i++) {
            totalPayout += _payouts[i];
        }

        uint256 burnAmount = (t.prizePool * BURN_PERCENTAGE) / 100;
        uint256 availableForPrizes = t.prizePool - burnAmount;
        require(totalPayout <= availableForPrizes, "exceeds funds");

        // Distribute prizes
        for (uint256 i = 0; i < _winners.length; i++) {
            IERC20(address(gameToken)).safeTransfer(_winners[i], _payouts[i]);
        }

        // Burn 50% of tournament revenue from this contract's balance
        gameToken.burn(burnAmount);

        t.isActive = false;
        t.isCompleted = true;
        emit TournamentCompleted(_tournamentId, _winners);
        emit RevenueBurned(_tournamentId, burnAmount);
    }
}

