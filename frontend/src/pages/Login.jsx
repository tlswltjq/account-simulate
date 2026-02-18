import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import client from '../api/client';
import Input from '../components/Input';
import Button from '../components/Button';

const Login = () => {
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
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

        setLoading(true);
        setError('');

        try {
            const response = await client.post('/member/login', { username, password });

            if (response.data === true) {
                login(username);
                navigate('/dashboard');
            } else {
                setError('아이디 또는 비밀번호가 올바르지 않습니다.');
            }
        } catch (err) {
            console.error('Login failed:', err);
            if (err.response && err.response.status === 401) {
                setError('아이디 또는 비밀번호가 올바르지 않습니다.');
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
                    background: 'linear-gradient(135deg, var(--primary), #a855f7)',
                    borderRadius: '1rem',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontSize: '1.75rem',
                    fontWeight: 'bold',
                    color: 'white',
                    margin: '0 auto 1.5rem auto',
                    boxShadow: '0 10px 25px -5px rgba(99, 102, 241, 0.4)'
                }}>
                    💳
                </div>

                <h1 style={{ textAlign: 'center', marginBottom: '0.5rem', fontSize: '2rem' }}>로그인</h1>
                <p style={{ textAlign: 'center', marginBottom: '2rem' }}>Mini Pay에 오신 것을 환영합니다</p>

                <form onSubmit={handleSubmit}>
                    <Input
                        label="아이디"
                        value={username}
                        onChange={(e) => setUsername(e.target.value)}
                        placeholder="아이디를 입력하세요"
                        autoComplete="username"
                    />
                    <Input
                        label="비밀번호"
                        type="password"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        placeholder="비밀번호를 입력하세요"
                        autoComplete="current-password"
                    />

                    {error && (
                        <div className="error-alert animate-fade-in">
                            <span style={{ marginRight: '0.5rem' }}>⚠️</span>
                            {error}
                        </div>
                    )}

                    <Button type="submit" loading={loading} style={{ width: '100%', marginTop: '1rem' }}>
                        로그인
                    </Button>
                </form>

                <div style={{ marginTop: '1.5rem', textAlign: 'center', fontSize: '0.875rem' }}>
                    <span style={{ color: 'var(--text-muted)' }}>계정이 없으신가요? </span>
                    <Link to="/signup" style={{ fontWeight: '500' }}>회원가입</Link>
                </div>
            </div>
        </div>
    );
};

export default Login;
