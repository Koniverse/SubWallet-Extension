// Copyright 2019-2022 @subwallet/extension-koni-ui authors & contributors
// SPDX-License-Identifier: Apache-2.0

import { _ChainAsset } from '@subwallet/chain-list/types';
import { _getAssetDecimals } from '@subwallet/extension-base/services/chain-service/utils';
import { _DelegateInfo } from '@subwallet/extension-base/services/open-gov/type';
import DefaultLogosMap from '@subwallet/extension-koni-ui/assets/logo';
import { AmountInput, MetaInfo } from '@subwallet/extension-koni-ui/components';
import { handleDelegate } from '@subwallet/extension-koni-ui/messaging';
import { TransactionContent } from '@subwallet/extension-koni-ui/Popup/Transaction/parts';
import { ThemeProps } from '@subwallet/extension-koni-ui/types';
import { Button, Form, Icon, Image, ModalContext, SwModal } from '@subwallet/react-ui';
import { CaretLeft, GlobeHemisphereWest, PlusCircle } from 'phosphor-react';
import React, { useCallback, useContext, useState } from 'react';
import { useTranslation } from 'react-i18next';
import styled from 'styled-components';

import { convictionOptions, voteData } from '../predefined';

type Props = ThemeProps & {
  address: string;
  data: _DelegateInfo | null;
  chainAsset: _ChainAsset | null;
};

export const DelegateDetailModalId = 'delegateDetailModalId';

const modalId = DelegateDetailModalId;

const modalCloseButton = (
  <Icon
    customSize={'24px'}
    phosphorIcon={CaretLeft}
    type='phosphor'
    weight={'light'}
  />
);

const trackOptions = [
  { id: 0, name: 'Root' },
  { id: 1, name: 'Whitelisted Caller' },
  { id: 10, name: 'Staking Admin' },
  { id: 11, name: 'Treasurer' },
  { id: 33, name: 'Medium Spender' }
];

function Component ({ address, chainAsset, className = '', data }: Props): React.ReactElement<Props> {
  const { t } = useTranslation();
  const { inactiveModal } = useContext(ModalContext);
  const [form] = Form.useForm();
  const [convictionValue, setConvictionValue] = useState<number>(0);
  const [selectedTrackIds, setSelectedTrackIds] = useState<number[]>([]);
  const valueColorSchema = 'blue';
  const chain = chainAsset?.originChain;

  const onCancel = useCallback(() => {
    inactiveModal(modalId);
  }, [inactiveModal]);

  const onClickGlobalIcon = useCallback(() => {
    inactiveModal(modalId);
  }, [inactiveModal]);

  const onClickTwitterIcon = useCallback(() => {
    inactiveModal(modalId);
  }, [inactiveModal]);

  const onClickVote = useCallback(() => {
    form.validateFields().then(async (values: voteData) => {
      if (!data || !chain || selectedTrackIds.length === 0) {
        return;
      }

      const delegateRequest = {
        chain,
        address: address,
        trackIds: selectedTrackIds,
        delegateAddress: data.address,
        conviction: values.conviction,
        balance: values.value,
        removeOtherTracks: true
      };

      inactiveModal(modalId);
      await handleDelegate(delegateRequest);
    }).catch((error) => {
      console.error('Form validation failed:', error);
    });
  }, [form, data, chain, selectedTrackIds, address, inactiveModal]);

  const handleConvictionChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const value = Number(e.target.value);

      setConvictionValue(value);
      form.setFieldsValue({ conviction: value });
    },
    [form]
  );

  const handleTrackChange = useCallback(
    (trackId: number) => () => {
      setSelectedTrackIds((prev) =>
        prev.includes(trackId)
          ? prev.filter((id) => id !== trackId)
          : [...prev, trackId]
      );
    },
    []
  );

  return (
    <SwModal
      className={`${className}`}
      closeIcon={modalCloseButton}
      id={modalId}
      onCancel={onCancel}
      title={t(data?.manifesto?.shortDescription || 'Delegate details')}
    >
      {data && (
        <>
          <MetaInfo
            className={'__meta-block'}
            spaceSize={'ms'}
            valueColorScheme={'light'}
          >
            <MetaInfo.Default label={t('Name')}>{data.manifesto?.name}</MetaInfo.Default>
            <MetaInfo.Default
              className={'__status-pool'}
              label={t('Status')}
              valueColorSchema={valueColorSchema}
            >
              {data.address}
            </MetaInfo.Default>
          </MetaInfo>

          <TransactionContent>
            <Form
              className={'form-container form-space-sm'}
              form={form}
              onFinish={onClickVote}
            >
              <Form.Item
                name={'value'}
                statusHelpAsTooltip={true}
              >
                <AmountInput
                  decimals={_getAssetDecimals(chainAsset || undefined)}
                  maxValue={'1'}
                  placeholder={t('Enter vote amount')}
                  showMaxButton={true}
                />
              </Form.Item>

              <Form.Item
                name={'conviction'}
                rules={[{ required: true, message: t('Please select a conviction') }]}
                statusHelpAsTooltip={true}
              >
                <div className='conviction-slider-container'>
                  <div className='conviction-label'>
                    {convictionOptions[convictionValue].label}
                  </div>
                  <input
                    className='conviction-slider'
                    max={6}
                    min={0}
                    onChange={handleConvictionChange}
                    step={1}
                    type='range'
                    value={convictionValue}
                  />
                  <div className='conviction-marks'>
                    {convictionOptions.map((option) => (
                      <span
                        className='conviction-mark'
                        key={option.value}
                      >
                        {option.value}
                      </span>
                    ))}
                  </div>
                </div>
              </Form.Item>

              <Form.Item
                name='trackIds'
                rules={[{ required: true, message: t('Please select at least one track') }]}
                statusHelpAsTooltip={true}
              >
                <div className='track-checkbox-container'>
                  {trackOptions.map((track) => (
                    <label
                      className='track-checkbox-label'
                      key={track.id}
                    >
                      <input
                        checked={selectedTrackIds.includes(track.id)}
                        onChange={handleTrackChange(track.id)}
                        type='checkbox'
                        value={track.id}
                      />
                      {track.name}
                    </label>
                  ))}
                </div>
              </Form.Item>
            </Form>
          </TransactionContent>

          <div className='__modal-footer'>
            <div className={'__modal-separator'}></div>
            <div className={'__modal-buttons'}>
              <Button
                className={'__modal-icon-button'}
                icon={
                  <Icon
                    phosphorIcon={GlobeHemisphereWest}
                    size={'sm'}
                    weight={'fill'}
                  />}
                onClick={onClickGlobalIcon}
                size={'xs'}
                type='ghost'
              />
              <Button
                className={'__modal-icon-button'}
                icon={
                  <Image
                    height={18}
                    shape='square'
                    src={DefaultLogosMap.xtwitter_transparent}
                    width={20}
                  />}
                onClick={onClickTwitterIcon}
                size={'xs'}
                type='ghost'
              />
              <Button
                icon={
                  <Icon
                    phosphorIcon={PlusCircle}
                    size={'sm'}
                    weight={'fill'}
                  />}
                onClick={onClickVote}
              >
                {t('Delegate now')}
              </Button>
            </div>
          </div>
        </>
      )}
    </SwModal>
  );
}

