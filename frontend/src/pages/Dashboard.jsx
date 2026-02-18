import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { getAccounts } from '../api/accountApi';
import Button from '../components/Button';

const ACCOUNT_TYPE_LABEL = {
    GENERAL: '일반 계좌',
    SAVINGS: '적금 계좌',
};

const ACCOUNT_TYPE_ICON = {
    GENERAL: '💰',
    SAVINGS: '🏦',
};

const ACCOUNT_TYPE_GRADIENT = {
    GENERAL: 'linear-gradient(135deg, #6366f1, #818cf8)',
    SAVINGS: 'linear-gradient(135deg, #a855f7, #c084fc)',
};

const Dashboard = () => {
    const { username, logout } = useAuth();
    const navigate = useNavigate();
    const [accounts, setAccounts] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        const fetchAccounts = async () => {
            try {
                setLoading(true);
                setError(null);
                const data = await getAccounts(username);
                setAccounts(data);
            } catch (err) {
                setError(err.response?.data?.message || '계좌 목록을 불러올 수 없습니다.');
            } finally {
                setLoading(false);
            }
        };
        if (username) {
            fetchAccounts();
        }
    }, [username]);

    const handleLogout = () => {
        logout();
        navigate('/');
    };

    return (
        <div className="animate-fade-in" style={{ maxWidth: '800px', margin: '0 auto', width: '100%' }}>
            {/* 헤더 */}
            <div style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                marginBottom: '2rem',
                padding: '0 0.5rem'
            }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                    <div style={{
                        width: '40px',
                        height: '40px',
                        background: 'linear-gradient(135deg, var(--primary), #a855f7)',
                        borderRadius: '0.75rem',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        fontSize: '1.25rem',
                        color: 'white'
                    }}>
                        💳
                    </div>
                    <span style={{ fontSize: '1.25rem', fontWeight: '700', color: 'var(--text-main)' }}>Mini Pay</span>
                </div>
                <Button onClick={handleLogout} style={{
                    maxWidth: '120px',
                    padding: '0.5rem 1rem',
                    fontSize: '0.875rem',
                    background: 'rgba(239, 68, 68, 0.15)',
                    border: '1px solid rgba(239, 68, 68, 0.3)',
                }}>
                    로그아웃
                </Button>
            </div>

            {/* 프로필 카드 */}
            <div className="glass-panel" style={{ marginBottom: '1.5rem' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '1.25rem' }}>
                    <div style={{
                        width: '64px',
                        height: '64px',
                        background: 'linear-gradient(135deg, var(--primary), var(--primary-hover))',
                        borderRadius: '50%',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        fontSize: '1.5rem',
                        fontWeight: 'bold',
                        color: 'white',
                        boxShadow: '0 8px 20px -4px rgba(99, 102, 241, 0.4)',
                        flexShrink: 0
                    }}>
                        {username ? username.charAt(0).toUpperCase() : '?'}
                    </div>
                    <div style={{ textAlign: 'left' }}>
                        <h2 style={{ fontSize: '1.25rem', margin: '0 0 0.25rem 0', color: 'var(--text-main)' }}>
                            {username}님, 환영합니다! 👋
                        </h2>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                            <span style={{
                                width: '8px',
                                height: '8px',
                                borderRadius: '50%',
                                background: '#22c55e',
                                display: 'inline-block',
                                boxShadow: '0 0 8px rgba(34, 197, 94, 0.5)'
                            }}></span>
                            <span style={{ fontSize: '0.875rem', color: 'var(--text-muted)' }}>활성 회원</span>
                        </div>
                    </div>
                </div>
            </div>

            {/* 계좌 목록 섹션 */}
            <div style={{ marginBottom: '1.5rem' }}>
                <div style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    padding: '0 0.5rem',
                    marginBottom: '1rem',
                }}>
                    <h3 style={{ fontSize: '1.1rem', fontWeight: '600', color: 'var(--text-main)', margin: 0 }}>
                        내 계좌
                    </h3>
                    <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>
                        {!loading && !error && `${accounts.length}개`}
                    </span>
                </div>

                {/* 로딩 */}
                {loading && (
                    <div className="glass-panel" style={{ textAlign: 'center', padding: '3rem 2rem' }}>
                        <div className="loading-spinner" />
                        <p style={{ marginTop: '1rem', color: 'var(--text-muted)', fontSize: '0.875rem' }}>
                            계좌 목록을 불러오는 중...
                        </p>
                    </div>
                )}

                {/* 에러 */}
                {!loading && error && (
                    <div className="glass-panel" style={{ textAlign: 'center', padding: '2rem' }}>
                        <div className="error-alert" style={{ justifyContent: 'center' }}>
                            ⚠️&nbsp; {error}
                        </div>
                    </div>
                )}

                {/* 빈 상태 */}
                {!loading && !error && accounts.length === 0 && (
                    <div className="glass-panel" style={{ textAlign: 'center', padding: '3rem 2rem' }}>
                        <div style={{ fontSize: '3rem', marginBottom: '1rem', opacity: 0.5 }}>🏦</div>
                        <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem', margin: 0 }}>
                            등록된 계좌가 없습니다.
                        </p>
                    </div>
                )}

                {/* 계좌 카드 그리드 */}
                {!loading && !error && accounts.length > 0 && (
                    <div style={{
                        display: 'grid',
                        gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))',
                        gap: '1rem',
                    }}>
                        {accounts.map((account) => {
                            const icon = ACCOUNT_TYPE_ICON[account.accountType] || '💳';
                            const label = ACCOUNT_TYPE_LABEL[account.accountType] || account.accountType;
                            const gradient = ACCOUNT_TYPE_GRADIENT[account.accountType] || 'linear-gradient(135deg, #6366f1, #818cf8)';
                            return (
                                <div
                                    key={account.accountAddress}
                                    className="account-card"
                                    onClick={() => navigate(`/account/${account.accountAddress}`)}
                                    style={{ cursor: 'pointer' }}
                                >
                                    <div style={{
                                        display: 'flex',
                                        alignItems: 'center',
                                        justifyContent: 'space-between',
                                        marginBottom: '1rem'
                                    }}>
                                        <div style={{
                                            width: '44px',
                                            height: '44px',
                                            background: gradient,
                                            borderRadius: '0.75rem',
                                            display: 'flex',
                                            alignItems: 'center',
                                            justifyContent: 'center',
                                            fontSize: '1.25rem',
                                            boxShadow: '0 4px 12px -2px rgba(0,0,0,0.2)',
                                        }}>
                                            {icon}
                                        </div>
                                        <span style={{
                                            fontSize: '0.75rem',
                                            color: 'var(--text-muted)',
                                            background: 'rgba(255,255,255,0.06)',
                                            padding: '0.2rem 0.6rem',
                                            borderRadius: '1rem',
                                            border: '1px solid rgba(255,255,255,0.08)',
                                        }}>
                                            {label}
                                        </span>
                                    </div>
                                    <div style={{
                                        fontSize: '1.35rem',
                                        fontWeight: '700',
                                        color: 'var(--text-main)',
                                        marginBottom: '0.5rem',
                                    }}>
                                        ₩ {account.balance.toLocaleString()}
                                    </div>
                                    <div style={{
                                        fontSize: '0.75rem',
                                        color: 'var(--text-muted)',
                                        fontFamily: 'monospace',
                                        overflow: 'hidden',
                                        textOverflow: 'ellipsis',
                                        whiteSpace: 'nowrap',
                                    }}>
                                        {account.accountAddress}
                                    </div>
                                    <div style={{
                                        marginTop: '0.75rem',
                                        display: 'flex',
                                        alignItems: 'center',
                                        justifyContent: 'flex-end',
                                        fontSize: '0.75rem',
                                        color: 'var(--primary)',
                                        fontWeight: '500',
                                    }}>
                                        상세 보기 →
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                )}
            </div>

            {/* 송금 기능 카드 (준비 중) */}
            <div style={{
                display: 'grid',
                gridTemplateColumns: '1fr',
                gap: '1rem',
            }}>
                <div className="feature-card">
                    <div className="feature-icon" style={{ background: 'linear-gradient(135deg, #ec4899, #f472b6)' }}>
                        💸
                    </div>
                    <h3 style={{ fontSize: '1rem', fontWeight: '600', margin: '0 0 0.25rem 0', color: 'var(--text-main)' }}>
                        송금
                    </h3>
                    <p style={{ fontSize: '0.8rem', margin: 0 }}>
                        계좌 간 이체
                    </p>
                    <div className="feature-badge">준비 중</div>
                </div>
            </div>
        </div>
    );
};

export default Dashboard;
