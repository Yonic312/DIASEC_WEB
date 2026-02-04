import { useState, useEffect, useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import { MemberContext } from '../../../context/MemberContext';
import { toast } from 'react-toastify';
import thumbCustom from '../../../assets/CustomFrames/customFrames.png';

const OrderList = () => {
    const API = process.env.REACT_APP_API_BASE;
    const navigate = useNavigate();
    const { member } = useContext(MemberContext);
    const [startDate, setStartDate] = useState('');
    const [endDate, setEndDate] = useState('');

    // 주문 목록
    const [orderList, setOrderList] = useState([]);

    // 오늘 날짜 설정하기
    useEffect(() => {
        const today = new Date()
        const start = today.toISOString().split('T')[0];

        const oneMonthEarly = new Date(today);
        oneMonthEarly.setMonth(oneMonthEarly.getMonth() - 3);
        const earlyOneMonth = oneMonthEarly.toISOString().split('T')[0];

        setStartDate(earlyOneMonth);
        setEndDate(start);
    }, []);

    // 날짜 계산 (버튼)
    const handleRangeClick = (months) => {
        const end = new Date(endDate);
        const newStart = new Date(end);
        newStart.setMonth(end.getMonth() - months);

        setStartDate(newStart.toISOString().split('T')[0]);
    }

    const handleToday = () => {
        const today = new Date();
        const todayStr = today.toISOString().split('T')[0];
        setStartDate(todayStr);
        setEndDate(todayStr);
    };

    // 검색 필터
    const [statusFilter, setStatusFilter] = useState('전체');

    const statusOptions = [
        '전체',
        '입금대기',
        '결제완료',
        '배송준비중',
        '배송중',
        '배송완료',
        '취소요청',
        '취소',
        '교환신청',
        '교환회수완료',
        '교환배송중',
        '교환완료',
        '반품신청',
        '반품회수완료',
        '환불처리중',
        '환불완료',
    ];

    // 목록 불러오기
    const handleSearch = () => {
        if (!member?.id) {
            toast.error('로그인을 먼저 해주세요.');
            return;
        }

        fetch(`${API}/order/list`, {
            method: 'POST',
            credentials: 'include',
            headers: {'Content-Type': 'application/json'},
            body: JSON.stringify({
                id: member.id,
                startDate,
                endDate,
                status: statusFilter
            })
        })
            .then(res => res.json())
            .then(data => {
                const filtered =data.flatMap(order => {
                    const matchingItems = order.items.filter(item =>
                        (statusFilter === '전체' || item.orderStatus === statusFilter) &&
                        order.createdAt.slice(0, 10) >= startDate && 
                        order.createdAt.slice(0, 10) <= endDate
                    );
                    return matchingItems.length > 0 ? [{ ...order, items: matchingItems }] : [];
                });
                setOrderList(filtered);
            })
            .catch(err => console.error("주문 목록 불러오기 실패", err));
    };

    // 기본값으로 값 조회
    useEffect(() => {
        if (member?.id && startDate && endDate) {
            setCurrentPage(1);
            handleSearch();
        }
    }, [member, startDate, endDate, statusFilter]);

    // 주문 취소 함수
    const handleCancelOrder = (order) => {
        if (order.items.every(item => item.orderStatus === '입금대기')) {
            if (!window.confirm(`주문번호 ${order.oid}의 전체 상품을 취소하시겠습니까?`)) return;
            // 즉시 취소 처리
            fetch(`${API}/order/cancel`, {
            method: 'POST',
            credentials:'include',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ 
                id: member.id, 
                oid: order.oid,
                usedCredit: order.usedCredit 
                }) 
            })
            .then(res => res.json())
            .then(data => {
                if (data.success) {
                toast.success('주문이 취소되었습니다.');
                handleSearch();
            } else {
                toast.error('취소 실패 : ' + data.message);
            }
        })
        .catch(err => toast.error('요청 실패'));    
        } else if (order.items.every(item => item.orderStatus === '결제완료')) {
            if (!window.confirm(`결제된 주문입니다. 취소 요청만 가능합니다. 취소 요청을 보내시겠습니까?`)) return;
            // 취소 요청 API 호출
            fetch(`${API}/order/cancelRequest`, {
                method: 'POST',
                headers: {'Content-Type' : 'application/json' },
                body: JSON.stringify({ oid: order.oid, id: member.id })
            })
            .then(res => res.json())
            .then(data => {
                if (data.success) {
                    toast.success('취소 요청이 접수되었습니다.');
                    handleSearch();
                } else {
                    toast.error('취소 요청 실패: ' + data.message);
                }
            })
            .catch(err => toast.error('요청 실패'));
        } else {
            toast.warn('해당 주문은 현재 취소할 수 없습니다.');
        }     
    };

    // 페이징
    const [currentPage, setCurrentPage] = useState(1);
    const itemsPerPage = 5;

    const [pageGroupSize, setPageGroupSize] = useState(
        window.innerWidth < 640 ? 5 : 10
    );

    useEffect(() => {
        const handleResize = () => {
            setPageGroupSize(window.innerWidth < 640 ? 5 : 10);
        };
        window.addEventListener("resize", handleResize);
        return () => window.removeEventListener("resize", handleResize);
    }, []);

    const totalPages = Math.max(1, Math.ceil(orderList.length / itemsPerPage));
    const currentGroup = Math.floor((currentPage - 1) / pageGroupSize);
    const groupStart = currentGroup * pageGroupSize + 1;
    const groupEnd = Math.min(groupStart + pageGroupSize - 1, totalPages);

    const currentOrders = orderList.slice(
        (currentPage - 1) * itemsPerPage,
        currentPage * itemsPerPage
    );

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

    // 리스상품 반납일 계산기
    const calculateRemainingDays = (leaseEnd) => {
        const endDate = new Date(leaseEnd);
        const today = new Date();
        const timeDiff = endDate - today;

        if (isNaN(timeDiff)) return null;

        const days = Math.ceil(timeDiff / (1000 * 60 * 60 * 24));
        return days > 0 ? days : 0;
    }

    return (
        <div className="flex flex-col w-full mb-20 mr-2">
            <span className="
                md:text-xl text-[clamp(14px,2.607vw,20px)]
                font-bold pb-6">| 주문내역 조회</span>

            <hr />

            <div className="
                w-full sm:p-[24px] p-2 bg-[#f6f6f6] text-sm flex 
                xl:flex-row flex-col
                ">
                <div className="
                    md:text-base text-[clamp(11px,2.085vw,16px)]
                    flex sm:flex-row flex-col">
                    <select value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)} 
                        className="
                            sm:w-[120px] w-[102px]
                            sm:h-[40px] h-[30px]
                            xl:mb-0 mb-2
                            border-[1px] text-center sm:mr-4 mr-[2px] bg-white">
                        {statusOptions.map(status => (
                            <option key={status} value={status}>{status}</option>
                        ))}
                    </select>
                    <div className="
                        flex sm:gap-2 gap-[2px]
                        xl:mb-0 mb-2
                    ">
                        <button 
                            className="
                                w-[50px] 
                                sm:h-[40px] h-[30px] 
                                border-[1px] bg-white" onClick={handleToday}>오늘</button>
                        <button className="
                                w-[50px] 
                                sm:h-[40px] h-[30px] 
                                border-[1px] bg-white" onClick={() => handleRangeClick(1)}>1개월</button>
                        <button className="
                                w-[50px] 
                                sm:h-[40px] h-[30px] 
                                border-[1px] bg-white" onClick={() => handleRangeClick(3)}>3개월</button>
                        <button className="
                                w-[50px] 
                                sm:h-[40px] h-[30px] 
                                border-[1px] bg-white" onClick={() => handleRangeClick(6)}>6개월</button>
                    </div>
                </div>
                <div className="md:text-base text-[clamp(11px,2.085vw,16px)]">
                    <input type="date" 
                        className="
                            sm:w-[140px] w-[90px] 
                            sm:h-[40px] h-[30px]
                            border-[1px] border-opacity-15 text-center" value={startDate} onChange={(e) => setStartDate(e.target.value)}></input>
                    <span className="mx-2">~</span>
                    <input type="date" 
                        className="
                            sm:w-[140px] w-[90px] 
                            sm:h-[40px] h-[30px]
                            border-[1px] border-opacity-15 text-center mr-2" value={endDate} onChange={(e) => setEndDate(e.target.value)}></input>
                </div>
            </div>

            <hr/>
            {currentOrders.length === 0 ? (
                <div className="
                    text-center py-10 
                    md:text-sm text-[clamp(11px,1.8252vw,14px)]
                    text-gray-500">조회된 주문이 없습니다.</div>
            ) : (
                currentOrders.map((order, oidx) => (
                        // <div key={order.oid} onClick={() => navigate(`/orderDetail/${order.itemId}`)} 
                        <div key={order.oid} 
                        className="
                            border rounded 
                            sm:p-4 p-2
                            sm:mb-4 mb-2 bg-white shadow-sm"> 

                            {/* 주문번호 및 날짜 */}
                            <div 
                                className="flex justify-between items-center 
                                    md:text-sm text-[clamp(11px,1.8252vw,14px)]
                                    text-gray-500">
                                <span className='font-medium'>
                                    {order.createdAt?.slice(0, 10)} · 주문번호: {order.oid}
                                </span>
                                {/* 주문 내 모든 아이템이 취소 가능한 상태일 때만 버튼 보여주기 */}
                                <div>
                                    {order.items.every(item => ['입금대기', '결제완료'].includes(item.orderStatus)) && (
                                        <button 
                                            onClick={(e) => {
                                                e.stopPropagation();
                                                handleCancelOrder(order);
                                            }}
                                            className="
                                                sm:px-2 px-[2px] py-1 border border-red-400 text-red-500 
                                                md:text-[10px] text-[clamp(8px,1.303vw,10px)]
                                                rounded hover:bg-red-50"
                                        >
                                            주문 취소
                                        </button>
                                    )}
                                    <button
                                        onClick={() => navigate(`/orderDetail/${order.oid}`)}
                                        className='
                                            ml-2 sm:px-2 px-[2px] py-1 border border-gray-400 text-gray-700 
                                            md:text-[10px] text-[clamp(8px,1.303vw,10px)]
                                            rounded hover:bg-gray-100'
                                    >주문 상세</button>
                                </div>
                            </div>

                            {/* 주문 상품들 */}
                            {order.items.map((item, iidx) => (
                                <div key={item.itemId} 
                                    className='flex flex-col'>
                                    <div className="
                                        flex items-center gap-2 mt-1 
                                        md:text-sm text-[clamp(11px,1.8252vw,14px)]
                                        text-gray-700">
                                        {/* 배송 상태 */}
                                        <span className="
                                            text-sm md:text-base
                                            font-semibold text-black
                                            ">
                                            {item.orderStatus}
                                        </span>
                                        

                                        {item.trackingCompany && (
                                            <>
                                                <span className="text-gray-400">|</span>
                                                <span className="text-gray-600">{item.trackingCompany}</span>
                                            </>
                                        )}

                                        {item.trackingNumber && (
                                            <span className="text-blue-500 font-medium">{item.trackingNumber}</span>
                                        )}
                                    </div>

                                    <div className='flex flex-row gap-4 py-2'>
                                        <img src={item.category === 'customFrames' ? thumbCustom : item.thumbnail} alt={item.title} 
                                            className="
                                                md:w-20 w-[clamp(4rem,10.43vw,5rem)]
                                                md:h-20 h-[clamp(4rem,10.43vw,5rem)]
                                                object-cover rounded border" />
                                        <div 
                                            className="
                                                flex sm:justify-between flex-1 text-gray-500">
                                            <div 
                                                className="
                                                    flex flex-col w-full
                                                    md:text-sm text-[clamp(9px,1.825vw,14px)]
                                            ">
                                                <span className="font-bold text-black">{item.title}</span>
                                                <span>카테고리: {convertCategoryName(item.category)}</span>
                                                <div className="flex sm:flex-row flex-col">
                                                    <span>사이즈: </span>
                                                    <span>{convertInchToCm(item.size)} ({item.quantity}개)</span>
                                                </div>
                                                {item.category === 'lease' && (
                                                `기간 : ${item.period}`
                                                )}

                                                {item.category === 'lease' && item.leaseStart && (
                                                    ` / (${item.leaseStart} ~ ${item.leaseEnd})`)
                                                }

                                                {item.category === 'lease' && !item.leaseStart && (
                                                    ` / 리스 기간이 아직 등록되지 않았습니다.`)
                                                }

                                                {item.category === 'lease' && item.leaseEnd && (
                                                    ` / 남은 기간: ${calculateRemainingDays(item.leaseEnd)}일`)
                                                }
                                                <div className="flex font-bold ml-auto"><span>{(item.price).toLocaleString()}원</span></div>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )
                )
            )}

            <div 
                className="
                    md:text-sm text-[clamp(10px,1.8252vw,14px)]
                    flex justify-center items-center sm:gap-2 gap-[1px] mt-10 mb-10">
                <button 
                    onClick={() => setCurrentPage(Math.max(1, groupStart - pageGroupSize))}
                    disabled={groupStart === 1}
                    className="
                        sm:w-8 w-6
                        sm:h-8 h-6     
                        flex items-center justify-center text-gray-500 hover:text-black"
                >
                    {'<<'}
                </button>

                <button 
                    onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
                    disabled={currentPage === 1}
                    className="
                        sm:w-8 w-6
                        sm:h-8 h-6 
                        flex items-center justify-center text-gray-500 hover:text-black"
                >
                    {'<'}
                </button>

                {Array.from({ length: groupEnd - groupStart + 1 }, (_, i) => groupStart + i).map(page => (
                    <button key={page}
                            onClick={() => setCurrentPage(page)}
                            className={`
                                sm:w-8 w-6
                                sm:h-8 h-6
                                flex items-center justify-center rounded-full ${
                            currentPage === page ? 'bg-black text-white' : 'text-gray-700 hover:bg-gray-100'
                            }`}>
                    {page}
                    </button>
                ))}

                <button onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
                    disabled={currentPage === totalPages}
                    className="
                        sm:w-8 w-6
                        sm:h-8 h-6 
                        flex items-center justify-center text-gray-500 hover:text-black"
                >
                    {'>'}
                </button>

                <button onClick={() => setCurrentPage(Math.min(totalPages, groupStart + pageGroupSize))}
                    disabled={groupEnd === totalPages}
                    className="
                        sm:w-8 w-6
                        sm:h-8 h-6 
                        flex items-center justify-center text-gray-500 hover:text-black"
                >
                    {'>>'}
                </button>
            </div>
        </div>
    );
};

export default OrderList;