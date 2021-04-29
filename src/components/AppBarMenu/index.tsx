// index.tsx
/**
 * Copyright (c) King County. All rights reserved.
 * @packageDocumentation
 */
import React, { Fragment, memo, useContext, useState, useEffect } from 'react';
import SearchMenu from './SearchMenu';
import ModelMenu from './ModelMenu';
import MapMenu from './MapMenu';
import {
  MenuRoot,
  MenuRootContent,
  RenderMenuProps,
} from '@ptas/react-ui-library';
import NestedMenuItem from 'material-ui-nested-menu-item';
import LinkMenuItem from './LinkMenuItem';
import { Box, Divider, makeStyles } from '@material-ui/core';
import { AppContext } from 'context/AppContext';
import { gridOptionsMenu } from './gridOptionsMenu';
import { useHistory } from 'react-router-dom';
import GlobalVariablesModal from 'components/common/GlobalVariablesModal';
import AddVariablesModal from 'components/common/AddVariablesModal';
import '../../assets/grid-styles/appbar.scss';
import { StringParam, useQueryParam } from 'use-query-params';

const useStyles = makeStyles((theme) => ({
  menu: {
    marginLeft: 'auto',
  },
  root: {
    fontSize: "0.875rem",
    transition: 'none !important',
    fontFamily: theme.ptas.typography.bodyFontFamily,
    '&:hover': {
      backgroundColor: theme.ptas.colors.theme.grayLight,
    },
  },
}));

