import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { getAccounts, createGeneralAccount, createSavingAccount } from '../api/accountApi';
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

// ── 모달 오버레이 공통 스타일 ──────────────────────────────────────
const overlayStyle = {
    position: 'fixed',
    inset: 0,
    background: 'rgba(0,0,0,0.6)',
    backdropFilter: 'blur(4px)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 1000,
    padding: '1rem',
};

const modalStyle = {
    background: 'var(--surface)',
    border: '1px solid var(--border)',
    borderRadius: '1.25rem',
    padding: '2rem',
    width: '100%',
    maxWidth: '420px',
    boxShadow: '0 24px 48px -12px rgba(0,0,0,0.5)',
};

// ── 계좌 생성 모달 ────────────────────────────────────────────────
const CreateAccountModal = ({ onClose, onCreated, generalAccounts, username }) => {
    const [step, setStep] = useState('select'); // 'select' | 'saving-link'
    const [accountType, setAccountType] = useState(null);
    const [selectedLinked, setSelectedLinked] = useState('');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);

    const handleSelectType = (type) => {
        setAccountType(type);
        if (type === 'SAVINGS') {
            setStep('saving-link');
        } else {
            handleCreate('GENERAL');
        }
    };

    const handleCreate = async (type, linkedAddress) => {
        setLoading(true);
        setError(null);
        try {
            if (type === 'GENERAL') {
                await createGeneralAccount(username);
            } else {
                await createSavingAccount(linkedAddress, username);
            }
            onCreated();
        } catch (err) {
            setError(err.response?.data?.message || '계좌 생성에 실패했습니다.');
            setLoading(false);
        }
    };

    return (
        <div style={overlayStyle} onClick={onClose}>
            <div style={modalStyle} onClick={(e) => e.stopPropagation()}>
                <h3 style={{ margin: '0 0 1.5rem 0', fontSize: '1.125rem', fontWeight: '700', color: 'var(--text-main)', textAlign: 'center' }}>
                    계좌 만들기
                </h3>

                {step === 'select' && (
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                        {[
                            { type: 'GENERAL', icon: '💰', label: '일반 계좌', desc: '외부에서 충전 가능한 메인 계좌' },
                            { type: 'SAVINGS', icon: '🏦', label: '적금 계좌', desc: '일반 계좌와 연결하는 적금 계좌' },
                        ].map(({ type, icon, label, desc }) => (
                            <button
                                key={type}
                                onClick={() => handleSelectType(type)}
                                disabled={loading}
                                style={{
                                    display: 'flex',
                                    alignItems: 'center',
                                    gap: '1rem',
                                    padding: '1rem 1.25rem',
                                    background: 'rgba(255,255,255,0.05)',
                                    border: '1px solid var(--border)',
                                    borderRadius: '0.875rem',
                                    cursor: loading ? 'not-allowed' : 'pointer',
                                    textAlign: 'left',
                                    transition: 'all 0.2s ease',
                                    color: 'var(--text-main)',
                                }}
                                onMouseEnter={(e) => { if (!loading) e.currentTarget.style.background = 'rgba(99,102,241,0.15)'; e.currentTarget.style.borderColor = 'var(--primary)'; }}
                                onMouseLeave={(e) => { e.currentTarget.style.background = 'rgba(255,255,255,0.05)'; e.currentTarget.style.borderColor = 'var(--border)'; }}
                            >
                                <span style={{ fontSize: '1.75rem' }}>{icon}</span>
                                <div>
                                    <div style={{ fontWeight: '600', marginBottom: '0.2rem' }}>{label}</div>
                                    <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>{desc}</div>
                                </div>
                            </button>
                        ))}
                        {loading && (
                            <div style={{ textAlign: 'center', padding: '0.5rem', color: 'var(--text-muted)', fontSize: '0.875rem' }}>
                                <div className="loading-spinner" style={{ margin: '0 auto 0.5rem' }} />
                                계좌 생성 중...
                            </div>
                        )}
                        {error && <div className="error-alert">{error}</div>}
                    </div>
                )}

                {step === 'saving-link' && (
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                        <p style={{ margin: 0, fontSize: '0.9rem', color: 'var(--text-muted)' }}>
                            연결할 일반 계좌를 선택하세요.
                        </p>
                        {generalAccounts.length === 0 ? (
                            <div className="error-alert">연결 가능한 일반 계좌가 없습니다. 먼저 일반 계좌를 만들어주세요.</div>
                        ) : (
                            <select
                                value={selectedLinked}
                                onChange={(e) => setSelectedLinked(e.target.value)}
                                style={{
                                    width: '100%',
                                    padding: '0.75rem 1rem',
                                    background: 'rgba(255,255,255,0.06)',
                                    border: '1px solid var(--border)',
                                    borderRadius: '0.75rem',
                                    color: 'var(--text-main)',
                                    fontSize: '0.875rem',
                                    cursor: 'pointer',
                                }}
                            >
                                <option value="">계좌를 선택하세요</option>
                                {generalAccounts.map((acc) => (
                                    <option key={acc.accountAddress} value={acc.accountAddress}>
                                        💰 일반 계좌 — ₩{acc.balance.toLocaleString()} ({acc.accountAddress.slice(0, 8)}...)
                                    </option>
                                ))}
                            </select>
                        )}
                        {error && <div className="error-alert">{error}</div>}
                        <div style={{ display: 'flex', gap: '0.75rem' }}>
                            <button
                                onClick={() => setStep('select')}
                                style={{
                                    flex: 1,
                                    padding: '0.75rem',
                                    background: 'rgba(255,255,255,0.06)',
                                    border: '1px solid var(--border)',
                                    borderRadius: '0.75rem',
                                    color: 'var(--text-muted)',
                                    cursor: 'pointer',
                                    fontSize: '0.875rem',
                                }}
                            >
                                ← 뒤로
                            </button>
                            <Button
                                onClick={() => handleCreate('SAVINGS', selectedLinked)}
                                disabled={!selectedLinked || loading}
                                style={{ flex: 2 }}
                            >
                                {loading ? '생성 중...' : '적금 계좌 생성'}
                            </Button>
                        </div>
                    </div>
                )}

                {step === 'select' && !loading && (
                    <button
                        onClick={onClose}
                        style={{
                            marginTop: '1rem',
                            width: '100%',
                            padding: '0.6rem',
                            background: 'transparent',
                            border: 'none',
                            color: 'var(--text-muted)',
                            cursor: 'pointer',
                            fontSize: '0.875rem',
                        }}
                    >
                        취소
                    </button>
                )}
            </div>
        </div>
    );
};

