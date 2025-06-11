// Copyright 2019-2022 @polkadot/extension-ui authors & contributors
// SPDX-License-Identifier: Apache-2.0

import { ThemeProps } from '@subwallet/extension-koni-ui/types';
import { Icon } from '@subwallet/react-ui';
import CN from 'classnames';
import { Timer } from 'phosphor-react';
import React, { useEffect, useState } from 'react';
import styled from 'styled-components';

type Props = ThemeProps & {
  quoteAliveUntilValue: number | undefined;
}

const Component: React.FC<Props> = (props: Props) => {
  const { className, quoteAliveUntilValue } = props;
  const [quoteCountdownTime, setQuoteCountdownTime] = useState<number>(0);

  useEffect(() => {
    let timer: NodeJS.Timer;

    if (quoteAliveUntilValue) {
      const updateQuoteCountdownTime = () => {
        const dateNow = Date.now();

        if (dateNow > quoteAliveUntilValue) {
          setQuoteCountdownTime(0);
          clearInterval(timer);
        } else {
          setQuoteCountdownTime(Math.round((quoteAliveUntilValue - dateNow) / 1000));
        }
      };

      timer = setInterval(updateQuoteCountdownTime, 1000);

      updateQuoteCountdownTime();
    } else {
      setQuoteCountdownTime(0);
    }

    return () => {
      clearInterval(timer);
    };
  }, [quoteAliveUntilValue, setQuoteCountdownTime]);

  return (
    <span className={CN(className, {
      '__quote-reset-change-color': quoteCountdownTime <= 10
    })}
    >
      <Icon
        className={'__reset-time-icon'}
        phosphorIcon={Timer}
        weight={'fill'}
      />

      <span className='__reset-time-text'>
        {quoteCountdownTime}s
      </span>
    </span>
  );
};

const QuoteResetTime = styled(Component)<Props>(({ theme: { token } }: Props) => {
  return {
    color: token.colorWarning,

    '&.__quote-reset-change-color': {
      color: token.colorError
    }
  };
});

export default QuoteResetTime;
