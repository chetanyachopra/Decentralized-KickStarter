const ganache = require('ganache-cli');
const Web3 = require('web3');
const web3 = new Web3(ganache.provider());  
const assert = require('assert');

const contractFactory = require('../ethereum/build/CampaignFactory.json');
const compiledCampaign = require('../ethereum/build/Campaign.json');

let accounts;
let factory;
let campaignAddress;
let campaign;

beforeEach(async ()=> {
    accounts = await web3.eth.getAccounts();
    //create factory instance
    factory = await new web3.eth.Contract(JSON.parse(contractFactory.interface))
    .deploy({ data: contractFactory.bytecode })
    .send({ from: accounts[0], gas: '1000000' });

    //create campaign from proxy contract or factory Contract
    await factory.methods.createCampaigns('2').send({
        from: accounts[0],
        gas: '1000000'
      });

    //get address of deployed contract
    // syntax same as campaignAddress=result[0];
    [campaignAddress] = await factory.methods.getDeployedCampaigns().call();

    // getting already deployed contact by factory
    campaign = await new web3.eth.Contract(
        JSON.parse(compiledCampaign.interface),
        campaignAddress
    );
});

describe('Campaign', () => {
    it('deploys factory and Contract', ()=> {
        assert.ok(factory.options.address);
        assert.ok(campaign.options.address);
    });

    it('marking caller as the manager of contract', async ()=> {
        const manager = await campaign.methods.manager().call();
        assert.equal(accounts[0], manager);
    });
});