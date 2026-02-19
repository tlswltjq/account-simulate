import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { getAccountDetail, getAccounts } from '../api/accountApi';
import { chargeAccount, depositToSaving, transferBetweenAccounts } from '../api/transferApi';
import { useAuth } from '../context/AuthContext';
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

// ── 충전 모달 ─────────────────────────────────────────────────────
const ChargeModal = ({ accountAddress, onClose, onCharged }) => {
    const [amount, setAmount] = useState('');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);

    const QUICK_AMOUNTS = [10000, 50000, 100000, 500000];

    const handleCharge = async () => {
        const parsed = parseInt(amount.replace(/,/g, ''), 10);
        if (!parsed || parsed <= 0) {
            setError('올바른 금액을 입력해주세요.');
            return;
        }
        setLoading(true);
        setError(null);
        try {
            await chargeAccount(accountAddress, parsed);
            onCharged();
        } catch (err) {
            setError(err.response?.data?.message || '충전에 실패했습니다.');
            setLoading(false);
        }
    };

    const handleAmountChange = (e) => {
        const raw = e.target.value.replace(/[^0-9]/g, '');
        setAmount(raw ? parseInt(raw, 10).toLocaleString() : '');
    };

    return (
        <div
            style={{
                position: 'fixed',
                inset: 0,
                background: 'rgba(0,0,0,0.6)',
                backdropFilter: 'blur(4px)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                zIndex: 1000,
                padding: '1rem',
            }}
            onClick={onClose}
        >
            <div
                style={{
                    background: 'var(--surface)',
                    border: '1px solid var(--border)',
                    borderRadius: '1.25rem',
                    padding: '2rem',
                    width: '100%',
                    maxWidth: '400px',
                    boxShadow: '0 24px 48px -12px rgba(0,0,0,0.5)',
                }}
                onClick={(e) => e.stopPropagation()}
            >
                <h3 style={{ margin: '0 0 1.5rem 0', fontSize: '1.125rem', fontWeight: '700', color: 'var(--text-main)', textAlign: 'center' }}>
                    💰 계좌 충전
                </h3>

                {/* 빠른 금액 선택 */}
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.5rem', marginBottom: '1rem' }}>
                    {QUICK_AMOUNTS.map((v) => (
                        <button
                            key={v}
                            onClick={() => setAmount(v.toLocaleString())}
                            style={{
                                padding: '0.6rem',
                                background: amount === v.toLocaleString() ? 'rgba(99,102,241,0.25)' : 'rgba(255,255,255,0.05)',
                                border: `1px solid ${amount === v.toLocaleString() ? 'var(--primary)' : 'var(--border)'}`,
                                borderRadius: '0.625rem',
                                color: amount === v.toLocaleString() ? 'var(--primary)' : 'var(--text-muted)',
                                fontSize: '0.8rem',
                                fontWeight: '600',
                                cursor: 'pointer',
                                transition: 'all 0.15s ease',
                            }}
                        >
                            +{v.toLocaleString()}원
                        </button>
                    ))}
                </div>

                {/* 직접 입력 */}
                <div style={{ position: 'relative', marginBottom: '1rem' }}>
                    <span style={{
                        position: 'absolute',
                        left: '1rem',
                        top: '50%',
                        transform: 'translateY(-50%)',
                        color: 'var(--text-muted)',
                        fontSize: '1rem',
                        fontWeight: '600',
                        pointerEvents: 'none',
                    }}>₩</span>
                    <input
                        type="text"
                        value={amount}
                        onChange={handleAmountChange}
                        placeholder="직접 입력"
                        style={{
                            width: '100%',
                            padding: '0.75rem 1rem 0.75rem 2.25rem',
                            background: 'rgba(255,255,255,0.06)',
                            border: '1px solid var(--border)',
                            borderRadius: '0.75rem',
                            color: 'var(--text-main)',
                            fontSize: '1rem',
                            fontWeight: '600',
                            boxSizing: 'border-box',
                            outline: 'none',
                        }}
                        onFocus={(e) => e.target.style.borderColor = 'var(--primary)'}
                        onBlur={(e) => e.target.style.borderColor = 'var(--border)'}
                        onKeyDown={(e) => e.key === 'Enter' && handleCharge()}
                    />
                </div>

                {error && <div className="error-alert" style={{ marginBottom: '1rem' }}>{error}</div>}

                <div style={{ display: 'flex', gap: '0.75rem' }}>
                    <button
                        onClick={onClose}
                        disabled={loading}
                        style={{
                            flex: 1,
                            padding: '0.75rem',
                            background: 'rgba(255,255,255,0.06)',
                            border: '1px solid var(--border)',
                            borderRadius: '0.75rem',
                            color: 'var(--text-muted)',
                            cursor: loading ? 'not-allowed' : 'pointer',
                            fontSize: '0.875rem',
                        }}
                    >
                        취소
                    </button>
                    <Button
                        onClick={handleCharge}
                        disabled={!amount || loading}
                        style={{ flex: 2 }}
                    >
                        {loading ? '충전 중...' : '충전하기'}
                    </Button>
                </div>
            </div>
        </div>
    );
};

