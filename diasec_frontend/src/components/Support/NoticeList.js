import { useEffect, useState } from 'react';
import SupportHeader from './SupportHeader';

const NoticeList = () => {
    const API = process.env.REACT_APP_API_BASE;
    const [notices, setNotices] = useState([]);
    const [openIndex, setOpenIndex] = useState(null);

    useEffect(() => {
        fetchNotices();
    }, []);

    const fetchNotices = async () => {
        try {
            const res = await fetch(`${API}/notice/list`, {
                credentials: 'include',
            });
            const data = await res.json();
            setNotices(data);
        } catch (err) {
            console.error('공지사항 불러오기 실패', err);
        }
    };

    // 토글
    const toggleNotice = (index) => {
        setOpenIndex(prev => (prev === index ? null : index));
    };

    // 페이징
    const [currentPage, setCurrentPage] = useState(1);
    const itemsPerPage = 10;

    const totalPages = Math.max(1, Math.ceil(notices.length / itemsPerPage));
    const indexOfLastNotice = currentPage * itemsPerPage;
    const indexOfFirstNotice = indexOfLastNotice - itemsPerPage;
    const currentNotices = notices.slice(indexOfFirstNotice, indexOfLastNotice);

    // ✅ 반응형 그룹 크기
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

    const currentGroup = Math.floor((currentPage - 1) / pageGroupSize);
    const groupStart = currentGroup * pageGroupSize + 1;
    const groupEnd = Math.min(groupStart + pageGroupSize - 1, totalPages);


    return(
        <div className="max-5xl mx-auto px-4 mt-16 pb-24 text-sm text-gray-800">
            <SupportHeader />

            <ul className="
                md:text-base text-[clamp(11px,2.085vw,16px)]
                mt-16 divide-y border-b">
                {currentNotices.map((notice, idx) => {
                    const globalIndex = (currentPage - 1) * indexOfFirstNotice + idx;
                    return(
                        <li key={`${notice.notice_id}-${idx}`}>
                            <div
                                onClick={() => toggleNotice(globalIndex)}
                                className="flex justify-between items-center py-4 px-4 hover:bg-gray-50 transition cursor-pointer"    
                            >
                            <div className="truncate">
                                {notice.pinned && (
                                    <span className="text-orange-500 font-semibold mr-2">[공지]</span>
                                )}
                                {notice.title}
                            </div>
                            <div className="text-gray-400 text-xs shrink-0 ml-4">
                                {notice.createdAt?.replace('T', ' ').slice(0, 16)}
                            </div>
                        </div>

                        {openIndex === globalIndex && (
                            <div className='bg-gray-50 min-h-40 px-4 py-4 text-gray-700 whitespace-pre-wrap border-t'>
                                {notice.imageUrl && (
                                    <img src={notice.imageUrl} alt="공지 이미지" className="max-w-full rounded-md border" />
                                )}
                                {notice.content}
                            </div>
                        )}
                    </li>
                    );
                })}
            </ul>
            
            {/* 페이징 */}
            <div 
                className="
                    md:text-sm text-[clamp(10px,1.8252vw,14px)]
                    flex justify-center items-center sm:gap-2 gap-[1px] mt-10 mb-10">

                {/* 처음으로 */}
                <button 
                    onClick={() => setCurrentPage(Math.max(1, groupStart - pageGroupSize))}
                    disabled={groupStart === 1}
                    className="sm:w-8 w-6 sm:h-8 h-6 flex items-center justify-center text-gray-500 hover:text-black"
                >
                    {'<<'}
                </button>

                {/* 이전 */}
                <button 
                    onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
                    disabled={currentPage === 1}
                    className="sm:w-8 w-6 sm:h-8 h-6 flex items-center justify-center text-gray-500 hover:text-black"
                >
                    {'<'}
                </button>

                {/* 페이지 번호 */}
                {Array.from({ length: groupEnd - groupStart + 1 }, (_, i) => groupStart + i).map(page => (
                    <button 
                    key={page}
                    onClick={() => setCurrentPage(page)}
                    className={`sm:w-8 w-6 sm:h-8 h-6 flex items-center justify-center rounded-full ${
                        currentPage === page ? 'bg-black text-white' : 'text-gray-700 hover:bg-gray-100'
                    }`}>
                    {page}
                    </button>
                ))}

                {/* 다음 */}
                <button 
                    onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
                    disabled={currentPage === totalPages}
                    className="sm:w-8 w-6 sm:h-8 h-6 flex items-center justify-center text-gray-500 hover:text-black"
                >
                    {'>'}
                </button>

                {/* 마지막으로 */}
                <button 
                    onClick={() => setCurrentPage(Math.min(totalPages, groupStart + pageGroupSize))}
                    disabled={groupEnd === totalPages}
                    className="sm:w-8 w-6 sm:h-8 h-6 flex items-center justify-center text-gray-500 hover:text-black"
                >
                    {'>>'}
                </button>
            </div>
        </div>
    )
}

export default NoticeList;