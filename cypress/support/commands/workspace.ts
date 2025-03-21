/*
 * Copyright OpenSearch Contributors
 * SPDX-License-Identifier: Apache-2.0
 */

import { createCommandsNamespace } from '../utils';
import { WorkspaceCreateOptions, WorkspaceDeleteOptions, WorkspaceResponse } from '../types';
import { API } from '../constants';

createCommandsNamespace(cy, 'workspace');

cy.workspace.add('delete', (options: WorkspaceDeleteOptions) => {
  if (!options.id && !options.name) {
    throw new Error('Either id or name is required');
  }

  if (options.id) {
    return cy.request({
      method: 'DELETE',
      url: `${API.WORKSPACE}/${options.id}`,
      headers: {
        'osd-xsrf': true,
      },
    });
  }

  return cy
    .request<WorkspaceResponse>({
      method: 'POST',
      url: `${API.WORKSPACE}/_list`,
      headers: {
        'osd-xsrf': true,
      },
      body: {},
    })
    .then((resp) => {
      if (resp?.body?.success) {
        resp.body.result.workspaces?.forEach(({ name, id }) => {
          if (options.name === name) {
            cy.request({
              method: 'DELETE',
              url: `${API.WORKSPACE}/${id}`,
              headers: {
                'osd-xsrf': true,
              },
            });
          }
        });
      }
    });
});

cy.workspace.add('create', ({ settings, ...workspace }: WorkspaceCreateOptions = { name: '' }) => {
  return cy
    .request<WorkspaceResponse>({
      method: 'POST',
      url: `${API.WORKSPACE}`,
      headers: {
        'osd-xsrf': true,
      },
      body: {
        attributes: {
          ...workspace,
          features: workspace.features || ['use-case-observability'],
          description: workspace.description || 'test_description',
        },
        settings,
      },
    })
    .then((resp) => {
      if (resp?.body?.success) {
        return resp.body.result.id;
      } else {
        throw new Error(`Create workspace ${workspace.name} failed!`);
      }
    });
});
