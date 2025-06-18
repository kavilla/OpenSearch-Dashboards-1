# Dataset Interface

This document provides a comprehensive overview of the Dataset interface in OpenSearch Dashboards, which serves as a unified abstraction for diverse data sources.

## Interface Definition

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

## Field Descriptions

### Core Fields

- `id`: Unique identifier for the dataset, used for referencing the dataset in code and URLs.
- `title`: The pattern string for matching data structures (e.g., index pattern, S3 path). Also used as display name if displayName is not defined.
- `displayName`: Human-readable name for the dataset, used in UI components and user-facing elements.
- `description`: Detailed description of the dataset, providing context and information about its contents and purpose.
- `timeFieldName`: Name of the field containing timestamps, used for time-based operations and visualizations.
- `intervalName`: Time interval for time-based index patterns, helps with date histogram aggregations.

### Type and Status

- `type`: Signal type categorization (LOGS, METRICS, TRACES, DOCUMENTS, etc.), used for filtering and specialized UI components.
- `version`: Saved object version for tracking changes and migrations.
- `fieldsLoading`: Indicates whether fields are currently being loaded, used for UI loading states.

### Field Definitions

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

### Filtering and Formatting

- `sourceFilters`: Filters applied to the _source field, used to exclude fields from the source document.
- `fieldFormatMap`: Mapping of field names to format configurations, controls how field values are displayed in the UI.
  - `id`: Format identifier (e.g., "number", "date", "bytes").
  - `params`: Format-specific parameters.

### Field Transformations

- `runtimeFieldMap`: Mapping of target field names to field transformations, used to create virtual fields or map between formats.
  - `type`: Field data type for the runtime field.
  - `sourceField`: Original field to derive the runtime field from.
  - `script`: Script to generate the field value.

Example for OTEL mapping:

```json
"runtimeFieldMap": {
  "otel.trace.id": {
    "type": "keyword",
    "sourceField": "traceId"
  },
  "otel.span.id": {
    "type": "keyword",
    "sourceField": "spanId"
  },
  "otel.http.method": {
    "type": "keyword",
    "sourceField": "attributes.http.method"
  }
}
```

### Metadata and Configuration

- `typeMeta`: Container for various metadata and configuration settings.
  - `aggs`: Aggregation configurations for specific fields.
  - `params`: API-specific parameters used by the data source.

### Data Source Reference

- `dataSourceRef`: Reference to the data source that provides the data.
  - `id`: Unique identifier for the data source.
  - `type`: Always 'data-source' for consistency.
  - `name`: URI-style identifier that combines type and path information (e.g., 'opensearch://default', 's3://bucket').
- `dataSourceParamsRef`: Reference to a saved set of data source parameters, enables parameter reuse across datasets.

## Field Persistence

Field persistence is determined implicitly by whether a field is stored in the saved object. Fields that are not stored in the dataset (within the saved object) are not persisted. This approach simplifies the schema and avoids the need for explicit persistence flags.

## Virtual Datasets

Virtual datasets are automatically generated temporary datasets when a data source is added to a workspace. They provide immediate query capabilities without requiring explicit dataset creation.

Key characteristics:

- Generate on-demand WITHOUT creating a saved object
- Provide immediate query capabilities WITHOUT admins and extra setup
- Follow a consistent structure across different data source types
- Can be converted to persistent datasets when explicitly saved

Virtual datasets are identified by:

- ID format: `dataSourceId::dataSourceType::signaltype`
- Display name format: `dataSourceTitle signaltype`
- Meta property: `meta.source: "virtual"`

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

## Dataset Examples

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
    },
    {
      "name": "http.request.method",
      "description": "HTTP request method",
      "type": "keyword",
      "esTypes": ["keyword"],
      "searchable": true,
      "aggregatable": true,
      "readFromDocValues": true,
      "facetConfig": {
        "enabled": true,
        "values": ["GET", "POST", "PUT", "DELETE", "PATCH", "OPTIONS", "HEAD"],
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
  "fieldFormatMap": {
    "metrics.time_on_page_seconds": {
      "id": "duration",
      "params": {
        "inputFormat": "seconds",
        "outputFormat": "humanize"
      }
    }
  },
  "runtimeFieldMap": {
    "otel.enduser.id": {
      "type": "keyword",
      "sourceField": "user_id"
    },
    "otel.url.full": {
      "type": "keyword",
      "sourceField": "page.url"
    }
  },
  "typeMeta": {
    "params": {
      "bucket": "analytics-bucket",
      "path": "web-events/",
      "format": "json",
      "compression": "none",
      "partitionBy": "date",
      "maxFilesPerQuery": 1000
    }
  },
  "dataSourceRef": {
    "id": "aws-s3",
    "type": "data-source",
    "name": "s3://analytics-bucket"
  },
  "dataSourceParamsRef": "s3-analytics-params"
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

## Usage Notes

1. **Field Persistence**: Fields are persisted if they are stored in the saved object. There is no explicit persistence flag.

2. **Runtime Fields**: The `runtimeFieldMap` provides a flexible way to create virtual fields or map between different field naming conventions (like OTEL). These fields are computed at query time and not stored in the index.

3. **Faceted Navigation**: Field-level `facetConfig` enables faceted navigation by defining which fields can be used as facets and their possible values. This is particularly useful for filtering and exploration interfaces.

4. **Data Source Parameters**: Data source specific parameters can be specified in two places:
   - `typeMeta.params`: For backward compatibility with existing code.
   - `dataSourceParamsRef`: For parameter reuse across datasets.

5. **Virtual Datasets**: Virtual datasets provide immediate access to data sources without requiring explicit dataset creation. They are automatically generated when a data source is added to a workspace and can be converted to persistent datasets when saved.
