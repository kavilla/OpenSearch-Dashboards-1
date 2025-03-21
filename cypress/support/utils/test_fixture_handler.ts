/*
 * Copyright OpenSearch Contributors
 * SPDX-License-Identifier: Apache-2.0
 */

// / <reference types="cypress" />

import { BASE_ENGINE } from '../';

interface MappingResponse {
  acknowledged: boolean;
  shards_acknowledged: boolean;
  index: string;
}

interface BulkResponse {
  took: number;
  errors: boolean;
  items: any[];
}

interface RefreshResponse {
  _shards: {
    total: number;
    successful: number;
    failed: number;
  };
}

export class TestFixtureHandler {
  private readonly testRunner: Cypress.Chainable;
  private readonly openSearchUrl: string;

  constructor(inputTestRunner: Cypress.Chainable, openSearchUrl: string = BASE_ENGINE.url) {
    this.testRunner = inputTestRunner;
    this.openSearchUrl = openSearchUrl;
  }

  public importMapping(filename: string): Cypress.Chainable<Cypress.Response<MappingResponse>> {
    return cy.readFile(filename).then((mappingData: any) => {
      const targetIndex = this._extractIndexNameFromPath(filename);

      return cy.request<MappingResponse>({
        method: 'PUT',
        url: `${this.openSearchUrl}/${targetIndex}`,
        headers: {
          'Content-Type': 'application/json',
        },
        body: mappingData,
        failOnStatusCode: false,
      });
    });
  }

  public importData(filename: string): Cypress.Chainable<Cypress.Response<RefreshResponse>> {
    return cy.readFile(filename, 'utf8').then((content: string) => {
      return cy
        .request<BulkResponse>({
          method: 'POST',
          url: `${this.openSearchUrl}/_bulk`,
          headers: {
            'Content-Type': 'application/x-ndjson',
          },
          body: content,
          failOnStatusCode: false,
        })
        .then(() => {
          return cy.request<RefreshResponse>({
            method: 'POST',
            url: `${this.openSearchUrl}/_all/_refresh`,
          });
        });
    });
  }

  private _extractIndexNameFromPath(filepath: string): string {
    const filename = filepath.split('/').pop();
    if (!filename) {
      throw new Error('Invalid file path provided');
    }
    const indexName = filename.split('.')[0];
    return indexName;
  }
}

// eslint-disable-next-line import/no-default-export
export default TestFixtureHandler;
