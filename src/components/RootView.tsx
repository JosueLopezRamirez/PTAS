/**
 * Copyright (c) King County. All rights reserved.
 * @packageDocumentation
 */

import axios from 'axios';
import React, { useContext, useEffect, useState } from 'react';
import { Redirect } from 'react-router-dom';
import jwt from 'jsonwebtoken';
import { AppContext } from 'context/AppContext';
import { StringParam, useQueryParam } from 'use-query-params';
import Loading from './Loading';

export const RootView = (): JSX.Element => {
  const { setSnackBar } = useContext(AppContext);
  const [view] = useQueryParam('view', StringParam);
  const [token] = useQueryParam('token', StringParam);
  const [redirectHome, setRedirectHome] = useState<boolean>(false);

  const initValidationUrl = (): void => {
    verifyQueryParamsInUrl();
  };

  useEffect(initValidationUrl, []);

  const verifyQueryParamsInUrl = async (): Promise<void> => {
    if (view?.length) localStorage.setItem('view', view);
    if (token?.length)
      if (!verifyExistInLocalStorage(token)) return getMagicToken(token);
    verifyTokenValid();
  };

  const verifyTokenValid = (): void => {
    const magicToken = localStorage.getItem('magicToken');
    const decoded = jwt.decode(magicToken ?? '');
    if (
      !decoded ||
      typeof decoded !== 'object' ||
      !decoded.exp ||
      Date.now() >= decoded.exp * 1000
    ) {
      localStorage.setItem('view', '');
      localStorage.setItem('magicToken', '');
      localStorage.setItem('tokenUrl', '');
      setSnackBar &&
        setSnackBar({
          severity: 'error',
          text: 'Invalid token. Please authenticate from Dynamics CE.',
        });
    } else {
      setRedirectHome(true);
    }
  };

  const verifyExistInLocalStorage = (tokenUrl: string): boolean => {
    const tokenLocal = localStorage.getItem('tokenUrl');
    if (tokenLocal !== tokenUrl) {
      localStorage.setItem('tokenUrl', tokenUrl);
      return false;
    }
    return true;
  };

  const getMagicToken = async (token: string): Promise<void> => {
    try {
      const response = await axios.get(`${process.env.REACT_APP_MAGIC_LINK}`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      localStorage.setItem('magicToken', response.data);
      setRedirectHome(true);
    } catch (error) {
      console.log(error);
    }
  };

  const renderHome = (): JSX.Element => {
    if (redirectHome) {
      const viewLocal = localStorage.getItem('view');
      if (!view && !viewLocal) {
        localStorage.setItem('view', 'search');
        return <Redirect to="/search/new-search" />;
      }
      if (view === 'search') return <Redirect to="/search/new-search" />;
      if (view === 'model') return <Redirect to="/models" />;
      if (viewLocal === 'search') return <Redirect to="/search/new-search" />;
      if (viewLocal === 'model') return <Redirect to="/models" />;
    }
    return <Loading></Loading>;
  };

  return renderHome();
};
