// Copyright (C) The Arvados Authors. All rights reserved.
//
// SPDX-License-Identifier: AGPL-3.0

export const sanitizeToken = (href: string, tokenAsQueryParam: boolean = true): string => {
    const [prefix, suffix] = href.split('/t=');
    const [token, ...rest] = suffix.split('/');

    const sep = href.indexOf("?") > -1 ? "&" : "?";

    return `${[prefix, ...rest].join('/')}${tokenAsQueryParam ? `${sep}api_token=${token}` : ''}`;
};

export const getClipboardUrl = (href: string): string => {
    const { origin } = window.location;
    const url = sanitizeToken(href, false);

    return `${origin}?redirectTo=${url}`;
};
