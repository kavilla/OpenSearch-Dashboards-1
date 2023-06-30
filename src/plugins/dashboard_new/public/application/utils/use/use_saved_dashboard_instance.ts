/*
 * Copyright OpenSearch Contributors
 * SPDX-License-Identifier: Apache-2.0
 */

import { i18n } from '@osd/i18n';
import { EventEmitter } from 'events';
import { useEffect, useRef, useState } from 'react';
import {
  redirectWhenMissing,
  SavedObjectNotFound,
} from '../../../../../opensearch_dashboards_utils/public';
import { DashboardConstants } from '../../../dashboard_constants';
import { DashboardServices, IEditorController, SavedDashboardInstance } from '../../types';
import { getDashboardInstance } from '../get_dashboard_instance';
import { getCreateBreadcrumbs, getEditBreadcrumbs } from '../breadcrumbs';
import { DashboardEditorController } from '../../components';

/**
 * This effect is responsible for instantiating a saved dashboard or creating a new one
 * using url parameters, embedding and destroying it in DOM
 */
export const useSavedDashboardInstance = (
  services: DashboardServices,
  eventEmitter: EventEmitter,
  isChromeVisible: boolean | undefined,
  dashboardIdFromUrl: string | undefined
) => {
  const [state, setState] = useState<{
    savedDashboardInstance?: SavedDashboardInstance;
    dashboardEditorController?: IEditorController;
  }>({});
  const dashboardEditorRef = useRef<HTMLElement>(null);
  const dashboardId = useRef('');

  useEffect(() => {
    const {
      application: { navigateToApp },
      chrome,
      history,
      http: { basePath },
      notifications,
      toastNotifications,
    } = services;

    const getSavedDashboardInstance = async () => {
      try {
        let savedDashboardInstance: SavedDashboardInstance;
        if (history.location.pathname === '/create') {
          savedDashboardInstance = await getDashboardInstance(services);
        } else {
          savedDashboardInstance = await getDashboardInstance(services, dashboardIdFromUrl);
          // Update time filter to match the saved dashboard if time restore has been set to true when saving the dashboard
          // We should only set the time filter according to time restore once when we are loading the dashboard
          // if (savedDashboardInstance.timeRestore) {
          //   if (savedDashboardInstance.timeFrom && savedDashboardInstance.timeTo) {
          //     services.data.query.timefilter.timefilter.setTime({
          //       from: savedDashboardInstance.timeFrom,
          //       to: savedDashboardInstance.timeTo,
          //     });
          //   }
          //   if (savedDashboardInstance.refreshInterval) {
          //     services.data.query.timefilter.timefilter.setRefreshInterval(
          //       savedDashboardInstance.refreshInterval
          //     );
          //   }
          // }

          // chrome.recentlyAccessed.add(
          //   savedDashboardInstance.getFullPath(),
          //   savedDashboardInstance.title,
          //   dashboardIdFromUrl
          // );
        }
        const { embeddableHandler, savedDashboard, dashboard } = savedDashboardInstance;

        // TODO: Finish breadcrumb logics --> saved/unsaved
        if (savedDashboard.id) {
          chrome.setBreadcrumbs(getEditBreadcrumbs(savedDashboard.title));
          chrome.docTitle.change(savedDashboard.title);
        } else {
          chrome.setBreadcrumbs(getCreateBreadcrumbs());
        }

        let dashboardEditorController;
        // do not create editor in embeded mode
        if (isChromeVisible) {
          dashboardEditorController = new DashboardEditorController(
            // QUSTION: WHY THIS GIVES ME ERROR
            dashboardEditorRef.current!,
            dashboard,
            eventEmitter,
            embeddableHandler
          );
        } else if (dashboardEditorRef.current) {
          embeddableHandler.render(dashboardEditorRef.current);
        }

        setState({
          savedDashboardInstance,
          dashboardEditorController,
        });
      } catch (error: any) {
        if (history.location.pathname === '/create') {
          redirectWhenMissing({
            history,
            basePath,
            navigateToApp,
            mapping: {
              dashboard: DashboardConstants.LANDING_PAGE_PATH,
            },
            toastNotifications: notifications.toasts,
            // TODO: dashboardNew -> do we do this?
            // onBeforeRedirect() {
            //   setActiveUrl(VisualizeConstants.LANDING_PAGE_PATH);
            // },
          });
        } else if (error instanceof SavedObjectNotFound && dashboardIdFromUrl === 'create') {
          // Preserve BWC of v5.3.0 links for new, unsaved dashboards.
          // See https://github.com/elastic/kibana/issues/10951 for more context.
          // Note preserve querystring part is necessary so the state is preserved through the redirect.
          history.replace({
            ...history.location, // preserve query,
            pathname: DashboardConstants.CREATE_NEW_DASHBOARD_URL,
          });

          notifications.toasts.addWarning(
            i18n.translate('dashboardNew.urlWasRemovedInSixZeroWarningMessage', {
              defaultMessage:
                'The url "dashboard/create" was removed in 6.0. Please update your bookmarks.',
            })
          );
          return new Promise(() => {});
        } else {
          // E.g. a corrupt or deleted dashboard
          // TODO: this is from old version:
          // notifications.toasts.addDanger(error!.message);
          // history.push(DashboardConstants.LANDING_PAGE_PATH);
          // return new Promise(() => {});
          toastNotifications.addWarning({
            title: i18n.translate('dashboardNew.createDashboard.failedToLoadErrorMessage', {
              defaultMessage: 'Failed to load the dashboard',
            }),
          });
          history.replace(DashboardConstants.LANDING_PAGE_PATH);
        }
      }
    };

    if (isChromeVisible === undefined) {
      // waiting for specifying chrome
      return;
    }

    if (!dashboardId.current) {
      dashboardId.current = dashboardIdFromUrl || 'new';
      getSavedDashboardInstance();
    } else if (
      dashboardIdFromUrl &&
      dashboardId.current !== dashboardIdFromUrl &&
      state.savedDashboardInstance?.savedDashboard.id !== dashboardIdFromUrl
    ) {
      dashboardId.current = dashboardIdFromUrl;
      setState({});
      getSavedDashboardInstance();
    }
  }, [
    eventEmitter,
    isChromeVisible,
    services,
    state.savedDashboardInstance,
    state.dashboardEditorController,
    dashboardIdFromUrl,
  ]);

  useEffect(() => {
    return () => {
      if (state.dashboardEditorController) {
        state.dashboardEditorController.destroy();
      } else if (state.savedDashboardInstance?.embeddableHandler) {
        state.savedDashboardInstance.embeddableHandler.destroy();
      }
      if (state.savedDashboardInstance?.savedDashboard) {
        state.savedDashboardInstance.savedDashboard.destroy();
      }
    };
  }, [state]);

  return {
    ...state,
    dashboardEditorRef,
  };
};
