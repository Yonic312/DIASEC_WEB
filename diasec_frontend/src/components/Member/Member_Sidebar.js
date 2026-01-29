import { useContext, useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom'
import axios from 'axios';
import { MemberContext } from '../../context/MemberContext'

const Member_Sidebar = () => {
    const API = process.env.REACT_APP_API_BASE;
    const { member, setMember } = useContext(MemberContext);
    const navigate = useNavigate();

    const handleLogout = () => {
        if(window.confirm('로그아웃을 하시겠습니까?')){
            axios.post(`${API}/member/logout`, { withCredentials: true})
                .then(() => {
                    setMember(null);
                    navigate('/');
                })
                .catch((err) => {
                    console.error("로그아웃 실패", err);
            });
        }
    };

    return (
        <>
            {member ? (
                <div className="flex flex-col items-start mx-2 w-auto sm:gap-3 gap-2 shrink-0">
                    <button 
                        className="
                            md:text-lg text-[clamp(11px,2.3455vw,18px)]
                            sm:mb-10 mb-5 font-semibold cursor-none">
                        마이페이지
                    </button>
                    
                    <span className="md:text-lg text-[clamp(11px,2.3455vw,18px)] font-bold">주문 관리</span>
                    <button className="md:text-sm text-[clamp(9px,1.8252vw,14px)] opacity-65" onClick={() => navigate('/orderList')}>주문내역 조회</button>
                    <button className="md:text-sm text-[clamp(9px,1.8252vw,14px)] opacity-65" onClick={() => navigate('/wishList')}>관심상품 조회</button>
                    <button className="md:text-sm text-[clamp(9px,1.8252vw,14px)] opacity-65" onClick={() => navigate('/creditHistory')}>적립금 내역</button>
                    
                    <span className="md:text-lg text-[clamp(11px,2.3455vw,18px)] font-bold mt-10">활동 내역</span>
                    <button className="md:text-sm text-[clamp(9px,1.8252vw,14px)] opacity-65" onClick={() => navigate('/reviewWrite')}>리뷰 작성</button>
                    <button 
                        className="md:text-sm text-[clamp(9px,1.8252vw,14px)] opacity-65" 
                        onClick={() => navigate('/supportInquiryForm', {
                            state: { returnTo: '/myInquiryList'}
                        })}
                    >
                        문의하기
                    </button>
                    <button className="md:text-sm text-[clamp(9px,1.8252vw,14px)] opacity-65" onClick={() => navigate('/myInquiryList')}>문의 내역</button>

                    <span className="md:text-lg text-[clamp(11px,2.3455vw,18px)] font-bold mt-10">정보 관리</span>
                    <button className="md:text-sm text-[clamp(9px,1.8252vw,14px)] opacity-65" onClick={() => navigate('/modify')}>회원 정보 수정</button>
                    {member && member.provider === 'web' && (
                        <button className="md:text-sm text-[clamp(9px,1.8252vw,14px)] opacity-65" onClick={() => navigate('/changePwd')}>비밀번호 변경</button>
                    )}
                    <button className="md:text-sm text-[clamp(9px,1.8252vw,14px)] opacity-65" onClick={() => navigate('/addrList')}>배송 주소록 관리</button>
                    <button className="md:text-sm text-[clamp(9px,1.8252vw,14px)] opacity-65" onClick={handleLogout}>로그아웃</button>
                </div>
            ) : (
                <div></div>
            )}
        </>
    );
};

export default Member_Sidebar;