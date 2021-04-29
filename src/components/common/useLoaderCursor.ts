// useLoaderCursor.ts
/**
 * Copyright (c) King County. All rights reserved.
 * @packageDocumentation
 */

type ToReturn = (state: boolean) => void;

export default function useLoaderCursor(): ToReturn {
    return (state: boolean): void => {
            if(state) {
                document.body.style.cursor = "progress"
            } else {
                document.body.style.cursor = "unset"
            }
        }
}