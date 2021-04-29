// SearchReader.tsx
/**
 * Copyright (c) King County. All rights reserved.
 * @packageDocumentation
 */

import { AxiosLoader } from 'services/AxiosLoader';
import React, { useEffect, useState, Fragment } from 'react';
import {
  FormDefinition,
  FieldType,
  Field,
  FormSection,
  FormValues,
  Option,
} from 'components/FormBuilder/FormBuilder';
import {
  CustomSearchParameter,
  SearchParam,
  SearchParameters,
} from 'services/map.typings';
import FormBuilder from 'components/FormBuilder';
import Loading from 'components/Loading';

const getFormDefinition = (data: CustomSearchParameter[]): FormDefinition => {
  const dataMapping: { [id: string]: FieldType } = {
    Int32: 'number',
    DateTime: 'date',
    Boolean: 'boolean',
  };
  const fields = data.reduce((a, b, _index, original) => {
    const newType = b.lookupValues
      ? 'dropdown'
      : dataMapping[b.type] || 'textbox';
    const newItem: Field = {
      defaultValue: b.defaultValue,
      label: b.description,
      fieldName: b.name,
      fieldId: b.id,
      validations: b.isRequired
        ? [{ type: 'required', message: `Field ${b.name} is required.` }]
        : [],
      options:
        b.lookupValues?.map(
          (v) => ({ title: v.Key ?? v.Value, value: v.Value } as Option)
        ) ?? [],
      type: newType,
    };
    if (b.parameterRangeType === 'RangeStart') {
      const foundRange = original.find(
        (itm) =>
          itm.parameterGroupName === b.parameterGroupName && itm.id !== b.id
      );
      return [
        ...a,
        {
          ...newItem,
          isRange: true,
          toRangeField: foundRange?.name,
          toRangeFieldId: foundRange?.id,
          toRangeDefaultValue: foundRange?.defaultValue,
          title: 'From',
          label: newItem.label?.replace('From', '').replace('Start', ''),
        },
      ];
    }

    if (b.parameterRangeType === 'RangeEnd') {
      return a;
    }
    return [...a, newItem];
  }, [] as Field[]);

  const f: FormDefinition = {
    title: '',
    className: 'search-form',
    sections: [
      {
        fields: fields,
      },
    ],
  };

  return f;
};

const getSearchParameters = (
  values: FormValues,
  fields: Field[]
): SearchParameters[] => {
  const parameters = Object.keys(values).reduce(
    (prevValue: SearchParameters[], b, _i): SearchParameters[] => {
      let fff = fields.find((field) => field.fieldName === b);
      let itemId: number;
      let name: string;
      if (!fff) {
        fff = fields.find((field) => {
          return field.toRangeField === b;
        });
        itemId = fff?.toRangeFieldId || -1;
        name = fff?.toRangeField || 'failed' + b;
      } else {
        itemId = fff?.fieldId || -1;
        name = b;
      }
      return [{ id: itemId, value: values[b], name: name }, ...prevValue];
    },
    []
  );

  return parameters;
};

const SearchReader = ({
  searchId,
  onValuesChanged,
  onValidChanged,
}: {
  searchId: string;
  onValuesChanged: (searchParams: SearchParam) => void;
  onValidChanged: (value: boolean) => void;
}): JSX.Element => {
  const [formDefinition, setFormDefinition] = useState<FormDefinition | null>(
    null
  );
  const [formData, setFormData] = useState<FormValues | null>(null);
  const [newFormValues, setNewFormValues] = useState<FormValues>({});

  useEffect(() => {
    const allFields =
      formDefinition?.sections.reduce(
        (a: Field[], b: FormSection): Field[] => [...a, ...b.fields],
        []
      ) || [];

    // const parameters = Object.keys(newFormValues).reduce(
    //   (prevValue: SearchParameters[], currentValue, index): SearchParameters[] => {
    //     const fff = allFields[index];
    //     return [
    //       {
    //           id: fff?.fieldId || 0,
    //           value: newFormValues[currentValue],
    //           name: fff?.fieldName,
    //       },
    //       ...prevValue,
    //     ];
    //   },
    //   []
    // );
    const toSend: SearchParam = {
      parameters: getSearchParameters(newFormValues, allFields),
      datasetName: null,
      folderPath: null,
      comments: '',
    };

    onValuesChanged(toSend);
  }, [formDefinition, newFormValues, onValuesChanged]);

  useEffect(() => {
    let fetching = false;
    const fetchData = async (): Promise<void> => {
      if (fetching) return;
      fetching = true;
      const loader = new AxiosLoader<
        { customSearchParameters: CustomSearchParameter[] },
        {}
      >();
      const data = await loader.GetInfo(
        `CustomSearches/GetCustomSearchParameters/${searchId}`,
        {
          includeLookupValues: true,
        }
      );
      if (!data) return;
      const formDef = getFormDefinition(data.customSearchParameters);
      console.log({ data, formDef });
      setFormDefinition(formDef);
      fetching = false;
    };
    fetchData();
  }, [searchId]);

  useEffect(() => {
    if (!formDefinition) return;
    const fieldValues: { [id: string]: number | Date | boolean | string } = {
      number: '0',
      date: new Date(),
      textbox: '',
      dropdown: '',
      display: '',
      boolean: true,
    };
    const ttt = formDefinition?.sections.reduce(
      (f: Field[], b: FormSection) => {
        return [...f, ...b.fields];
      },
      [] as Field[]
    );
    const sss =
      ttt?.reduce((a, b) => {
        const t = fieldValues[b.type as string];
        a[b.fieldName] = b.defaultValue === null ? t : b.defaultValue || '';
        if (b.isRange) {
          a[b.toRangeField || ''] =
            b.toRangeDefaultValue === null ? t : b.toRangeDefaultValue || '';
        }
        return a;
      }, {} as { [id: string]: number | Date | boolean | string }) || {};
    setFormData(sss);
  }, [formDefinition]);

  if (!formDefinition) return <Loading />;

  if (!formData || !formDefinition) return <Loading />;
  return (
    <Fragment>
      {/* <pre>{JSON.stringify({ data, formDefinition }, null, 3)}</pre> */}
      <div style={{ height: 10 }}></div>
      <div style={{ borderLeft: '1px solid silver' }}>
        <FormBuilder
          onDataChange={(formValues: FormValues): void => {
            setNewFormValues(formValues);
          }}
          onValidChange={onValidChanged}
          formData={formData}
          formInfo={formDefinition}
        />
      </div>
    </Fragment>
  );
};

export default SearchReader;
