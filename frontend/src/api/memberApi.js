import client from './client';

/**
 * 회원가입
 * @param {string} username
 * @param {string} password
 */
export const joinMember = async (username, password) => {
    const response = await client.post('/member', { username, password });
    return response.data;
};

/**
 * 로그인
 * @param {string} username
 * @param {string} password
 */
export const loginMember = async (username, password) => {
    const response = await client.post('/member/login', { username, password });
    return response.data;
};
