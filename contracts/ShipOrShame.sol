// SPDX-License-Identifier: Apache-2.0
pragma solidity ^0.8.20;

/**
 * @title ShipOrShame
 * @dev A productivity dApp where users stake tokens on their commitments.
 * Ship on time to get your stake back, or fail and lose it to the reward pool.
 */
contract ShipOrShame {
    enum Status { Active, Shipped, Failed }

    struct Commitment {
        uint256 id;
        address creator;
        string description;
        uint256 stakeAmount;
        uint256 deadline;
        Status status;
    }

    uint256 public nextId;
    uint256 public rewardPool;
    Commitment[] public commitments;
    
    mapping(address => uint256) public successfulShipCount;
    mapping(address => uint256) public failedShipCount;

    event CommitCreated(uint256 indexed id, address indexed creator, string description, uint256 stakeAmount, uint256 deadline);
    event Shipped(uint256 indexed id, address indexed creator);
    event Failed(uint256 indexed id, address indexed creator, uint256 stakeAmount);

    /**
     * @dev Create a new commitment by staking MON tokens.
     * @param _description The task to be completed.
     * @param _durationInSeconds Time allowed to complete the task.
     */
    function commit(string memory _description, uint256 _durationInSeconds) external payable {
        require(msg.value > 0, "Stake must be greater than 0");
        require(_durationInSeconds > 0, "Duration must be greater than 0");

        uint256 deadline = block.timestamp + _durationInSeconds;
        
        commitments.push(Commitment({
            id: nextId,
            creator: msg.sender,
            description: _description,
            stakeAmount: msg.value,
            deadline: deadline,
            status: Status.Active
        }));

        emit CommitCreated(nextId, msg.sender, _description, msg.value, deadline);
        nextId++;
    }

    /**
     * @dev Mark a commitment as shipped. Only callable by the creator before the deadline.
     * @param _id The ID of the commitment.
     */
    function markShipped(uint256 _id) external {
        require(_id < commitments.length, "Invalid commitment ID");
        Commitment storage c = commitments[_id];
        
        require(msg.sender == c.creator, "Only creator can mark as shipped");
        require(c.status == Status.Active, "Commitment is not active");
        require(block.timestamp <= c.deadline, "Deadline has passed");

        c.status = Status.Shipped;
        successfulShipCount[msg.sender]++;

        // Refund the stake
        (bool success, ) = payable(msg.sender).call{value: c.stakeAmount}("");
        require(success, "Refund failed");

        emit Shipped(_id, msg.sender);
    }

    /**
     * @dev Trigger failure for a commitment that has passed its deadline.
     * Anyone can call this to clean up the state and move funds to the reward pool.
     * @param _id The ID of the commitment.
     */
    function triggerFail(uint256 _id) external {
        require(_id < commitments.length, "Invalid commitment ID");
        Commitment storage c = commitments[_id];

        require(c.status == Status.Active, "Commitment is not active");
        require(block.timestamp > c.deadline, "Deadline has not passed yet");

        c.status = Status.Failed;
        failedShipCount[c.creator]++;
        rewardPool += c.stakeAmount;

        emit Failed(_id, c.creator, c.stakeAmount);
    }

    /**
     * @dev Returns all commitments.
     */
    function getAllCommitments() external view returns (Commitment[] memory) {
        return commitments;
    }

    /**
     * @dev Returns the current reward pool balance.
     */
    function getRewardPoolBalance() external view returns (uint256) {
        return rewardPool;
    }
    /**
     * @dev Returns the total number of commitments.
     */
    function getCommitmentCount() external view returns (uint256) {
        return commitments.length;
    }
}
