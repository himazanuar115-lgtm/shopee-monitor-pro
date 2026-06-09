import crypto from 'crypto';

const SHOPEE_API_BASE_URL = 'https://partner.shopeemobile.com';

interface ShopeeClientConfig {
  partnerId: number;
  partnerKey: string;
  shopId?: number;
  accessToken?: string;
}

interface ShopeeApiParams {
  [key: string]: any;
}

export class ShopeeClient {
  private partnerId: number;
  private partnerKey: string;
  private shopId?: number;
  private accessToken?: string;

  constructor(config: ShopeeClientConfig) {
    this.partnerId = config.partnerId;
    this.partnerKey = config.partnerKey;
    this.shopId = config.shopId;
    this.accessToken = config.accessToken;
  }

  private generateSign(apiPath: string, timestamp: number, body?: string): string {
    let baseString = `${this.partnerId}${apiPath}${timestamp}`;

    if (this.accessToken) {
      baseString += this.accessToken;
    }
    if (this.shopId) {
      baseString += this.shopId;
    }
    if (body) {
      baseString += body;
    }

    return crypto.createHmac('sha256', this.partnerKey).update(baseString).digest('hex');
  }

  private async makeRequest<T>(
    method: 'GET' | 'POST',
    apiPath: string,
    params: ShopeeApiParams = {},
    body?: object,
  ): Promise<T> {
    const timestamp = Math.floor(Date.now() / 1000);
    const url = new URL(`${SHOPEE_API_BASE_URL}${apiPath}`);

    const commonParams: ShopeeApiParams = {
      partner_id: this.partnerId,
      timestamp,
    };

    if (this.accessToken) {
      commonParams.access_token = this.accessToken;
    }
    if (this.shopId) {
      commonParams.shop_id = this.shopId;
    }

    const requestParams = { ...commonParams, ...params };
    let requestBodyString: string | undefined;
    if (body) {
      requestBodyString = JSON.stringify(body);
    }

    const sign = this.generateSign(apiPath, timestamp, requestBodyString);
    url.searchParams.set('sign', sign);

    for (const key in requestParams) {
      if (requestParams[key] !== undefined) {
        url.searchParams.set(key, String(requestParams[key]));
      }
    }

    const fetchOptions: RequestInit = { method, headers: { 'Content-Type': 'application/json' } };
    if (method === 'POST' && requestBodyString) {
      fetchOptions.body = requestBodyString;
    }

    const response = await fetch(url.toString(), fetchOptions);

    if (!response.ok) {
      const errorText = await response.text();
      console.error(`Shopee API Error (${apiPath}): ${response.status} - ${errorText}`);
      throw new Error(`Shopee API request failed: ${response.statusText} - ${errorText}`);
    }

    return response.json() as Promise<T>;
  }

  get<T>(apiPath: string, params: ShopeeApiParams = {}): Promise<T> {
    return this.makeRequest<T>('GET', apiPath, params);
  }

  post<T>(apiPath: string, body: object, params: ShopeeApiParams = {}): Promise<T> {
    return this.makeRequest<T>('POST', apiPath, params, body);
  }
}

export function createShopeeClient(config: ShopeeClientConfig): ShopeeClient {
  return new ShopeeClient(config);
}