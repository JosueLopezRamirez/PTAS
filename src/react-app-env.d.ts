// react-app-env.d.ts
/**
 * Copyright (c) King County. All rights reserved.
 * @packageDocumentation
 */

/// <reference types="react-scripts" />
declare namespace NodeJS {
  export interface ProcessEnv {
    /**
     *Application environment to determine whether is production, development, uat or something else
     */
    NODE_ENV: string;
    /**
     *Custom searches url
     */
    REACT_APP_CUSTOM_SEARCHES_URL: string;
  }
}
