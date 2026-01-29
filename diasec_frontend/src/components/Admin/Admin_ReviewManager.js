import React, { useEffect, useState } from 'react';
import { toast } from 'react-toastify';
import axios from 'axios';

const Admin_ReviewManager = () => {
    const API = process.env.REACT_APP_API_BASE;
    const [reviews, setReviews] = useState([]);
    const [searchKeyword, setSearchKeyword] = useState('');
    const [startDate, setStartDate] = useState('');
    const [endDate, setEndDate] = useState('');
    const [currentPage, setCurrentPage] = useState(1);
    const itemsPerPage = 4;

    useEffect(() => {
        axios.get(`${API}/review/all`)
            .then(res => setReviews(res.data))
            .catch(err => console.error('FAQ 불러오기 실패', err));
    }, []);

    const filteredReviews = reviews.filter(review => {
        const keywordMatch = 
            review.id.includes(searchKeyword) ||
            review.title.includes(searchKeyword) ||
            review.content.includes(searchKeyword)

        const dateMatch = 
            (!startDate || review.createdAt >= startDate) && 
            (!endDate || review.createdAt <= endDate);
        return keywordMatch && dateMatch;
    });

    // 삭제
    const handleDelete = async (rid) => {
        if (window.confirm('정말 삭제하시겠습니까?')) {
            try {
                await axios.delete(`${API}/review/delete/${rid}`);
                toast.success('삭제되었습니다.');
                setReviews(prev => prev.filter(f => f.rid !== rid));
            } catch (err) {
                console.error('삭제 실패', err);
                toast.error('삭제에 실패했습니다.');
            }
        }
    };

    // 페이징
    const totalPages = Math.max(1, Math.ceil(filteredReviews.length / itemsPerPage));
    const currentItems = filteredReviews.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage);

    const pageGroupSize = 10;
    const currentGroup = Math.floor((currentPage - 1) / pageGroupSize);
    const groupStart = currentGroup * pageGroupSize + 1;
    const groupEnd = Math.min(groupStart + pageGroupSize - 1, totalPages);

    return (
        <div className="p-8 bg-gray-50 w-full min-h-screen">
            <h2 className="text-2xl font-bold mb-6">리뷰 관리</h2>

            {/* 필터 UI */}
            <div className="flex flex-wrap gap-4 mb-6">
                <input type="date" value={startDate} onChange={(e) => setStartDate(e.target.value)} className="border p-2 text-sm" /> 
                <span>~</span>
                <input type="date" value={endDate} onChange={(e) => setEndDate(e.target.value)} className="border p-2 text-sm" />
                <input type="text" placeholder="내용 검색" value={searchKeyword}
                       onChange={(e) => setSearchKeyword(e.target.value)} className="border p-2 text-sm w-60" />
            </div>         

            {/* 목록 테이블 */}
            <table className="table-fixed w-full text-sm bg-white shadow-sm rounded-md overflow-hidden">
                <div className="grid grid-cols-2 gap-6">
                    {currentItems.map((review, index) => (
                        <div key={review.rid} className="bg-white rounded-lg shadow-md p-4 flex flex-col justify-between">
                            <div className="mb-3">
                                <div className="text-sm text-gray-400 mb-1">No. {(currentPage -1) * itemsPerPage + 1 + index +1}</div>
                                <div className="font-bold text-lg text-gray-800 truncate">{review.title}</div>
                                <div className="text-sm text-gray-500">작성자: <span className="font-medium">{review.id}</span></div>
                                <div className="text-sm text-yellow-600 mt-1">평점: {review.rating}점</div>
                                <div className="text-sm text-gray-600 mt-2 line-clamp-3">{review.content}</div>
                            </div>

                            {review.images?.length > 0 && (
                                <div className="flex gap-2 flex-wrap mt-2">
                                    {review.images.map((url, i) => (
                                        <img key={i} src={url} alt={`review-img-${i}`} className="w-16 h-16 object-cover rounded border" />
                                    ))}
                                </div>
                            )}

                            <div className="mt-4 flex justify-between items-center text-sm text-gray-500">
                                <span>{review.createdAt?.slice(0, 10)}</span>
                                <button onClick={() => handleDelete(review.rid)} className="text-red-500 hover:underline">삭제</button>
                            </div>
                        </div>
                    ))}
                </div>
            </table>

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
        </div>
    )
}

export default Admin_ReviewManager;