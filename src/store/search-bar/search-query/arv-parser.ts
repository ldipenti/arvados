
// Copyright (C) The Arvados Authors. All rights reserved.
//
// SPDX-License-Identifier: AGPL-3.0

import * as parser from '~/store/search-bar/search-query/parser';

interface Property {
    key: string;
    value: string;
}

export enum Keywords {
    TYPE = 'type',
    CLUSTER = 'cluster',
    PROJECT = 'project',
    IS = 'is',
    FROM = 'from',
    TO = 'to',
}

const keyValuePattern = (key: string) => new RegExp(`${key}:([^ ]*)`);
const propertyPattern = /has:"(.*?)":"(.*?)"/;

const patterns = [
    keyValuePattern(Keywords.TYPE),
    keyValuePattern(Keywords.CLUSTER),
    keyValuePattern(Keywords.PROJECT),
    keyValuePattern(Keywords.IS),
    keyValuePattern(Keywords.FROM),
    keyValuePattern(Keywords.TO),
    propertyPattern
];

export const parseSearchQuery = parser.parseSearchQuery(patterns);

export const getValue = (tokens: string[]) => (key: string) => {
    const pattern = keyValuePattern(key);
    const token = tokens.find(t => pattern.test(t));
    if (token) {
        const [, value] = token.split(':');
        return value;
    }
    return undefined;
};

export const getProperties = (tokens: string[]) =>
    tokens.reduce((properties, token) => {
        const match = token.match(propertyPattern);
        if (match) {
            const [, key, value] = match;
            const newProperty = { key, value };
            return [...properties, newProperty];
        }
        return properties;
    }, [] as Property[]);