export const DelegateDetailModal = styled(Component)<Props>(({ theme: { token } }: Props) => {
  return ({
    '.ant-sw-modal-content': {
      paddingBottom: 0,
      maxHeight: 600,
      borderRadius: 0
    },
    '.__item-tag:last-child': {
      marginRight: 0
    },
    '.ant-sw-modal-header': {
      borderBottom: 0
    },
    '.__modal-icon-button .ant-image': {
      display: 'flex',
      alignItems: 'end'
    },
    '.__total-token-supply .__value': {
      fontWeight: token.fontWeightStrong
    },
    '.__status-pool .__value': {
      fontWeight: token.fontWeightStrong
    },
    '.__modal-background': {
      height: 65,
      backgroundPosition: 'center',
      backgroundSize: 'cover',
      filter: 'blur(7.5px)'
    },

    '.__modal-separator': {
      height: 2,
      marginBottom: token.marginLG,
      backgroundColor: 'rgba(33, 33, 33, 0.80)'
    },

    '.__modal-logo': {
      width: 64,
      height: 64,
      marginLeft: 'auto',
      marginRight: 'auto',
      marginTop: -35,
      marginBottom: token.sizeXL
    },

    '.__modal-buttons': {
      gap: token.size,
      display: 'flex'
    },

    '.__modal-icon-button': {
      borderRadius: '100%',
      border: '2px solid',
      borderColor: token.colorBgBorder
    },

    '.__modal-join-now-button': {
      '.anticon': {
        height: 20,
        width: 20
      }
    },

    '.__meta-block': {
      '.__row': {
        gap: token.size
      },

      '.__label-col': {
        maxWidth: 'fit-content',
        justifyContent: 'flex-start'
      },

      '.__value-col': {
        textAlign: 'right'
      },

      '.__row.-vertical': {
        flexDirection: 'column',
        gap: token.sizeXS,
        '.__value-col': {
          textAlign: 'left'
        }
      }
    },

    '__modal-footer': {
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center'
    },
    '.__markdown-wrapper': {
      overflowX: 'auto',
      maxWidth: '100%',
      whiteSpace: 'pre-wrap',
      wordBreak: 'break-word'
    },
    '.__meta-block .__row.-vertical .__value-col': {
      textAlign: 'left',
      width: '100%'
    },

    '.conviction-slider-container': {
      position: 'relative',
      padding: `${token.paddingSM}px 0`
    },
    '.conviction-label': {
      marginBottom: token.marginXS,
      fontSize: token.fontSizeSM,
      color: token.colorTextLight1,
      textAlign: 'center'
    },
    '.conviction-slider': {
      '-webkit-appearance': 'none',
      width: '100%',
      height: 8,
      background: token.colorBgSecondary,
      borderRadius: token.borderRadiusLG,
      outline: 'none',
      cursor: 'pointer',
      '&::-webkit-slider-thumb': {
        '-webkit-appearance': 'none',
        width: 20,
        height: 20,
        background: token.colorPrimary,
        borderRadius: '50%',
        border: `2px solid ${token.colorBgBase}`,
        cursor: 'pointer',
        transition: 'all 0.2s'
      },
      '&::-moz-range-thumb': {
        width: 20,
        height: 20,
        background: token.colorPrimary,
        borderRadius: '50%',
        border: `2px solid ${token.colorBgBase}`,
        cursor: 'pointer',
        transition: 'all 0.2s'
      },
      '&:hover::-webkit-slider-thumb': {
        transform: 'scale(1.2)'
      },
      '&:hover::-moz-range-thumb': {
        transform: 'scale(1.2)'
      }
    },
    '.conviction-marks': {
      display: 'flex',
      justifyContent: 'space-between',
      marginTop: token.marginXS,
      fontSize: token.fontSizeSM,
      color: token.colorTextLight3
    },
    '.conviction-mark': {
      flex: 1,
      textAlign: 'center'
    }
  });
});
