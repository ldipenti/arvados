// Copyright (C) The Arvados Authors. All rights reserved.
//
// SPDX-License-Identifier: AGPL-3.0

import React from 'react';
import { Card, CardHeader, WithStyles, withStyles, Typography, CardContent, Tooltip } from '@material-ui/core';
import { StyleRulesCallback } from '@material-ui/core';
import { ArvadosTheme } from 'common/custom-theme';
import { RootState } from 'store/store';
import { connect } from 'react-redux';
import { getResource } from 'store/resources/resources';
import { MultiselectToolbar } from 'components/multiselect-toolbar/MultiselectToolbar';
import { getPropertyChip } from '../resource-properties-form/property-chip';
import { ProjectResource } from 'models/project';
import { ResourceKind } from 'models/resource';
import { User, UserResource } from 'models/user';
import { UserResourceAccountStatus } from 'views-components/data-explorer/renderers';
import { FavoriteStar, PublicFavoriteStar } from 'views-components/favorite-star/favorite-star';
import { FreezeIcon } from 'components/icon/icon';
import { Resource } from 'models/resource';
import { MoreVerticalIcon } from 'components/icon/icon';
import { IconButton } from '@material-ui/core';
import { ContextMenuResource, openUserContextMenu } from 'store/context-menu/context-menu-actions';
import { resourceUuidToContextMenuKind } from 'store/context-menu/context-menu-actions';
import { openContextMenu } from 'store/context-menu/context-menu-actions';
import { CollectionResource } from 'models/collection';
import { RichTextEditorLink } from 'components/rich-text-editor-link/rich-text-editor-link';
import { ContextMenuKind } from 'views-components/context-menu/context-menu';
import { Dispatch } from 'redux';

type CssRules =
    | 'root'
    | 'cardHeader'
    | 'showMore'
    | 'nameContainer'
    | 'cardContent'
    | 'namePlate'
    | 'faveIcon'
    | 'frozenIcon'
    | 'contextMenuSection'
    | 'attribute'
    | 'chipSection'
    | 'tag';

const styles: StyleRulesCallback<CssRules> = (theme: ArvadosTheme) => ({
    root: {
        width: '100%',
        marginBottom: '1rem',
        flex: '0 0 auto',
        paddingTop: '0.2rem',
    },
    showMore: {
        color: theme.palette.primary.main,
        cursor: 'pointer',
        maxWidth: '10rem',
    },
    nameContainer: {
        display: 'flex',
    },
    cardHeader: {
        paddingTop: '0.4rem',
    },
    cardContent: {
        display: 'flex',
        flexDirection: 'column',
        marginTop: '-1rem',
    },
    namePlate: {
        display: 'flex',
        flexDirection: 'row',
    },
    faveIcon: {
        fontSize: '0.8rem',
        margin: 'auto 0 0.5rem 0.3rem',
        color: theme.palette.text.primary,
    },
    frozenIcon: {
        fontSize: '0.5rem',
        marginLeft: '0.3rem',
        marginTop: '0.57rem',
        height: '1rem',
        color: theme.palette.text.primary,
    },
    contextMenuSection: {
        display: 'flex',
        flexDirection: 'row',
        alignItems: 'center',
        marginTop: '0.6rem',
    },
    attribute: {
        marginBottom: '0.5rem',
        marginRight: '1rem',
        padding: '0.5rem',
        borderRadius: '5px',
    },
    chipSection: {
        display: 'flex',
        flexWrap: 'wrap',
    },
    tag: {
        marginRight: '1rem',
        marginTop: '0.5rem',
    },
});

const mapStateToProps = (state: RootState) => {
    const currentRoute = state.router.location?.pathname.split('/') || [];
    const currentItemUuid = currentRoute[currentRoute.length - 1];
    const currentResource = getResource(currentItemUuid)(state.resources);
    const frozenByUser = currentResource && getResource((currentResource as ProjectResource).frozenByUuid as string)(state.resources);
    const frozenByFullName = frozenByUser && (frozenByUser as Resource & { fullName: string }).fullName;

    return {
        isAdmin: state.auth.user?.isAdmin,
        currentResource,
        frozenByFullName,
    };
};

const mapDispatchToProps = (dispatch: Dispatch) => ({
    handleContextMenu: (event: React.MouseEvent<HTMLElement>, resource: any, isAdmin: boolean) => {
        event.stopPropagation();
        // When viewing the contents of a filter group, all contents should be treated as read only.
        let readOnly = false;
        if (resource.groupClass === 'filter') {
            readOnly = true;
        }
        const menuKind = dispatch<any>(resourceUuidToContextMenuKind(resource.uuid, readOnly));
        if (menuKind === ContextMenuKind.ROOT_PROJECT) {
            dispatch<any>(openUserContextMenu(event, resource as UserResource));
        } else if (menuKind && resource) {
            dispatch<any>(
                openContextMenu(event, {
                    name: resource.name,
                    uuid: resource.uuid,
                    ownerUuid: resource.ownerUuid,
                    isTrashed: 'isTrashed' in resource ? resource.isTrashed : false,
                    kind: resource.kind,
                    menuKind,
                    isAdmin,
                    isFrozen: !!resource.frozenByUuid,
                    description: resource.description,
                    storageClassesDesired: (resource as CollectionResource).storageClassesDesired,
                    properties: 'properties' in resource ? resource.properties : {},
                })
            );
        }
    },
});

