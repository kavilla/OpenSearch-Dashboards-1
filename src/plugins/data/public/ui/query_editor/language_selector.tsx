/*
 * Copyright OpenSearch Contributors
 * SPDX-License-Identifier: Apache-2.0
 */

import {
  PopoverAnchorPosition,
  EuiContextMenuPanel,
  EuiPopover,
  EuiButtonEmpty,
  EuiContextMenuItem,
} from '@elastic/eui';
import { i18n } from '@osd/i18n';
import React, { useState } from 'react';
import { getQueryService, getUiService } from '../../services';
import { LanguageConfig } from '../../query';

export interface QueryLanguageSelectorProps {
  language: string;
  onSelectLanguage: (newLanguage: string) => void;
  anchorPosition?: PopoverAnchorPosition;
  appName?: string;
}

const mapExternalLanguageToOptions = (language: LanguageConfig) => {
  return {
    label: language.id,
    value: language.title,
  };
};

export const QueryLanguageSelector = (props: QueryLanguageSelectorProps) => {
  const [isPopoverOpen, setPopover] = useState(false);

  const onButtonClick = () => {
    setPopover(!isPopoverOpen);
  };

  const dqlLabel = i18n.translate('data.query.queryEditor.dqlLanguageName', {
    defaultMessage: 'DQL',
  });
  const luceneLabel = i18n.translate('data.query.queryEditor.luceneLanguageName', {
    defaultMessage: 'Lucene',
  });

  const languageOptions = [
    {
      label: dqlLabel,
      value: 'kuery',
    },
    {
      label: luceneLabel,
      value: 'lucene',
    },
  ];

  const uiService = getUiService();
  const queryService = getQueryService();

  const languages = queryService.queryString.getLanguages();
  languages.forEach((languageId) => {
    const language = queryService.queryString.getLanguage(languageId);
    if (
      (language && props.appName && !language.supportedAppNames.includes(props.appName)) ||
      uiService.Settings.getUserQueryLanguageBlocklist().includes(language?.id)
    )
      return;
    languageOptions.unshift(mapExternalLanguageToOptions(language!));
  });

  const selectedLanguage = {
    label:
      (languageOptions.find(
        (option) => (option.value as string).toLowerCase() === props.language.toLowerCase()
      )?.label as string) ?? languageOptions[0].label,
  };

  const handleLanguageChange = (newLanguage: string) => {
    props.onSelectLanguage(newLanguage);
    uiService.Settings.setUserQueryLanguage(newLanguage);
  };

  uiService.Settings.setUserQueryLanguage(props.language);

  const languageOptionsMenu = languageOptions
    .sort((a, b) => {
      return a.label.localeCompare(b.label);
    })
    .map((language) => {
      return (
        <EuiContextMenuItem
          key={language.label}
          className="languageSelector__menuItem"
          icon={language.label === selectedLanguage.label ? 'check' : 'empty'}
          onClick={() => {
            setPopover(false);
            handleLanguageChange(language.value);
          }}
        >
          {language.label}
        </EuiContextMenuItem>
      );
    });
  return (
    <EuiPopover
      className="languageSelector"
      button={
        <EuiButtonEmpty
          iconSide="right"
          iconSize="s"
          onClick={onButtonClick}
          className="languageSelector__button"
          iconType={'arrowDown'}
        >
          {selectedLanguage.label}
        </EuiButtonEmpty>
      }
      isOpen={isPopoverOpen}
      closePopover={() => setPopover(false)}
      panelPaddingSize="none"
      anchorPosition={props.anchorPosition ?? 'downLeft'}
    >
      <EuiContextMenuPanel
        initialFocusedItemIndex={languageOptions.findIndex(
          (option) => option.label === selectedLanguage.label
        )}
        size="s"
        items={languageOptionsMenu}
      />
    </EuiPopover>
  );
};

// Needed for React.lazy
// eslint-disable-next-line import/no-default-export
export default QueryLanguageSelector;
