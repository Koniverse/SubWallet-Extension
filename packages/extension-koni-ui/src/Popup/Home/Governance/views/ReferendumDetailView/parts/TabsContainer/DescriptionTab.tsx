// Copyright 2019-2022 @subwallet/extension-koni-ui authors & contributors
// SPDX-License-Identifier: Apache-2.0

import { useTranslation } from '@subwallet/extension-koni-ui/hooks';
import { ThemeProps } from '@subwallet/extension-koni-ui/types';
import { Button, Icon } from '@subwallet/react-ui';
import CN from 'classnames';
import { CaretDoubleDown } from 'phosphor-react';
import React, { useCallback, useEffect, useRef, useState } from 'react';
import Markdown from 'react-markdown';
import rehypeRaw from 'rehype-raw';
import remarkGfm from 'remark-gfm';
import styled from 'styled-components';

type Props = ThemeProps & {
  content: string;
};

const MAX_HEIGHT = 184;

const Component = ({ className, content }: Props): React.ReactElement<Props> => {
  const { t } = useTranslation();
  const [isExpanded, setIsExpanded] = useState(false);
  const [isOverflowing, setIsOverflowing] = useState(false);
  const contentRef = useRef<HTMLDivElement>(null);

  const _onClick = useCallback(() => {
    setIsExpanded(!isExpanded);
  }, [isExpanded]);

  useEffect(() => {
    if (contentRef.current) {
      const el = contentRef.current;

      if (el.scrollHeight > MAX_HEIGHT) {
        setIsOverflowing(true);
      } else {
        setIsOverflowing(false);
      }
    }
  }, [content]);

  return (
    <div className={className}>
      <div
        className={CN('__description-content', { '-expanded': isExpanded })}
        ref={contentRef}
      >
        <Markdown
          rehypePlugins={[rehypeRaw]}
          remarkPlugins={[remarkGfm]}
        >
          {content}
        </Markdown>
      </div>

      {!isExpanded && isOverflowing && (
        <div className='__description-gradient-wrapper'>
          <Button
            icon={(
              <Icon
                phosphorIcon={CaretDoubleDown}
                size={'sm'}
              />
            )}
            onClick={_onClick}
            shape={'circle'}
            size={'xs'}
          >
            {t('Read more')}
          </Button>
        </div>
      )}
    </div>
  );
};

export const DescriptionTab = styled(Component)<Props>(({ theme: { token } }: Props) => {
  return {
    position: 'relative',

    '.__description-gradient-wrapper': {
      position: 'absolute',
      bottom: 0,
      left: '50%',
      transform: 'translateX(-50%)',
      width: '358px',
      height: '78px',
      display: 'flex',
      justifyContent: 'center',
      alignItems: 'flex-end',
      paddingBottom: '8px',
      background: 'linear-gradient(to bottom, rgba(12, 12, 12, 0), rgba(12, 12, 12, 1))'
    },

    '.__description-gradient-wrapper .ant-btn': {
      background: 'transparent',
      color: token.colorTextSecondary
    },

    '.__description-content': {
      overflow: 'hidden',
      maxHeight: MAX_HEIGHT,
      transition: 'max-height 0.3s ease',
      position: 'relative',

      h1: {
        fontSize: token.fontSizeHeading4,
        lineHeight: token.lineHeightHeading4
      },

      h2: {
        fontSize: token.fontSizeHeading5,
        lineHeight: token.lineHeightHeading5
      },

      h3: {
        fontSize: token.fontSizeHeading6,
        lineHeight: token.lineHeightHeading6
      },

      'p, li': {
        fontSize: token.fontSizeSM,
        lineHeight: token.lineHeightSM,
        color: token.colorTextLight4
      },

      img: {
        maxWidth: '100%'
      },

      '&.-expanded': {
        maxHeight: 'unset'
      }
    }
  };
});
