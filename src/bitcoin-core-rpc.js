import fs from 'node:fs';
import os from 'node:os';

export class BitcoinCoreRpc {
  constructor({
    url = process.env.BITCOIN_RPC_URL || 'http://127.0.0.1:8332',
    username = process.env.BITCOIN_RPC_USERNAME || null,
    password = process.env.BITCOIN_RPC_PASSWORD || null,
    cookiePath = process.env.BITCOIN_COOKIE_PATH || `${os.homedir()}/.bitcoin/.cookie`,
    walletName = process.env.BITCOIN_RPC_WALLET || null,
    timeoutMs = 15000
  } = {}) {
    this.url = (url || 'http://127.0.0.1:8332').replace(/\/$/, '');
    this.username = username;
    this.password = password;
    this.cookiePath = cookiePath;
    this.walletName = walletName;
    this.timeoutMs = timeoutMs;
  }

  getAuthHeader() {
    if (this.username && this.password) {
      return `Basic ${Buffer.from(`${this.username}:${this.password}`).toString('base64')}`;
    }

    try {
      const cookie = fs.readFileSync(this.cookiePath, 'utf8').trim();
      const [user, pass] = cookie.split(':');
      if (user && pass) {
        return `Basic ${Buffer.from(`${user}:${pass}`).toString('base64')}`;
      }
    } catch {
      // fall through to error below
    }

    throw new Error(
      'Bitcoin Core auth not configured. Set rpcuser/rpcpassword or provide ~/.bitcoin/.cookie.'
    );
  }

  endpoint() {
    if (!this.walletName) return this.url;
    return `${this.url}/wallet/${encodeURIComponent(this.walletName)}`;
  }

  async request(method, params = []) {
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), this.timeoutMs);

    try {
      const response = await fetch(this.endpoint(), {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: this.getAuthHeader()
        },
        body: JSON.stringify({
          jsonrpc: '1.0',
          id: `${Date.now()}:${Math.random().toString(16).slice(2)}`,
          method,
          params
        }),
        signal: controller.signal
      });

      if (!response.ok) {
        const text = await response.text();
        throw new Error(`Bitcoin Core RPC request failed (${response.status}): ${text}`);
      }

      const payload = await response.json();
      if (payload.error) {
        throw new Error(`Bitcoin Core RPC error: ${payload.error.message}`);
      }

      return payload.result;
    } finally {
      clearTimeout(timeout);
    }
  }

  async getBlockchainInfo() {
    return this.request('getblockchaininfo');
  }

  async getNetworkInfo() {
    return this.request('getnetworkinfo');
  }

  async getWalletInfo() {
    return this.request('getwalletinfo');
  }

  async getNewAddress(label = 'bertrandsmint') {
    return this.request('getnewaddress', [label]);
  }

  async listUnspent(minConf = 1, maxConf = 9999999) {
    return this.request('listunspent', [minConf, maxConf]);
  }

  async getBalance(minConf = 0, includeWatchOnly = false) {
    return this.request('getbalance', ['*', minConf, includeWatchOnly]);
  }
}
