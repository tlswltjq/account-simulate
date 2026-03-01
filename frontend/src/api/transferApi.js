import client from './client';

/**
 * 계좌 간 이체
 * @param {string} senderAccountAddress
 * @param {string} receiverAccountAddress
 * @param {number} amount
 */
export const transferBetweenAccounts = async (senderAccountAddress, receiverAccountAddress, amount) => {
    const response = await client.post('/transfer/accounts', {
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
    const response = await client.get('/transfer', {
        params: { accountAddress },
    });
    return response.data;
};
