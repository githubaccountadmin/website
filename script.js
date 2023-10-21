document.addEventListener('DOMContentLoaded', function() {
    const web3 = new Web3(Web3.givenProvider || 'https://rpc.pulsechain.com');
    let transactionCount = 33;  // Default to fetching the last 33 transactions
    let isConnected = false;  // Initialize to false to start

    async function checkInitialConnection() {
        const accounts = await web3.eth.getAccounts();
        if (accounts.length > 0) {
            isConnected = true;
            const networkId = await web3.eth.net.getId();
            checkPulseChain(networkId);
        } else {
            checkPulseChain(null);
        }
    }

    async function connectWallet() {
        const accounts = await window.ethereum.request({ method: 'eth_requestAccounts' });
        isConnected = true;
        const networkId = await web3.eth.net.getId();
        checkPulseChain(networkId);
    }

    function checkPulseChain(networkId) {
        const networkDisplay = document.getElementById('networkStatus');
        const pulseChainId = 369;
        if (isConnected) {  
            networkDisplay.innerHTML = networkId === pulseChainId ? "Connected to PulseChain" : "Not connected to PulseChain";
            networkDisplay.style.color = networkId === pulseChainId ? "green" : "red";
        } else {
            networkDisplay.innerHTML = "Wallet not connected";  
            networkDisplay.style.color = "red";
        }
    }

    async function publishMessage() {
        const contentInput = document.getElementById('postInput');
        const message = contentInput.value;
        const hexMessage = web3.utils.utf8ToHex(message);
        const accounts = await web3.eth.getAccounts();
        const fromAddress = accounts[0];
        const toAddress = '0x9Cd83BE15a79646A3D22B81fc8dDf7B7240a62cB';

        const tx = {
            from: fromAddress,
            to: toAddress,
            value: '0',
            data: hexMessage,
            gas: 30000
        };

        web3.eth.sendTransaction(tx)
            .on('transactionHash', function(hash){
                console.log('transactionHash', hash);
            })
            .on('receipt', function(receipt){
                console.log('receipt', receipt);
            })
            .on('error', function(error, receipt) {
                console.log('error', error);
            });
    }

    function postContent() {
        const contentInput = document.getElementById('postInput');
        const targetSection = document.getElementById('postList');
        const newContent = document.createElement('li');
        newContent.innerText = contentInput.value;
        targetSection.appendChild(newContent);
        contentInput.value = '';
    }

    async function fetchTransactionData() {
        const window = document.getElementById('transactionDataWindow');
        window.innerHTML = 'Fetching data...';

        const apiEndpoint = 'https://scan.pulsechain.com/api?module=account&action=txlist&address=0x9Cd83BE15a79646A3D22B81fc8dDf7B7240a62cB&sort=desc';

        try {
            const response = await fetch(apiEndpoint);
            const data = await response.json();
            let outputText = "";

            data.result.filter(tx => tx.input !== '0x').slice(0, transactionCount).forEach(tx => {
                try {
                    if (web3.utils.isHexStrict(tx.input)) {
                        const decodedInput = web3.utils.hexToUtf8(tx.input);
                        outputText += `User: ${tx.from}\nMessage: ${decodedInput}\n\n`;
                    }
                } catch (error) {
                    // Skip this transaction
                }
            });

            window.innerText = outputText;
        } catch (error) {
            console.error("Error details:", error.name, error.message);
            window.innerHTML = `Error fetching data: ${error.name} - ${error.message}`;
        }
    }

    function updateTransactionCount() {
        const newCount = parseInt(document.getElementById('transactionCountInput').value);
        if (!isNaN(newCount)) {
            transactionCount = newCount;
        }
    }

    document.getElementById('connectButton').addEventListener('click', connectWallet);
    document.getElementById('publishButton').addEventListener('click', publishMessage);
    document.getElementById('loadMoreTransactionsButton').addEventListener('click', fetchTransactionData);
    document.getElementById('transactionCountInput').addEventListener('input', updateTransactionCount);

    checkInitialConnection();
    fetchTransactionData();
});
