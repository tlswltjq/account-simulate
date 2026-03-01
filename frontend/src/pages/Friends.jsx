import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { getFriends, getPendingRequests, sendFriendRequest, acceptFriendRequest } from '../api/friendshipApi';
import { getAccounts } from '../api/accountApi';
import { openEqualSplitBill, getRequestedSplitBills, getOpenedSplitBills, paySplitBill } from '../api/splitBillApi';
import Button from '../components/Button';

// ── 아바타 컴포넌트 ───────────────────────────────────────────────
const Avatar = ({ name, size = 48, gradient }) => {
    const gradients = [
        'linear-gradient(135deg, #6366f1, #818cf8)',
        'linear-gradient(135deg, #a855f7, #c084fc)',
        'linear-gradient(135deg, #ec4899, #f472b6)',
        'linear-gradient(135deg, #14b8a6, #5eead4)',
        'linear-gradient(135deg, #f59e0b, #fbbf24)',
        'linear-gradient(135deg, #22c55e, #4ade80)',
        'linear-gradient(135deg, #3b82f6, #60a5fa)',
        'linear-gradient(135deg, #ef4444, #f87171)',
    ];

    const index = name ? name.charCodeAt(0) % gradients.length : 0;
    const bg = gradient || gradients[index];
    const initial = name ? name.charAt(0).toUpperCase() : '?';

    return (
        <div style={{
            width: `${size}px`,
            height: `${size}px`,
            borderRadius: '50%',
            background: bg,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontSize: `${size * 0.4}px`,
            fontWeight: '700',
            color: 'white',
            flexShrink: 0,
            boxShadow: '0 4px 12px -2px rgba(0,0,0,0.3)',
        }}>
            {initial}
        </div>
    );
};

// ── 탭 버튼 ───────────────────────────────────────────────────────
const TabButton = ({ active, icon, label, count, onClick }) => (
    <button
        onClick={onClick}
        style={{
            flex: 1,
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            gap: '0.35rem',
            padding: '0.875rem 0.5rem',
            background: active ? 'rgba(99, 102, 241, 0.15)' : 'transparent',
            border: 'none',
            borderBottom: active ? '2px solid var(--primary)' : '2px solid transparent',
            color: active ? 'var(--primary)' : 'var(--text-muted)',
            cursor: 'pointer',
            transition: 'all 0.2s ease',
            fontSize: '0.8rem',
            fontWeight: active ? '700' : '500',
            position: 'relative',
        }}
    >
        <span style={{ fontSize: '1.1rem' }}>{icon}</span>
        <span>{label}</span>
        {count > 0 && (
            <span style={{
                position: 'absolute',
                top: '0.5rem',
                right: 'calc(50% - 1.5rem)',
                minWidth: '18px',
                height: '18px',
                padding: '0 5px',
                background: 'linear-gradient(135deg, #ef4444, #f87171)',
                borderRadius: '9px',
                fontSize: '0.65rem',
                fontWeight: '700',
                color: 'white',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                boxShadow: '0 2px 6px rgba(239, 68, 68, 0.4)',
            }}>
                {count}
            </span>
        )}
    </button>
);

// ── 친구 카드 ─────────────────────────────────────────────────────
const FriendCard = ({ username }) => (
    <div style={{
        display: 'flex',
        alignItems: 'center',
        gap: '1rem',
        padding: '1rem 1.25rem',
        background: 'rgba(15, 23, 42, 0.4)',
        border: '1px solid var(--border)',
        borderRadius: '0.875rem',
        transition: 'all 0.2s ease',
        cursor: 'default',
    }}
        onMouseEnter={(e) => {
            e.currentTarget.style.borderColor = 'rgba(99, 102, 241, 0.3)';
            e.currentTarget.style.transform = 'translateY(-2px)';
            e.currentTarget.style.boxShadow = '0 8px 25px -5px rgba(0, 0, 0, 0.3)';
        }}
        onMouseLeave={(e) => {
            e.currentTarget.style.borderColor = 'var(--border)';
            e.currentTarget.style.transform = 'translateY(0)';
            e.currentTarget.style.boxShadow = 'none';
        }}
    >
        <Avatar name={username} size={44} />
        <div style={{ flex: 1, minWidth: 0 }}>
            <div style={{
                fontSize: '0.95rem',
                fontWeight: '600',
                color: 'var(--text-main)',
                overflow: 'hidden',
                textOverflow: 'ellipsis',
                whiteSpace: 'nowrap',
            }}>
                {username}
            </div>
            <div style={{
                fontSize: '0.75rem',
                color: 'var(--text-muted)',
                marginTop: '0.15rem',
            }}>
                Mini Pay 회원
            </div>
        </div>
        <div style={{
            padding: '0.3rem 0.75rem',
            background: 'rgba(34, 197, 94, 0.12)',
            border: '1px solid rgba(34, 197, 94, 0.25)',
            borderRadius: '1rem',
            fontSize: '0.7rem',
            fontWeight: '600',
            color: '#4ade80',
        }}>
            친구
        </div>
    </div>
);

