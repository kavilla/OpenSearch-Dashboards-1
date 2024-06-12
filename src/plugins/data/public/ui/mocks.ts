/*
 * Copyright OpenSearch Contributors
 * SPDX-License-Identifier: Apache-2.0
 */

import { BehaviorSubject } from 'rxjs';
import { SettingsMock } from './settings/mocks';
import { IUiSetup, IUiStart } from './types';

const createMockWebStorage = () => ({
  clear: jest.fn(),
  getItem: jest.fn(),
  key: jest.fn(),
  removeItem: jest.fn(),
  setItem: jest.fn(),
  length: 0,
});

const createMockStorage = () => ({
  storage: createMockWebStorage(),
  get: jest.fn(),
  set: jest.fn(),
  remove: jest.fn(),
  clear: jest.fn(),
});

function createSetupContract(): jest.Mocked<IUiSetup> {
  return {
    __enhance: jest.fn(),
  };
}

function createStartContract(isEnhancementsEnabled: boolean = false): jest.Mocked<IUiStart> {
  const queryEnhancements = new Map();
  return {
    IndexPatternSelect: jest.fn(),
    SearchBar: jest.fn(),
    Settings: new SettingsMock(
      { enabled: isEnhancementsEnabled, supportedAppNames: ['discover'] },
      createMockStorage(),
      queryEnhancements
    ),
    container$: new BehaviorSubject<HTMLDivElement | null>(null),
  };
}

export const uiServiceMock = {
  createSetupContract,
  createStartContract,
};
