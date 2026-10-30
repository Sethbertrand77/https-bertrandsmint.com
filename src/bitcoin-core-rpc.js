export class BitcoinCoreRpc {
  constructor({ url, username, password, timeoutMs = 15000 } = {}) {
    this.url = url || process.env.BITCOIN_RPC_URL || 'http://127.0.0.1:8332';
    this.username = username || process.env.BITCOIN_RPC_USERNAME || 'rpcuser';
    this.password = password || process.env.BITCOIN_RPC_PASSWORD || 'rpcpassword';
    this.timeoutMs = timeoutMs;
  }

  async request(method, params = []) {
    const body = JSON.stringify({ jsonrpc: '1.0', id: Date.now().toString(), method, params });
    const auth = Buffer.from(`${this.username}:${this.password}`).toString('base64');

    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), this.timeoutMs);

    try {
      const response = await fetch(this.url, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Basic ${auth}`
        },
        body,
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

  async getNewAddress(label = 'bertrandsmint') {
    return this.request('getnewaddress', [label]);
  }

  async listUnspent(minConf = 1, maxConf = 9999999) {
    return this.request('listunspent', [minConf, maxConf]);
  }

  async sendToAddress(address, amount, comment = '', commentTo = '') {
    return this.request('sendtoaddress', [address, amount, comment, commentTo]);
  }
}
