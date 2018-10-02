// Copyright (C) The Arvados Authors. All rights reserved.
//
// SPDX-License-Identifier: AGPL-3.0

import * as React from 'react';
import { reduxForm, InjectedFormProps } from 'redux-form';
import { CommandInputParameter, CWLType, IntCommandInputParameter, BooleanCommandInputParameter, FileCommandInputParameter } from '~/models/workflow';
import { IntInput } from '~/views/run-process-panel/inputs/int-input';
import { StringInput } from '~/views/run-process-panel/inputs/string-input';
import { StringCommandInputParameter, FloatCommandInputParameter, isPrimitiveOfType } from '../../models/workflow';
import { FloatInput } from '~/views/run-process-panel/inputs/float-input';
import { BooleanInput } from './inputs/boolean-input';
import { FileInput } from './inputs/file-input';
import { connect } from 'react-redux';
import { compose } from 'redux';
import { Grid, StyleRulesCallback, withStyles, WithStyles } from '@material-ui/core';

const RUN_PROCESS_INPUTS_FORM = 'runProcessInputsForm';

export interface RunProcessInputFormProps {
    inputs: CommandInputParameter[];
}

export const RunProcessInputsForm = compose(
    connect((_: any, props: RunProcessInputFormProps) => ({
        initialValues: props.inputs.reduce(
            (values, input) => ({ ...values, [input.id]: input.default }),
            {}),
    })),
    reduxForm<any, RunProcessInputFormProps>({
        form: RUN_PROCESS_INPUTS_FORM
    }))(
        (props: InjectedFormProps & RunProcessInputFormProps) =>
            <form>
                <Grid container>
                    {props.inputs.map(input =>
                        <InputItem input={input} key={input.id} />)}
                </Grid>
            </form>);

type CssRules = 'inputItem';

const styles: StyleRulesCallback<CssRules> = theme => ({
    inputItem: {
        marginBottom: theme.spacing.unit * 2,
    }
});

const InputItem = withStyles(styles)(
    (props: WithStyles<CssRules> & { input: CommandInputParameter }) =>
        <Grid item xs={12} className={props.classes.inputItem}>
            {getInputComponent(props.input)}
        </Grid>);

const getInputComponent = (input: CommandInputParameter) => {
    switch (true) {
        case isPrimitiveOfType(input, CWLType.BOOLEAN):
            return <BooleanInput input={input as BooleanCommandInputParameter} />;

        case isPrimitiveOfType(input, CWLType.INT):
        case isPrimitiveOfType(input, CWLType.LONG):
            return <IntInput input={input as IntCommandInputParameter} />;

        case isPrimitiveOfType(input, CWLType.FLOAT):
        case isPrimitiveOfType(input, CWLType.DOUBLE):
            return <FloatInput input={input as FloatCommandInputParameter} />;

        case isPrimitiveOfType(input, CWLType.STRING):
            return <StringInput input={input as StringCommandInputParameter} />;

        case isPrimitiveOfType(input, CWLType.FILE):
            return <FileInput input={input as FileCommandInputParameter} />;

        default:
            return null;
    }
};
