// Copyright 2019-2022 @subwallet/extension-koni-ui authors & contributors
// SPDX-License-Identifier: Apache-2.0

import { TokenHasBalanceInfo } from '@subwallet/extension-base/services/fee-service/interfaces';
import { EvmEIP1559FeeOption, FeeCustom, FeeDefaultOption, FeeDetail, FeeOptionKey, TransactionFee } from '@subwallet/extension-base/types';
import { BN_ZERO } from '@subwallet/extension-base/utils';
import { AmountInput, BasicInputEvent, RadioGroup } from '@subwallet/extension-koni-ui/components';
import { FeeOptionItem } from '@subwallet/extension-koni-ui/components/Field/TransactionFee/FeeEditor/FeeOptionItem';
import { ASSET_HUB_CHAIN_SLUGS, CHOOSE_FEE_TOKEN_MODAL } from '@subwallet/extension-koni-ui/constants';
import { FormCallbacks, ThemeProps } from '@subwallet/extension-koni-ui/types';
import { Button, Form, Icon, Input, Logo, ModalContext, Number, SwModal } from '@subwallet/react-ui';
import { Rule } from '@subwallet/react-ui/es/form';
import BigN from 'bignumber.js';
import CN from 'classnames';
import { CaretLeft, PencilSimpleLine } from 'phosphor-react';
import React, { useCallback, useContext, useEffect, useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import styled from 'styled-components';

type Props = ThemeProps & {
  modalId: string;
  feeOptionsInfo?: FeeDetail;
  onSelectOption: (option: TransactionFee) => void;
  symbol: string;
  decimals: number;
  tokenSlug: string;
  priceValue: number;
  feeType?: string;
  listTokensCanPayFee?: TokenHasBalanceInfo[];
  onSetTokenPayFee: (token: string) => void;
  currentTokenPayFee?: string;
  chainValue?: string;
  selectedFeeOption?: TransactionFee
}

enum ViewMode {
  RECOMMENDED = 'recommended',
  CUSTOM = 'custom'
}

interface ViewOption {
  label: string;
  value: ViewMode;
}

interface FormProps {
  customValue: string;
  maxFeeValue?: string;
  priorityFeeValue?: string
}

const OPTIONS: FeeDefaultOption[] = [
  'slow',
  'average',
  'fast'
];

const Component = ({ chainValue, className, currentTokenPayFee, decimals, feeOptionsInfo, feeType, listTokensCanPayFee, modalId, onSelectOption, onSetTokenPayFee, priceValue, selectedFeeOption, symbol, tokenSlug }: Props): React.ReactElement<Props> => {
  const { t } = useTranslation();
  const { activeModal, inactiveModal } = useContext(ModalContext);

  const [currentViewMode, setViewMode] = useState<ViewMode>(selectedFeeOption?.feeOption === 'custom' ? ViewMode.CUSTOM : ViewMode.RECOMMENDED);
  const [form] = Form.useForm<FormProps>();
  const [optionSelected, setOptionSelected] = useState<TransactionFee | undefined>(selectedFeeOption);

  useEffect(() => {
    if (feeType === 'substrate') {
      setViewMode(ViewMode.CUSTOM);
    }
  }, [feeType]);

  const feeDefaultValue = useMemo(() => {
    if (selectedFeeOption && selectedFeeOption.feeOption === 'custom' && selectedFeeOption.feeCustom) {
      return selectedFeeOption.feeCustom as EvmEIP1559FeeOption;
    }

    const defaultOption = feeOptionsInfo?.options?.default;

    if (defaultOption) {
      return feeOptionsInfo?.options?.[defaultOption] as EvmEIP1559FeeOption;
    }

    return undefined;
  }, [feeOptionsInfo?.options, selectedFeeOption]);

  const formDefault = useMemo((): FormProps => {
    return {
      customValue: '',
      maxFeeValue: feeDefaultValue?.maxFeePerGas,
      priorityFeeValue: feeDefaultValue?.maxPriorityFeePerGas
    };
  }, [feeDefaultValue?.maxFeePerGas, feeDefaultValue?.maxPriorityFeePerGas]);

  const viewOptions = useMemo((): ViewOption[] => {
    return [
      {
        label: t('Recommended'),
        value: ViewMode.RECOMMENDED
      },
      {
        label: t('Custom'),
        value: ViewMode.CUSTOM
      }
    ];
  }, [t]);

  const convertedCustomValue = form.getFieldValue('customValue') as string;
  const transformAmount = (!!convertedCustomValue && new BigN(convertedCustomValue).multipliedBy(priceValue)) || 0;

  const onChaneViewMode = useCallback((event: BasicInputEvent) => {
    setViewMode(event.target.value as ViewMode);
  }, []);

  const onCancelModal = useCallback(() => {
    inactiveModal(modalId);
  }, [inactiveModal, modalId]);

  const _onSelectOption = useCallback((option: TransactionFee) => {
    return () => {
      setOptionSelected(option);
    };
  }, []);

  const calculateEstimateFee = useCallback((optionKey: FeeOptionKey) => {
    const optionValue = feeOptionsInfo?.options?.[optionKey] as EvmEIP1559FeeOption;

    if (!optionValue) {
      return null;
    }

    if (feeOptionsInfo && 'gasLimit' in feeOptionsInfo) {
      return new BigN(optionValue.maxFeePerGas).multipliedBy(feeOptionsInfo.gasLimit).toFixed(0) || 0;
    }

    return 0;
  }, [feeOptionsInfo]);

  const renderOption = (option: FeeDefaultOption) => {
    const optionValue = feeOptionsInfo?.options?.[option] as EvmEIP1559FeeOption;
    const feeValue = calculateEstimateFee(option as FeeOptionKey);
    const estimatedWaitTime = optionValue
      ? ((optionValue.maxWaitTimeEstimate || 0) + (optionValue.minWaitTimeEstimate || 0)) / 2
      : 0;

    const isSelected = optionSelected ? optionSelected?.feeOption === option : feeOptionsInfo?.options?.default === option;

    return (
      <FeeOptionItem
        className={'__fee-option-item'}
        feeValueInfo={{
          value: feeValue || 0,
          decimals: decimals,
          symbol: symbol
        }}
        isSelected={isSelected}
        key={option}
        onClick={_onSelectOption({ feeOption: option })}
        time={estimatedWaitTime}
        type={option}
      />
    );
  };

  const _onSubmitCustomOption = useCallback(() => {
    let customValue;

    if (feeType === 'evm') {
      const maxFeeValue = form.getFieldValue('maxFeeValue') as string;
      const priorityFeeValue = form.getFieldValue('priorityFeeValue') as string;

      customValue = { maxFeePerGas: maxFeeValue, maxPriorityFeePerGas: priorityFeeValue } as FeeCustom;
    } else {
      customValue = form.getFieldValue('customValue') as FeeCustom;
    }

    onSelectOption({ feeCustom: customValue, feeOption: 'custom' });
    inactiveModal(modalId);
  }, [feeType, form, inactiveModal, modalId, onSelectOption]);

  const customValueValidator = useCallback((rule: Rule, value: string): Promise<void> => {
    if (!value) {
      return Promise.resolve();
    }

    if ((new BigN(value)).lte(BN_ZERO)) {
      return Promise.reject(t('The custom value must be greater than 0'));
    }

    return Promise.resolve();
  }, [t]);

  const customPriorityValidator = useCallback((rule: Rule, value: string): Promise<void> => {
    if (!value) {
      return Promise.resolve();
    }

    if ((new BigN(value)).lte(BN_ZERO)) {
      return Promise.reject(t('The priority fee must be greater than 0'));
    }

    return Promise.resolve();
  }, [t]);

  const customMaxFeeValidator = useCallback((rule: Rule, value: string): Promise<void> => {
    if (!value) {
      return Promise.reject(t('Amount is required'));
    }

    if (feeOptionsInfo && 'baseGasFee' in feeOptionsInfo) {
      const baseGasFee = feeOptionsInfo.baseGasFee;
      const maxFeeValue = form.getFieldValue('maxFeeValue') as string;

      if (baseGasFee && maxFeeValue && new BigN(value).lte(new BigN(baseGasFee).multipliedBy(1.5))) {
        return Promise.reject(t('Max fee/Priority fee must be higher than min GWEI'));
      }

      if ((new BigN(value)).lte(BN_ZERO)) {
        return Promise.reject(t('The maximum fee must be greater than 0'));
      }
    }

    return Promise.resolve();
  }, [feeOptionsInfo, form, t]);

  const onValuesChange: FormCallbacks<FormProps>['onValuesChange'] = useCallback(
    (part: Partial<FormProps>, values: FormProps) => {
      if (part.customValue) {
        form.setFieldsValue({
          customValue: part.customValue
        });
      }
    },
    [form]
  );

  const onClickEdit = useCallback(() => {
    setTimeout(() => {
      activeModal(CHOOSE_FEE_TOKEN_MODAL);
    }, 100);
  }, [activeModal]);

  const onClickSubmit = useCallback(() => {
    if (currentViewMode === ViewMode.RECOMMENDED) {
      if (optionSelected) {
        onSelectOption(optionSelected);
      }

      inactiveModal(modalId);
    } else {
      form.submit();
    }
  }, [currentViewMode, form, inactiveModal, modalId, onSelectOption, optionSelected]);

  const renderCustomValueField = () => (
    <div className='__custom-value-field-wrapper'>
      <Number
        className='__converted-custom-value'
        decimal={decimals}
        prefix='~ $'
        value={transformAmount}
      />
      <Form.Item
        className='__custom-value-field'
        name='customValue'
        rules={[
          {
            validator: customValueValidator
          }
        ]}
        statusHelpAsTooltip={true}
      >
        <AmountInput
          decimals={decimals}
          disabled={decimals === 0}
          maxValue='1'
          showMaxButton={false}
          tooltip={t('Amount')}
        />
      </Form.Item>
    </div>
  );

  const renderEvmFeeFields = () => (
    <div className='__custom-value-field-wrapper'>
      <Form.Item
        className='__base-fee-value-field'
        name='maxFeeValue'
        rules={[
          {
            validator: customMaxFeeValidator
          }
        ]}
        statusHelpAsTooltip={true}
      >
        <Input
          defaultValue={feeDefaultValue?.maxFeePerGas}
          label='Max fee (GWEI)'
          placeholder='Enter amount'
          type='number'
        />
      </Form.Item>
      <Form.Item
        className='__priority-fee-value-field'
        name='priorityFeeValue'
        rules={[
          {
            validator: customPriorityValidator
          }
        ]}
        statusHelpAsTooltip={true}
      >
        <Input
          defaultValue={feeDefaultValue?.maxPriorityFeePerGas}
          label='Priority fee (GWEI)'
          placeholder='Enter amount'
          type='number'
        />
      </Form.Item>
    </div>
  );

  return (
    <>
      <SwModal
        className={CN(className, 'fee-editor-modal')}
        footer={(
          <Button
            block={true}
            className={'__approve-button'}
            onClick={onClickSubmit}
          >
            {t('Apply fee')}
          </Button>
        )}
        id={modalId}
        onCancel={onCancelModal}
        rightIconProps={{
          icon: (
            <Icon
              className={CN('__back-button')}
              phosphorIcon={CaretLeft}
            />
          ),
          onClick: onCancelModal
        }}
        title={t('Edit fee')}
      >
        {feeType === 'evm' && (
          <div className={'__switcher-box'}>
            <RadioGroup
              onChange={onChaneViewMode}
              optionType='button'
              options={viewOptions}
              value={currentViewMode}
            />
          </div>
        )}

        <div className={'__fee-token-selector-area'}>
          <div className={'__fee-token-selector-label'}>{t('Fee paid in')}</div>
          <div
            className={'__fee-paid-token'}
          >
            <Logo
              className='token-logo'
              isShowSubLogo={false}
              shape='circle'
              size={24}
              token={tokenSlug.toLowerCase()}
            />
            <div className={'__fee-paid-token-symbol'}>{symbol}</div>
            {feeType !== 'evm'
              ? (
                <div
                  className={'__edit-token'}
                  onClick={onClickEdit}
                >
                  <Icon
                    className={'__edit-icon'}
                    customSize={'20px'}
                    phosphorIcon={PencilSimpleLine}
                  />
                </div>)
              : undefined}
          </div>
        </div>

        {
          currentViewMode === ViewMode.RECOMMENDED && (
            <div className={'__fee-options-panel'}>
              {OPTIONS.map(renderOption)}
            </div>
          )
        }

        {
          currentViewMode === ViewMode.CUSTOM && (
            <div className={'__custom-fee-panel'}>
              <Form
                form={form}
                initialValues={formDefault}
                onFinish={_onSubmitCustomOption}
                onValuesChange={onValuesChange}
              >
                {feeType === 'evm'
                  ? (
                    renderEvmFeeFields()
                  )
                  : chainValue && ASSET_HUB_CHAIN_SLUGS.includes(chainValue)
                    ? null
                    : (
                      renderCustomValueField()
                    )}

              </Form>
            </div>
          )
        }
      </SwModal>
    </>
  );
};

export const FeeEditorModal = styled(Component)<Props>(({ theme: { token } }: Props) => {
  return ({
    '.ant-sw-modal-body': {
      paddingBottom: 0
    },

    '&.fee-editor-modal': {
      '.ant-sw-sub-header-container.ant-sw-sub-header-container': {
        display: 'flex',
        flexDirection: 'row-reverse'
      },
      '.ant-sw-header-left-part': {
        paddingRight: token.paddingXS
      },
      '.ant-sw-header-right-part': {
        paddingLeft: token.paddingXS
      }
    },

    '.ant-sw-modal-footer': {
      borderTop: 0
    },

    '.__base-fee-value-field.__base-fee-value-field': {
      marginBottom: 8
    },

    '.__switcher-box': {
      marginBottom: token.margin
    },

    '.__fee-token-selector-area': {
      padding: token.paddingSM,
      backgroundColor: token.colorBgSecondary,
      borderRadius: token.borderRadiusLG,
      marginBottom: token.marginXS,
      display: 'flex',
      flexDirection: 'row',
      justifyContent: 'space-between'
    },

    '.__fee-paid-token': {
      display: 'flex',
      alignItems: 'center'
    },

    '.__fee-paid-token-symbol': {
      paddingLeft: 8,
      color: token.colorWhite
    },

    '.__edit-token': {
      paddingLeft: 4,
      cursor: 'pointer'
    },

    '.__fee-token-selector-label': {
      fontSize: token.fontSize,
      lineHeight: token.lineHeight,
      color: token.colorTextLight4
    },

    '.__fee-option-item + .__fee-option-item': {
      marginTop: token.marginXS
    },

    // custom fee panel

    '.__custom-value-field-wrapper': {
      position: 'relative'
    },

    '.__converted-custom-value': {
      position: 'absolute',
      zIndex: 1,
      right: token.sizeSM,
      top: token.sizeXS,
      fontSize: token.fontSize,
      lineHeight: token.lineHeight,
      color: token.colorTextLight4,

      '.ant-typography': {
        color: 'inherit !important',
        fontSize: 'inherit !important',
        fontWeight: 'inherit !important',
        lineHeight: 'inherit'
      }
    },

    '.__custom-value-field .ant-input-label': {
      top: 5,
      paddingBottom: 2
    },

    '.ant-form-item-has-error': {
      marginBottom: 11
    },

    '.ant-form-item': {
      marginBottom: 0
    },

    '.-status-error .ant-input-suffix': {
      display: 'none'
    }
  });
});
