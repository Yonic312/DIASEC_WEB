import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';

const Order_Status = () => {
    const API = process.env.REACT_APP_API_BASE;
    const navigate = useNavigate();
    const [orderList, setOrderList] = useState([]);
    const [statusFilter, setStatusFilter] = useState('전체');
    const [categoryFilter, setCategoryFilter] = useState('전체'); // 카테고리 필터

    // 심사 대기중인 사람 수
    const [pendingAuthorCount, setPendingAuthorCount] = useState(0);

    // 검색
    const [keyword, setKeyword] = useState('');

    // 날짜 검색
    const [startDate, setStartDate] = useState('');
    const [endDate, setEndDate] = useState('');

    useEffect(() => {
        const today = new Date();
        const start = today.toISOString().split('T')[0];

        const oneMonthEarly = new Date(today);
        oneMonthEarly.setMonth(oneMonthEarly.getMonth() - 1);
        const earlyOneMonth = oneMonthEarly.toISOString().split('T')[0];

        setStartDate(earlyOneMonth);
        setEndDate(start);
    }, []);

    const handleRangeClick = (months) => {
        const end = new Date(endDate);
        const newStart = new Date(end);
        newStart.setMonth(end.getMonth() - months);
        setStartDate(newStart.toISOString().split('T')[0]);
    };

    const handleToday = () => {
        const today = new Date();
        const todayStr = today.toISOString().split('T')[0];
        setStartDate(todayStr);
        setEndDate(todayStr);
    };

    // 진행 상태
    const statusOptions = [
        '전체', '입금대기', '결제완료', '배송준비중', '배송중', '배송완료', 
        '취소요청', '취소', '교환신청', '교환회수완료', '교환배송중', '교환완료', 
        '반품신청', '반품회수완료', '환불처리중', '환불완료'
    ];

    // 목록 불러오기
    useEffect(() => {
        fetchOrders();
    }, [statusFilter, categoryFilter, startDate, endDate, keyword]);

    const fetchOrders = () => {
        fetch(`${API}/admin/orders`, {
            method: 'POST',
            headers: {'Content-Type' : 'application/json'},
            credentials: 'include',
            body: JSON.stringify({ 
                status: statusFilter,
                startDate,
                endDate,
                keyword,
                category: categoryFilter === '전체' ? null : categoryFilter
             })
        })
        .then(res => res.json())
        .then(data => {
            const orderCountMap = {};
            data.forEach(item => {
                orderCountMap[item.oid] = (orderCountMap[item.oid] || 0) + 1;
            });

            // 각 item에 orderCount 붙이기
            const updatedList = data.map(item => ({
                ...item,
                orderCount: orderCountMap[item.oid],
            }));

            setOrderList(updatedList);
        })
        .catch(err => console.error("전체 주문 불러오기 실패", err));
    };

    // 진행상태 업데이트
    const handleStatusChange = (itemId, newStatus, id, usedCredit, oid) => {
        console.log("usedCredit : " , usedCredit);
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
                fetchOrders();
            } else {
                toast.error('상태 변경 실패');
            }
        })
        .catch(err => console.error("상태 변경 요청 실패", err));
    };

    // 진행 상태 폰트색
    const statusBadgeColor = (status) => {
        if (status.includes(["반품신청"]) || status.includes(["교환신청"])) return 'text-red-500';
        if (status.includes("완료")) return 'text-green-600';
        if (status.includes("배송") || status.includes("처리중")) return 'text-blue-500';
        if (status === '입금대기') return 'text-yellow-600';
        return 'text-gray-600';
    }

    // 카테고리 매핑
    const categoryMap = {
        wall : '벽걸이',
        table: '탁상용',
        clock: '시계',
        fengShui: '풍수',
        masterPiece: '명화',
        authorCollection: '작가',
        lease: '리스',
        masterPiece_wall: '명화(벽걸이)',
        masterPiece_table: '명화(탁상용)',
        masterPiece_clock: '명화(시계)',
        fengShui_wall: '풍수(벽걸이)',
        fengShui_table: '풍수(탁상용)',
        fengShui_clock: '풍수(시계)',
        authorCollection_wall: '작가(벽걸이)',
        authorCollection_table: '작가(탁상용)',
        authorCollection_clock: '작가(시계)',
        customFrames: '맞춤액자'
    }

    // 상세페이지 (모달창)
    const [selectedItem, setSelectedItem] = useState(null);
    const [showModal, setShowModal] = useState(false);

    // 모달 입력 필드 상태 정의
    const [trackingCompany, setTrackingCompany] = useState('');
    const [trackingNumber, setTrackingNumber] = useState('');
    const [bankName, setBankName] = useState('');
    const [accountNumber, setAccountNumber] = useState('');
    const [accountHolder, setAccountHolder] = useState('');

    const [customCompany, setCustomCompany] = useState(''); // 직접 입력일 때 사용하는 변수
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
                itemId: selectedItem.itemId,
                trackingCompany: finalTrackingCompany,
                trackingNumber
            }),
        })
        .then(res => res.json())
        .then(data => {
            if (data.success) {
                toast.success('저장되었습니다.')
                setShowModal(false);
                fetchOrders(); // 목록 갱신
            }
        })
        .catch(err => console.error("상세정보 저장 실패", err));
    }

    // 페이징
    const [currentPage, setCurrentPage] = useState(1);
    const itemsPerPage = 10;

    const totalPages = Math.max(1, Math.ceil(orderList.length / itemsPerPage));
    const currentItems = orderList.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage);

    const pageGroupSize = 10;
    const currentGroup = Math.floor((currentPage - 1) / pageGroupSize);
    const groupStart = currentGroup * pageGroupSize + 1;
    const groupEnd = Math.min(groupStart + pageGroupSize - 1, totalPages);

    return (
        <div className='mb-20'>
            <h2 className="text-2xl font-bold mb-6 text-gray-800">주문 상태 관리</h2>

            <div className="w-full p-[24px] bg-[#f6f6f6] text-sm flex flex-wrap gap-2 items-center">
                <select value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)} className="w-[120px] h-[40px] border text-center bg-white">
                    {statusOptions.map(status => (
                        <option key={status} value={status}>{status}</option>
                    ))}
                </select>
                <select 
                    value={categoryFilter}
                    onChange={(e) => setCategoryFilter(e.target.value)}
                    className="w-[120px] h-[40px] border text-center bg-white"
                >
                    <option value="전체">전체 카테고리</option>
                    <option value="masterPiece_wall">명화(벽걸이)</option>
                    <option value="masterPiece_table">명화(탁상용)</option>
                    <option value="masterPiece_clock">명화(시계)</option>
                    <option value="fengShui_wall">풍수(벽걸이)</option>
                    <option value="fengShui_table">풍수(탁상용)</option>
                    <option value="fengShui_clock">풍수(시계)</option>
                    <option value="authorCollection_wall">작가(벽걸이)</option>
                    <option value="authorCollection_table">작가(탁상용)</option>
                    <option value="authorCollection_clock">작가(시계)</option>
                    <option value="customFrames">맞춤액자</option>
                    <option value="lease">리스</option>
                </select>
                <button className="w-[65px] h-[40px] border bg-white" onClick={handleToday}>오늘</button>
                <button className="w-[65px] h-[40px] border bg-white" onClick={() => handleRangeClick(1)}>1개월</button>
                <button className="w-[65px] h-[40px] border bg-white" onClick={() => handleRangeClick(3)}>3개월</button>
                <button className="w-[65px] h-[40px] border bg-white" onClick={() => handleRangeClick(6)}>6개월</button>

                <input type="date" className="w-[130px] h-[40px] border text-center" value={startDate} onChange={(e) => setStartDate(e.target.value)} />
                <span className="mx-1">~</span>
                <input type="date" className="w-[130px] h-[40px] border text-center" value={endDate} onChange={(e) => setEndDate(e.target.value)} />
                
                <input type="text" placeholder="회원ID 또는 상품명" className="w-[180px] h-[40px] border text-sm px-3" value={keyword} onChange={(e) => setKeyword(e.target.value)} />

                {/* <button className="w-[64px] h-[40px] border text-sm font-bold bg-[#555555] text-white"
                    onClick={fetchOrders}>조회
                </button> */}
            </div>
            
            {currentItems.length === 0 ? (
                <div className="text-center text-gray-400 text-sm py-20">
                    조회된 주문이 없습니다
                </div>
            ) : (
                <table className="w-full text-sm border-collapse">
                    <thead className="bg-gray-100 border-b">
                        <tr>
                            <th className="w-[8%] p-3 text-left font-medium text-gray-700">주문번호</th>
                            <th className="w-[10%] p-3 text-left font-medium text-gray-700">주문일자</th>
                            <th className="w-[10%] p-3 text-left font-medium text-gray-700">회원ID</th>
                            <th className="w-[11%] p-3 text-left font-medium text-gray-700">카테고리</th>
                            <th className="w-[22%] p-3 text-left font-medium text-gray-700">상품명</th>
                            <th className="w-[5%] p-3 text-center font-medium text-gray-700">수량</th>
                            <th className="w-[10%] p-3 text-center font-medium text-gray-700">단가</th>
                            <th className="w-[10%] p-3 text-center font-medium text-gray-700">총금액</th>
                            <th className="w-[8.5%] p-3 text-center font-medium text-gray-700">상태</th>
                            <th className="w-[5.5%] p-3 text-center font-medium text-gray-700">변경</th>
                        </tr>
                    </thead>
                    <tbody>
                        {(() => {
                            let prevOid = null;
                            return currentItems.map((item, idx) => {
                                const isSameOid = prevOid === item.oid;
                                prevOid = item.oid;
                                
                                return (
                                    <tr key={idx} 
                                        className="hover:bg-gray-100 border-b cursor-pointer"
                                        onClick={() => {
                                            navigate(`/admin/order_Detail/${item.itemId}`, { state: { orderCount: item.orderCount } });
                                        }}
                                    >
                                        <td className="p-3">{isSameOid ? '' : item.oid}</td>
                                        <td className="p-3">{isSameOid ? '' : item.createdAt?.slice(0, 10)}</td>
                                        <td className="p-3">{isSameOid ? '' : item.id == '' ? '비회원' : item.id}</td>
                                        <td className="p-3">{categoryMap[item.category] || item.category}</td>
                                        <td className={`p-3 ${(item.category == 'customFrames' && item?.thumbnail) ? 'text-red-500' : 'text-black'}`}>{item.title}</td>
                                        <td className="p-3 text-center">{item.quantity}</td>
                                        <td className="p-3 text-center">{item.price?.toLocaleString()}원</td>
                                        <td className="p-3 text-center">{(item.price * item.quantity).toLocaleString()}원</td>
                                        <td className={`p-3 text-center font-semibold ${statusBadgeColor(item.orderStatus)}`}>
                                            {item.orderStatus}
                                        </td>
                                        <td className="p-3 text-center">
                                            <select
                                                value={item.orderStatus}
                                                onClick={(e) => e.stopPropagation()} 
                                                onChange={(e) => handleStatusChange(item.itemId, e.target.value, item.id, item.usedCredit, item.oid)}
                                                className="border rounded px-2 py-1 text-sm">
                                            {statusOptions.map(status => (
                                                <option key={status} value={status}>{status}</option>
                                            ))}
                                            </select>
                                        </td>
                                    </tr>
                                );
                            });
                        })()}
                    </tbody>
                </table>
            )}

            <div className="text-right mt-1 text-xs text-red-500">
                ※ 환불완료/교환완료 선택 시 적립금 자동 반환됨
            </div>

            {/* 페이징 */}
            <div className="flex justify-center items-center gap-2 mt-10 mb-10 text-sm">
                <button 
                    onClick={() => setCurrentPage(Math.max(1, groupStart - pageGroupSize))}
                    disabled={groupStart === 1}
                    className="w-8 h-8 flex items-center justify-center text-gray-500 hover:text-black"
                >
                    {'<<'}
                </button>
                
                <button 
                    onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
                    disabled={currentPage === 1}
                    className="w-8 h-8 flex items-center justify-center text-gray-500 hover:text-black"
                >
                    {'<'}
                </button>

                {Array.from({ length: groupEnd - groupStart + 1 }, (_, i) => groupStart + i).map(page => (
                    <button key={page}
                            onClick={() => setCurrentPage(page)}
                            className={`w-8 h-8 flex items-center justify-center rounded-full ${
                            currentPage === page ? 'bg-black text-white' : 'text-gray-700 hover:bg-gray-100'
                            }`}>
                    {page}
                    </button>
                ))}

                <button onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
                    disabled={currentPage === totalPages}
                    className="w-8 h-8 flex items-center justify-center text-gray-500 hover:text-black"
                >
                    {'>'}
                </button>

                <button onClick={() => setCurrentPage(Math.min(totalPages, groupStart + pageGroupSize))}
                    disabled={groupEnd === totalPages}
                    className="w-8 h-8 flex items-center justify-center text-gray-500 hover:text-black"
                >
                    {'>>'}
                </button>
            </div>

            {/* 상세 페이지 모달창 */}
            {showModal && selectedItem && (
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
                                onChange={(e) => setTrackingCompany(e.target.value)}
                            >
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
                        {selectedItem.orderStatus.includes('환불') || selectedItem.orderStatus.includes('반품') ? (
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
        </div>
    )   
}

export default Order_Status;