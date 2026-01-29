import { useEffect, useState, useContext } from 'react';
import { useNavigate } from 'react-router-dom'
import axios from 'axios';
import { MemberContext } from '../../../context/MemberContext';
import { toast } from 'react-toastify';

const AddrList = () => {
    const API = process.env.REACT_APP_API_BASE;
    const navigate = useNavigate();
    const { member } = useContext(MemberContext);
    const [addresses, setAddresses] = useState([]); // 서버에서 리스트 저장 배열
    const [selectedCnos, setSelectedCnos] = useState([]); // 사용자가 체크박스를 체크한 목록
    const isAllChecked = addresses.length > 0 && selectedCnos.length === addresses.length;

    useEffect(() => {
        if (!member?.id) return;

        const fetchAddresses = async () => {
            try {
                const res = await axios.get(`${API}/address/${member.id}`, { 
                    withCredentials: true,
                });
                setAddresses(res.data);
            } catch (err) {
                console.error('배송지 불러오기 실패:', err);
            }
        };
        fetchAddresses();
    }, [member]);

    // 체크박스 핸들러 추가 (selectedCnos에 추가/삭제)
    const handleCheckboxChange = (cno) => {
        setSelectedCnos(prev => {
            if (prev.includes(cno)) {
                return prev.filter(id => id !== cno); // cno번만 남기기
            } else {
                return [...prev, cno];
            }
        });
    };

    // 체크박스 전체 클릭
    const handleAllCheck = () => {
        if (isAllChecked) {
            // 전체 해제
            setSelectedCnos([]);
        } else {
            // 전체 선택
            setSelectedCnos(addresses.map(addr => addr.cno));
        }
    }

    const handleDeleteSelected = async () => {
        if (selectedCnos.length === 0) {
            toast.error("삭제할 주소를 선택해주세요.");
            return;
        }

        if (!window.confirm(`${selectedCnos.length}개 주소를 삭제하시겠습니까?`)) return;

        try {
            await Promise.all(
                selectedCnos.map(cno => 
                    axios.delete(`${API}/address/${cno}`, { withCredentials: true })
                )
            );
            // 삭제 완료 후 리스트 갱신
            setAddresses(prev => prev.filter(addr => !selectedCnos.includes(addr.cno)));
            setSelectedCnos([]); // 선택 초기화
            toast.success('삭제가 완료되었습니다.');
        } catch (err) {
            console.error('삭제 실패:', err);
            toast.error('삭제에 실패했습니다.');
        }
    }

    return (
        <div className="flex flex-col w-full">
            <span 
                className="
                    md:text-xl text-[clamp(14px,2.607vw,20px)]
                    font-bold sm:pb-6 pb-2">| 배송 주소록 관리</span>

            <div className="
                md:text-base text-[clamp(11px,2.085vw,16px)]
                flex items-center justify-between bg-[#555] h-[60px] 
                xl:px-8 lg:px-6 md:px-4 pl-[3px]
                text-center font-semibold text-white border-y border-gray-300">
                <input type="checkbox" checked={isAllChecked} onChange={handleAllCheck} 
                    className="
                        md:w-[18px] w-[clamp(12px,2.345vw,18px)]
                        md:h-[18px] h-[clamp(12px,2.345vw,18px)]" />
                <span 
                    className="
                        w-[17%]">배송지명</span>
                <span 
                    className="
                        w-[13%]">수령인</span>
                <span 
                    className="
                        w-[17%]">휴대전화</span>
                <span 
                    className="
                        w-[33%]">주소</span>
            </div>
            
            {addresses.length === 0 ? (
                <div className="text-center text-gray-500 py-10">
                    등록된 배송지가 없습니다.
                </div>
            ) : (
                addresses.map((addr) => (
                    <div 
                        key={addr.cno}
                        onClick={() => navigate(`/addrModify/${addr.cno}`)}
                        className="
                            md:text-xs text-[clamp(7px,1.5645vw,12px)]
                            flex items-center justify-between bg-white h-[60px] 
                            xl:px-8 lg:px-6 md:px-4 pl-[3px]
                            text-center border-b border-gray-200 cursor-pointer hover:bg-gray-200">
                        <input 
                            type="checkbox"
                            onClick={(e) => e.stopPropagation()} 
                            checked={selectedCnos.includes(addr.cno)} 
                            onChange={() => handleCheckboxChange(addr.cno)} 
                            className="
                                md:w-[18px] w-[clamp(12px,2.345vw,18px)]
                                md:h-[18px] h-[clamp(12px,2.345vw,18px)]" />
                        <span 
                            className="
                                w-[17%]">
                            {addr.isDefault == true && (
                                <span 
                                    className="
                                        md:text-xs text-[clamp(7px,1.5645vw,12px)]
                                        text-red-500 ml-2"> [기본] </span>
                            )}
                            {addr.label}
                        </span>
                        <span 
                            className="
                                w-[13%]">{addr.recipient}</span>
                        <span 
                            className="
                                w-[15%]">{addr.phone}</span>
                        <span 
                            className="
                                w-[35%]">({addr.postcode}) <br /> {addr.address} {addr.detailAddress}</span>
                    </div>
                ))
            )}

            <div 
                className="
                    md:text-xs text-[clamp(7px,1.5645vw,12px)]
                    flex items-center justify-center mt-5 gap-4">
                <button 
                    className="
                        flex sm:px-8 px-2 sm:py-3 py-1
                        rounded-[4px] border-[1px] border-black" onClick={handleDeleteSelected}> 선택 주소록 삭제 </button>
                <button 
                    className="
                        flex sm:px-8 px-2 sm:py-3 py-1 text-white bg-black
                        rounded-[4px] border-[1px] border-black" onClick={() => navigate('/addrRegister')}> 배송지등록 </button>
            </div>
        </div>
    );
};

export default AddrList;