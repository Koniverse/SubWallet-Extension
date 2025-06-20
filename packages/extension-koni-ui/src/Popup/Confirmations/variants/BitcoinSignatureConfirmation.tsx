// Copyright 2019-2022 @subwallet/extension-koni-ui authors & contributors
// SPDX-License-Identifier: Apache-2.0

// import { BitcoinSignatureRequest, ConfirmationsQueueItem } from '@subwallet/extension-base/background/KoniTypes';
// import { ConfirmationGeneralInfo, MetaInfo, ViewDetailIcon } from '@subwallet/extension-koni-ui/components';
// import { useOpenDetailModal } from '@subwallet/extension-koni-ui/hooks';
// import { BitcoinSignArea } from '@subwallet/extension-koni-ui/Popup/Confirmations/parts';
// import { BitcoinSignatureSupportType, ThemeProps } from '@subwallet/extension-koni-ui/types';
// import { Button } from '@subwallet/react-ui';
// import CN from 'classnames';
// import React from 'react';
// import { useTranslation } from 'react-i18next';
// import styled from 'styled-components';
//
// import { BaseDetailModal } from '../parts';
//
// interface Props extends ThemeProps {
//   type: BitcoinSignatureSupportType
//   request: ConfirmationsQueueItem<BitcoinSignatureRequest>
// }
//
// function Component ({ className, request, type }: Props) {
//   const { id, payload } = request;
//   const { t } = useTranslation();
//   // TODO: Temporarily comment out the AccountItemWithName component and recheck later.
//   const { account } = payload;
//
//   const onClickDetail = useOpenDetailModal();
//
//   return (
//     <>
//       <div className={CN('confirmation-content', className)}>
//         <ConfirmationGeneralInfo request={request} />
//         <div className='title'>
//           {t('Signature required')}
//         </div>
//         <div className='description'>
//           {t('You are approving a request with the following account')}
//         </div>
//         {/* <AccountItemWithName */}
//         {/*  accountName={account.name} */}
//         {/*  address={account.address} */}
//         {/*  avatarSize={24} */}
//         {/*  className='account-item' */}
//         {/*  isSelected={true} */}
//         {/*  proxyId={account.proxyId} */}
//         {/* /> */}
//         <div>
//           <Button
//             icon={<ViewDetailIcon />}
//             onClick={onClickDetail}
//             size='xs'
//             type='ghost'
//           >
//             {t('View details')}
//           </Button>
//         </div>
//       </div>
//       <BitcoinSignArea
//         id={id}
//         payload={request}
//         type={type}
//       />
//       <BaseDetailModal
//         title={t('Message details')}
//       >
//         <MetaInfo.Data>
//           {request.payload.payload as string}
//         </MetaInfo.Data>
//       </BaseDetailModal>
//     </>
//   );
// }
//
// const BitcoinSignatureConfirmation = styled(Component)<Props>(({ theme: { token } }: ThemeProps) => ({
//   '.account-list': {
//     '.__prop-label': {
//       marginRight: token.marginMD,
//       width: '50%',
//       float: 'left'
//     }
//   },
//
//   '.__label': {
//     textAlign: 'left'
//   }
// }));
//
// export default BitcoinSignatureConfirmation;
