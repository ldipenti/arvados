// Copyright (C) The Arvados Authors. All rights reserved.
//
// SPDX-License-Identifier: AGPL-3.0

export interface ProcessLogsPanel {
    filters: string[];
    selectedFilter: string;
    logs: ProcessLogs;
}

export interface ProcessLogs {
    [logType: string]: string[];
}

export const getProcessPanelLogs = ({ selectedFilter, logs }: ProcessLogsPanel) => {
    return logs[selectedFilter];
};
