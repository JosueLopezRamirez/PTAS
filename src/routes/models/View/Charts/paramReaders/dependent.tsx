// FILENAME
/**
 * Copyright (c) King County. All rights reserved.
 * @packageDocumentation
 */

import { Box } from '@material-ui/core';

import {
  CustomIconButton,
  CustomTextField,
  DropDownItem,
} from '@ptas/react-ui-library';
import { SimpleDropDown } from '@ptas/react-ui-library';
import React, { Fragment, useEffect, useState } from 'react';
import { GetDatasetColumnsResponseResults } from 'services/map.typings';
import { ChartShowParams, DependentVariable, Formulas } from './chart-utils';
import Clear from '@material-ui/icons/Clear';
import { ToCamel } from 'components/CamelToSpace';

const Dependent = ({
  datasetColumns,
  chartShowParams,
  dependentParams,
  onSetDependentParams,
  onDeleteItem,
  canDelete,
  defaultPlotStyle,
  isTemplate,
}: {
  datasetColumns: GetDatasetColumnsResponseResults;
  dependentParams?: DependentVariable;
  chartShowParams: ChartShowParams;
  onSetDependentParams: (values: DependentVariable) => void;
  onDeleteItem: () => void;
  canDelete: boolean;
  defaultPlotStyle?: string;
  isTemplate: boolean;
}): JSX.Element => {
  const numericColumns = datasetColumns.datasetColumns.filter(
    (dsc) => 'Int32,Decimal'.indexOf(dsc.columnType) > -1
  );
  const nv: DependentVariable = {
    VariableY: numericColumns[0].columnName,
    LegendPosition: 'Left',
    Formula: chartShowParams.NoAggregates ? 'None' : 'Sum',
    Style: defaultPlotStyle || 'bar',
    CustomFormula: 'Formula',
    ...dependentParams,
  };

  const [workingValue, setWorkingValue] = useState<DependentVariable>(nv);

  const setField = (newField: DependentVariable): void => {
    const xxx = { ...nv, ...newField };
    setWorkingValue(xxx);
  };

  const callOnSet = (): void => {
    onSetDependentParams(workingValue);
  };
  useEffect(callOnSet, [workingValue]);
  let PlotStyles = [
    { value: 'bar', label: 'Bar' },
    { value: 'line', label: 'Line' },
    { value: 'dotted', label: 'Dotted Line' },
  ];
  if (defaultPlotStyle) {
    PlotStyles = [
      { value: defaultPlotStyle, label: defaultPlotStyle },
      ...PlotStyles,
    ];
  }
  const disableStyle = !!defaultPlotStyle;
  const formulas = chartShowParams.NoAggregates ? ['None', 'Custom'] : Formulas;
  return (
    <Box className="select-box">
      <CustomIconButton
        className="clear-btn"
        icon={<Clear />}
        disabled={!canDelete}
        onClick={onDeleteItem}
      />
      {isTemplate && (
        <Fragment>
          <SimpleDropDown
            onSelected={(e): void => setField({ LegendPosition: `${e.value}` })}
            label="Legend Position"
            value={ToCamel(nv.LegendPosition ?? '')}
            items={[
              { value: 'Left', label: 'Left' },
              { value: 'Right', label: 'Right' },
            ]}
          />
          <CustomTextField
            label="Custom Formula"
            value={nv.CustomFormula}
            onChange={(e): void => setField({ CustomFormula: e.target.value })}
          />
        </Fragment>
      )}
      {!isTemplate && (
        <Fragment>
          <SimpleDropDown
            onSelected={(e): void => setField({ VariableY: `${e.value}` })}
            label="Variable (y)"
            value={nv.VariableY}
            disabled={nv.Formula === 'Custom'}
            items={numericColumns.map((dsc) => ({
              label: dsc.columnName,
              value: dsc.columnName,
            }))}
          />
          {chartShowParams.HasStyle && (
            <SimpleDropDown
              onSelected={(e): void => setField({ Style: `${e.value}` })}
              label="Style"
              value={nv.Style}
              items={PlotStyles}
              disabled={disableStyle}
            />
          )}
          {chartShowParams.HasLegendPosition && (
            <SimpleDropDown
              onSelected={(e): void =>
                setField({ LegendPosition: `${e.value}` })
              }
              label="Legend Position"
              value={nv.LegendPosition}
              items={[
                { value: 'Left', label: 'Left' },
                { value: 'Right', label: 'Right' },
              ]}
            />
          )}
          {chartShowParams.HasFormula && (
            <Fragment>
              <SimpleDropDown
                onSelected={(e): void => setField({ Formula: `${e.value}` })}
                label="Formula"
                value={nv.Formula}
                items={formulas.map(
                  (f: string): DropDownItem =>
                    ({ label: f, value: f } as DropDownItem)
                )}
              />
              {nv.Formula === 'Custom' && (
                <CustomTextField
                  label="Custom Formula"
                  value={nv.CustomFormula}
                  onChange={(e): void =>
                    setField({ CustomFormula: e.target.value })
                  }
                />
              )}
            </Fragment>
          )}
        </Fragment>
      )}
    </Box>
  );
};
export default Dependent;
