/*
 * Copyright OpenSearch Contributors
 * SPDX-License-Identifier: Apache-2.0
 */
import { createCommandsNamespace } from '../utils';
import { WorkspaceCreateOptions, WorkspaceDeleteOptions, WorkspaceResponse } from '../types';
import { API } from '../constants';

createCommandsNamespace(cy, 'ds');

// Utility function
const fetchDataSourceMetadata = (body: DataSourceMetadata) => {
  return cy
    .request({
      method: 'POST',
      url: `${BASE_PATH}/internal/data-source-management/fetchDataSourceMetaData`,
      headers: {
        'osd-xsrf': true,
      },
      body,
      failOnStatusCode: false,
    })
    .then(({ body }) => body);
};

// Command implementations
cy.ds.add('deleteAll', () => {
  return cy
    .request<DataSourceResponse>('GET', `${BASE_PATH}${DS_API.DATA_SOURCES_LISTING}`)
    .then((resp) => {
      if (resp?.body?.saved_objects) {
        resp.body.saved_objects.forEach(({ id }) => {
          cy.request({
            method: 'DELETE',
            url: `${BASE_PATH}${DS_API.DELETE_DATA_SOURCE}${id}`,
            body: { force: false },
            headers: {
              'osd-xsrf': true,
            },
          });
        });
      }
    });
});

cy.ds.add('createNoAuth', ({ title = 'RemoteDataSourceNoAuth' }: CreateNoAuthOptions = {}) => {
  const endpoint = Cypress.env('remoteDataSourceNoAuthUrl');

  const createDataSourceNoAuth = (dataSourceMetaData = {}) => {
    return cy
      .request<DataSourceResponse>({
        method: 'POST',
        url: `${BASE_PATH}${DS_API.CREATE_DATA_SOURCE}`,
        headers: {
          'osd-xsrf': true,
        },
        body: {
          attributes: {
            title,
            endpoint,
            auth: {
              type: 'no_auth',
            },
            ...dataSourceMetaData,
          },
        },
      })
      .then((resp) => {
        if (resp?.body?.id) {
          return [resp.body.id, title] as [string, string];
        }
      });
  };

  return fetchDataSourceMetadata({
    dataSourceAttr: {
      endpoint,
      auth: {
        type: 'no_auth',
      },
    },
  }).then(
    (dataSourceMeta) => createDataSourceNoAuth(dataSourceMeta),
    () => createDataSourceNoAuth()
  );
});

cy.ds.add('createBasicAuth', () => {
  return cy
    .request<DataSourceResponse>({
      method: 'POST',
      url: `${BASE_PATH}${DS_API.CREATE_DATA_SOURCE}`,
      headers: {
        'osd-xsrf': true,
      },
      body: {
        attributes: {
          title: 'RemoteDataSourceBasicAuth',
          endpoint: Cypress.env('remoteDataSourceBasicAuthUrl'),
          auth: {
            type: 'username_password',
            credentials: {
              username: Cypress.env('remoteDataSourceBasicAuthUsername'),
              password: Cypress.env('remoteDataSourceBasicAuthPassword'),
            },
          },
        },
      },
    })
    .then((resp) => {
      if (resp?.body?.id) {
        return [resp.body.id, 'RemoteDataSourceBasicAuth'] as [string, string];
      }
    });
});

cy.ds.add('create', (dataSourceJSON: any) => {
  return cy.request({
    method: 'POST',
    url: `${BASE_PATH}${DS_API.CREATE_DATA_SOURCE}`,
    headers: {
      'osd-xsrf': true,
    },
    body: dataSourceJSON,
  });
});
