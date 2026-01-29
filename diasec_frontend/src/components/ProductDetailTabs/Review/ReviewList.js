import { useState, useEffect, useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import images_icon from '../../../assets/images_icon.png'
import ImageModal from '../Modal/ImageModal';
import { MemberContext } from '../../../context/MemberContext';
import { toast } from 'react-toastify';
import axios from 'axios';

const ReviewList = ({ pid }) => {
    const API = process.env.REACT_APP_API_BASE;
    const { member } = useContext(MemberContext);
    const navigate = useNavigate();
    const [reviews, setReviews] = useState([]);
    const [expandedMap, setExpandedMap] = useState({});

    useEffect(() => {
        fetch(`${API}/review/list?pid=${pid}`)
            .then(res => res.json())
            .then(data => setReviews(data))
            .catch(err => console.error("리뷰 불러오기 실패", err));
    }, [pid]);

    // 리뷰 작성
    const handleWriteReview = () => {
        if (!member) {
            toast.warn("로그인 후 이용해주세요.");
            return;
        }
        navigate('/reviewWrite');
    };

    // 후기 열기
    const toggleExpanded = (rid) => {
        setExpandedMap(prev => ({ ...prev, [rid]: !prev[rid] }));
    };

    // 상단 통계 레이아웃 추가 (별점)
    const totalReviews = reviews.length;
    const avgRating = totalReviews ? (reviews.reduce((sum, r) => sum + r.rating, 0) / totalReviews).toFixed(1) : 0;

    const ratingLabels = ['아주 좋아요', '마음에 들어요', '보통이에요', '그냥 그래요', '별로예요'];
    const ratingCounts = [0, 0, 0, 0, 0];

    reviews.forEach(r => {
        const idx = 5 - r.rating;
        if (ratingCounts[idx] !== undefined) ratingCounts[idx]++;
    });

    // 닉네임 마스킹
    const maskedId = (id) => {
        if (id.length <= 2) return id[0] + '*';
        if (id.length <= 4) return id.slice(0, 1)  + '**';
        return id.slice(0, 2) + '*'.repeat(id.length - 3) + id.slice(-1);
    };
    
    // 리뷰 이미지 모달창 띄우기
    const [modalImages, setModalImages] = useState([]);
    const [modalIndex, setModalIndex] = useState(0);

    // 리뷰 페이징
    const [currentPage, setCurrentPage] = useState(1); // 현재 페이지
    const reviewsPerPage = 5; // 한 페이지에 보여줄 리뷰 수

    const indexOfLastReview = currentPage * reviewsPerPage; // [1] : 5, [2] : 10
    const indexOfFirstReview = indexOfLastReview - reviewsPerPage; // [1] : 0, [2] : 5
    const currentReviews = reviews.slice(indexOfFirstReview, indexOfLastReview); // [1] : 0 ~ 4, [2] : 5 ~ 9

    return (
        <div className="space-y-12 w-full mx-auto">
            {/* 리뷰 통계 상단 바 */}
            <div className="
                bg-gray-50 rounded-md shadow-sm
                md:p-6 p-[clamp(0.5rem,3.129vw,1.5rem)]
                ">
                <div className="flex items-center justify-between">
                    <div className="text-black font-medium text-2xl">
                        후기 <span className="font-semibold text-gray-500">{totalReviews}</span>
                    </div>
                    <button onClick={handleWriteReview}
                        className="px-3 py-1.5 bg-[#D0AC88] text-white text-sm rounded hover:bg-gray-500 transition">
                        후기작성
                    </button>
                </div>
                <br /><hr />

                <div className="flex md:gap-6 gap-1">
                    {/* 평균 별점 */}
                    <div className="
                        w-1/2 flex flex-col items-center justify-center text-center gap-2 border-r md:pr-6 pr-2
                        md:text-2xl text-[clamp(18px,3.126vw,24px)]
                    ">
                        <span className="text-black font-semibold">별점</span>
                        <div className="flex flex-col">
                            <div className="text-yellow-400 font-bold mb-2">
                                {"★".repeat(Math.round(avgRating))}
                            </div>
                            <span className='text-gray-500 font-medium'>{avgRating} / 5.0</span>
                        </div>
                    </div>

                    {/* 평점 분포 */}
                    <div className="
                        flex flex-col flex-1 py-10
                        md:gap-2 gap-1
                        md:px-10
                        ">
                        {ratingLabels.map((label, idx) => {
                            const count = ratingCounts[idx];
                            const ratio = totalReviews ? (count / totalReviews) * 100 : 0;
                            return (
                                <div key={idx} 
                                    className="
                                        flex items-center justify-center text-gray-600
                                        md:text-[16.5px] text-[clamp(14.5px,2.15vw,16.5px)]">
                                    <div className="w-24 text-gray-700">{label}</div>

                                    <div className="flex-1 md:block hidden bg-gray-200 h-2 rounded mx-2">
                                        <div className="bg-blue-400 h-2 rounded" style={{ width: `${ratio}%`}}></div>
                                    </div>
                                    <div className="w-8 text-right text-blue-500 font-medium">{count}</div>
                                </div>
                            )
                        })}
                    </div>
                </div>
                <hr />
            </div>


            {currentReviews.map(review => (
                <div key={review.rid} className="border-b pb-6">
                    
                    {/* 기본 정보 영역 */}
                    <div className="flex justify-between items-center mb-1">
                        <div className='md:text-xl text-[clamp(17px,2.606vw,20px)] font-semibold text-gray-900'>{review.title}</div>
                        <span className='md:text-[18px] text-[clamp(14px,2.346vw,18px)] text-gray-400'>{review.createdAt?.slice(0, 10)}</span>
                    </div>

                    <div className="flex justify-between items-center text-sm text-gray-600 mb-2">
                        <div 
                            className="
                                text-yellow-400 
                                md:text-xl text-[clamp(16px,2.607vw,20px)]">
                            {"★".repeat(review.rating)}{"☆".repeat(5 - review.rating)}
                        </div>
                        <div className="text-sm text-gray-400 italic">
                            {maskedId(review.id)} 님의 리뷰
                        </div>
                    </div>

                    {/* 본문 + 이미지 토글 포함 */}
                    {expandedMap[review.rid] && (
                        <>
                            {/* 본문 */}
                            <p className="
                                md:text-[20px] text-[clamp(18px,2.606vw,20px)] 
                                border-t-[1px] pt-2 text-gray-800 mb-4 whitespace-pre-line">
                                {review.content}
                            </p>

                            {review.images?.length > 0 && (
                                <div>
                                    <div className="flex gap-2 overflow-x-auto mb-3">
                                        {review.images.map((imgUrl, idx) => (
                                            <img key={idx} 
                                                src={imgUrl} 
                                                alt="리뷰 이미지" 
                                                className="
                                                    md:w-24 w-[clamp(64px,12.516vw,96px)]
                                                    md:h-24 h-[clamp(64px,12.516vw,96px)]
                                                    rounded object-cover border"
                                                onClick={(e) => {
                                                    e.stopPropagation(); // 리뷰 펼침 방지
                                                    setModalImages(review.images); // 클릭한 이미지 저장
                                                    setModalIndex(idx);
                                                }}
                                            />
                                        ))}
                                    </div>
                                </div>
                            )}
                        </>
                    )}

                    {/* 토글 버튼 */}
                    {(review.content || review.images?.length > 0) && (
                        <button
                            onClick={(e) => {
                                e.stopPropagation();
                                toggleExpanded(review.rid);
                            }}
                            className="text-base text-gray-600 hover:text-black font-medium transition"
                        >
                            {expandedMap[review.rid] ? '▲ 리뷰 닫기' : ( 
                                <> 
                                    ▼ 리뷰 보기 
                                    {review.images?.length > 0 && (
                                        <img src={images_icon} alt="이미지 포함 아이콘" className="inline w-[13px] h-[13px] ml-1" /> )}</>)}
                        </button>
                    )}
                </div>
            ))}
            {/* 페이징 버튼 */}
            <div className="flex justify-center gap-2 mt-8 text-sm">
                {(() => {
                    const totalPages = Math.max(1, Math.ceil(reviews.length / reviewsPerPage));
                    const maxVisible = 5;
                    let startPage = Math.max(currentPage - 2, 1);
                    let endPage = Math.min(startPage + maxVisible - 1, totalPages);

                    // 다시 앞부분 정렬 보정
                    if (endPage - startPage < maxVisible - 1) {
                        startPage = Math.max(endPage - maxVisible + 1, 1);
                    }

                    const pageNumbers = Array.from({ length: endPage - startPage + 1 }, (_, i) => startPage + i);

                    return (
                        <div className="flex justify-center gap-1 mt-10 text-sm font-medium">  
                            {/* 맨 처음 */}
                            <button
                                onClick={() => setCurrentPage(1)}
                                disabled={currentPage === 1}
                                className={`w-8 h-8 border rounded-full flex items-center justify-center 
                                    ${currentPage === 1 ? 'text-gray-300 border-gray-200' : 'text-gray-700 hover:bg-gray-100 border-gray-300'}`}>
                                {'<<'}
                            </button>
                            {/* 이전 버튼 */}
                            <button
                                onClick={() => setCurrentPage(prev => prev -1)}
                                disabled={currentPage === 1}
                                className={`w-8 h-8 border rounded-full flex items-center justify-center ${currentPage === 1 ? 'text-gray-300 border-gray-200' : 'text-gray-700 hover:bg-gray-100 border-gray-300'}`}>
                                {'<'}
                            </button>
                        

                            {/* 페이지 숫자들 */}
                            {pageNumbers.map((pageNum) => (
                                <button
                                    key={pageNum}
                                    onClick={() => setCurrentPage(pageNum)}
                                    className={`w-8 h-8 rounded-full border flex items-center justify-center
                                        ${currentPage === pageNum 
                                            ? 'bg-black text-white border-black' 
                                            : 'bg-white text-gray-700 border-gray-300 hover:bg-gray-100'}`}
                                >
                                    <span>{pageNum}</span>
                                </button>
                            ))}

                            {/* 다음 버튼 */}
                            <button
                                onClick={() => setCurrentPage(prev => prev + 1)}
                                disabled={currentPage >= totalPages}
                                className={`w-8 h-8 border rounded-full flex items-center justify-center 
                                    ${currentPage === totalPages ? 'text-gray-300 border-gray-200' : 'text-gray-700 hover:bg-gray-100 border-gray-300'}`}>
                                {'>'}
                            </button>
                            {/* 맨 마지막 */}
                            <button
                                onClick={() => setCurrentPage(totalPages)}
                                disabled={currentPage === totalPages}
                                className={`w-8 h-8 border rounded-full flex items-center justify-center 
                                    ${currentPage === totalPages ? 'text-gray-300 border-gray-200' : 'text-gray-700 hover:bg-gray-100 border-gray-300'}`}>
                                {'>>'}
                            </button>
                        </ div>
                    )
                })()}
            </div>
            {/* 모달창으로 이미지 띄우기 */}
            {modalImages.length > 0 && (
                <ImageModal 
                    images={modalImages}
                    currentIndex={modalIndex} 
                    onClose={() => {
                        setModalImages([]);
                        setModalIndex(0);
                    }}
                    onSelect={(idx) => setModalIndex(idx)}
                />      
            )}
        </div>
    );
};

export default ReviewList;