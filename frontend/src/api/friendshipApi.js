import client from './client';

/**
 * 친구 요청 보내기
 * @param {number} requesterId
 * @param {number} receiverId
 */
export const sendFriendRequest = async (requesterId, receiverId) => {
    const response = await client.post('/friendship/request', {
        requesterId,
        receiverId,
    });
    return response.data;
};

/**
 * 친구 요청 수락
 * @param {number} id - 친구 요청 ID
 * @param {number} receiverId - 수락하는 사용자 ID
 */
export const acceptFriendRequest = async (id, receiverId) => {
    const response = await client.post(`/friendship/${id}/accept`, null, {
        params: { receiverId },
    });
    return response.data;
};

/**
 * 친구 목록 조회
 * @param {number} memberId
 * @returns {Promise<Array<number>>} 친구 ID 목록
 */
export const getFriends = async (memberId) => {
    const response = await client.get(`/friendship/friends/${memberId}`);
    return response.data;
};

/**
 * 대기 중인 친구 요청 조회
 * @param {number} memberId
 * @returns {Promise<Array<{id, requesterId, receiverId, status}>>}
 */
export const getPendingRequests = async (memberId) => {
    const response = await client.get(`/friendship/pending/${memberId}`);
    return response.data;
};
