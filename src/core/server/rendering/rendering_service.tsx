/*
 * SPDX-License-Identifier: Apache-2.0
 *
 * The OpenSearch Contributors require contributions made to
 * this file be licensed under the Apache-2.0 license or a
 * compatible open source license.
 */

/*
 * Licensed to Elasticsearch B.V. under one or more contributor
 * license agreements. See the NOTICE file distributed with
 * this work for additional information regarding copyright
 * ownership. Elasticsearch B.V. licenses this file to you under
 * the Apache License, Version 2.0 (the "License"); you may
 * not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *    http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing,
 * software distributed under the License is distributed on an
 * "AS IS" BASIS, WITHOUT WARRANTIES OR CONDITIONS OF ANY
 * KIND, either express or implied.  See the License for the
 * specific language governing permissions and limitations
 * under the License.
 */

/*
 * Modifications Copyright OpenSearch Contributors. See
 * GitHub history for details.
 */

import React from 'react';
import { renderToStaticMarkup } from 'react-dom/server';
import { first, take } from 'rxjs/operators';
import { i18n } from '@osd/i18n';

import Axios from 'axios';
// @ts-expect-error untyped internal module used to prevent axios from using xhr adapter in tests
import AxiosHttpAdapter from 'axios/lib/adapters/http';
import { UiPlugins } from '../plugins';
import { CoreContext } from '../core_context';
import { Template } from './views';
import {
  IRenderOptions,
  RenderingSetupDeps,
  InternalRenderingServiceSetup,
  RenderingMetadata,
} from './types';
import { OpenSearchDashboardsConfigType } from '../opensearch_dashboards_config';

const DEFAULT_TITLE = 'OpenSearch Dashboards';

