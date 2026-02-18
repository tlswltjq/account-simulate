import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import client from '../api/client';
import Input from '../components/Input';
import Button from '../components/Button';

const Signup = () => {
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const { login } = useAuth();
    const navigate = useNavigate();

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!username || !password) {
            setError('아이디와 비밀번호를 모두 입력해주세요.');
            return;
        }

        if (password !== confirmPassword) {
            setError('비밀번호가 일치하지 않습니다.');
            return;
        }

        if (password.length < 4) {
            setError('비밀번호는 4자 이상이어야 합니다.');
            return;
        }

        setLoading(true);
        setError('');

        try {
            await client.post('/member', { username, password });

            // 회원가입 성공 시 자동 로그인 처리
            login(username);
            navigate('/dashboard');
        } catch (err) {
            console.error('Signup failed:', err);
            if (err.response && err.response.status === 409) {
                setError('이미 사용중인 아이디입니다.');
            } else if (err.response && err.response.data) {
                setError(err.response.data.message || '회원가입에 실패했습니다.');
            } else {
                setError('서버 연결에 실패했습니다. 잠시 후 다시 시도해주세요.');
            }
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="animate-fade-in" style={{ maxWidth: '420px', margin: '0 auto', width: '100%' }}>
            <div className="glass-panel">
                {/* 로고 영역 */}
                <div style={{
                    width: '64px',
                    height: '64px',
                    background: 'linear-gradient(135deg, #a855f7, #ec4899)',
                    borderRadius: '1rem',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontSize: '1.75rem',
                    fontWeight: 'bold',
                    color: 'white',
                    margin: '0 auto 1.5rem auto',
                    boxShadow: '0 10px 25px -5px rgba(168, 85, 247, 0.4)'
                }}>
                    🚀
                </div>

                <h1 style={{ textAlign: 'center', marginBottom: '0.5rem', fontSize: '2rem' }}>회원가입</h1>
                <p style={{ textAlign: 'center', marginBottom: '2rem' }}>Mini Pay 계정을 만들어보세요</p>

                <form onSubmit={handleSubmit}>
                    <Input
                        label="아이디"
                        value={username}
                        onChange={(e) => setUsername(e.target.value)}
                        placeholder="사용할 아이디를 입력하세요"
                        autoComplete="username"
                    />
                    <Input
                        label="비밀번호"
                        type="password"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        placeholder="비밀번호를 입력하세요"
                        autoComplete="new-password"
                    />
                    <Input
                        label="비밀번호 확인"
                        type="password"
                        value={confirmPassword}
                        onChange={(e) => setConfirmPassword(e.target.value)}
                        placeholder="비밀번호를 다시 입력하세요"
                        autoComplete="new-password"
                    />

                    {error && (
                        <div className="error-alert animate-fade-in">
                            <span style={{ marginRight: '0.5rem' }}>⚠️</span>
                            {error}
                        </div>
                    )}

                    <Button type="submit" loading={loading} style={{ width: '100%', marginTop: '1rem' }}>
                        회원가입
                    </Button>
                </form>

                <div style={{ marginTop: '1.5rem', textAlign: 'center', fontSize: '0.875rem' }}>
                    <span style={{ color: 'var(--text-muted)' }}>이미 계정이 있으신가요? </span>
                    <Link to="/" style={{ fontWeight: '500' }}>로그인</Link>
                </div>
            </div>
        </div>
    );
};

export default Signup;
