/*
 * Copyright OpenSearch Contributors
 * SPDX-License-Identifier: Apache-2.0
 */

import { WorkspaceCreateOptions, WorkspaceDeleteOptions } from './workspace';

// / <reference types="cypress" />
type CommandCallback = (...args: any[]) => void;
type CypressOptions = Partial<Cypress.Loggable & Cypress.Timeoutable>;
type Subject = JQuery<HTMLElement>;

declare global {
  namespace Cypress {
    interface Chainable {
      [key: string]: any;
      automation(
        command: 'remote:debugger:protocol',
        options: {
          command: string;
          params: {
            timezoneId: string;
          };
        }
      ): void;
      request(options: Partial<RequestOptions>): Chainable<Response<any>>;

      // namespaces
      ds: {
        add(commandName: string, options: any, callback?: Function): void;
        add(commandName: string, callback: Function): void;
        deleteAll(): Chainable<void>;
        createNoAuth(options?: CreateNoAuthOptions): Chainable<[string, string]>;
        createBasicAuth(): Chainable<[string, string]>;
        create(dataSourceJSON: any): Chainable<Response>;
      };

      utils: {
        add(commandName: string, options: CommandOptions, callback: CommandCallback): void;
        add(commandName: string, callback: CommandCallback): void;
        getElementByTestId(
          testId: string,
          options?: Partial<Loggable & Timeoutable>
        ): Chainable<JQuery>;
        getElementByTestIdLike(
          testId: string,
          options?: Partial<Loggable & Timeoutable>
        ): Chainable<JQuery>;
        getElementsByTestIds(
          testIds: string | string[],
          options?: Partial<Loggable & Timeoutable>
        ): Chainable<JQuery>;
        findElementByTestIdLike(
          partialTestId: string,
          options?: Partial<Loggable & Timeoutable>
        ): Chainable<JQuery>;
        findElementByTestId(
          testId: string,
          options?: Partial<Loggable & Timeoutable>
        ): Chainable<JQuery>;
        whenTestIdNotFound(
          testIds: string | string[],
          callbackFn: () => void,
          options?: Partial<Loggable & Timeoutable>
        ): Chainable<JQuery>;
      };

      workspace: {
        add(commandName: string, options: any, callback?: Function): void;
        add(commandName: string, callback: Function): void;
        delete(options: WorkspaceDeleteOptions): Chainable<Response<any>>;
        create(options?: WorkspaceCreateOptions): Chainable<string>;
      };
    }
  }
}

export { CommandCallback, CypressOptions, Subject };
