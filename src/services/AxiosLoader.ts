// filename
/**
 * Copyright (c) King County. All rights reserved.
 * @packageDocumentation
 */

import axios, { AxiosRequestConfig } from 'axios';
import fileDownload from 'js-file-download';
import {
  GenericFileSaver,
  GenericGetter,
  GenericPutter,
  IdOnly,
} from './map.typings';
const timeout = 4 * 60 * 1000;

export class AxiosLoader<Returned, Payload> {
  private _loadingData = false;
  _url: string;
  constructor() {
    this._url =
      process.env.REACT_APP_CUSTOM_SEARCHES_URL ||
      'https://ptas-sbox-customsearchesfunctions.azurewebsites.net/v1.0/API/';
  }

  public static Token = localStorage.getItem('magicToken');

  public PutInfo = ((): GenericPutter<Returned, Payload> => {
    const CancelToken = axios.CancelToken;
    const source = CancelToken.source();
    const calledFunction = async (
      relativeAddress: string,
      payload: Payload,
      callParams: { [index: string]: unknown },
      customHeaders?: { [index: string]: unknown },
      options?: AxiosRequestConfig
    ): Promise<Returned | null> => {
      if (this._loadingData) {
        return (source.token.promise as unknown) as Promise<Returned>;
      }
      if (!AxiosLoader.Token) return null;
      this._loadingData = true;

      const url = this._url + relativeAddress;
      console.log({ putInfo: url });
      try {
        const { data } = await axios.post<Returned>(url, payload || {}, {
          cancelToken: source.token,
          timeout: timeout,
          params: callParams,
          headers: {
            Authorization: `Bearer ${AxiosLoader.Token}`,
            ...customHeaders,
          },
          ...options,
        });
        this._loadingData = false;
        return data;
      } catch (e) {
        const message: string = e.response?.data?.message || `${e}`;
        const validationError = e.response?.data?.validationErrors || [];
        console.log({ message, payload });
        //eslint-disable-next-line
        if (validationError.length) throw { message, validationError };
        throw message;
      } finally {
        this._loadingData = false;
      }
    };
    return calledFunction;
  })();

  public GetInfo = ((): GenericGetter<Returned> => {
    const CancelToken = axios.CancelToken;
    const source = CancelToken.source();
    return async (
      relativeAddress: string,
      callParams: { [index: string]: unknown },
      requestParams?: { [index: string]: unknown }
    ): Promise<Returned | null> => {
      if (this._loadingData) {
        return (source.token.promise as unknown) as Promise<Returned>;
      }
      if (!AxiosLoader.Token) {
        return null;
      }
      this._loadingData = true;

      const url = this._url + relativeAddress;
      try {
        console.log({ getinfo: url });
        const { data } = await axios.get<Returned>(url, {
          cancelToken: source.token,
          timeout: timeout,
          params: callParams,
          headers: {
            Authorization: `Bearer ${AxiosLoader.Token}`,
          },
          ...requestParams,
        });
        this._loadingData = false;
        return data;
      } catch (e) {
        const details = e.response?.data?.details as string;
        const msg = e.response?.data?.message;
        if (details) {
          throw new Error(`${msg} ${details}.`);
        }
        throw msg || `${e}`;
      } finally {
        this._loadingData = false;
      }
    };
  })();

  public SaveFile = ((): GenericFileSaver => {
    const CancelToken = axios.CancelToken;
    const source = CancelToken.source();
    return async (relativeAddress: string, file: File): Promise<IdOnly> => {
      if (this._loadingData) {
        return (source.token.promise as unknown) as Promise<IdOnly>;
      }

      this._loadingData = true;

      const url = this._url + relativeAddress;
      try {
        const { data } = await axios.post<IdOnly>(url, file, {
          cancelToken: source.token,
          timeout: timeout,
          headers: {
            Authorization: `Bearer ${AxiosLoader.Token}`,
          },
        });
        this._loadingData = false;
        return data;
      } catch (e) {
        console.log(e);
        throw e;
      } finally {
        this._loadingData = false;
      }
    };
  })();
}

export const DownloadFile = async (
  url: string,
  fileName: string
): Promise<void> => {
  try {
    const response = await axios({
      url: url,
      method: 'GET',
      responseType: 'blob',
      headers: {
        Authorization: `Bearer ${AxiosLoader.Token}`,
      },
    });
    fileDownload(response.data, fileName);
  } catch (error) {
    console.log(error);
    throw error;
  }
};

interface QueueItem {
  relativeAddress: string;
  payload: unknown;
  callParams: { [index: string]: unknown };
  resolve: (value: unknown) => void;
  reject: (reason: string) => void;
}

export interface QueueManager {
  callQueued: <Payload>(
    relativeAddress: string,
    payload: Payload,
    callParams: {
      [index: string]: unknown;
    }
  ) => Promise<unknown>;
  stop: () => void;
  clear: () => void;
}

const sleep = (ms: number): Promise<void> => {
  return new Promise((resolve) => setTimeout(resolve, ms));
};

export const RequestQueue = ((): QueueManager => {
  let q: QueueItem[] = [];
  let stopped = false;

  (async (): Promise<void> => {
    const loader = new AxiosLoader<unknown, unknown>();
    do {
      if (q.length) {
        const [request, ...rest] = q;
        q = rest;
        try {
          const result = await loader.PutInfo(
            request.relativeAddress,
            request.payload,
            request.callParams
          );
          request.resolve(result);
        } catch (error) {
          request.reject(error);
        }
      } else if (!stopped) await sleep(1000);
    } while (!stopped);
  })();

  function rejectPending(): void {
    q.forEach((itm) => itm.reject('Process was stopped'));
    q = [];
  }

  function callQueued<Payload>(
    relativeAddress: string,
    payload: Payload,
    callParams: { [index: string]: unknown }
  ): Promise<unknown> {
    return new Promise((resolve, reject) => {
      q = [
        ...q,
        {
          relativeAddress,
          payload,
          callParams,
          resolve,
          reject,
        },
      ];
    });
  }

  return {
    callQueued: callQueued,
    stop: (): void => {
      stopped = true;
      rejectPending();
    },
    clear: (): void => {
      rejectPending();
    },
  };
})();
