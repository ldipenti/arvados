// Copyright (C) The Arvados Authors. All rights reserved.
//
// SPDX-License-Identifier: AGPL-3.0

import { ContextMenuActionSet } from "../context-menu-action-set";
import { DetailsIcon, ProvenanceGraphIcon, AdvancedIcon, RestoreFromTrashIcon } from '~/components/icon/icon';
import { toggleCollectionTrashed } from "~/store/trash/trash-actions";
import { detailsPanelActions } from "~/store/details-panel/details-panel-action";
import { openAdvancedTabDialog } from "~/store/advanced-tab/advanced-tab";

export const trashedCollectionActionSet: ContextMenuActionSet = [[
    {
        icon: DetailsIcon,
        name: "View details",
        execute: dispatch => {
            dispatch(detailsPanelActions.TOGGLE_DETAILS_PANEL());
        }
    },
    {
        icon: ProvenanceGraphIcon,
        name: "Provenance graph",
        execute: (dispatch, resource) => {
            // add code
        }
    },
    {
        icon: AdvancedIcon,
        name: "Advanced",
        execute: (dispatch, resource) => {
            dispatch<any>(openAdvancedTabDialog(resource.uuid));
        }
    },
    {
        icon: RestoreFromTrashIcon,
        name: "Restore",
        execute: (dispatch, resource) => {
            dispatch<any>(toggleCollectionTrashed(resource.uuid, true));
        }
    },
]];
