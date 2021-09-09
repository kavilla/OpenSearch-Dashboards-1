/*
 * SPDX-License-Identifier: Apache-2.0
 *
 * The OpenSearch Contributors require contributions made to
 * this file be licensed under the Apache-2.0 license or a
 * compatible open source license.
 */

import React from 'react';
import { mountWithIntl } from 'test_utils/enzyme_helpers';
import { CustomLogo } from './opensearch_dashboards_custom_logo';

describe('Header logo ', () => {
  describe('in light mode ', () => {
    it('rendered as a default logo', () => {
      const branding = {
        darkmode: false,
        logo: { defaultUrl: '/' },
        mark: {},
        title: 'title',
      };
      const component = mountWithIntl(<CustomLogo {...branding} />);
      expect(component).toMatchSnapshot();
    });

    it('rendered as a default mark', () => {
      const branding = {
        darkmode: false,
        logo: {},
        mark: { defaultUrl: '/' },
        title: 'title',
      };
      const component = mountWithIntl(<CustomLogo {...branding} />);
      expect(component).toMatchSnapshot();
    });

    it('rendered as default opensearch logo', () => {
      const branding = {
        darkmode: false,
        logo: {},
        mark: {},
        title: 'title',
      };
      const component = mountWithIntl(<CustomLogo {...branding} />);
      expect(component).toMatchSnapshot();
    });
  });

  describe('in dark mode ', () => {
    it('rendered as a dark mode logo', () => {
      const branding = {
        darkmode: true,
        logo: { defaultUrl: '/defaultLogo', darkModeUrl: '/darkLogo' },
        mark: { defaultUrl: '/defaultMark', darkModeUrl: '/darkMark' },
        title: 'title',
      };
      const component = mountWithIntl(<CustomLogo {...branding} />);
      expect(component).toMatchSnapshot();
    });

    it('rendered as a default logo', () => {
      const branding = {
        darkmode: true,
        logo: { defaultUrl: '/defaultLogo' },
        mark: { defaultUrl: '/defaultMark', darkModeUrl: '/darkMark' },
        title: 'title',
      };
      const component = mountWithIntl(<CustomLogo {...branding} />);
      expect(component).toMatchSnapshot();
    });

    it('rendered as a dark mode mark', () => {
      const branding = {
        darkmode: true,
        logo: {},
        mark: { defaultUrl: '/defaultMark', darkModeUrl: '/darkMark' },
        title: 'title',
      };
      const component = mountWithIntl(<CustomLogo {...branding} />);
      expect(component).toMatchSnapshot();
    });

    it('rendered as a default mark', () => {
      const branding = {
        darkmode: true,
        logo: {},
        mark: { defaultUrl: '/defaultMark' },
        title: 'title',
      };
      const component = mountWithIntl(<CustomLogo {...branding} />);
      expect(component).toMatchSnapshot();
    });

    it('rendered as default opensearch logo', () => {
      const branding = {
        darkmode: true,
        logo: {},
        mark: {},
        title: 'title',
      };
      const component = mountWithIntl(<CustomLogo {...branding} />);
      expect(component).toMatchSnapshot();
    });
  });
});
