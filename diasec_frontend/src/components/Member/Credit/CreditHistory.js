import { useContext, useEffect, useState } from 'react';
import axios from 'axios';
import { MemberContext } from '../../../context/MemberContext';

const CreditHistory = () => {
    const API = process.env.REACT_APP_API_BASE;
    const { member } = useContext(MemberContext);
    const [history, setHistory] = useState([]);

    // ✅ 페이징
    const [currentPage, setCurrentPage] = useState(1);
    const itemsPerPage = 10; // 테이블이니까 10개가 적당

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

    // 데이터 바뀌면 1페이지로
    useEffect(() => {
        setCurrentPage(1);
    }, [history.length]);

    const totalPages = Math.max(1, Math.ceil(history.length / itemsPerPage));
    const currentGroup = Math.floor((currentPage - 1) / pageGroupSize);
    const groupStart = currentGroup * pageGroupSize + 1;
    const groupEnd = Math.min(groupStart + pageGroupSize - 1, totalPages);

    const currentHistory = history.slice(
        (currentPage - 1) * itemsPerPage,
        currentPage * itemsPerPage
    );

    // 삭제/변경으로 페이지 초과 방지
    useEffect(() => {
        if (currentPage > totalPages) {
            setCurrentPage(totalPages);
        }
    }, [totalPages, currentPage]);

    useEffect(() => {
        if (!member?.id) return;

        axios.get(`${API}/credit/history/${member.id}`)
            .then(res => setHistory(res.data))
            .catch(err => {
                console.error("적립금 내역 불러오기 실패", err);
                setHistory([]);
            });
    }, [member?.id]);

    return (
        <div 
            className="
                md:px-10 px-[clamp(0.25rem,5.215vw,2.5rem)]
                w-full ">
            <h2 
                className="
                    md:text-xl text-[clamp(14px,2.607vw,20px)]
                    md:mb-4 mb-[clamp(0.25rem,1.92vw,1rem)]
                    font-bold
                    ">적립금 내역</h2>

            <div 
                className="
                    md:mb-4 mb-1
                    md:text-sm text-[clamp(9px,1.825vw,14px)]">
                <span className="font-medium">현재 보유 적립금: </span>
                <span className="font-bold">{history[0]?.credit?.toLocaleString()}원</span>
            </div>

            {history.length === 0 ? (
                <div className="text-gray-500">적립금 내역이 없습니다.</div>
            ) : (
                <table 
                    className="
                        md:text-sm text-[clamp(8px,1.825vw,14px)]
                        w-full border">
                    <thead className="bg-gray-100">
                        <tr>
                            <th className="md:py-2 py-1 border">날짜</th>
                            <th className="md:py-2 py-1 border">금액</th>
                            <th className="md:py-2 py-1 border">설명</th>
                            <th className="md:py-2 py-1 border">관련 주문</th>
                        </tr>
                    </thead>
                    <tbody>
                        {currentHistory.map(item => (
                            <tr key={item.cid} className="text-center">
                                <td className="md:py-2 py-1 border">{new Date(item.createdAt).toLocaleDateString()}</td>
                                <td className={`md:p-2 py-1 border font-semibold ${item.type === '사용' ? 'text-red-500' : 'text-green-600'}`}>
                                    {item.type === '사용' ? '-' : '+'}{item.amount.toLocaleString()}원
                                </td>
                                <td className="md:py-2 py-1 border">{item.description}</td>
                                <td className="md:py-2 py-1 border">
                                    {item.oid
                                        ? (item.totalCount > 1
                                            ? `${item.title} 외 ${item.totalCount - 1}건`
                                            : `${item.title} (${item.oid})`
                                            )
                                        : '-'
                                    }
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            )}

            {/* 페이징 */}
            {history.length > 0 && (
                <div
                    className="
                        md:text-sm text-[clamp(10px,1.8252vw,14px)]
                        flex justify-center items-center sm:gap-2 gap-[1px]
                        mt-6 mb-10"
                >
                    <button
                        onClick={() => setCurrentPage(Math.max(1, groupStart - pageGroupSize))}
                        disabled={groupStart === 1}
                        className="
                            sm:w-8 w-6
                            sm:h-8 h-6
                            flex items-center justify-center
                            text-gray-500 hover:text-black disabled:opacity-30"
                    >
                        {"<<"}
                    </button>

                    <button
                        onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
                        disabled={currentPage === 1}
                        className="
                            sm:w-8 w-6
                            sm:h-8 h-6
                            flex items-center justify-center
                            text-gray-500 hover:text-black disabled:opacity-30"
                    >
                        {"<"}
                    </button>

                    {Array.from(
                        { length: groupEnd - groupStart + 1 },
                        (_, i) => groupStart + i
                    ).map(page => (
                        <button
                            key={page}
                            onClick={() => setCurrentPage(page)}
                            className={`
                                sm:w-8 w-6
                                sm:h-8 h-6
                                flex items-center justify-center rounded-full
                                ${
                                    currentPage === page
                                        ? "bg-black text-white"
                                        : "text-gray-700 hover:bg-gray-100"
                                }
                            `}
                        >
                            {page}
                        </button>
                    ))}

                    <button
                        onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
                        disabled={currentPage === totalPages}
                        className="
                            sm:w-8 w-6
                            sm:h-8 h-6
                            flex items-center justify-center
                            text-gray-500 hover:text-black disabled:opacity-30"
                    >
                        {">"}
                    </button>

                    <button
                        onClick={() => setCurrentPage(Math.min(totalPages, groupStart + pageGroupSize))}
                        disabled={groupEnd === totalPages}
                        className="
                            sm:w-8 w-6
                            sm:h-8 h-6
                            flex items-center justify-center
                            text-gray-500 hover:text-black disabled:opacity-30"
                    >
                        {">>"}
                    </button>
                </div>
            )}
        </div>
    );
};

export default CreditHistory;