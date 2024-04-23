/*
 * Copyright OpenSearch Contributors
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { EuiText, EuiSelect } from '@elastic/eui';
import { FieldDetails } from './types';
import { IndexPatternField, IndexPattern, OSD_FIELD_TYPES } from '../../../../../data/public';

interface DiscoverFieldEditProps {
  columns: string[];
  details: FieldDetails;
  field: IndexPatternField;
  indexPattern: IndexPattern;
  /**
   * Callback function when editing a field
   * @param fieldName
   * @param fieldType
   */
  onEditField: (fieldName: string, fieldType: OSD_FIELD_TYPES) => void;
}

export function DiscoverFieldEdit({
  columns,
  details,
  field,
  indexPattern,
  onEditField,
}: DiscoverFieldEditProps) {
  const options = Object.keys(OSD_FIELD_TYPES).map((fieldType) => ({
    value: fieldType.toLowerCase(),
    text: fieldType,
  }));
  const fieldTypeValue = field.type.toLowerCase();
  const [value, setValue] = useState(
    options.some((option) => option.value === fieldTypeValue)
      ? fieldTypeValue
      : OSD_FIELD_TYPES.UNKNOWN
  );

  return (
    <>
      <div className="dscFieldDetails" data-test-subj={`fieldVisualizeContainer`}>
        {details.error && (
          <EuiText size="xs" data-test-subj={`fieldVisualizeError`}>
            {details.error}
          </EuiText>
        )}

        {!details.error && (
          <div style={{ marginTop: '4px' }} data-test-subj={`fieldVisualizeEditContainer`}>
            <EuiSelect
              key={`field${field.name}`}
              options={options}
              value={value}
              onChange={(e) => {
                setValue(e.target.value);
                onEditField(field.name, e.target.value as OSD_FIELD_TYPES);
              }}
            />
          </div>
        )}
      </div>
    </>
  );
}
