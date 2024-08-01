/*
 * Copyright OpenSearch Contributors
 * SPDX-License-Identifier: Apache-2.0
 */

import { SharedGlobalConfig, Logger, ILegacyClusterClient } from 'opensearch-dashboards/server';
import { Observable } from 'rxjs';
import { ISearchStrategy, SearchUsage } from '../../../data/server';
import {
  IOpenSearchDashboardsSearchRequest,
  IOpenSearchDashboardsSearchResponse,
} from '../../../data/common';
import { Facet } from '../utils';
import { SEARCH_STRATEGY } from '../../common';
import { FacetResponse } from '../types';

export const sqlAsyncRawSearchStrategyProvider = (
  config$: Observable<SharedGlobalConfig>,
  logger: Logger,
  client: ILegacyClusterClient,
  usage?: SearchUsage
): ISearchStrategy<
  IOpenSearchDashboardsSearchRequest,
  IOpenSearchDashboardsSearchResponse<FacetResponse>
> => {
  const sqlAsyncFacet = new Facet({
    client,
    logger,
    endpoint: 'enhancements.observability.runDirectQuery',
  });
  const sqlAsyncJobsFacet = new Facet({
    client,
    logger,
    endpoint: 'enhancements.observability.getJobStatus',
    useJobs: true,
  });

  return {
    search: async (context, request: any, options) => {
      try {
        // Create job: this should return a queryId and sessionId
        if (request?.body?.query.qs) {
          const query = request.body.query;
          request.body = {
            query: query.qs,
            datasource: query.dataSourceName,
            lang: SEARCH_STRATEGY.SQL,
            sessionId: query.sessionId,
          };
          const rawResponse: any = await sqlAsyncFacet.describeQuery(context, request);
          // handles failure
          if (!rawResponse.success) {
            throw new Error(rawResponse.data);
          }

          return {
            rawResponse,
          };
        } else {
          const queryId = request.params.queryId;
          request.params = { queryId };
          const rawResponse: any = await sqlAsyncJobsFacet.describeQuery(context, request);

          return {
            rawResponse,
          };
        }
      } catch (e) {
        logger.error(`sqlAsyncRawSearchStrategy: ${e.message}`);
        if (usage) usage.trackError();
        throw e;
      }
    },
  };
};
