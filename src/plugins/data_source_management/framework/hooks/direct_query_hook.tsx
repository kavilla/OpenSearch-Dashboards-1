/*
 * Copyright OpenSearch Contributors
 * SPDX-License-Identifier: Apache-2.0
 */

import { useEffect, useState } from 'react';
import { NotificationsStart } from 'opensearch-dashboards/public';
import { ASYNC_QUERY } from '../constants';
import { DirectQueryLoadingStatus, DirectQueryRequest } from '../types';
import {
  getAsyncSessionId,
  setAsyncSessionId,
  get as getObjValue,
  formatError,
  usePolling,
} from '../utils';
import { DataPublicPluginStart } from '../../../data/public';

export const useDirectQuery = (
  data: DataPublicPluginStart,
  notifications: NotificationsStart,
  dataSourceId?: string
) => {
  const [loadStatus, setLoadStatus] = useState<DirectQueryLoadingStatus>(
    DirectQueryLoadingStatus.SCHEDULED
  );

  const {
    data: pollingResult,
    loading: _pollingLoading,
    error: pollingError,
    startPolling,
    stopPolling: stopLoading,
  } = usePolling<any, any>((params) => {
    return data.search
      .search({ params, dataSourceId }, { strategy: ASYNC_QUERY.SEARCH_STRATEGY })
      .toPromise();
  }, ASYNC_QUERY.POLLING_INTERVAL);

  const startLoading = (requestPayload: DirectQueryRequest) => {
    setLoadStatus(DirectQueryLoadingStatus.SCHEDULED);

    const sessionId = getAsyncSessionId(requestPayload.datasource);
    if (sessionId) {
      requestPayload = { ...requestPayload, sessionId };
    }

    data.search
      .search({ params: requestPayload, dataSourceId }, { strategy: 'sqlasyncraw' })
      .toPromise()
      .then((result) => {
        setAsyncSessionId(requestPayload.datasource, getObjValue(result, 'sessionId', null));
        if ((result.rawResponse as any).queryId) {
          startPolling({
            queryId: (result.rawResponse as any).queryId,
          });
        } else {
          // eslint-disable-next-line no-console
          console.error('No query id found in response');
          setLoadStatus(DirectQueryLoadingStatus.FAILED);
        }
      })
      .catch((e) => {
        setLoadStatus(DirectQueryLoadingStatus.FAILED);
        const formattedError = formatError(
          '',
          'The query failed to execute and the operation could not be complete.',
          e.body?.message
        );
        notifications.toasts.addError(formattedError, {
          title: 'Query Failed',
        });
        // eslint-disable-next-line no-console
        console.error(e);
      });
  };

  useEffect(() => {
    // cancel direct query
    if (!pollingResult) return;
    const { status: anyCaseStatus, datarows, error } = pollingResult;
    const status = anyCaseStatus?.toLowerCase();

    if (status === DirectQueryLoadingStatus.SUCCESS || datarows) {
      setLoadStatus(status);
      stopLoading();
    } else if (status === DirectQueryLoadingStatus.FAILED) {
      setLoadStatus(status);
      stopLoading();
      const formattedError = formatError(
        '',
        'The query failed to execute and the operation could not be complete.',
        error
      );
      notifications.toasts.addError(formattedError, {
        title: 'Query Failed',
      });
    } else {
      setLoadStatus(status);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [pollingResult, pollingError, stopLoading]);

  return { loadStatus, startLoading, stopLoading, pollingResult };
};