// ── 대기 중 요청 카드 ─────────────────────────────────────────────
const PendingCard = ({ request, currentUsername, onAccept, loading }) => {
    const isReceived = request.receiverUsername === currentUsername;
    const otherUser = isReceived ? request.requesterUsername : request.receiverUsername;

    return (
        <div style={{
            padding: '1.25rem',
            background: 'rgba(15, 23, 42, 0.4)',
            border: '1px solid var(--border)',
            borderRadius: '0.875rem',
            transition: 'all 0.2s ease',
        }}
            onMouseEnter={(e) => {
                e.currentTarget.style.borderColor = 'rgba(168, 85, 247, 0.3)';
                e.currentTarget.style.transform = 'translateY(-2px)';
                e.currentTarget.style.boxShadow = '0 8px 25px -5px rgba(0, 0, 0, 0.3)';
            }}
            onMouseLeave={(e) => {
                e.currentTarget.style.borderColor = 'var(--border)';
                e.currentTarget.style.transform = 'translateY(0)';
                e.currentTarget.style.boxShadow = 'none';
            }}
        >
            <div style={{
                display: 'flex',
                alignItems: 'center',
                gap: '1rem',
                marginBottom: isReceived ? '1rem' : 0,
            }}>
                <Avatar name={otherUser} size={48} />
                <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{
                        fontSize: '0.95rem',
                        fontWeight: '600',
                        color: 'var(--text-main)',
                    }}>
                        {otherUser}
                    </div>
                    <div style={{
                        fontSize: '0.75rem',
                        color: 'var(--text-muted)',
                        marginTop: '0.2rem',
                    }}>
                        {isReceived
                            ? '친구 요청을 보냈습니다'
                            : '수락 대기 중'}
                    </div>
                </div>
                {!isReceived && (
                    <div style={{
                        padding: '0.3rem 0.75rem',
                        background: 'rgba(245, 158, 11, 0.12)',
                        border: '1px solid rgba(245, 158, 11, 0.25)',
                        borderRadius: '1rem',
                        fontSize: '0.7rem',
                        fontWeight: '600',
                        color: '#fbbf24',
                    }}>
                        대기 중
                    </div>
                )}
            </div>

            {isReceived && (
                <div style={{ display: 'flex', gap: '0.5rem' }}>
                    <button
                        onClick={() => onAccept(request.id)}
                        disabled={loading}
                        style={{
                            flex: 1,
                            padding: '0.6rem',
                            background: 'linear-gradient(135deg, var(--primary), #a855f7)',
                            border: 'none',
                            borderRadius: '0.625rem',
                            color: 'white',
                            fontSize: '0.8rem',
                            fontWeight: '600',
                            cursor: loading ? 'not-allowed' : 'pointer',
                            opacity: loading ? 0.7 : 1,
                            transition: 'all 0.15s ease',
                            boxShadow: '0 4px 12px -2px rgba(99, 102, 241, 0.4)',
                        }}
                        onMouseEnter={(e) => { if (!loading) e.currentTarget.style.transform = 'translateY(-1px)'; }}
                        onMouseLeave={(e) => { e.currentTarget.style.transform = 'translateY(0)'; }}
                    >
                        {loading ? '처리 중...' : '수락'}
                    </button>
                </div>
            )}
        </div>
    );
};

// ── 빈 상태 ───────────────────────────────────────────────────────
const EmptyState = ({ icon, title, subtitle }) => (
    <div style={{
        textAlign: 'center',
        padding: '3rem 2rem',
    }}>
        <div style={{ fontSize: '3.5rem', marginBottom: '1rem', opacity: 0.5 }}>{icon}</div>
        <div style={{
            fontSize: '1rem',
            fontWeight: '600',
            color: 'var(--text-main)',
            marginBottom: '0.5rem',
        }}>
            {title}
        </div>
        <div style={{
            fontSize: '0.85rem',
            color: 'var(--text-muted)',
            lineHeight: '1.5',
        }}>
            {subtitle}
        </div>
    </div>
);

