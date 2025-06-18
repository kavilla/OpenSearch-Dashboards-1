# OpenSearch Dashboards Dataset Design Document

This document consolidates the design and implementation details for the Dataset abstraction in OpenSearch Dashboards, which serves as a unified interface for diverse data sources.

## Table of Contents

- [Problem Statement](#problem-statement)
- [Background](#background)
- [Requirements](#requirements)
- [Dataset Interface](#dataset-interface)
- [Implementation Approach](#implementation-approach)
- [Virtual Datasets](#virtual-datasets)
- [Examples](#examples)
- [Usage Notes](#usage-notes)
- [FAQ](#faq)

## Problem Statement

Index patterns in OpenSearch Dashboards are tightly coupled to OpenSearch indices, limiting their effectiveness for diverse data sources like S3, CloudWatch, Prometheus, and distributed traces. This coupling creates fragmented interfaces and inconsistent workflows across data types, making unified visualization and analytics difficult while reducing productivity.

Key challenges include:

- Limited data categorization by signal type (logs, metrics, traces) within observability workflows
- Inconsistent exploration and querying across data sources
- Poor field management for high-cardinality sources
- Difficulty mapping to standard formats like OpenTelemetry

From a technical view, index patterns within OSD assume OpenSearch-specific features on data storage and discovery. They lack proper metadata support for identifying data sources and types. Furthermore, the `dataSourceRef` field within index patterns does not follow standard patterns, creating difficulties in adding new data sources or creating consistent interfaces.

These limitations prevent developing a unified data access layer for modern observability and analytics workflows.

## Background

### What are Index Patterns?

Index patterns are a core concept in OpenSearch Dashboards that serve as a bridge between raw data stored in OpenSearch indices and the visualization and analysis capabilities of the platform.

#### Technical Definition

An index pattern is a saved object that:

1. Defines a pattern for matching one or more OpenSearch indices (e.g., `logs-*`)
2. Contains metadata about the fields available in those indices
3. Specifies how those fields should be formatted and displayed
4. Identifies a time field for time-based operations

#### Customer Perspective

From a customer's perspective, index patterns are:

- The entry point for accessing and visualizing data in OpenSearch Dashboards
- A way to define which data they want to work with
- A mechanism for configuring how that data should be displayed and interpreted
- A prerequisite for creating visualizations, dashboards, and other analytics

### How Index Patterns Work

#### Within the Repository

In the OpenSearch Dashboards codebase, index patterns are implemented as:

1. **Saved Objects**: Index patterns are stored as saved objects of type 'index-pattern' in the OpenSearch `.kibana` index.

2. **Class Structure**: The `IndexPattern` class (`src/plugins/data/common/index_patterns/index_patterns/index_pattern.ts`) encapsulates the functionality for working with index patterns.

3. **Service Layer**: The `IndexPatternsService` (`src/plugins/data/common/index_patterns/index_patterns/index_patterns.ts`) provides methods for creating, retrieving, updating, and deleting index patterns.

4. **Field Discovery**: When an index pattern is created or refreshed, it uses the OpenSearch field caps API to discover available fields and their types.

5. **Field Formatting**: The `fieldFormatMap` property defines how different fields should be formatted for display.

6. **References**: Index patterns can reference other saved objects, particularly data sources, through the `dataSourceRef` property.

#### Lifecycle

The typical lifecycle of an index pattern includes:

1. **Creation**: A user or the system creates an index pattern by specifying a pattern that matches one or more indices.

2. **Field Discovery**: The system queries OpenSearch to discover the fields available in the matching indices.

3. **Configuration**: The user configures settings like the time field, field formats, and other metadata.

4. **Usage**: The index pattern is used as a data source for visualizations, dashboards, and other features.

5. **Updates**: As the underlying data changes, the index pattern may be updated to reflect new fields or changes in field types.

6. **Deletion**: When no longer needed, the index pattern can be deleted.

### Current Limitations

The current index pattern implementation is primarily designed for working with OpenSearch indices and has several limitations when it comes to supporting other data sources:

1. **OpenSearch-Centric**: The implementation assumes data is stored in OpenSearch indices and can be queried using OpenSearch query DSL.

2. **Limited Metadata**: There's limited support for metadata about the data source, signal type, and other important attributes.

3. **Inconsistent Reference Handling**: The `dataSourceRef` implementation doesn't follow the standard reference pattern used elsewhere in the codebase.

4. **Tight Coupling**: The implementation is tightly coupled to OpenSearch-specific concepts and APIs.

These limitations have led to the need for a more flexible and extensible approach to working with diverse data sources, which is where the dataset concept comes in.

## Requirements

### Functional Requirements

| Requirement | Description |
|-------------|-------------|
| Dataset type | Support various data sources while maintaining backward compatibility of the existing type field |
| Dataset signal type | Add support for categorizing datasets by signal type or other classification to distinguish between logs, metrics, traces, documents, and other data categories |
| Data-source type | Enhance the existing `dataSourceRef` structure to properly identify and differentiate between data source technologies such as OpenSearch, S3, CloudWatch, and others |
| Facets | Add support for faceted navigation, allowing administrators to designate specific fields that users can use for filtering data through a sidebar interface |
| OTEL field formats | Provide a mechanism for mapping fields to standard formats like OpenTelemetry, enabling data standardization for fields that don't directly conform to standards |
| Settings per data-source | Support data source specific settings and parameters to accommodate different requirements between data sources |

### Non-functional Requirements

| Requirement | Description |
|-------------|-------------|
| Backwards compatible | Maintaining backward compatibility for existing `index-patterns` |
| Supports OSS/AOS/Neo experience | Since this will update `index-patterns` then we must ensure the support for any experience of OSD |
| Supports non-Observability use cases | Since this will update `index-patterns` then it must be useful across different workspace types |
| Optional fields over required if possible | Ensure new fields are optional if possible vs making them required. Prevents migration of existing customers |
| Reuse existing fields if logical | Ensure the usage of existing fields if it makes sense to do so. Prevents confusion on the usage |

## Dataset Interface

The dataset interface extends and enhances the index pattern concept to support diverse data sources while maintaining backward compatibility.

### Interface Definition

```json
{
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
}
```

### Field Descriptions

#### Core Fields

- `id`: Unique identifier for the dataset, used for referencing the dataset in code and URLs.
- `title`: The pattern string for matching data structures (e.g., index pattern, S3 path). Also used as display name if displayName is not defined.
- `displayName`: Human-readable name for the dataset, used in UI components and user-facing elements.
- `description`: Detailed description of the dataset, providing context and information about its contents and purpose.
- `timeFieldName`: Name of the field containing timestamps, used for time-based operations and visualizations.
- `intervalName`: Time interval for time-based index patterns, helps with date histogram aggregations.

#### Type and Status

- `type`: Signal type categorization (LOGS, METRICS, TRACES, DOCUMENTS, etc.), used for filtering and specialized UI components.
- `version`: Saved object version for tracking changes and migrations.
- `fieldsLoading`: Indicates whether fields are currently being loaded, used for UI loading states.

#### Field Definitions

- `fields`: Array of field definitions that describe the structure and properties of the dataset's fields.
  - `name`: Field name, used as the identifier for the field.
  - `description`: Description of the field, providing context about its contents and purpose.
  - `type`: Field data type (keyword, text, number, date, etc.), used for validation and UI components.
  - `esTypes`: OpenSearch/Elasticsearch specific types, used for mapping and query generation.
  - `searchable`: Whether the field can be searched, affects query behavior.
  - `aggregatable`: Whether the field can be aggregated, affects visualization capabilities.
  - `readFromDocValues`: Performance optimization for aggregations.
  - `script`: Script definition for scripted fields.
  - `lang`: Script language for scripted fields.
  - `facetConfig`: Configuration for faceted navigation for this field.
    - `enabled`: Whether faceting is enabled for this field.
    - `values`: Current facet values for the field.
    - `type`: How facet values were determined (API, MANUAL, AUTO).
    - `updatedAt`: Timestamp when facet values were last updated.

#### Filtering and Formatting

- `sourceFilters`: Filters applied to the _source field, used to exclude fields from the source document.
- `fieldFormatMap`: Mapping of field names to format configurations, controls how field values are displayed in the UI.
  - `id`: Format identifier (e.g., "number", "date", "bytes").
  - `params`: Format-specific parameters.

#### Field Transformations

- `runtimeFieldMap`: Mapping of target field names to field transformations, used to create virtual fields or map between formats.
  - `type`: Field data type for the runtime field.
  - `sourceField`: Original field to derive the runtime field from.
  - `script`: Script to generate the field value.

#### Metadata and Configuration

- `typeMeta`: Container for various metadata and configuration settings.
  - `aggs`: Aggregation configurations for specific fields.
  - `params`: API-specific parameters used by the data source.

#### Data Source Reference

- `dataSourceRef`: Reference to the data source that provides the data.
  - `id`: Unique identifier for the data source.
  - `type`: Always 'data-source' for consistency.
  - `name`: URI-style identifier that combines type and path information (e.g., 'opensearch://default', 's3://bucket').
- `dataSourceParamsRef`: Reference to a saved set of data source parameters, enables parameter reuse across datasets.

### Field Persistence

Field persistence is determined implicitly by whether a field is stored in the saved object. Fields that are not stored in the dataset (within the saved object) are not persisted. This approach simplifies the schema and avoids the need for explicit persistence flags.

## Implementation Approach

The preferred implementation approach is **Option 0A: Initially extend `index-pattern` saved object**, which provides the best balance between backward compatibility and architectural clarity. This approach minimizes disruption to existing plugins while establishing a clear path forward for the dataset abstraction.

### Implementation Details

1. The `IndexPatternService` delegates to `DatasetsService` while returning `IndexPattern` objects if accessed
2. The `DatasetsService` returns `Dataset` objects, and plugins can choose either service based on their needs
3. This offers plugins a gradual migration path without forced updates

#### Pros

- Minimal disruption to existing saved object references
- Simpler migration scripts
- Simpler backward compatibility path
- Reduced risk of data loss during transition
- Existing plugins continue to function without modification
- Single unified saved object format
- Clear upgrade path for plugins to adopt dataset capabilities

#### Cons

- Potential limitations in extending the schema for new dataset features
- Technical debt from maintaining legacy field names
- Some edge cases in handling transformations between different object models eventually

### Implementation Phases

The implementation timeline will follow these phases:

| Phase | Description | Date |
|-------|-------------|------|
| Phase 1 | Dataset selection functionality with backward compatibility layer | 5/30/25 |
| Phase 2 | Dataset creation, management, and workspace integration | 7/15/25 |
| Phase 3 | Full standardization and migration of core plugins | 8/31/25 |

### Saved Object Migration

The on-demand migration of saved objects leverages OpenSearch Dashboards' built-in saved objects framework to perform just-in-time conversion. This approach ensures:

- Only accessed index patterns are migrated, minimizing performance impact
- Existing references to index patterns continue to work
- No bulk migration is required during upgrade
- All data is stored in the new dataset format

## Virtual Datasets

Virtual datasets are automatically generated temporary datasets when a data source is added to a workspace. They provide immediate query capabilities without requiring explicit dataset creation.

### Key Concepts

- **Virtual Dataset**: An implicit, ad-hoc "all" slice that OSD shows for every data source + signal. Users treat it exactly like a normal dataset until they hit **Save**, at which point it becomes a real saved object.
- **Automatic Creation**: When a data source is added, virtual datasets are automatically created for it, eliminating the need for manual dataset creation during initial setup.
- **Seamless Transition**: Users can start with a virtual dataset for exploration and then save it as a persistent dataset when they want to reuse it or share it with others.

### Implementation Details

Virtual datasets are implemented with the following characteristics:

- **Representation**: Virtual datasets appear in the dataset selector alongside regular datasets, but are visually distinguished to indicate their virtual nature.
- **Persistence**: Virtual datasets are not stored as saved objects until explicitly saved by the user.
- **Reference Handling**: When a saved search or visualization references a virtual dataset, the system handles this reference appropriately:
  - For temporary use, the reference works without creating a persistent dataset
  - When saving, the user is prompted to save the dataset as a persistent object
- **Data Source Mapping**: Each virtual dataset is associated with exactly one data source, maintaining the 1:1 relationship between datasets and data sources.
- **Signal Type Filtering**: Virtual datasets respect signal type filtering, showing only relevant datasets based on the current context (logs, metrics, traces).

### Identification

Virtual datasets are identified by:

- ID format: `dataSourceId::dataSourceType::signaltype`
- Display name format: `dataSourceTitle signaltype`
- Meta property: `meta.source: "virtual"`

### Workflow

1. **Admin** associates a data source, connecting to an OpenSearch cluster.
2. **User** opens Discover, the system checks if the data source has a corresponding dataset in saved objects. If not, it creates a virtual dataset.
3. **User** opens the dataset select component which lists **"prod-cluster-1 logs"** (virtual dataset).
4. **User** performs queries against this virtual dataset without needing to create a persistent dataset.
5. **User** saves the saved explore, the current dataset will be created if it is a virtual dataset and then associated to the saved explore.

## Examples

### Example Virtual Dataset

```json
{
  "id": "8a20a579-1e5b-4d19-bdce-0eac99f5cfbe::prod-cluster-1::logs",
  "title": "prod-cluster-1",
  "displayName": "prod-cluster-1 logs",
  "type": "LOGS",
  "meta": {
    "source": "virtual"
  },
  "timeFieldName": "@timestamp",
  "dataSourceRef": {
    "id": "8a20a579-1e5b-4d19-bdce-0eac99f5cfbe",
    "type": "data-source",
    "name": "opensearch://prod-cluster-1/*"
  },
  "typeMeta": {
    "params": {
      "index": "*"
    }
  }
}
```

### OpenSearch Indices (Index Pattern)

```json
{
  "id": "7a8b9c0d-1e2f-4a8b-9c0d-3e4f5a6b7c8d",
  "title": "logs-web-*",
  "displayName": "Web Server Logs",
  "description": "Apache web server access logs",
  "timeFieldName": "@timestamp",
  "intervalName": "daily",
  "type": "LOGS",
  "version": "1.0.0",
  "fieldsLoading": false,
  "fields": [
    {
      "name": "@timestamp",
      "description": "Event timestamp",
      "type": "date",
      "esTypes": ["date"],
      "searchable": true,
      "aggregatable": true,
      "readFromDocValues": true,
      "facetConfig": {
        "enabled": false
      }
    },
    {
      "name": "message",
      "description": "Original log message",
      "type": "text",
      "esTypes": ["text"],
      "searchable": true,
      "aggregatable": false,
      "readFromDocValues": false
    },
    {
      "name": "http.response.status_code",
      "description": "HTTP response status code",
      "type": "number",
      "esTypes": ["integer"],
      "searchable": true,
      "aggregatable": true,
      "readFromDocValues": true,
      "facetConfig": {
        "enabled": true,
        "values": [200, 201, 301, 302, 400, 401, 403, 404, 500, 503],
        "type": "AUTO",
        "updatedAt": "2025-06-10T07:00:00.000Z"
      }
    }
  ],
  "sourceFilters": [
    {
      "value": "user_agent"
    }
  ],
  "fieldFormatMap": {
    "http.response.status_code": {
      "id": "number",
      "params": {
        "pattern": "0,0"
      }
    }
  },
  "runtimeFieldMap": {
    "otel.http.status_code": {
      "type": "keyword",
      "sourceField": "http.response.status_code"
    },
    "otel.client.address": {
      "type": "keyword",
      "sourceField": "client.ip"
    }
  },
  "typeMeta": {
    "aggs": {
      "@timestamp": {
        "calendar_interval": "day"
      }
    },
    "params": {
      "index": "logs-web-*",
      "defaultSearchField": "message"
    }
  },
  "dataSourceRef": {
    "id": "default",
    "type": "data-source",
    "name": "opensearch://default"
  },
  "dataSourceParamsRef": "opensearch-default-params"
}
```

### OpenSearch Traces

```json
{
  "id": "9c0d1e2f-3a4b-4c5d-8e9f-5a6b7c8d9e0f",
  "title": "traces-*",
  "displayName": "API Service Traces",
  "description": "Distributed tracing data for API services",
  "timeFieldName": "startTime",
  "type": "TRACES",
  "version": "1.0.0",
  "fieldsLoading": false,
  "fields": [
    {
      "name": "traceId",
      "description": "Unique trace identifier",
      "type": "keyword",
      "esTypes": ["keyword"],
      "searchable": true,
      "aggregatable": true,
      "readFromDocValues": true
    },
    {
      "name": "spanId",
      "description": "Unique span identifier",
      "type": "keyword",
      "esTypes": ["keyword"],
      "searchable": true,
      "aggregatable": true,
      "readFromDocValues": true
    },
    {
      "name": "serviceName",
      "description": "Service name",
      "type": "keyword",
      "esTypes": ["keyword"],
      "searchable": true,
      "aggregatable": true,
      "readFromDocValues": true,
      "facetConfig": {
        "enabled": true,
        "values": ["api-service", "auth-service", "product-service", "payment-service", "notification-service"],
        "type": "AUTO",
        "updatedAt": "2025-06-10T07:00:00.000Z"
      }
    }
  ],
  "fieldFormatMap": {
    "duration": {
      "id": "duration",
      "params": {
        "inputFormat": "nanoseconds",
        "outputFormat": "milliseconds",
        "outputPrecision": 2
      }
    }
  },
  "runtimeFieldMap": {
    "otel.trace_id": {
      "type": "keyword",
      "sourceField": "traceId"
    },
    "otel.span_id": {
      "type": "keyword",
      "sourceField": "spanId"
    }
  },
  "typeMeta": {
    "aggs": {
      "startTime": {
        "calendar_interval": "minute"
      }
    },
    "params": {
      "index": "traces-*",
      "defaultSearchField": "name"
    }
  },
  "dataSourceRef": {
    "id": "default",
    "type": "data-source",
    "name": "opensearch://default"
  },
  "dataSourceParamsRef": "opensearch-default-params"
}
```

### CloudWatch Logs

```json
{
  "id": "3a4b5c6d-7e8f-4a9b-8c0d-2e3f4a5b6c7d",
  "title": "/aws/lambda/api-service",
  "displayName": "API Service Logs",
  "description": "Lambda API service logs from CloudWatch",
  "timeFieldName": "timestamp",
  "type": "LOGS",
  "version": "1.0.0",
  "fieldsLoading": false,
  "fields": [
    {
      "name": "timestamp",
      "description": "Event timestamp",
      "type": "date",
      "searchable": true,
      "aggregatable": true
    },
    {
      "name": "message.level",
      "description": "Log level",
      "type": "keyword",
      "searchable": true,
      "aggregatable": true,
      "facetConfig": {
        "enabled": true,
        "values": ["INFO", "WARN", "ERROR", "DEBUG"],
        "type": "AUTO",
        "updatedAt": "2025-06-10T07:00:00.000Z"
      }
    }
  ],
  "fieldFormatMap": {
    "message.responseTime": {
      "id": "number",
      "params": {
        "pattern": "0,0.[00] ms"
      }
    }
  },
  "runtimeFieldMap": {
    "otel.timestamp": {
      "type": "date",
      "sourceField": "timestamp"
    },
    "otel.severity.text": {
      "type": "keyword",
      "sourceField": "message.level"
    }
  },
  "typeMeta": {
    "params": {
      "region": "us-west-2",
      "logGroupName": "/aws/lambda/api-service",
      "startTime": "-1h",
      "endTime": "now",
      "limit": 10000,
      "messageField": "message",
      "timestampField": "timestamp",
      "parseJson": true
    }
  },
  "dataSourceRef": {
    "id": "aws-cloudwatch",
    "type": "data-source",
    "name": "cloudwatch://aws-cloudwatch/us-west-2"
  },
  "dataSourceParamsRef": "cloudwatch-api-service-params"
}
```

### Prometheus Metrics

```json
{
  "id": "5c6d7e8f-9a0b-4c1d-8e2f-4a5b6c7d8e9f",
  "title": "prometheus:api-server",
  "displayName": "API Server Metrics",
  "description": "Performance metrics for API servers",
  "timeFieldName": "timestamp",
  "type": "METRICS",
  "version": "1.0.0",
  "fieldsLoading": false,
  "fields": [
    {
      "name": "metric.__name__",
      "description": "Metric name",
      "type": "keyword",
      "searchable": true,
      "aggregatable": true,
      "facetConfig": {
        "enabled": true,
        "values": ["http_requests_total", "system_cpu_usage", "memory_usage_bytes", "disk_io_operations", "network_bytes_total"],
        "type": "AUTO",
        "updatedAt": "2025-06-10T07:00:00.000Z"
      }
    },
    {
      "name": "metric.instance",
      "description": "Instance identifier",
      "type": "keyword",
      "searchable": true,
      "aggregatable": true
    },
    {
      "name": "value",
      "description": "Metric value",
      "type": "number",
      "searchable": true,
      "aggregatable": true
    }
  ],
  "fieldFormatMap": {
    "value": {
      "id": "number",
      "params": {
        "pattern": "0,0.[00]"
      }
    }
  },
  "runtimeFieldMap": {
    "otel.metric.name": {
      "type": "keyword",
      "sourceField": "metric.__name__"
    },
    "otel.service.instance.id": {
      "type": "keyword",
      "sourceField": "metric.instance"
    },
    "otel.metric.value": {
      "type": "double",
      "sourceField": "value"
    }
  },
  "typeMeta": {
    "params": {
      "prometheusUrl": "http://prometheus:9090",
      "query": "{job=\"api-server\"}",
      "step": "60s",
      "start": "-1h",
      "end": "now"
    }
  },
  "dataSourceRef": {
    "id": "prometheus",
    "type": "data-source",
    "name": "prometheus://prometheus:9090"
  },
  "dataSourceParamsRef": "prometheus-api-server-params"
}
```

### S3 Tables

```json
{
  "id": "1e2f3a4b-5c6d-4e7f-8a9b-0c1d2e3f4a5b",
  "title": "s3://analytics-bucket/web-events/",
  "displayName": "Web Analytics Data",
  "description": "User behavior and interaction data from the website",
  "timeFieldName": "timestamp",
  "type": "DOCUMENTS",
  "version": "1.0.0",
  "fieldsLoading": false,
  "fields": [
    {
      "name": "timestamp",
      "description": "Event timestamp",
      "type": "date",
      "searchable": true,
      "aggregatable": true,
      "readFromDocValues": true
    },
    {
      "name": "user_id",
      "description": "User identifier",
      "type": "keyword",
      "searchable": true,
      "aggregatable": true,
      "readFromDocValues": true
    },
    {
      "name": "device.type",
      "description": "Device type",
      "type": "keyword",
      "searchable": true,
      "aggregatable": true,
      "readFromDocValues": true,
      "facetConfig": {
        "enabled": true,
        "values": ["desktop", "mobile", "tablet"],
        "type": "AUTO",
        "updatedAt": "2025-06-10T07:00:00.000Z"
      }
    }
  ],
  "dataSourceRef": {
    "id": "aws-s3",
    "type": "data-source",
    "name": "s3://analytics-bucket"
  },
  "dataSourceParamsRef": "s3-analytics-params"
}
```

## Usage Notes

1. **Field Persistence**: Fields are persisted if they are stored in the saved object. There is no explicit persistence flag.

2. **Runtime Fields**: The `runtimeFieldMap` provides a flexible way to create virtual fields or map between different field naming conventions (like OTEL). These fields are computed at query time and not stored in the index.

3. **Faceted Navigation**: Field-level `facetConfig` enables faceted navigation by defining which fields can be used as facets and their possible values. This is particularly useful for filtering and exploration interfaces.

4. **Data Source Parameters**: Data source specific parameters can be specified in two places:
   - `typeMeta.params`: For backward compatibility with existing code.
   - `dataSourceParamsRef`: For parameter reuse across datasets.

5. **Virtual Datasets**: Virtual datasets provide immediate access to data sources without requiring explicit dataset creation. They are automatically generated when a data source is added to a workspace and can be converted to persistent datasets when saved.

## FAQ

- **How does this affect existing saved searches?**
  - Existing saved searches continue functioning through the compatibility layer. When a saved search references an index pattern, the system automatically finds or creates the equivalent dataset.

- **Will third-party plugins require updates?**
  - Most plugins using the data plugin APIs continue functioning without changes. Plugins directly accessing `IndexPattern` objects may need updates. The compatibility layer supports transition during the migration period.

- **Should the `DatasetsService` replace the existing `DatasetService`?**
  - Yes, gradually. The `DatasetsService` becomes the primary interface for data source management, with the existing `DatasetService` acting as compatibility layer during transition.

- **What happens if fields aren't stored with datasets?**
  - Not storing fields by default reduces storage requirements and allows datasets to stay current with schema changes. The caching mechanism mitigates potential latency while giving users the option to store fields permanently if needed.

- **Why separate title from query in datasets?**
  - The separation allows for more human-readable titles while maintaining the technical query value separately. This is especially important for complex data sources.

- **Will each workspace have default datasets?**
  - Yes, each workspace has a default dataset created automatically. For **EACH** data source, a `dataset-all` can be created to allow immediate data access without requiring dataset creation permissions.

- **Can a dataset span multiple data-sources?**
  - Not today. One dataset → one physical store keeps RBAC and querying simple.

- **What is the difference between dataset `type` vs data-source `type`**:
  - The dataset `type` classifies the logical dataset or signal representation (metrics, logs, etc.) while data-source `type` identifies the underlying technology (OpenSearch, S3, MySQL). This dual-typing enables registerable type definitions through the appropriate extension points, allowing for future expansion of supported dataset categories beyond the initial implementation.
