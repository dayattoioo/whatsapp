const ws_rpc = "wss://speedy-nodes-nyc.moralis.io/8e2c5042d5f0c566fd8df33a/polygon/mumbai/ws";
const http_rpc = "https://speedy-nodes-nyc.moralis.io/8e2c5042d5f0c566fd8df33a/polygon/mumbai";
const Web3 = require("web3");
const tx_event = "0xddf252ad1be2c89b69c2b068fc378daa952ba7f163c4a11628f55a4df523b3ef";
const web3 = new Web3(ws_rpc);
const abi = require("human-standard-token-abi");
const { read } = require('./db')
class TrackTransaction {
    constructor(){}
    track(client, text) {
        const _this = this;
        console.log("tracking run");
        var subscription = web3.eth.subscribe(
            "logs",
            {
                topics: [tx_event],
            },

            async function (error, result) {
                _this.address_list = read();
                if (!error) {
                    const { data, topics, address, transactionHash, blockNumber } = result;
                    const from = _this.toAddress(topics[1]);
                    const to = _this.toAddress(topics[2]);
                    const value = web3.utils.hexToNumberString(data);
                    _this.address_list.map(async (addr) => {
                        if (from.toLowerCase() === addr.address.toLowerCase()) {
                            const detail = {
                                from,
                                to,
                                value,
                                contract: await _this.Contract(address),
                                transactionHash,
                                blockNumber,
                            };
                            detail.value = Number(detail.value) / 10 ** detail.contract.dec;
                            const txt = [
                                `🚨 *New Transactions* 🚨\n`,
                                `Wallet: ${addr.name}`,
                                `Ststus : Sent`,
                                `From : ${detail.from}`,
                                `To : ${detail.to}`,
                                `Value: ${detail.value} ${detail.contract.symbol}`
                            ]
                            client.sendMessage(addr.user, txt.join('\n'), text)
                        }
                        if (to.toLowerCase() === addr.address.toLowerCase()) {
                            const detail = {
                                from,
                                to,
                                value,
                                contract: await _this.Contract(address),
                                transactionHash,
                                blockNumber,
                            };
                            detail.value = Number(detail.value) / 10 ** detail.contract.dec;
                            const txt = [
                                `🚨 *New Transactions* 🚨\n`,
                                `Wallet: ${addr.name}`,
                                `Ststus : Received`,
                                `From : ${detail.from}`,
                                `To : ${detail.to}`,
                                `Value: ${detail.value} ${detail.contract.symbol}`
                            ]
                            client.sendMessage(addr.user, txt.join('\n'), text)
                        }
                    });
                }
            }
        );
        // unsubscribes the subscription
        subscription.unsubscribe(function (error, success) {
            if (success) console.log("Successfully unsubscribed!");
        });
    }

    async Contract(address) {
        try {
            const web3 = new Web3(http_rpc);
            const Contract = new web3.eth.Contract(abi, address);
            return {
                name: await Contract.methods.name().call(),
                dec: await Contract.methods.decimals().call(),
                symbol: await Contract.methods.symbol().call(),
            };
        } catch (error) {}
    }

    toAddress(address) {
        if (address) return address.replace("0x000000000000000000000000", "0x");
    }
}

module.exports = TrackTransaction;
