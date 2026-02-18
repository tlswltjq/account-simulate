import client from './client';

/**
 * 사용자의 계좌 목록 조회
 * @param {string} username
 * @returns {Promise<Array<{accountAddress: string, accountType: string, balance: number}>>}
 */
export const getAccounts = async (username) => {
    const response = await client.get('/account', {
        params: { username },
    });
    return response.data;
};

/**
 * 계좌 상세 조회
 * @param {string} accountAddress
 * @returns {Promise<{accountAddress: string, accountType: string, balance: number, ownerUsername: string}>}
 */
export const getAccountDetail = async (accountAddress) => {
    const response = await client.get(`/account/${accountAddress}`);
    return response.data;
};
