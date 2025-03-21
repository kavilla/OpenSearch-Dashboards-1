/*
 * Copyright OpenSearch Contributors
 * SPDX-License-Identifier: Apache-2.0
 */

interface DataSourceResponse {
  id: string;
  body?: {
    id: string;
    saved_objects?: Array<{
      id: string;
    }>;
  };
}

export { DataSourceResponse };
