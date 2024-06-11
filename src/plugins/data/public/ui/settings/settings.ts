/*
 * Copyright OpenSearch Contributors
 * SPDX-License-Identifier: Apache-2.0
 */

import { BehaviorSubject } from 'rxjs';
import { IStorageWrapper } from '../../../../opensearch_dashboards_utils/public';
import { ConfigSchema } from '../../../config';
import { setOverrides as setFieldOverrides } from '../../../common';
import { QueryEnhancement } from '../types';

export interface DataSettings {
  userQueryLanguage: string;
  userQueryString: string;
  uiOverrides?: {
    fields?: {
      filterable?: boolean;
      visualizable?: boolean;
    };
    showDocLinks?: boolean;
  };
}

export class Settings {
  private enabledQueryEnhancementsUpdated$ = new BehaviorSubject<boolean>(false);
  private enhancedAppNames: string[] = [];

  constructor(
    private readonly config: ConfigSchema['enhancements'],
    private readonly storage: IStorageWrapper,
    private readonly queryEnhancements: Map<string, QueryEnhancement>
  ) {
    this.enabledQueryEnhancementsUpdated$.next(this.config.enabled);
    this.enhancedAppNames = this.config.enabled ? this.config.supportedAppNames : [];
  }

  supportsEnhancementsEnabled(appName: string) {
    return this.enhancedAppNames.includes(appName);
  }

  getEnabledQueryEnhancementsUpdated$ = () => {
    return this.enabledQueryEnhancementsUpdated$.asObservable();
  };

  getUserQueryEnhancementsEnabled() {
    return (
      this.storage.get('opensearchDashboards.userQueryEnhancementsEnabled') || this.config.enabled
    );
  }

  setUserQueryEnhancementsEnabled(enabled: boolean) {
    if (!this.config.enabled) return;
    this.storage.set('opensearchDashboards.userQueryEnhancementsEnabled', enabled);
    this.enabledQueryEnhancementsUpdated$.next(enabled);
    return true;
  }

  getAllQueryEnhancements() {
    return this.queryEnhancements;
  }

  getQueryEnhancements(language: string) {
    return this.queryEnhancements.get(language);
  }

  getUserQueryLanguageBlocklist() {
    return this.storage.get('opensearchDashboards.userQueryLanguageBlocklist') || [];
  }

  setUserQueryLanguageBlocklist(languages: string[]) {
    if (!this.config.enabled) return;
    this.storage.set(
      'opensearchDashboards.userQueryLanguageBlocklist',
      languages.map((language) => language.toLowerCase())
    );
    return true;
  }

  getUserQueryLanguage() {
    return this.storage.get('opensearchDashboards.userQueryLanguage') || 'kuery';
  }

  setUserQueryLanguage(language: string) {
    this.storage.set('opensearchDashboards.userQueryLanguage', language);
    return true;
  }

  getUserQueryString() {
    return this.storage.get('opensearchDashboards.userQueryString') || '';
  }

  setUserQueryString(query: string) {
    this.storage.set('opensearchDashboards.userQueryString', query);
    return true;
  }

  getUiOverrides() {
    return this.storage.get('opensearchDashboards.uiOverrides') || {};
  }

  setUiOverrides(overrides?: { [key: string]: any }) {
    if (!overrides) {
      this.storage.remove('opensearchDashboards.uiOverrides');
      setFieldOverrides(undefined);
      return true;
    }
    this.storage.set('opensearchDashboards.uiOverrides', overrides);
    setFieldOverrides(overrides.fields);
    return true;
  }

  setUiOverridesByUserQueryLanguage(language: string) {
    const queryEnhancement = this.queryEnhancements.get(language);
    if (queryEnhancement) {
      const { fields = {}, showDocLinks } = queryEnhancement;
      this.setUiOverrides({ fields, showDocLinks });
    } else {
      this.setUiOverrides({ fields: undefined, showDocLinks: undefined });
    }
  }

  toJSON(): DataSettings {
    return {
      userQueryLanguage: this.getUserQueryLanguage(),
      userQueryString: this.getUserQueryString(),
      uiOverrides: this.getUiOverrides(),
    };
  }

  updateSettings({ userQueryLanguage, userQueryString, uiOverrides }: DataSettings) {
    this.setUserQueryLanguage(userQueryLanguage);
    this.setUserQueryString(userQueryString);
    this.setUiOverrides(uiOverrides);
  }
}

interface Deps {
  config: ConfigSchema['enhancements'];
  storage: IStorageWrapper;
  queryEnhancements: Map<string, QueryEnhancement>;
}

export function createSettings({ config, storage, queryEnhancements }: Deps) {
  return new Settings(config, storage, queryEnhancements);
}
