import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { getAccountDetail } from '../api/accountApi';
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

const AccountDetail = () => {
    const { accountAddress } = useParams();
    const navigate = useNavigate();
    const [account, setAccount] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
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
        fetchDetail();
    }, [accountAddress]);

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

    return (
        <div className="animate-fade-in" style={{ maxWidth: '600px', margin: '0 auto', width: '100%' }}>
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
            <div className="glass-panel">
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
        </div>
    );
};

export default AccountDetail;
