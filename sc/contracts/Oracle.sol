// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

contract Oracle {
    Request[] public requests; // list of requests made to the contract
    uint public currentId = 0; // increasing request id
    uint public minQuorum = 2; // minimum number of responses to receive before declaring final result
    uint public totalOracleCount = 3; // Hardcoded oracle count

    // Defines a general API request
    struct Request {
        uint id;                          // request id
        string urlToQuery;                // API URL
        string attributeToFetch;          // JSON attribute (key) to retrieve in the response
        string agreedValue;               // value from key
        mapping(uint => string) answers;  // answers provided by the oracles
        mapping(address => uint) quorum;  // oracles which will query the answer (1=oracle hasn't voted, 2=oracle has voted)
    }

    // Event that triggers oracle outside of the blockchain
    event NewRequest(
        uint id,
        string urlToQuery,
        string attributeToFetch
    );

    // Triggered when there's a consensus on the final result
    event UpdatedRequest(
        uint id,
        string urlToQuery,
        string attributeToFetch,
        string agreedValue
    );

    function createRequest(
        string memory _urlToQuery,
        string memory _attributeToFetch
    ) public {
        Request storage newRequest = requests.push();
        newRequest.id = currentId;
        newRequest.urlToQuery = _urlToQuery;
        newRequest.attributeToFetch = _attributeToFetch;

        // Hardcoded oracle addresses
        newRequest.quorum[address(0x14dC79964da2C08b23698B3D3cc7Ca32193d9955)] = 1;
        newRequest.quorum[address(0x23618e81E3f5cdF7f54C3d65f7FBc0aBf5B21E8f)] = 1;
        newRequest.quorum[address(0xa0Ee7A142d267C1f36714E4a8F75612F20a79720)] = 1;

        emit NewRequest(
            currentId,
            _urlToQuery,
            _attributeToFetch
        );

        // Increment request id
        currentId++;
    }

    // Called by the oracle to record its answer
    function updateRequest(
        uint _id,
        string memory _valueRetrieved
    ) public {
        Request storage currRequest = requests[_id];

        // Check if oracle is in the list of trusted oracles
        // and if the oracle hasn't voted yet
        require(currRequest.quorum[msg.sender] == 1, "Oracle not authorized or already voted");

        // Marking that this address has voted
        currRequest.quorum[msg.sender] = 2;

        // Iterate through "array" of answers until a position is free and save the retrieved value
        uint tmpI = 0;
        bool found = false;
        while (!found) {
            // Find first empty slot
            if (bytes(currRequest.answers[tmpI]).length == 0) {
                found = true;
                currRequest.answers[tmpI] = _valueRetrieved;
            }
            tmpI++;
        }

        uint currentQuorum = 0;

        // Iterate through oracle list and check if enough oracles (minimum quorum)
        // have voted the same answer as the current one
        for (uint i = 0; i < totalOracleCount; i++) {
            if (keccak256(bytes(currRequest.answers[i])) == keccak256(bytes(_valueRetrieved))) {
                currentQuorum++;
                if (currentQuorum >= minQuorum) {
                    currRequest.agreedValue = _valueRetrieved;
                    emit UpdatedRequest(
                        currRequest.id,
                        currRequest.urlToQuery,
                        currRequest.attributeToFetch,
                        currRequest.agreedValue
                    );
                }
            }
        }
    }
}
