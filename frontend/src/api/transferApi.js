import client from './client';



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
    const response = await client.post('/transfer/to-accounts', {
        senderAccountAddress,
        receiverAccountAddress,
        amount,
    });
    return response.data;
};

/**
 * 이체내역 조회
 * @param {string} accountAddress
 * @returns {Promise<Array<{id, senderAddress, receiverAddress, amount, type, status, createdAt, completedAt, failureReason}>>}
 */
export const getTransferHistory = async (accountAddress) => {
    const response = await client.get('/transfer/history', {
        data: { accountAddress }
    });
    return response.data;
};