// ── 메인 Friends 페이지 ──────────────────────────────────────────
const Friends = () => {
    const { username } = useAuth();
    const navigate = useNavigate();
    const [activeTab, setActiveTab] = useState('friends');
    const [historySubTab, setHistorySubTab] = useState('requested'); // 'requested' | 'opened'
    const [friends, setFriends] = useState([]);
    const [pending, setPending] = useState([]);
    const [accounts, setAccounts] = useState([]); // 계좌 목록 상태 추가
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    // 친구 추가 폼 상태
    const [targetUsername, setTargetUsername] = useState('');
    const [sendLoading, setSendLoading] = useState(false);
    const [sendSuccess, setSendSuccess] = useState(false);
    const [sendError, setSendError] = useState(null);

    // 수락 로딩 상태
    const [acceptingId, setAcceptingId] = useState(null);

    // 정산(Split Bill) 관련 상태
    const [selectedFriends, setSelectedFriends] = useState([]);
    const [includeMe, setIncludeMe] = useState(true);
    const [splitAmount, setSplitAmount] = useState('');
    const [selectedAccount, setSelectedAccount] = useState('');
    const [splitLoading, setSplitLoading] = useState(false);
    const [splitSuccess, setSplitSuccess] = useState(false);
    const [splitError, setSplitError] = useState(null);

    // 정산 내역 상태
    const [requestedSplits, setRequestedSplits] = useState([]);
    const [openedSplits, setOpenedSplits] = useState([]);
    const [payLoadingId, setPayLoadingId] = useState(null);
    const [payAccountMap, setPayAccountMap] = useState({}); // { splitBillId: 'accountAddress' }

    const fetchData = async () => {
        try {
            setLoading(true);
            setError(null);
            const [friendsData, pendingData, accountsData, requestedData, openedData] = await Promise.all([
                getFriends(username),
                getPendingRequests(username),
                getAccounts(username),
                getRequestedSplitBills(username),
                getOpenedSplitBills(username),
            ]);
            setFriends(friendsData);
            setPending(pendingData);
            setAccounts(accountsData);
            setRequestedSplits(requestedData.details || []);
            setOpenedSplits(openedData.details || []);
        } catch (err) {
            setError(err.response?.data?.message || '데이터를 불러올 수 없습니다.');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        if (username) fetchData();
    }, [username]);

    const handleSendRequest = async () => {
        if (!targetUsername.trim()) {
            setSendError('username을 입력해주세요.');
            return;
        }
        if (targetUsername.trim() === username) {
            setSendError('자기 자신에게는 요청할 수 없습니다.');
            return;
        }
        setSendLoading(true);
        setSendError(null);
        try {
            await sendFriendRequest(username, targetUsername.trim());
            setSendSuccess(true);
            setTargetUsername('');
            fetchData();
            setTimeout(() => setSendSuccess(false), 3000);
        } catch (err) {
            setSendError(err.response?.data?.message || '친구 요청에 실패했습니다.');
        } finally {
            setSendLoading(false);
        }
    };

    const handleAccept = async (requestId) => {
        setAcceptingId(requestId);
        try {
            await acceptFriendRequest(requestId, username);
            fetchData();
        } catch (err) {
            setError(err.response?.data?.message || '수락에 실패했습니다.');
        } finally {
            setAcceptingId(null);
        }
    };

    const receivedRequests = pending.filter(p => p.receiverUsername === username);
    const generalAccounts = accounts.filter(a => a.accountType === 'GENERAL');

    // 친구 선택 토글
    const toggleFriendSelection = (friendUsername) => {
        setSelectedFriends(prev =>
            prev.includes(friendUsername)
                ? prev.filter(f => f !== friendUsername)
                : [...prev, friendUsername]
        );
    };

    // 정산 요청 핸들러
    const handleSplitRequest = async () => {
        if (!selectedAccount) {
            setSplitError('출금할 일반 계좌를 선택해주세요.');
            return;
        }
        if (selectedFriends.length === 0) {
            setSplitError('정산할 친구를 1명 이상 선택해주세요.');
            return;
        }
        const amount = Number(splitAmount);
        if (!amount || amount <= 0) {
            setSplitError('유효한 총 정산 금액을 입력해주세요.');
            return;
        }

        setSplitLoading(true);
        setSplitError(null);
        try {
            // 본인 포함 옵션에 따른 participants 배열 구성
            const participants = includeMe ? [...selectedFriends, username] : [...selectedFriends];

            await openEqualSplitBill(username, selectedAccount, amount, participants);

            setSplitSuccess(true);
            setTimeout(() => setSplitSuccess(false), 3000);

            // 폼 초기화
            setSelectedFriends([]);
            setIncludeMe(true);
            setSplitAmount('');
            setSelectedAccount('');
        } catch (err) {
            setSplitError(err.response?.data?.message || '정산 요청에 실패했습니다.');
        } finally {
            setSplitLoading(false);
        }
    };

    // 정산 결제 핸들러
    const handlePaySplit = async (splitBillId) => {
        const payAccountAddress = payAccountMap[splitBillId];
        if (!payAccountAddress) {
            setError(`결제할 출금 계좌를 선택해주세요 (ID: ${splitBillId})`);
            return;
        }

        setPayLoadingId(splitBillId);
        setError(null);
        try {
            await paySplitBill(splitBillId, username, payAccountAddress);
            // 성공 시 데이터 재조회
            await fetchData();
            // 계좌 선택 초기화
            setPayAccountMap(prev => {
                const newMap = { ...prev };
                delete newMap[splitBillId];
                return newMap;
            });
        } catch (err) {
            setError(err.response?.data?.message || '결제 처리에 실패했습니다.');
        } finally {
            setPayLoadingId(null);
        }
    };

    return (
        <div className="animate-fade-in" style={{ maxWidth: '680px', margin: '0 auto', width: '100%' }}>

            {/* ── 헤더 ─────────────────────────────────────────── */}
            <div style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                marginBottom: '1.5rem',
                padding: '0 0.5rem',
            }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                    <button
                        onClick={() => navigate('/dashboard')}
                        style={{
                            background: 'rgba(255,255,255,0.08)',
                            border: '1px solid rgba(255,255,255,0.12)',
                            borderRadius: '0.5rem',
                            color: 'var(--text-main)',
                            padding: '0.5rem 0.75rem',
                            cursor: 'pointer',
                            fontSize: '1rem',
                            transition: 'all 0.2s ease',
                        }}
                        onMouseEnter={(e) => e.currentTarget.style.background = 'rgba(255,255,255,0.15)'}
                        onMouseLeave={(e) => e.currentTarget.style.background = 'rgba(255,255,255,0.08)'}
                    >
                        ← 뒤로
                    </button>
                    <span style={{ fontSize: '1.25rem', fontWeight: '700', color: 'var(--text-main)' }}>
                        네트워크
                    </span>
                </div>
                <div style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '0.5rem',
                    padding: '0.4rem 0.9rem',
                    background: 'rgba(99, 102, 241, 0.1)',
                    border: '1px solid rgba(99, 102, 241, 0.2)',
                    borderRadius: '1rem',
                    fontSize: '0.8rem',
                    color: 'var(--primary)',
                    fontWeight: '600',
                }}>
                    👥 {friends.length}명의 친구
                </div>
            </div>

            {/* ── 프로필 배너 ────────────────────────────────────── */}
            <div className="glass-panel" style={{
                marginBottom: '1rem',
                position: 'relative',
                overflow: 'hidden',
                padding: 0,
            }}>
                {/* 배경 그라디언트 배너 */}
                <div style={{
                    height: '80px',
                    background: 'linear-gradient(135deg, #6366f1, #a855f7, #ec4899)',
                    borderRadius: '1rem 1rem 0 0',
                }} />
                <div style={{
                    padding: '0 1.5rem 1.5rem',
                    marginTop: '-30px',
                    display: 'flex',
                    alignItems: 'flex-end',
                    gap: '1rem',
                }}>
                    <Avatar name={username} size={60} gradient="linear-gradient(135deg, var(--primary), var(--primary-hover))" />
                    <div style={{ paddingBottom: '0.25rem' }}>
                        <div style={{
                            fontSize: '1.1rem',
                            fontWeight: '700',
                            color: 'var(--text-main)',
                        }}>
                            {username}
                        </div>
                        <div style={{
                            fontSize: '0.8rem',
                            color: 'var(--text-muted)',
                        }}>
                            Mini Pay 회원 · 친구 {friends.length}명
                        </div>
                    </div>
                </div>
            </div>

            {/* ── 탭 네비게이션 ──────────────────────────────────── */}
            <div className="glass-panel" style={{
                padding: 0,
                marginBottom: '1rem',
                overflow: 'hidden',
            }}>
                <div style={{
                    display: 'flex',
                    borderBottom: '1px solid var(--border)',
                }}>
                    <TabButton
                        active={activeTab === 'friends'}
                        icon="👥"
                        label="내 친구"
                        count={0}
                        onClick={() => setActiveTab('friends')}
                    />
                    <TabButton
                        active={activeTab === 'pending'}
                        icon="🔔"
                        label="받은 요청"
                        count={receivedRequests.length}
                        onClick={() => setActiveTab('pending')}
                    />
                    <TabButton
                        active={activeTab === 'add'}
                        icon="➕"
                        label="친구 추가"
                        count={0}
                        onClick={() => setActiveTab('add')}
                    />
                    <TabButton
                        active={activeTab === 'split'}
                        icon="💸"
                        label="정산하기"
                        count={0}
                        onClick={() => setActiveTab('split')}
                    />
                    <TabButton
                        active={activeTab === 'history'}
                        icon="📜"
                        label="정산 내역"
                        count={requestedSplits.filter(s => s.status !== 'PAID').length}
                        onClick={() => setActiveTab('history')}
                    />
                </div>

                {/* ── 탭 콘텐츠 ──────────────────────────────────── */}
                <div style={{ padding: '1.25rem' }}>

                    {/* 로딩 */}
                    {loading && (activeTab === 'friends' || activeTab === 'pending') && (
                        <div style={{ textAlign: 'center', padding: '2rem' }}>
                            <div className="loading-spinner" />
                            <p style={{ marginTop: '1rem', color: 'var(--text-muted)', fontSize: '0.875rem' }}>
                                불러오는 중...
                            </p>
                        </div>
                    )}

                    {/* 에러 */}
                    {!loading && error && (
                        <div className="error-alert" style={{ justifyContent: 'center' }}>
                            ⚠️&nbsp; {error}
                        </div>
                    )}

                    {/* ── 내 친구 탭 ──────────────────────────────── */}
                    {activeTab === 'friends' && !loading && !error && (
                        <>
                            {friends.length === 0 ? (
                                <EmptyState
                                    icon="🤝"
                                    title="아직 친구가 없습니다"
                                    subtitle="'친구 추가' 탭에서 상대의 username을 입력하여 친구 요청을 보내보세요!"
                                />
                            ) : (
                                <div style={{
                                    display: 'flex',
                                    flexDirection: 'column',
                                    gap: '0.625rem',
                                }}>
                                    {friends.map((friendUsername) => (
                                        <FriendCard key={friendUsername} username={friendUsername} />
                                    ))}
                                </div>
                            )}
                        </>
                    )}

                    {/* ── 받은 요청 탭 ────────────────────────────── */}
                    {activeTab === 'pending' && !loading && !error && (
                        <>
                            {pending.length === 0 ? (
                                <EmptyState
                                    icon="📭"
                                    title="대기 중인 요청이 없습니다"
                                    subtitle="새로운 친구 요청이 오면 여기에 표시됩니다."
                                />
                            ) : (
                                <div style={{
                                    display: 'flex',
                                    flexDirection: 'column',
                                    gap: '0.625rem',
                                }}>
                                    {pending.map((req) => (
                                        <PendingCard
                                            key={req.id}
                                            request={req}
                                            currentUsername={username}
                                            onAccept={handleAccept}
                                            loading={acceptingId === req.id}
                                        />
                                    ))}
                                </div>
                            )}
                        </>
                    )}

                    {/* ── 친구 추가 탭 ────────────────────────────── */}
                    {activeTab === 'add' && (
                        <div style={{ maxWidth: '400px', margin: '0 auto' }}>
                            <div style={{
                                textAlign: 'center',
                                marginBottom: '1.5rem',
                            }}>
                                <div style={{ fontSize: '2.5rem', marginBottom: '0.75rem' }}>🔍</div>
                                <div style={{
                                    fontSize: '1rem',
                                    fontWeight: '600',
                                    color: 'var(--text-main)',
                                    marginBottom: '0.35rem',
                                }}>
                                    친구를 추가하세요
                                </div>
                                <div style={{
                                    fontSize: '0.8rem',
                                    color: 'var(--text-muted)',
                                }}>
                                    상대방의 username을 입력하면 친구 요청을 보낼 수 있습니다.
                                </div>
                            </div>

                            {/* 성공 알림 */}
                            {sendSuccess && (
                                <div style={{
                                    marginBottom: '1rem',
                                    padding: '0.75rem 1rem',
                                    background: 'rgba(34, 197, 94, 0.15)',
                                    border: '1px solid rgba(34, 197, 94, 0.3)',
                                    borderRadius: '0.75rem',
                                    color: '#4ade80',
                                    fontSize: '0.85rem',
                                    fontWeight: '500',
                                    textAlign: 'center',
                                }}>
                                    ✅ 친구 요청을 보냈습니다!
                                </div>
                            )}

                            {/* 입력 필드 */}
                            <div style={{
                                display: 'flex',
                                gap: '0.5rem',
                                marginBottom: '0.75rem',
                            }}>
                                <div style={{ flex: 1, position: 'relative' }}>
                                    <span style={{
                                        position: 'absolute',
                                        left: '0.75rem',
                                        top: '50%',
                                        transform: 'translateY(-50%)',
                                        fontSize: '1rem',
                                        pointerEvents: 'none',
                                    }}>@</span>
                                    <input
                                        type="text"
                                        value={targetUsername}
                                        onChange={(e) => { setTargetUsername(e.target.value); setSendError(null); }}
                                        placeholder="username 입력"
                                        style={{
                                            width: '100%',
                                            padding: '0.75rem 1rem 0.75rem 2rem',
                                            background: 'rgba(255, 255, 255, 0.06)',
                                            border: '1px solid var(--border)',
                                            borderRadius: '0.75rem',
                                            color: 'var(--text-main)',
                                            fontSize: '0.9rem',
                                            boxSizing: 'border-box',
                                            outline: 'none',
                                            transition: 'border-color 0.2s ease',
                                        }}
                                        onFocus={(e) => e.target.style.borderColor = 'var(--primary)'}
                                        onBlur={(e) => e.target.style.borderColor = 'var(--border)'}
                                        onKeyDown={(e) => e.key === 'Enter' && handleSendRequest()}
                                    />
                                </div>
                                <Button
                                    onClick={handleSendRequest}
                                    loading={sendLoading}
                                    disabled={!targetUsername.trim() || sendLoading}
                                    style={{
                                        maxWidth: '100px',
                                        padding: '0.75rem 1rem',
                                        fontSize: '0.85rem',
                                        borderRadius: '0.75rem',
                                    }}
                                >
                                    요청
                                </Button>
                            </div>

                            {/* 에러 */}
                            {sendError && (
                                <div className="error-alert">
                                    {sendError}
                                </div>
                            )}
                        </div>
                    )}

                    {/* ── 정산하기 탭 ────────────────────────────── */}
                    {activeTab === 'split' && (
                        <div style={{ maxWidth: '440px', margin: '0 auto' }}>
                            <div style={{
                                textAlign: 'center',
                                marginBottom: '1.5rem',
                            }}>
                                <div style={{ fontSize: '2.5rem', marginBottom: '0.75rem' }}>💸</div>
                                <div style={{
                                    fontSize: '1rem',
                                    fontWeight: '600',
                                    color: 'var(--text-main)',
                                    marginBottom: '0.35rem',
                                }}>
                                    친구와 정산하기
                                </div>
                                <div style={{
                                    fontSize: '0.8rem',
                                    color: 'var(--text-muted)',
                                }}>
                                    정산할 대상을 선택하고 금액을 나누거나 청구하세요.
                                </div>
                            </div>

                            {/* 성공 알림 */}
                            {splitSuccess && (
                                <div style={{
                                    marginBottom: '1rem',
                                    padding: '0.75rem 1rem',
                                    background: 'rgba(34, 197, 94, 0.15)',
                                    border: '1px solid rgba(34, 197, 94, 0.3)',
                                    borderRadius: '0.75rem',
                                    color: '#4ade80',
                                    fontSize: '0.85rem',
                                    fontWeight: '500',
                                    textAlign: 'center',
                                }}>
                                    ✅ 정산 요청을 생성했습니다!
                                </div>
                            )}

                            {friends.length === 0 ? (
                                <div className="error-alert" style={{ textAlign: 'center' }}>
                                    정산할 친구가 없습니다. 먼저 친구를 추가해주세요.
                                </div>
                            ) : (
                                <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>

                                    {/* 출금 계좌 선택 */}
                                    <div>
                                        <label style={{ display: 'block', fontSize: '0.85rem', color: 'var(--text-muted)', marginBottom: '0.5rem', fontWeight: '600' }}>
                                            내 출금 계좌 선택
                                        </label>
                                        <select
                                            value={selectedAccount}
                                            onChange={(e) => setSelectedAccount(e.target.value)}
                                            style={{
                                                width: '100%',
                                                padding: '0.75rem 1rem',
                                                background: 'rgba(255, 255, 255, 0.06)',
                                                border: '1px solid var(--border)',
                                                borderRadius: '0.75rem',
                                                color: 'var(--text-main)',
                                                fontSize: '0.9rem',
                                                outline: 'none',
                                            }}
                                        >
                                            <option value="" disabled>사용할 일반 계좌를 선택하세요</option>
                                            {generalAccounts.map(acc => (
                                                <option key={acc.accountAddress} value={acc.accountAddress}>
                                                    💰 {acc.accountAddress.slice(0, 10)}... (잔액: {acc.balance.toLocaleString()}원)
                                                </option>
                                            ))}
                                        </select>
                                    </div>

                                    {/* 정산 대상 (친구) 선택 */}
                                    <div>
                                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.5rem' }}>
                                            <label style={{ fontSize: '0.85rem', color: 'var(--text-muted)', fontWeight: '600' }}>
                                                정산할 대상 선택 ({selectedFriends.length}명)
                                            </label>
                                            <label style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', fontSize: '0.8rem', color: 'var(--text-main)', cursor: 'pointer' }}>
                                                <input
                                                    type="checkbox"
                                                    checked={includeMe}
                                                    onChange={(e) => setIncludeMe(e.target.checked)}
                                                    style={{ cursor: 'pointer' }}
                                                />
                                                나 포함해서 1/N
                                            </label>
                                        </div>
                                        <div style={{
                                            display: 'flex',
                                            flexDirection: 'column',
                                            gap: '0.5rem',
                                            maxHeight: '200px',
                                            overflowY: 'auto',
                                            padding: '0.5rem',
                                            background: 'rgba(0, 0, 0, 0.15)',
                                            borderRadius: '0.75rem',
                                            border: '1px solid var(--border)'
                                        }}>
                                            {friends.map(friendUsername => (
                                                <label
                                                    key={friendUsername}
                                                    style={{
                                                        display: 'flex',
                                                        alignItems: 'center',
                                                        gap: '0.75rem',
                                                        padding: '0.65rem 1rem',
                                                        background: selectedFriends.includes(friendUsername) ? 'rgba(99, 102, 241, 0.15)' : 'rgba(255, 255, 255, 0.05)',
                                                        border: `1px solid ${selectedFriends.includes(friendUsername) ? 'var(--primary)' : 'rgba(255, 255, 255, 0.08)'}`,
                                                        borderRadius: '0.5rem',
                                                        cursor: 'pointer',
                                                        transition: 'all 0.2s',
                                                    }}
                                                >
                                                    <input
                                                        type="checkbox"
                                                        checked={selectedFriends.includes(friendUsername)}
                                                        onChange={() => toggleFriendSelection(friendUsername)}
                                                        style={{ cursor: 'pointer' }}
                                                    />
                                                    <span style={{ fontSize: '0.9rem', color: 'var(--text-main)', fontWeight: '500' }}>
                                                        {friendUsername}
                                                    </span>
                                                </label>
                                            ))}
                                        </div>
                                    </div>

                                    {/* 총 금액 입력 */}
                                    <div>
                                        <label style={{ display: 'block', fontSize: '0.85rem', color: 'var(--text-muted)', marginBottom: '0.5rem', fontWeight: '600' }}>
                                            총 정산 금액 (원)
                                        </label>
                                        <input
                                            type="number"
                                            value={splitAmount}
                                            onChange={(e) => setSplitAmount(e.target.value)}
                                            placeholder="예: 50000"
                                            min="0"
                                            style={{
                                                width: '100%',
                                                padding: '0.75rem 1rem',
                                                background: 'rgba(255, 255, 255, 0.06)',
                                                border: '1px solid var(--border)',
                                                borderRadius: '0.75rem',
                                                color: 'var(--text-main)',
                                                fontSize: '0.9rem',
                                                boxSizing: 'border-box',
                                                outline: 'none',
                                            }}
                                            onFocus={(e) => e.target.style.borderColor = 'var(--primary)'}
                                            onBlur={(e) => e.target.style.borderColor = 'var(--border)'}
                                        />
                                    </div>

                                    {/* 금액 요약 */}
                                    {selectedFriends.length > 0 && splitAmount > 0 && (
                                        <div style={{
                                            padding: '1rem',
                                            background: 'rgba(99, 102, 241, 0.1)',
                                            borderRadius: '0.75rem',
                                            border: '1px solid rgba(99, 102, 241, 0.2)',
                                            fontSize: '0.85rem',
                                            color: 'var(--text-main)',
                                            display: 'flex',
                                            justifyContent: 'space-between',
                                            alignItems: 'center'
                                        }}>
                                            <span>
                                                총 인원 {includeMe ? selectedFriends.length + 1 : selectedFriends.length}명 (1인당)
                                            </span>
                                            <span style={{ fontWeight: '700', fontSize: '1rem', color: 'var(--primary)' }}>
                                                {Math.floor(splitAmount / (includeMe ? selectedFriends.length + 1 : selectedFriends.length)).toLocaleString()} 원
                                            </span>
                                        </div>
                                    )}

                                    {/* 에러 표시 */}
                                    {splitError && (
                                        <div className="error-alert">
                                            {splitError}
                                        </div>
                                    )}

                                    {/* 정산 버튼 */}
                                    <Button
                                        onClick={handleSplitRequest}
                                        loading={splitLoading}
                                        disabled={splitLoading || selectedFriends.length === 0 || !selectedAccount || !splitAmount || splitAmount <= 0}
                                        style={{
                                            width: '100%',
                                            padding: '0.85rem',
                                            marginTop: '0.5rem',
                                            fontSize: '0.95rem',
                                            fontWeight: '600'
                                        }}
                                    >
                                        정산 요청하기
                                    </Button>

                                </div>
                            )}
                        </div>
                    )}

                    {/* ── 정산 내역 탭 ──────────────────────────────── */}
                    {activeTab === 'history' && (
                        <div style={{ maxWidth: '600px', margin: '0 auto' }}>
                            <div style={{ display: 'flex', gap: '1rem', marginBottom: '1.5rem', borderBottom: '1px solid var(--border)', paddingBottom: '0.5rem' }}>
                                <button
                                    onClick={() => setHistorySubTab('requested')}
                                    style={{
                                        background: 'none',
                                        border: 'none',
                                        color: historySubTab === 'requested' ? 'var(--primary)' : 'var(--text-muted)',
                                        fontWeight: historySubTab === 'requested' ? '700' : '500',
                                        fontSize: '0.95rem',
                                        cursor: 'pointer',
                                        padding: '0.5rem',
                                    }}
                                >
                                    받은 정산 {requestedSplits.filter(s => s.status !== 'PAID').length > 0 && <span style={{ color: '#ef4444' }}>•</span>}
                                </button>
                                <button
                                    onClick={() => setHistorySubTab('opened')}
                                    style={{
                                        background: 'none',
                                        border: 'none',
                                        color: historySubTab === 'opened' ? 'var(--primary)' : 'var(--text-muted)',
                                        fontWeight: historySubTab === 'opened' ? '700' : '500',
                                        fontSize: '0.95rem',
                                        cursor: 'pointer',
                                        padding: '0.5rem',
                                    }}
                                >
                                    내가 연 정산
                                </button>
                            </div>

                            {/* 받은 정산 리스트 */}
                            {historySubTab === 'requested' && (
                                <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                                    {requestedSplits.length === 0 ? (
                                        <EmptyState
                                            icon="🍃"
                                            title="받은 정산이 없습니다"
                                            subtitle="아직 결제 요청을 받은 내역이 없습니다."
                                        />
                                    ) : (
                                        requestedSplits.map(split => {
                                            const isPaid = split.status === 'PAID';
                                            return (
                                                <div key={split.splitBillId} style={{
                                                    padding: '1.25rem',
                                                    background: 'rgba(15, 23, 42, 0.4)',
                                                    border: `1px solid ${isPaid ? 'rgba(34, 197, 94, 0.3)' : 'rgba(239, 68, 68, 0.3)'}`,
                                                    borderRadius: '0.875rem',
                                                }}>
                                                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.5rem' }}>
                                                        <span style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>
                                                            {new Date(split.openedAt).toLocaleDateString()}
                                                        </span>
                                                        <span style={{
                                                            fontSize: '0.75rem',
                                                            padding: '0.2rem 0.6rem',
                                                            borderRadius: '1rem',
                                                            background: isPaid ? 'rgba(34, 197, 94, 0.15)' : 'rgba(239, 68, 68, 0.15)',
                                                            color: isPaid ? '#4ade80' : '#f87171',
                                                            fontWeight: '600'
                                                        }}>
                                                            {isPaid ? '결제 완료' : '결제 필요'}
                                                        </span>
                                                    </div>
                                                    <div style={{ fontSize: '1.1rem', fontWeight: '700', color: 'var(--text-main)', marginBottom: '0.25rem' }}>
                                                        총 {split.totalAmount.toLocaleString()}원 정산
                                                    </div>
                                                    <div style={{ fontSize: '0.9rem', color: 'var(--text-muted)', marginBottom: isPaid ? '0' : '1rem' }}>
                                                        내가 내야할 금액: <span style={{ color: isPaid ? '#4ade80' : '#f87171', fontWeight: '700' }}>{split.unPaid.toLocaleString()}원</span>
                                                    </div>

                                                    {!isPaid && (
                                                        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem', marginTop: '1rem', borderTop: '1px solid rgba(255,255,255,0.05)', paddingTop: '1rem' }}>
                                                            <select
                                                                value={payAccountMap[split.splitBillId] || ''}
                                                                onChange={(e) => setPayAccountMap(prev => ({ ...prev, [split.splitBillId]: e.target.value }))}
                                                                style={{
                                                                    width: '100%',
                                                                    padding: '0.6rem',
                                                                    background: 'rgba(255, 255, 255, 0.05)',
                                                                    border: '1px solid var(--border)',
                                                                    borderRadius: '0.5rem',
                                                                    color: 'var(--text-main)',
                                                                    fontSize: '0.85rem',
                                                                    outline: 'none',
                                                                }}
                                                            >
                                                                <option value="" disabled>출금할 계좌를 선택하세요</option>
                                                                {generalAccounts.map(acc => (
                                                                    <option key={acc.accountAddress} value={acc.accountAddress}>
                                                                        💰 잔액: {acc.balance.toLocaleString()}원 ({acc.accountAddress.slice(0, 8)}...)
                                                                    </option>
                                                                ))}
                                                            </select>
                                                            <Button
                                                                onClick={() => handlePaySplit(split.splitBillId)}
                                                                loading={payLoadingId === split.splitBillId}
                                                                disabled={!payAccountMap[split.splitBillId] || payLoadingId === split.splitBillId}
                                                                style={{
                                                                    padding: '0.6rem',
                                                                    fontSize: '0.85rem',
                                                                    background: 'linear-gradient(135deg, #ef4444, #f87171)',
                                                                    border: 'none',
                                                                }}
                                                            >
                                                                결제(송금)하기
                                                            </Button>
                                                        </div>
                                                    )}
                                                </div>
                                            );
                                        })
                                    )}
                                </div>
                            )}

                            {/* 내가 연 정산 리스트 */}
                            {historySubTab === 'opened' && (
                                <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                                    {openedSplits.length === 0 ? (
                                        <EmptyState
                                            icon="🌱"
                                            title="내가 연 정산이 없습니다"
                                            subtitle="'정산하기' 탭에서 새로운 정산을 시작해보세요."
                                        />
                                    ) : (
                                        openedSplits.map(split => {
                                            const isCompleted = split.unPaid === 0 || split.status === 'COMPLETED';
                                            return (
                                                <div key={split.splitBillId} style={{
                                                    padding: '1.25rem',
                                                    background: 'rgba(15, 23, 42, 0.4)',
                                                    border: `1px solid ${isCompleted ? 'rgba(34, 197, 94, 0.3)' : 'var(--border)'}`,
                                                    borderRadius: '0.875rem',
                                                }}>
                                                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.75rem' }}>
                                                        <span style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>
                                                            {new Date(split.openedAt).toLocaleDateString()}
                                                        </span>
                                                        <span style={{
                                                            fontSize: '0.75rem',
                                                            padding: '0.2rem 0.6rem',
                                                            borderRadius: '1rem',
                                                            background: isCompleted ? 'rgba(34, 197, 94, 0.15)' : 'rgba(99, 102, 241, 0.15)',
                                                            color: isCompleted ? '#4ade80' : '#818cf8',
                                                            fontWeight: '600'
                                                        }}>
                                                            {isCompleted ? '정산 완료' : '진행 중'}
                                                        </span>
                                                    </div>
                                                    <div style={{ fontSize: '1.15rem', fontWeight: '700', color: 'var(--text-main)', marginBottom: '0.75rem' }}>
                                                        총 {split.totalAmount.toLocaleString()}원
                                                    </div>
                                                    <div style={{
                                                        display: 'flex',
                                                        justifyContent: 'space-between',
                                                        background: 'rgba(0,0,0,0.2)',
                                                        padding: '0.75rem',
                                                        borderRadius: '0.5rem',
                                                        fontSize: '0.85rem'
                                                    }}>
                                                        <div>
                                                            <div style={{ color: 'var(--text-muted)', marginBottom: '0.2rem' }}>회수 완료</div>
                                                            <div style={{ color: '#4ade80', fontWeight: '600' }}>{split.paid.toLocaleString()}원</div>
                                                        </div>
                                                        <div style={{ textAlign: 'right' }}>
                                                            <div style={{ color: 'var(--text-muted)', marginBottom: '0.2rem' }}>남은 금액</div>
                                                            <div style={{ color: '#f87171', fontWeight: '600' }}>{split.unPaid.toLocaleString()}원</div>
                                                        </div>
                                                    </div>
                                                </div>
                                            );
                                        })
                                    )}
                                </div>
                            )}
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default Friends;
