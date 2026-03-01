import client from './client';

/**
 * 균등 정산 생성
 * @param {string} requester - 요청자 username
 * @param {string} requesterAccountAddress - 요청자 출금 계좌 주소
 * @param {number} totalAmount - 총 금액
 * @param {Array<string>} participants - 참여자 username 목록 (친구의 username)
 */
export const openEqualSplitBill = async (requester, requesterAccountAddress, totalAmount, participants) => {
    const response = await client.post('/split-bills/equal', {
        requester,
        requesterAccountAddress,
        totalAmount,
        participants,
    });
    return response.data;
};

/**
 * 비율 정산 생성
 * @param {string} requester - 요청자 username
 * @param {string} requesterAccountAddress - 요청자 출금 계좌 주소
 * @param {number} totalAmount - 총 금액
 * @param {Array<{participant: string, ratio: number}>} ratios - 참여자별 비율 (participant는 친구의 username)
 */
export const openRatioSplitBill = async (requester, requesterAccountAddress, totalAmount, ratios) => {
    const response = await client.post('/split-bills/ratio', {
        requester,
        requesterAccountAddress,
        totalAmount,
        ratios,
    });
    return response.data;
};

/**
 * 정산 참여자 결제
 * @param {number} splitBillId - 정산 ID
 * @param {string} payerUsername - 결제자 username
 * @param {string} payAccountAddress - 결제 계좌 주소
 */
export const paySplitBill = async (splitBillId, payerUsername, payAccountAddress) => {
    const response = await client.post('/split-bills/pay', {
        splitBillId,
        payerUsername,
        payAccountAddress,
    });
    return response.data;
};

/**
 * 요청받은 정산 목록 조회
 * @param {string} username
 * @returns {Promise<{details: Array<{splitBillId, status, totalAmount, paid, unPaid, openedAt}>}>}
 */
export const getRequestedSplitBills = async (username) => {
    const response = await client.get('/split-bills/requested', {
        params: { username },
    });
    return response.data;
};

/**
 * 내가 개설한 정산 목록 조회
 * @param {string} username
 * @returns {Promise<{details: Array<{splitBillId, status, totalAmount, paid, unPaid, openedAt}>}>}
 */
export const getOpenedSplitBills = async (username) => {
    const response = await client.get('/split-bills/opened', {
        params: { username },
    });
    return response.data;
};
