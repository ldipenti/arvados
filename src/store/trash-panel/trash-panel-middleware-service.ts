// Copyright (C) The Arvados Authors. All rights reserved.
//
// SPDX-License-Identifier: AGPL-3.0

import {
    DataExplorerMiddlewareService, dataExplorerToListParams,
    listResultsToDataExplorerItemsMeta
} from "../data-explorer/data-explorer-middleware-service";
import { RootState } from "../store";
import { DataColumns } from "~/components/data-table/data-table";
import { ServiceRepository } from "~/services/services";
import { SortDirection } from "~/components/data-table/data-column";
import { FilterBuilder } from "~/common/api/filter-builder";
import { trashPanelActions } from "./trash-panel-action";
import { Dispatch, MiddlewareAPI } from "redux";
import { OrderBuilder, OrderDirection } from "~/common/api/order-builder";
import { GroupContentsResourcePrefix } from "~/services/groups-service/groups-service";
import { TrashPanelColumnNames, TrashPanelFilter } from "~/views/trash-panel/trash-panel";
import { ProjectResource } from "~/models/project";
import { ProjectPanelColumnNames } from "~/views/project-panel/project-panel";
import { updateFavorites } from "~/store/favorites/favorites-actions";
import { TrashResource } from "~/models/resource";
import { snackbarActions } from "~/store/snackbar/snackbar-actions";
import { updateResources } from "~/store/resources/resources-actions";

export class TrashPanelMiddlewareService extends DataExplorerMiddlewareService {
    constructor(private services: ServiceRepository, id: string) {
        super(id);
    }

    async requestItems(api: MiddlewareAPI<Dispatch, RootState>) {
        const dataExplorer = api.getState().dataExplorer[this.getId()];
        const columns = dataExplorer.columns as DataColumns<string, TrashPanelFilter>;
        const sortColumn = dataExplorer.columns.find(c => c.sortDirection !== SortDirection.NONE);
        const typeFilters = this.getColumnFilters(columns, TrashPanelColumnNames.TYPE);

        const order = new OrderBuilder<ProjectResource>();

        if (sortColumn) {
            const sortDirection = sortColumn && sortColumn.sortDirection === SortDirection.ASC
                ? OrderDirection.ASC
                : OrderDirection.DESC;

            const columnName = sortColumn && sortColumn.name === ProjectPanelColumnNames.NAME ? "name" : "createdAt";
            order
                .addOrder(sortDirection, columnName, GroupContentsResourcePrefix.COLLECTION)
                .addOrder(sortDirection, columnName, GroupContentsResourcePrefix.PROJECT);
        }

        try {
            const userUuid = this.services.authService.getUuid()!;
            const listResults = await this.services.groupsService
                .contents(userUuid, {
                    ...dataExplorerToListParams(dataExplorer),
                    order: order.getOrder(),
                    filters: new FilterBuilder()
                        .addIsA("uuid", typeFilters.map(f => f.type))
                        .addILike("name", dataExplorer.searchValue, GroupContentsResourcePrefix.COLLECTION)
                        .addILike("name", dataExplorer.searchValue, GroupContentsResourcePrefix.PROJECT)
                        .getFilters(),
                    recursive: true,
                    includeTrash: true
                });

            const items = listResults.items
                .filter(it => (it as TrashResource).isTrashed)
                .map(it => it.uuid);

            api.dispatch(trashPanelActions.SET_ITEMS({
                ...listResultsToDataExplorerItemsMeta(listResults),
                items
            }));
            api.dispatch<any>(updateFavorites(items));
            api.dispatch(updateResources(listResults.items));
        } catch (e) {
            api.dispatch(couldNotFetchTrashContents());
        }
    }
}

const couldNotFetchTrashContents = () =>
    snackbarActions.OPEN_SNACKBAR({
        message: 'Could not fetch trash contents.'
    });
