/*
 * Copyright OpenSearch Contributors
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { action } from '@storybook/addon-actions';
import {
  EuiSplitPanel,
  EuiSpacer,
  EuiTitle,
  EuiTabs,
  EuiTab,
  EuiButton,
  EuiFormRow,
  EuiFieldText,
  EuiSelect,
  EuiFlexGroup,
  EuiFlexItem,
  EuiPanel,
  EuiText,
  EuiCodeBlock,
} from '@elastic/eui';
import MonacoEditor from 'react-monaco-editor';
import { monaco } from '@osd/monaco';
import DatasetSelect from './dataset_select';
import { Dataset } from '../../../common/datasets/datasets/dataset';
import { IDataPluginServices } from '../../types';

const mockDatasets = [
  // Basic Dataset example
  ({
    id: '6c57d0bc-7b82-4e38-983c-b9a8c1ea7d5f',
    title: 'prod_logs-*',
    displayName: 'IAD Prod Logs',
    description: 'Contains log data from all PROD systems',
    type: 'INDEX_PATTERN',
    dataSourceRef: {
      id: 'a1b2c3d4-e5f6-4a7b-8c9d-0e1f2a3b4c5d',
      type: 'data-source',
      name: 'opensearch://default',
    },
    fields: {
      getAll: () => [
        {
          name: '@timestamp',
          type: 'date',
          esTypes: ['date'],
          scripted: false,
          searchable: true,
          aggregatable: true,
          readFromDocValues: true,
        },
        {
          name: 'message',
          type: 'string',
          esTypes: ['text'],
          scripted: false,
          searchable: true,
          aggregatable: false,
          readFromDocValues: false,
        },
        {
          name: 'level',
          type: 'string',
          esTypes: ['keyword'],
          scripted: false,
          searchable: true,
          aggregatable: true,
          readFromDocValues: true,
        },
        {
          name: 'host.name',
          type: 'string',
          esTypes: ['keyword'],
          scripted: false,
          searchable: true,
          aggregatable: true,
          readFromDocValues: true,
        },
        {
          name: 'service.name',
          type: 'string',
          esTypes: ['keyword'],
          scripted: false,
          searchable: true,
          aggregatable: true,
          readFromDocValues: true,
        },
        {
          name: 'http.request.method',
          type: 'string',
          esTypes: ['keyword'],
          scripted: false,
          searchable: true,
          aggregatable: true,
          readFromDocValues: true,
        },
        {
          name: 'http.response.status_code',
          type: 'number',
          esTypes: ['integer'],
          scripted: false,
          searchable: true,
          aggregatable: true,
          readFromDocValues: true,
        },
        {
          name: 'user.id',
          type: 'string',
          esTypes: ['keyword'],
          scripted: false,
          searchable: true,
          aggregatable: true,
          readFromDocValues: true,
        },
      ],
      getByName: (name: string) => {
        const fields = [
          {
            name: '@timestamp',
            type: 'date',
            esTypes: ['date'],
            scripted: false,
            searchable: true,
            aggregatable: true,
            readFromDocValues: true,
          },
          {
            name: 'message',
            type: 'string',
            esTypes: ['text'],
            scripted: false,
            searchable: true,
            aggregatable: false,
            readFromDocValues: false,
          },
          {
            name: 'level',
            type: 'string',
            esTypes: ['keyword'],
            scripted: false,
            searchable: true,
            aggregatable: true,
            readFromDocValues: true,
          },
          {
            name: 'host.name',
            type: 'string',
            esTypes: ['keyword'],
            scripted: false,
            searchable: true,
            aggregatable: true,
            readFromDocValues: true,
          },
          {
            name: 'service.name',
            type: 'string',
            esTypes: ['keyword'],
            scripted: false,
            searchable: true,
            aggregatable: true,
            readFromDocValues: true,
          },
          {
            name: 'http.request.method',
            type: 'string',
            esTypes: ['keyword'],
            scripted: false,
            searchable: true,
            aggregatable: true,
            readFromDocValues: true,
          },
          {
            name: 'http.response.status_code',
            type: 'number',
            esTypes: ['integer'],
            scripted: false,
            searchable: true,
            aggregatable: true,
            readFromDocValues: true,
          },
          {
            name: 'user.id',
            type: 'string',
            esTypes: ['keyword'],
            scripted: false,
            searchable: true,
            aggregatable: true,
            readFromDocValues: true,
          },
        ];
        return fields.find((field) => field.name === name);
      },
    },
    getFormatterForField: () => ({}),
  } as unknown) as Dataset,

  // Dataset with no display name
  ({
    id: '8f4b9c1d-3e5a-4f2b-9d6c-7a8b2e1c3d4f',
    title: 'metrics-*',
    description: 'System performance metrics w/o no display name',
    type: 'METRICS',
    dataSourceRef: {
      id: 'a1b2c3d4-e5f6-4a7b-8c9d-0e1f2a3b4c5d',
      type: 'data-source',
      name: 'opensearch://default',
    },
    fields: {
      getAll: () => [
        {
          name: 'timestamp',
          type: 'date',
          esTypes: ['date'],
          scripted: false,
          searchable: true,
          aggregatable: true,
          readFromDocValues: true,
        },
        {
          name: 'host.name',
          type: 'string',
          esTypes: ['keyword'],
          scripted: false,
          searchable: true,
          aggregatable: true,
          readFromDocValues: true,
        },
        {
          name: 'system.cpu.usage',
          type: 'number',
          esTypes: ['float'],
          scripted: false,
          searchable: true,
          aggregatable: true,
          readFromDocValues: true,
        },
        {
          name: 'system.memory.used',
          type: 'number',
          esTypes: ['long'],
          scripted: false,
          searchable: true,
          aggregatable: true,
          readFromDocValues: true,
        },
        {
          name: 'system.memory.total',
          type: 'number',
          esTypes: ['long'],
          scripted: false,
          searchable: true,
          aggregatable: true,
          readFromDocValues: true,
        },
        {
          name: 'system.network.in.bytes',
          type: 'number',
          esTypes: ['long'],
          scripted: false,
          searchable: true,
          aggregatable: true,
          readFromDocValues: true,
        },
        {
          name: 'system.network.out.bytes',
          type: 'number',
          esTypes: ['long'],
          scripted: false,
          searchable: true,
          aggregatable: true,
          readFromDocValues: true,
        },
        {
          name: 'system.disk.used.percent',
          type: 'number',
          esTypes: ['float'],
          scripted: false,
          searchable: true,
          aggregatable: true,
          readFromDocValues: true,
        },
      ],
      getByName: (name: string) => {
        const fields = [
          {
            name: 'timestamp',
            type: 'date',
            esTypes: ['date'],
            scripted: false,
            searchable: true,
            aggregatable: true,
            readFromDocValues: true,
          },
          {
            name: 'host.name',
            type: 'string',
            esTypes: ['keyword'],
            scripted: false,
            searchable: true,
            aggregatable: true,
            readFromDocValues: true,
          },
          {
            name: 'system.cpu.usage',
            type: 'number',
            esTypes: ['float'],
            scripted: false,
            searchable: true,
            aggregatable: true,
            readFromDocValues: true,
          },
          {
            name: 'system.memory.used',
            type: 'number',
            esTypes: ['long'],
            scripted: false,
            searchable: true,
            aggregatable: true,
            readFromDocValues: true,
          },
          {
            name: 'system.memory.total',
            type: 'number',
            esTypes: ['long'],
            scripted: false,
            searchable: true,
            aggregatable: true,
            readFromDocValues: true,
          },
          {
            name: 'system.network.in.bytes',
            type: 'number',
            esTypes: ['long'],
            scripted: false,
            searchable: true,
            aggregatable: true,
            readFromDocValues: true,
          },
          {
            name: 'system.network.out.bytes',
            type: 'number',
            esTypes: ['long'],
            scripted: false,
            searchable: true,
            aggregatable: true,
            readFromDocValues: true,
          },
          {
            name: 'system.disk.used.percent',
            type: 'number',
            esTypes: ['float'],
            scripted: false,
            searchable: true,
            aggregatable: true,
            readFromDocValues: true,
          },
        ];
        return fields.find((field) => field.name === name);
      },
    },
    getFormatterForField: () => ({}),
  } as unknown) as Dataset,

  // Dataset with very long display name
  ({
    id: '5e6f7a8b-9c0d-4e5f-8a9b-1c2d3e4f5a6b',
    title: 's3://my-bucket/data/*',
    displayName: 'S3 data lake with a very long name that exceeds the typical length',
    description: 'Data lake storage in S3',
    type: 'LOGS',
    dataSourceRef: {
      id: 'b2c3d4e5-f6a7-4b8c-9d0e-1f2a3b4c5d6e',
      type: 'data-source',
      name: 's3://my-bucket',
    },
    fields: {
      getAll: () => [
        {
          name: 'timestamp',
          type: 'date',
          esTypes: ['date'],
          scripted: false,
          searchable: true,
          aggregatable: true,
          readFromDocValues: true,
        },
        {
          name: 'log_level',
          type: 'string',
          esTypes: ['keyword'],
          scripted: false,
          searchable: true,
          aggregatable: true,
          readFromDocValues: true,
        },
        {
          name: 'message',
          type: 'string',
          esTypes: ['text'],
          scripted: false,
          searchable: true,
          aggregatable: false,
          readFromDocValues: false,
        },
        {
          name: 'application',
          type: 'string',
          esTypes: ['keyword'],
          scripted: false,
          searchable: true,
          aggregatable: true,
          readFromDocValues: true,
        },
        {
          name: 'environment',
          type: 'string',
          esTypes: ['keyword'],
          scripted: false,
          searchable: true,
          aggregatable: true,
          readFromDocValues: true,
        },
        {
          name: 'region',
          type: 'string',
          esTypes: ['keyword'],
          scripted: false,
          searchable: true,
          aggregatable: true,
          readFromDocValues: true,
        },
        {
          name: 'user_id',
          type: 'string',
          esTypes: ['keyword'],
          scripted: false,
          searchable: true,
          aggregatable: true,
          readFromDocValues: true,
        },
        {
          name: 'session_id',
          type: 'string',
          esTypes: ['keyword'],
          scripted: false,
          searchable: true,
          aggregatable: true,
          readFromDocValues: true,
        },
        {
          name: 'request_id',
          type: 'string',
          esTypes: ['keyword'],
          scripted: false,
          searchable: true,
          aggregatable: true,
          readFromDocValues: true,
        },
      ],
      getByName: (name: string) => {
        const fields = [
          {
            name: 'timestamp',
            type: 'date',
            esTypes: ['date'],
            scripted: false,
            searchable: true,
            aggregatable: true,
            readFromDocValues: true,
          },
          {
            name: 'log_level',
            type: 'string',
            esTypes: ['keyword'],
            scripted: false,
            searchable: true,
            aggregatable: true,
            readFromDocValues: true,
          },
          {
            name: 'message',
            type: 'string',
            esTypes: ['text'],
            scripted: false,
            searchable: true,
            aggregatable: false,
            readFromDocValues: false,
          },
          {
            name: 'application',
            type: 'string',
            esTypes: ['keyword'],
            scripted: false,
            searchable: true,
            aggregatable: true,
            readFromDocValues: true,
          },
          {
            name: 'environment',
            type: 'string',
            esTypes: ['keyword'],
            scripted: false,
            searchable: true,
            aggregatable: true,
            readFromDocValues: true,
          },
          {
            name: 'region',
            type: 'string',
            esTypes: ['keyword'],
            scripted: false,
            searchable: true,
            aggregatable: true,
            readFromDocValues: true,
          },
          {
            name: 'user_id',
            type: 'string',
            esTypes: ['keyword'],
            scripted: false,
            searchable: true,
            aggregatable: true,
            readFromDocValues: true,
          },
          {
            name: 'session_id',
            type: 'string',
            esTypes: ['keyword'],
            scripted: false,
            searchable: true,
            aggregatable: true,
            readFromDocValues: true,
          },
          {
            name: 'request_id',
            type: 'string',
            esTypes: ['keyword'],
            scripted: false,
            searchable: true,
            aggregatable: true,
            readFromDocValues: true,
          },
        ];
        return fields.find((field) => field.name === name);
      },
    },
    getFormatterForField: () => ({}),
  } as unknown) as Dataset,

  // OpenSearch Indices example
  ({
    id: '7a8b9c0d-1e2f-4a8b-9c0d-3e4f5a6b7c8d',
    title: 'logs-web-*',
    timeFieldName: '@timestamp',
    intervalName: 'daily',
    type: 'LOGS',
    version: '1.0.0',
    dataSourceRef: {
      id: 'c3d4e5f6-a7b8-4c9d-0e1f-2a3b4c5d6e7f',
      type: 'data-source',
      name: 'opensearch://indices',
    },
    fields: {
      getAll: () => [
        {
          name: '@timestamp',
          type: 'date',
          esTypes: ['date'],
          scripted: false,
          searchable: true,
          aggregatable: true,
          readFromDocValues: true,
        },
        {
          name: 'message',
          type: 'string',
          esTypes: ['text'],
          scripted: false,
          searchable: true,
          aggregatable: false,
          readFromDocValues: false,
        },
        {
          name: 'url.path',
          type: 'string',
          esTypes: ['keyword'],
          scripted: false,
          searchable: true,
          aggregatable: true,
          readFromDocValues: true,
        },
        {
          name: 'url.query',
          type: 'string',
          esTypes: ['keyword'],
          scripted: false,
          searchable: true,
          aggregatable: true,
          readFromDocValues: true,
        },
        {
          name: 'http.request.method',
          type: 'string',
          esTypes: ['keyword'],
          scripted: false,
          searchable: true,
          aggregatable: true,
          readFromDocValues: true,
        },
        {
          name: 'http.response.status_code',
          type: 'number',
          esTypes: ['integer'],
          scripted: false,
          searchable: true,
          aggregatable: true,
          readFromDocValues: true,
        },
        {
          name: 'http.response.body.bytes',
          type: 'number',
          esTypes: ['long'],
          scripted: false,
          searchable: true,
          aggregatable: true,
          readFromDocValues: true,
        },
        {
          name: 'user_agent.original',
          type: 'string',
          esTypes: ['text'],
          scripted: false,
          searchable: true,
          aggregatable: false,
          readFromDocValues: false,
        },
        {
          name: 'source.ip',
          type: 'ip',
          esTypes: ['ip'],
          scripted: false,
          searchable: true,
          aggregatable: true,
          readFromDocValues: true,
        },
        {
          name: 'client.geo.country_name',
          type: 'string',
          esTypes: ['keyword'],
          scripted: false,
          searchable: true,
          aggregatable: true,
          readFromDocValues: true,
        },
      ],
      getByName: (name: string) => {
        const fields = [
          {
            name: '@timestamp',
            type: 'date',
            esTypes: ['date'],
            scripted: false,
            searchable: true,
            aggregatable: true,
            readFromDocValues: true,
          },
          {
            name: 'message',
            type: 'string',
            esTypes: ['text'],
            scripted: false,
            searchable: true,
            aggregatable: false,
            readFromDocValues: false,
          },
          {
            name: 'url.path',
            type: 'string',
            esTypes: ['keyword'],
            scripted: false,
            searchable: true,
            aggregatable: true,
            readFromDocValues: true,
          },
          {
            name: 'url.query',
            type: 'string',
            esTypes: ['keyword'],
            scripted: false,
            searchable: true,
            aggregatable: true,
            readFromDocValues: true,
          },
          {
            name: 'http.request.method',
            type: 'string',
            esTypes: ['keyword'],
            scripted: false,
            searchable: true,
            aggregatable: true,
            readFromDocValues: true,
          },
          {
            name: 'http.response.status_code',
            type: 'number',
            esTypes: ['integer'],
            scripted: false,
            searchable: true,
            aggregatable: true,
            readFromDocValues: true,
          },
          {
            name: 'http.response.body.bytes',
            type: 'number',
            esTypes: ['long'],
            scripted: false,
            searchable: true,
            aggregatable: true,
            readFromDocValues: true,
          },
          {
            name: 'user_agent.original',
            type: 'string',
            esTypes: ['text'],
            scripted: false,
            searchable: true,
            aggregatable: false,
            readFromDocValues: false,
          },
          {
            name: 'source.ip',
            type: 'ip',
            esTypes: ['ip'],
            scripted: false,
            searchable: true,
            aggregatable: true,
            readFromDocValues: true,
          },
          {
            name: 'client.geo.country_name',
            type: 'string',
            esTypes: ['keyword'],
            scripted: false,
            searchable: true,
            aggregatable: true,
            readFromDocValues: true,
          },
        ];
        return fields.find((field) => field.name === name);
      },
    },
    getFormatterForField: () => ({}),
  } as unknown) as Dataset,

  // OpenSearch Traces example
  ({
    id: '9c0d1e2f-3a4b-4c5d-8e9f-5a6b7c8d9e0f',
    title: 'otel-traces-*',
    displayName: 'OpenSearch API Traces',
    description: 'Distributed tracing data for API services',
    timeFieldName: 'startTime',
    type: 'TRACES',
    version: '1.0.0',
    dataSourceRef: {
      id: 'c3d4e5f6-a7b8-4c9d-0e1f-2a3b4c5d6e7f',
      type: 'data-source',
      name: 'opensearch://indices',
    },
    fields: {
      getAll: () => [
        {
          name: 'traceId',
          type: 'string',
          esTypes: ['keyword'],
          scripted: false,
          searchable: true,
          aggregatable: true,
          readFromDocValues: true,
        },
        {
          name: 'spanId',
          type: 'string',
          esTypes: ['keyword'],
          scripted: false,
          searchable: true,
          aggregatable: true,
          readFromDocValues: true,
        },
        {
          name: 'parentSpanId',
          type: 'string',
          esTypes: ['keyword'],
          scripted: false,
          searchable: true,
          aggregatable: true,
          readFromDocValues: true,
        },
        {
          name: 'name',
          type: 'string',
          esTypes: ['keyword'],
          scripted: false,
          searchable: true,
          aggregatable: true,
          readFromDocValues: true,
        },
        {
          name: 'startTime',
          type: 'date',
          esTypes: ['date_nanos'],
          scripted: false,
          searchable: true,
          aggregatable: true,
          readFromDocValues: true,
        },
        {
          name: 'endTime',
          type: 'date',
          esTypes: ['date_nanos'],
          scripted: false,
          searchable: true,
          aggregatable: true,
          readFromDocValues: true,
        },
        {
          name: 'duration',
          type: 'number',
          esTypes: ['long'],
          scripted: false,
          searchable: true,
          aggregatable: true,
          readFromDocValues: true,
        },
        {
          name: 'service.name',
          type: 'string',
          esTypes: ['keyword'],
          scripted: false,
          searchable: true,
          aggregatable: true,
          readFromDocValues: true,
        },
        {
          name: 'status.code',
          type: 'number',
          esTypes: ['integer'],
          scripted: false,
          searchable: true,
          aggregatable: true,
          readFromDocValues: true,
        },
        {
          name: 'status.message',
          type: 'string',
          esTypes: ['text'],
          scripted: false,
          searchable: true,
          aggregatable: false,
          readFromDocValues: false,
        },
        {
          name: 'attributes.http.method',
          type: 'string',
          esTypes: ['keyword'],
          scripted: false,
          searchable: true,
          aggregatable: true,
          readFromDocValues: true,
        },
        {
          name: 'attributes.http.url',
          type: 'string',
          esTypes: ['keyword'],
          scripted: false,
          searchable: true,
          aggregatable: true,
          readFromDocValues: true,
        },
        {
          name: 'attributes.http.status_code',
          type: 'number',
          esTypes: ['integer'],
          scripted: false,
          searchable: true,
          aggregatable: true,
          readFromDocValues: true,
        },
      ],
      getByName: (name: string) => {
        const fields = [
          {
            name: 'traceId',
            type: 'string',
            esTypes: ['keyword'],
            scripted: false,
            searchable: true,
            aggregatable: true,
            readFromDocValues: true,
          },
          {
            name: 'spanId',
            type: 'string',
            esTypes: ['keyword'],
            scripted: false,
            searchable: true,
            aggregatable: true,
            readFromDocValues: true,
          },
          {
            name: 'parentSpanId',
            type: 'string',
            esTypes: ['keyword'],
            scripted: false,
            searchable: true,
            aggregatable: true,
            readFromDocValues: true,
          },
          {
            name: 'name',
            type: 'string',
            esTypes: ['keyword'],
            scripted: false,
            searchable: true,
            aggregatable: true,
            readFromDocValues: true,
          },
          {
            name: 'startTime',
            type: 'date',
            esTypes: ['date_nanos'],
            scripted: false,
            searchable: true,
            aggregatable: true,
            readFromDocValues: true,
          },
          {
            name: 'endTime',
            type: 'date',
            esTypes: ['date_nanos'],
            scripted: false,
            searchable: true,
            aggregatable: true,
            readFromDocValues: true,
          },
          {
            name: 'duration',
            type: 'number',
            esTypes: ['long'],
            scripted: false,
            searchable: true,
            aggregatable: true,
            readFromDocValues: true,
          },
          {
            name: 'service.name',
            type: 'string',
            esTypes: ['keyword'],
            scripted: false,
            searchable: true,
            aggregatable: true,
            readFromDocValues: true,
          },
          {
            name: 'status.code',
            type: 'number',
            esTypes: ['integer'],
            scripted: false,
            searchable: true,
            aggregatable: true,
            readFromDocValues: true,
          },
          {
            name: 'status.message',
            type: 'string',
            esTypes: ['text'],
            scripted: false,
            searchable: true,
            aggregatable: false,
            readFromDocValues: false,
          },
          {
            name: 'attributes.http.method',
            type: 'string',
            esTypes: ['keyword'],
            scripted: false,
            searchable: true,
            aggregatable: true,
            readFromDocValues: true,
          },
          {
            name: 'attributes.http.url',
            type: 'string',
            esTypes: ['keyword'],
            scripted: false,
            searchable: true,
            aggregatable: true,
            readFromDocValues: true,
          },
          {
            name: 'attributes.http.status_code',
            type: 'number',
            esTypes: ['integer'],
            scripted: false,
            searchable: true,
            aggregatable: true,
            readFromDocValues: true,
          },
        ];
        return fields.find((field) => field.name === name);
      },
    },
    getFormatterForField: () => ({}),
  } as unknown) as Dataset,

  // S3 Tables example
  ({
    id: '1e2f3a4b-5c6d-4e7f-8a9b-0c1d2e3f4a5b',
    title: 'table1,table2',
    displayName: 'S3 Web Logs',
    description: 'User behavior and interaction data from the website',
    timeFieldName: 'timestamp',
    type: 'LOGS',
    version: '1.0.0',
    dataSourceRef: {
      id: 'd4e5f6a7-b8c9-4d0e-1f2a-3b4c5d6e7f8a',
      type: 'data-source',
      name: 's3://analytics-bucket',
    },
    fields: {
      getAll: () => [
        {
          name: 'timestamp',
          type: 'date',
          esTypes: ['date'],
          scripted: false,
          searchable: true,
          aggregatable: true,
          readFromDocValues: true,
        },
        {
          name: 'user_id',
          type: 'string',
          esTypes: ['keyword'],
          scripted: false,
          searchable: true,
          aggregatable: true,
          readFromDocValues: true,
        },
        {
          name: 'session_id',
          type: 'string',
          esTypes: ['keyword'],
          scripted: false,
          searchable: true,
          aggregatable: true,
          readFromDocValues: true,
        },
        {
          name: 'page_url',
          type: 'string',
          esTypes: ['keyword'],
          scripted: false,
          searchable: true,
          aggregatable: true,
          readFromDocValues: true,
        },
        {
          name: 'page_title',
          type: 'string',
          esTypes: ['text', 'keyword'],
          scripted: false,
          searchable: true,
          aggregatable: true,
          readFromDocValues: true,
        },
        {
          name: 'referrer',
          type: 'string',
          esTypes: ['keyword'],
          scripted: false,
          searchable: true,
          aggregatable: true,
          readFromDocValues: true,
        },
        {
          name: 'user_agent',
          type: 'string',
          esTypes: ['text'],
          scripted: false,
          searchable: true,
          aggregatable: false,
          readFromDocValues: false,
        },
        {
          name: 'ip_address',
          type: 'ip',
          esTypes: ['ip'],
          scripted: false,
          searchable: true,
          aggregatable: true,
          readFromDocValues: true,
        },
        {
          name: 'country',
          type: 'string',
          esTypes: ['keyword'],
          scripted: false,
          searchable: true,
          aggregatable: true,
          readFromDocValues: true,
        },
        {
          name: 'city',
          type: 'string',
          esTypes: ['keyword'],
          scripted: false,
          searchable: true,
          aggregatable: true,
          readFromDocValues: true,
        },
        {
          name: 'browser',
          type: 'string',
          esTypes: ['keyword'],
          scripted: false,
          searchable: true,
          aggregatable: true,
          readFromDocValues: true,
        },
        {
          name: 'os',
          type: 'string',
          esTypes: ['keyword'],
          scripted: false,
          searchable: true,
          aggregatable: true,
          readFromDocValues: true,
        },
        {
          name: 'device_type',
          type: 'string',
          esTypes: ['keyword'],
          scripted: false,
          searchable: true,
          aggregatable: true,
          readFromDocValues: true,
        },
      ],
      getByName: (name: string) => {
        const fields = [
          {
            name: 'timestamp',
            type: 'date',
            esTypes: ['date'],
            scripted: false,
            searchable: true,
            aggregatable: true,
            readFromDocValues: true,
          },
          {
            name: 'user_id',
            type: 'string',
            esTypes: ['keyword'],
            scripted: false,
            searchable: true,
            aggregatable: true,
            readFromDocValues: true,
          },
          {
            name: 'session_id',
            type: 'string',
            esTypes: ['keyword'],
            scripted: false,
            searchable: true,
            aggregatable: true,
            readFromDocValues: true,
          },
          {
            name: 'page_url',
            type: 'string',
            esTypes: ['keyword'],
            scripted: false,
            searchable: true,
            aggregatable: true,
            readFromDocValues: true,
          },
          {
            name: 'page_title',
            type: 'string',
            esTypes: ['text', 'keyword'],
            scripted: false,
            searchable: true,
            aggregatable: true,
            readFromDocValues: true,
          },
          {
            name: 'referrer',
            type: 'string',
            esTypes: ['keyword'],
            scripted: false,
            searchable: true,
            aggregatable: true,
            readFromDocValues: true,
          },
          {
            name: 'user_agent',
            type: 'string',
            esTypes: ['text'],
            scripted: false,
            searchable: true,
            aggregatable: false,
            readFromDocValues: false,
          },
          {
            name: 'ip_address',
            type: 'ip',
            esTypes: ['ip'],
            scripted: false,
            searchable: true,
            aggregatable: true,
            readFromDocValues: true,
          },
          {
            name: 'country',
            type: 'string',
            esTypes: ['keyword'],
            scripted: false,
            searchable: true,
            aggregatable: true,
            readFromDocValues: true,
          },
          {
            name: 'city',
            type: 'string',
            esTypes: ['keyword'],
            scripted: false,
            searchable: true,
            aggregatable: true,
            readFromDocValues: true,
          },
          {
            name: 'browser',
            type: 'string',
            esTypes: ['keyword'],
            scripted: false,
            searchable: true,
            aggregatable: true,
            readFromDocValues: true,
          },
          {
            name: 'os',
            type: 'string',
            esTypes: ['keyword'],
            scripted: false,
            searchable: true,
            aggregatable: true,
            readFromDocValues: true,
          },
          {
            name: 'device_type',
            type: 'string',
            esTypes: ['keyword'],
            scripted: false,
            searchable: true,
            aggregatable: true,
            readFromDocValues: true,
          },
        ];
        return fields.find((field) => field.name === name);
      },
    },
    getFormatterForField: () => ({}),
  } as unknown) as Dataset,

  // CloudWatch Logs example
  ({
    id: '3a4b5c6d-7e8f-4a9b-8c0d-2e3f4a5b6c7d',
    title: '/aws/lambda/api-service',
    displayName: 'API Service Logs',
    description: 'Lambda API service logs from CloudWatch',
    timeFieldName: 'timestamp',
    type: 'LOGS',
    version: '1.0.0',
    fieldsPersistence: 'SELECTIVE',
    dataSourceRef: {
      id: 'e5f6a7b8-c9d0-4e1f-2a3b-4c5d6e7f8a9b',
      type: 'data-source',
      name: 'cloudwatch://aws-cloudwatch/us-west-2',
    },
    runtimeFieldMap: {
      'otel.timestamp': {
        type: 'date',
        sourceField: 'timestamp',
      },
      'otel.severity.text': {
        type: 'keyword',
        sourceField: 'message.level',
      },
    },
    fields: {
      getAll: () => [
        {
          name: 'timestamp',
          description: 'Event timestamp',
          type: 'date',
          esTypes: ['date'],
          scripted: false,
          searchable: true,
          aggregatable: true,
          readFromDocValues: true,
        },
        {
          name: 'message.level',
          description: 'Log level',
          type: 'string',
          esTypes: ['keyword'],
          scripted: false,
          searchable: true,
          aggregatable: true,
          readFromDocValues: true,
          facetConfig: {
            enabled: true,
            values: ['INFO', 'WARN', 'ERROR', 'DEBUG'],
            type: 'AUTO',
            updatedAt: '2025-06-10T07:00:00.000Z',
          },
        },
        {
          name: 'message.text',
          description: 'Log message content',
          type: 'string',
          esTypes: ['text'],
          scripted: false,
          searchable: true,
          aggregatable: false,
          readFromDocValues: false,
        },
        {
          name: 'message.responseTime',
          description: 'API response time',
          type: 'number',
          esTypes: ['float'],
          scripted: false,
          searchable: true,
          aggregatable: true,
          readFromDocValues: true,
        },
        {
          name: 'lambda.functionName',
          description: 'Lambda function name',
          type: 'string',
          esTypes: ['keyword'],
          scripted: false,
          searchable: true,
          aggregatable: true,
          readFromDocValues: true,
        },
        {
          name: 'lambda.requestId',
          description: 'Lambda request ID',
          type: 'string',
          esTypes: ['keyword'],
          scripted: false,
          searchable: true,
          aggregatable: true,
          readFromDocValues: true,
        },
      ],
      getByName: (name: string) => {
        const fields = [
          {
            name: 'timestamp',
            description: 'Event timestamp',
            type: 'date',
            esTypes: ['date'],
            scripted: false,
            searchable: true,
            aggregatable: true,
            readFromDocValues: true,
          },
          {
            name: 'message.level',
            description: 'Log level',
            type: 'string',
            esTypes: ['keyword'],
            scripted: false,
            searchable: true,
            aggregatable: true,
            readFromDocValues: true,
            facetConfig: {
              enabled: true,
              values: ['INFO', 'WARN', 'ERROR', 'DEBUG'],
              type: 'AUTO',
              updatedAt: '2025-06-10T07:00:00.000Z',
            },
          },
          {
            name: 'message.text',
            description: 'Log message content',
            type: 'string',
            esTypes: ['text'],
            scripted: false,
            searchable: true,
            aggregatable: false,
            readFromDocValues: false,
          },
          {
            name: 'message.responseTime',
            description: 'API response time',
            type: 'number',
            esTypes: ['float'],
            scripted: false,
            searchable: true,
            aggregatable: true,
            readFromDocValues: true,
          },
          {
            name: 'lambda.functionName',
            description: 'Lambda function name',
            type: 'string',
            esTypes: ['keyword'],
            scripted: false,
            searchable: true,
            aggregatable: true,
            readFromDocValues: true,
          },
          {
            name: 'lambda.requestId',
            description: 'Lambda request ID',
            type: 'string',
            esTypes: ['keyword'],
            scripted: false,
            searchable: true,
            aggregatable: true,
            readFromDocValues: true,
          },
        ];
        return fields.find((field) => field.name === name);
      },
    },
    getFormatterForField: () => ({}),
  } as unknown) as Dataset,

  // Prometheus Metrics example
  ({
    id: '5c6d7e8f-9a0b-4c1d-8e2f-4a5b6c7d8e9f',
    title: 'prometheus:api-server',
    displayName: 'API Server Metrics',
    description: 'Performance metrics for API servers',
    timeFieldName: 'timestamp',
    type: 'METRICS',
    version: '1.0.0',
    fieldsPersistence: 'SELECTIVE',
    dataSourceRef: {
      id: 'f6a7b8c9-d0e1-4f2a-3b4c-5d6e7f8a9b0c',
      type: 'data-source',
      name: 'prometheus://prometheus:9090',
    },
    runtimeFieldMap: {
      'otel.metric.name': {
        type: 'keyword',
        sourceField: 'metric.__name__',
      },
      'otel.service.instance.id': {
        type: 'keyword',
        sourceField: 'metric.instance',
      },
      'otel.metric.value': {
        type: 'double',
        sourceField: 'value',
      },
    },
    fields: {
      getAll: () => [
        {
          name: 'timestamp',
          description: 'Metric timestamp',
          type: 'date',
          esTypes: ['date'],
          scripted: false,
          searchable: true,
          aggregatable: true,
          readFromDocValues: true,
        },
        {
          name: 'metric.__name__',
          description: 'Metric name',
          type: 'string',
          esTypes: ['keyword'],
          scripted: false,
          searchable: true,
          aggregatable: true,
          readFromDocValues: true,
          facetConfig: {
            enabled: true,
            values: [
              'http_requests_total',
              'system_cpu_usage',
              'memory_usage_bytes',
              'disk_io_operations',
              'network_bytes_total',
            ],
            type: 'AUTO',
            updatedAt: '2025-06-10T07:00:00.000Z',
          },
        },
        {
          name: 'metric.instance',
          description: 'Instance identifier',
          type: 'string',
          esTypes: ['keyword'],
          scripted: false,
          searchable: true,
          aggregatable: true,
          readFromDocValues: true,
        },
        {
          name: 'metric.job',
          description: 'Job name',
          type: 'string',
          esTypes: ['keyword'],
          scripted: false,
          searchable: true,
          aggregatable: true,
          readFromDocValues: true,
        },
        {
          name: 'metric.status_code',
          description: 'HTTP status code',
          type: 'number',
          esTypes: ['integer'],
          scripted: false,
          searchable: true,
          aggregatable: true,
          readFromDocValues: true,
          facetConfig: {
            enabled: true,
            values: [200, 201, 301, 302, 400, 401, 403, 404, 500, 503],
            type: 'AUTO',
            updatedAt: '2025-06-10T07:00:00.000Z',
          },
        },
        {
          name: 'value',
          description: 'Metric value',
          type: 'number',
          esTypes: ['float'],
          scripted: false,
          searchable: true,
          aggregatable: true,
          readFromDocValues: true,
        },
      ],
      getByName: (name: string) => {
        const fields = [
          {
            name: 'timestamp',
            description: 'Metric timestamp',
            type: 'date',
            esTypes: ['date'],
            scripted: false,
            searchable: true,
            aggregatable: true,
            readFromDocValues: true,
          },
          {
            name: 'metric.__name__',
            description: 'Metric name',
            type: 'string',
            esTypes: ['keyword'],
            scripted: false,
            searchable: true,
            aggregatable: true,
            readFromDocValues: true,
            facetConfig: {
              enabled: true,
              values: [
                'http_requests_total',
                'system_cpu_usage',
                'memory_usage_bytes',
                'disk_io_operations',
                'network_bytes_total',
              ],
              type: 'AUTO',
              updatedAt: '2025-06-10T07:00:00.000Z',
            },
          },
          {
            name: 'metric.instance',
            description: 'Instance identifier',
            type: 'string',
            esTypes: ['keyword'],
            scripted: false,
            searchable: true,
            aggregatable: true,
            readFromDocValues: true,
          },
          {
            name: 'metric.job',
            description: 'Job name',
            type: 'string',
            esTypes: ['keyword'],
            scripted: false,
            searchable: true,
            aggregatable: true,
            readFromDocValues: true,
          },
          {
            name: 'metric.status_code',
            description: 'HTTP status code',
            type: 'number',
            esTypes: ['integer'],
            scripted: false,
            searchable: true,
            aggregatable: true,
            readFromDocValues: true,
            facetConfig: {
              enabled: true,
              values: [200, 201, 301, 302, 400, 401, 403, 404, 500, 503],
              type: 'AUTO',
              updatedAt: '2025-06-10T07:00:00.000Z',
            },
          },
          {
            name: 'value',
            description: 'Metric value',
            type: 'number',
            esTypes: ['float'],
            scripted: false,
            searchable: true,
            aggregatable: true,
            readFromDocValues: true,
          },
        ];
        return fields.find((field) => field.name === name);
      },
    },
    getFormatterForField: () => ({}),
  } as unknown) as Dataset,

  // Virtual Dataset example
  ({
    id: '8a20a579-1e5b-4d19-bdce-0eac99f5cfbe::prod-cluster-1::logs',
    title: 'prod-cluster-1',
    displayName: 'prod-cluster-1 logs',
    description: 'Virtual dataset for logs from production cluster',
    type: 'LOGS',
    meta: {
      source: 'virtual',
    },
    timeFieldName: '@timestamp',
    dataSourceRef: {
      id: '8a20a579-1e5b-4d19-bdce-0eac99f5cfbe',
      type: 'data-source',
      name: 'opensearch://prod-cluster-1/*',
    },
    typeMeta: {
      params: {
        index: '*',
      },
    },
    fields: {
      getAll: () => [
        {
          name: '@timestamp',
          description: 'Event timestamp',
          type: 'date',
          esTypes: ['date'],
          scripted: false,
          searchable: true,
          aggregatable: true,
          readFromDocValues: true,
        },
        {
          name: 'message',
          description: 'Log message',
          type: 'string',
          esTypes: ['text'],
          scripted: false,
          searchable: true,
          aggregatable: false,
          readFromDocValues: false,
        },
        {
          name: 'level',
          description: 'Log level',
          type: 'string',
          esTypes: ['keyword'],
          scripted: false,
          searchable: true,
          aggregatable: true,
          readFromDocValues: true,
          facetConfig: {
            enabled: true,
            values: ['INFO', 'WARN', 'ERROR', 'DEBUG'],
            type: 'AUTO',
            updatedAt: '2025-06-10T07:00:00.000Z',
          },
        },
      ],
      getByName: (name: string) => {
        const fields = [
          {
            name: '@timestamp',
            description: 'Event timestamp',
            type: 'date',
            esTypes: ['date'],
            scripted: false,
            searchable: true,
            aggregatable: true,
            readFromDocValues: true,
          },
          {
            name: 'message',
            description: 'Log message',
            type: 'string',
            esTypes: ['text'],
            scripted: false,
            searchable: true,
            aggregatable: false,
            readFromDocValues: false,
          },
          {
            name: 'level',
            description: 'Log level',
            type: 'string',
            esTypes: ['keyword'],
            scripted: false,
            searchable: true,
            aggregatable: true,
            readFromDocValues: true,
            facetConfig: {
              enabled: true,
              values: ['INFO', 'WARN', 'ERROR', 'DEBUG'],
              type: 'AUTO',
              updatedAt: '2025-06-10T07:00:00.000Z',
            },
          },
        ];
        return fields.find((field) => field.name === name);
      },
    },
    getFormatterForField: () => ({}),
  } as unknown) as Dataset,
];

const editorOptions: monaco.editor.IEditorConstructionOptions = {
  minimap: { enabled: false },
  scrollBeyondLastLine: false,
  folding: true,
  readOnly: false,
  lineNumbers: 'on',
  renderLineHighlight: 'all',
  automaticLayout: true,
};

const createMockDatasetsService = (datasets: Dataset[] = [], shouldError: boolean = false) => ({
  getIds: async () => {
    if (shouldError) throw new Error('Failed to fetch dataset IDs');
    return datasets.map((d) => d.id || '');
  },
  get: async (id: string) => {
    if (shouldError) throw new Error(`Dataset ${id} not found`);
    return datasets.find((d) => d.id === id);
  },
});

const createMockServices = (datasets: Dataset[] = [], error: boolean = false) =>
  (({
    appName: 'opensearch-dashboards',
    uiSettings: {
      get: () => Promise.resolve(true),
      getAll: () => Promise.resolve({}),
      set: () => Promise.resolve(true),
      remove: () => Promise.resolve(true),
    },
    savedObjects: {
      client: {},
    },
    notifications: {
      toasts: {
        addSuccess: () => ({ id: '1' }),
        addWarning: () => ({ id: '1' }),
        addDanger: () => ({ id: '1' }),
        addError: () => ({ id: '1' }),
        addInfo: () => ({ id: '1' }),
      },
    },
    http: {},
    data: {
      datasets: createMockDatasetsService(datasets, error),
      query: {},
      search: {},
      fieldFormats: {},
      indexPatterns: {},
    },
  } as unknown) as IDataPluginServices);

const DatasetSelectWithDetails = ({
  services,
  selectedDataset,
}: {
  services: IDataPluginServices;
  selectedDataset?: Dataset;
}) => {
  const [currentDataset, setCurrentDataset] = useState(selectedDataset);
  const [selectedTabId, setSelectedTabId] = useState('json');

  const handleSelect = (dataset: Dataset) => {
    setCurrentDataset(dataset);
    action('dataset-selected')(dataset);
  };

  const formatForDisplay = (dataset: Dataset) => {
    if (!dataset) return '';

    // Create a copy of the dataset with fields array included
    const datasetWithFields = {
      ...dataset,
      fields: {
        ...dataset.fields,
        // Include the actual fields array from getAll()
        fieldsList: dataset.fields.getAll(),
      },
    };

    return JSON.stringify(datasetWithFields, null, 2);
  };

  // Current index pattern contract (before)
  const getCurrentIndexPatternContract = () => {
    return `{
  "id": "string | optional | Unique identifier for the index pattern",
  "title": "string | required | The pattern string for matching index names and display name",
  "timeFieldName": "string | optional | Name of the field containing timestamps",
  "intervalName": "string | null | optional | Time interval for time-based index patterns",
  "type": "string | optional | 'index-pattern'",
  "version": "string | optional | Saved object version",
  "fieldsLoading": "boolean | optional | Whether fields are currently being loaded",
  
  "fields": [{
    "name": "string | required",
    "type": "string | required",
    "esTypes": "string[] | optional",
    "count": "number | optional",
    "scripted": "boolean | optional",
    "searchable": "boolean | required",
    "aggregatable": "boolean | required",
    "readFromDocValues": "boolean | optional",
    "script": "string | optional",
    "lang": "string | optional"
  }],
  
  "sourceFilters": [{
    "value": "string | optional"
  }],
  
  "fieldFormatMap": {
    "[key: string]": {
      "id": "string | optional",
      "params": "object | optional"
    }
  },
  
  "typeMeta": {
    "aggs": {
      "[key: string]": {
        "agg": "string | optional",
        "interval": "number | optional",
        "fixed_interval": "string | optional",
        "calendar_interval": "string | optional",
        "delay": "string | optional",
        "time_zone": "string | optional",
      }
    },
    // API specific parameters
     "params": {
      "[key: string]": "any | optional"
    },
    "[key: string]": "any | optional | Accepts any additional properties"
  },

  // OPTIONAL
  "dataSourceRef": {
    "id": "string | required",
    "type": "string | required | always 'data-source'",
    "name": "string | optional"
  }
}`;
  };

  // Proposed dataset interface (after)
  const getProposedDatasetInterface = () => {
    return `{
  "id": "string | optional | Unique identifier for the dataset",
  "title": "string | required | The pattern string for matching data structures for any data sources. Used for display name if displayName is not defined",
  "displayName": "string | optional | Human-readable name for the dataset",
  "description": "string | optional | Description of the dataset",
  "timeFieldName": "string | optional | Name of the field containing timestamps",
  "intervalName": "string | null | optional | Time interval for time-based index patterns",
  "type": "string | optional | Signal type (LOGS, METRICS, TRACES, DOCUMENTS, etc.)",
  "version": "string | optional | Saved object version",
  "fieldsLoading": "boolean | optional | Whether fields are currently being loaded",
  
  "fields": [{
    "name": "string | required",
    "description": "string | optional | Description of the field",
    "type": "string | required",
    "esTypes": "string[] | optional",
    "count": "number | optional",
    "scripted": "boolean | optional",
    "searchable": "boolean | required",
    "aggregatable": "boolean | required",
    "readFromDocValues": "boolean | optional",
    "script": "string | optional",
    "lang": "string | optional",
    "facetConfig": {
      "enabled": "boolean | optional | Whether faceting is enabled for this field",
      "values": "array | optional | Current facet values",
      "type": "string | optional | How values were determined (API, MANUAL, AUTO)",
      "updatedAt": "string | optional | When values were last updated"
    }
  }],
  
  "sourceFilters": [{
    "value": "string | optional"
  }],
  
  "fieldFormatMap": {
    "[key: string]": {
      "id": "string | optional",
      "params": "object | optional"
    }
  },
  
  "runtimeFieldMap": {
    "[targetField: string]": {
      "type": "string | required | Field type (number, string, date, etc.)",
      "sourceField": "string | optional | Original field to derive from",
      "script": "string | optional | Script to generate the field value"
    }
  },
  
  "typeMeta": {
    "aggs": {
      "[key: string]": {
        "agg": "string | optional",
        "interval": "number | optional",
        "fixed_interval": "string | optional",
        "calendar_interval": "string | optional",
        "delay": "string | optional",
        "time_zone": "string | optional"
      }
    },
    "params": {
      "[key: string]": "any | optional"
    },
    "[key: string]": "any | optional | Accepts any additional properties"
  },
  
  "dataSourceRef": {
    "id": "string | required | Unique identifier for the data source",
    "type": "string | required | always 'data-source'",
    "name": "string | optional | URI-style identifier (e.g., 'opensearch://default', 's3://bucket')"
  },
  "dataSourceParamsRef": "string | optional | Reference to a saved set of data source parameters"
}`;
  };

  // Current and proposed interface texts
  const currentInterfaceText = getCurrentIndexPatternContract();
  const proposedInterfaceText = getProposedDatasetInterface();

  // State for temporary dataset creation
  const [tempDatasetName, setTempDatasetName] = useState('Temporary Dataset');
  const [tempDatasetType, setTempDatasetType] = useState('LOGS');
  const [tempDatasetFields, setTempDatasetFields] = useState<
    Array<{
      name: string;
      type: string;
      esTypes: string[];
      scripted: boolean;
      searchable: boolean;
      aggregatable: boolean;
      readFromDocValues: boolean;
    }>
  >([]);
  const [tempDataset, setTempDataset] = useState<Dataset | null>(null);

  // Create a temporary dataset from a data source
  const createTemporaryDataset = () => {
    // Find a data source to use as a base (using the first dataset's data source)
    const dataSource = mockDatasets[0].dataSourceRef;

    // Create a new temporary dataset that maps over the data source
    const newTempDataset = ({
      id: `temp-${Date.now()}`,
      title: tempDatasetName,
      displayName: `${tempDatasetName} (Temporary)`,
      description: 'A temporary dataset created from mapping over a data source',
      type: tempDatasetType,
      dataSourceRef: dataSource,
      fields: {
        getAll: () => tempDatasetFields,
        getByName: (name: string) => tempDatasetFields.find((field) => field.name === name),
        toSpec: () => ({}),
      },
      fieldFormatMap: {},
      timeFieldName: 'timestamp',
      intervalName: undefined,
      formatHit: (() => {}) as any,
      formatField: (() => {}) as any,
      flattenHit: (() => {}) as any,
      metaFields: [],
      version: '1.0.0',
      getFormatterForField: () => ({} as any),
    } as unknown) as Dataset;

    setTempDataset(newTempDataset);
    action('temporary-dataset-created')(newTempDataset);

    // Also select this dataset to show in the JSON view
    setCurrentDataset(newTempDataset);
  };

  // Generate fields based on the selected type
  useEffect(() => {
    let fields = [];

    // Common fields for all types
    const commonFields = [
      {
        name: 'timestamp',
        type: 'date',
        esTypes: ['date'],
        scripted: false,
        searchable: true,
        aggregatable: true,
        readFromDocValues: true,
      },
      {
        name: 'source',
        type: 'string',
        esTypes: ['keyword'],
        scripted: false,
        searchable: true,
        aggregatable: true,
        readFromDocValues: true,
      },
    ];

    // Type-specific fields
    switch (tempDatasetType) {
      case 'LOGS':
        fields = [
          ...commonFields,
          {
            name: 'message',
            type: 'string',
            esTypes: ['text'],
            scripted: false,
            searchable: true,
            aggregatable: false,
            readFromDocValues: false,
          },
          {
            name: 'level',
            type: 'string',
            esTypes: ['keyword'],
            scripted: false,
            searchable: true,
            aggregatable: true,
            readFromDocValues: true,
          },
        ];
        break;
      case 'METRICS':
        fields = [
          ...commonFields,
          {
            name: 'value',
            type: 'number',
            esTypes: ['float'],
            scripted: false,
            searchable: true,
            aggregatable: true,
            readFromDocValues: true,
          },
          {
            name: 'metric_name',
            type: 'string',
            esTypes: ['keyword'],
            scripted: false,
            searchable: true,
            aggregatable: true,
            readFromDocValues: true,
          },
        ];
        break;
      case 'TRACES':
        fields = [
          ...commonFields,
          {
            name: 'traceId',
            type: 'string',
            esTypes: ['keyword'],
            scripted: false,
            searchable: true,
            aggregatable: true,
            readFromDocValues: true,
          },
          {
            name: 'spanId',
            type: 'string',
            esTypes: ['keyword'],
            scripted: false,
            searchable: true,
            aggregatable: true,
            readFromDocValues: true,
          },
          {
            name: 'duration',
            type: 'number',
            esTypes: ['long'],
            scripted: false,
            searchable: true,
            aggregatable: true,
            readFromDocValues: true,
          },
        ];
        break;
      default:
        fields = commonFields;
    }

    setTempDatasetFields(fields);
  }, [tempDatasetType]);

  const tabs = [
    {
      id: 'diff',
      name: 'Interface Comparison',
      disabled: false,
    },
    {
      id: 'json',
      name: 'JSON View',
      disabled: !currentDataset,
    },
  ];

  const onSelectedTabChanged = (id: string) => {
    setSelectedTabId(id);
  };

  const renderTabs = () => {
    return (
      <EuiTabs>
        {tabs.map((tab, index) => (
          <EuiTab
            key={index}
            isSelected={tab.id === selectedTabId}
            disabled={tab.disabled}
            onClick={() => onSelectedTabChanged(tab.id)}
          >
            {tab.name}
          </EuiTab>
        ))}
      </EuiTabs>
    );
  };

  // Render the temporary dataset creation UI
  const renderTemporaryDatasetTab = () => {
    return (
      <div>
        <EuiTitle size="s">
          <h3>Create Temporary Dataset</h3>
        </EuiTitle>
        <EuiSpacer size="m" />
        <EuiText>
          <p>
            Create a temporary dataset by mapping over a data source. This demonstrates how to
            create datasets that point to sub-datastructures within a data source.
          </p>
        </EuiText>
        <EuiSpacer size="m" />

        <EuiFlexGroup>
          <EuiFlexItem>
            <EuiFormRow label="Dataset Name">
              <EuiFieldText
                value={tempDatasetName}
                onChange={(e) => setTempDatasetName(e.target.value)}
              />
            </EuiFormRow>
          </EuiFlexItem>
          <EuiFlexItem>
            <EuiFormRow label="Dataset Type">
              <EuiSelect
                options={[
                  { value: 'LOGS', text: 'Logs' },
                  { value: 'METRICS', text: 'Metrics' },
                  { value: 'TRACES', text: 'Traces' },
                ]}
                value={tempDatasetType}
                onChange={(e) => setTempDatasetType(e.target.value)}
              />
            </EuiFormRow>
          </EuiFlexItem>
        </EuiFlexGroup>

        <EuiSpacer size="m" />

        <EuiButton onClick={createTemporaryDataset} fill>
          Create Temporary Dataset
        </EuiButton>

        <EuiSpacer size="l" />

        {tempDataset && (
          <>
            <EuiPanel>
              <EuiTitle size="xs">
                <h4>Generated Fields</h4>
              </EuiTitle>
              <EuiSpacer size="s" />
              <EuiCodeBlock language="json" fontSize="s" paddingSize="m">
                {JSON.stringify(tempDatasetFields, null, 2)}
              </EuiCodeBlock>
            </EuiPanel>

            <EuiSpacer size="m" />

            <EuiText>
              <p>
                The temporary dataset has been created and selected. You can view its details in the
                JSON View tab.
              </p>
            </EuiText>
          </>
        )}
      </div>
    );
  };

  return (
    <div>
      <DatasetSelect onSelect={handleSelect} services={services} />

      <EuiSpacer size="s" />
      {renderTabs()}
      <EuiSpacer size="s" />

      <EuiSplitPanel.Outer direction="row">
        <EuiSplitPanel.Inner color="subdued">
          {selectedTabId === 'json' && currentDataset ? (
            <MonacoEditor
              language="xjson"
              theme="euiColors"
              value={formatForDisplay(currentDataset)}
              onChange={() => {}}
              height={600}
              options={editorOptions}
            />
          ) : (
            <div style={{ height: 700, overflow: 'auto' }}>
              <EuiText size="s">
                <h4>Key Enhancements</h4>
                <ul>
                  <li>
                    <strong>displayName</strong>: Human-readable name for the dataset, separate from
                    the technical pattern
                  </li>
                  <li>
                    <strong>description</strong>: Detailed description of the dataset&apos;s purpose
                    and contents
                  </li>
                  <li>
                    <strong>type</strong>: Signal type categorization (LOGS, METRICS, TRACES,
                    DOCUMENTS)
                  </li>
                  <li>
                    <strong>field.description</strong>: Description of each field&apos;s purpose and
                    contents
                  </li>
                  <li>
                    <strong>field.facetConfig</strong>: Configuration for faceted navigation on
                    specific fields
                  </li>
                  <li>
                    <strong>runtimeFieldMap</strong>: Mapping fields to standard formats like
                    OpenTelemetry
                  </li>
                  <li>
                    <strong>dataSourceRef</strong>: Enhanced reference to the data source with
                    URI-style identifier
                  </li>
                </ul>
              </EuiText>
              <EuiSpacer size="s" />
              <EuiFlexGroup>
                <EuiFlexItem>
                  <EuiTitle size="xs">
                    <h4>Current</h4>
                  </EuiTitle>
                  <EuiSpacer size="xs" />
                  <MonacoEditor
                    language="xjson"
                    theme="euiColors"
                    value={currentInterfaceText}
                    onChange={() => {}}
                    height={500}
                    options={{
                      ...editorOptions,
                      readOnly: true,
                    }}
                  />
                </EuiFlexItem>
                <EuiFlexItem>
                  <EuiTitle size="xs">
                    <h4>Proposed</h4>
                  </EuiTitle>
                  <EuiSpacer size="xs" />
                  <MonacoEditor
                    language="xjson"
                    theme="euiColors"
                    value={proposedInterfaceText}
                    onChange={() => {}}
                    height={500}
                    options={{
                      ...editorOptions,
                      readOnly: true,
                    }}
                  />
                </EuiFlexItem>
              </EuiFlexGroup>
            </div>
          )}
        </EuiSplitPanel.Inner>
      </EuiSplitPanel.Outer>
    </div>
  );
};

export default {
  title: 'Data/DatasetSelect',
  component: DatasetSelect,
  parameters: {
    docs: {
      description: {
        component: 'A component for selecting datasets using the Datasets Service',
      },
    },
  },
};

// @ts-ignore - Storybook action() type issues
export const Default = () => (
  <DatasetSelectWithDetails services={createMockServices(mockDatasets)} />
);
