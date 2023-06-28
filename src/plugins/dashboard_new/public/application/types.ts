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

import { History } from 'history';
import { TimeRange, Query, Filter, DataPublicPluginStart } from 'src/plugins/data/public';
import {
  PersistedState,
  SavedVisState,
  VisualizationsStart,
  Vis,
  VisualizeEmbeddableContract,
  VisSavedObject,
} from 'src/plugins/visualizations/public';
import {
  SavedObject as SavedObjectType,
  SavedObjectAttributes,
  CoreStart,
  PluginInitializerContext,
  SavedObjectsClientContract,
  IUiSettingsClient,
  ChromeStart,
  ScopedHistory,
  AppMountParameters,
  ToastsStart,
} from 'src/core/public';
import { NavigationPublicPluginStart as NavigationStart } from 'src/plugins/navigation/public';
import {
  Storage,
  IOsdUrlStateStorage,
  ReduxLikeStateContainer,
} from 'src/plugins/opensearch_dashboards_utils/public';
import { SharePluginStart } from 'src/plugins/share/public';
import { UsageCollectionSetup } from 'src/plugins/usage_collection/public';
import { SavedObjectLoader, SavedObject, SavedObjectsStart } from 'src/plugins/saved_objects/public';
import { OpenSearchDashboardsLegacyStart } from 'src/plugins/opensearch_dashboards_legacy/public';
import { EmbeddableStart, ViewMode } from 'src/plugins/embeddable/public';
import { UrlForwardingStart } from 'src/plugins/url_forwarding/public';
import { DashboardContainerEmbeddable, DashboardStart, SavedObjectDashboard } from '../../../dashboard_new/public';
import { SavedDashboardPanel730ToLatest, DashboardCapabilities, DashboardProvider } from '../../common';
import { PublicContract } from '@osd/utility-types';

export interface SavedDashboardState {
  panels: SavedDashboardPanel[];
  fullScreenMode: boolean;
  title: string;
  description: string;
  timeRestore: boolean;
  options: {
    hidePanelTitles: boolean;
    useMargins: boolean;
  };
  viewMode: ViewMode;
  expandedPanelId?: string;
}

export type PureDashboardState = SavedDashboardState;

/**
 * This should always represent the latest dashboard panel shape, after all possible migrations.
 */
export type SavedDashboardPanel = SavedDashboardPanel730ToLatest;

export interface DashboardAppState {
  query: Query | string;
  filters: Filter[];
  savedQuery?: string;
  dashboard: PureDashboardState;
}

// TODO: dashboardNew -- setOptions() is needed?
export interface DashboardAppStateTransitions {
  set: (
    state: DashboardAppState
  ) => <T extends keyof DashboardAppState>(
    prop: T,
    value: DashboardAppState[T]
  ) => DashboardAppState;
  setDashboard: (state: DashboardAppState) => (dashboard: Partial<PureDashboardState>) => DashboardAppState;
  // unlinkSavedSearch: (
  //   state: DashboardAppState
  // ) => ({ query, parentFilters }: { query?: Query; parentFilters?: Filter[] }) => DashboardAppState;
  updateDashboardState: (state: DashboardAppState) => (dashboard: PureDashboardState) => DashboardAppState;
  updateSavedQuery: (state: DashboardAppState) => (savedQueryId?: string) => DashboardAppState;
}

export type DashboardAppStateContainer = ReduxLikeStateContainer<
  DashboardAppState,
  DashboardAppStateTransitions
>;

export type DashboardAppStateDefaults = DashboardAppState & {
  description?: string;
};

export interface EditorRenderProps {
  core: CoreStart;
  data: DataPublicPluginStart;
  filters: Filter[];
  timeRange: TimeRange;
  query?: Query;
  savedSearch?: SavedObject;
  //uiState: PersistedState;
  /**
   * Flag to determine if visualiztion is linked to the saved search
   */
  //linked: boolean;
}

export interface DashboardServices extends CoreStart {
  pluginInitializerContext: PluginInitializerContext;
  opensearchDashboardsVersion: string;
  history: History;
  osdUrlStateStorage: IOsdUrlStateStorage;
  core: CoreStart;
  data: DataPublicPluginStart;
  navigation: NavigationStart;
  savedObjectsClient: SavedObjectsClientContract;
  savedDashboards: SavedObjectLoader;
  dashboardProviders: () => { [key: string]: DashboardProvider } | undefined;
  dashboardConfig: OpenSearchDashboardsLegacyStart['dashboardConfig'];
  dashboardCapabilities: DashboardCapabilities;
  embeddableCapabilities: {
    visualizeCapabilities: any;
    mapsCapabilities: any;
  };
  uiSettings: IUiSettingsClient;
  chrome: ChromeStart;
  savedQueryService: DataPublicPluginStart['query']['savedQueries'];
  embeddable: EmbeddableStart;
  localStorage: Storage;
  share?: SharePluginStart;
  usageCollection?: UsageCollectionSetup;
  navigateToDefaultApp: UrlForwardingStart['navigateToDefaultApp'];
  navigateToLegacyOpenSearchDashboardsUrl: UrlForwardingStart['navigateToLegacyOpenSearchDashboardsUrl'];
  scopedHistory: ScopedHistory;
  setHeaderActionMenu: AppMountParameters['setHeaderActionMenu'];
  savedObjectsPublic: SavedObjectsStart;
  restorePreviousUrl: () => void;
  addBasePath?: (url: string) => string;
  toastNotifications: ToastsStart;
}

export interface ISavedDashboard {
  id?: string;
  title: string;
  description?: string;

}

export type DashboardEmbeddableContract = PublicContract<DashboardContainerEmbeddable>;

export interface SavedDashboardInstance {
  dashboard: Dashboard;
  savedDashboard: SavedObjectDashboard; 
  savedSearch?: SavedObject;
  embeddableHandler: DashboardEmbeddableContract;
}

export interface ByValueDashboardInstance {
  dashboard: Dashboard;
  savedSearch?: SavedObject;
  embeddableHandler: DashboardEmbeddableContract;
}

export type DashboardEditorDashboardInstance = SavedDashboardInstance | ByValueDashboardInstance;

export interface IEditorController {
  render(props: EditorRenderProps): void;
  destroy(): void;
}
