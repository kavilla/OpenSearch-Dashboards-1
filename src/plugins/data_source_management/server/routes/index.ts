/*
 * Copyright OpenSearch Contributors
 * SPDX-License-Identifier: Apache-2.0
 */

import { IRouter, ILegacyClusterClient } from '../../../../core/server';
import { registerDataConnectionsRoute } from './data_connections_router';
import { registerDatasourcesRoute } from './datasources_router';

export function defineRoutes(router: IRouter) {
  router.get(
    {
      path: '/api/data_source_management/example',
      validate: false,
    },
    async (context, request, response) => {
      return response.ok({
        body: {
          time: new Date().toISOString(),
        },
      });
    }
  );
}

export function setupRoutes({
  router,
  client,
  dataSourceEnabled,
}: {
  router: IRouter;
  client: ILegacyClusterClient;
  dataSourceEnabled: boolean;
}) {
  // notebooks routes
  // const queryService = new QueryService(client);
  // registerSqlRoute(router, queryService);

  registerDataConnectionsRoute(router, dataSourceEnabled);
  registerDatasourcesRoute(router, dataSourceEnabled);
}
