//https://eth-sepolia.g.alchemy.com/v2/A-wupFcxL7HXID8vG0Vw4-VBgHNFQNsu

require('@nomiclabs/hardhat-waffle');

module.exports = {
  solidity: '0.8.23',
  networks:{
    sepolia:{
      url:'https://eth-sepolia.g.alchemy.com/v2/A-wupFcxL7HXID8vG0Vw4-VBgHNFQNsu',
      accounts:['e081ea3bf7f625a89c29d5bcf3d834b52525838c8239fe70fb66ee380c0ce641']
    }
  }

};