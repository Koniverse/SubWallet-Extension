// Copyright 2019-2022 @subwallet/extension-koni-ui authors & contributors
// SPDX-License-Identifier: Apache-2.0

import { GovVoteType } from '@subwallet/extension-base/services/open-gov/interface';
import { CollapsiblePanel, MetaInfo } from '@subwallet/extension-koni-ui/components';
import GovVotingStatusModal from '@subwallet/extension-koni-ui/components/Modal/Governance/GovVotingStatusModal';
import { useGetNativeTokenBasicInfo, useTranslation } from '@subwallet/extension-koni-ui/hooks';
import { ThemeProps } from '@subwallet/extension-koni-ui/types';
import { GovVoteSide } from '@subwallet/extension-koni-ui/types/gov';
import { ReferendumVoteResult } from '@subwallet/extension-koni-ui/utils/gov/votingStats';
import { Icon, ModalContext, Number } from '@subwallet/react-ui';
import CN from 'classnames';
import { Info } from 'phosphor-react';
import React, { useCallback, useContext, useState } from 'react';
import styled from 'styled-components';

type Props = ThemeProps & {
  votingData: ReferendumVoteResult;
  chain: string;
}

const Component = ({ chain, className, votingData }: Props): React.ReactElement<Props> => {
  const { t } = useTranslation();
  const { decimals, symbol } = useGetNativeTokenBasicInfo(chain);
  const [isOpen, setIsOpen] = useState(false);
  const [currentVoteType, setCurrentVoteType] = useState<GovVoteSide>(GovVoteType.AYE);
  const { activeModal } = useContext(ModalContext);

  const handleOpenModal = useCallback(
    (type: GovVoteSide) => {
      setCurrentVoteType(type);
      activeModal('gov-voting-stats-modal');
    },
    [activeModal]
  );

  const handleOpenAye = useCallback(() => handleOpenModal(GovVoteType.AYE), [handleOpenModal]);
  const handleOpenNay = useCallback(() => handleOpenModal(GovVoteType.NAY), [handleOpenModal]);
  const handleOpenAbstain = useCallback(() => handleOpenModal(GovVoteType.ABSTAIN), [handleOpenModal]);

  const getModalData = useCallback(() => {
    const voteDataMap = {
      [GovVoteType.AYE]: { voteData: votingData.Aye, title: t('Aye votes') },
      [GovVoteType.NAY]: { voteData: votingData.Nay, title: t('Nay votes') },
      [GovVoteType.ABSTAIN]: { voteData: votingData.Abstain, title: t('Abstain votes') }
    };

    return voteDataMap[currentVoteType];
  }, [currentVoteType, votingData, t]);

  const modalData = getModalData();

  return (
    <div className={className}>
      <CollapsiblePanel
        className={CN(className)}
        onToggle={setIsOpen}
        title={isOpen ? t('Hide voting stats') : t('Show voting stats')}
      >
        <MetaInfo>
          <MetaInfo.Default
            label={t('Aye') + ` (${votingData.Aye.totalVotedAccounts})`}
          >
            <div className='voting-stats__value'>
              <Number
                decimal={decimals}
                prefix={'~'}
                suffix={symbol}
                value={votingData.Aye.totalVotedAmount}
              />
              <div onClick={handleOpenAye}>
                <Icon
                  phosphorIcon={Info}
                  size='sm'
                />
              </div>
            </div>
          </MetaInfo.Default>

          <MetaInfo.Default
            label={t('Nay') + ` (${votingData.Nay.totalVotedAccounts})`}
          >
            <div className='voting-stats__value'>
              <Number
                decimal={decimals}
                prefix={'~'}
                suffix={symbol}
                value={votingData.Nay.totalVotedAmount}
              />
              <div onClick={handleOpenNay}>
                <Icon
                  phosphorIcon={Info}
                  size={'sm'}
                />
              </div>
            </div>
          </MetaInfo.Default>

          <MetaInfo.Default
            label={t('Abstain') + ` (${votingData.Abstain.totalVotedAccounts})`}
          >
            <div className='voting-stats__value'>
              <Number
                decimal={decimals}
                prefix={'~'}
                suffix={symbol}
                value={votingData.Abstain.totalVotedAmount}
              />
              <div onClick={handleOpenAbstain}>
                <Icon
                  phosphorIcon={Info}
                  size={'sm'}
                />
              </div>
            </div>
          </MetaInfo.Default>
        </MetaInfo>
      </CollapsiblePanel>

      {currentVoteType && (
        <GovVotingStatusModal
          chain={chain}
          decimal={decimals}
          modalId='gov-voting-stats-modal'
          symbol={symbol}
          title={modalData.title}
          voteData={modalData.voteData}
        />
      )}
    </div>
  );
};

export const VotingStats = styled(Component)<Props>(({ theme: { token } }: Props) => {
  return {
    '.voting-stats__value': {
      display: 'flex',
      alignItems: 'center',
      gap: '4px',
      fontSize: 14,
      color: token.colorText
    },
    '.voting-stats__value svg': {
      opacity: 0.7,
      cursor: 'pointer',
      transition: 'opacity 0.2s'
    },
    '.voting-stats__value svg:hover': {
      opacity: 1
    }
  };
});
