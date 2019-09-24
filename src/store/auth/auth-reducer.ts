// Copyright (C) The Arvados Authors. All rights reserved.
//
// SPDX-License-Identifier: AGPL-3.0

import { authActions, AuthAction } from "./auth-action";
import { User, UserResource } from "~/models/user";
import { ServiceRepository } from "~/services/services";
import { SshKeyResource } from '~/models/ssh-key';
import { Session } from "~/models/session";
import { Config } from '~/common/config';

export interface AuthState {
    user?: User;
    apiToken?: string;
    sshKeys: SshKeyResource[];
    sessions: Session[];
    localCluster: string;
    homeCluster: string;
    loginCluster: string;
    remoteHosts: { [key: string]: string };
    remoteHostsConfig: { [key: string]: Config };
}

const initialState: AuthState = {
    user: undefined,
    apiToken: undefined,
    sshKeys: [],
    sessions: [],
    localCluster: "",
    homeCluster: "",
    loginCluster: "",
    remoteHosts: {},
    remoteHostsConfig: {}
};

export const authReducer = (services: ServiceRepository) => (state = initialState, action: AuthAction) => {
    return authActions.match(action, {
        SAVE_API_TOKEN: (token: string) => {
            return { ...state, apiToken: token };
        },
        SAVE_USER: (user: UserResource) => {
            return { ...state, user };
        },
        CONFIG: ({ config }) => {
            return {
                ...state,
                localCluster: config.uuidPrefix,
                remoteHosts: { ...config.remoteHosts, [config.uuidPrefix]: new URL(config.rootUrl).host },
                homeCluster: config.loginCluster || config.uuidPrefix,
                loginCluster: config.loginCluster
            };
        },
        REMOTE_CLUSTER_CONFIG: ({ config }) => {
            return {
                ...state,
                remoteHostsConfig: { ...state.remoteHostsConfig, [config.uuidPrefix]: config },
            };
        },
        INIT: ({ user, token }) => {
            return { ...state, user, apiToken: token, homeCluster: user.uuid.substr(0, 5) };
        },
        LOGIN: () => {
            return state;
        },
        LOGOUT: () => {
            return { ...state, apiToken: undefined };
        },
        USER_DETAILS_SUCCESS: (user: User) => {
            return { ...state, user };
        },
        SET_SSH_KEYS: (sshKeys: SshKeyResource[]) => {
            return { ...state, sshKeys };
        },
        ADD_SSH_KEY: (sshKey: SshKeyResource) => {
            return { ...state, sshKeys: state.sshKeys.concat(sshKey) };
        },
        REMOVE_SSH_KEY: (uuid: string) => {
            return { ...state, sshKeys: state.sshKeys.filter((sshKey) => sshKey.uuid !== uuid) };
        },
        SET_HOME_CLUSTER: (homeCluster: string) => {
            return { ...state, homeCluster };
        },
        SET_SESSIONS: (sessions: Session[]) => {
            return { ...state, sessions };
        },
        ADD_SESSION: (session: Session) => {
            return { ...state, sessions: state.sessions.concat(session) };
        },
        REMOVE_SESSION: (clusterId: string) => {
            return {
                ...state,
                sessions: state.sessions.filter(
                    session => session.clusterId !== clusterId
                )
            };
        },
        UPDATE_SESSION: (session: Session) => {
            return {
                ...state,
                sessions: state.sessions.map(
                    s => s.clusterId === session.clusterId ? session : s
                )
            };
        },
        default: () => state
    });
};
