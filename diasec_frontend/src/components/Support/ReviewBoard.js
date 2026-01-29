import { useEffect, useState, useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import SupportHeader from './SupportHeader';
import { MemberContext } from '../../context/MemberContext';
import { toast } from 'react-toastify';

const ReviewBoard = () => {
    const API = process.env.REACT_APP_API_BASE;
    const navigate = useNavigate();
    const { member } = useContext(MemberContext);
    const [reviews, setReviews] = useState([]);
    const [currentPage, setCurrentPage] = useState(1);
    const [selectedReview, setSelectedReview] = useState(null);
    const reviewsPerPage = 10;

    // 상단 리뷰 슬라이더
    const [topThumbnailReviews, setTopThumbnailReviews] = useState([]);

    useEffect(() => {
        fetch(`${API}/review/recent?limit=20`)
            .then(res => res.json())
            .then(data => setTopThumbnailReviews(data))
            .catch(err => console.error('썸네일 리뷰 로딩 실패:', err));
    }, []);

    useEffect(() => {
        fetch(`${API}/review/all`)
            .then(res => res.json())
            .then(data => setReviews(data))
            .catch(err => console.error('리뷰 불러오기 실패:', err));
    }, []);

    // 리뷰 작성
    const handleWriteReview = () => {
        if (!member) {
            toast.warn('로그인 후 이용해주세요.');
            return;
        }
        navigate('/reviewWrite');
    } 

    // 리뷰상세 페이지 이미지 슬라이드
    const [selectedImageIndex, setSelectedImageIndex] = useState(0);

    // 페이징
    const totalPages = Math.max(1, Math.ceil(reviews.length / reviewsPerPage));

    // ✅ 반응형 그룹 크기
    const currentReviews = reviews.slice((currentPage - 1) * reviewsPerPage, currentPage * reviewsPerPage);
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

    

    return (
        <div className="max-5xl mx-auto px-4 mt-16 pb-24 text-sm text-gray-800">
            <SupportHeader />

            <div className='flex justify-end mt-16 mb-4'>
                <button onClick={handleWriteReview}
                    className="
                        md:text-sm text-[clamp(11px,1.8252vw,14px)]
                        md:px-3 px-2 
                        md:py-1.5 py-1 
                        bg-[#D0AC88] text-white rounded hover:bg-gray-500 transition">
                    후기작성
                </button>
            </div>

            {/* 🔶 썸네일 슬라이더 영역 */}
            <div className="overflow-x-auto mb-12 scrollbar-hide">
                <div className="flex md:gap-5 gap-2 px-1 sm:px-2 md:px-4">
                    {topThumbnailReviews.map((review, i) => (
                        <div
                            key={i}
                            className="
                                md:w-60 w-[clamp(128px,31.28vw,240px)] 
                                flex-shrink-0 bg-white border rounded-lg shadow-sm overflow-hidden cursor-pointer hover:shadow-md transition"
                            onClick={() => setSelectedReview(review)}
                        >
                            <img
                                src={review.images?.[0]}
                                alt="리뷰 이미지"
                                className="w-full md:h-60 h-[clamp(128px,31.28vw,240px)] object-cover"
                            />
                            <div className="
                                md:text-sm text-[clamp(11px,1.8252vw,14px)]
                                p-3">
                                <div className="text-orange-400 mb-1">
                                    {'★'.repeat(review.rating)}{'☆'.repeat(5 - review.rating)}
                                </div>
                                <div className="font-semibold truncate mb-0.5">
                                    {review.title}
                                </div>
                                <div className="
                                    md:text-xs text-[clamp(9px,1.5645vw,12px)] 
                                    text-gray-500 truncate">{review.content}</div>
                            </div>
                        </div>
                    ))}
                </div>
            </div>

            {/* 🔶 일반 리스트 */}
            <ul className='divide-y border-y'>
                {currentReviews.map((review, i) => (
                    <li key={i} className='
                        flex gap-4 py-6 cursor-pointer' onClick={() => setSelectedReview(review)}>
                        <div className='flex-1'>
                            <div className="
                                md:text-sm text-[clamp(12px,1.825vw,14px)]
                                flex items-center justify-between text-gray-400">
                                <span>{review.id.slice(0, 2)}***님</span>
                                <span>{review.createdAt?.slice(0, 10)}</span>
                            </div>
                            <div className="
                                md:text-[16px] text-[clamp(12px,2.085vw,16px)]
                                font-semibold text-gray-700">
                                <span className="text-orange-400">
                                    {'★'.repeat(review.rating)}{'☆'.repeat(5 - review.rating)}
                                </span>
                            </div>

                            <div className='
                                md:text-lg text-[clamp(16px,2.346vw,18px)] font-semibold'>
                                {review.title}{' '}
                            </div>
                            
                            <div className='
                                text-gray-500 mt-2
                                md:text-base text-[clamp(11px,2.085vw,16px)]
                                '>
                                {review.content.length > 50
                                    ? `${review.content.slice(0, 50)}...`
                                    : review.content}
                            </div>

                            {/* 이미지 */}
                            <div className="flex overflow-x-auto mt-2 gap-2">
                                {review.images?.map((img, idx) => (
                                    <img
                                        key={idx}
                                        src={img}
                                        alt={`리뷰 이미지 ${idx}`}
                                        className="
                                            md:w-28 w-[clamp(48px,14.6vw,112px)]
                                            md:h-28 h-[clamp(48px,14.6vw,112px)]
                                            object-cover rounded border"
                                    />
                                ))}
                            </div>
                        </div>
                    </li>
                ))}
            </ul>

            {selectedReview && (
                <div 
                    className="fixed inset-0 bg-black bg-opacity-30 flex justify-center items-center z-50"
                    onClick={() => {
                        setSelectedReview(null);
                        setSelectedImageIndex(0);
                    }}
                >
                    <div 
                        className="
                            md:text-base text-[clamp(11px,2.085vw,16px)]
                            bg-white w-[80%] md:p-8 p-3 rounded shadow-lg relative"
                        onClick={(e) => e.stopPropagation()}
                    >
                        <button
                            className="absolute top-2 right-3 text-gray-500 text-lg hover:text-black"
                            onClick={() => {
                                setSelectedReview(null);
                                setSelectedImageIndex(0);
                            }}
                        >
                            ✕
                        </button>
                        <div className="
                            w-full 
                            md:h-96 h-56
                            flex items-center justify-center bg-black bg-opacity-5 roudned mb-4">
                            <img 
                                src={selectedReview.images?.[selectedImageIndex]}
                                alt={`상세 이미지 ${selectedImageIndex}`}
                                className="max-w-full max-h-full object-contain rounded"
                            />
                        </div>

                        {/* 썸네일 */}
                        <div className="flex gap-2 md:mt-2 mt-1 justify-center">
                            {selectedReview.images?.map((img, idx) => (
                                <img 
                                    key={idx}
                                    src={img}
                                    alt={`썸네일 ${idx}`}
                                    className={`
                                        md:w-16 w-10
                                        md:h-16 h-10
                                        object-cover border round cursor-pointer ${
                                        idx === selectedImageIndex ? 'ring-2 ring-black' : ''
                                    }`}
                                    onClick={() => setSelectedImageIndex(idx)}
                                />
                            ))}
                        </div>

                        <h2 className="
                            md:text-xl text-[clamp(14px,2.607vw,20px)]
                            font-bold mt-2">{selectedReview.title}</h2>
                        <p>
                            {'★'.repeat(selectedReview.rating)}{'☆'.repeat(5 - selectedReview.rating)}
                        </p>
                        <p>{selectedReview.content}</p>
                        <div>
                            <span>{selectedReview.id.slice(0, 2)}***</span>
                        </div>
                        <div>
                            <span>{selectedReview.createdAt?.slice(0, 10)}</span>
                        </div>
                    </div>
                </div>
            )}

            {/* 🔶 페이징 */}
            <div 
                className="md:text-sm text-[clamp(10px,1.8252vw,14px)]
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
                    }`}
                    >
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
    );
};

export default ReviewBoard;
