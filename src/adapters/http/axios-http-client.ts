import axios, { AxiosError, type AxiosInstance, type InternalAxiosRequestConfig } from "axios";
import type { HttpClient, HttpRequestConfig } from "./http-client.interface";

const TIMEOUT_MS = 60_000;

type TimedConfig = InternalAxiosRequestConfig & { startedAt?: number };

function requestUrl(config: InternalAxiosRequestConfig | undefined): string {
  if (!config) return "";
  const base = config.baseURL ?? "";
  const path = config.url ?? "";
  if (!base) return path;
  return `${base.replace(/\/$/, "")}/${path.replace(/^\//, "")}`;
}

export class AxiosHttpClient implements HttpClient {
  private readonly client: AxiosInstance;

  constructor(baseURL: string, defaultHeaders: Record<string, string> = {}) {
    this.client = axios.create({
      baseURL,
      headers: {
        "Content-Type": "application/json",
        ...defaultHeaders,
      },
      timeout: TIMEOUT_MS,
    });

    this.client.interceptors.request.use((config: TimedConfig) => {
      config.startedAt = Date.now();
      console.info("[reacher] request", {
        method: (config.method ?? "get").toUpperCase(),
        url: requestUrl(config),
        timeoutMs: TIMEOUT_MS,
      });
      return config;
    });

    this.client.interceptors.response.use(
      (response) => {
        const config = response.config as TimedConfig;
        console.info("[reacher] response", {
          method: (config.method ?? "get").toUpperCase(),
          url: requestUrl(config),
          status: response.status,
          ms: config.startedAt ? Date.now() - config.startedAt : undefined,
        });
        return response;
      },
      (error: AxiosError) => {
        const config = error.config as TimedConfig | undefined;
        console.error("[reacher] failed", {
          method: (config?.method ?? "get").toUpperCase(),
          url: requestUrl(config),
          code: error.code,
          message: error.message,
          status: error.response?.status,
          ms: config?.startedAt ? Date.now() - config.startedAt : undefined,
        });
        return Promise.reject(error);
      },
    );
  }

  async get<T>(url: string, config?: HttpRequestConfig): Promise<T> {
    const response = await this.client.get<T>(url, {
      headers: config?.headers,
      params: config?.params,
    });
    return response.data;
  }

  async post<T>(
    url: string,
    data?: unknown,
    config?: HttpRequestConfig,
  ): Promise<T> {
    const response = await this.client.post<T>(url, data, {
      headers: config?.headers,
      params: config?.params,
    });
    return response.data;
  }
}
