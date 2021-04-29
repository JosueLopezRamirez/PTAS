"use strict";
// filename
/**
 * Copyright (c) King County. All rights reserved.
 * @packageDocumentation
 */
exports.__esModule = true;
var react_1 = require("react");
var react_ui_library_1 = require("@ptas/react-ui-library");
var core_1 = require("@material-ui/core");
var AppBarContainer_1 = require("containers/AppBarContainer");
var react_router_dom_1 = require("react-router-dom");
var ContentWrapper_1 = require("components/ContentWrapper");
var NewSearch_1 = require("routes/search/NewSearch");
var ViewSearch_1 = require("routes/search/ViewSearch");
var AppContext_1 = require("context/AppContext");
var View_1 = require("routes/models/View");
var All_1 = require("routes/models/All");
var NewRegression_1 = require("routes/models/View/Regression/NewRegression");
var ViewRegresssion_1 = require("routes/models/ViewRegresssion");
var ViewDataset_1 = require("routes/datasets/ViewDataset");
var Reports_1 = require("routes/models/View/Report/ReportDisplay");
// import './assets/form-styles/styles.scss';
function App() {
    return (react_1["default"].createElement(react_router_dom_1.BrowserRouter, null,
        react_1["default"].createElement(core_1.ThemeProvider, { theme: react_ui_library_1.ptasCamaTheme },
            react_1["default"].createElement(core_1.CssBaseline, null),
            react_1["default"].createElement(AppBarContainer_1["default"], null),
            react_1["default"].createElement(ContentWrapper_1["default"], null,
                react_1["default"].createElement(react_router_dom_1.Switch, null,
                    react_1["default"].createElement(react_router_dom_1.Route, { exact: true, path: "/" },
                        react_1["default"].createElement(react_router_dom_1.Redirect, { to: "/models/all" })),
                    react_1["default"].createElement(react_router_dom_1.Route, { exact: true, path: "/search/new-search", component: NewSearch_1["default"] }),
                    react_1["default"].createElement(react_router_dom_1.Route, { path: "/search/view-search/:id", component: ViewSearch_1["default"] }),
                    react_1["default"].createElement(react_router_dom_1.Route, { path: "/models/newRegression/:id", component: NewRegression_1["default"] }),
                    react_1["default"].createElement(react_router_dom_1.Route, { path: "/models/view/:id", component: View_1["default"] }),
                    react_1["default"].createElement(react_router_dom_1.Route, { path: "/datasets/:id", component: ViewDataset_1["default"] }),
                    react_1["default"].createElement(react_router_dom_1.Route, { path: "/reports/:postprocessId/:fileName", component: Reports_1["default"] }),
                    react_1["default"].createElement(react_router_dom_1.Route, { path: "/models/regression/:id/:regressionid", component: ViewRegresssion_1["default"] }),
                    react_1["default"].createElement(react_router_dom_1.Route, { path: "/models/new", component: ViewSearch_1["default"] }),
                    react_1["default"].createElement(react_router_dom_1.Route, { path: "/models", component: All_1["default"] }))))));
}
exports["default"] = AppContext_1.withAppProvider(App);
