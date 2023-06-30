/*
 * Copyright OpenSearch Contributors
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import EventEmitter from 'events';
import { render, unmountComponentAtNode } from 'react-dom';
import { Dashboard } from '../../dashboard';
import { DashboardEmbeddableContainerEditorRenderProps, DashboardEmbeddableContract } from '../types';
import { DashboardEmbeddableContainerEditor } from './dashboard_embeddable_container_editor';

class DashboardEditorController {
  constructor(
    private el: HTMLElement,
    private dashboard: Dashboard,
    private eventEmitter: EventEmitter,
    private embeddableHandler: DashboardEmbeddableContract
  ) {}

  render(props: DashboardEmbeddableContainerEditorRenderProps) {
    render(
      <DashboardEmbeddableContainerEditor
        eventEmitter={this.eventEmitter}
        embeddableHandler={this.embeddableHandler}
        dashboard={this.dashboard}
        {...props}
      />,
      this.el
    );
  }

  destroy() {
    unmountComponentAtNode(this.el);
  }
}

export { DashboardEditorController };