const AppBarMenu = (): JSX.Element => {
  const classes = useStyles();
  // const location = useLocation();
  const history = useHistory();
  const [
    openGlobalVariablesCategoty,
    setOpenGlobalVariablesCategory,
  ] = useState<boolean>(false);

  const [openAddVariableModal, setOpenAddVariableModal] = useState<boolean>(
    false
  );

  const [view, setView] = useState<string | null>(localStorage.getItem('view'));
  const [viewParam] = useQueryParam('view', StringParam);

  const {
    shouldDisplayVariablesGrid,
    toggleDisplayVariableGrid,
    toggleAutoFitColumns,
    currentGridRef,
    datasetMethods,
    disableVariablesMenu,
    toggleHideSelectedRows,
    toggleShowSelectedRows,
    selectAllRowsAction,
    unselectAllRowsAction,
    toggleDuplicateDataset,
    toggleDeleteSelectedRows,
    toggleDuplicateFilteredDataset,
    toggleShowColumns,
    showMapMenu,
    toggleHideDataColumns,
    shouldHideDataColumns,
    shouldHideVariablesColumns,
    toggleHideVariablesColumns
  } = useContext(AppContext);

  useEffect(() => {
    if (viewParam) {
      localStorage.setItem('view', viewParam);
      setView(viewParam);
    }
  }, [viewParam]);

  const getLabel = (label: string): string => {
    switch (label) {
      case 'Show/Hide data columns':
        if (shouldHideDataColumns) return 'Show data columns';
        return 'Hide data columns';
      case 'Show/Hide variables columns':
        if (shouldHideVariablesColumns) return 'Show variables columns';
        return 'Hide variables columns';
      default:
        return label;
    }
  }

  const menu = ({
    menuProps,
    isMenuRootOpen,
  }: RenderMenuProps): JSX.Element => {
    const onClickMenu = (label: string, parentLabel: string) => (): void => {
      if (parentLabel === 'Columns') {
        switch (label) {
          case 'Show all':
            if (toggleShowColumns) return toggleShowColumns();
            break;
          default:
            break;
        }
      }
      if (parentLabel === 'Group') {
        switch (label) {
          case 'Show/Hide data columns':
            toggleHideDataColumns && toggleHideDataColumns();
            break;
          case 'Show/Hide variables columns':
            toggleHideVariablesColumns && toggleHideVariablesColumns();
            break;
          default:
            break;
        }
      }
      switch (label) {
        case 'Autofit':
          if (toggleAutoFitColumns) {
            return toggleAutoFitColumns();
          }
          break;
        case 'Export to Excel...':
          if (datasetMethods?.methods.saveToFileClicked) {
            datasetMethods?.methods?.saveToFileClicked();
          }
          break;
        case 'Import...':
          if (datasetMethods?.methods.uploadFile) {
            datasetMethods?.methods?.uploadFile();
          }
          break;
        case 'Commit changes...':
          if (datasetMethods?.methods.commitClicked) {
            datasetMethods?.methods?.commitClicked();
          }
          break;
        case 'Refresh data...':
          if (datasetMethods?.methods.refreshClicked) {
            datasetMethods?.methods?.refreshClicked();
          }
          break;
        case 'Reset to default':
          currentGridRef?.current?.revertChanges();
          break;
        case 'Hide selected':
          if (toggleHideSelectedRows) {
            toggleHideSelectedRows(true);
          }
          break;
        case 'Show all':
          if (toggleShowSelectedRows) {
            toggleShowSelectedRows(true);
          }
          break;
        case 'Select all':
          if (selectAllRowsAction && unselectAllRowsAction) {
            selectAllRowsAction(true);
            unselectAllRowsAction(false);
          }
          break;
        case 'Unselect all':
          if (unselectAllRowsAction && selectAllRowsAction) {
            unselectAllRowsAction(true);
            selectAllRowsAction(false);
          }
          break;
        case 'Create a new dataset...':
          if (toggleDuplicateDataset) toggleDuplicateDataset();
          break;
        case 'Remove filtered rows...':
          if (toggleDeleteSelectedRows) toggleDeleteSelectedRows();
          break;
        case 'Create dataset from filtered rows...':
          if (toggleDuplicateFilteredDataset) toggleDuplicateFilteredDataset();
          break;
        default:
          break;
      }
    };

    const toggleGrid = (): void => {
      if (toggleDisplayVariableGrid) {
        toggleDisplayVariableGrid();
      }
    };
    return (
      <MenuRootContent {...menuProps}>
        {gridOptionsMenu.map((m, i) => (
          <span key={i}>
            <NestedMenuItem
              label={
                <Box component="span" width="100%">
                  {m.label}
                </Box>
              }
              parentMenuOpen={isMenuRootOpen}
              className={classes.root}
              button
            >
              {m?.childrens?.map((ch, i) => (
                <span key={i}>
                  <LinkMenuItem
                    display={getLabel(ch.label)}
                    closeMenu={onClickMenu(ch.label, m.label)}
                    avoidNavigation={true}
                  />
                  {ch.divider && <Divider />}
                </span>
              ))}
            </NestedMenuItem>
            {m.divider && <Divider />}
          </span>
        ))}
        <LinkMenuItem
          display={
            shouldDisplayVariablesGrid ? 'Hide variables' : 'Show variables'
          }
          closeMenu={toggleGrid}
          avoidNavigation={true}
        />
      </MenuRootContent>
    );
  };

  const variablesMenu = ({
    menuProps,
    closeMenu,
  }: RenderMenuProps): JSX.Element => {
    const refreshGrid = async (): Promise<void> => {
      if (
        shouldDisplayVariablesGrid &&
        currentGridRef &&
        currentGridRef.current
      ) {
        await currentGridRef?.current?.saveCalculatedCols();
      }

      closeMenu();
    };

    const openGlobalVariablesCategory = (): void => {
      setOpenGlobalVariablesCategory(true);
      closeMenu();
    };

    const openAddVariableModal = (): void => {
      setOpenAddVariableModal(true);
      closeMenu();
    };

    return (
      <MenuRootContent {...menuProps}>
        <LinkMenuItem
          display="Update variables"
          closeMenu={refreshGrid}
          avoidNavigation={true}
        />
        <LinkMenuItem
          display="Add global variables category..."
          closeMenu={openGlobalVariablesCategory}
          avoidNavigation={true}
          disable={disableVariablesMenu}
        />
        <LinkMenuItem
          display="Add global variables..."
          closeMenu={openAddVariableModal}
          avoidNavigation={true}
          disable={disableVariablesMenu}
        />
        <LinkMenuItem
          display="Add variables from model..."
          closeMenu={closeMenu}
        />
      </MenuRootContent>
    );
  };

  // const getValid = (): boolean => {
  //   if (location.pathname === '/search/new-search' && view === 'model')
  //     return true;
  //   if (location.pathname === '/search/new-search' && view === 'search')
  //     return false;
  //   return true;
  // };

  const getMenuOptions = (): JSX.Element => {
    if (view) {
      if ('model'.includes(view)) return <ModelMenu />;
      if ('search'.includes(view)) return <SearchMenu />;
    }
    return (
      <Fragment>
        <ModelMenu />
        <SearchMenu />
      </Fragment>
    );
  };

  const getMenuBySearch = (): JSX.Element => {
    return (
      <Fragment>
        {getMenuOptions()}
        <Fragment>
          {showMapMenu && <MenuRoot text="Grid">{menu}</MenuRoot>}
          {showMapMenu && <MapMenu />}
          {shouldDisplayVariablesGrid && (
            <MenuRoot text="Variables">{variablesMenu}</MenuRoot>
          )}
          <MenuRoot
            classes={{ root: classes.menu }}
            text="Settings"
            onClick={(): void => history.push('/settings')}
          />
          <MenuRoot text="Help" disabled>
            {menu}
          </MenuRoot>
          <GlobalVariablesModal
            isOpen={openGlobalVariablesCategoty}
            onClose={(): void => setOpenGlobalVariablesCategory(false)}
            onConfirm={(): void => {
              setOpenGlobalVariablesCategory(false);
            }}
          />
          <AddVariablesModal
            isOpen={openAddVariableModal}
            onClose={(): void => setOpenAddVariableModal(false)}
          />
        </Fragment>
      </Fragment>
    );
  };

  return <Fragment>{getMenuBySearch()}</Fragment>;
};

export default memo(AppBarMenu);