// ── 적금 입금 모달 ────────────────────────────────────────────────
const SavingDepositModal = ({ savingAccountAddress, onClose, onDeposited }) => {
    const [amount, setAmount] = useState('');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);

    const QUICK_AMOUNTS = [10000, 50000, 100000, 500000];

    const handleDeposit = async () => {
        const parsed = parseInt(amount.replace(/,/g, ''), 10);
        if (!parsed || parsed <= 0) {
            setError('올바른 금액을 입력해주세요.');
            return;
        }
        setLoading(true);
        setError(null);
        try {
            await depositToSaving(savingAccountAddress, parsed);
            onDeposited();
        } catch (err) {
            setError(err.response?.data?.message || '입금에 실패했습니다.');
            setLoading(false);
        }
    };

    const handleAmountChange = (e) => {
        const raw = e.target.value.replace(/[^0-9]/g, '');
        setAmount(raw ? parseInt(raw, 10).toLocaleString() : '');
    };

    return (
        <div
            style={{
                position: 'fixed',
                inset: 0,
                background: 'rgba(0,0,0,0.6)',
                backdropFilter: 'blur(4px)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                zIndex: 1000,
                padding: '1rem',
            }}
            onClick={onClose}
        >
            <div
                style={{
                    background: 'var(--surface)',
                    border: '1px solid var(--border)',
                    borderRadius: '1.25rem',
                    padding: '2rem',
                    width: '100%',
                    maxWidth: '400px',
                    boxShadow: '0 24px 48px -12px rgba(0,0,0,0.5)',
                }}
                onClick={(e) => e.stopPropagation()}
            >
                <h3 style={{ margin: '0 0 1.5rem 0', fontSize: '1.125rem', fontWeight: '700', color: 'var(--text-main)', textAlign: 'center' }}>
                    🏦 적금 입금
                </h3>

                <p style={{ margin: '0 0 1rem 0', fontSize: '0.85rem', color: 'var(--text-muted)', textAlign: 'center' }}>
                    연결된 일반 계좌에서 적금으로 이체됩니다.
                </p>

                {/* 빠른 금액 선택 */}
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.5rem', marginBottom: '1rem' }}>
                    {QUICK_AMOUNTS.map((v) => (
                        <button
                            key={v}
                            onClick={() => setAmount(v.toLocaleString())}
                            style={{
                                padding: '0.6rem',
                                background: amount === v.toLocaleString() ? 'rgba(168,85,247,0.25)' : 'rgba(255,255,255,0.05)',
                                border: `1px solid ${amount === v.toLocaleString() ? '#a855f7' : 'var(--border)'}`,
                                borderRadius: '0.625rem',
                                color: amount === v.toLocaleString() ? '#a855f7' : 'var(--text-muted)',
                                fontSize: '0.8rem',
                                fontWeight: '600',
                                cursor: 'pointer',
                                transition: 'all 0.15s ease',
                            }}
                        >
                            +{v.toLocaleString()}원
                        </button>
                    ))}
                </div>

                {/* 직접 입력 */}
                <div style={{ position: 'relative', marginBottom: '1rem' }}>
                    <span style={{
                        position: 'absolute',
                        left: '1rem',
                        top: '50%',
                        transform: 'translateY(-50%)',
                        color: 'var(--text-muted)',
                        fontSize: '1rem',
                        fontWeight: '600',
                        pointerEvents: 'none',
                    }}>₩</span>
                    <input
                        type="text"
                        value={amount}
                        onChange={handleAmountChange}
                        placeholder="직접 입력"
                        style={{
                            width: '100%',
                            padding: '0.75rem 1rem 0.75rem 2.25rem',
                            background: 'rgba(255,255,255,0.06)',
                            border: '1px solid var(--border)',
                            borderRadius: '0.75rem',
                            color: 'var(--text-main)',
                            fontSize: '1rem',
                            fontWeight: '600',
                            boxSizing: 'border-box',
                            outline: 'none',
                        }}
                        onFocus={(e) => e.target.style.borderColor = '#a855f7'}
                        onBlur={(e) => e.target.style.borderColor = 'var(--border)'}
                        onKeyDown={(e) => e.key === 'Enter' && handleDeposit()}
                    />
                </div>

                {error && <div className="error-alert" style={{ marginBottom: '1rem' }}>{error}</div>}

                <div style={{ display: 'flex', gap: '0.75rem' }}>
                    <button
                        onClick={onClose}
                        disabled={loading}
                        style={{
                            flex: 1,
                            padding: '0.75rem',
                            background: 'rgba(255,255,255,0.06)',
                            border: '1px solid var(--border)',
                            borderRadius: '0.75rem',
                            color: 'var(--text-muted)',
                            cursor: loading ? 'not-allowed' : 'pointer',
                            fontSize: '0.875rem',
                        }}
                    >
                        취소
                    </button>
                    <Button
                        onClick={handleDeposit}
                        disabled={!amount || loading}
                        style={{ flex: 2, background: 'linear-gradient(135deg, #a855f7, #c084fc)' }}
                    >
                        {loading ? '입금 중...' : '입금하기'}
                    </Button>
                </div>
            </div>
        </div>
    );
};

