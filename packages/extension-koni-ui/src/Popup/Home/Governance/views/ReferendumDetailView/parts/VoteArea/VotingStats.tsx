// Copyright 2019-2022 @subwallet/extension-koni-ui authors & contributors
// SPDX-License-Identifier: Apache-2.0

import { GovVoteType } from '@subwallet/extension-base/services/open-gov/interface';
import { CollapsiblePanel, MetaInfo, VoteTypeLabel } from '@subwallet/extension-koni-ui/components';
import GovVotingStatusModal from '@subwallet/extension-koni-ui/components/Modal/Governance/GovVotingStatusModal';
import { useGetNativeTokenBasicInfo, useTranslation } from '@subwallet/extension-koni-ui/hooks';
import { ThemeProps } from '@subwallet/extension-koni-ui/types';
import { GovVoteSide } from '@subwallet/extension-koni-ui/types/gov';
import { ReferendumVoteResult } from '@subwallet/extension-koni-ui/utils/gov/votingStats';
import { Icon, ModalContext, Number } from '@subwallet/react-ui';
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
      [GovVoteType.AYE]: { voteData: votingData[GovVoteType.AYE], title: t('Aye votes') },
      [GovVoteType.NAY]: { voteData: votingData[GovVoteType.NAY], title: t('Nay votes') },
      [GovVoteType.ABSTAIN]: { voteData: votingData[GovVoteType.ABSTAIN], title: t('Abstain votes') }
    };

    return voteDataMap[currentVoteType];
  }, [currentVoteType, votingData, t]);

  const modalData = getModalData();

  return (
    <div className={className}>
      <CollapsiblePanel
        className={'voting-stats-collapse'}
        onToggle={setIsOpen}
        title={isOpen ? t('Hide voting stats') : t('Show voting stats')}
      >
        <MetaInfo>
          <MetaInfo.Default
            label={
              <>
                <VoteTypeLabel
                  className={'voting-stats__label'}
                  type={GovVoteType.AYE}
                />
                <div className='voting-stats__number'>
                  {votingData[GovVoteType.AYE].totalVotedAccounts}
                </div>
              </>
            }
          >
            <div className='voting-stats__value'>
              <Number
                decimal={decimals}
                decimalOpacity={0.45}
                prefix={'~'}
                suffix={symbol}
                value={votingData[GovVoteType.AYE].totalVotedAmount}
              />
              <div onClick={handleOpenAye}>
                <Icon
                  customSize={'16px'}
                  phosphorIcon={Info}
                />
              </div>
            </div>
          </MetaInfo.Default>

          <MetaInfo.Default
            label={
              <>
                <VoteTypeLabel
                  className={'voting-stats__label'}
                  type={GovVoteType.NAY}
                />
                <div className='voting-stats__number'>
                  {votingData[GovVoteType.NAY].totalVotedAccounts}
                </div>
              </>
            }
          >
            <div className='voting-stats__value'>
              <Number
                decimal={decimals}
                decimalOpacity={0.45}
                prefix={'~'}
                suffix={symbol}
                value={votingData[GovVoteType.NAY].totalVotedAmount}
              />
              <div onClick={handleOpenNay}>
                <Icon
                  customSize={'16px'}
                  phosphorIcon={Info}
                />
              </div>
            </div>
          </MetaInfo.Default>

          <MetaInfo.Default
            label={
              <>
                <VoteTypeLabel
                  className={'voting-stats__label'}
                  type={GovVoteType.ABSTAIN}
                />
                <div className='voting-stats__number'>
                  {votingData[GovVoteType.ABSTAIN].totalVotedAccounts}
                </div>
              </>
            }
          >
            <div className='voting-stats__value'>
              <Number
                decimal={decimals}
                decimalOpacity={0.45}
                prefix={'~'}
                suffix={symbol}
                value={votingData[GovVoteType.ABSTAIN].totalVotedAmount}
              />
              <div onClick={handleOpenAbstain}>
                <Icon
                  customSize={'16px'}
                  phosphorIcon={Info}
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
    borderTop: '2px solid ' + token.colorBgBorder,
    marginTop: token.marginSM,

    '.voting-stats-collapse': {
      backgroundColor: 'transparent',

      '.__panel-header': {
        padding: 0
      },

      '.__panel-title': {
        fontSize: token.fontSizeSM,
        lineHeight: token.lineHeightSM,
        fontWeight: token.bodyFontWeight
      },

      '.__panel-body': {
        paddingLeft: token.paddingXS,
        paddingRight: token.paddingXS
      },

      '.__panel-icon': {
        width: 30,
        minWidth: 'unset'
      }
    },

    '.__label': {
      display: 'flex',
      alignItems: 'center'
    },

    '.voting-stats__label': {
      marginRight: token.marginXXS / 2,

      '.__type-label::after': {
        content: '":"'
      }
    },

    '.voting-stats__number': {
      fontWeight: token.bodyFontWeight,
      color: token.colorTextLight4
    },

    '.voting-stats__value': {
      display: 'flex',
      alignItems: 'center',
      gap: '4px',
      fontSize: 14,
      color: token.colorText,

      '.ant-number': {
        whiteSpace: 'nowrap'
      }
    },
    '.voting-stats__value svg': {
      opacity: 0.529,
      cursor: 'pointer',
      transition: 'opacity 0.2s'
    },
    '.voting-stats__value svg:hover': {
      opacity: 1
    }
  };
});
