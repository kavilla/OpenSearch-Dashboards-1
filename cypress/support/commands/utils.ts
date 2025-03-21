/*
 * Copyright OpenSearch Contributors
 * SPDX-License-Identifier: Apache-2.0
 */

import { createCommandsNamespace } from '../utils';
import { CypressOptions, Subject } from '../types';

createCommandsNamespace(cy, 'utils');

cy.utils.add('getElementByTestId', (testId: string, options: CypressOptions = {}) => {
  return cy.get(`[data-test-subj="${testId}"]`, options);
});

cy.utils.add('getElementByTestIdLike', (testId: string, options: CypressOptions = {}) => {
  return cy.get(`[data-test-subj*="${testId}"]`, options);
});

cy.utils.add('getElementsByTestIds', (testIds: string | string[], options: CypressOptions = {}) => {
  const selectors = [testIds].flat(Infinity).map((testId) => `[data-test-subj="${testId}"]`);
  return cy.get(selectors.join(','), options);
});

cy.utils.add(
  'findElementByTestIdLike',
  { prevSubject: true },
  (subject: Subject, partialTestId: string, options: CypressOptions = {}) => {
    return cy.wrap(subject).find(`[data-test-subj*="${partialTestId}"]`, options);
  }
);

cy.utils.add(
  'findElementByTestId',
  { prevSubject: true },
  (subject: Subject, testId: string, options: CypressOptions = {}) => {
    return cy.wrap(subject).find(`[data-test-subj="${testId}"]`, options);
  }
);

cy.utils.add(
  'whenTestIdNotFound',
  (testIds: string | string[], callbackFn: () => void, options: CypressOptions = {}) => {
    const selectors = [testIds].flat(Infinity).map((testId) => `[data-test-subj="${testId}"]`);
    cy.get('body', options).then(($body) => {
      if ($body.find(selectors.join(',')).length === 0) callbackFn();
    });
  }
);
