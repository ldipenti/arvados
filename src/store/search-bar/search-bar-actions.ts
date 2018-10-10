// Copyright (C) The Arvados Authors. All rights reserved.
//
// SPDX-License-Identifier: AGPL-3.0

import { unionize, ofType, UnionOf } from "~/common/unionize";
import { GroupContentsResource, GroupContentsResourcePrefix } from '~/services/groups-service/groups-service';
import { Dispatch } from 'redux';
import { RootState } from '~/store/store';
import { ServiceRepository } from '~/services/services';
import { FilterBuilder } from "~/services/api/filter-builder";
import { ResourceKind } from '~/models/resource';
import { GroupClass } from '~/models/group';

export const searchBarActions = unionize({
    SET_CURRENT_VIEW: ofType<string>(),
    OPEN_SEARCH_VIEW: ofType<{}>(),
    CLOSE_SEARCH_VIEW: ofType<{}>(),
    SET_SEARCH_RESULTS: ofType<GroupContentsResource[]>(),
    SET_SEARCH_VALUE: ofType<string>(),
    SET_SAVED_QUERIES: ofType<string[]>()
});

export type SearchBarActions = UnionOf<typeof searchBarActions>;

export const goToView = (currentView: string) => searchBarActions.SET_CURRENT_VIEW(currentView);

export const saveRecentQuery = (query: string) =>
    (dispatch: Dispatch<any>, getState: () => RootState, services: ServiceRepository) => {
        services.searchQueriesService.saveRecentQuery(query);
    };

export const loadRecentQueries = () =>
    (dispatch: Dispatch<any>, getState: () => RootState, services: ServiceRepository) => {
        const recentSearchQueries = services.searchQueriesService.getRecentQueries();
        return recentSearchQueries || [];
    };

export const saveQuery = (query: string) =>
    (dispatch: Dispatch<any>, getState: () => RootState, services: ServiceRepository) => {
        services.searchQueriesService.saveQuery(query);
        dispatch(searchBarActions.SET_SAVED_QUERIES(services.searchQueriesService.getSavedQueries()));
    };

export const deleteSavedQuery = (id: number) =>
    (dispatch: Dispatch<any>, getState: () => RootState, services: ServiceRepository) => {
        services.searchQueriesService.deleteSavedQuery(id);
        const savedSearchQueries = services.searchQueriesService.getSavedQueries();
        dispatch(searchBarActions.SET_SAVED_QUERIES(services.searchQueriesService.getSavedQueries()));
        return savedSearchQueries || [];
    };

export const searchData = (searchValue: string) =>
    async (dispatch: Dispatch, getState: () => RootState, services: ServiceRepository) => {
        dispatch(searchBarActions.SET_SEARCH_VALUE(searchValue));
        dispatch(searchBarActions.SET_SEARCH_RESULTS([]));
        if (searchValue) {
            const filters = getFilters('name', searchValue);
            const { items } = await services.groupsService.contents('', {
                filters,
                limit: 5,
                recursive: true
            });
            dispatch(searchBarActions.SET_SEARCH_RESULTS(items));
        }
    };

const getFilters = (filterName: string, searchValue: string): string => {
    return new FilterBuilder()
        .addIsA("uuid", [ResourceKind.PROJECT, ResourceKind.COLLECTION, ResourceKind.PROCESS])
        .addILike(filterName, searchValue, GroupContentsResourcePrefix.COLLECTION)
        .addILike(filterName, searchValue, GroupContentsResourcePrefix.PROCESS)
        .addILike(filterName, searchValue, GroupContentsResourcePrefix.PROJECT)
        .addEqual('groupClass', GroupClass.PROJECT, GroupContentsResourcePrefix.PROJECT)
        .getFilters();
};
