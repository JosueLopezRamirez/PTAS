// Save.tsx
/**
 * Copyright (c) King County. All rights reserved.
 * @packageDocumentation
 */

import React, {
    useState,
    PropsWithChildren,
} from "react";
import {
    withStyles,
    WithStyles,
    Box,
    Typography,
} from "@material-ui/core";
import { CustomButton, CustomTextField } from "@ptas/react-ui-library";
import clsx from "clsx";
import { useStyles } from "./styles";
import { Close } from "@material-ui/icons";

export interface FormValue {
    name: string | undefined;
    comments: string | undefined;
}

/**
 * Component props
 */
interface Props extends WithStyles<typeof useStyles> {
    onSave: (data: FormValue) => void;
    onClose: () => void;
}

/**
 * Save
 *
 * @param props - Component props
 * @returns A JSX element
 */
function Save(props: PropsWithChildren<Props>): JSX.Element {
    const {
        classes,
    } = props;

    const [name, setName] = useState<string>('');
    const [comments, setComments] = useState<string>();

    const onSave = (): void => {
        props.onSave({ name, comments });
    }

    return (
        <div className={classes.root}>
            <Box onClick={props.onClose} className={classes.closeButton}>
                <Close classes={{ root: classes.closeIcon }} />
            </Box>
            <Box className={classes.header}>
                <Typography variant={"body1"} className={classes.title}>
                    Save Duplicated Dataset
          </Typography>
            </Box>
            <Box className={classes.body}>
                <Box className={classes.bodyRow}>
                    <CustomTextField
                        label='Name'
                        value={name}
                        //eslint-disable-next-line
                        onChange={(value: any): void => {
                            setName(value.target.value);
                        }}
                        classes={{
                            root: clsx(classes.textFieldContainer)
                        }}
                    />
                </Box>
            </Box>
            <Box className={classes.bodyRow}>
                <CustomTextField
                    multiline
                    rows={4}
                    label='Comments'
                    style={{ width: "100%" }}
                    onChange={(t): void => {
                        setComments(t.currentTarget.value);
                    }}
                    defaultValue={""}
                />
            </Box>
            <Box className={classes.bodyRow}>
                <CustomButton
                    onClick={onSave}
                    classes={{ root: classes.okButton }}
                    disabled={name?.length === 0}
                    fullyRounded
                >
                    Save
          </CustomButton>
            </Box>
        </div>
    );
}

export default withStyles(useStyles)(Save);
