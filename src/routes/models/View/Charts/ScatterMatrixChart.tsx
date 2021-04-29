// FILENAME
/**
 * Copyright (c) King County. All rights reserved.
 * @packageDocumentation
 */

import Loading from 'components/Loading';
import MessageDisplay from 'components/MessageDisplay';
import React, { Fragment } from 'react';
import {
  ChartExpression,
  IdValue,
  InteractiveChartResponseItemType,
} from 'services/map.typings';
import ScatterMatrixIndependent from '../ScatterMatrixIndependent';
import {
  GroupData,
  IndependentData,
  SplomValue,
} from './paramReaders/chart-utils';

const ScatterMatrixChart = ({
  chartData,
  chartExpressions,
  checkParcel,
}: {
  chartData: InteractiveChartResponseItemType;
  chartExpressions: ChartExpression[];
  checkParcel: (parcel: string) => Promise<void>;
}): JSX.Element => {
  if (!chartData) return <Loading />;

  if (!chartData.values) return <MessageDisplay message="No Info" />;

  const expressions = chartExpressions.reduce(
    (prev: { [id: string]: ChartExpression[] }, curr: ChartExpression) => {
      prev[curr.expressionRole] = [...(prev[curr.expressionRole] || []), curr];
      return prev;
    },
    {}
  );

  const inds = expressions.IndependentVariable?.map((iv: ChartExpression): {
    expression: ChartExpression;
    groupBy: ChartExpression | null;
  } => ({
    expression: iv,
    groupBy:
      expressions.GroupByVariable?.find(
        (gv) => gv.expressionGroup === iv.expressionGroup
      ) || null,
  }));

  const temp = inds.map((ind) => {
    if (ind.groupBy) {
      const data = chartData.values.reduce(
        (prev: { [id: string]: IdValue[] }, curr: IdValue) => {
          const currGroupValue = `${curr[ind.groupBy?.columnName || '']}`;
          const newVal = { ...curr };
          newVal[ind.groupBy?.columnName || ''] = undefined;
          prev[currGroupValue] = [...(prev[currGroupValue] || []), newVal];
          return prev;
        },
        {}
      );
      return { ind, data };
    }

    const otherData: IdValue = {};
    otherData[ind.expression.columnName] = chartData.values;
    return { ind, data: otherData };
  });

  const AllData: IndependentData[] = temp.map(
    (itm): IndependentData => {
      const mappedValues = Object.keys(itm.data).map((key) => {
        const result = {
          group: key,
          values: itm.data[key] as IdValue[],
        };
        return result;
      });
      const byDependent = expressions.DependentVariable.map((dv): GroupData[] =>
        mappedValues.map(
          (mv): GroupData => {
            const values = mv.values.map(
              (v): SplomValue => ({
                y: v[dv.columnName] as number,
                x: v[itm.ind.expression.columnName] as string,
                label: `${v.Major}-${v.Minor}`,
              })
            );
            return {
              group: mv.group,
              label: `${mv.group} ${itm.ind.groupBy?.columnName}`,
              dependent: dv.columnName,
              independent: itm.ind.expression.columnName,
              values,
            };
          }
        )
      );
      return {
        independent: itm.ind.expression.columnName,
        groupBy: itm.ind.groupBy?.columnName as string,
        groups: byDependent,
      };
    }
  );

  return (
    <div>
      {AllData.map((ad) => (
        <Fragment key={ad.independent}>
          {ad.groupBy && (
            <h2>
              {ad.independent} grouped by {ad.groupBy?.split('_')[0] ?? '-'}
            </h2>
          )}
          {!ad.groupBy && <h2>{ad.independent}</h2>}

          <ScatterMatrixIndependent checkParcel={checkParcel} independent={ad} />
        </Fragment>
      ))}
    </div>
  );
};

export default ScatterMatrixChart;
