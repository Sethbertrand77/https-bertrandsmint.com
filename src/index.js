import { BitcoinCoreRpc } from './bitcoin-core-rpc.js';
import { LightningSupport } from './lightning.js';

const bitcoin = new BitcoinCoreRpc({
  url: process.env.BITCOIN_RPC_URL || 'http://127.0.0.1:8332',
  username: process.env.BITCOIN_RPC_USERNAME || 'rpcuser',
  password: process.env.BITCOIN_RPC_PASSWORD || 'rpcpassword'
});

const lightning = new LightningSupport({
  baseUrl: process.env.LIGHTNING_RPC_URL || 'http://127.0.0.1:8080',
  macaroon: process.env.LIGHTNING_MACAROON || '',
  certPath: process.env.LIGHTNING_CERT_PATH || null
});

const status = {
  bitcoin: null,
  lightning: null
};

try {
  status.bitcoin = await bitcoin.getBlockchainInfo();
} catch (error) {
  status.bitcoin = {
    status: 'not connected',
    error: error.message
  };
}

try {
  status.lightning = await lightning.getInfo();
} catch (error) {
  status.lightning = {
    status: 'not connected',
    error: error.message
  };
}

console.log(JSON.stringify(status, null, 2));
