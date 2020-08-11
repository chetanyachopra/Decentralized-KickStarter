pragma solidity ^0.4.17;

contract CampaignFactory {
    address[] public deployedCampaigns;
    
    function createCampaigns(uint minumumContributions) public {
        address deployedCampaign = new Campaign(minumumContributions, msg.sender);
        
        deployedCampaigns.push(deployedCampaign);
    }
    
    function getDeployedCampaigns() public view returns(address[]) {
        return deployedCampaigns;
    }
}

contract Campaign {
    
    struct Request { 
        string description;
        uint value;
        address recipient;
        bool complete;
        uint approvalCount;
        mapping(address => bool) approvals;
    }
    
    Request[] public requests;
    address public manager;
    mapping(address => bool) public approvers;
    uint approversCount;
    uint public minimumContribution;
    
    function Campaign(uint minimumValueNeeded, address creator) public {
        minimumContribution = minimumValueNeeded;
        manager = creator;
    }
    
    function contribute() public payable {
        require(requests.length > 0);
        require(msg.value > minimumContribution);
        
        approvers[msg.sender] = true;
        
        approversCount++;   
    }
    
    function createRequest(string description, uint value, address recipient) public payable restricted {
        require(msg.sender == manager);
        Request memory newRequest = Request({
           description: description, 
           value: value, 
           recipient: recipient, 
           complete: false,
           approvalCount: 0
        });
        
        requests.push(newRequest);
    }
    
    function approveRequest(uint index) public {
        Request storage request = requests[index];
        
        // access is allowed to approvers only
        require(approvers[msg.sender]);
        require(!request.approvals[msg.sender]);
        
        request.approvals[msg.sender] = true;
        request.approvalCount++;
        
    }
    
    function finalizeRequest(uint index) public restricted {
        Request storage request = requests[index];
        
        require(request.approvalCount > (request.approvalCount / 2));
        
        require(!request.complete);
        
        // transfer money to recipient
        request.recipient.transfer(request.value);
        request.complete = true;
    }
    
    modifier restricted() {
        require(msg.sender == manager);
        _;
    }
}