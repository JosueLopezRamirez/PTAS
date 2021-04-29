// Styles.tsx
/**
 * Copyright (c) King County. All rights reserved.
 * @packageDocumentation
 */

import { createStyles, StyleRules, Theme } from "@material-ui/core";

/**
 * Component styles
 */
export const useStyles = (theme: Theme): StyleRules =>
    createStyles({
        root: {
            flexGrow: 1,
            margin: theme.spacing(2, 4, 4)
        },
        header: {},
        body: {
            display: "flex",
            flexDirection: "column",
            justifyContent: "center"
        },
        bodyRow: {
            display: "flex",
            alignItems: "center",
            marginTop: theme.spacing(4)
        },
        textFieldContainer: {
            marginRight: 0,
            width: '100%'
        },
        select: {
            borderRadius: 0,
            borderColor: "#c4c4c4",
            "&:hover": {
                borderColor: "black"
            }
        },
        selectContainer: {
            marginRight: theme.spacing(22 / 8),
            width: 230
        },
        checkBoxContainer: {},
        switchChecked: {
            color: theme.ptas.colors.utility.selection
        },
        switchTrack: {
            backgroundColor: theme.ptas.colors.theme.black
        },
        selectIcon: {
            borderRadius: 0,
            border: "none",
            background: "none"
        },
        okButton: {
            marginLeft: "auto",
            marginRight: 0
        },
        title: {},
        customIconButton: {},
        closeButton: {
            position: "absolute",
            top: theme.spacing(2),
            right: theme.spacing(2),
            cursor: "pointer"
        },
        closeIcon: {
            width: 30,
            height: 30
        },

    });
