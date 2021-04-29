// SalesData.tsx
/**
 * Copyright (c) King County. All rights reserved.
 * @packageDocumentation
 */

import React, { useContext, useState, useCallback, useEffect } from 'react';
import { makeStyles, Box } from '@material-ui/core';
import {
  ChipContainer,
  ChipItem,
  CustomPopover,
  ListSearch,
  CustomIconButton,
} from '@ptas/react-ui-library';
import { NewTimeTrendContext } from 'context/NewTimeTrendContext';
import AddCircleOutlineIcon from '@material-ui/icons/AddCircleOutline';
import { Area } from './typings';

interface Props {
  onSelectedItem?: (values: number, isSelected: boolean, text?: string) => void;
  selectedItems?: number[];
  type?: 'sales' | 'population';
}

const useStyles = makeStyles((theme) => ({
  root: {
    display: 'flex',
    flexDirection: 'column',
  },
  salesDataBottomRow: {
    display: 'flex',
    alignItems: 'center',
    marginBottom: theme.spacing(2.625),
  },
  salesDataCustomTabs: {
    width: 'unset !important',
    height: '30px',
  },
  salesLabel: {
    fontFamily: theme.ptas.typography.bodyFontFamily,
    fontSize: '0.875rem',
    fontWeight: 'bold',
    marginRight: theme.spacing(1.5),
  },
  numberNameTextField: {
    bottom: 7,
    marginLeft: theme.spacing(2),
    marginRight: theme.spacing(2),
    width: 169,
  },
  popover: {
    width: 400,
  },
  areaList: {
    '& li:focus': {
      backgroundColor: 'red',
    },
  },
  popoverPaper: {
    borderRadius: 9,
    padding: theme.spacing(1),
    paddingTop: 0,
  },
  chipContainer: {
    display: 'flex',
    flexWrap: 'wrap',
  },
  noDataBox: {
    fontSize: '1rem',
    padding: 16,
  },
  addIcon: {
    color: theme.ptas.colors.theme.accent,
  },
  emptyChipContainer: {
    height: 40,
  },
}));

/**
 * SalesData
 *
 * @param props - Component props
 * @returns A JSX element
 */
function SalesData(props: Props): JSX.Element {
  const classes = useStyles();
  const context = useContext(NewTimeTrendContext);
  const [event, setEvent] = useState<HTMLElement | null>(null);
  const [chipItems, setChipItems] = useState<ChipItem[]>();

  const cleanState = useCallback((): void => {
    setEvent(null);
  }, []);

  useEffect(() => {
    const selectedAreas =
      props.selectedItems &&
      props.selectedItems.map((v, i) => {
        const text = context.salesAreas?.results.find((a) => a.Value === v)
          ?.Key;

        const isDeletable = context.selectedProjectArea === v ? false : true;

        return { key: i, label: text, isDeletable: isDeletable } as ChipItem;
      });

    setChipItems(selectedAreas);
  }, [context.salesAreas, context.selectedProjectArea, props.selectedItems]);

  const List = (data: Area[] | undefined): JSX.Element => {
    if (!data || data.length < 1) return MessageBox('The model has no areas');
    return (
      <ListSearch
        data={data}
        onClick={(selectedItem: React.Key, isSelected: boolean, text?: string): void =>
          props.onSelectedItem &&
          props.onSelectedItem(selectedItem as number, isSelected, text)
        }
        selectedData={props.selectedItems}
        textFieldLabel="Find section name, page or code"
        lockedArea={context.selectedProjectArea}
      />
    );
  };

  const MessageBox = (message: string): JSX.Element => {
    return <Box className={classes.noDataBox}>{message}</Box>;
  };
  return (
    <Box className={classes.root}>
      <Box className={classes.salesDataBottomRow}>
        <CustomIconButton
          icon={<AddCircleOutlineIcon />}
          text="Add Area"
          onClick={(e): void => setEvent(e.currentTarget)}
          disabled={
            !context.selectedProjectType ||
            (props.type === 'population' &&
              context.populationSelectedAreas &&
              context.populationSelectedAreas.length === 1)
          }
        />
        <CustomPopover
          anchorEl={event}
          onClose={(): void => {
            cleanState();
          }}
          anchorOrigin={{
            vertical: 'center',
            horizontal: 'right',
          }}
          transformOrigin={{
            vertical: 'top',
            horizontal: 'left',
          }}
          classes={{ paper: classes.popoverPaper }}
        >
          {/* TODO - replace sales areas with population areas */}
          {props.type === 'population'
            ? List(context.salesAreas?.results)
            : List(context.salesAreas?.results)}
        </CustomPopover>
      </Box>
      {chipItems && chipItems?.length > 0 ? (
        <ChipContainer
          classes={{ root: classes.chipContainer }}
          chipData={chipItems ?? []}
          onChange={(c): void =>
            props.onSelectedItem &&
            props.onSelectedItem(parseInt(c.label), false)
          }
        />
      ) : (
        <div className={classes.emptyChipContainer}></div>
      )}
    </Box>
  );
}

export default SalesData;
