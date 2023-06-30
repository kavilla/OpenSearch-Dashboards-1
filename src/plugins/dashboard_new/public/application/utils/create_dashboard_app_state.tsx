/*
 * Copyright OpenSearch Contributors
 * SPDX-License-Identifier: Apache-2.0
 */

import { DashboardAppStateInUrl } from 'src/plugins/dashboard_new/public/types';
import { migrateAppState } from '../lib/migrate_app_state';
import {
  IOsdUrlStateStorage,
  createStateContainer,
  syncState,
} from '../../../../opensearch_dashboards_utils/public';
import { ViewMode } from '../../embeddable_plugin';
import { getDashboardIdFromUrl } from '../lib';
import {
  PureDashboardState,
  DashboardAppState,
  DashboardAppStateTransitions,
  DashboardServices,
} from '../types';

const STATE_STORAGE_KEY = '_a';

interface Arguments {
  stateDefaults: PureDashboardState;
  osdUrlStateStorage: IOsdUrlStateStorage;
  services: DashboardServices;
}

const pureTransitions = ({
  set: (state: any) => (prop: any, value: any) => ({ ...state, [prop]: value }),
  setDashboard: (state: { dashboard: any }) => (dashboard: any) => ({
    ...state,
    dashboard: {
      ...state.dashboard,
      ...dashboard,
    },
  }),
} as unknown) as DashboardAppStateTransitions;

export const createDashboardAppState = ({
  stateDefaults,
  osdUrlStateStorage,
  services,
}: Arguments) => {
  const urlState = osdUrlStateStorage.get<DashboardAppState>(STATE_STORAGE_KEY);
  const { history } = services;
  const initialState = {
    ...stateDefaults,
    ...urlState,
  };

  // export interface DashboardAppStateTransitions {
  //   set: (
  //     state: DashboardAppState
  //   ) => <T extends keyof DashboardAppState>(
  //     prop: T,
  //     value: DashboardAppState[T]
  //   ) => DashboardAppState;
  //   setDashboard: (
  //     state: DashboardAppState
  //   ) => (dashboard: Partial<PureDashboardState>) => DashboardAppState;
  //   updateDashboardState: (
  //     state: DashboardAppState
  //   ) => (dashboard: PureDashboardState) => DashboardAppState;
  //   updateSavedQuery: (state: DashboardAppState) => (savedQueryId?: string) => DashboardAppState;
  // }

  /*
     make sure url ('_a') matches initial state
     Initializing appState does two things - first it translates the defaults into AppState,
     second it updates appState based on the url (the url trumps the defaults). This means if
     we update the state format at all and want to handle BWC, we must not only migrate the
     data stored with saved vis, but also any old state in the url.
   */
  osdUrlStateStorage.set(STATE_STORAGE_KEY, initialState, { replace: true });

  const stateContainer = createStateContainer<DashboardAppState, DashboardAppStateTransitions>(
    initialState,
    pureTransitions
  );

  const toUrlState = (state: DashboardAppState): DashboardAppStateInUrl => {
    if (state.viewMode === ViewMode.VIEW) {
      const { panels, ...stateWithoutPanels } = state;
      return stateWithoutPanels;
    }
    return state;
  };

  const { start: startStateSync, stop: stopStateSync } = syncState({
    storageKey: STATE_STORAGE_KEY,
    stateContainer: {
      ...stateContainer,
      get: () => toUrlState(stateContainer.get()),
      set: (state: DashboardAppStateInUrl | null) => {
        // sync state required state container to be able to handle null
        // overriding set() so it could handle null coming from url
        if (state) {
          // Skip this update if current dashboardId in the url is different from what we have in the current instance of state manager
          // As dashboard is driven by angular at the moment, the destroy cycle happens async,
          // If the dashboardId has changed it means this instance
          // is going to be destroyed soon and we shouldn't sync state anymore,
          // as it could potentially trigger further url updates
          const currentDashboardIdInUrl = getDashboardIdFromUrl(history.location.pathname);
          if (currentDashboardIdInUrl !== instance.id) return;

          stateContainer.set({
            ...stateDefaults,
            ...state,
          });
        } else {
          // Do nothing in case when state from url is empty,
          // this fixes: https://github.com/elastic/kibana/issues/57789
          // There are not much cases when state in url could become empty:
          // 1. User manually removed `_a` from the url
          // 2. Browser is navigating away from the page and most likely there is no `_a` in the url.
          //    In this case we don't want to do any state updates
          //    and just allow $scope.$on('destroy') fire later and clean up everything
        }
      },
    },
    stateStorage: osdUrlStateStorage,
  });

  // start syncing the appState with the ('_a') url
  startStateSync();
  return { stateContainer, stopStateSync };
};
