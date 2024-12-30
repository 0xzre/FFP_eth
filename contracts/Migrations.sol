// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

contract Migrations {
    address public owner;
    uint public lastCompletedMigration;

    // Modifier to restrict access to the owner
    modifier restricted() {
        require(msg.sender == owner, "Access restricted to the owner");
        _;
    }

    // Constructor to initialize the contract's owner
    constructor() {
        owner = msg.sender;
    }

    // Function to set the last completed migration
    function setCompleted(uint completed) public restricted {
        lastCompletedMigration = completed;
    }

    // Function to upgrade to a new migrations contract
    function upgrade(address newAddress) public restricted {
        Migrations upgraded = Migrations(newAddress);
        upgraded.setCompleted(lastCompletedMigration);
    }
}
