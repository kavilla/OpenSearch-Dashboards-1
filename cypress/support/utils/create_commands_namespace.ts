/*
 * Copyright OpenSearch Contributors
 * SPDX-License-Identifier: Apache-2.0
 */

// / <reference types="cypress" />

type CommandCallback = (...args: any[]) => void;

interface CommandsNamespace {
  add(commandName: string, callback: CommandCallback): void;
  [key: string]: any;
}

/**
 * Creates a custom Cypress commands namespace that allows for dynamic command registration
 * and chaining.
 *
 * Example usage:
 *   createCommandsNamespace(cy, 'osd'); // creates osd namespace
 *   cy.osd.add('myCommand', (arg) => { ... }); // register command
 *   cy.osd.myCommand('arg'); // use command
 *
 * @param cy - Cypress instance
 * @param namespace - Name of the namespace to create (e.g., 'osd', 'core')
 */
export function createCommandsNamespace(cy: Cypress.Chainable, namespace: string): void {
  const cyAny = cy as any;

  cyAny[namespace] = new Proxy<CommandsNamespace>(
    {
      add(commandName: string, callback: CommandCallback): void {
        const fullCommandName = `${namespace}:${commandName}`;
        Cypress.Commands.add(fullCommandName, callback);
      },
    },
    {
      get(target: CommandsNamespace, property: string): any {
        if (property in target) {
          return target[property];
        }
        const fullCommandName = `${namespace}:${property}`;
        return cyAny[fullCommandName];
      },
    }
  );
}

// eslint-disable-next-line import/no-default-export
export default createCommandsNamespace;
