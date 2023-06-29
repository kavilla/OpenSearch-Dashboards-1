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
import { Start as InspectorStartContract } from 'src/plugins/inspector/public';
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
import { DashboardContainerEmbeddable, DashboardStart} from '../../../dashboard_new/public';
import { PublicContract } from '@osd/utility-types';
import { UiActionsStart } from '../ui_actions_plugin';
import { DashboardCapabilities, DashboardProvider } from '../../common';
import { SavedDashboardState } from '../types';
import { Dashboard } from '../dashboard';
import { SavedObjectDashboard } from 'src/plugins/dashboard/public';

export type PureDashboardState = SavedDashboardState;
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
  embeddable: EmbeddableStart;
  history: History;
  osdUrlStateStorage: IOsdUrlStateStorage;
  // urlForwarding?
  pluginInitializerContext: PluginInitializerContext;
  chrome: ChromeStart;
  data: DataPublicPluginStart;
  localStorage: Storage;
  navigation: NavigationStart;
  toastNotifications: ToastsStart;
  share?: SharePluginStart;
  dashboardCapabilities: DashboardCapabilities;
  dashboards: DashboardStart;
  savedObjectsPublic: SavedObjectsStart;
  savedDashboards: DashboardStart['getSavedDashboardsLoader'];
  //setActiveUrl,
  restorePreviousUrl: () => void;
  scopedHistory: ScopedHistory;
  //core: CoreStart;
  setHeaderActionMenu: AppMountParameters['setHeaderActionMenu'];
  opensearchDashboardsVersion: string;
  savedObjectsClient: SavedObjectsClientContract;
  dashboardProviders: () => { [key: string]: DashboardProvider } | undefined;
  dashboardConfig: OpenSearchDashboardsLegacyStart['dashboardConfig'];
  embeddableCapabilities: {
    visualizeCapabilities: any;
    mapsCapabilities: any;
  };
  uiSettings: IUiSettingsClient;
  savedQueryService: DataPublicPluginStart['query']['savedQueries'];
  usageCollection?: UsageCollectionSetup;
  navigateToDefaultApp: UrlForwardingStart['navigateToDefaultApp'];
  navigateToLegacyOpenSearchDashboardsUrl: UrlForwardingStart['navigateToLegacyOpenSearchDashboardsUrl'];
  addBasePath?: (url: string) => string;
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

// export interface ByValueDashboardInstance {
//   dashboard: Dashboard;
//   savedSearch?: SavedObject;
//   embeddableHandler: DashboardEmbeddableContract;
// }

export type DashboardEditorDashboardInstance = SavedDashboardInstance;

export interface IEditorController {
  render(props: EditorRenderProps): void;
  destroy(): void;
}
