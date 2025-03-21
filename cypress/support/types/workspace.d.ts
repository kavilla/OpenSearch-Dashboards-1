/*
 * Copyright OpenSearch Contributors
 * SPDX-License-Identifier: Apache-2.0
 */

interface WorkspaceAttributes {
  name: string;
  features?: string[];
  description?: string;
  [key: string]: any;
}

interface WorkspaceCreateOptions {
  settings?: Record<string, any>;
  name: string;
  features?: string[];
  description?: string;
  [key: string]: any;
}

interface WorkspaceDeleteOptions {
  id?: string;
  name?: string;
}

interface WorkspaceResponse {
  success: boolean;
  result: {
    id: string;
    workspaces?: Array<{
      id: string;
      name: string;
    }>;
  };
}

export { WorkspaceAttributes, WorkspaceCreateOptions, WorkspaceDeleteOptions, WorkspaceResponse };
