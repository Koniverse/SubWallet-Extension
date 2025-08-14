// Copyright 2019-2022 @subwallet/extension-koni-ui authors & contributors
// SPDX-License-Identifier: Apache-2.0

import { useTranslation } from '@subwallet/extension-koni-ui/hooks';
import { ThemeProps } from '@subwallet/extension-koni-ui/types';
import { Button, Icon } from '@subwallet/react-ui';
import { CaretDoubleDown, CaretDoubleUp } from 'phosphor-react';
import React, { useCallback, useState } from 'react';
import Markdown from 'react-markdown';
import rehypeRaw from 'rehype-raw';
import remarkGfm from 'remark-gfm';
import styled from 'styled-components';

type Props = ThemeProps & {
  content: string;
};

const Component = ({ className, content }: Props): React.ReactElement<Props> => {
  const { t } = useTranslation();
  const [isExpanded, setIsExpanded] = useState(false);

  const _onClick = useCallback(() => {
    setIsExpanded(!isExpanded);
  }, [isExpanded]);

  return (
    <div className={className}>
      <div
        style={{
          overflow: 'hidden',
          maxHeight: isExpanded ? 'none' : '150px',
          transition: 'max-height 0.3s ease',
          position: 'relative'
        }}
      >
        <Markdown
          rehypePlugins={[rehypeRaw]}
          remarkPlugins={[remarkGfm]}
        >
          {content}
        </Markdown>

        {!isExpanded && (
          <div className='gradient-wrapper'>
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

      {isExpanded && (
        <div className='gradient-wrapper'>
          <Button
            icon={(
              <Icon
                phosphorIcon={CaretDoubleUp}
                size={'sm'}

              />
            )}
            onClick={_onClick}
            shape={'circle'}
            size={'xs'}
          >
            {t('Read less')}
          </Button>
        </div>
      )}
    </div>
  );
};

export const DescriptionTab = styled(Component)<Props>(({ theme: { token } }: Props) => {
  return {
    position: 'relative',

    '.gradient-wrapper': {
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

    '.gradient-wrapper .ant-btn': {
      background: 'transparent',
      color: token.colorTextSecondary
    }
  };
});
