import fs from 'node:fs';
import https from 'node:https';

export class LightningSupport {
  constructor({
    implementation = process.env.LIGHTNING_IMPLEMENTATION || 'lnd',
    baseUrl = process.env.LIGHTNING_RPC_URL || 'https://127.0.0.1:8080',
    macaroon = process.env.LIGHTNING_MACAROON || '',
    certPath = process.env.LIGHTNING_CERT_PATH || '',
    rune = process.env.LIGHTNING_RUNE || '',
    authToken = process.env.LIGHTNING_AUTH_TOKEN || '',
    rpcUser = process.env.CLN_RPC_USER || '',
    rpcPass = process.env.CLN_RPC_PASS || '',
    timeoutMs = 15000,
    allowInsecureTls = process.env.ALLOW_INSECURE_TLS === 'true'
  } = {}) {
    this.implementation = (implementation || 'lnd').toLowerCase();
    this.baseUrl = (baseUrl || 'https://127.0.0.1:8080').replace(/\/$/, '');
    this.macaroon = macaroon;
    this.certPath = certPath;
    this.rune = rune;
    this.authToken = authToken;
    this.rpcUser = rpcUser;
    this.rpcPass = rpcPass;
    this.timeoutMs = timeoutMs;
    this.allowInsecureTls = allowInsecureTls;
  }

  buildHeaders(body = null, method = 'GET') {
    const headers = { Accept: 'application/json' };

    if (this.implementation === 'lnd') {
      if (this.macaroon) {
        headers['Grpc-Metadata-macaroon'] = this.macaroon;
      }
      if (this.authToken) {
        headers.Authorization = `Bearer ${this.authToken}`;
      }
    }

    if (this.implementation === 'cln') {
      if (this.rune) {
        headers.Rune = this.rune;
      }
      if (this.authToken) {
        headers.Authorization = `Bearer ${this.authToken}`;
      }
      if (this.rpcUser && this.rpcPass) {
        headers.Authorization = `Basic ${Buffer.from(`${this.rpcUser}:${this.rpcPass}`).toString('base64')}`;
      }
    }

    if (body !== null && method !== 'GET') {
      headers['Content-Type'] = 'application/json';
    }

    return headers;
  }

  async request(path, method = 'GET', body = null) {
    const target = new URL(path, `${this.baseUrl}/`);
    const headers = this.buildHeaders(body, method);
    const payload = body !== null && method !== 'GET' ? JSON.stringify(body) : undefined;

    if (target.protocol === 'https:') {
      return this.requestHttps(target, method, headers, payload);
    }

    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), this.timeoutMs);

    try {
      const response = await fetch(target, {
        method,
        headers,
        body: payload,
        signal: controller.signal
      });

      if (!response.ok) {
        const text = await response.text();
        throw new Error(`Lightning RPC request failed (${response.status}): ${text}`);
      }

      if (response.status === 204) return null;

      const text = await response.text();
      return text ? JSON.parse(text) : null;
    } finally {
      clearTimeout(timeout);
    }
  }

  requestHttps(target, method, headers, payload) {
    return new Promise((resolve, reject) => {
      const options = {
        method,
        headers,
        rejectUnauthorized: !this.allowInsecureTls
      };

      if (this.certPath) {
        try {
          options.ca = fs.readFileSync(this.certPath);
        } catch {
          options.rejectUnauthorized = false;
        }
      }

      if (this.allowInsecureTls) {
        options.rejectUnauthorized = false;
      }

      const req = https.request(target, options, (res) => {
        let text = '';

        res.on('data', (chunk) => {
          text += chunk.toString();
        });

        res.on('end', () => {
          if (res.statusCode >= 400) {
            reject(new Error(`Lightning RPC request failed (${res.statusCode}): ${text}`));
            return;
          }

          if (res.statusCode === 204 || !text.trim()) {
            resolve(null);
            return;
          }

          try {
            resolve(JSON.parse(text));
          } catch {
            reject(new Error(`Invalid JSON response from Lightning RPC: ${text}`));
          }
        });
      });

      req.on('error', reject);
      req.setTimeout(this.timeoutMs, () => {
        req.destroy(new Error('Lightning RPC request timed out'));
      });

      if (payload) {
        req.write(payload);
      }

      req.end();
    });
  }

  async getInfo() {
    return this.request('/v1/getinfo');
  }

  async listChannels() {
    return this.request('/v1/channels');
  }

  async listPeers() {
    return this.request('/v1/peers');
  }

  async addInvoice({ memo = 'bertrandsmint', value = 0, expiry = 3600 } = {}) {
    return this.request('/v1/invoices', 'POST', {
      memo,
      value,
      expiry
    });
  }
}
