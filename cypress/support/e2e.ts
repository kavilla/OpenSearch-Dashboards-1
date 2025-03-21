/*
 * Copyright OpenSearch Contributors
 * SPDX-License-Identifier: Apache-2.0
 */

// / <reference types="cypress" />

import '../utils/commands';
import './commands';
import '../utils/commands.osd';
import '../utils/apps/commands';
import '../utils/dashboards/workspace_plugin/commands';

// TODO: Remove this after https://github.com/opensearch-project/OpenSearch-Dashboards/issues/5476 is resolved
const scopedHistoryNavigationError = /^[^(ScopedHistory instance has fell out of navigation scope)]/;

Cypress.on('uncaught:exception', (err: Error): boolean => {
  /* returning false here prevents Cypress from failing the test */
  if (scopedHistoryNavigationError.test(err.message)) {
    return false;
  }
  // We need to return undefined here instead of letting it fall through
  // This ensures Cypress handles other errors normally
  return (undefined as unknown) as boolean;
});

Cypress.on('test:before:run', (): void => {
  Cypress.automation('remote:debugger:protocol', {
    command: 'Emulation.setTimezoneOverride',
    params: {
      timezoneId: 'UTC',
    },
  });
});

export {};