/** @internal */
export class RenderingService {
  constructor(private readonly coreContext: CoreContext) {}
  private logger = this.coreContext.logger;
  public async setup({
    http,
    status,
    uiPlugins,
  }: RenderingSetupDeps): Promise<InternalRenderingServiceSetup> {
    const opensearchDashboardsConfig = await this.coreContext.configService
      .atPath<OpenSearchDashboardsConfigType>('opensearchDashboards')
      .pipe(first())
      .toPromise();

    const isLogoDefaultValid = await this.checkUrlValid(
      opensearchDashboardsConfig.branding.logo.defaultUrl,
      'logo default'
    );

    const isMarkDefaultValid = await this.checkUrlValid(
      opensearchDashboardsConfig.branding.mark.defaultUrl,
      'mark default'
    );

    const isLoadingLogoDefaultValid = await this.checkUrlValid(
      opensearchDashboardsConfig.branding.loadingLogo.defaultUrl,
      'loadingLogo default'
    );

    const isTitleValid = this.checkTitleValid(opensearchDashboardsConfig.branding.title, 'title');

    return {
      render: async (
        request,
        uiSettings,
        { includeUserSettings = true, vars }: IRenderOptions = {}
      ) => {
        const env = {
          mode: this.coreContext.env.mode,
          packageInfo: this.coreContext.env.packageInfo,
        };
        const basePath = http.basePath.get(request);
        const serverBasePath = http.basePath.serverBasePath;
        const settings = {
          defaults: uiSettings.getRegistered(),
          user: includeUserSettings ? await uiSettings.getUserProvided() : {},
        };
        const darkmode = settings.user?.['theme:darkMode']?.userValue
          ? Boolean(settings.user['theme:darkMode'].userValue)
          : false;

        const isLogoDarkmodeValid = darkmode
          ? await this.checkUrlValid(
              opensearchDashboardsConfig.branding.logo.darkModeUrl,
              'logo darkmode'
            )
          : undefined;

        const isMarkDarkmodeValid = darkmode
          ? await this.checkUrlValid(
              opensearchDashboardsConfig.branding.mark.darkModeUrl,
              'mark darkmode'
            )
          : undefined;

        const isLoadingLogoDarkmodeValid = darkmode
          ? await this.checkUrlValid(
              opensearchDashboardsConfig.branding.loadingLogo.darkModeUrl,
              'loadingLogo darkmode'
            )
          : undefined;

        const logoDefault = isLogoDefaultValid
          ? opensearchDashboardsConfig.branding.logo.defaultUrl
          : undefined;

        const logoDarkmode = isLogoDarkmodeValid
          ? opensearchDashboardsConfig.branding.logo.darkModeUrl
          : undefined;

        const markDefault = isMarkDefaultValid
          ? opensearchDashboardsConfig.branding.mark.defaultUrl
          : undefined;

        const markDarkmode = isMarkDarkmodeValid
          ? opensearchDashboardsConfig.branding.mark.darkModeUrl
          : undefined;

        const loadingLogoDefault = isLoadingLogoDefaultValid
          ? opensearchDashboardsConfig.branding.loadingLogo.defaultUrl
          : undefined;

        const loadingLogoDarkmode = isLoadingLogoDarkmodeValid
          ? opensearchDashboardsConfig.branding.loadingLogo.darkModeUrl
          : undefined;

        const metadata: RenderingMetadata = {
          strictCsp: http.csp.strict,
          uiPublicUrl: `${basePath}/ui`,
          bootstrapScriptUrl: `${basePath}/bootstrap.js`,
          i18n: i18n.translate,
          locale: i18n.getLocale(),
          darkMode: darkmode,
          injectedMetadata: {
            version: env.packageInfo.version,
            buildNumber: env.packageInfo.buildNum,
            branch: env.packageInfo.branch,
            basePath,
            serverBasePath,
            env,
            anonymousStatusPage: status.isStatusPageAnonymous(),
            i18n: {
              translationsUrl: `${basePath}/translations/${i18n.getLocale()}.json`,
            },
            csp: { warnLegacyBrowsers: http.csp.warnLegacyBrowsers },
            vars: vars ?? {},
            uiPlugins: await Promise.all(
              [...uiPlugins.public].map(async ([id, plugin]) => ({
                id,
                plugin,
                config: await this.getUiConfig(uiPlugins, id),
              }))
            ),
            legacyMetadata: {
              uiSettings: settings,
            },
            branding: {
              darkmode,
              logo: {
                defaultUrl: logoDefault,
                darkModeUrl: logoDarkmode,
              },
              mark: {
                defaultUrl: markDefault,
                darkModeUrl: markDarkmode,
              },
              loadingLogo: {
                defaultUrl: loadingLogoDefault,
                darkModeUrl: loadingLogoDarkmode,
              },
              favicon: '',
              title: isTitleValid ? opensearchDashboardsConfig.branding.title : DEFAULT_TITLE,
            },
          },
        };

        return `<!DOCTYPE html>${renderToStaticMarkup(<Template metadata={metadata} />)}`;
      },
    };
  }

  public async stop() {}

  private async getUiConfig(uiPlugins: UiPlugins, pluginId: string) {
    const browserConfig = uiPlugins.browserConfigs.get(pluginId);

    return ((await browserConfig?.pipe(take(1)).toPromise()) ?? {}) as Record<string, any>;
  }

  public checkUrlValid = async (url: string, configName?: string): Promise<boolean> => {
    if (url.match(/\.(png|svg|gif|PNG|SVG|GIF)$/) === null) {
      this.logger.get('branding').warn(configName + ' config is not found or invalid.');
      return false;
    }
    return await Axios.get(url, { adapter: AxiosHttpAdapter })
      .then(() => {
        return true;
      })
      .catch(() => {
        this.logger.get('branding').warn(configName + ' config is not found or invalid');
        return false;
      });
  };

  public checkTitleValid = (title: string, configName?: string): boolean => {
    if (!title || title.length > 36) {
      this.logger
        .get('branding')
        .warn(
          configName +
            ' config is not found or invalid. Title length should be between 1 to 36 characters.'
        );
      return false;
    }
    return true;
  };
}
