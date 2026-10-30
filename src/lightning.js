export class LightningSupport {
  constructor({ baseUrl, macaroon, certPath = null, timeoutMs = 15000 } = {}) {
    this.baseUrl = (baseUrl || process.env.LIGHTNING_RPC_URL || 'http://127.0.0.1:8080').replace(/\/$/, '');
    this.macaroon = macaroon || process.env.LIGHTNING_MACAROON || '';
    this.certPath = certPath || process.env.LIGHTNING_CERT_PATH || null;
    this.timeoutMs = timeoutMs;
  }

  async request(path, method = 'GET', body = null) {
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), this.timeoutMs);

    const headers = {
      Accept: 'application/json'
    };

    if (this.macaroon) {
      headers['Grpc-Metadata-macaroon'] = this.macaroon;
    }

    if (body && method !== 'GET') {
      headers['Content-Type'] = 'application/json';
    }

    const options = {
      method,
      headers,
      signal: controller.signal
    };

    if (body && method !== 'GET') {
      options.body = JSON.stringify(body);
    }

    try {
      const response = await fetch(`${this.baseUrl}${path}`, options);

      if (!response.ok) {
        const text = await response.text();
        throw new Error(`Lightning RPC request failed (${response.status}): ${text}`);
      }

      if (response.status === 204) {
        return null;
      }

      return response.json();
    } finally {
      clearTimeout(timeout);
    }
  }

  async getInfo() {
    return this.request('/v1/getinfo');
  }

  async listChannels() {
    return this.request('/v1/channels');
  }

  async addInvoice({ memo = 'bertrandsmint', value = 0, expiry = 3600 } = {}) {
    return this.request('/v1/invoices', 'POST', { memo, value, expiry });
  }
}
