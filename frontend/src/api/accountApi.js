import client from './client';

/**
 * 사용자의 계좌 목록 조회
 * @param {string} username
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
 */
export const getAccountDetail = async (accountAddress) => {
    const response = await client.get(`/account/${accountAddress}`);
    return response.data;
};

/**
 * 일반(메인) 계좌 생성
 * @param {string} username
 */
export const createGeneralAccount = async (username) => {
    const response = await client.post('/account/general', { username });
    return response.data;
};

/**
 * 적금 계좌 생성
 * @param {string} linkedAccountAddress - 연결할 일반 계좌 주소
 * @param {string} username
 */
export const createSavingAccount = async (linkedAccountAddress, username) => {
    const response = await client.post('/account/saving', {
        linkedAccountAddress,
        username,
    });
    return response.data;
};
