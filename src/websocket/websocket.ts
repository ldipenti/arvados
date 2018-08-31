// Copyright (C) The Arvados Authors. All rights reserved.
//
// SPDX-License-Identifier: AGPL-3.0

import { RootStore } from '~/store/store';
import { AuthService } from '~/services/auth-service/auth-service';
import { Config } from '~/common/config';
import { WebSocketService } from './websocket-service';
import { ResourceEventMessage, ResourceEventMessageType } from './resource-event-message';
import { ResourceKind } from '~/models/resource';
import { loadProcess } from '~/store/processes/processes-actions';
import { loadContainers } from '../store/processes/processes-actions';
import { FilterBuilder } from '~/common/api/filter-builder';

export const initWebSocket = (config: Config, authService: AuthService, store: RootStore) => {
    const webSocketService = new WebSocketService(config.websocketUrl, authService);
    webSocketService.setMessageListener(messageListener(store));
    webSocketService.connect();
};

const messageListener = (store: RootStore) => (message: ResourceEventMessage) => {
    if (message.eventType === ResourceEventMessageType.CREATE || message.eventType === ResourceEventMessageType.UPDATE) {
        switch (message.objectKind) {
            case ResourceKind.CONTAINER_REQUEST:
                return store.dispatch(loadProcess(message.objectUuid));
            case ResourceKind.CONTAINER:
                return store.dispatch(loadContainers(
                    new FilterBuilder().addIn('uuid', [message.objectUuid]).getFilters()
                ));
            default:
                return;
        }
    }
    return ;
};
