// FILENAME
/**
 * Copyright (c) King County. All rights reserved.
 * @packageDocumentation
 */

import { Box } from '@material-ui/core';
import {
  CustomIconButton,
  CustomSwitch,
  CustomTextField,
  SimpleDropDown,
} from '@ptas/react-ui-library';
import React, { Fragment, useEffect, useState } from 'react';
import { GetDatasetColumnsResponseResults } from 'services/map.typings';
import {
  BinTypes,
  ChartShowParams,
  CreateIndependent,
  IndependentVariable,
} from './chart-utils';
import Clear from '@material-ui/icons/Clear';
const Independent = ({
  datasetColumns,
  chartShowParams,
  independentParams,
  onSetIndependentParams,
  onDeleteItem,
  canDelete,
  isTemplate,
}: {
  datasetColumns: GetDatasetColumnsResponseResults;
  independentParams?: IndependentVariable;
  chartShowParams: ChartShowParams;
  onSetIndependentParams: (values: IndependentVariable) => void;
  onDeleteItem: () => void;
  canDelete: boolean;
  isTemplate: boolean;
}): JSX.Element => {
  const numericColumns = datasetColumns.datasetColumns.filter(
    (dsc) => 'Int32,Decimal'.indexOf(dsc.columnType) > -1
  );
  const nv: IndependentVariable = {
    VariableX: numericColumns[0].columnName,
    ...CreateIndependent(),
    ...independentParams,
  };

  const [workingValue, setWorkingValue] = useState<IndependentVariable>(nv);

  const setField = (newField: IndependentVariable): void => {
    const xxx = { ...nv, ...newField };
    setWorkingValue(xxx);
  };

  const callOnSet = (): void => {
    onSetIndependentParams(workingValue);
  };
  useEffect(callOnSet, [workingValue]);
  useEffect(callOnSet, []);

  const ColumnItems = [
    {
      label: 'Unset',
      value: 'not-set',
    },
    ...datasetColumns.datasetColumns.map((dsc) => ({
      label: dsc.columnName,
      value: dsc.columnName,
    })),
  ];

  const getBreakItems = (): { label: string; value: string }[] => {
    // console.log(datasetColumns.datasetColumns);
    const lookups = datasetColumns.datasetColumns.filter(
      (c) =>
        c.canBeUsedAsLookup ||
        c.forceEditLookupExpression ||
        c.hasEditLookupExpression
    );
    return [
      {
        label: 'Unset',
        value: 'not-set',
      },
      ...lookups.map((dsc) => ({
        label: dsc.columnName,
        value: dsc.columnName,
      })),
    ];
  };

  return (
    <Fragment>
      <Box className="select-box">
        <CustomIconButton
          className="clear-btn"
          icon={<Clear />}
          disabled={!canDelete}
          onClick={onDeleteItem}
        />
        {isTemplate && (
          <Fragment>
            <CustomTextField
              value={nv.ColumnName}
              onChange={(e): void => setField({ ColumnName: e.target.value })}
              label="Column Name"
            ></CustomTextField>{' '}
            <CustomTextField
              value={nv.VariableX}
              onChange={(e): void => setField({ VariableX: e.target.value })}
              label="Script"
            ></CustomTextField>{' '}
            <CustomTextField
              value={nv.GroupBy}
              onChange={(e): void => setField({ GroupBy: e.target.value })}
              label="Group Name"
            ></CustomTextField>{' '}
            <CustomTextField
              value={nv.GroupByScript}
              onChange={(e): void =>
                setField({ GroupByScript: e.target.value })
              }
              label="Group Script"
            ></CustomTextField>
          </Fragment>
        )}
        {!isTemplate && (
          <Fragment>
            <SimpleDropDown
              onSelected={(e): void => setField({ VariableX: `${e.value}` })}
              label="Variable (x)"
              value={nv.VariableX}
              items={ColumnItems}
            />
            {chartShowParams.HasGroupBy && (
              <SimpleDropDown
                onSelected={(e): void =>
                  setField({ GroupBy: `${e.value ?? 'not-set'}` })
                }
                label="Group By"
                value={nv.GroupBy}
                items={ColumnItems}
              />
            )}
            {chartShowParams.HasBreak && (
              <SimpleDropDown
                onSelected={(e): void => setField({ Break: `${e.value}` })}
                label="Break"
                value={nv.Break}
                items={getBreakItems()}
              />
            )}
            {chartShowParams.HasBins && (
              <Fragment>
                <SimpleDropDown
                  onSelected={(e): void => setField({ Bins: `${e.value}` })}
                  label="Bins"
                  value={nv.Bins}
                  items={BinTypes}
                />
                {workingValue.Bins === 'number' && (
                  <Fragment>
                    <CustomTextField
                      className="number-input"
                      type="number"
                      value={nv.Num}
                      onChange={(e): void =>
                        setField({ Num: parseInt(e.target.value) })
                      }
                      label="number"
                    ></CustomTextField>
                    {chartShowParams.HasLimits && (
                      <Fragment>
                        <CustomTextField
                          className="number-input"
                          type="number"
                          value={nv.Min}
                          onChange={(e): void =>
                            setField({ Min: parseInt(e.target.value) })
                          }
                          label="min"
                        ></CustomTextField>
                        <CustomTextField
                          type="number"
                          className="number-input"
                          value={nv.Max}
                          onChange={(e): void =>
                            setField({ Max: parseInt(e.target.value) })
                          }
                          label="max"
                        ></CustomTextField>
                      </Fragment>
                    )}
                  </Fragment>
                )}
                <CustomSwitch
                  label="Discrete Bins"
                  defaultState={nv.Discrete}
                  isChecked={(v: boolean): void => setField({ Discrete: v })}
                />
              </Fragment>
            )}
          </Fragment>
        )}
      </Box>
    </Fragment>
  );
};
export default Independent;
