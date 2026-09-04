// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import "@openzeppelin/contracts/access/AccessControl.sol";

/// @title Honey Chain Registry
/// @notice On-chain traceability proof layer. Critical lifecycle events and identity/certificate
/// hashes only — raw sensor telemetry and application data stay off-chain in Postgres, per PRD.
contract HoneyChainRegistry is AccessControl {
    bytes32 public constant RECORDER_ROLE = keccak256("RECORDER_ROLE");

    enum LifecycleState { HARVESTED, EXTRACTED, PACKED, DISPATCHED, RECEIVED, AVAILABLE_FOR_SALE }

    struct Batch {
        bool exists;
        string batchCode;
        LifecycleState status;
    }

    struct Bottle {
        bool exists;
        string bottleCode;
        bytes32 batchId;
        LifecycleState status;
    }

    struct LifecycleEvent {
        bytes32 entityId;
        bool isBottle;
        LifecycleState eventType;
        address actor;
        uint256 timestamp;
    }

    struct Certificate {
        bytes32 batchId;
        string certificateRef;
        bytes32 metadataHash;
        string issuer;
        uint256 timestamp;
    }

    mapping(bytes32 => Batch) public batches;
    mapping(bytes32 => Bottle) public bottles;
    mapping(bytes32 => LifecycleEvent[]) private _entityEvents;
    mapping(bytes32 => Certificate[]) private _batchCertificates;

    event BatchRegistered(bytes32 indexed batchId, string batchCode, address indexed actor);
    event BottleRegistered(bytes32 indexed bottleId, bytes32 indexed batchId, string bottleCode, address indexed actor);
    event LifecycleEventRecorded(bytes32 indexed entityId, bool isBottle, LifecycleState eventType, address indexed actor, uint256 timestamp);
    event CertificateRecorded(bytes32 indexed batchId, string certificateRef, bytes32 metadataHash, address indexed actor);

    constructor(address admin) {
        _grantRole(DEFAULT_ADMIN_ROLE, admin);
        _grantRole(RECORDER_ROLE, admin);
    }

    function registerBatch(bytes32 batchId, string calldata batchCode) external onlyRole(RECORDER_ROLE) {
        require(!batches[batchId].exists, "Batch already registered");
        batches[batchId] = Batch({ exists: true, batchCode: batchCode, status: LifecycleState.HARVESTED });
        emit BatchRegistered(batchId, batchCode, msg.sender);
    }

    function registerBottle(bytes32 bottleId, bytes32 batchId, string calldata bottleCode) external onlyRole(RECORDER_ROLE) {
        require(batches[batchId].exists, "Batch does not exist");
        require(!bottles[bottleId].exists, "Bottle already registered");
        bottles[bottleId] = Bottle({ exists: true, bottleCode: bottleCode, batchId: batchId, status: LifecycleState.PACKED });
        emit BottleRegistered(bottleId, batchId, bottleCode, msg.sender);
    }

    function recordEvent(bytes32 entityId, bool isBottle, LifecycleState eventType) external onlyRole(RECORDER_ROLE) {
        if (isBottle) {
            require(bottles[entityId].exists, "Bottle does not exist");
            bottles[entityId].status = eventType;
        } else {
            require(batches[entityId].exists, "Batch does not exist");
            batches[entityId].status = eventType;
        }
        _entityEvents[entityId].push(LifecycleEvent({
            entityId: entityId,
            isBottle: isBottle,
            eventType: eventType,
            actor: msg.sender,
            timestamp: block.timestamp
        }));
        emit LifecycleEventRecorded(entityId, isBottle, eventType, msg.sender, block.timestamp);
    }

    function recordCertificate(
        bytes32 batchId,
        string calldata certificateRef,
        bytes32 metadataHash,
        string calldata issuer
    ) external onlyRole(RECORDER_ROLE) {
        require(batches[batchId].exists, "Batch does not exist");
        _batchCertificates[batchId].push(Certificate({
            batchId: batchId,
            certificateRef: certificateRef,
            metadataHash: metadataHash,
            issuer: issuer,
            timestamp: block.timestamp
        }));
        emit CertificateRecorded(batchId, certificateRef, metadataHash, msg.sender);
    }

    function getProductHistory(bytes32 entityId) external view returns (LifecycleEvent[] memory) {
        return _entityEvents[entityId];
    }

    function getCertificates(bytes32 batchId) external view returns (Certificate[] memory) {
        return _batchCertificates[batchId];
    }
}