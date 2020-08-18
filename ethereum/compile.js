const path = require('path');
const solc = require('solc');
const fs = require('fs-extra');

const buildPath = path.resolve(__dirname, 'build');
fs.removeSync(buildPath);

const contractPath = path.resolve(__dirname, 'contracts', 'Campaign.sol');
const contract = fs.readFileSync(contractPath, 'utf8');
let compiledContract = solc.compile(contract, 1).contracts;

fs.ensureDirSync(buildPath);

for(let contract in compiledContract) {
    fs.outputJSONSync(
        path.resolve(buildPath, contract.replace(':', '') + '.json'), 
        compiledContract[contract]
        );
}

