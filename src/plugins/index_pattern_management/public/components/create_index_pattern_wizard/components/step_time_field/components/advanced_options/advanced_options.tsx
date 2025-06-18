/*
 * SPDX-License-Identifier: Apache-2.0
 *
 * The OpenSearch Contributors require contributions made to
 * this file be licensed under the Apache-2.0 license or a
 * compatible open source license.
 *
 * Any modifications Copyright OpenSearch Contributors. See
 * GitHub history for details.
 */

/*
 * Licensed to Elasticsearch B.V. under one or more contributor
 * license agreements. See the NOTICE file distributed with
 * this work for additional information regarding copyright
 * ownership. Elasticsearch B.V. licenses this file to you under
 * the Apache License, Version 2.0 (the "License"); you may
 * not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *    http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing,
 * software distributed under the License is distributed on an
 * "AS IS" BASIS, WITHOUT WARRANTIES OR CONDITIONS OF ANY
 * KIND, either express or implied.  See the License for the
 * specific language governing permissions and limitations
 * under the License.
 */

import React from 'react';

import {
  EuiForm,
  EuiCompressedFormRow,
  EuiCompressedFieldText,
  EuiCompressedTextArea,
  EuiSmallButtonEmpty,
  EuiSpacer,
} from '@elastic/eui';

import { i18n } from '@osd/i18n';
import { FormattedMessage } from '@osd/i18n/react';

interface AdvancedOptionsProps {
  isVisible: boolean;
  indexPatternId: string;
  indexPatternDisplayName: string;
  indexPatternDescription: string;
  toggleAdvancedOptions: (e: React.FormEvent<HTMLButtonElement>) => void;
  onChangeIndexPatternId: (e: React.ChangeEvent<HTMLInputElement>) => void;
  onChangeIndexPatternDisplayName: (e: React.ChangeEvent<HTMLInputElement>) => void;
  onChangeIndexPatternDescription: (e: React.ChangeEvent<HTMLTextAreaElement>) => void;
}

export const AdvancedOptions: React.FC<AdvancedOptionsProps> = ({
  isVisible,
  indexPatternId,
  indexPatternDisplayName,
  indexPatternDescription,
  toggleAdvancedOptions,
  onChangeIndexPatternId,
  onChangeIndexPatternDisplayName,
  onChangeIndexPatternDescription,
}) => (
  <div>
    <EuiSmallButtonEmpty
      iconType={isVisible ? 'arrowDown' : 'arrowRight'}
      onClick={toggleAdvancedOptions}
    >
      {isVisible ? (
        <FormattedMessage
          id="indexPatternManagement.createIndexPattern.stepTime.options.hideButton"
          defaultMessage="Hide advanced settings"
        />
      ) : (
        <FormattedMessage
          id="indexPatternManagement.createIndexPattern.stepTime.options.showButton"
          defaultMessage="Show advanced settings"
        />
      )}
    </EuiSmallButtonEmpty>
    <EuiSpacer size="xs" />
    {isVisible ? (
      <EuiForm>
        <EuiCompressedFormRow
          label={
            <FormattedMessage
              id="indexPatternManagement.createIndexPattern.stepTime.options.patternHeader"
              defaultMessage="Custom index pattern ID"
            />
          }
          helpText={
            <FormattedMessage
              id="indexPatternManagement.createIndexPattern.stepTime.options.patternLabel"
              defaultMessage="OpenSearch Dashboards will provide a unique identifier for each index pattern. If you do not want to use this unique ID,
            enter a custom one."
            />
          }
        >
          <EuiCompressedFieldText
            name="indexPatternId"
            data-test-subj="createIndexPatternIdInput"
            value={indexPatternId}
            onChange={onChangeIndexPatternId}
            placeholder={i18n.translate(
              'indexPatternManagement.createIndexPattern.stepTime.options.patternPlaceholder',
              {
                defaultMessage: 'custom-index-pattern-id',
              }
            )}
          />
        </EuiCompressedFormRow>

        <EuiCompressedFormRow
          label={
            <FormattedMessage
              id="indexPatternManagement.createIndexPattern.stepTime.options.displayNameHeader"
              defaultMessage="Display name"
            />
          }
          helpText={
            <FormattedMessage
              id="indexPatternManagement.createIndexPattern.stepTime.options.displayNameLabel"
              defaultMessage="OpenSearch Dashboards will use the pattern as the display name. If you want to use a display name other than the pattern, you can
            enter a custom one."
            />
          }
        >
          <EuiCompressedFieldText
            name="indexPatternDisplayName"
            data-test-subj="createIndexPatternDisplayNameInput"
            value={indexPatternDisplayName}
            onChange={onChangeIndexPatternDisplayName}
            placeholder={i18n.translate(
              'indexPatternManagement.createIndexPattern.stepTime.options.displayNamePlaceholder',
              {
                defaultMessage: 'Custom display name',
              }
            )}
          />
        </EuiCompressedFormRow>

        <EuiCompressedFormRow
          label={
            <FormattedMessage
              id="indexPatternManagement.createIndexPattern.stepTime.options.descriptionHeader"
              defaultMessage="Description"
            />
          }
        >
          <EuiCompressedTextArea
            name="indexPatternDescription"
            data-test-subj="createIndexPatternDescriptionInput"
            value={indexPatternDescription}
            onChange={onChangeIndexPatternDescription}
            placeholder={i18n.translate(
              'indexPatternManagement.createIndexPattern.stepTime.options.descriptionPlaceholder',
              {
                defaultMessage: 'Description of this index pattern',
              }
            )}
            rows={2}
          />
        </EuiCompressedFormRow>
      </EuiForm>
    ) : null}
  </div>
);
