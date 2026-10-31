import { BitcoinCoreRpc } from './bitcoin-core-rpc.js';
import { LightningSupport } from './lightning.js';

const bitcoin = new BitcoinCoreRpc({
  url: process.env.BITCOIN_RPC_URL || 'http://127.0.0.1:8332',
  cookiePath: process.env.BITCOIN_COOKIE_PATH
});

const lightning = new LightningSupport({
  implementation: process.env.LIGHTNING_IMPLEMENTATION || 'lnd',
  baseUrl: process.env.LIGHTNING_RPC_URL || 'https://127.0.0.1:8080',
  macaroon: process.env.LIGHTNING_MACAROON || '',
  certPath: process.env.LIGHTNING_CERT_PATH || '',
  rune: process.env.LIGHTNING_RUNE || '',
  authToken: process.env.LIGHTNING_AUTH_TOKEN || '',
  allowInsecureTls: process.env.ALLOW_INSECURE_TLS === 'true'
});

const status = {
  bitcoin: null,
  lightning: null,
  implementation: lightning.implementation
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
