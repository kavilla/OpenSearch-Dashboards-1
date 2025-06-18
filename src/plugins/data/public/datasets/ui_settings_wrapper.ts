/*
 * Copyright OpenSearch Contributors
 * SPDX-License-Identifier: Apache-2.0
 */

import { IUiSettingsClient } from 'src/core/public';
import { UiSettingsCommon } from '../../common/datasets';

export class UiSettingsPublicToCommon implements UiSettingsCommon {
  private uiSettings: IUiSettingsClient;
  constructor(uiSettings: IUiSettingsClient) {
    this.uiSettings = uiSettings;
  }
  get(key: string) {
    return Promise.resolve(this.uiSettings.get(key));
  }

  getAll() {
    return Promise.resolve(this.uiSettings.getAll());
  }

  set(key: string, value: any) {
    this.uiSettings.set(key, value);
    return Promise.resolve();
  }

  remove(key: string) {
    this.uiSettings.remove(key);
    return Promise.resolve();
  }
}
