// App.tsx
/**
 * Copyright (c) King County. All rights reserved.
 * @packageDocumentation
 */

import React from 'react';
import { ptasCamaTheme } from '@ptas/react-ui-library';
import { ThemeProvider, CssBaseline } from '@material-ui/core';
import AppBarContainer from 'containers/AppBarContainer';
import { BrowserRouter, Switch, Route } from 'react-router-dom';
import ContentWrapper from 'components/ContentWrapper';
import NewSearch from 'routes/search/NewSearch';
import ViewSearch from 'routes/search/ViewSearch';
import { withAppProvider } from 'context/AppContext';
import ViewProject from 'routes/models/View';
import AllModels from 'routes/models/All';
import ViewDataset from 'routes/datasets/ViewDataset';
import NewTimeTrend from 'routes/models/View/NewTimeTrend';
import NewChart from 'routes/models/View/Charts/NewChart';

import ReportDisplay from 'routes/models/View/Report/ReportDisplay';
import { withNewTimeTrendProvider } from 'context/NewTimeTrendContext';

import InteractiveCharts from 'routes/models/View/Charts/index';
import './assets/form-styles/styles.scss';
import './assets/form-styles/loading.scss';
import ViewRegression from 'routes/models/View/Regression/ViewRegresssion';
import { withProjectProvider } from 'context/ProjectsContext';
//import SearchDetails from 'routes/search/Details';
import SearchResults from 'routes/search/Results';

import Supplementals from 'routes/models/View/Supplementals';
import TestForm from 'routes/test-forms';
import DatasetPage from 'components/DatasetPage';
import AddRegression from 'routes/models/View/Regression/AddRegression';
import MultipleRegression from 'routes/models/View/Regression/MultipleRegression';
import ViewMultipleRegression from 'routes/models/View/Regression/ViewMultipleRegression';
import Settings from 'routes/options/settings';
import GlobalVariables from 'routes/options/settings/GlobalVariables';
import NewAppraisalReport from 'routes/models/View/Projects/Appraisal/NewAppraisalReport';
import NewLandPage from 'routes/models/View/Projects/Land/LandNewPage';
import ViewLandPage from 'routes/models/View/Projects/Land/ViewLandPage';
import ViewLandPageEdit from 'routes/models/View/Projects/Land/ViewLandPageEdit';
import AnnualUpdate from 'routes/models/View/Projects/AnnualUpdate';
import { QueryParamProvider } from 'use-query-params';
import { RootView } from 'components/RootView';

function App(): JSX.Element {
  return (
    <BrowserRouter basename={process.env.PUBLIC_URL}>
      <ThemeProvider theme={ptasCamaTheme}>
        <QueryParamProvider ReactRouterRoute={Route}>
          <CssBaseline />
          <AppBarContainer />
          <ContentWrapper>
            <Switch>
              <Route exact path="/" component={RootView} />
              <Route
                path="/search/new-search"
                component={withAppProvider(NewSearch)}
              />
              <Route path="/duplicate/:datasetId" component={DatasetPage} />
              <Route
                path="/model/duplicate/:id/:datasetId"
                component={DatasetPage}
              />
              <Route path="/search/view-search/:id" component={ViewSearch} />
              <Route
                path="/models/new-regression/:id"
                component={withProjectProvider(AddRegression)}
              />
              <Route
                path="/models/new-land-model/:id"
                component={NewLandPage}
              />
              <Route
                path="/models/view-land-model/:id/create"
                component={ViewLandPage}
              />
              <Route
                path="/models/view-land-model/:id/edit/:regressionid"
                component={withProjectProvider(ViewLandPageEdit)}
              />
              <Route
                path="/models/estimated-market-regression/:id"
                component={withProjectProvider(MultipleRegression)}
              />
              <Route
                path="/search/results/:datasetId"
                component={DatasetPage}
              />
              <Route
                path="/new-search/results/:datasetId"
                component={DatasetPage}
              />
              <Route path="/search/results/" component={SearchResults} />
              <Route
                path="/models/results/chart/:id/:datasetId/:chartId/:chartTitle"
                component={DatasetPage}
              />{' '}
              <Route
                path="/models/results/:id/:datasetId"
                component={DatasetPage}
              />
              <Route
                path="/models/view/:id/new-appraisal-report"
                component={NewAppraisalReport}
              />
              <Route
                path="/models/view/:id"
                component={withProjectProvider(ViewProject)}
              />
              <Route
                path="/models/new-chart/:id"
                component={withProjectProvider(NewChart)}
              />
              <Route path="/datasets/:id" component={ViewDataset} />
              <Route
                path="/models/view-chart/:id/:datasetId/:chartId"
                component={withProjectProvider(InteractiveCharts)}
              />
              <Route
                path="/models/reports/:id/:postprocessId/:fileName"
                component={ReportDisplay}
              />
              <Route
                path="/models/regression/:id/:regressionid"
                component={withProjectProvider(ViewRegression)}
              />
              <Route
                path="/models/estimated_market_regression/:id/:regressionid"
                component={withProjectProvider(ViewMultipleRegression)}
              />
              <Route
                path="/models/supplementals/:id"
                component={withProjectProvider(Supplementals)}
              />
              <Route
                path="/models/annual-update/:id"
                component={withProjectProvider(AnnualUpdate)}
              />
              <Route
                path="/models/annual_update/:id/:regressionid"
                component={withProjectProvider(AnnualUpdate)}
              />
              <Route
                path="/models/supplementals_edit/:id/:regressionid"
                component={withProjectProvider(Supplementals)}
              />
              <Route
                exact
                path="/models/new-model"
                component={withNewTimeTrendProvider(NewTimeTrend)}
              />
              <Route
                exact
                path="/test"
                component={withProjectProvider(TestForm)}
              />
              <Route path="/models" component={AllModels} />
              <Route
                path="/settings/global-variables"
                component={GlobalVariables}
              />
              <Route path="/settings" component={Settings} />
            </Switch>
          </ContentWrapper>
        </QueryParamProvider>
      </ThemeProvider>
    </BrowserRouter>
  );
}

export default withAppProvider(App);
