// Copyright (C) The Arvados Authors. All rights reserved.
//
// SPDX-License-Identifier: AGPL-3.0

import { combineReducers } from 'redux';
import * as creator from "./creator/collection-creator-reducer";
import * as updater from "./updater/collection-updater-reducer";

export type CollectionsState = {
    creator: creator.CollectionCreatorState;
    updater: updater.CollectionUpdaterState;
};

export const collectionsReducer = combineReducers({
    creator: creator.collectionCreatorReducer,
    updater: updater.collectionUpdaterReducer
});
