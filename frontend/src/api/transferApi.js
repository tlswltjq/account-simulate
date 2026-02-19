import client from './client';

/**
 * 일반 계좌 충전
 * @param {string} accountAddress
 * @param {number} amount
 */
export const chargeAccount = async (accountAddress, amount) => {
    const response = await client.post('/transfer/charge', { accountAddress, amount });
    return response.data;
};

/**
 * 적금 계좌 입금
 * @param {string} savingAccountAddress
 * @param {number} amount
 */
export const depositToSaving = async (savingAccountAddress, amount) => {
    const response = await client.post('/transfer/saving-deposit', { savingAccountAddress, amount });
    return response.data;
};

/**
 * 계좌 간 이체
 * @param {string} senderAccountAddress
 * @param {string} receiverAccountAddress
 * @param {number} amount
 */
export const transferBetweenAccounts = async (senderAccountAddress, receiverAccountAddress, amount) => {
    const response = await client.post('/transfer/between-accounts', {
        senderAccountAddress,
        receiverAccountAddress,
        amount,
    });
    return response.data;
};
