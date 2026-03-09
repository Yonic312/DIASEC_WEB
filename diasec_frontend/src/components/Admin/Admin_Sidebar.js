import { useContext, useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom'
import { MemberContext } from '../../context/MemberContext'
import axios from 'axios';

const Admin_Sidebar = () => {
    const API = process.env.REACT_APP_API_BASE;
    const { member } = useContext(MemberContext);
    const navigate = useNavigate();

    const [ inquiryUnanswered,setInquiryUnanswered ] = useState(0);

    const [inquiries, setInquiries] = useState([]);

    const [pendingAuthorCount, setPendingAuthorCount] = useState(0);
    const [pendingWorkCount, setPendingWorkCount] = useState(0);

    const [orderCounts, setOrderCounts] = useState({});

    // 토글 상태
    const [openOrderStatus, setOpenOrderStatus] = useState(false);

    // 표시 순서(원하는대로)
    const ORDER_STATUS_LIST = useMemo(() => ([
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
        '환불완료'
    ]), []);

    // 전체 합계(토글 버튼에 표시)
    const totalOrderCount = ORDER_STATUS_LIST.reduce(
        (sum, s) => sum + (orderCounts[s] || 0),
        0
    );

    // 주문 상태별 개수 불러오기
    useEffect(() => {
        axios.get(`${API}/order/admin/count-by-status`, { withCredentials: true })
        .then(res => {
            const map = {};
            (res.data || []).forEach(r => {
                const status = r.status;
                const cnt = Number(r.cnt || 0);
                map[status] = cnt;
            });
            setOrderCounts(map);
        })
        .catch(err => console.error("주문 상태 불러오기 실패", err));
    }, [API])

    // 🔹 추가: 작가/작품 대기 카운트 로드
    useEffect(() => {
        // 1) 심사 대기 "작가 수"
        axios.get(`${API}/author/pending-count`, { withCredentials: true })
        .then(res => setPendingAuthorCount(res.data ?? 0))
        .catch(err => console.error('author/pending-count 실패', err));

        // 2) 심사 대기 "작품 수" 합계 (author 목록의 pending_count 합)
        axios.get(`${API}/author/authors`, { withCredentials: true })
        .then(res => {
            const list = res.data || [];
            const totalPendingWorks = list.reduce((sum, r) => sum + (r.pending_count ?? 0), 0);
            setPendingWorkCount(totalPendingWorks);
        })
        .catch(err => console.error('author/authors 실패', err));
    }, [API]);

    useEffect(() => {
        axios.get(`${API}/inquiry/unanswered`)
        .then(res => {
            setInquiryUnanswered(res.data);
        })
        .catch(err => console.error('inquiry/unanswered 불러오기 실패 : ' + err));
    })

    useEffect(() => {
        axios.get(`${API}/biz/list`)
            .then(res => {
                setInquiries(res.data)
                console.log(res.data);
            })
            .catch(err => console.error('불러오기 실패', err));
    }, []);

    return (
        <div className="flex flex-col items-start w-[200px] mr-4 gap-3 mb-20">
            <button className="text-2xl mb-10">Admin Page</button>
            
            <span className="text-lg font-bold">상품 관리</span>
            <button className="text-sm opacity-65" onClick={() => navigate('/admin/insert_Product')}>상품 등록하기</button>
            <button className="text-sm opacity-65" onClick={() => navigate('/admin_ProductManager')}>상품 수정</button>
            <button className="text-sm opacity-65" onClick={() => navigate('/admin_CollectionManager')}>컬렉션 관리</button>
            
            <span className="text-lg font-bold mt-10">주문 관리</span>
            
            <div className="w-full">
                <button className="text-sm opacity-65" onClick={() => navigate('/admin/order_Status')}>
                    주문 상태 변경 &nbsp;
                </button>
                <button type="button" className="text-sm opacity-65" onClick={() => setOpenOrderStatus(v => !v)}>
                    {totalOrderCount}건 {openOrderStatus ? '▲' : '▼'}
                </button>

                {openOrderStatus && (
                    <div className="mt-1 w-full flex flex-col gap-1">
                        {ORDER_STATUS_LIST.map(status => (
                            <button
                                key={status}
                                type="button"
                                className="w-full text-[13px] opacity-70 flex items-center justify-between hover:opacity-100"
                                onClick={() => navigate(`/admin/order_Status?status=${encodeURIComponent(status)}`)}
                            >
                                <span>{status}</span>
                                <span>
                                    {(orderCounts[status] || 0).toLocaleString()}건
                                </span>
                            </button>
                        ))}
                    </div>
                )}

                
            </div>
            <button className="text-sm opacity-65"
                onClick={() => navigate(`/admin_AdminRetouchList`)}
            >
                보정 요청사항
            </button>

            <span className="text-lg font-bold mt-10">정보 관리</span>
            <button className="text-sm opacity-65" onClick={() => navigate('/admin_MemberManager')}>회원 정보 관리</button>
            {/* <button className="text-sm opacity-65" onClick={() => navigate('/admin_AuthorManager')}>작가 상태 관리({pendingAuthorCount}명 / {pendingWorkCount}건)</button> */}

            <span className="text-lg font-bold mt-10">문의 관리</span>
            <button className="text-sm opacity-65" onClick={() => navigate('/admin_InquiryList')}>고객 문의 답변하기({inquiryUnanswered}건)</button>
            {/* <button className="text-sm opacity-65" onClick={() => navigate('/admin_BizList')}>기업주문 답변하기({inquiries[0]?.unansweredCount || 0}건)</button> */}

            <span className="text-lg font-bold mt-10">콘텐츠 관리</span>
            <button className="text-sm opacity-65" onClick={() => navigate('/admin_NoticeManager')}>공지사항 관리</button>
            <button className="text-sm opacity-65" onClick={() => navigate('/admin_FAQManager')}>FAQ 관리</button>
            <button className="text-sm opacity-65" onClick={() => navigate('/admin_ReviewManager')}>후기 관리</button>
            <button className="text-sm opacity-65" onClick={() => navigate('/admin_EventManager')}>이벤트 관리</button>
        </div>
    )
}

export default Admin_Sidebar;