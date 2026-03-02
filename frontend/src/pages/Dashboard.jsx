import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { getAccounts, createGeneralAccount, createSavingAccount } from '../api/accountApi';
import { getFriends } from '../api/friendshipApi';
import { openEqualSplitBill, getRequestedSplitBills, getOpenedSplitBills, paySplitBill } from '../api/splitBillApi';
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

    // ── 정산 관련 상태 ──────────────────────────────────────────────
    const [splitTab, setSplitTab] = useState('request'); // 'request' | 'received' | 'opened'
    const [friends, setFriends] = useState([]);
    const [requestedSplits, setRequestedSplits] = useState([]);
    const [openedSplits, setOpenedSplits] = useState([]);
    const [splitLoading, setSplitLoading] = useState(false);

    // 정산 요청 폼
    const [selectedFriends, setSelectedFriends] = useState([]);
    const [includeMe, setIncludeMe] = useState(false);
    const [splitAmount, setSplitAmount] = useState('');
    const [splitFromAccount, setSplitFromAccount] = useState('');
    const [splitSuccess, setSplitSuccess] = useState(false);
    const [splitError, setSplitError] = useState(null);

    // 결제 관련
    const [payLoadingId, setPayLoadingId] = useState(null);
    const [payAccountMap, setPayAccountMap] = useState({});
    const [expandedSplitId, setExpandedSplitId] = useState(null);

    const fetchSplitData = async () => {
        try {
            const [friendsData, reqData, opnData] = await Promise.all([
                getFriends(username),
                getRequestedSplitBills(username),
                getOpenedSplitBills(username),
            ]);
            setFriends(friendsData);
            setRequestedSplits(reqData.details || []);
            setOpenedSplits(opnData.details || []);
        } catch { }
    };

    useEffect(() => { if (username) fetchSplitData(); }, [username]);

    const toggleFriend = (f) => setSelectedFriends(prev =>
        prev.includes(f) ? prev.filter(x => x !== f) : [...prev, f]
    );

    const handleSplitRequest = async () => {
        if (!splitFromAccount) { setSplitError('출금 계좌를 선택해주세요.'); return; }
        if (selectedFriends.length === 0) { setSplitError('정산할 친구를 선택해주세요.'); return; }
        if (!splitAmount || Number(splitAmount) <= 0) { setSplitError('올바른 금액을 입력해주세요.'); return; }
        setSplitLoading(true); setSplitError(null);
        try {
            const participants = includeMe
                ? [...selectedFriends, username]
                : selectedFriends;
            await openEqualSplitBill(username, splitFromAccount, Number(splitAmount), participants);
            setSplitSuccess(true);
            setSelectedFriends([]); setSplitAmount(''); setSplitFromAccount(''); setIncludeMe(false);
            await fetchSplitData();
            setTimeout(() => setSplitSuccess(false), 3000);
        } catch (err) {
            setSplitError(err.response?.data?.message || '정산 요청에 실패했습니다.');
        } finally {
            setSplitLoading(false);
        }
    };

    const handlePaySplit = async (splitBillId) => {
        const payAccountAddress = payAccountMap[splitBillId];
        if (!payAccountAddress) { setError('결제할 계좌를 선택해주세요.'); return; }
        setPayLoadingId(splitBillId);
        try {
            await paySplitBill(splitBillId, username, payAccountAddress);
            await fetchSplitData();
            await fetchAccounts();
            setPayAccountMap(prev => { const m = { ...prev }; delete m[splitBillId]; return m; });
        } catch (err) {
            setError(err.response?.data?.message || '결제 처리에 실패했습니다.');
        } finally {
            setPayLoadingId(null);
        }
    };

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
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                    <button
                        onClick={() => navigate('/friends')}
                        style={{
                            display: 'flex',
                            alignItems: 'center',
                            gap: '0.35rem',
                            padding: '0.5rem 1rem',
                            background: 'rgba(99, 102, 241, 0.1)',
                            border: '1px solid rgba(99, 102, 241, 0.2)',
                            borderRadius: '0.625rem',
                            color: 'var(--primary)',
                            fontSize: '0.8rem',
                            fontWeight: '600',
                            cursor: 'pointer',
                            transition: 'all 0.2s ease',
                        }}
                        onMouseEnter={(e) => {
                            e.currentTarget.style.background = 'rgba(99, 102, 241, 0.2)';
                            e.currentTarget.style.transform = 'translateY(-1px)';
                        }}
                        onMouseLeave={(e) => {
                            e.currentTarget.style.background = 'rgba(99, 102, 241, 0.1)';
                            e.currentTarget.style.transform = 'translateY(0)';
                        }}
                    >
                        👥 네트워크
                    </button>
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

            {/* ── 정산 섹션 ──────────────────────────────────────────── */}
            <div style={{ marginBottom: '2rem' }}>
                <div style={{ padding: '0 0.5rem', marginBottom: '1rem' }}>
                    <h3 style={{ fontSize: '1.1rem', fontWeight: '600', color: 'var(--text-main)', margin: 0 }}>
                        💸 정산
                    </h3>
                </div>

                <div className="glass-panel" style={{ padding: '1.25rem' }}>
                    {/* 탭 */}
                    <div style={{ display: 'flex', gap: '0.5rem', marginBottom: '1.25rem', borderBottom: '1px solid var(--border)', paddingBottom: '0.75rem', flexWrap: 'wrap' }}>
                        {[['request', '정산 요청'], ['received', '받은 정산'], ['opened', '내가 연 정산']].map(([key, label]) => {
                            const badge = key === 'received'
                                ? requestedSplits.filter(s => s.status !== 'PAID' && !s.paid.some(p => p.participant === username)).length
                                : 0;
                            return (
                                <button
                                    key={key}
                                    onClick={() => setSplitTab(key)}
                                    style={{
                                        background: splitTab === key ? 'rgba(99,102,241,0.18)' : 'none',
                                        border: splitTab === key ? '1px solid rgba(99,102,241,0.4)' : '1px solid transparent',
                                        borderRadius: '0.625rem',
                                        color: splitTab === key ? 'var(--primary)' : 'var(--text-muted)',
                                        fontWeight: splitTab === key ? '700' : '500',
                                        fontSize: '0.85rem',
                                        padding: '0.35rem 0.9rem',
                                        cursor: 'pointer',
                                        display: 'flex',
                                        alignItems: 'center',
                                        gap: '0.35rem',
                                        transition: 'all 0.15s',
                                    }}
                                >
                                    {label}
                                    {badge > 0 && (
                                        <span style={{ background: '#ef4444', color: 'white', borderRadius: '1rem', fontSize: '0.7rem', padding: '0.05rem 0.45rem', fontWeight: '700' }}>{badge}</span>
                                    )}
                                </button>
                            );
                        })}
                    </div>

                    {/* ── 정산 요청 탭 ── */}
                    {splitTab === 'request' && (
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.9rem' }}>
                            {splitError && <div className="error-alert">⚠️&nbsp; {splitError}</div>}
                            {splitSuccess && <div className="success-alert">✅&nbsp; 정산 요청이 완료되었습니다!</div>}

                            <select
                                value={splitFromAccount}
                                onChange={(e) => setSplitFromAccount(e.target.value)}
                                style={{ width: '100%', padding: '0.65rem', background: 'rgba(255,255,255,0.05)', border: '1px solid var(--border)', borderRadius: '0.625rem', color: 'var(--text-main)', fontSize: '0.875rem', outline: 'none' }}
                            >
                                <option value="" disabled>출금 계좌 선택</option>
                                {generalAccounts.map(acc => (
                                    <option key={acc.accountAddress} value={acc.accountAddress}>
                                        💰 {acc.balance.toLocaleString()}원 ({acc.accountAddress.slice(0, 8)}...)
                                    </option>
                                ))}
                            </select>

                            {friends.length > 0 && (
                                <div>
                                    <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginBottom: '0.5rem' }}>정산할 친구 선택</div>
                                    <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.4rem' }}>
                                        {friends.map(f => {
                                            const sel = selectedFriends.includes(f.username);
                                            return (
                                                <button
                                                    key={f.username}
                                                    onClick={() => toggleFriend(f.username)}
                                                    style={{
                                                        padding: '0.35rem 0.8rem',
                                                        borderRadius: '1rem',
                                                        border: `1px solid ${sel ? 'rgba(99,102,241,0.5)' : 'var(--border)'}`,
                                                        background: sel ? 'rgba(99,102,241,0.18)' : 'rgba(255,255,255,0.04)',
                                                        color: sel ? 'var(--primary)' : 'var(--text-muted)',
                                                        fontSize: '0.8rem',
                                                        fontWeight: sel ? '700' : '400',
                                                        cursor: 'pointer',
                                                        transition: 'all 0.15s',
                                                    }}
                                                >
                                                    {sel ? '✓ ' : ''}{f.username}
                                                </button>
                                            );
                                        })}
                                    </div>
                                </div>
                            )}

                            <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.875rem', color: 'var(--text-muted)', cursor: 'pointer' }}>
                                <input type="checkbox" checked={includeMe} onChange={(e) => setIncludeMe(e.target.checked)} />
                                나 포함 1/N
                            </label>

                            <input
                                type="number"
                                placeholder="총 금액 입력 (원)"
                                value={splitAmount}
                                onChange={(e) => setSplitAmount(e.target.value)}
                                style={{ width: '100%', padding: '0.65rem', background: 'rgba(255,255,255,0.05)', border: '1px solid var(--border)', borderRadius: '0.625rem', color: 'var(--text-main)', fontSize: '0.875rem', outline: 'none', boxSizing: 'border-box' }}
                            />

                            <Button onClick={handleSplitRequest} loading={splitLoading} style={{ padding: '0.75rem', fontWeight: '600' }}>
                                정산 요청하기
                            </Button>
                        </div>
                    )}

                    {/* ── 받은 정산 탭 ── */}
                    {splitTab === 'received' && (
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                            {error && <div className="error-alert">⚠️&nbsp; {error}</div>}
                            {requestedSplits.length === 0 ? (
                                <div style={{ textAlign: 'center', padding: '2rem', color: 'var(--text-muted)' }}>받은 정산 내역이 없습니다.</div>
                            ) : requestedSplits.map(split => {
                                const myUnpaidShare = split.unPaid.find(s => s.participant === username);
                                const myPaidShare = split.paid.find(s => s.participant === username);
                                const isPaid = split.status === 'PAID' || !!myPaidShare;
                                const myAmount = myUnpaidShare ? myUnpaidShare.amount : (myPaidShare ? myPaidShare.amount : 0);
                                const isExpanded = expandedSplitId === `req-${split.splitBillId}`;
                                return (
                                    <div key={split.splitBillId} style={{ padding: '1.1rem', background: 'rgba(15,23,42,0.4)', border: `1px solid ${isPaid ? 'rgba(34,197,94,0.3)' : 'rgba(239,68,68,0.3)'}`, borderRadius: '0.875rem' }}>
                                        <div onClick={() => setExpandedSplitId(isExpanded ? null : `req-${split.splitBillId}`)} style={{ cursor: 'pointer' }}>
                                            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.3rem' }}>
                                                <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>{new Date(split.openedAt).toLocaleDateString()}</span>
                                                <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                                                    <span style={{ fontSize: '0.7rem', padding: '0.15rem 0.5rem', borderRadius: '1rem', background: isPaid ? 'rgba(34,197,94,0.15)' : 'rgba(239,68,68,0.15)', color: isPaid ? '#4ade80' : '#f87171', fontWeight: '600' }}>
                                                        {isPaid ? '결제 완료' : '결제 필요'}
                                                    </span>
                                                    <span style={{ color: 'var(--text-muted)', fontSize: '0.7rem' }}>{isExpanded ? '▲' : '▼'}</span>
                                                </div>
                                            </div>
                                            <div style={{ fontSize: '1.05rem', fontWeight: '700', color: 'var(--text-main)' }}>총 {split.totalAmount.toLocaleString()}원</div>
                                            <div style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>내 금액: <span style={{ color: isPaid ? '#4ade80' : '#f87171', fontWeight: '700' }}>{myAmount.toLocaleString()}원</span></div>
                                        </div>
                                        {isExpanded && (
                                            <div style={{ marginTop: '0.8rem', borderTop: '1px solid rgba(255,255,255,0.07)', paddingTop: '0.8rem' }}>
                                                {split.paid.length > 0 && (
                                                    <div style={{ marginBottom: '0.5rem' }}>
                                                        <div style={{ fontSize: '0.72rem', color: '#4ade80', fontWeight: '600', marginBottom: '0.3rem' }}>✅ 결제 완료</div>
                                                        {split.paid.map(p => (
                                                            <div key={p.participant} style={{ display: 'flex', justifyContent: 'space-between', padding: '0.3rem 0.5rem', background: 'rgba(34,197,94,0.07)', borderRadius: '0.4rem', marginBottom: '0.25rem', fontSize: '0.8rem' }}>
                                                                <span style={{ color: 'var(--text-main)' }}>{p.participant === username ? '나 (★)' : p.participant}</span>
                                                                <span style={{ color: '#4ade80' }}>{p.amount.toLocaleString()}원</span>
                                                            </div>
                                                        ))}
                                                    </div>
                                                )}
                                                {split.unPaid.length > 0 && (
                                                    <div style={{ marginBottom: '0.5rem' }}>
                                                        <div style={{ fontSize: '0.72rem', color: '#f87171', fontWeight: '600', marginBottom: '0.3rem' }}>⏳ 미결제</div>
                                                        {split.unPaid.map(p => (
                                                            <div key={p.participant} style={{ display: 'flex', justifyContent: 'space-between', padding: '0.3rem 0.5rem', background: 'rgba(239,68,68,0.07)', borderRadius: '0.4rem', marginBottom: '0.25rem', fontSize: '0.8rem' }}>
                                                                <span style={{ color: 'var(--text-main)' }}>{p.participant === username ? '나 (★)' : p.participant}</span>
                                                                <span style={{ color: '#f87171' }}>{p.amount.toLocaleString()}원</span>
                                                            </div>
                                                        ))}
                                                    </div>
                                                )}
                                            </div>
                                        )}
                                        {!isPaid && (
                                            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.4rem', marginTop: '0.75rem', borderTop: '1px solid rgba(255,255,255,0.05)', paddingTop: '0.75rem' }}>
                                                <select value={payAccountMap[split.splitBillId] || ''} onChange={(e) => setPayAccountMap(prev => ({ ...prev, [split.splitBillId]: e.target.value }))} style={{ padding: '0.5rem', background: 'rgba(255,255,255,0.05)', border: '1px solid var(--border)', borderRadius: '0.5rem', color: 'var(--text-main)', fontSize: '0.8rem', outline: 'none' }}>
                                                    <option value="" disabled>출금 계좌 선택</option>
                                                    {generalAccounts.map(acc => (
                                                        <option key={acc.accountAddress} value={acc.accountAddress}>💰 {acc.balance.toLocaleString()}원 ({acc.accountAddress.slice(0, 8)}...)</option>
                                                    ))}
                                                </select>
                                                <Button onClick={() => handlePaySplit(split.splitBillId)} loading={payLoadingId === split.splitBillId} disabled={!payAccountMap[split.splitBillId] || payLoadingId === split.splitBillId} style={{ padding: '0.5rem', fontSize: '0.82rem', background: 'linear-gradient(135deg,#ef4444,#f87171)', border: 'none' }}>
                                                    결제(송금)하기
                                                </Button>
                                            </div>
                                        )}
                                    </div>
                                );
                            })}
                        </div>
                    )}

                    {/* ── 내가 연 정산 탭 ── */}
                    {splitTab === 'opened' && (
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                            {openedSplits.length === 0 ? (
                                <div style={{ textAlign: 'center', padding: '2rem', color: 'var(--text-muted)' }}>내가 연 정산 내역이 없습니다.</div>
                            ) : openedSplits.map(split => {
                                const isCompleted = split.unPaid.length === 0 || split.status === 'COMPLETED';
                                const totalPaid = split.paid.reduce((s, p) => s + p.amount, 0);
                                const totalUnPaid = split.unPaid.reduce((s, p) => s + p.amount, 0);
                                const isExpanded = expandedSplitId === `opn-${split.splitBillId}`;
                                return (
                                    <div key={split.splitBillId} style={{ padding: '1.1rem', background: 'rgba(15,23,42,0.4)', border: `1px solid ${isCompleted ? 'rgba(34,197,94,0.3)' : 'var(--border)'}`, borderRadius: '0.875rem' }}>
                                        <div onClick={() => setExpandedSplitId(isExpanded ? null : `opn-${split.splitBillId}`)} style={{ cursor: 'pointer' }}>
                                            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.3rem' }}>
                                                <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>{new Date(split.openedAt).toLocaleDateString()}</span>
                                                <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                                                    <span style={{ fontSize: '0.7rem', padding: '0.15rem 0.5rem', borderRadius: '1rem', background: isCompleted ? 'rgba(34,197,94,0.15)' : 'rgba(99,102,241,0.15)', color: isCompleted ? '#4ade80' : '#818cf8', fontWeight: '600' }}>
                                                        {isCompleted ? '정산 완료' : '진행 중'}
                                                    </span>
                                                    <span style={{ color: 'var(--text-muted)', fontSize: '0.7rem' }}>{isExpanded ? '▲' : '▼'}</span>
                                                </div>
                                            </div>
                                            <div style={{ fontSize: '1.05rem', fontWeight: '700', color: 'var(--text-main)', marginBottom: '0.5rem' }}>총 {split.totalAmount.toLocaleString()}원</div>
                                            <div style={{ display: 'flex', justifyContent: 'space-between', background: 'rgba(0,0,0,0.2)', padding: '0.5rem 0.75rem', borderRadius: '0.5rem', fontSize: '0.82rem' }}>
                                                <div><div style={{ color: 'var(--text-muted)', fontSize: '0.72rem' }}>회수 완료</div><div style={{ color: '#4ade80', fontWeight: '600' }}>{totalPaid.toLocaleString()}원</div></div>
                                                <div style={{ textAlign: 'right' }}><div style={{ color: 'var(--text-muted)', fontSize: '0.72rem' }}>남은 금액</div><div style={{ color: '#f87171', fontWeight: '600' }}>{totalUnPaid.toLocaleString()}원</div></div>
                                            </div>
                                        </div>
                                        {isExpanded && (
                                            <div style={{ marginTop: '0.8rem', borderTop: '1px solid rgba(255,255,255,0.07)', paddingTop: '0.8rem' }}>
                                                {split.paid.length > 0 && (
                                                    <div style={{ marginBottom: '0.5rem' }}>
                                                        <div style={{ fontSize: '0.72rem', color: '#4ade80', fontWeight: '600', marginBottom: '0.3rem' }}>✅ 결제 완료</div>
                                                        {split.paid.map(p => (
                                                            <div key={p.participant} style={{ display: 'flex', justifyContent: 'space-between', padding: '0.3rem 0.5rem', background: 'rgba(34,197,94,0.07)', borderRadius: '0.4rem', marginBottom: '0.25rem', fontSize: '0.8rem' }}>
                                                                <span style={{ color: 'var(--text-main)' }}>{p.participant}</span>
                                                                <div style={{ textAlign: 'right' }}><div style={{ color: '#4ade80' }}>{p.amount.toLocaleString()}원</div>{p.paidAt && <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>{new Date(p.paidAt).toLocaleString()}</div>}</div>
                                                            </div>
                                                        ))}
                                                    </div>
                                                )}
                                                {split.unPaid.length > 0 && (
                                                    <div>
                                                        <div style={{ fontSize: '0.72rem', color: '#f87171', fontWeight: '600', marginBottom: '0.3rem' }}>⏳ 미결제</div>
                                                        {split.unPaid.map(p => (
                                                            <div key={p.participant} style={{ display: 'flex', justifyContent: 'space-between', padding: '0.3rem 0.5rem', background: 'rgba(239,68,68,0.07)', borderRadius: '0.4rem', marginBottom: '0.25rem', fontSize: '0.8rem' }}>
                                                                <span style={{ color: 'var(--text-main)' }}>{p.participant}</span>
                                                                <span style={{ color: '#f87171' }}>{p.amount.toLocaleString()}원</span>
                                                            </div>
                                                        ))}
                                                    </div>
                                                )}
                                            </div>
                                        )}
                                    </div>
                                );
                            })}
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default Dashboard;