// ── 이체 모달 ─────────────────────────────────────────────────────
const TransferModal = ({ senderAccountAddress, accounts, onClose, onTransferred }) => {
    const [receiverAddress, setReceiverAddress] = useState('');
    const [amount, setAmount] = useState('');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);

    const QUICK_AMOUNTS = [10000, 50000, 100000, 500000];

    // 보낼 수 있는 대상 계좌 (자기 자신 제외)
    const targetAccounts = accounts.filter(
        (acc) => acc.accountAddress !== senderAccountAddress
    );

    const handleTransfer = async () => {
        if (!receiverAddress) {
            setError('받는 계좌를 선택해주세요.');
            return;
        }
        const parsed = parseInt(amount.replace(/,/g, ''), 10);
        if (!parsed || parsed <= 0) {
            setError('올바른 금액을 입력해주세요.');
            return;
        }
        setLoading(true);
        setError(null);
        try {
            await transferBetweenAccounts(senderAccountAddress, receiverAddress, parsed);
            onTransferred();
        } catch (err) {
            setError(err.response?.data?.message || '이체에 실패했습니다.');
            setLoading(false);
        }
    };

    const handleAmountChange = (e) => {
        const raw = e.target.value.replace(/[^0-9]/g, '');
        setAmount(raw ? parseInt(raw, 10).toLocaleString() : '');
    };

    return (
        <div
            style={{
                position: 'fixed',
                inset: 0,
                background: 'rgba(0,0,0,0.6)',
                backdropFilter: 'blur(4px)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                zIndex: 1000,
                padding: '1rem',
            }}
            onClick={onClose}
        >
            <div
                style={{
                    background: 'var(--surface)',
                    border: '1px solid var(--border)',
                    borderRadius: '1.25rem',
                    padding: '2rem',
                    width: '100%',
                    maxWidth: '420px',
                    boxShadow: '0 24px 48px -12px rgba(0,0,0,0.5)',
                }}
                onClick={(e) => e.stopPropagation()}
            >
                <h3 style={{ margin: '0 0 1.5rem 0', fontSize: '1.125rem', fontWeight: '700', color: 'var(--text-main)', textAlign: 'center' }}>
                    💸 계좌 이체
                </h3>

                {/* 받는 계좌 선택 */}
                <div style={{ marginBottom: '1rem' }}>
                    <label style={{ display: 'block', marginBottom: '0.5rem', fontSize: '0.85rem', fontWeight: '600', color: 'var(--text-muted)' }}>
                        받는 계좌
                    </label>
                    {targetAccounts.length === 0 ? (
                        <div className="error-alert">이체 가능한 계좌가 없습니다.</div>
                    ) : (
                        <select
                            value={receiverAddress}
                            onChange={(e) => setReceiverAddress(e.target.value)}
                            style={{
                                width: '100%',
                                padding: '0.75rem 1rem',
                                background: 'rgba(255,255,255,0.06)',
                                border: '1px solid var(--border)',
                                borderRadius: '0.75rem',
                                color: 'var(--text-main)',
                                fontSize: '0.875rem',
                                cursor: 'pointer',
                                boxSizing: 'border-box',
                            }}
                        >
                            <option value="">계좌를 선택하세요</option>
                            {targetAccounts.map((acc) => {
                                const icon = ACCOUNT_TYPE_ICON[acc.accountType] || '💳';
                                const label = ACCOUNT_TYPE_LABEL[acc.accountType] || acc.accountType;
                                return (
                                    <option key={acc.accountAddress} value={acc.accountAddress}>
                                        {icon} {label} — ₩{acc.balance.toLocaleString()} ({acc.accountAddress.slice(0, 8)}...)
                                    </option>
                                );
                            })}
                        </select>
                    )}
                </div>

                {/* 빠른 금액 선택 */}
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.5rem', marginBottom: '1rem' }}>
                    {QUICK_AMOUNTS.map((v) => (
                        <button
                            key={v}
                            onClick={() => setAmount(v.toLocaleString())}
                            style={{
                                padding: '0.6rem',
                                background: amount === v.toLocaleString() ? 'rgba(34,197,94,0.25)' : 'rgba(255,255,255,0.05)',
                                border: `1px solid ${amount === v.toLocaleString() ? '#22c55e' : 'var(--border)'}`,
                                borderRadius: '0.625rem',
                                color: amount === v.toLocaleString() ? '#22c55e' : 'var(--text-muted)',
                                fontSize: '0.8rem',
                                fontWeight: '600',
                                cursor: 'pointer',
                                transition: 'all 0.15s ease',
                            }}
                        >
                            +{v.toLocaleString()}원
                        </button>
                    ))}
                </div>

                {/* 직접 입력 */}
                <div style={{ position: 'relative', marginBottom: '1rem' }}>
                    <span style={{
                        position: 'absolute',
                        left: '1rem',
                        top: '50%',
                        transform: 'translateY(-50%)',
                        color: 'var(--text-muted)',
                        fontSize: '1rem',
                        fontWeight: '600',
                        pointerEvents: 'none',
                    }}>₩</span>
                    <input
                        type="text"
                        value={amount}
                        onChange={handleAmountChange}
                        placeholder="직접 입력"
                        style={{
                            width: '100%',
                            padding: '0.75rem 1rem 0.75rem 2.25rem',
                            background: 'rgba(255,255,255,0.06)',
                            border: '1px solid var(--border)',
                            borderRadius: '0.75rem',
                            color: 'var(--text-main)',
                            fontSize: '1rem',
                            fontWeight: '600',
                            boxSizing: 'border-box',
                            outline: 'none',
                        }}
                        onFocus={(e) => e.target.style.borderColor = '#22c55e'}
                        onBlur={(e) => e.target.style.borderColor = 'var(--border)'}
                        onKeyDown={(e) => e.key === 'Enter' && handleTransfer()}
                    />
                </div>

                {error && <div className="error-alert" style={{ marginBottom: '1rem' }}>{error}</div>}

                <div style={{ display: 'flex', gap: '0.75rem' }}>
                    <button
                        onClick={onClose}
                        disabled={loading}
                        style={{
                            flex: 1,
                            padding: '0.75rem',
                            background: 'rgba(255,255,255,0.06)',
                            border: '1px solid var(--border)',
                            borderRadius: '0.75rem',
                            color: 'var(--text-muted)',
                            cursor: loading ? 'not-allowed' : 'pointer',
                            fontSize: '0.875rem',
                        }}
                    >
                        취소
                    </button>
                    <Button
                        onClick={handleTransfer}
                        disabled={!receiverAddress || !amount || loading}
                        style={{ flex: 2, background: 'linear-gradient(135deg, #22c55e, #4ade80)' }}
                    >
                        {loading ? '이체 중...' : '이체하기'}
                    </Button>
                </div>
            </div>
        </div>
    );
};

