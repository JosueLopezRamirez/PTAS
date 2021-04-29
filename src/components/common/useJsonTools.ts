// useJsonTools.ts
/**
 * Copyright (c) King County. All rights reserved.
 * @packageDocumentation
 */

import { AppContext } from 'context/AppContext';
import fileDownload from 'js-file-download';
import { useContext, useState } from 'react';
import {
  convertFromExcelToJson,
  convertFromJsonToExcel,
} from 'services/common';
import { ExcelSheetJson, ExcelToJson } from 'services/map.typings';

type JsonMethods = {
  getExcelFromJson: (json: ExcelSheetJson, fileName: string) => Promise<void>;
  convertFromExcelToJson: (file: File) => Promise<ExcelToJson | null>;
  isLoading: boolean;
  fromExcelLoading: boolean;
};

export default function useJsonTools(): JsonMethods {
  const appContext = useContext(AppContext);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [fromExcelLoading, setFromExcelLoading] = useState<boolean>(false);

  return {
    getExcelFromJson: async (
      json: ExcelSheetJson,
      fileName: string
    ): Promise<void> => {
      try {
        setIsLoading(true);
        const file = await convertFromJsonToExcel(json);
        fileDownload(file as Blob, fileName);
      } catch (error) {
        appContext.setSnackBar &&
          appContext.setSnackBar({
            severity: 'error',
            text: 'Failed converting data to excel',
          });
      } finally {
        setIsLoading(false);
      }
    },
    convertFromExcelToJson: async (file: File): Promise<ExcelToJson | null> => {
      try {
        setFromExcelLoading(true);
        return await convertFromExcelToJson(file);
      } catch (error) {
        appContext.setSnackBar &&
          appContext.setSnackBar({
            severity: 'error',
            text: 'Failed converting excel to data',
          });
        return null;
      } finally {
        setFromExcelLoading(false);
      }
    },
    isLoading: isLoading,
    fromExcelLoading: fromExcelLoading,
  };
}
