// Copyright (C) The Arvados Authors. All rights reserved.
//
// SPDX-License-Identifier: AGPL-3.0

import { Resource, ResourceKind } from "./resource";
import { safeLoad } from 'js-yaml';

export interface WorkflowResource extends Resource {
    kind: ResourceKind.WORKFLOW;
    name: string;
    description: string;
    definition: string;
}
export interface WorkflowResoruceDefinition {
    cwlVersion: string;
    $graph: Array<Workflow | CommandLineTool>;
}
export interface Workflow {
    class: 'Workflow';
    doc?: string;
    id?: string;
    inputs: CommandInputParameter[];
    outputs: any[];
    steps: any[];
}

export interface CommandLineTool {
    class: 'CommandLineTool';
    id: string;
    inputs: CommandInputParameter[];
    outputs: any[];
}

export type CommandInputParameter =
    BooleanCommandInputParameter |
    IntCommandInputParameter |
    LongCommandInputParameter |
    FloatCommandInputParameter |
    DoubleCommandInputParameter |
    StringCommandInputParameter |
    FileCommandInputParameter |
    DirectoryCommandInputParameter |
    StringArrayCommandInputParameter |
    FileArrayCommandInputParameter |
    DirectoryArrayCommandInputParameter |
    EnumCommandInputParameter;

export enum CWLType {
    NULL = 'null',
    BOOLEAN = 'boolean',
    INT = 'int',
    LONG = 'long',
    FLOAT = 'float',
    DOUBLE = 'double',
    STRING = 'string',
    FILE = 'File',
    DIRECTORY = 'Directory',
}

export interface CommandInputEnumSchema {
    symbols: string[];
    type: 'enum';
    label?: string;
    name?: string;
}

export interface CommandInputArraySchema<ItemType> {
    items: ItemType;
    type: 'array';
    label?: string;
}

export interface File {
    class: CWLType.FILE;
    location?: string;
    path?: string;
    basename?: string;
}

export interface Directory {
    class: CWLType.DIRECTORY;
    location?: string;
    path?: string;
    basename?: string;
}

export interface GenericCommandInputParameter<Type, Value> {
    id: string;
    label?: string;
    doc?: string | string[];
    default?: Value;
    type?: Type | Array<Type | CWLType.NULL>;
}
export type GenericArrayCommandInputParameter<Type, Value> = GenericCommandInputParameter<CommandInputArraySchema<Type>, Value[]>;

export type BooleanCommandInputParameter = GenericCommandInputParameter<CWLType.BOOLEAN, boolean>;
export type IntCommandInputParameter = GenericCommandInputParameter<CWLType.INT, number>;
export type LongCommandInputParameter = GenericCommandInputParameter<CWLType.LONG, number>;
export type FloatCommandInputParameter = GenericCommandInputParameter<CWLType.FLOAT, number>;
export type DoubleCommandInputParameter = GenericCommandInputParameter<CWLType.DOUBLE, number>;
export type StringCommandInputParameter = GenericCommandInputParameter<CWLType.STRING, string>;
export type FileCommandInputParameter = GenericCommandInputParameter<CWLType.FILE, File>;
export type DirectoryCommandInputParameter = GenericCommandInputParameter<CWLType.DIRECTORY, Directory>;
export type EnumCommandInputParameter = GenericCommandInputParameter<CommandInputEnumSchema, string>;

export type StringArrayCommandInputParameter = GenericArrayCommandInputParameter<CWLType.STRING, string>;
export type FileArrayCommandInputParameter = GenericArrayCommandInputParameter<CWLType.FILE, File>;
export type DirectoryArrayCommandInputParameter = GenericArrayCommandInputParameter<CWLType.DIRECTORY, Directory>;

export const parseWorkflowDefinition = (workflow: WorkflowResource): WorkflowResoruceDefinition => {
    const definition = safeLoad(workflow.definition);
    return definition;
};

export const getWorkflowInputs = (workflowDefinition: WorkflowResoruceDefinition) => {
    const mainWorkflow = workflowDefinition.$graph.find(item => item.class === 'Workflow' && item.id === '#main');
    return mainWorkflow
        ? mainWorkflow.inputs
        : undefined;
};
export const getInputLabel = (input: CommandInputParameter) => {
    return `${input.label || input.id}`;
};

export const isRequiredInput = ({ type }: CommandInputParameter) => {
    if (type instanceof Array) {
        for (const t of type) {
            if (t === CWLType.NULL) {
                return false;
            }
        }
    }
    return true;
};

export const isPrimitiveOfType = (input: GenericCommandInputParameter<any, any>, type: CWLType) =>
    input.type instanceof Array
        ? input.type.indexOf(type) > -1
        : input.type === type;

export const stringifyInputType = ({ type }: CommandInputParameter) => {
    if (typeof type === 'string') {
        return type;
    } else if (type instanceof Array) {
        return type.join(' | ');
    } else if (typeof type === 'object') {
        if (type.type === 'enum') {
            return 'enum';
        } else if (type.type === 'array') {
            return `${type.items}[]`;
        } else {
            return 'unknown';
        }
    } else {
        return 'unknown';
    }
};
