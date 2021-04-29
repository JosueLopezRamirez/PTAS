// useJsonTools.ts
/**
 * Copyright (c) King County. All rights reserved.
 * @packageDocumentation
 */

import { AppContext } from 'context/AppContext';
import { useContext, useEffect, useState } from 'react';
import { SignalRResponseType } from 'services/map.typings';

type SignalRHookType = {
  message: SignalRResponseType | undefined;
};

export default function useSignalR(jobId: number): SignalRHookType {
  const { messages } = useContext(AppContext);
  const [message, setMessage] = useState<SignalRResponseType>();

  const verifyMessages = (): void => {
    if (messages?.length) {
      const message = messages.find((message) => message.jobId === jobId);
      if (message) {
        setMessage(message);
        console.log('SignalR -> ', message);
      }
    }
  };

  useEffect(verifyMessages, [messages]);

  return {
    message,
  };
}

interface MessageType {
  arg1: unknown;
  arg2: unknown;
  arg3: unknown;
  arg4: unknown;
}

interface MessageChannelType {
  message: MessageType | undefined;
}

export function useCustomChannel(channel: string): MessageChannelType {
  const { connection, connnectionIsStarted } = useContext(AppContext);
  const [message, setMessage] = useState<MessageType | undefined>();

  const initConnection = (): (() => void) => {
    if (connnectionIsStarted) {
      connection?.on(channel, callback);
      console.log(`connection on ${channel} successfully`);
    }
    return (): void => {
      connection?.off(channel);
    };
  };

  useEffect(initConnection, [connnectionIsStarted]);

  const callback = (
    arg1: unknown,
    arg2: unknown,
    arg3: unknown,
    arg4: unknown
  ): void => {
    const data = {
      arg1,
      arg2,
      arg3,
      arg4,
    };
    setMessage(data as MessageType);
    console.log('SignalR -> ', data);
  };

  return { message };
}
