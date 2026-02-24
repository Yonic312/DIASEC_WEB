import { useEffect, useState, useContext } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { DragDropContext, Droppable, Draggable } from '@hello-pangea/dnd';
import axios from 'axios';
import { toast } from 'react-toastify';
import { MemberContext } from '../../../context/MemberContext';
import thumbCustom from '../../../assets/CustomFrames/customFrames.png';

const OrderDetail = () => {
    const API = process.env.REACT_APP_API_BASE;
    const { member } = useContext(MemberContext);
    const navigate = useNavigate();
    const { oid } = useParams();
    const [order, setOrder] = useState(null);

    // 보정 수정 관련
        const [retouchModalOpen, setRetouchModalOpen] = useState(false);
        const [retouchTargetItemId, setRetouchTargetItemId] = useState(null); // order.items의 itemId
        const [retouchDraft, setRetouchDraft] = useState({
        enabled: false,
        types: [],
        note: '',
    });

    const retouchOptions = [
        '피부 보정',
        '얼굴 디테일 보정',
        '얼굴 라인·몸매 보정',
        '이미지 역광 및 색감보정',
        '불필요한 배경 삭제 및 변경',
        '업스케일링 (흐릿한 사진 선명보정)',
    ];

    // 상태 제한: 결제완료/배송준비중만 수정 가능
    const canEditRetouchByStatus = (status) =>
    ['입금대기', '결제완료', '배송준비중'].includes(status);

    // order item 값 -> draft로 변환
    const openRetouchModal = (item) => {
        const enabled = item.retouchEnabled === 1 || item.retouchEnabled === true;

        const types = (item.retouchTypes || '')
            .split(',')
            .map(v => v.trim())
            .filter(Boolean);

        setRetouchTargetItemId(item.itemId);
        setRetouchDraft({
            enabled,
            types,
            note: item.retouchNote || '',
        });
        setRetouchModalOpen(true);
    };

    const closeRetouchModal = () => {
        setRetouchModalOpen(false);
        setRetouchTargetItemId(null);
    };

    // 저장(서버 반영)
    const saveRetouch = async () => {
        if (!retouchTargetItemId) return;

        if (retouchDraft.enabled && retouchDraft.types.length === 0) {
            toast.warn("보정 항목을 하나 이상 선택해주세요.");
            return;
        }

        try {
            const payload = {
                itemId: retouchTargetItemId,
                retouchEnabled: retouchDraft.enabled ? 1 : 0,
                retouchTypes: retouchDraft.enabled ? retouchDraft.types.join(', ') : null,
                retouchNote: retouchDraft.enabled ? (retouchDraft.note || null) : null,
            };

            const res = await fetch(`${API}/order/update-retouch`, {
                method: 'POST',
                headers: { 'Content-Type' : 'application/json' },
                credentials: 'include',
                body: JSON.stringify(payload),
            });

            const data = await res.json();

            if (data.success) {
                toast.success("보정 요청이 저장되었습니다.");
                setRetouchModalOpen(false);
                setRetouchTargetItemId(null);

                // 재조회
                const fresh = await axios.get(`${API}/order/detail/oid/${oid}`, { withCredentials: true });
                setOrder(fresh.data);
            } else {
                toast.error("저장 실패: " + (data.message || ""));
            }
        } catch (e) {
            console.error(e);
            toast.error("서버 오류");
        }
    }

    // 반품 신청
    const [showReturnForm, setShowReturnForm] = useState(false);
    const [claimType, setClaimType] = useState('반품'); // 교환 / 반품 선택버튼
    const [returnReason, setReturnReason] = useState(''); // 반품 이유
    const [returnDetail, setReturnDetail] = useState(''); // 반품 이유 (상세)
    const [bankName, setBankName] = useState(''); // 은행명
    const [accountNumber, setAccountNumber] = useState(''); // 계좌번호
    const [accountHolder, setAccountHolder] = useState(''); // 계좌주
    const MAX_CLAIM_IMAGES = 5;
    const MAX_FILE_SIZE = 5 * 1024 * 1024;

    const [claimImages, setClaimImages] = useState([]);
    const [isDraggingClaim, setIsDraggingClaim] = useState(false);

    const handleSubmitReturn = async () => {
        if (!returnReason) {
            toast.error('사유를 선택해주세요.');
            return;
        }

        if (claimType === '반품') {
            if (!bankName || !accountNumber || !accountHolder) {
                toast.error('반품일 경우 환불 계좌 정보를 모두 입력해주세요.');
                return;
            }
        }

        if (claimImages.length > MAX_CLAIM_IMAGES) {
            toast.error(`이미지는 최대 ${MAX_CLAIM_IMAGES}장까지 가능합니다.`);
            return;
        }

        try {
            const formData = new FormData();
            formData.append('itemId', order.items[0].itemId);
            formData.append('claimType', claimType);
            formData.append('reason', returnReason);
            if (returnDetail) formData.append('detail', returnDetail);

            if (claimType === '반품') {
                formData.append('bankName', bankName);
                formData.append('accountNumber', accountNumber);
                formData.append('accountHolder', accountHolder);
            }

            claimImages.forEach(file => formData.append('images', file));

            console.log("claimType:", claimType);
            console.log("returnReason:", returnReason);
            console.log("returnDetail:", returnDetail);
            console.log("itemId:", order?.items?.[0]?.itemId);
            console.log("images:", claimImages.map(f => ({ name: f.name, size: f.size, type: f.type })));

            // FormData 내부 확인
            for (const [k, v] of formData.entries()) {
                console.log("FD:", k, v);
            }

            const res = await axios.post(`${API}/order/claim`, formData,{
                headers: { 'Content-Type': 'multipart/form-data' },
                withCredentials: true,
                });

                if (res.data?.success) {
                    toast.success(`${claimType} 요청이 접수되었습니다.`);
                    setShowReturnForm(false);
                    setClaimImages([]);
                    navigate('/orderList');
                } else {
                    toast.error(`${claimType} 요청 실패 : ${res.data?.message || '처리 실패'}`);
                }
            } catch (err) {
                console.error("CLAIM ERROR FULL:",err);

                if (axios.isAxiosError(err)) {
                    console.error("status:", err.response?.status);
                    console.error("data:", err.response?.data);
                    console.error("headers:", err.response?.headers);
                    console.error("config:", err.config);

                    const msg =
                        err.response?.data?.message ||
                        err.response?.data?.error ||
                        err.message;

                        toast.error(`서버 오류: ${msg}`);
                } else {
                    toast.error(`서버 오류: ${String(err)}`);
                }
            }
        };
    

    // 아이템 불러오기
    useEffect(() => {
        axios.get(`${API}/order/detail/oid/${oid}`, {
            withCredentials : true
        })
            .then(res => setOrder(res.data))
            .catch(err => console.error("주문 상세 불러오기 실패", err));
    }, [oid]);

    if (!order) return <div className="text-center py-20 text-gray-500">로딩 중...</div>;

    const steps = ['입금대기', '결제완료', '배송준비중', '배송중', '배송완료'];
    const currentStepIndex = steps.indexOf(order.items[0].orderStatus);

    // 주문 취소 함수
    const handleCancel = (item) => {
        if (!window.confirm(`"${item.title}"을(를) 취소하시겠습니까?`)) return;

        fetch(`${API}/order/cancel`, {
            credentials:'include',
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ 
                oid: item.oid, 
                pid: item.pid,
                usedCredit: order.usedCredit || 0,
                id: member?.id
            }) 
        })
            .then(res => res.json())
            .then(data => {
                if (data.success) {
                toast.success('주문이 취소되었습니다.');
                if (member) {
                    navigate('/orderList');
                } else {
                    navigate('/guestOrderSearch');
                }   
            } else {
                toast.error('취소 실패 : ' + data.message);
            }
        })
        .catch(err => toast.error('요청 실패'));
    };

    const addClaimFiles = (files) => {
        const incoming = Array.from(files || []);

        // 이미지 파일만
        const onlyImages = incoming.filter(f => f.type?.startsWith('image/'));
        if (onlyImages.length !== incoming.length) {
            toast.warn("이미지 파일만 업로드 가능합니다.");
        }

        // 용량 체크
        const overs = onlyImages.find(f => f.size > MAX_FILE_SIZE);
        if (overs) {
            toast.error(`5MB 이하만 가능합니다: ${overs.name}`);
            return;
        }

        // 개수 제한
        setClaimImages(prev => {
            const merged = [...prev, ...onlyImages];
            if (merged.length > MAX_CLAIM_IMAGES) {
                toast.error(`이미지는 최대 ${MAX_CLAIM_IMAGES}장까지 가능합니다.`);
                return merged.slice(0, MAX_CLAIM_IMAGES);
            }
            return merged;
        });
    };

    const handleClaimFileDrop = (e) => {
        e.preventDefault();
        e.stopPropagation();
        setIsDraggingClaim(false);
        addClaimFiles(e.dataTransfer.files);
    };

    const handleClaimFileChange = (e) => {
        addClaimFiles(e.target.files);
        e.target.value = "";
    }

    // 인치 -> cm 변환
    const convertInchToCm = (size) => {
        if (!size || typeof size !== 'string') return size;

        const [w, h] = size.split(/[xX]/).map(s => parseFloat(s.trim()));
        if (isNaN(w) || isNaN(h)) return size;

        const cmW = (w * 2.54).toFixed(1);
        const cmH = (h * 2.54).toFixed(1);
        return `${w} x ${h} (${cmW}cm x ${cmH}cm)`;
    }

    const convertCategoryName = (category) => {
        if (category === "masterPiece") {
            return "명화";
        } else if (category === "fengShui") {
            return "풍수";
        } else if (category === "authorCollection") {
            return "작가";
        } else if (category === "photoIllustration") {
            return "사진/일러스트";
        } else if (category === "koreanPainting")  {
            return "동양화";
        } else if (category === "customFrames") {
            return "맞춤액자";  
        } 
    }

    // 리스상품 반납일 계산기
    const calculateRemainingDays = (leaseEnd) => {
        const endDate = new Date(leaseEnd);
        const today = new Date();
        const timeDiff = endDate - today;

        if (isNaN(timeDiff)) return null;

        const days = Math.ceil(timeDiff / (1000 * 60 * 60 * 24));
        return days > 0 ? days : 0;
    }

    return (
        <div className="w-full bg-white sm:px-8 px-2 sm:mx-4 mx-2 sm:py-10 py-5 shadow-md border border-gray-200 sm:space-y-8 space-y-2 mb-20">
            {/* Title */}
            <div>
                <div className='flex items-center justify-between'>
                    <h2 className="
                        xl:text-2xl sm:text-[clamp(20px,1.876vw,24px)] text-[clamp(16px,3.129vw,20px)]
                        font-bold mb-2 shrink-0">주문 상세 내역</h2>
                    <div className="flex gap-1">
                        {/* 반품 / 교환 */}
                        {order.items[0].orderStatus === '배송완료' && !order.items[0].claimStatus && (
                            <div className="flex gap-1 justify-end">
                                <button
                                    className="
                                        px-2 py-1 
                                        lg:text-[11px] sm:text-[clamp(9px,1.0752vw,11px)] text-[clamp(7px,1.407vw,9px)]
                                        font-medium border border-gray-500 rounded-xl hover:bg-gray-100  text-gray-600 transition"
                                    onClick={() => {
                                        setClaimType('교환');
                                        setShowReturnForm(true);
                                        setClaimImages([]);
                                    }}
                                >
                                    교환/반품
                                </button>
                                {/* <button
                                    className="
                                        px-2 py-1 
                                        md:text-[11px] sm:text-[9px] text-[7px]
                                        font-medium border border-gray-500 rounded-xl hover:bg-gray-100  text-gray-600 transition" 
                                    onClick={() => {
                                        setClaimType('반품');
                                        setShowReturnForm(true);
                                    }}>
                                    반품 요청
                                </button> */}
                            </div>
                        )}
                        {/* 주문취소 */}
                        {['입금대기', '결제완료', '배송준비중'].includes(order.items[0].orderStatus) && (
                            <button 
                                className="
                                    px-2 py-1 
                                    md:text-[11px] sm:text-[clamp(9px,1.433vw,11px)] text-[clamp(7px,1.407vw,9px)]
                                    font-medium border border-gray-500 rounded-xl hover:bg-gray-100  text-gray-600 transition" 
                                onClick={() => handleCancel(order.items[0])}> 
                                주문취소
                            </button>
                        )}
                        
                        {member ? (
                            <button 
                                className="
                                    px-2 py-1 
                                    md:text-[11px] sm:text-[clamp(9px,1.433vw,11px)] text-[clamp(7px,1.407vw,9px)]
                                    font-medium border bg-black text-white border-gray-500 rounded-xl hover:text-gray-300 transition" 
                                onClick={() => navigate('/orderList')}> 
                                주문내역
                            </button>
                        ) : (
                            <button 
                                className="
                                    px-2 py-1 
                                    md:text-[11px] sm:text-[clamp(9px,1.433vw,11px)] text-[clamp(7px,1.407vw,9px)]
                                    font-medium border bg-black text-white border-gray-500 rounded-xl hover:text-gray-300 transition" 
                                onClick={() => navigate('/guestOrderSearch')}>주문조회</button>
                        )}
                    </div>
                </div>
                    {/* md:text-sm sm:text-[12px] text-[10px] */}
                <p 
                    className="
                        lg:text-sm sm:text-[clamp(12px,1.822vw,14px)] text-[clamp(10px,1.878vw,12px)]
                        text-gray-500"
                >
                    주문번호: <span className="font-medium">{order.oid}</span> | 주문일자 {order.createdAt?.slice(0, 16)}
                </p>
            </div>

            {/* 상품 정보 */}
            {order.items.map((item, index) => (
                <div key={item.itemId || index}
                    className="
                        flex sm:gap-6 gap-[6px] items-start border rounded-lg
                        md:p-6 p-2
                        bg-gray-50 cursor-pointer transition-transform hover:shadow-lg hover:bg-gray-200"
                    onClick={() => navigate(`/orderTracking/${item.itemId}`)}
                >
                    <img src={item.category === 'customFrames' ? thumbCustom : item.thumbnail} alt={item.title} 
                        className="
                            md:w-28 sm:w-[clamp(5rem,10.95vw,7rem)] w-[clamp(3rem,12.52vw,5rem)]
                            md:h-28 sm:h-[clamp(5rem,10.95vw,7rem)] h-[clamp(3rem,12.52vw,5rem)]
                            object-cover rounded border" 
                    />
                    <div className="
                        flex flex-col
                        md:h-28 sm:h-[clamp(5rem,10.948vw,7rem)]
                        justify-between flex-1">
                            {/* md:text-lg sm:text-[14px] text-[9px] */}
                        <div
                            className="flex sm:justify-between sm:flex-row flex-col
                                lg:text-lg md:text-[clamp(14px,1.759vw,18px)] text-[clamp(9px,1.8252vw,14px)]
                                font-semibold mb-2">
                            <span className="line-clamp-1">{item.title}</span>
                             <span>{item.orderStatus}</span> {/* 상태 색 넣기!!!!!!!!!!!!! */}
                        </div>
                        <div>
                            <div className="flex sm:flex-row flex-col sm:justify-between">
                                <div>
                                    {/*     md:text-sm sm:text-[11px] text-[9px] */}
                                    <div
                                        className="
                                            lg:text-sm md:text-[clamp(11px,1.368vw,14px)] text-[clamp(9px,1.433vw,11px)]
                                            text-gray-500">
                                        <span className="text-black">카테고리: {convertCategoryName(item.category)}</span> <br />
                                        사이즈: {convertInchToCm(item.size)} <br />
                                        수량: ({item.quantity}개) <br />
                                        {item.category === 'lease' && (
                                        `기간 : ${item.period}`
                                        )}

                                        {item.category === 'lease' && item.leaseStart && (
                                            ` / (${item.leaseStart} ~ ${item.leaseEnd})`)
                                        }

                                        {item.category === 'lease' && !item.leaseStart && (
                                            ` / 리스 기간이 아직 등록되지 않았습니다.`)
                                        }

                                        {item.category === 'lease' && item.leaseEnd && (
                                            ` / 남은 기간: ${calculateRemainingDays(item.leaseEnd)}일`)
                                        }
                                    </div>
                                </div>
                                    {/* md:text-base sm:text-[13px] text-[10px] */}
                                <div 
                                    className="
                                        flex sm:items-end justify-end
                                        lg:text-base md:text-[clamp(13px,1.564vw,16px)] text-[clamp(10px,1.694vw,13px)]
                                        font-bold text-right mt-[2px]">
                                    {(item.price)?.toLocaleString()}원
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            ))}

            {/* 반품 입력창 */}
            {showReturnForm && order.items[0].orderStatus !== '반품신청' && (
                <div 
                    className="
                        sm:text-base text-[clamp(11px,2.503vw,16px)]
                        space-y-2 mt-4
                        text-gray-700 border rounded p-4 bg-gray-50">
                    <div className="flex items-center gap-4">
                        <div className="flex items-center gap-1">
                            <input className="w-3 h-3" type="radio" checked={claimType === '교환'} onChange={() => setClaimType('교환')} /> 
                            <label className="sm:text-base text-[clamp(12px,2.503vw,16px)]">
                                교환
                            </label>
                        </div>
                        <div className="flex items-center gap-1">
                            <input className="w-3 h-3" type="radio" checked={claimType === '반품'} onChange={() => setClaimType('반품')} /> 
                            <label className="sm:text-base text-[clamp(12px,2.503vw,16px)]">
                                반품
                            </label>
                        </div>
                    </div>
                    
                    <select
                        className="
                            
                            w-full border px-3 py-2 rounded"
                        value={returnReason}
                        onChange={(e) => setReturnReason(e.target.value)}>
                            <option value="">{claimType}사유를 선택해주세요</option>
                            <option value="단순변심">단순변심</option>
                            <option value="상품불량">상품불량</option>
                            <option value="오배송">오배송</option>
                            <option value="기타">기타</option>
                    </select>

                    <textarea
                        placeholder="상세 사유 입력 (선택사항)"
                        className="
                            w-full border px-3 py-2 rounded"
                        rows={2}
                        value={returnDetail}
                        onChange={(e) => setReturnDetail(e.target.value)}
                    />
                    {claimType === '반품' && (
                    <>
                        <input 
                            type="text"
                            placeholder="은행명"
                            className="w-full border px-3 py-2 rounded"
                            value={bankName}
                            onChange={(e) => setBankName(e.target.value)}
                        />
                        <input 
                            type="text"
                            placeholder="계좌번호"
                            className="w-full border px-3 py-2 rounded"
                            value={accountNumber}
                            onChange={(e) => setAccountNumber(e.target.value)}
                        />
                        <input 
                            type="text"
                            placeholder="예금주"
                            className="w-full border px-3 py-2 rounded"
                            value={accountHolder}
                            onChange={(e) => setAccountHolder(e.target.value)}
                        />
                    </>
                    )}

                    <div className="mt-3">
                        <div className="flex items-center justify-between mb-2">
                            <span className="font-semibold text-gray-700">
                                {claimType} 증빙 이미지 (선택, 최대 {MAX_CLAIM_IMAGES}장)
                            </span>
                            <span className="text-xs text-gray-500">
                                드래그로 순서 변경 가능
                            </span>
                        </div>

                        <label
                            htmlFor="claimInput"
                            onDragEnter={(e) => {
                                e.preventDefault();
                                setIsDraggingClaim(true);
                            }}
                            onDragLeave={(e) => {
                                e.preventDefault();
                                setIsDraggingClaim(false);
                            }}
                            onDragOver={(e) => e.preventDefault()}
                            onDrop={handleClaimFileDrop}
                            className={`w-full h-[120px] border-2 border-dashed flex items-center justify-center rounded-lg text-gray-500 cursor-pointer transition
                                ${isDraggingClaim ? 'border-[#D0AC88] bg-[#fff7eb]' : 'border-gray-300 hover:border-[#D0AC88]'}`}
                        >
                            <input
                                type="file"
                                id="claimInput"
                                multiple
                                accept="image/*"
                                onChange={handleClaimFileChange}
                                className="hidden"
                            />
                            {isDraggingClaim ? '이미지를 놓으세요' : '여기를 클릭하거나 이미지를 드래그하세요'}
                        </label>

                        {claimImages.length > 0 && (
                            <div className="mt-3">
                                <DragDropContext
                                    onDragEnd={(result) => {
                                        if (!result.destination) return;
                                        const updated = Array.from(claimImages);
                                        const [moved] = updated.splice(result.source.index, 1);
                                        updated.splice(result.destination.index, 0, moved);
                                        setClaimImages(updated);
                                    }}
                                >
                                    <Droppable droppableId="claimImgs" direction="horizontal">
                                        {(provided) => (
                                            <div
                                                className="grid grid-cols-4 gap-2"
                                                {...provided.droppableProps}
                                                ref={provided.innerRef}
                                            >
                                                {claimImages.map((file, index) => (
                                                    <Draggable
                                                        key={file.name + index}
                                                        draggableId={file.name + index}
                                                        index={index}
                                                    >
                                                        {(provided) => (
                                                            <div
                                                                ref={provided.innerRef}
                                                                {...provided.draggableProps}
                                                                {...provided.dragHandleProps}
                                                                className="w-24"
                                                            >   
                                                                <div className="relative w-24 h-24">
                                                                    <img
                                                                        src={URL.createObjectURL(file)}
                                                                        alt={`claim-${index}`}
                                                                        className="w-24 h-24 object-cover border rounded"
                                                                    />

                                                                    <button
                                                                        type="button"
                                                                        onClick={() => {
                                                                            const updated = [...claimImages];
                                                                            updated.splice(index, 1);
                                                                            setClaimImages(updated);
                                                                        }}
                                                                        className="
                                                                            absolute -top-2 -right-2 
                                                                            w-6 h-6
                                                                            bg-black text-white text-xs 
                                                                            flex items-center justify-center
                                                                            shadow
                                                                        "
                                                                    >
                                                                        ✕
                                                                    </button>
                                                                </div>

                                                                <div className="text-xs text-center mt-1">#{index + 1}</div>
                                                            </div>
                                                        )}
                                                    </Draggable>
                                                ))}
                                                {provided.placeholder}
                                            </div>
                                        )}
                                    </Droppable>
                                </DragDropContext>

                                <button
                                    type="button"
                                    className="mt-3 w-full border rounded py-2 text-sm text-gray-700 hover:bg-gray-100"
                                    onClick={() => setClaimImages([])}
                                >
                                    이미지 전체 삭제
                                </button>
                            </div>
                        )}
                    </div>

                    <button
                        onClick={handleSubmitReturn}
                        className="
                            w-full bg-black text-white py-2 rounded hover:bg-gray-800 mt-2">
                            요청 접수
                    </button>
                </div>
            )}

            { /* 결제 정보 */}
            <div>
                <h3 
                    className="
                        font-semibold mb-4 
                        md:text-lg sm:text-[clamp(16px,2.346vw,18px)] text-[clamp(14px,2.503vw,16px)]">결제 정보</h3>
                <div 
                    className="
                        bg-gray-50 rounded-md sm:p-4 p-1 leading-6 space-y-3
                        md:text-base sm:text-[clamp(11.5px,2.085vw,16px)] text-[clamp(10px,1.7996vw,11.5px)]
                        ">
                    <div >
                        <span 
                            className="
                                text-black mb-2">결제 수단: <span className="font-normal">{order.paymentMethod}</span></span>
                    </div>
                    { order.paymentMethod === '무통장입금' && (
                        <>
                            <div><span className="text-black mb-2">입금자명:</span> {order.depositor}</div>
                            <div><span className="text-black mb-2">입금 계좌:</span> {order.bankAccount}</div>
                        </>
                    )}
                    <div><span className="text-black mb-2">총 상품금액:</span> {order.totalPrice.toLocaleString()}원</div>
                    <div><span className="text-black mb-2">적립금 사용:</span> {order.usedCredit.toLocaleString()}원</div>
                    <div><span className="text-black mb-2">배송비:</span> {order.deliveryFee.toLocaleString()}원</div>
                    <div><span className="text-black mb-2">최종 결제금액:</span> {order.finalPrice.toLocaleString()}원</div>
                </div>
            </div>

            {/* 현금 영수증 */}
            {order.receiptInfo && (
                <div 
                    className="
                        mt-6 sm:p-5 p-2 border border-gray-200 rounded-md bg-gray-50 
                        md:text-base sm:text-[clamp(11.5px,2.085vw,16px)] text-[clamp(10px,1.7996vw,11.5px)]
                        text-gray-800">
                    <h3 
                        className="
                            font-semibold 
                            md:text-lg sm:text-[clamp(16px,2.346vw,18px)] text-[clamp(14px,2.503vw,16px)]
                            text-gray-900 mb-4">현금 영수증 정보</h3>

                    <div className="flex justify-between py-1 border-b border-gray-100">
                        <span className='text-gray-600'>발급 유형</span>
                        <span className="font-medium text-gray-800">{order.receiptType || '정보 없음'}</span>
                    </div>
                    
                    <div className="flex justify-between py-1 border-b border-gray-100">
                        <span className="text-gray-600">신청 방법</span>
                        <span className="font-medium text-gray-800">{order.receiptMethod || '정보 없음'}</span>
                    </div>

                    <div className="flex justify-between py-1">
                        <span className="text-gray-600">신청 번호</span>
                        <span className="font-medium text-gray-800">{order.receiptInfo || '정보 없음'}</span>
                    </div>
                </div>
            )}

            {/* 맞춤액자 사진보정 정보 */}
            {order.items?.[0]?.category === 'customFrames' && (() => {
                const item = order.items[0];

                const retouchEnabled =
                    item.retouchEnabled === 1 || item.retouchEnabled === true;

                const retouchTypes = (item.retouchTypes || '')
                    .split(',')
                    .map(v => v.trim())
                    .filter(Boolean);

                return (
                    <div>
                        <h3 className="font-semibold mb-4 text-lg">사진 보정 정보</h3>

                        <div className="bg-gray-50 p-4 rounded-md text-sm leading-6">
                            <div>
                                <span className='font-semibold text-black mb-2'>보정 신청:</span>{' '}
                                {retouchEnabled ? '신청' : '미신청'}
                            </div>

                            {retouchEnabled && (
                                <>
                                    <div className="mt-2">
                                        <span className="font-semibold text-black mb-2">보정 항목:</span>
                                        {retouchTypes.length > 0 ? (
                                            <div className="mt-2 flex flex-wrap gap-2">
                                                {retouchTypes.map(t => (
                                                    <span
                                                        key={t}
                                                        className="px-2 py-1 text-xs border rounded-full bg-white"
                                                    >
                                                        {t}
                                                    </span>
                                                ))}
                                            </div>
                                        ) : (
                                            <span className="ml-2 text-gray-500">선택 없음</span>
                                        )}
                                    </div>

                                    <div className='mt-2'>
                                        <span className="font-semibold text-black mb-2">요청사항:</span>{' '}
                                        {item.retouchNote ? (
                                            <span className="whitespace-pre-line">{item.retouchNote}</span>
                                        ) : (
                                            <span className="text-gray-500">없음</span>
                                        )}
                                    </div>

                                    {item.category === 'customFrames' && (
                                    <div className="mt-2 flex items-center gap-2">
                                        {/* 보정 상태 뱃지 */}
                                        <span
                                        className={`text-[11px] px-2 py-[2px] rounded-full border whitespace-nowrap
                                            ${((item.retouchEnabled === 1 || item.retouchEnabled === true))
                                            ? 'bg-[#fff3e6] border-[#D0AC88] text-[#a67a3e]'
                                            : 'bg-gray-100 border-gray-200 text-gray-500'
                                            }`}
                                        >
                                        {(item.retouchEnabled === 1 || item.retouchEnabled === true) ? '보정 요청 있음' : '보정 없음'}
                                        </span>

                                        {/* 보정 요청 버튼 */}
                                        {canEditRetouchByStatus(item.orderStatus) && (
                                        <button
                                            className="px-2 py-[2px] text-[11px] rounded-xl border border-[#D0AC88] text-[#a67a3e] hover:bg-[#fffaf3] transition whitespace-nowrap"
                                            onClick={(e) => {
                                            e.stopPropagation();
                                            openRetouchModal(item);
                                            }}
                                        >
                                            {(item.retouchEnabled === 1 || item.retouchEnabled === true) ? '보정 요청 수정' : '보정 요청하기'}
                                        </button>
                                        )}
                                    </div>
                                    )}
                                </>
                            )}
                        </div>
                    </div>
                )
            })()}

            { /* 배송지 정보 */}
            <div>
                <h3 
                    className="
                        font-semibold mb-4 
                        md:text-lg sm:text-[clamp(16px,2.346vw,18px)] text-[clamp(14px,2.503vw,16px)]
                ">
                    배송지 정보
                </h3>
                <div 
                    className="
                        grid grid-cols-1 sm:grid-cols-2 gap-y-3 
                        md:text-base sm:text-[clamp(11.5px,2.085vw,16px)] text-[clamp(10px,1.7996vw,11.5px)]
                        text-gray-700">
                    <div><span className="font-medium">이름:</span> {order.ordererName}</div>
                    <div><span className="font-medium">연락처:</span> {order.ordererPhone}</div>
                    <div><span className="font-medium">이메일:</span> {order.email}</div>
                    <div>
                        <span className="font-medium">주소:</span>{order.address}<br />
                        {order.detailAddress}({order.postcode})
                    </div>
                </div>
            </div>

            {/* 보정 요청 모달 */}
            {retouchModalOpen && (
            <div
                className="fixed inset-0 bg-black/50 z-[60] flex items-center justify-center px-4"
                onClick={closeRetouchModal}
            >
                <div
                className="w-full max-w-lg bg-white rounded-2xl shadow-xl p-5"
                onClick={(e) => e.stopPropagation()}
                >
                <div className="flex items-start justify-between">
                    <div>
                    <h3 className="text-lg font-bold text-gray-800">보정 요청</h3>
                    <p className="text-sm text-gray-500 mt-1">
                        원하는 보정 항목을 선택하고 요청사항을 적어주세요.
                    </p>
                    </div>

                    <button
                    className="w-9 h-9 rounded-full hover:bg-gray-100 text-gray-600"
                    onClick={closeRetouchModal}
                    >
                    ✕
                    </button>
                </div>

                <div className="mt-4">
                    <label className="flex items-center gap-2 text-sm font-semibold text-gray-700">
                    <input
                        type="checkbox"
                        checked={retouchDraft.enabled}
                        onChange={(e) =>
                        setRetouchDraft(d => ({
                            ...d,
                            enabled: e.target.checked,
                            types: e.target.checked ? d.types : [],
                            note: e.target.checked ? d.note : '',
                        }))
                        }
                    />
                    이 사진 보정 요청할게요
                    </label>

                    <div className={`mt-4 ${retouchDraft.enabled ? '' : 'opacity-50 pointer-events-none'}`}>
                    <div className="text-sm font-semibold text-gray-700 mb-2">보정 항목 선택</div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                        {retouchOptions.map(opt => {
                        const checked = retouchDraft.types.includes(opt);
                        return (
                            <button
                            key={opt}
                            type="button"
                            className={`text-sm px-3 py-2 rounded-xl border transition text-left
                                ${checked ? 'border-[#D0AC88] bg-[#fffaf3] text-[#a67a3e]' : 'border-gray-200 hover:bg-gray-50 text-gray-700'}
                            `}
                            onClick={() => {
                                setRetouchDraft(d => {
                                const on = d.types.includes(opt);
                                const next = on ? d.types.filter(t => t !== opt) : [...d.types, opt];
                                return { ...d, types: next };
                                });
                            }}
                            >
                            {opt}
                            </button>
                        );
                        })}
                    </div>

                    <div className="mt-4">
                        <div className="text-sm font-semibold text-gray-700 mb-2">요청사항</div>
                        <textarea
                        rows={4}
                        value={retouchDraft.note}
                        onChange={(e) => setRetouchDraft(d => ({ ...d, note: e.target.value }))}
                        placeholder="예) 잡티 제거, 피부톤 자연스럽게, 배경 흰색으로, 역광 완화 등"
                        className="w-full border border-gray-200 rounded-xl p-3 text-sm outline-none focus:ring-2 focus:ring-[#D0AC88]"
                        />
                        <p className="text-xs text-gray-500 mt-2">
                        ※ 난이도가 높은 보정은 상담 후 추가 비용이 발생할 수 있습니다
                        </p>
                    </div>
                    </div>
                </div>

                <div className="mt-5 flex gap-2">
                    <button
                    className="flex-1 h-[46px] rounded-xl border border-gray-200 hover:bg-gray-50 text-gray-700"
                    onClick={closeRetouchModal}
                    >
                    취소
                    </button>
                    <button
                    className="flex-1 h-[46px] rounded-xl bg-[#D0AC88] text-white hover:opacity-90"
                    onClick={saveRetouch}
                    >
                    저장
                    </button>
                </div>
                </div>
            </div>
            )}
        </div>
    )
}

export default OrderDetail;