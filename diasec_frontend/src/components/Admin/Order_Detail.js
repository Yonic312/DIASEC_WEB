import { useRef, useEffect, useState } from 'react';
import { useParams, useNavigate, useLocation } from 'react-router-dom';
import { toast } from 'react-toastify';
import axios from 'axios';
import thumbCustom from '../../assets/CustomFrames/customFrames.png';

const Order_Detail = () => {
    const API = process.env.REACT_APP_API_BASE;
    const printRef = useRef();
    const navigate = useNavigate();
    const location = useLocation();
    const orderCountFromState = location.state?.orderCount || 1;
    const { itemId } = useParams();
    const [order, setOrder] = useState(null);

    // 리스 정보 수정
    const [showLeaseModal, setShowLeaseModal] = useState(false);
    const [leaseStart, setLeaseStart] = useState('');
    const [leaseEnd, setLeaseEnd] = useState('');

    // 모달 입력 필드 상태 정의
    const [trackingCompany, setTrackingCompany] = useState('');
    const [trackingNumber, setTrackingNumber] = useState('');
    const [bankName, setBankName] = useState('');
    const [accountNumber, setAccountNumber] = useState('');
    const [accountHolder, setAccountHolder] = useState('');

    const [customCompany, setCustomCompany] = useState(''); // 직접 입력일 때 사용하는 변수

    // 비회원 비밀번호 수정
    const [showGuestPwModal, setShowGuestPwModal] = useState(false);
    const [newGuestPw, setNewGuestPw] = useState('');
    const [confirmGuestPw, setConfirmGuestPw] = useState('');

    const [generatedGuestPw, setGeneratedGuestPw] = useState('');

    const handleGuestPwUpdate = async () => {
        if (newGuestPw !== confirmGuestPw) {
            toast.error("비밀번호가 일치하지 않습니다.");
            return;
        }

        try {
            const res = await fetch(`${API}/order/guest-reset-password`, {
                method: "POST",
                headers: { 'Content-Type': "application/json" },
                body: JSON.stringify({
                    oid: order.oid,
                    phone: order.recipientPhone
                })
            });
            const data = await res.json();
            if  (data.success) {
                setGeneratedGuestPw(data.newPassword);
                toast.success(`임시 비밀번호가 발급되었습니다 :  ${data.newPassword}`);
            } else {
                toast.error("변경 실패: " + data.message);
            }
        } catch (err) {
            console.error("비회원 비밀번호 수정 오류", err);
            toast.error("서버 오류");
        }
    }
    
    // 주문상태 변경
    const statusOptions = [
        '전체', '입금대기', '결제완료', '배송준비중', '배송중', '배송완료', 
        '취소', '교환신청', '교환회수완료', '교환배송중', '교환완료', 
        '반품신청', '반품회수완료', '환불처리중', '환불완료'
    ];

    // 진행상태 업데이트
    const handleStatusChange = (itemId, newStatus, id, usedCredit, oid) => {
        fetch(`${API}/admin/order/update-status`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json '},
            credentials: "include",
            body: JSON.stringify({ itemId, orderStatus: newStatus, id, usedCredit, oid})
        })
        .then(res => res.json())
        .then(data => {
            if (data.success) {
                toast.success('상태가 변경되었습니다.');
                reload();
            } else {
                toast.error('상태 변경 실패');
            }
        })
        .catch(err => console.error("상태 변경 요청 실패", err));
    };
    
    // 반품 신청
    const [showReturnForm, setShowReturnForm] = useState(false);
    const [claimType, setClaimType] = useState('반품'); // 교환 / 반품 선택버튼
    const [returnReason, setReturnReason] = useState(''); // 반품 이유
    const [returnDetail, setReturnDetail] = useState(''); // 반품 이유 (상세)

    const handleSubmitReturn = () => {
        if (!returnReason) {
            toast.error('사유를 선택해주세요.');
            return;
        }

        if (claimType === '반품') {
            if (!bankName || !accountNumber || !accountHolder) {
                toast.error('반품일 경우 환불 계좌 정보를 모두 입력해주세요.');
                return;
            }
        }

        fetch(`${API}/order/claim`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                id: order.id,
                oid: order.oid,
                pid: order.items[0].pid,
                usedCredit :order.usedCredit,
                orderStatus: claimType === '반품' ? '반품신청' : '교환신청',
                reason:returnReason,
                detail: returnDetail,
                ...(claimType === '반품' && {
                bankName,
                accountNumber,
                accountHolder
                })
            })
        })
        .then(res => res.json())
        .then(data => {
            if (data.success) {
                toast.success(`${claimType} 요청이 접수되었습니다.`);
                navigate('/orderList');
            } else {
                toast.error(`${claimType} 요청 실패 : + data.message`);
            }
        })
        .catch(err => toast.error('서버 오류'));
    }

    // 아이템 불러오기
    useEffect(() => {
        reload();
    }, [itemId]);

    const [showModal, setShowModal] = useState(false);

    const reload = () => {
        axios.get(`${API}/order/detail/${itemId}`)
            .then(res => setOrder(res.data))
            .catch(err => console.error("주문 상세 불러오기 실패", err));
    }

    if (!order) return <div className="text-center py-20 text-gray-500">로딩 중...</div>;

    const steps = ['입금대기', '결제완료', '배송준비중', '배송중', '배송완료'];
    const currentStepIndex = steps.indexOf(order.items[0].orderStatus);

    // 모달 값 저장 함수
    const handleSave = () => {
        if(!trackingCompany || trackingCompany.trim() === '') {
            toast.error('택배사를 선택하거나 입력해 주세요.');
            return;
        }

        if(!trackingNumber || trackingNumber.trim() === '') {
            toast.error('운송장번호를 입력해 주세요.');
            return;
        }

        // 기타 선택 시에는 trackingCompany가 여전히 "기타"일 수 있으므로 직접 입력값으로 대체 필요
        let finalTrackingCompany = trackingCompany;
        if (trackingCompany === '기타') {
            if (customCompany === '' || !customCompany) {
                toast.error('택배사를 직접 입력해 주세요.');
                return;
            }
            console.log(customCompany);

            finalTrackingCompany = trackingCompany === '기타' ? customCompany.trim() : trackingCompany;

            console.log(finalTrackingCompany);

            if (!finalTrackingCompany) {
                toast.error('택배사를 선택하거나 입력해 주세요.');
                return;
            }
        }

        fetch(`${API}/admin/order/update-detail`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            credentials: 'include',
            body: JSON.stringify({
                itemId: order.items[0].itemId,
                trackingCompany: finalTrackingCompany,
                trackingNumber
            }),
        })
        .then(res => res.json())
        .then(data => {
            if (data.success) {
                toast.success('저장되었습니다.')
                setShowModal(false);
                reload();
            }
        })
        .catch(err => console.error("상세정보 저장 실패", err));
    }

    // 인쇄하기
    const handlePrint = () => {
        const printContents = printRef.current.innerHTML;
        const printWindow = window.open('', '', 'width=1000,height=800');

        printWindow.document.write(`
            <html>
            <head>
                <title>주문서</title>
                <style>
                body { font-family: sans-serif; padding: 40px; }
                table, th, td { border-collapse: collapse; }
                .no-print { display: none; }
                </style>
            </head>
            <body>
                ${printContents}
            </body>
            </html>
        `);

        printWindow.document.close();
        printWindow.focus();
        printWindow.print();
        printWindow.close();
    };

    // 인치 -> cm 변환
    const convertInchToCm = (size) => {
        if (!size || typeof size !== 'string') return size;

        const [w, h] = size.split(/[xX]/).map(s => parseFloat(s.trim()));
        if (isNaN(w) || isNaN(h)) return size;

        const cmW = (w * 2.54).toFixed(1);
        const cmH = (h * 2.54).toFixed(1);
        return `${w} x ${h} (${cmW}cm x ${cmH}cm)`;
    }

    const convertCategoryName = (category) => {
        if (category === "masterPiece") {
            return "명화";
        } else if (category === "fengShui") {
            return "풍수";
        } else if (category === "authorCollection") {
            return "작가";
        } else if (category === "photoIllustration") {
            return "사진/일러스트";
        } else if (category === "koreanPainting")  {
            return "동양화";
        } else if (category === "customFrames") {
            return "맞춤액자";  
        } 
    }

    // 주문 삭제 함수
    const handleDeleteOrder = async () => {
        if (!window.confirm("정말로 이 주문을 삭제하시겠습니까?")) return;

        try {
            const response = await fetch(`${API}/order/delete`, {
                method: "POST",
                credentials: 'include',
                headers: {
                    "Content-Type": "application/json"
                },
                body: JSON.stringify({
                    oid: order.oid,
                    items: order.items.map(item => ({
                        category: item.category,
                        thumbnail: item.thumbnail
                    }))
                })
            });

            const data = await response.json();
            if (data.success) {
                toast.success("주문이 삭제되었습니다.");
                navigate('/admin/order_Status');
            } else {
                toast.error("삭제 실패: " + data.message);
            }
        } catch (error) {
            console.error("주문 삭제 중 오류 발생", error);
            toast.error("서버 오류");
        }
    }

    // 리스 저장
    const handleLeaseSave = () => {
        if (!leaseStart || !leaseEnd) {
            toast.error("리스 시작일과 종료일을 모두 입력해주세요.");
            return;
        }

        fetch(`${API}/admin/order/update-lease-period`, {
            method: 'POST',
            headers: { 'Content-Type' : 'application/json' },
            credentials: 'include',
            body: JSON.stringify({
                itemId: order.items[0].itemId,
                leaseStart,
                leaseEnd
            })
        })
        .then(res => res.json())
        .then(data => {
            if (data.success) {
                toast.success("리스 기간이 저장되었습니다.");
                setShowLeaseModal(false);
                reload();
            } else {
                toast.error("저장 실패: " + (data.message || ""));
            }
        })
        .catch(err => {
            console.error("리스 기간 저장 실패", err);
            toast.error("서버 오류");
        });
    };

    // 맞춤액자시 썸네일 설정
    const displayThumb = order.items[0].category === 'customFrames' ? thumbCustom : order.items[0] .thumbnail;

    // 맞춤액자 이미지 제거
    const handleDeleteCustomImage = async () => {
        if (!order?.items?.[0]) return;

        if (!window.confirm("고객 업로드 이미지를 서버에서 삭제할까요? (삭제 후 복구 불가")) return;

        try {
            const res = await fetch(`${API}/admin/order/delete-custom-image`, {
                method: "POST",
                credentials: "include",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    itemId: order.items[0].itemId,
                }),
            });

            const data = await res.json();
            if (data.success) {
                toast.success("고객 업로드 이미지가 삭제되었습니다.");
                reload();
            } else {
                toast.error("삭제 실패: " + (data.message || ""));
            }
        } catch (e) {
            console.error(e);
            toast.error("서버 오류");
        }
    }

    return (
        <div className="w-full bg-white px-8 py-10 shadow-md border border-gray-200 space-y-8 mb-20"
            ref={printRef}
        >
            {/* Title */}
            <div>
                <div className='flex items-center justify-between'>
                    <h2 className="text-2xl font-bold mb-2">주문 상세 내역</h2>
                    <div className="flex gap-1 no-print">
                        {order.items[0].category === 'customFrames' && order.items[0]?.thumbnail && (
                            <button
                                className="px-2 py-1 text-[11px] font-medium border bg-gray-700 text-white rounded-xl hover:bg-gray-800 transition"
                                onClick={handleDeleteCustomImage}
                            >
                                이미지 제거
                            </button>
                        )}

                        {!order.id && (
                            <button
                                className="px-2 py-1 text-[11px] font-medium border bg-blue-600 text-white rounded-xl hover:bg-blue-700 transition"
                                onClick={() => setShowGuestPwModal(true)}
                            >
                                비회원 비밀번호 수정
                            </button>
                        )}
                        <button 
                        className="px-2 py-1 text-[11px] font-medium border bg-red-500 text-white border-white rounded-xl hover:text-gray-300  transition"
                        onClick={handleDeleteOrder}    
                    >
                            주문내역 삭제
                        </button>
                        <select
                            value={order.items[0].orderStatus}
                            onClick={(e) => e.stopPropagation()} 
                            onChange={(e) => handleStatusChange(order.items[0].itemId, e.target.value, order.items[0].id, order.items[0].usedCredit, order.items[0].oid)}
                            className="border rounded px-2 py-1 text-sm">
                        {statusOptions.map(status => (
                            <option key={status} value={status}>{status}</option>
                        ))}
                        </select>

                        <button
                            onClick={() => handlePrint()}
                            className="px-3 py-1 border rounded bg-white text-sm hover:bg-gray-100"
                        >
                            인쇄하기
                        </button>

                        <button 
                            className="px-2 py-1 text-[11px] font-medium border bg-orange-500 text-white border-white rounded-xl hover:text-gray-300  transition" 
                            onClick={() => {
                                    setTrackingCompany(trackingCompany || '');
                                    setTrackingNumber(trackingNumber || '');
                                    setBankName(bankName || '');
                                    setAccountNumber(accountNumber || '');
                                    setAccountHolder(accountHolder || '');

                                    // 직접입력 값이면 customCompany로 설정
                                    const knownCompanies = [
                                        "CJ대한통운", "롯데택배", "한진택배", "우체국택배",
                                        "쿠팡로지스틱스", "로젠택배", "경동택배"
                                    ];
                                    if (!knownCompanies.includes(trackingCompany)) {
                                        setTrackingCompany('기타');
                                        setCustomCompany(trackingCompany || '');
                                    } else {
                                        setCustomCompany('');
                                    }

                                    setShowModal(true);
                            }}> 
                            배송정보 수정
                        </button>

                        {order.items[0].category === 'lease' && (
                            <button 
                                className="px-2 py-1 text-[11px] font-medium border bg-green-600 text-white border-white rounded-xl hover:text-gray-300 transition"
                                onClick={() => {
                                    setLeaseStart(order.items[0].leaseStartDate?.slice(0, 10) || '');
                                    setLeaseEnd(order.items[0].leaseStartDate?.slice(0, 10) || '');
                                    setShowLeaseModal(true);
                                }}>
                                리스정보 수정
                            </button>
                        )}

                        <button 
                            className="px-2 py-1 text-[11px] font-medium border bg-black text-white border-gray-500 rounded-xl hover:text-gray-300  transition" 
                            onClick={() => navigate(-1)}> 
                            이전으로
                        </button>
                    </div>
                </div>
                <p className="text-sm text-gray-500">주문번호: <span className="font-medium">{order.oid}</span> | 주문일자 {order.createdAt?.slice(0, 16)}</p>
            </div>

            {/* 상단 상품 정보 */}
            <div className="flex gap-6 items-start border rounded-lg p-6 bg-gray-50">
                <img 
                    src={displayThumb} 
                    alt={order.items[0].title} 
                    className="w-28 h-28 object-cover rounded border" />
                <div className="flex flex-col h-28 justify-between flex-1">
                    <div className="text-lg font-semibold mb-2">
                        {order.items[0].title}
                    </div>
                    <div>
                        <div className="flex justify-between">
                            <div>
                                <div className="text-sm">수량: {order.items[0].quantity}개</div>
                                <div className="text-sm text-gray-500 mb-1">
                                    카테고리: {convertCategoryName(order.items[0].category)} <br />
                                    사이즈: {convertInchToCm(order.items[0].size)} <br />
                                    {order.items[0].category === 'lease' && (
                                        `기간 : ${order.items[0].period}`
                                    )}
                                    {order.items[0].category === 'lease' && order.items[0].leaseStart != null && (
                                        ` / (${order.items[0].leaseStart} ~ ${order.items[0].leaseEnd})`)
                                    }
                                </div>
                                    
                                {/* 맞춤액자 경우 고객 업로드 파일 다운로드 버튼 */}
                                {order.items[0].category === 'customFrames' && order.items[0].thumbnail && (
                                    <div className="mt-2">
                                        <a 
                                            href={order.items[0].thumbnail}
                                            target="_blank"
                                            rel="noreferrer"
                                            className="text-sm text-blue-600 underline hover:text-blue-800"
                                        >
                                            고객 업로드 이미지 다운로드
                                        </a>
                                    </div>
                                )}
                            </div>
                            <div className="flex items-end text-base font-bold text-right mt-1">{(order.items[0].price * order.items[0].quantity).toLocaleString()}원</div>
                        </div>
                    </div>
                </div>
            </div>

            {/* 반품 입력창 */}
            {showReturnForm && order.items[0].orderStatus !== '반품신청' && (
                <div className="space-y-2 mt-4 text-sm text-gray-700 border rounded p-4 bg-gray-50">
                    <div className="flex items-center gap-4">
                        <label>
                            <input type="radio" checked={claimType === '교환'} onChange={() => setClaimType('교환')} /> 
                            교환
                        </label>
                        <label>
                            <input type="radio" checked={claimType === '반품'} onChange={() => setClaimType('반품')} /> 
                            반품
                        </label>
                    </div>
                    
                    <select
                        className="w-full border px-3 py-2 rounded"
                        value={returnReason}
                        onChange={(e) => setReturnReason(e.target.value)}>
                            <option value="">{claimType}사유를 선택해주세요</option>
                            <option value="단순변심">단순변심</option>
                            <option value="상품불량">상품불량</option>
                            <option value="오배송">오배송</option>
                            <option value="기타">기타</option>
                    </select>

                    <textarea
                        placeholder="상세 사유 입력 (선택사항)"
                        className="w-full border px-3 py-2 rounded"
                        rows={3}
                        value={returnDetail}
                        onChange={(e) => setReturnDetail(e.target.value)}
                    />
                    {claimType === '반품' && (
                    <>
                        <input 
                            type="text"
                            placeholder="은행명"
                            className="w-full border px-3 py-2 rounded"
                            value={bankName}
                            onChange={(e) => setBankName(e.target.value)}
                        />
                        <input 
                            type="text"
                            placeholder="계좌번호"
                            className="w-full border px-3 py-2 rounded"
                            value={accountNumber}
                            onChange={(e) => setAccountNumber(e.target.value)}
                        />
                        <input 
                            type="text"
                            placeholder="예금주"
                            className="w-full border px-3 py-2 rounded"
                            value={accountHolder}
                            onChange={(e) => setAccountHolder(e.target.value)}
                        />
                    </>
                    )}

                    <button
                        onClick={handleSubmitReturn}
                        className="w-full bg-black text-white py-2 rounded hover:bg-gray-800 mt-2">
                            요청 접수
                    </button>
                </div>
            )} {/* 반품 입력창 */}
            
            {/* 주문 진행 상황 */}
            <div className='no-print'>
                {/* 주문상태에 따라 상태 메세지 */}
                {order.items[0].orderStatus === '입금대기' && (
                    <>
                        <h3 className="font-semibold mb-4 text-lg">주문 진행 상황</h3>
                        <div className="mt-6 p-4 border rounded bg-yellow-50 text-sm text-yellow-700 font-medium">
                                주문이 정상적으로 접수되었으며, 고객의 입금을 기다리고 있습니다. <br />
                                아래 계좌로 입금이 확인되면 배송 준비를 시작하겠습니다.
                        </div>
                    </>
                )}

                {/* 결제완료 */}
                {order.items[0].orderStatus === '결제완료' && (
                    <>
                        <h3 className="font-semibold mb-4 text-lg">주문 진행 상황</h3>
                        <div className="mt-6 p-4 border rounded bg-yellow-50 text-sm text-yellow-700 font-medium">
                            고객님의 입금이 확인되었습니다. <br />
                            주문은 정상적으로 접수되었으며, 확인 후 순차적으로 배송이 진행될 예정입니다.
                        </div>
                    </>
                )}

                {order.items[0].orderStatus === '취소' && (
                    <div>
                        <h3 className="font-semibold mb-4 text-lg">주문 진행 상황</h3>
                        <div className="p-4 border rounded bg-yellow-50 text-sm text-yellow-700 font-medium">
                            주문이 취소되었습니다.
                        </div>
                    </div>
                )}

                {['교환신청', '교환회수완료', '교환배송중', '교환완료'].includes(order.items[0].orderStatus) && (
                    <div>
                        <h3 className="font-semibold mb-4 text-lg">교환 진행 상황</h3>
                        <div className="p-4 border rounded bg-yellow-50 text-sm text-yellow-700 font-medium">
                            {order.items[0].orderStatus === '교환신청' && (
                            <>
                                교환 요청이 접수되었습니다.<br/>
                                상품을 아래 주소로 선불 발송해 주세요.<br/><br/>
                                <span className="font-normal text-gray-800">
                                    경기 고양시 덕양구 통일로 140 (동산동, 삼송테크노밸리) A동 355호 <br/>
                                    수신자: 디아섹 / 연락처 : 010-0000-0000
                                </span>
                            </>
                            )}
                            {order.items[0].orderStatus === '교환회수완료' && (
                                <>회수 상품이 도착했습니다. 새 상품 준비 중입니다.</>
                            )}
                            {order.items[0].orderStatus === '교환배송중' && (
                                <>
                                    새 상품이 발송되었습니다. 곧 받아보실 수 있습니다.
                                </>
                            )}
                            {order.items[0].orderStatus === '교환완료' && (
                                <>교환이 완료되었습니다. 이용해 주셔서 감사합니다.</>
                            )}
                        </div>
                    </div>
                )}

                {/* 클레임 메세지 */}
                {['반품신청', '반품회수완료', '환불처리중', '환불완료'].includes(order.items[0].orderStatus) && (
                    <div>
                        <h3 className="font-semibold mb-4 text-lg">반품 진행 상황</h3>
                        <div className="p-4 border rounded bg-yellow-50 text-sm text-yellow-700 font-medium">
                            {order.items[0].orderStatus === '반품신청' && (
                            <>
                                반품 요청이 접수되었습니다.<br/>
                                상품을 아래 주소로 선불 발송해 주세요.<br/><br/>
                                <span className="font-normal text-gray-800">
                                    경기 고양시 덕양구 통일로 140 (동산동, 삼송테크노밸리) A동 355호 <br/>
                                    수신자: 디아섹 / 연락처 : 010-0000-0000
                                </span>
                            </>
                            )}
                            {order.items[0].orderStatus === '반품회수완료' && (
                                <>반품 상품이 도착했습니다. 환불 절차를 진행 중입니다.</>
                            )}
                            {order.items[0].orderStatus === '환불처리중' && (
                                <>환불이 처리 중입니다. 영업일 기준 2~3일 내 입금 예정입니다.</>
                            )}
                            {order.items[0].orderStatus === '환불완료' && (
                                <>환불이 완료되었습니다. 계좌를 확인해 주세요.</>
                            )}
                        </div>
                    </div>
                )}
            </div> {/* 주문 진행 상황 */}

            {/* 배송 상태 단계 */}
            <div className="no-print">
                {!['입금대기', '결제완료', '취소', '반품신청', '반품회수완료', '환불처리중', '환불완료', 
                    '교환신청', '교환회수완료', '교환배송중', '교환완료'].includes(order.items[0].orderStatus) && (
                    <div>
                        <h3 className="font-semibold mb-4 text-lg">배송 진행 상황</h3>
                        <div className="flex justify-between items-center px-2 relative">
                            {steps.map((step, idx) => (
                                <div key={step} className="flex-1 text-center px-2 relative">
                                    <div className={`w-4 h-4 mx-auto rounded-full ${idx <= currentStepIndex ? 'bg-black' : 'bg-gray-300'} z-10 relative`}></div>
                                    <div className={`text-xs mt-2 ${idx <= currentStepIndex ? 'font-bold text-black' : 'text-gray-400'}`}>{step}</div>
                                    {idx < steps.length - 1 && (
                                        <div className={`absolute top-2 left-1/2 w-full h-[2px] ${idx < currentStepIndex ? 'bg-black' : 'bg-gray-300'}`}></div>
                                    )}
                                </div>
                            ))}
                        </div>

                        {/* 운송장 표시 */}
                        {order.items[0].trackingNumber && (
                            <div className="mt-6 border rounded-lg p-4 bg-gray-50 text-sm text-gray-800">
                                <div className="flex items-center justify-between mb-2">
                                    <span className="font-semibold text-gray-700">운송장 정보</span>
                                    <a href={`https://st.sweettracker.co.kr/#/`}
                                        className="text-blue-600 hover:underline text-xs"
                                    >
                                        배송조회 바로가기 
                                    </a>
                                </div>
                                <div className="text-base font-bold text-gray-900">
                                    운송장 번호: {order.items[0].trackingNumber}
                                </div>
                                <div className="text-xs text-gray-500 mt-1">
                                    ※ 택배사 : {order.items[0].trackingCompany}
                                </div>
                            </div>
                        )}
                    </div>
                )}
            </div>

            { /* 결제 정보 */}
            <div>
                <h3 className="font-semibold mb-4 text-lg">결제 정보</h3>
                <div className="bg-gray-50 p-4 rounded-md text-sm leading-6">
                    <div ><span className="font-semibold text-black mb-2">결제 수단:</span> {order.paymentMethod}</div>
                    { order.paymentMethod === '무통장입금' && (
                        <>
                            <div><span className="font-semibold text-black mb-2">입금자명:</span> {order.depositor}</div>
                            <div><span className="font-semibold text-black mb-2">입금 계좌:</span> {order.bankAccount}</div>
                        </>
                    )}
                    <div><span className="font-semibold text-black mb-2">총 상품금액:</span> {order.totalPrice.toLocaleString()}원</div>
                    <div><span className="font-semibold text-black mb-2">적립금 사용:</span> {order.usedCredit.toLocaleString()}원</div>
                    {order.items[0].category === 'lease' && (
                        <div><span className="font-semibold text-black mb-2">보증금:</span> {order.items[0].deposit.toLocaleString()}원</div>
                    )}
                    <div><span className="font-semibold text-black mb-2">배송비:</span> {order.deliveryFee.toLocaleString()}원</div>
                    <div>
                        <span className="font-semibold text-black mb-2">최종 결제금액:</span> 
                        {order.finalPrice.toLocaleString()}원 
                        {orderCountFromState > 1 ? ` (외 ${orderCountFromState - 1}개 상품 포함)` : ''}
                    </div>
                </div>
            </div>

            {/* 현금 영수증 */}
            {order.receiptInfo && (
                <div className="mt-6 p-5 border border-gray-200 rounded-md bg-gray-50 text-sm text-gray-800">
                    <h3 className="font-semibold text-lg text-gray-900 mb-4">현금 영수증 정보</h3>

                    <div className="flex justify-between py-1 border-b border-gray-100">
                        <span className='text-gray-600'>발급 유형</span>
                        <span className="font-medium text-gray-800">{order.receiptType || '정보 없음'}</span>
                    </div>
                    
                    <div className="flex justify-between py-1 border-b border-gray-100">
                        <span className="text-gray-600">신청 방법</span>
                        <span className="font-medium text-gray-800">{order.receiptMethod || '정보 없음'}</span>
                    </div>

                    <div className="flex justify-between py-1">
                        <span className="text-gray-600">신청 번호</span>
                        <span className="font-medium text-gray-800">{order.receiptInfo || '정보 없음'}</span>
                    </div>
                </div>
            )}

            {/* 맞춤액자 사진보정 정보 */}
            {order.items?.[0]?.category === 'customFrames' && (() => {
                const item = order.items[0];

                const retouchEnabled =
                    item.retouchEnabled === 1 || item.retouchEnabled === true;

                const retouchTypes = (item.retouchTypes || '')
                    .split(',')
                    .map(v => v.trim())
                    .filter(Boolean);

                return (
                    <div>
                        <h3 className="font-semibold mb-4 text-lg">사진 보정 정보</h3>

                        <div className="bg-gray-50 p-4 rounded-md text-sm leading-6">
                            <div>
                                <span className='font-semibold text-black mb-2'>보정 신청:</span>{' '}
                                {retouchEnabled ? '신청' : '미신청'}
                            </div>

                            {retouchEnabled && (
                                <>
                                    <div className="mt-2">
                                        <span className="font-semibold text-black mb-2">보정 항목:</span>
                                        {retouchTypes.length > 0 ? (
                                            <div className="mt-2 flex flex-wrap gap-2">
                                                {retouchTypes.map(t => (
                                                    <span
                                                        key={t}
                                                        className="px-2 py-1 text-xs border rounded-full bg-white"
                                                    >
                                                        {t}
                                                    </span>
                                                ))}
                                            </div>
                                        ) : (
                                            <span className="ml-2 text-gray-500">선택 없음</span>
                                        )}
                                    </div>

                                    <div className='mt-2'>
                                        <span className="font-semibold text-black mb-2">요청사항:</span>{' '}
                                        {item.retouchNote ? (
                                            <span className="whitespace-pre-line">{item.retouchNote}</span>
                                        ) : (
                                            <span className="text-gray-500">없음</span>
                                        )}
                                    </div>
                                </>
                            )}
                        </div>
                    </div>
                )
            })()}

            { /* 배송지 정보 */}
            <div>
                <h3 className="font-semibold mb-4 text-lg">배송지 정보</h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-y-3 text-sm text-gray-700">
                    <div><span className="font-medium">이름:</span> {order.ordererName}</div>
                    <div><span className="font-medium">연락처:</span> {order.ordererPhone}</div>
                    <div><span className="font-medium">이메일:</span> {order.email}</div>
                    <div>
                        <span className="font-medium">주소:</span>{order.address}<br />
                        {order.detailAddress}({order.postcode})
                    </div>
                </div>
            </div>

            {/* 배송 페이지 모달창 */}
            {showModal && (
                <div className="fixed inset-0 bg-black bg-opacity-40 flex items-center justify-center z-50">
                    <div className='bg-white p-6 rounded-lg w-[420px] shadow-lg relative'>
                        <h3 className='"text-lg font-bold mb-4'>주문 상세 정보</h3>
                        
                        {/* 송장 정보 */}
                        <div className="mb-6 border p-4 rounded bg-gray-50">
                            <h4 className='text-sm font-semibold mb-2 text-gray-700'>배송 정보</h4>
                            <p className="text-xs text-gray-500 mb-2">
                                (<span className='font-medium'>배송중</span>, <span className='font-medium'>교환배송중</span> 상태일 때 입력하는 항목입니다)
                            </p>
                            <label className="block text-sm font-medium mt-2">택배사</label>
                            <select className="border px-1 py-1 w-full text-sm"
                                value={trackingCompany}
                                onChange={(e) => setTrackingCompany(e.target.value)}>
                                    <option hidden value="">===선택해주세요===</option>
                                    <option value="CJ대한통운">CJ대한통운</option>
                                    <option value="롯데택배">롯데택배</option>
                                    <option value="한진택배">한진택배</option>
                                    <option value="우체국택배">우체국택배</option>
                                    <option value="쿠팡로지스틱스">쿠팡로지스틱스</option>
                                    <option value="로젠택배">로젠택배</option>
                                    <option value="경동택배">경동택배</option>
                                    <option value="기타">직접입력</option>
                            </select>

                            {trackingCompany === '기타' && (
                                <input type="text" value = {customCompany} onChange={e => setCustomCompany(e.target.value)}
                                    className="border px-2 py-1 w-full text-sm" placeholder="택배사를 입력하세요." />
                            )}

                            <label className="block text-sm font-medium mt-2">운송장번호</label>
                            <input type="text" value={trackingNumber} onChange={e => setTrackingNumber(e.target.value)} className='border px-2 py-1 w-full text-sm'></input>
                        </div>
                        
                        {/* 환불 정보 */}
                        {order?.orderStatus?.includes('환불') || order?.orderStatus?.includes('반품') ? (
                            <div className="mb-4 border p-4 rounded bg-gray-50">
                                <h4 className='text-sm font-semibold mb-2 text-gray-700'>환불 계좌 정보</h4>
                                <label className="block text-sm font-medium mt-2">은행명</label>
                                <input type="text" value={bankName} onChange={e => setBankName(e.target.value)} className="border px-2 py-1 w-full text-sm" />

                                <label className="block text-sm font-medium mt-2">계좌번호</label>
                                <input type="text" value={accountNumber} onChange={e => setAccountNumber(e.target.value)} className="border px-2 py-1 w-full text-sm" />

                                <label className="block text-sm font-medium mt-2">예금주</label>
                                <input type="text" value={accountHolder} onChange={e => setAccountHolder(e.target.value)} className="border px-2 py-1 w-full text-sm" />
                            </div>
                        ) : null}

                        <button 
                            onClick={handleSave}
                            className="mt-4 w-full bg-blue-600 text-white py-2 rounded hover:bg-blue-700">
                            저장
                        </button>

                        <button
                            onClick={() => setShowModal(false)}
                            className="absolute top-3 right-3 text-gray-400 hover:text-black">
                        ✕
                        </button>
                    </div>
                </div>
            )}

            {/* 리스정보 수정 모달
            {showLeaseModal && (
                <div className="fixed inset-0 bg-black bg-opacity-40 flex items-center justify-center z-50">
                    <div className="bg-white p-6 rounded-lg w-[420px] shadow-lg relative">
                        <h3 className="text-lg font-bold mb-4">리스 기간 수정</h3>

                        <label className="block text-sm font-medium mt-2">리스 시작일</label>
                        <input 
                            type="date"
                            value={leaseStart}
                            onChange={(e) => setLeaseStart(e.target.value)}
                            className='border px-2 py-1 w-full text-sm'
                        />

                        <label className="block text-sm font-medium mt-2">리스 종료일</label>
                        <input 
                            type="date"
                            value={leaseEnd}
                            onChange={(e) => setLeaseEnd(e.target.value)}
                            className="border px-2 py-1 w-full text-sm"
                        />

                        <button
                            onClick={() => handleLeaseSave()}
                            className="mt-4 w-full bg-green-600 text-white py-2 rounded hover:bg-green-700"
                        >
                            저장
                        </button>

                        <button
                            onClick={() => setShowLeaseModal(false)}
                            className="absolute top-3 right-3 text-gray-400 hover:text-black"
                        >
                            ✕
                        </button>
                    </div>
                </div>
            )} */}

            {/* 비회원 비밀번호 수정 */}
            {showGuestPwModal && (
                <div className="fixed inset-0 bg-black bg-opacity-40 flex items-center justify-center z-50">
                    <div className="bg-white p-6 rounded-lg w-[420px] shadow-lg relative">
                        <h3 className="text-lg font-bold mb-4">비회원 비밀번호 수정</h3>

                        {generatedGuestPw ? (
                            <div className="p-3 mb-4 border rounded bg-gray-100 text-center">
                                <p className="text-sm text-gray-600 mb-1">새 임시 비밀번호</p>
                                <p className="text-xl font-bold texxt-red-600">{generatedGuestPw}</p>
                            </div>
                        ) : (
                            <p className="text-sm text-gray-500 mb-4">아직 발급된 비밀번호가 없습니다.</p>
                        )}

                        <button
                            onClick={handleGuestPwUpdate}
                            className="mt-4 w-full bg-blue-600 text-white py-2 rounded hover:bg-blue-700"
                        >
                            임시 비밀번호 발급
                        </button>

                        <button
                            onClick={() => setShowGuestPwModal(false)}
                            className="absolute top-3 right-3 text-gray-400 hover:text-black"
                        >
                            ✕
                        </button>
                    </div>
                </div>
            )}
        </div>
    )
}

export default Order_Detail;