type DetailsCardProps = WithStyles<CssRules> & {
    currentResource: ProjectResource | UserResource;
    frozenByFullName?: string;
    isAdmin: boolean;
    handleContextMenu: (event: React.MouseEvent<HTMLElement>, resource: ContextMenuResource, isAdmin: boolean) => void;
};

type UserCardProps = WithStyles<CssRules> & {
    currentResource: UserResource;
    isAdmin: boolean;
    handleContextMenu: (event: React.MouseEvent<HTMLElement>, resource: ContextMenuResource, isAdmin: boolean) => void;
};

type ProjectCardProps = WithStyles<CssRules> & {
    currentResource: ProjectResource;
    frozenByFullName: string | undefined;
    isAdmin: boolean;
    handleContextMenu: (event: React.MouseEvent<HTMLElement>, resource: ContextMenuResource, isAdmin: boolean) => void;
};

export const ProjectDetailsCard = connect(
    mapStateToProps,
    mapDispatchToProps
)(
    withStyles(styles)((props: DetailsCardProps) => {
        const { classes, currentResource, frozenByFullName, handleContextMenu, isAdmin } = props;
        switch (currentResource.kind as string) {
            case ResourceKind.USER:
                return (
                    <UserCard
                        classes={classes}
                        currentResource={currentResource as UserResource}
                        isAdmin={isAdmin}
                        handleContextMenu={(ev) => handleContextMenu(ev, currentResource as any, isAdmin)}
                    />
                );
            case ResourceKind.PROJECT:
                return (
                    <ProjectCard
                        classes={classes}
                        currentResource={currentResource as ProjectResource}
                        frozenByFullName={frozenByFullName}
                        isAdmin={isAdmin}
                        handleContextMenu={(ev) => handleContextMenu(ev, currentResource as any, isAdmin)}
                    />
                );
            default:
                return null;
        }
    })
);

const UserCard: React.FC<UserCardProps> = ({ classes, currentResource, handleContextMenu, isAdmin }) => {
    const { fullName, uuid } = currentResource as UserResource & { fullName: string };

    return (
        <Card className={classes.root}>
            <CardHeader
                className={classes.cardHeader}
                title={
                    <section className={classes.nameContainer}>
                        <Typography
                            noWrap
                            variant='h6'
                        >
                            {fullName}
                        </Typography>
                    </section>
                }
                action={
                    <section className={classes.contextMenuSection}>
                        {!currentResource.isActive && (
                            <Typography>
                                <UserResourceAccountStatus uuid={uuid} />
                            </Typography>
                        )}
                        <Tooltip
                            title='More options'
                            disableFocusListener
                        >
                            <IconButton
                                aria-label='More options'
                                onClick={(ev) => handleContextMenu(ev, currentResource as any, isAdmin)}
                            >
                                <MoreVerticalIcon />
                            </IconButton>
                        </Tooltip>
                    </section>
                }
            />
        </Card>
    );
};

const ProjectCard: React.FC<ProjectCardProps> = ({ classes, currentResource, frozenByFullName, handleContextMenu, isAdmin }) => {
    const { name, description } = currentResource as ProjectResource;

    return (
        <Card className={classes.root}>
            <CardHeader
                className={classes.cardHeader}
                title={
                    <>
                        <section className={classes.namePlate}>
                            <Typography
                                noWrap
                                variant='h6'
                                style={{ marginRight: '1rem' }}
                            >
                                {name}
                            </Typography>
                            <FavoriteStar
                                className={classes.faveIcon}
                                resourceUuid={currentResource.uuid}
                            />
                            <PublicFavoriteStar
                                className={classes.faveIcon}
                                resourceUuid={currentResource.uuid}
                            />
                            {!!frozenByFullName && (
                                <Tooltip
                                    className={classes.frozenIcon}
                                    title={<span>Project was frozen by {frozenByFullName}</span>}
                                >
                                    <FreezeIcon style={{ fontSize: 'inherit' }} />
                                </Tooltip>
                            )}
                        </section>
                        <section className={classes.chipSection}>
                            <Typography component='div'>
                                {typeof currentResource.properties === 'object' &&
                                    Object.keys(currentResource.properties).map((k) =>
                                        Array.isArray(currentResource.properties[k])
                                            ? currentResource.properties[k].map((v: string) => getPropertyChip(k, v, undefined, classes.tag))
                                            : getPropertyChip(k, currentResource.properties[k], undefined, classes.tag)
                                    )}
                            </Typography>
                        </section>
                    </>
                }
                action={
                    <Tooltip
                        title='More options'
                        disableFocusListener
                    >
                        <IconButton
                            aria-label='More options'
                            onClick={(ev) => handleContextMenu(ev, currentResource as any, isAdmin)}
                        >
                            <MoreVerticalIcon />
                        </IconButton>
                    </Tooltip>
                }
            />
            <CardContent className={classes.cardContent}>
                {description && (
                    <section>
                        <div className={classes.showMore}>
                            <RichTextEditorLink
                                title={`Description of ${name}`}
                                content={description}
                                label='Show full description'
                            />
                        </div>
                    </section>
                )}
            </CardContent>
        </Card>
    );
};
