/*
 * Copyright OpenSearch Contributors
 * SPDX-License-Identifier: Apache-2.0
 */

import _ from 'lodash';
import React from 'react';

import { DatasetSelect, DatasetSelectProps } from './';
import { IDataPluginServices } from '../../types';

export function createDatasetSelect(services: IDataPluginServices) {
  return (props: Omit<DatasetSelectProps, 'services'>) => (
    <DatasetSelect {...props} services={services} />
  );
}
