// FILENAME
/**
 * Copyright (c) King County. All rights reserved.
 * @packageDocumentation
 */


import React, { useEffect, useState } from 'react'
import { InputLabel, MenuItem, Select } from '@material-ui/core';
import { GenericDropdownType } from 'services/map.typings';

interface SalesDropdownPropsType {
    options: GenericDropdownType[];
    getDatasetId: (datasetId: string) => void;
    datasetId?: string;
}

export const SalesDropdown = (props: SalesDropdownPropsType): JSX.Element => {
    const [value, setValue] = useState<string>("");

    useEffect(() => {
        if (!props.datasetId) {
            if (props.options.length)
                setValue(props.options[0].value);
            return;
        }
        setValue(props.datasetId);
    }, [props.options, props.datasetId])

    //eslint-disable-next-line
    const onChange = (e: any): void => {
        if (value === e?.target?.value) return;
        if (!e.target.value) return;
        setValue(`${e.target.value}`);
        props.getDatasetId && props.getDatasetId(`${e.target.value}`);
    }

    return (
        <div className="TimeTrend-formGroup sales">
            <InputLabel className="TimeTrend-label sales" id="label-for-dd">
                Select dataset:
            </InputLabel>
            <Select
                variant="outlined"
                className="drop-down"
                labelId="label-for-dd"
                fullWidth
                placeholder={'Sales'}
                value={value}
                onChange={onChange}
            >
                {props.options?.map((o, i) => (
                    <MenuItem key={i} value={o?.value}>
                        {o?.label}
                    </MenuItem>
                ))}
            </Select>
        </div>
    )
}
