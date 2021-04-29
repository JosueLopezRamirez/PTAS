// Forms.ts
/**
 * Copyright (c) King County. All rights reserved.
 * @packageDocumentation
 */

import { FormDefinition, ValidationResult, VarDefinition, FormSection } from 'components/FormBuilder/FormBuilder';
import { IsMatchingBrackets, IsValidIdentifiers } from './Utilities';

const regressionVars: VarDefinition[] = [
    {
        fieldName: "name",
        title: "Name",
        required: true,
        // width: 178,
    },
    {
        fieldName: "transformation",
        title: "Transformation",
        required: true,
        autoHeight: true,
        flex: 2,
        // width: ,
        onValidate: (value): ValidationResult => {
            if (!IsMatchingBrackets(value)) {
                return ({
                    message: "Brackets in this expression don't match. ", passed: false
                });
            }
            if (!IsValidIdentifiers(value)) {
                return ({
                    message: "Invalid identifiers.", passed: false
                });
            }
            return ({
                message: "", passed: true
            });
        }
    },
    {
        fieldName: "category",
        title: "Category",
        required: false,
        // width: 178,
    },
    {
        fieldName: "note",
        title: "Note",
        required: false,
        // width: 178,
    },
];

// // const RegressionTypes: Option[] = [
//     {
//         value: "linear",
//         title: "Linear",
//     },
//     // {
//     //     value: "secondorder",
//     //     title: "Second order polynomial",
//     // },
//     // {
//     //     value: "thirdorder",
//     //     title: "Third order polynomial",
//     // },
//     // {
//     //     value: "spline1",
//     //     title: "Spline 1",
//     // },
//     // {
//     //     value: "spline2",
//     //     title: "Spline 2",
//     // },
//     {
//         value: "spline3",
//         title: "Spline 3",
//     },
//     // {
//     //     value: "additive",
//     //     title: "Generalized additive model...",
//     // },
// ];

// // const RegressionFormSection: FormSection = {
// //     title: "Select a regression method",
// //     fields: [
// //         {
// //             title: "Regression Method",
// //             type: "dropdown",
// //             fieldName: "timetrend",
// //             options: RegressionTypes,
// //             className: "regression-sel",
// //             validations: [
// //                 {
// //                     type: "required",
// //                     message: "Please enter a value for time trend.",
// //                 },
// //             ],
// //         }]
// // }

// // const RegressionTypeChooserForm: FormDefinition = {
// //     sections: [RegressionFormSection],
// //     title: "",
// //     className: "bottom-line padding-bottom"
// // }

// // const NoneEditableRegressionTitle: FormSection = {
// //     title: "Regression",
// //     disabled: false,
// //     className: "col-1",
// //     fields: [
// //         {
// //             title: "Time Trend",
// //             type: "display",
// //             fieldName: "timetrend",
// //         },
// //         {
// //             title: "Name",
// //             type: "display",
// //             fieldName: "name",
// //             placeholder: "Name",
// //         },
// //     ],
// // };

const TimeTrendResultFields: FormSection =
{
    title: "Result",
    disabled: false,
    className: "bottom-line",
    fields: [
        {
            title: "Valuation Date",
            type: "display",
            fieldName: "valuationdate",
        },
        {
            title: "Coefficient",
            type: "display",
            fieldName: "coefficient",
            placeholder: "To be calculated",
        },
        {
            title: "Intercept",
            type: "display",
            fieldName: "intercept",
            placeholder: "To be calculated",
        },
    ],
};

const CalculatedValues: FormSection = {
    title: "",
    className: "",
    fields: [
        {
            title: "Calculated variables prior to regression",
            fieldName: "priorvars",
            className: "bottom-separated priorvars",
            type: "grid",
            vars: [...regressionVars],
        },
        {
            title: "Calculated variables post regression",
            fieldName: "postvars",
            className: "postvars bottom-separated",
            type: "grid",
            vars: [...regressionVars],
        },
    ],
};



export const NewRegressionForm: FormDefinition = {
    title: "",
    className: "linear-regression-display regression-vars",
    sections: [
        TimeTrendResultFields,
        CalculatedValues,
    ],
};



// // export const EditRegressionForm: FormDefinition = {
// //     title: "",
// //     className: "regression-display",
// //     sections: [
// //         NoneEditableRegressionTitle,
// //         TimeTrendResultFields,
// //         CalculatedValues,
// //     ],
// // };

