import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import axios from 'axios';

const Admin_BizList = () => {
    const API = process.env.REACT_APP_API_BASE;
    const navigate = useNavigate();
    const [orders, setOrders] = useState([]);
    const [filtered, setFiltered] = useState([]);

    // 검색/필터 상태
    const [filters, setFilters] = useState({
        keyword: '',
        startDate: '',
        endDate: '',
        isSecret: 'all',
        replyExists:'all'
    })

    useEffect(() => {
        axios.get(`${API}/biz/list`)
            .then((res) => {
                setOrders(res.data);
                setFiltered(res.data);
            })
            .catch(() => console.log('기업 주문 목록을 불러오지 못했습니다.'));
    }, []);

    // 필터 초기화
    const resetFilters = () => {
        setFilters({
            keyword: '',
            startDate: '',
            endDate: '',
            isSecret: 'all',
            replyExists:'all'
        })
    }

    // 필터링 함수
    const applyFilters = () => {
        const keyword = filters.keyword.toLowerCase();

        const result = orders.filter(order => {
            const inKeyword =
                order.title.toLowerCase().includes(keyword) ||
                order.managerName.toLowerCase().includes(keyword) ||
                order.companyName.toLowerCase().includes(keyword);

                const inDateRange = 
                    (!filters.startDate || order.createdAt >= filters.startDate) &&
                    (!filters.endDate || order.createdAt <= filters.endDate + 'T23:59:59');
                
                const inSecret = filters.isSecret === 'all' || String(order.isSecret) === filters.isSecret;
                const inReply = filters.replyExists === 'all' || String(order.replyExists) === filters.replyExists;

                return inKeyword && inDateRange && inSecret && inReply;
        });

        setFiltered(result);
    };

    useEffect(() => {
        applyFilters();
    }, [filters, orders])

     // ✅ 페이징 관련 상태
    const [currentPage, setCurrentPage] = useState(1);
    const ordersPerPage = 10;     // 한 페이지당 표시할 항목 수
    const pageGroupSize = 10;     // 페이지 버튼 묶음 크기

    const totalPages = Math.max(1, Math.ceil(filtered.length / ordersPerPage));
    const currentGroup = Math.floor((currentPage - 1) / pageGroupSize);
    const groupStart = currentGroup * pageGroupSize + 1;
    const groupEnd = Math.min(groupStart + pageGroupSize - 1, totalPages);

    const currentOrders = filtered.slice(
        (currentPage - 1) * ordersPerPage,
        currentPage * ordersPerPage
    );

    return (
        <div className="w-full mx-auto mt-20 px-6">
            <h2 className="text-center text-3xl font-bold mb-8">기업 주문 관리</h2>
            
            {/* 🔍 필터 UI */}
            <div className="flex flex-wrap gap-3 items-center text-sm mb-4">
                <select
                value={filters.isSecret}
                onChange={(e) => setFilters({ ...filters, isSecret: e.target.value })}
                className="border p-2"
                >
                <option value="all">전체 공개여부</option>
                <option value="1">비공개</option>
                <option value="0">공개</option>
                </select>

                <select
                value={filters.replyExists}
                onChange={(e) => setFilters({ ...filters, replyExists: e.target.value })}
                className="border p-2"
                >
                <option value="all">전체 답변상태</option>
                <option value="1">답변완료</option>
                <option value="0">미답변</option>
                </select>
                
                <input
                type="date"
                value={filters.startDate}
                onChange={(e) => setFilters({ ...filters, startDate: e.target.value })}
                className="border p-2"
                />
                <span>~</span>
                <input
                type="date"
                value={filters.endDate}
                onChange={(e) => setFilters({ ...filters, endDate: e.target.value })}
                className="border p-2"
                />

                <input
                type="text"
                placeholder="제목 / 회사명 / 담당자 검색"
                value={filters.keyword}
                onChange={(e) => setFilters({ ...filters, keyword: e.target.value })}
                className="border p-2 w-64"
                />

                <button className="px-4 py-2 font-bold bg-blue-500 text-white"
                    onClick={resetFilters}
                >
                    초기화
                </button>
            </div>
            
            <table className="w-full border text-center">
                <thead>
                    <tr className="bg-gray-300 ">
                        <th className="border p-2 w-12">No</th>
                        <th className="border p-2">제목</th>
                        <th className="border p-2">회사명</th>
                        <th className="border p-2">담당자</th>
                        <th className="border p-2">작성일</th>
                        <th className="border p-2">비밀글</th>
                        <th className="border p-2">답변</th>
                        <th className="border p-2">관리</th>
                    </tr>
                </thead>
                <tbody>
                    {filtered.length === 0 ? (
                        <tr>
                            <td colSpan="8" className="p-6">등록된 주문이 없습니다.</td>
                        </tr>
                    ) : (
                        filtered.map((order, i) => (
                            <tr key={order.id} className="hover:bg-gray-50">
                                <td className="border p-2">{orders.length - i}</td>
                                <td className="border p-2 text-left px-4">{order.title}</td>
                                <td className="border p-2">{order.companyName}</td>
                                <td className="border p-2">{order.managerName}</td>
                                <td className="border p-2">{order.createdAt.substring(0, 10)}</td>
                                <td className="border p-2">{order.isSecret == 1 ? '비공개🔒' : '공개'}</td>
                                <td className="border p-2 text-sm font-semibold text-center">
                                    <span className={order.replyExists == 1 ? 'text-blue-600' : 'text-red-500'}>
                                        {order.replyExists == 1 ? '답변완료' : '미답변'}
                                    </span>
                                </td>
                                <td className="border p-2">
                                    <button
                                        className="text-blue-600 hover:underline"
                                        onClick={() => navigate(`/admin/biz/view/${order.id}`)}
                                    >
                                         상세
                                    </button>
                                </td>
                            </tr>
                        ))
                    )}
                </tbody>
            </table>
            {/* ✅ 페이지네이션 */}
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
                    <button
                        key={page}
                        onClick={() => setCurrentPage(page)}
                        className={`w-8 h-8 flex items-center justify-center rounded-full ${
                            currentPage === page
                                ? 'bg-black text-white'
                                : 'text-gray-700 hover:bg-gray-100'
                        }`}
                    >
                        {page}
                    </button>
                ))}

                <button
                    onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
                    disabled={currentPage === totalPages}
                    className="w-8 h-8 flex items-center justify-center text-gray-500 hover:text-black"
                >
                    {'>'}
                </button>

                <button
                    onClick={() => setCurrentPage(Math.min(totalPages, groupStart + pageGroupSize))}
                    disabled={groupEnd === totalPages}
                    className="w-8 h-8 flex items-center justify-center text-gray-500 hover:text-black"
                >
                    {'>>'}
                </button>
            </div>
        </div>
    )
}

export default Admin_BizList;