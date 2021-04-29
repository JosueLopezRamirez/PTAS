// filename
/**
 * Copyright (c) King County. All rights reserved.
 * @packageDocumentation
 */

import React from 'react';
import ReactDOM from 'react-dom';
import App from './App';
import * as serviceWorker from './serviceWorker';
import { BrowserRouter } from 'react-router-dom';
import { LicenseManager } from '@ag-grid-enterprise/core';

LicenseManager.setLicenseKey(
  'CompanyName=ZonesLLC_on_behalf_of_KingCounty,LicensedApplication=PTAS,LicenseType=SingleApplication,LicensedConcurrentDeveloperCount=3,LicensedProductionInstancesCount=1,AssetReference=AG-013871,ExpiryDate=15_March_2022_[v2]_MTY0NzMwMjQwMDAwMA==66c5140fe0a21937e56500329e634bfd'
);

ReactDOM.render(
  <BrowserRouter>
    <App />
  </BrowserRouter>,
  document.getElementById('root')
);

// If you want your app to work offline and load faster, you can change
// unregister() to register() below. Note this comes with some pitfalls.
// Learn more about service workers: https://bit.ly/CRA-PWA
serviceWorker.unregister();
