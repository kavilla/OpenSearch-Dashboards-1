/*
 * Copyright OpenSearch Contributors
 * SPDX-License-Identifier: Apache-2.0
 */

import {
  END_TIME,
  INDEX_PATTERN_WITH_TIME,
  START_TIME,
} from '../../../../../../utils/apps/explore/constants';
import { verifyMonacoEditorContent } from '../../../../../../utils/apps/explore/shared';

describe('Saved Explore', () => {
  let testResources = {};

  before(() => {
    cy.core.setupTestResources().then((resources) => {
      testResources = resources;
      cy.visit(`/w/${testResources.workspaceId}/app/explore/logs#`);
      cy.osd.waitForLoader(true);
    });
  });

  after(() => {
    cy.core.cleanupTestResources(testResources);
  });

  it('should create and load a saved search', () => {
    cy.getElementByTestId('discoverNewButton').click();
    cy.osd.waitForLoader(true);

    cy.explore.setTopNavDate(START_TIME, END_TIME);
    cy.osd.waitForLoader(true);

    const query = `source=${INDEX_PATTERN_WITH_TIME} | stats count() by category`;
    cy.explore.setQueryEditor(query);
    cy.getElementByTestId('exploreQueryExecutionButton').click();
    cy.osd.waitForLoader(true);

    cy.getElementByTestId('exploreTabs').should('be.visible');
    cy.get('#logs').click();
    cy.getElementByTestId('docTable').should('be.visible');

    // Create a saved search
    cy.getElementByTestId('discoverSaveButton').click();
    const savedSearchName = `SAVED_SEARCH_${Date.now()}`;
    cy.getElementByTestId('savedObjectTitle').type(savedSearchName);
    cy.getElementByTestId('confirmSaveSavedObjectButton').click();
    cy.getElementByTestId('savedExploreSuccess').should('be.visible');
    cy.osd.waitForLoader(true);

    // Reset to default state
    cy.getElementByTestId('discoverNewButton').click();
    cy.osd.waitForLoader(true);
    verifyMonacoEditorContent('');

    cy.getElementByTestId('discoverOpenButton').click();
    cy.getElementByTestId('savedObjectFinderItemList')
      .should('be.visible')
      .contains(savedSearchName)
      .click();
    cy.osd.waitForLoader(true);
    cy.contains('h1', savedSearchName).should('be.visible');
    verifyMonacoEditorContent(query);

    const newQuery = `source=${INDEX_PATTERN_WITH_TIME} | stats count()`;
    cy.explore.setQueryEditor(newQuery);
    cy.getElementByTestId('exploreQueryExecutionButton').click();

    cy.osd.waitForLoader(true);

    // Navigate to logs tab
    cy.getElementByTestId('exploreTabs').should('be.visible');
    cy.get('#logs').click();
    cy.getElementByTestId('docTable').should('be.visible');

    // Save the updated saved search
    cy.getElementByTestId('discoverSaveButton').click();
    const updatedSavedSearchName = `UPDATED_SAVED_SEARCH_${Date.now()}`;
    cy.getElementByTestId('savedObjectTitle').clear().type(updatedSavedSearchName);
    cy.getElementByTestId('confirmSaveSavedObjectButton').click();
    cy.getElementByTestId('savedExploreSuccess').should('be.visible');

    // Save as a new saved search
    cy.getElementByTestId('discoverSaveButton').click();
    const newSavedSearchName = `NEW_SAVED_SEARCH_${Date.now()}`;
    cy.getElementByTestId('saveAsNewCheckbox').click();
    cy.getElementByTestId('savedObjectTitle').clear().type(newSavedSearchName);
    cy.getElementByTestId('confirmSaveSavedObjectButton').click();
    cy.getElementByTestId('savedExploreSuccess').should('be.visible');

    // Verify all saved searches are available
    cy.getElementByTestId('discoverOpenButton').click();
    cy.getElementByTestId('savedObjectFinderItemList').should('be.visible');
    cy.contains(updatedSavedSearchName).should('be.visible');
    cy.contains(newSavedSearchName).should('be.visible');
    cy.contains(savedSearchName).should('not.exist');
  });
});
