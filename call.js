require('dotenv').config();
const { ethers } = require('ethers');
const chalk = require('chalk');
const readline = require('readline');

// Fungsi untuk menunggu dalam waktu tertentu
const sleep = (ms) => new Promise(resolve => setTimeout(resolve, ms));

// Setup readline interface untuk input pengguna
const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout
});

// Fungsi untuk meminta input dari pengguna
function askQuestion(query) {
    return new Promise(resolve => rl.question(query, resolve));
}

async function sendTransaction() {
    // Minta input dari pengguna
    const userInput = await askQuestion('Masukkan Address tanpa 0x: ');

    // Hex data yang diberikan
    const hexData = '0x56591d5962737370000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000' + userInput + '00000000000000000000000000000000000000000000000000005db134d0e8f2000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000001c6bf52634000';

    // Siapkan provider dan wallet
    const provider = new ethers.providers.JsonRpcProvider(process.env.RPC_URL);
    const wallet = new ethers.Wallet(process.env.PRIVATE_KEY, provider);

    // Siapkan transaksi tanpa gas limit atau gas price, karena akan dihitung otomatis
    const tx = {
        to: '0x1D5FD4ed9bDdCCF5A74718B556E9d15743cB26A2',  // Gantikan dengan alamat tujuan
        value: ethers.utils.parseEther('0.0005'),        // Nilai dalam ETH
        data: hexData,                                    // Data hex yang diberikan
    };

    let transactionCount = 1; // Nomor transaksi

    while (true) {
        try {
            // Dapatkan estimasi gas
            const estimatedGasLimit = await provider.estimateGas(tx);
            tx.gasLimit = estimatedGasLimit;

            // Dapatkan gas price sesuai jaringan
            const gasPrice = await provider.getGasPrice();
            tx.gasPrice = gasPrice;

            // Kirim transaksi
            const response = await wallet.sendTransaction(tx);

            // Tunggu konfirmasi transaksi
            await response.wait();

            // Dapatkan saldo sisa setelah transaksi
            const balance = await provider.getBalance(wallet.address);
            const formattedBalance = ethers.utils.formatEther(balance);

            // Format hash dengan link ke explorer
            const txHash = response.hash;
            //const explorerLink = `https://sepolia.arbiscan.io/tx/${txHash}`;

            // Log hasil transaksi
            console.log(`${chalk.yellow(transactionCount)}. ${chalk.blue('Sukses')} | ${chalk.green(`Balance: ${formattedBalance} ETH`)} `);
        } catch (error) {
            console.error(`${chalk.red('   Failed | Detail :')} \n${error.message}\n`);
        }

        // Jeda 5 detik
        await sleep(10000);
        transactionCount++; // Increment nomor transaksi
    }

    // Tutup readline interface setelah selesai
    rl.close();
}

sendTransaction();
