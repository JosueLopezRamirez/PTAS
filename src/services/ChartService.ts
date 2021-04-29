// filename
/**
 * Copyright (c) King County. All rights reserved.
 * @packageDocumentation
 */

import {
  InteractiveChartDataInfoType,
  ViewChartServiceMethodsType,
  ViewChartServiceLinkType,
  InteractiveChart,
} from '../services/map.typings';
import { AxiosLoader } from '../services/AxiosLoader';

const ChartsService = (): ViewChartServiceMethodsType => {
  const viewChartsEndpoints = (
    chartNumber: string,
    continuationToken?: string | null
  ): ViewChartServiceLinkType => {
    return {
      getInteractiveChartDataByNumber: `CustomSearches/GetChartData/${chartNumber}`,
      getInteractiveChartDataByNumberNext: `CustomSearches/GetChartData/${chartNumber}?continuationToken=${continuationToken}`,
    };
  };

  const getInteractiveChartDataByNumber = async (
    chartNumber: string,
    isPlot: boolean,
  ): Promise<InteractiveChartDataInfoType | null> => {
    const loader = new AxiosLoader<InteractiveChartDataInfoType, {}>();
    return await loader.GetInfo(
      String(viewChartsEndpoints(chartNumber).getInteractiveChartDataByNumber),
      { isPlot }
    );
  };

  const getInteractiveChartDataByNumberNext = async (
    chartNumber: string,
    continuationToken: string | null,
    isPlot: boolean,
  ): Promise<InteractiveChartDataInfoType | null> => {
    const loader = new AxiosLoader<InteractiveChartDataInfoType, {}>(
    );
    return await loader.GetInfo(
      String(
        viewChartsEndpoints(chartNumber, continuationToken)
          .getInteractiveChartDataByNumberNext
      ),
      { isPlot }
    );
  };

  const
    getInteractiveChartInfo = async (chartId: string): Promise<InteractiveChart | null> => {

      const loader = new AxiosLoader<{ interactiveChart: InteractiveChart }, {}>(
      );
      const chartInfo = await loader.GetInfo(
        `CustomSearches/GetInteractiveChart/${chartId}`,
        {}
      );
      return chartInfo ? chartInfo.interactiveChart : null;
    };

  return {
    getInteractiveChartDataByNumber,
    getInteractiveChartDataByNumberNext,
    getInteractiveChartInfo
  };
};
export default ChartsService();
