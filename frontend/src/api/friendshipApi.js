import client from './client';

/**
 * 친구 요청 보내기
 * @param {string} requesterUsername - 요청자 username
 * @param {string} receiverUsername - 상대방 username
 */
export const sendFriendRequest = async (requesterUsername, receiverUsername) => {
    const response = await client.post('/friendship/request', {
        requesterUsername,
        receiverUsername,
    });
    return response.data;
};

/**
 * 친구 요청 수락
 * @param {number} id - 친구 요청 ID
 * @param {string} receiverUsername - 수락하는 사용자 username
 */
export const acceptFriendRequest = async (id, receiverUsername) => {
    const response = await client.post(`/friendship/${id}/accept`, null, {
        params: { receiverUsername },
    });
    return response.data;
};

/**
 * 친구 목록 조회
 * @param {string} username
 * @returns {Promise<Array<string>>} 친구 username 목록
 */
export const getFriends = async (username) => {
    const response = await client.get(`/friendship/friends/${username}`);
    return response.data;
};

/**
 * 대기 중인 친구 요청 조회
 * @param {string} username
 * @returns {Promise<Array<{id, requesterUsername, receiverUsername, status}>>}
 */
export const getPendingRequests = async (username) => {
    const response = await client.get(`/friendship/pending/${username}`);
    return response.data;
};
