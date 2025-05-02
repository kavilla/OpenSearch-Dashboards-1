/*
 * Copyright OpenSearch Contributors
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useEffect, useRef, useState } from 'react';
import { EuiTabs, EuiTab, EuiLoadingSpinner } from '@elastic/eui';
import { CoreStart } from 'src/core/public';
import { ErrorEmbeddable, ViewMode } from 'src/plugins/embeddable/public';
import { ExploreStartPlugins } from '../types';
import {
  ExploreContainer,
  ExploreContainerInput,
  ExploreTab,
} from '../embeddable/container/explore_container';

interface ExploreViewProps {
  core: CoreStart;
  plugins: ExploreStartPlugins;
}

export const ExploreView: React.FC<ExploreViewProps> = ({ core, plugins }) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const [container, setContainer] = useState<ExploreContainer | null>(null);
  const [selectedTab, setSelectedTab] = useState<ExploreTab>(ExploreTab.LOGS);
  const [isLoading, setIsLoading] = useState<boolean>(true);

  useEffect(() => {
    const initContainer = async () => {
      setIsLoading(true);

      try {
        const factory = plugins.embeddable.getEmbeddableFactory('explore-container');
        if (!factory) {
          throw new Error('Explore container factory not found');
        }

        const initialInput: ExploreContainerInput = {
          id: 'explore-container-main',
          activeTab: ExploreTab.LOGS,
          panels: {},
          viewMode: ViewMode.EDIT,
        };

        const newContainer = await factory.create(initialInput);
        if (newContainer && !(newContainer instanceof ErrorEmbeddable)) {
          setContainer(newContainer as ExploreContainer);
        } else {
          // eslint-disable-next-line no-console
          console.error('Failed to create a valid explore container');
        }

        if (containerRef.current) {
          if (newContainer && containerRef.current) {
            newContainer.render(containerRef.current);
          }
        }
      } catch (error) {
        // eslint-disable-next-line no-console
        console.error('Failed to create explore container:', error);
      } finally {
        setIsLoading(false);
      }
    };

    initContainer();

    return () => {
      if (container) {
        container.destroy();
      }
    };
  }, [container, plugins.embeddable]);

  useEffect(() => {
    if (container) {
      container.switchTab(selectedTab);
    }
  }, [container, selectedTab]);

  const onTabClick = (tab: ExploreTab) => {
    setSelectedTab(tab);
  };

  const renderTabs = () => {
    const tabs = [
      { id: ExploreTab.LOGS, name: 'Logs' },
      { id: ExploreTab.METRICS, name: 'Metrics' },
      { id: ExploreTab.VISUALIZATION, name: 'Visualization' },
    ];

    return (
      <EuiTabs>
        {tabs.map((tab) => (
          <EuiTab
            key={tab.id}
            isSelected={selectedTab === tab.id}
            onClick={() => onTabClick(tab.id)}
          >
            {tab.name}
          </EuiTab>
        ))}
      </EuiTabs>
    );
  };

  return (
    <div className="exploreView">
      {renderTabs()}

      {isLoading ? (
        <div className="exploreView__loading">
          <EuiLoadingSpinner size="l" />
        </div>
      ) : (
        <div className="exploreView__container" ref={containerRef} />
      )}
    </div>
  );
};
