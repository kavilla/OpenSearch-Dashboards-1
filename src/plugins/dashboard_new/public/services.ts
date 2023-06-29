/*
 * SPDX-License-Identifier: Apache-2.0
 *
 * The OpenSearch Contributors require contributions made to
 * this file be licensed under the Apache-2.0 license or a
 * compatible open source license.
 *
 * Any modifications Copyright OpenSearch Contributors. See
 * GitHub history for details.
 */

import {
  ApplicationStart,
  Capabilities,
  ChromeStart,
  HttpStart,
  I18nStart,
  IUiSettingsClient,
  OverlayStart,
  SavedObjectsStart,
} from '../../../core/public';
import { TypesStart } from './vis_types';
import { createGetterSetter } from '../../opensearch_dashboards_utils/common';
import {
  DataPublicPluginStart,
  FilterManager,
  IndexPatternsContract,
  TimefilterContract,
} from '../../../plugins/data/public';
import { UsageCollectionSetup } from '../../usage_collection/public';
import { ExpressionsStart } from '../../expressions/public';
import { UiActionsStart } from '../../ui_actions/public';
import { SavedDashboardsLoader } from './saved_dashboards';
import { SavedObjectLoader } from '../../saved_objects/public';
import { EmbeddableStart } from '../../embeddable/public';

export const [getUISettings, setUISettings] = createGetterSetter<IUiSettingsClient>('UISettings');

export const [getCapabilities, setCapabilities] = createGetterSetter<Capabilities>('Capabilities');

export const [getHttp, setHttp] = createGetterSetter<HttpStart>('Http');

export const [getApplication, setApplication] = createGetterSetter<ApplicationStart>('Application');

export const [getEmbeddable, setEmbeddable] = createGetterSetter<EmbeddableStart>('Embeddable');

export const [getSavedObjects, setSavedObjects] = createGetterSetter<SavedObjectsStart>(
  'SavedObjects'
);

export const [getTypes, setTypes] = createGetterSetter<TypesStart>('Types');

export const [getI18n, setI18n] = createGetterSetter<I18nStart>('I18n');

export const [getFilterManager, setFilterManager] = createGetterSetter<FilterManager>(
  'FilterManager'
);

export const [getTimeFilter, setTimeFilter] = createGetterSetter<TimefilterContract>('TimeFilter');

export const [getIndexPatterns, setIndexPatterns] = createGetterSetter<IndexPatternsContract>(
  'IndexPatterns'
);

export const [getSearch, setSearch] = createGetterSetter<DataPublicPluginStart['search']>('Search');

export const [getUsageCollector, setUsageCollector] = createGetterSetter<UsageCollectionSetup>(
  'UsageCollection'
);

export const [getExpressions, setExpressions] = createGetterSetter<ExpressionsStart>('Expressions');

export const [getUiActions, setUiActions] = createGetterSetter<UiActionsStart>('UiActions');

export const [getSavedDashboardsLoader, setSavedDashboardsLoader] = createGetterSetter<
  SavedDashboardsLoader
>('SavedDashboardsLoader');

export const [getAggs, setAggs] = createGetterSetter<DataPublicPluginStart['search']['aggs']>(
  'AggConfigs'
);

export const [getOverlays, setOverlays] = createGetterSetter<OverlayStart>('Overlays');


