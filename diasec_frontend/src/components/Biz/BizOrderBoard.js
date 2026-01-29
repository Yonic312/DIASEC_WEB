import React from 'react';
import { useState, useEffect, useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { toast } from 'react-toastify';
import { MemberContext } from '../../context/MemberContext';

const BizOrderBoard = () => {
    const API = process.env.REACT_APP_API_BASE;
    const navigate = useNavigate();
    const { member } = useContext(MemberContext);
    const [posts, setPosts] = useState([]);
    const [selectedPostId, setSelectedPostId] = useState(null);
    const [viewableIds, setViewableIds] = useState([]);
    const [detailData, setDetailData] = useState(null);

    // 목록 불러오기
    useEffect(() => {
        axios.get(`${API}/biz/list`)
            .then((res) => setPosts(res.data))
            .catch(() => console.log('목록을 불러오지 못했습니다.'));
    }, []);

    const handlePostClick = async (post) => {
        if (selectedPostId === post.id) {
            // 이미 열려 있으면 닫기
            setSelectedPostId(null);
            setDetailData(null);
            return;
        }


        const isSecret = post.isSecret == 1;
        const alreadyViewable = viewableIds.includes(post.id);

        if (isSecret && !alreadyViewable) {
            const pw = prompt('비밀번호를 입력하세요.');
            if (!pw) return;

            try {
                const res = await axios.post(`${API}/biz/check-password`, {
                    id: post.id,
                    password: pw
                });
                if (res.data === true) {
                    setViewableIds(prev => [...prev, post.id]);
                    fetchDetail(post.id);
                }
            } catch (err) {
                toast.error('비밀번호가 일치하지 않습니다. 다시 확인해주세요.');
            } 
        } else {
            fetchDetail(post.id);
        }
    };

    // 글 상세 조회
    const fetchDetail = async (id) => {
        try {
            const res = await axios.get(`${API}/biz/view/${id}`);
            setSelectedPostId(id);
            setDetailData(res.data);
        } catch (err) {
            console.error('글 상세 불러오기 실패');
        }
    }

    // 페이징 관련 상태
    const [currentPage, setCurrentPage] = useState(1);
    const itemsPerPage = 10;

    const totalPages = Math.max(1, Math.ceil(posts.length / itemsPerPage));
    const currentPosts = posts.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
    );

    // 화면 크기에 따라 그룹 크기 변경 (OrderList와 동일)
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
        <div className="flex flex-col w-full mx-auto mt-20 px-4 py-6">
            <h1 
                className="
                    md:text-3xl text-[clamp(16px,3.91vw,30px)]
                    flex justify-center font-bold mb-10
                    ">기업주문 게시판</h1>
            
            <div className="flex justify-end">
                <button 
                    className="
                        md:text-base text-[clamp(12px,2.086vw,16px)]
                        bg-black text-white px-4 py-2 rounded"
                    onClick={() => {
                        if (!member) {
                            toast.warn("로그인 후 이용해주세요.");
                            return;
                        }
                        navigate('/biz_OrderWrite')
                    }}
                >
                    주문하기
                </button>
            </div>

            <table 
                className='
                    w-full mt-2 border-collapse border text-center        
            '>
                <thead>
                    <tr 
                        className="
                            md:text-base text-[clamp(10px,2.085vw,16px)]
                            bg-gray-300
                    ">
                        <th className="w-[7%]border p-2 w-12">No</th>
                        <th className="w-[18%] border p-2">날짜</th>
                        <th className="w-[35%] border p-2 text-ellipsis">제목</th>
                        <th className="w-[27%] border p-2">회사명</th>
                        <th className="w-[16%] border p-2">답변</th>
                    </tr>
                </thead>
                <tbody>
                    {currentPosts.length === 0 ? (
                        <tr>
                            <td colSpan="7" className="p-6">등록된 기업 주문이 없습니다.</td>
                        </tr>
                    ) : (
                        posts.map((post, i) => (
                            <React.Fragment key={post.id}>
                                <tr
                                    className={`
                                        md:text-base text-[clamp(11px,2.085vw,16px)]
                                        hover:bg-gray-100 cursor-pointer ${selectedPostId === post.id ? 'bg-gray-100 rong-1 ring-gray-400' : ''}`}
                                    onClick={() => handlePostClick(post)}
                                >
                                    <td className="border p-2">{posts.length - i}</td>
                                    <td className="border p-2">
                                        {new Date(post.createdAt).toLocaleDateString("ko-KR", {
                                            year: "2-digit",
                                            month: "2-digit",
                                            day: "2-digit",
                                        }).replace(/\. /g, ".").replace(/\.$/, "")}
                                    </td>
                                    <td className="border p-2 text-left px-4">
                                        {post.title} {post.isSecret==1 ? <span className="ml-1">🔒</span> : ''}
                                    </td>
                                    <td className="border p-2">{post.companyName}</td>
                                    <td className={`border p-2 ${post.replyExists == 1 ? 'text-blue-500' : 'text-red-500'}`}>
                                        {post.replyExists == 1 ? 'O' : 'X'}
                                    </td>
                                </tr>

                                {selectedPostId === post.id && detailData && (
                                    <tr>
                                        <td colspan="7" className="border-b md:px-6 px-4 py-4">
                                            <div className="
                                                md:text-base text-[clamp(12px,2.085vw,16px)]
                                                text-left space-y-2">
                                                <h3 
                                                    className="
                                                        md:text-xl text-[clamp(14px,2.607vw,20px)]
                                                        font-bold">{detailData.title}</h3>
                                                <hr/>
                                                <p><strong>등록일:</strong> {detailData.createdAt.substring(0, 10)}</p>
                                                <p><strong>회사명:</strong> {detailData.companyName}</p>
                                                <p><strong>담당자:</strong> {detailData.managerName}</p>
                                                <p><strong>연락처:</strong> {detailData.phone}</p>
                                                <p><strong>이메일:</strong> {detailData.email}</p>
                                                <p><strong>주소:</strong> {detailData.address} {detailData.detailAddress}</p>
                                                <p><strong>요청사항:</strong></p> 
                                                <div className="p-4 border-l-4 border-blue-400 bg-blue-50 rounded text-gray-800 whitespace-pre-line">
                                                    {detailData.message}
                                                </div>
                                                
                                                <hr/>
                                                <div className="p-3 bg-white rounded border">
                                                    <h4 className="font-semibold text-green-600 mb-1">관리자 답변 :</h4>
                                                    {detailData.reply?.content
                                                        ? <p>{detailData.reply.content}</p>
                                                        : <p className="text-gray-400 italic">답변이 아직 없습니다.</p>
                                                    }
                                                </div>
                                            </div>
                                        </td>
                                    </tr>
                                )}
                            </React.Fragment>
                        ))
                    )}
                </tbody>
            </table>

            {/* 페이징 UI */}
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
    )
}

export default BizOrderBoard;