// ── AccountDetail ─────────────────────────────────────────────────
const AccountDetail = () => {
    const { accountAddress } = useParams();
    const navigate = useNavigate();
    const { username } = useAuth();
    const [account, setAccount] = useState(null);
    const [allAccounts, setAllAccounts] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [showChargeModal, setShowChargeModal] = useState(false);
    const [showDepositModal, setShowDepositModal] = useState(false);
    const [showTransferModal, setShowTransferModal] = useState(false);
    const [chargeSuccess, setChargeSuccess] = useState(false);
    const [depositSuccess, setDepositSuccess] = useState(false);
    const [transferSuccess, setTransferSuccess] = useState(false);

    const fetchDetail = async () => {
        try {
            setLoading(true);
            setError(null);
            const data = await getAccountDetail(accountAddress);
            setAccount(data);
        } catch (err) {
            setError(err.response?.data?.message || '계좌 정보를 불러올 수 없습니다.');
        } finally {
            setLoading(false);
        }
    };

    const fetchAllAccounts = async () => {
        try {
            if (username) {
                const data = await getAccounts(username);
                setAllAccounts(data);
            }
        } catch {
            // 계좌 목록 로드 실패 시 이체 기능만 비활성화
        }
    };

    useEffect(() => {
        fetchDetail();
        fetchAllAccounts();
    }, [accountAddress]);

    const handleCharged = () => {
        setShowChargeModal(false);
        setChargeSuccess(true);
        fetchDetail();
        setTimeout(() => setChargeSuccess(false), 3000);
    };

    const handleDeposited = () => {
        setShowDepositModal(false);
        setDepositSuccess(true);
        fetchDetail();
        setTimeout(() => setDepositSuccess(false), 3000);
    };

    const handleTransferred = () => {
        setShowTransferModal(false);
        setTransferSuccess(true);
        fetchDetail();
        fetchAllAccounts();
        setTimeout(() => setTransferSuccess(false), 3000);
    };

    if (loading) {
        return (
            <div className="animate-fade-in" style={{ maxWidth: '600px', margin: '0 auto', width: '100%' }}>
                <div className="glass-panel" style={{ textAlign: 'center', padding: '3rem 2rem' }}>
                    <div className="loading-spinner" />
                    <p style={{ marginTop: '1rem', color: 'var(--text-muted)' }}>계좌 정보를 불러오는 중...</p>
                </div>
            </div>
        );
    }

    if (error) {
        return (
            <div className="animate-fade-in" style={{ maxWidth: '600px', margin: '0 auto', width: '100%' }}>
                <div className="glass-panel" style={{ textAlign: 'center', padding: '2rem' }}>
                    <div className="error-alert" style={{ justifyContent: 'center', marginBottom: '1.5rem' }}>
                        ⚠️&nbsp; {error}
                    </div>
                    <Button onClick={() => navigate('/dashboard')} style={{ maxWidth: '200px', margin: '0 auto' }}>
                        대시보드로 돌아가기
                    </Button>
                </div>
            </div>
        );
    }

    const typeLabel = ACCOUNT_TYPE_LABEL[account.accountType] || account.accountType;
    const typeIcon = ACCOUNT_TYPE_ICON[account.accountType] || '💳';
    const typeGradient = ACCOUNT_TYPE_GRADIENT[account.accountType] || 'linear-gradient(135deg, #6366f1, #818cf8)';
    const isGeneral = account.accountType === 'GENERAL';
    const isSavings = account.accountType === 'SAVINGS';

    return (
        <div className="animate-fade-in" style={{ maxWidth: '600px', margin: '0 auto', width: '100%' }}>
            {/* 충전 모달 */}
            {showChargeModal && (
                <ChargeModal
                    accountAddress={accountAddress}
                    onClose={() => setShowChargeModal(false)}
                    onCharged={handleCharged}
                />
            )}

            {/* 적금 입금 모달 */}
            {showDepositModal && (
                <SavingDepositModal
                    savingAccountAddress={accountAddress}
                    onClose={() => setShowDepositModal(false)}
                    onDeposited={handleDeposited}
                />
            )}

            {/* 이체 모달 */}
            {showTransferModal && (
                <TransferModal
                    senderAccountAddress={accountAddress}
                    accounts={allAccounts}
                    onClose={() => setShowTransferModal(false)}
                    onTransferred={handleTransferred}
                />
            )}

            {/* 헤더 */}
            <div style={{
                display: 'flex',
                alignItems: 'center',
                gap: '0.75rem',
                marginBottom: '1.5rem',
                padding: '0 0.5rem'
            }}>
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
                <span style={{ fontSize: '1.125rem', fontWeight: '600', color: 'var(--text-main)' }}>
                    계좌 상세
                </span>
            </div>

            {/* 성공 알림 */}
            {chargeSuccess && (
                <div style={{
                    marginBottom: '1rem',
                    padding: '0.875rem 1.25rem',
                    background: 'rgba(34,197,94,0.15)',
                    border: '1px solid rgba(34,197,94,0.3)',
                    borderRadius: '0.75rem',
                    color: '#4ade80',
                    fontSize: '0.875rem',
                    fontWeight: '500',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '0.5rem',
                }}>
                    ✅ 충전이 완료되었습니다!
                </div>
            )}
            {depositSuccess && (
                <div style={{
                    marginBottom: '1rem',
                    padding: '0.875rem 1.25rem',
                    background: 'rgba(168,85,247,0.15)',
                    border: '1px solid rgba(168,85,247,0.3)',
                    borderRadius: '0.75rem',
                    color: '#c084fc',
                    fontSize: '0.875rem',
                    fontWeight: '500',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '0.5rem',
                }}>
                    ✅ 적금 입금이 완료되었습니다!
                </div>
            )}
            {transferSuccess && (
                <div style={{
                    marginBottom: '1rem',
                    padding: '0.875rem 1.25rem',
                    background: 'rgba(34,197,94,0.15)',
                    border: '1px solid rgba(34,197,94,0.3)',
                    borderRadius: '0.75rem',
                    color: '#4ade80',
                    fontSize: '0.875rem',
                    fontWeight: '500',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '0.5rem',
                }}>
                    ✅ 이체가 완료되었습니다!
                </div>
            )}

            {/* 잔액 카드 */}
            <div className="glass-panel" style={{
                marginBottom: '1.5rem',
                background: typeGradient,
                border: 'none',
                position: 'relative',
                overflow: 'hidden',
            }}>
                <div style={{
                    position: 'absolute',
                    top: '-30px',
                    right: '-20px',
                    fontSize: '6rem',
                    opacity: 0.15,
                    transform: 'rotate(15deg)',
                }}>{typeIcon}</div>
                <div style={{ position: 'relative', zIndex: 1 }}>
                    <div style={{
                        display: 'inline-block',
                        padding: '0.25rem 0.75rem',
                        background: 'rgba(255,255,255,0.2)',
                        borderRadius: '1rem',
                        fontSize: '0.8rem',
                        fontWeight: '600',
                        marginBottom: '1rem',
                        color: 'white',
                    }}>
                        {typeIcon} {typeLabel}
                    </div>
                    <div style={{ fontSize: '2.25rem', fontWeight: '700', color: 'white', marginBottom: '0.5rem' }}>
                        ₩ {account.balance.toLocaleString()}
                    </div>
                    <div style={{ fontSize: '0.85rem', color: 'rgba(255,255,255,0.7)' }}>
                        현재 잔액
                    </div>
                </div>
            </div>

            {/* 상세 정보 */}
            <div className="glass-panel" style={{ marginBottom: '1.5rem' }}>
                <h3 style={{
                    fontSize: '1rem',
                    fontWeight: '600',
                    color: 'var(--text-main)',
                    marginBottom: '1.25rem',
                    textAlign: 'left',
                }}>
                    계좌 정보
                </h3>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                    <div className="detail-info-row">
                        <span className="detail-info-label">계좌 주소</span>
                        <span className="detail-info-value" style={{ fontFamily: 'monospace', fontSize: '0.85rem' }}>
                            {account.accountAddress}
                        </span>
                    </div>
                    <div style={{ height: '1px', background: 'var(--border)' }} />
                    <div className="detail-info-row">
                        <span className="detail-info-label">계좌 유형</span>
                        <span className="detail-info-value">{typeLabel}</span>
                    </div>
                    <div style={{ height: '1px', background: 'var(--border)' }} />
                    <div className="detail-info-row">
                        <span className="detail-info-label">소유자</span>
                        <span className="detail-info-value">{account.ownerUsername}</span>
                    </div>
                    <div style={{ height: '1px', background: 'var(--border)' }} />
                    <div className="detail-info-row">
                        <span className="detail-info-label">잔액</span>
                        <span className="detail-info-value" style={{ fontWeight: '600', color: 'var(--success)' }}>
                            ₩ {account.balance.toLocaleString()}
                        </span>
                    </div>
                </div>
            </div>

            {/* 액션 버튼 — 일반 계좌: 충전 + 이체 */}
            {isGeneral && (
                <div className="glass-panel">
                    <h3 style={{
                        fontSize: '1rem',
                        fontWeight: '600',
                        color: 'var(--text-main)',
                        marginBottom: '1rem',
                        textAlign: 'left',
                    }}>
                        계좌 관리
                    </h3>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                        <Button
                            onClick={() => setShowChargeModal(true)}
                            style={{ maxWidth: '100%' }}
                        >
                            💳 충전하기
                        </Button>
                        <Button
                            onClick={() => setShowTransferModal(true)}
                            style={{
                                maxWidth: '100%',
                                background: 'linear-gradient(135deg, #22c55e, #4ade80)',
                            }}
                        >
                            💸 이체하기
                        </Button>
                    </div>
                </div>
            )}

            {/* 액션 버튼 — 적금 계좌: 입금 */}
            {isSavings && (
                <div className="glass-panel">
                    <h3 style={{
                        fontSize: '1rem',
                        fontWeight: '600',
                        color: 'var(--text-main)',
                        marginBottom: '1rem',
                        textAlign: 'left',
                    }}>
                        적금 관리
                    </h3>
                    <Button
                        onClick={() => setShowDepositModal(true)}
                        style={{
                            maxWidth: '100%',
                            background: 'linear-gradient(135deg, #a855f7, #c084fc)',
                        }}
                    >
                        🏦 적금 입금
                    </Button>
                </div>
            )}
        </div>
    );
};

export default AccountDetail;