// ── Dashboard ─────────────────────────────────────────────────────
const Dashboard = () => {
    const { username, logout } = useAuth();
    const navigate = useNavigate();
    const [accounts, setAccounts] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [showCreateModal, setShowCreateModal] = useState(false);

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

    useEffect(() => {
        if (username) {
            fetchAccounts();
        }
    }, [username]);

    const handleLogout = () => {
        logout();
        navigate('/');
    };

    const handleCreated = () => {
        setShowCreateModal(false);
        fetchAccounts();
    };

    const generalAccounts = accounts.filter((a) => a.accountType === 'GENERAL');

    return (
        <div className="animate-fade-in" style={{ maxWidth: '800px', margin: '0 auto', width: '100%' }}>
            {/* 계좌 생성 모달 */}
            {showCreateModal && (
                <CreateAccountModal
                    onClose={() => setShowCreateModal(false)}
                    onCreated={handleCreated}
                    generalAccounts={generalAccounts}
                    username={username}
                />
            )}

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
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                        <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>
                            {!loading && !error && `${accounts.length}개`}
                        </span>
                        <button
                            onClick={() => setShowCreateModal(true)}
                            style={{
                                display: 'flex',
                                alignItems: 'center',
                                gap: '0.4rem',
                                padding: '0.4rem 0.9rem',
                                background: 'linear-gradient(135deg, var(--primary), #a855f7)',
                                border: 'none',
                                borderRadius: '0.625rem',
                                color: 'white',
                                fontSize: '0.8rem',
                                fontWeight: '600',
                                cursor: 'pointer',
                                boxShadow: '0 4px 12px -2px rgba(99,102,241,0.4)',
                                transition: 'all 0.2s ease',
                            }}
                            onMouseEnter={(e) => e.currentTarget.style.transform = 'translateY(-1px)'}
                            onMouseLeave={(e) => e.currentTarget.style.transform = 'translateY(0)'}
                        >
                            + 계좌 만들기
                        </button>
                    </div>
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
                        <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem', margin: '0 0 1.5rem 0' }}>
                            등록된 계좌가 없습니다.
                        </p>
                        <button
                            onClick={() => setShowCreateModal(true)}
                            style={{
                                padding: '0.6rem 1.5rem',
                                background: 'linear-gradient(135deg, var(--primary), #a855f7)',
                                border: 'none',
                                borderRadius: '0.75rem',
                                color: 'white',
                                fontSize: '0.875rem',
                                fontWeight: '600',
                                cursor: 'pointer',
                            }}
                        >
                            첫 계좌 만들기
                        </button>
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
        </div>
    );
};

export default Dashboard;
