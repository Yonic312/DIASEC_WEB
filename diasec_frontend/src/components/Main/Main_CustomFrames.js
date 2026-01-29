import { useState, useEffect, useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import { MemberContext } from '../../context/MemberContext';
import { toast } from 'react-toastify';
import { v4 as uuidv4 } from 'uuid';

import bg from '../../assets/CustomFrames/p.png';
import ex from '../../assets/CustomFrames/ex.jpg';
import icon_kakao from '../../assets/button/icon_kakao.png'
import icon_naver from '../../assets/button/icon_naver.png'

// 보정
import faceDot_1 from '../../assets/custom_Frames/faceDot_1.jpg';
import faceDot_2 from '../../assets/custom_Frames/faceDot_2.jpg';
import faceENM_1 from '../../assets/custom_Frames/faceENM_1.jpg';
import faceENM_2 from '../../assets/custom_Frames/faceENM_2.jpg';
import portrait_1 from '../../assets/custom_Frames/portrait_1.jpg';
import portrait_2 from '../../assets/custom_Frames/portrait_2.jpg';
import backlight_1 from '../../assets/custom_Frames/backlight_1.jpg';
import backlight_2 from '../../assets/custom_Frames/backlight_2.jpg';

const Main_CustomFrames = () => {
    const API = process.env.REACT_APP_API_BASE;
    const {member, setMember} = useContext(MemberContext);
    const navigate = useNavigate();
    const [customItems, setCustomItems] = useState([]); // 상품 여러개

    const [width, setWidth] = useState('35.6');
    const [height, setHeight] = useState(27.9);
    const [imageSrc, setImageSrc] = useState(null);
    const [aspectRatio, setAspectRatio] = useState(null);

    

    useEffect(() => {
        setWidthInput(String(Math.floor(width)));
    }, [width]);


    const [showGuestChoice, setShowGuestChoice] = useState(false);

    // 사이즈 조절하기 아래 이미지 사진 상품 리스트
    const [selectedItemId, setSelectedItemId] = useState(null);
    const selectedItem = customItems.find(item => item.id === selectedItemId);

    const MIN_WIDTH = 35.6;

    // ex 사진에 초기 설정
    useEffect(() => {
        // 새 이미지 객체 생성 (비동기로 이미지 로딩 가능)
        const img = new Image();

        // 이미지 로드가 완료되면 실행되는 함수
        img.onload = () => {
            // 현재 설정된 width / height 값으로 비율을 계산
            const ratio = width / height;

            // 계산한 비율을 상태로 저장 (다른 곳에서 사용하기 위해)
            setAspectRatio(ratio);
        };

        // 이미지 src를 설정하여 로딩 시작
        img.src = ex;
    }, []);

    // 썸네일 이미지 클릭시 사이즈 수정 UI 반영
    useEffect(() => {
        if (selectedItem) {
            setWidth(selectedItem.width);
            setHeight(selectedItem.height);
            setImageSrc(selectedItem.imageSrc);
            setAspectRatio(selectedItem.aspectRatio);
            setMaxWidth(selectedItem.maxWidth);
            setMaxHeight(selectedItem.maxHeight);
        }
    }, [selectedItemId]);

    // 실시간으로 항목들의 사이즈 변경
    useEffect(() => {
        if (!selectedItemId || !aspectRatio) return;

        const newArea = Math.floor(width * height);
        const newPrice = calculateCumulativePrice(newArea);

        setCustomItems(prev => 
            prev.map(item => 
                item.id === selectedItemId
                ? { ...item, width, height, price: newPrice}
                : item
            )
        );
    }, [width, height]);

    // 길이 조절
    const [maxWidth, setMaxWidth] = useState(200.7);
    const [maxHeight, setMaxHeight] = useState(101.6);

    function dataURLtoFile(dataurl, filename) {
        const arr = dataurl.split(',');
        const mime = arr[0].match(/:(.*?);/)[1];
        const bstr = atob(arr[1]);
        let n = bstr.length;
        const u8arr = new Uint8Array(n);

        while (n--) {
            u8arr[n] = bstr.charCodeAt(n);
        }
        return new File([u8arr], filename, { type: mime });
    }

    const handleImageUpload = (e) => {
        const files = Array.from(e.target.files);
        if (!files.length) return;

        files.forEach(file => {
            const reader = new FileReader();
            reader.onload = () => {
                const img = new Image();

                //이미지가 로드되면 실행되는 콜백
                img.onload = () => {
                    // 새 캔버스 요소를 생성하고, 이미지 크기와 동일하게 설정
                    const canvas = document.createElement('canvas');
                    canvas.width = img.width;
                    canvas.height = img.height;
                    
                    // 캔버스의 2D 그래픽 컨텍스트 가져오기
                    const ctx = canvas.getContext('2d');

                    // 캔버스 전체를 흰색으로 채움 (투명 배경을 흰색으로 덮기 위함)
                    ctx.fillStyle = '#ffffff';
                    ctx.fillRect(0, 0, canvas.width, canvas.height);

                    // 흰 배경 위에 원본 이미지를 그려서 투명 영역을 제거
                    ctx.drawImage(img, 0, 0);

                    // 흰 배경이 합쳐진 최종 이미지를 JPEG 포맷으로 변환하여 데이터 URL로 저장
                    const resultImage = canvas.toDataURL('image/jpeg', 1.0);

                    const imageFile = dataURLtoFile(resultImage, `${uuidv4()}.jpg`);

                    setImageSrc(resultImage);

                    // 사이즈 계산
                    const ratio = img.width / img.height;
                    const maxWidth = ratio >= 1 ? 200.7 : 101.6;
                    const maxHeight = ratio >= 1 ? 101.6 : 200.7;
                    let width = 35.6;
                    let height = parseFloat((width / ratio).toFixed(1));
                    if (height > maxHeight) {
                        height = maxHeight;
                        width = parseFloat((height * ratio).toFixed(1));
                    }

                    const area = Math.floor(width * height);
                    const price = calculateCumulativePrice(area);

                    const newItem = {
                        id: uuidv4(),
                        imageSrc: resultImage,
                        file: imageFile,
                        aspectRatio: ratio,
                        width,
                        height,
                        maxWidth,
                        maxHeight,
                        price,
                        retouch: { enabled: false, types: [], note: '' },
                    };
                    setCustomItems(prev => [...prev, newItem]);
                    setSelectedItemId(newItem.id);
                };
                img.src = reader.result;
            };
            reader.readAsDataURL(file);
        })
    }

    // 입력 완료 후 반영(딜레이 입력)
    const [widthInput, setWidthInput] = useState(String(Math.floor(width)));
    const [toastCooldown, setToastCooldown] = useState(false);

    const showToastOnce = (message) => {
        if (!toastCooldown) {
            toast.error(message);
            setToastCooldown(true);
            setTimeout(() => setToastCooldown(false), 1000);
        }
    };

    const handleWidthChange = (e) => {
        let value = parseFloat(e.target.value);
        if (value < MIN_WIDTH) {
            showToastOnce(`최소 넓이는 ${Math.floor(MIN_WIDTH)}cm입니다.`);
            value = MIN_WIDTH;
        } else if (value > maxWidth) {
            showToastOnce(`최대 넓이는 ${Math.floor(maxWidth)}cm입니다.`);
            value = maxWidth;
        }

        if (aspectRatio) {
            let newHeight = Math.floor(value / aspectRatio);

            if (newHeight > maxHeight) {
                showToastOnce(`이미지 비율로 계산된 높이가 최대 높이 ${maxHeight}cm를 초과하여 자동 조정됩니다.`);
                newHeight = maxHeight;
                value = parseFloat((newHeight * aspectRatio).toFixed(1));
            }
            
            setWidth(Math.floor(value));
            setHeight(Math.floor(newHeight));
        } else {
            setWidth(Math.floor(value));
        }
    }

    // cm to px 변환 비율
    const CM_TO_PX = 2.74;
    const previewWidth = width * CM_TO_PX;
    const previewHeight = height * CM_TO_PX;

    const priceTiers = [
        { maxArea: 993.4, unitPrice: 45.3 },
        { maxArea: 1327.9, unitPrice: 39.2 },
        { maxArea: 2064.5, unitPrice: 33.6 },
        { maxArea: 2477.4, unitPrice: 32.9 },
        { maxArea: 3096.7, unitPrice: 32.2 },
        { maxArea: 4967.2, unitPrice: 29.1 },
        { maxArea: 6451.6, unitPrice: 28.9 },
        { maxArea: 7741.9, unitPrice: 28.7 },
        { maxArea: 8535.4, unitPrice: 28.1 },
        { maxArea: 12133.0, unitPrice: 27.1 },
        { maxArea: 18393.3, unitPrice: 26.4 },
        { maxArea: 20503.4, unitPrice: 24.5 },
        { maxArea: Infinity, unitPrice: 25.4 }, // 최종 fallback
    ];

    // 기준 배경 px (디자인 사이즈)
    const BASE_BG_W = 958;
    const BASE_BG_H = 766;

    // 오버레이 비율 계산 (기준 대비)
    const overlayWidthPct = (previewWidth / BASE_BG_W) * 100;
    const overlayHeightPct = (previewHeight / BASE_BG_H) * 100;

    // 계산
    const calculateCumulativePrice = (area) => {
        let remainingArea = area;
        let lastMax = 0;
        let totalPrice = 0;

        for (let i =0; i < priceTiers.length; i++) {
            const tier = priceTiers[i];
            const tierArea = Math.min(tier.maxArea - lastMax, remainingArea);

            if (tierArea <= 0) break;

            totalPrice += tierArea * tier.unitPrice;
            remainingArea -= tierArea;
            lastMax = tier.maxArea;
        }
        return Math.floor(Math.round(totalPrice) / 1000) * 1000;
    }

    // 사이즈 조정바 최대 width 계산
    const getActualMaxWidth = () => {
        if (!aspectRatio) return maxWidth;

        // 높이 제한에 걸리는지 확인
        const widthByHeight = maxHeight * aspectRatio;

        // 둘 중 작은 값이 실제 최대값
        return Math.min(maxWidth, widthByHeight);
    };

    const actualMaxWidth = getActualMaxWidth();

    // 이미지 드래그 앤 드랍 이벤트 핸들러
    const [isDragging, setIsDragging] = useState(false);

    const handleDrop = (e) => {
        e.preventDefault();
        e.stopPropagation();

        const files = Array.from(e.dataTransfer.files);

        if (files.length > 0) {
            const fakeEvent = { target: { files } };
            handleImageUpload(fakeEvent);
        }
    }

    // 최종 비용 계산(배송비)
    const SHIPPING_FEE = 3000; // 기본 배송비
    const FREE_SHIPPING_THRESHOLD = 50000; // - 이상 무료
    
    // 가격 계산 로직 추가
    const totalPriceWithoutShipping = customItems.reduce((acc, item) => {
        const area =Math.floor(item.width * item.height);
        return acc + calculateCumulativePrice(area);
    }, 0);

    const totalPrice = totalPriceWithoutShipping >= FREE_SHIPPING_THRESHOLD
        ? totalPriceWithoutShipping
        : totalPriceWithoutShipping + SHIPPING_FEE;
    
    // 바로구매 (결제)
    const handleBuyNow = () => {
        if (!customItems.length === 0) {
            toast.warn("이미지를 등록해주세요.");
            return;
        }

        // 로그인이 안 된 경우 -> 선택 모달 열기
        if (!member?.id) {
            setShowGuestChoice(true);
            return;
        }

        const orderItems = customItems.map(item => {
            const enabledVal = item.retouch?.enabled ? 1 : 0;
            const typesStr = item.retouch?.types?.join(', ') ?? '';
            const noteStr = item.retouch?.note ?? '';
            
            return {
            id: member.id,
            pid: '-3',
            title: '맞춤 액자',
            price: item.price, // 배송비 제외
            thumbnail: item.imageSrc,
            size: `${item.width}` + ' X ' + `${item.height}`,
            category:'customFrames',
            quantity:'1',

            retouchEnabled: enabledVal,
            retouchTypes: enabledVal ? typesStr : null,
            retouchNote: enabledVal ? noteStr : null,
            };
        });
        console.log(orderItems);
        navigate('/orderForm', { state: { orderItems } });
    }

    // [보정] 사진 befor / after
    const beforeAfterData = [
        { title: '피부 보정', before: faceDot_1, after: faceDot_2},
        { title: '얼굴 디테일 보정', before: faceENM_1, after: faceENM_2},
        { title: '얼굴 라인·몸매 보정', before: portrait_1, after: portrait_2},
        { title: '이미지 역광 및 색감보정', before: backlight_1, after: backlight_2},
        { title: '불필요한 배경 삭제 및 변경', before: backlight_1, after: backlight_2},
        { title: '업스케일링 (흐릿한 사진 선명보정)', before: backlight_1, after: backlight_2},
    ];
    const retouchOptions = beforeAfterData.map(v => v.title);

    const [activeIndex, setActiveIndex] = useState(0);
    const [showAfter, setShowAfter] = useState(false);

    // 보정 요청 모달 상태
    const [retouchModalOpen, setRetouchModalOpen] = useState(false);
    const [retouchTargetId, setRetouchTargetId] = useState(null);
    const [retouchDraft, setRetouchDraft] = useState({
        enabled: false,
        types: [],
        note: '',
    })

    const current = beforeAfterData[activeIndex];

    const openRetouchModal = (item) => {
        setRetouchTargetId(item.id);
        setRetouchDraft(item.retouch ?? { enabled:false, types: [], note: '' });
        setRetouchModalOpen(true);
    };

    const closeRetouchModal = () => {
        setRetouchModalOpen(false);
        setRetouchTargetId(null);
    };

    const saveRetouch = () => {
        if (!retouchTargetId) return;

        if (retouchDraft.enabled && retouchDraft.types.length === 0) {
            toast.warn("보정 항목을 하나 이상 선택해주세요.");
            return;
        }

        setCustomItems(prev =>
            prev.map(it =>
                it.id === retouchTargetId 
                    ? { ...it, retouch: {...retouchDraft } } 
                    : it
            )
        );

        setRetouchModalOpen(false);
        setRetouchTargetId(null);
        toast.success("보정 요청이 저장되었습니다.");
    }

    return (
        <div className="flex flex-col w-full h-full">
            <div>
                <div className='flex justify-center mt-12 items-start'>
                    <div className="flex flex-col items-center w-[80px]">
                        <div className='
                                md:w-9 w-[clamp(24px,4.693vw,36px)] 
                                md:h-9 h-[clamp(24px,4.693vw,36px)] 
                                rounded-full bg-[#D0AC88] text-white 
                                flex items-center justify-center font-semibold'>
                            1
                        </div>
                        <span 
                            className='
                                md:text-sm text-[clamp(10px,1.82vw,14px)]
                                mt-2 text-600 font-medium text-center'
                        >
                            사이즈 조정
                        </span>
                    </div>

                    <div className="flex items-center h-[36px]">
                        {/* 선 */}
                        <div className="w-[42px] h-[2px] bg-gray-300" />

                        {/* 화살표 */}
                        <div className="
                            w-0 h-0
                            border-t-[4px] border-t-transparent
                            border-b-[4px] border-b-transparent
                            border-l-[6px] border-l-gray-300
                        "
                        />
                    </div>

                    <div className="flex flex-col items-center w-[80px]">
                        <div className='
                                md:w-9 w-[clamp(24px,4.693vw,36px)] 
                                md:h-9 h-[clamp(24px,4.693vw,36px)] 
                                rounded-full bg-[#D0AC88] text-white 
                                flex items-center justify-center font-semibold'>
                            2
                        </div>
                        <span 
                            className='
                                md:text-sm text-[clamp(10px,1.82vw,14px)]
                                mt-2 text-600 font-medium text-center'
                        >
                            결제
                        </span>
                    </div>
                </div>
                <div className="text-center">
                    <p 
                        className="
                            px-3
                            mt-2 text-gray-600
                            md:text-sm text-[clamp(10.5px,1.825vw,14px)]">
                        오른쪽에서 사이즈를 조정해 원하는 크기를 확인하시고 결제를 하면 주문이 완료됩니다
                    </p>
                </div>
            </div>
            
            <div className="flex md:flex-row flex-col w-full md:h-full h-auto md:overflow-hidden overflow-visible mt-4 gap-5">
                {/* 이미지창 */}
                <div className="relative h-full ">
                    <img 
                        src={bg}
                        className='
                            w-full h-auto aspect-[958/766]'
                        alt="배경"
                    />
                    {/* 입력 사이즈에 따라 겹쳐서 표시 */}
                    <img 
                        src={imageSrc || ex}
                        alt="입력한 프레임"
                        className="absolute object-cover"
                        style={{
                            width: `${overlayWidthPct}%`,
                            height: `${overlayHeightPct}%`,
                            top: '30%',
                            left: '50%',
                            transform: `translate(-50%, -50%)`,
                            // boxShadow: '-5px 5px 5px rgba(0, 0, 0, 0.4)',
                            boxShadow: '-5px 5px 5px rgba(193, 155, 110, 0.6)',
                            pointerEvents: 'none'
                        }}
                    />
                </div>

                {/* 결제창 */}
                <div className="
                    h-fit flex flex-col flex-1 min-w-[296px] rounded-xl px-3 
                    md:py-[15px] py-[10px]
                    border-[1px] border-[#D0AC88]">
                    <div className="hidden md:inline">
                        <span className="text-2xl font-bold">맞춤액자</span>
                    </div>

                    {/* 이미지 업로드 */}
                    <div className="md:mt-5">
                        <label className="text-sm font-semibold">이미지 등록</label>
                        <div className='mt-2'>
                            {/* 숨겨진 파일 업로드 input */}
                            <input 
                                type="file"
                                accept="image/jpeg, image/png"
                                id="fileInput"
                                onChange={handleImageUpload}
                                className="hidden"
                                multiple
                            />

                            {/* 드래그 앤 드랍 + 클릭 영역 */}
                            <label
                                htmlFor="fileInput"
                                className={` 
                                    w-full
                                    md:h-[140px] h-[120px]
                                    text-base mt-2 py-2 border-2 border-dashed border-gray-400 rounded-lg flex items-center justify-center text-gray-500 mb-4 cursor-pointer
                                        transition-colors duration-200 
                                        ${ isDragging ? 'border-[#ccc26c] bg-[#fdebd4]' : 'border-dashed border-gray-400'}
                                        hover:border-[#ccc26c] hover:bg-[#fdebd4]
                                    `}
                                    onDragEnter={(e) => {
                                    e.preventDefault();
                                    e.stopPropagation();
                                    setIsDragging(true)
                                }}
                                onDragLeave={(e) => {
                                    e.preventDefault();
                                    e.stopPropagation();

                                    const rect = e.currentTarget.getBoundingClientRect();
                                    const {clientX, clientY } = e;

                                    const isOut = (
                                        clientX < rect.left ||
                                        clientX > rect.right ||
                                        clientY < rect.top ||
                                        clientY > rect.bottom
                                    );

                                    if (isOut) {
                                        setIsDragging(false)
                                    }                                  
                                }}
                                onDragOver={(e) => e.preventDefault()}
                                onDrop={(e) => {
                                    e.preventDefault();
                                    e.stopPropagation();
                                    setIsDragging(false);

                                    const files = Array.from(e.dataTransfer.files);
                                    if (files.length > 0) {
                                        const fakeEvent = { target: { files } };
                                        handleImageUpload(fakeEvent);
                                    }
                                }}
                                >
                                <div 
                                    className="flex flex-col items-center"
                                    onDragEnter={(e) => {
                                        e.preventDefault();
                                        e.stopPropagation();
                                    }}
                                    onDragOver={(e) => {
                                        e.preventDefault();
                                        e.stopPropagation();
                                    }}
                                >
                                    <svg className="w-10 h-10 text-[#D0AC88] mb-2" fill="none" stroke="currentColor" strokeWidth="1.5" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" d="M3 15.75V15a4.5 4.5 0 014.5-4.5h9A4.5 4.5 0 0121 15v.75m-9-4.5V21m0-9l-3 3m3-3l3 3" />
                                    </svg>
                                    { imageSrc 
                                        ? <span className="text-sm text-center">이미지가 업로드되었습니다 <br /> 사이즈를 조정해보세요</span>
                                        : <span className="text-sm text-center">
                                            여기를 클릭하거나 <br /> 이미지를 드래그해서 올려주세요 <br />
                                            <span className="text-xs text-gray-500">(JPG, PNG 파일만 가능)</span>
                                        </span>
                                    }
                                </div>
                            </label>
                        </div>
                    </div>
                    
                    {/* <hr className='border-[1px] border-gray-200 opacity-80' /> */}

                    {/* 사이즈 입력 */}
                    <div className="flex flex-col">
                        <label className="text-sm font-semibold mt-2">사이즈 조정</label>
                        <div className="flex gap-3 items-end mt-2">
                            <div className="flex flex-col w-full">
                                <span className="text-sm text-gray-500 mb-1">가로 (cm)</span>
                                <input
                                    type="number"
                                    value={widthInput}
                                    onChange={(e) => setWidthInput(e.target.value)}
                                    onKeyDown={(e) => {
                                        if (e.key === "Enter") {
                                        e.preventDefault();

                                        const v = parseFloat(widthInput);
                                        if (isNaN(v)) {
                                            setWidthInput(String(Math.floor(width)));
                                            return;
                                        }

                                        handleWidthChange({ target: { value: v } });
                                        e.currentTarget.blur();
                                        }
                                    }}
                                    onBlur={() => {
                                        const v = parseFloat(widthInput);
                                        if (isNaN(v)) {
                                        setWidthInput(String(Math.floor(width)));
                                        return;
                                        }
                                        handleWidthChange({ target: { value: v } });
                                    }}
                                    onWheel={(e) => e.preventDefault()}
                                    className="w-full border border-gray-300 rounded-md px-3 py-2 text-base focus:outline-none focus:ring-2 focus:ring-[#D0AC88]"
                                />
                            </div>
                            
                            <span className="text-xl font-semibold text-gray-700">x</span>

                            <div className="flex flex-col w-full">
                                <span className="text-sm text-gray-500 mb-1">세로 (cm) </span>
                                <input
                                    type="number" 
                                    value={Math.floor(height)}
                                    readOnly
                                    className="w-full border border-gray-300 rounded px-3 py-2 text-base bg-gray-100 cursor-not-allowed"
                                />
                            </div>
                        </div>
                        
                        <div className="mt-[4px] flex justify-between">
                            <input
                                type="range"
                                min={MIN_WIDTH}
                                max={actualMaxWidth}
                                step="0.1"
                                value={width}
                                onChange={(e) => {
                                    const value = parseFloat(e.target.value);
                                    if (!isNaN(value)) handleWidthChange(e);
                                }}
                                className="mt-[2px] md:w-[44%] w-[47%] accent-[#D0AC88]"
                            />
                            <span className=" text-xs text-right text-gray-600">
                                    (약 { Math.floor(width / 2.54) } x { Math.floor(height / 2.54) } inch)
                            </span>
                        </div>
                        <span className="mt-1 text-[12.5px] text-gray-500">바를 움직여 사이즈를 조절하거나, 원하는 사이즈를 <br/> 직접 입력해 주세요.</span>
                        
                        {/* 결제 목록 */}
                        {selectedItem && (
                            <div className='max-h-[300px] overflow-y-scroll my-3 space-y-2'>
                                {customItems.map((item, idx) => (
                                    <div 
                                        key={item.id} 
                                        onClick={() => setSelectedItemId(item.id)} 
                                        className={`relative flex items-center gap-3 border rounded-2xl p-3 shadow-sm cursor-pointer bg-white transition
                                            ${selectedItemId === item.id ? 'border-[#D0AC88] bg-[#fffaf3]' : 'hover:bg-[#fdf4ea]'}`}>
                                        {/* 썸네일 */}
                                        <img 
                                            src={item.imageSrc}
                                            alt={`미리보기 ${idx + 1}`}
                                            className='w-16 h-16 object-cover object-center rounded-xl border bg-white'
                                        />

                                        {/* 우측 영역 */}
                                        <div className='flex-1 min-w-0'>
                                            <div className="flex items-start justify-between gap-2">
                                                <div className="min-w-0">
                                                    <p className='text-sm font-semibold text-gray-800 truncate'>
                                                        {Math.floor(item.width)}cm x {Math.floor(item.height)}cm
                                                    </p>
                                                    <p>
                                                        {item.price.toLocaleString()}원
                                                    </p>
                                                </div>

                                                {/* 삭제 버튼 */}
                                                <button
                                                    className='w-7 h-7 shrink-0 text-red-500 hover:text-white hover:bg-red-500 border border-red-300 rounded-full flex items-center justify-center transition'
                                                    onClick={(e) => {
                                                        e.stopPropagation();

                                                        const deleteId = item.id;

                                                        setCustomItems(prev => {
                                                            const newItems = prev.filter ((it) => it.id !== deleteId);

                                                            if (selectedItemId === deleteId) {
                                                                if (newItems.length > 0) {
                                                                    setSelectedItemId(newItems[0].id);
                                                                    setImageSrc(newItems[0].imageSrc);
                                                                } else {
                                                                    setSelectedItemId(null);
                                                                    setImageSrc(null);
                                                                }
                                                            }

                                                            return newItems;
                                                        });
                                                    }}
                                                    aria-label="삭제"
                                                    title="삭제"
                                                >
                                                    ×
                                                </button>
                                            </div>

                                            {/* 보정상태와 버튼 */}
                                            <div className="mt-2 flex items-center justify-between gap-2">
                                                {/* 보정 상태 뱃지 */}
                                                <span 
                                                    className={`text-[11px] px-2 py-[2px] rounded-full border whitespace-nowrap
                                                        ${item.retouch?.enabled
                                                            ? 'bg-[#fff3e6] border-[#D0AC88] text-[#a67a3e]'
                                                            : 'bg-gray-100 border-gray-200 text-gray-500'
                                                        }
                                                    `}
                                                >
                                                    {item.retouch?.enabled ? '보정 요청 있음' : '보정 없음'}
                                                </span>

                                                {/* 보정 요청 버튼 */}
                                                <button
                                                    className="px-2 py-[2px] text-[11px] rounded-xl border border-[#D0AC88] text-[#a67a3e] hover:bg-[#fff3e6] transition whitespace-nowrap"
                                                    onClick={(e) => {
                                                        e.stopPropagation();
                                                        openRetouchModal(item);
                                                    }}
                                                >
                                                    보정 수정
                                                </button>
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}

                        <hr className='mt-3 border-[1px] border-gray-200 opacity-80' />
                        <div className="flex flex-col items-end mt-3">
                            <span className="text-sm text-gray-600">
                                배송비: {totalPriceWithoutShipping <= 50000 ? SHIPPING_FEE.toLocaleString() : 0}원 
                            </span>
                            
                            {/* <span className="text-sm text-gray-600">
                                상품가: {totalPriceWithoutShipping.toLocaleString()}원
                            </span> */}
                            <span className="text-base font-semibold text-gray-700">
                                총 결제금액 : <span className=" text-[#D0AC88]">{totalPriceWithoutShipping.toLocaleString()}원</span>
                            </span>
                        </div>
                        <div className="text-right">
                            {totalPriceWithoutShipping < FREE_SHIPPING_THRESHOLD && (
                                <span className='text-[11.5px] text-green-600 mt-1'>(5만원 이상 구매 시 무료배송 적용)</span>
                            )}
                            <div className="text-[11px] text-gray-500">
                                {/* ※ 이미지를 기준으로 비율이 자동 조정됩니다<br /> */}
                                <span>※ 제작 과정에서 ±1cm 오차가 발생할 수 있습니다</span>
                            </div>
                        </div>
                    </div>

                    {/* 버튼 */}
                    <div className='flex flex-col w-full gap-2 mt-2'>
                        <div>
                            <button 
                                className='flex items-center justify-center w-full h-[50px] bg-[#D0AC88] text-white'
                                onClick={(e) => handleBuyNow()}>
                                바로구매
                            </button>
                        </div>
                        {/* 
                        <div className="flex gap-2">
                            <button 
                                className='flex items-center justify-center w-[144px] h-[66px] bg-white text-[#D0AC88] border-[#D0AC88] border-[1px]' 
                                onClick="">장바구니</button>
                            <button 
                                className='flex items-center justify-center w-[144px] h-[66px] bg-white text-[#D0AC88] border-[#D0AC88] border-[1px]'
                                onClick="">관심상품</button>
                        </div> 
                        */}

                        {/* 네이버 / 카카오 결제 */}
                        {/* <div className='flex flex-col gap-2 font-semibold'>
                            <div className="flex items-center justify-center h-[50px] border-[1px] border-[#1ecd52] gap-2"><img src={icon_naver} className="h-[24px]" /><button>결제하기</button></div>
                            <div className="flex items-center justify-center h-[50px] border-[1px] border-[#ffde02] gap-2"><img src={icon_kakao} className="h-[24px]" /><button>결제하기</button></div>
                        </div> */}
                    </div>
                </div>
            </div>

            {/* 보정 비교 */}
            <div>
                <div className="text-center mt-20 mb-3">
                    <h2 className='
                        md:text-[30px] sm:text-[clamp(24px,3.911vw,30px)] text-[18px]
                        font-bold text-gray-800'>보정 서비스 미리보기</h2>
                </div>
                <div>
                    {/* 보정 비교 */}
                    <div className='
                        xl:w-[550px] lg:w-[clamp(380px,33.62vw,430px)] md:w-[clamp(250px,32.257vw,330px)] sm:w-[clamp(230px,32.59vw,250px)] w-[230px]
                        aspect-[450/670] mx-auto bg-gray-200 bg-opacity-60 rounded-lg 
                        xl:p-6 lg:p-5 md:p-4 p-2
                        shadow-xl'>
                        <h3 className='
                            lg:text-[18px] md:text-[clamp(16px,1.759vw,18px)] text-[clamp(13px,2.086vw,16px)]
                            font-semibold text-center mb-4 text-[a67a3e]'>{current.title}</h3>
                        
                        <div className='relative w-full flex justify-center items-center'>
                            <img src={
                                showAfter ? current.after : current.before}
                                alt="보정 비교" 
                                className='rounded-xl transition duration-500 shadow-lg max-w-full' 
                            />
                            <div className='absolute bottom-4 flex gap-3 px-4 py-2'> {/* transform -translate-x-1/2 너비의 절반만큼 왼쪽으로 간다 */}
                                <button
                                    className={`
                                        lg:text-[14px] md:text-[clamp(12px,1.368vw,14px)] text-[clamp(8px,1.564vw,12px)]
                                        px-4 py-1 rounded-full font-semibold transition ${
                                        !showAfter ? 'bg-[#cfab88] text-white' : 'bg-gray-200 text-gray-700'}`}
                                    onClick = {() => setShowAfter(false)}
                                    onMouseEnter={() => setShowAfter(false)}
                                >
                                    원본사진
                                </button>
                                <button
                                    className={`
                                        lg:text-[14px] md:text-[clamp(12px,1.368vw,14px)] text-[clamp(8px,1.564vw,12px)]
                                        px-4 py-1 rounded-full font-semibold transition ${
                                        showAfter ? 'bg-[#cfab88] text-white' : 'bg-gray-200 text-gray-700'
                                    }`}
                                    onClick = {() => setShowAfter(true)}
                                    onMouseEnter={() => setShowAfter(true)}
                                >
                                    보정사진
                                </button>
                            </div>
                        </div>

                        {/* 페이지 네이션 */}
                        <div className="mt-6 flex justify-center gap-2">
                            {beforeAfterData.map((_, idx) => (
                                <button
                                    key={idx}
                                    className={`
                                        xl:w-5 lg:w-[clamp(17px,1.5636vw,20px)] w-[clamp(14px,1.661vw,17px)]
                                        xl:h-5 lg:h-[clamp(17px,1.5636vw,20px)] h-[clamp(14px,1.661vw,17px)]
                                        rounded-full transition ${
                                        activeIndex === idx ? 'bg-[#cfab88]' : 'bg-gray-300'
                                    }`}
                                    onClick={() => {
                                        setActiveIndex(idx);
                                        setShowAfter(false);
                                    }}
                                />
                            ))}
                        </div>
                        <span
                        className="
                            flex justify-center items-center
                            mt-4
                            md:text-sm text-[clamp(11px,1.8252vw,14px)]
                            font-medium tracking-wide
                            text-gray-600
                            px-4
                        "
                        >
                        원본사진과 보정사진을 <span className="text-[#a67a3e] ml-1 font-semibold">클릭</span>해 비교해보세요!
                    </span>
                    </div>
                </div>
            </div>
            
            {/* 보정 서비스 안내 */}
            <div className='
                md:mx-auto mx-4
                max-w-3xl bg-white border border-[#D0AC88] rounded-2xl shadow-md 
                md:p-6 p-[clamp(10px,3.128vw,24px)]
                mt-14 text-[15px] text-gray-700 leading-relaxed
                '>
                <div className='flex items-center mb-4'>
                    <div className='
                        w-6 h-6 flex items-center justify-center rounded-full bg-[#D0AC88] text-white text-sm font-bold mr-2'>i</div>
                    <h3 
                        className="
                            md:text-lg text-base
                            font-bold text-gray-800">보정 서비스 안내</h3>
                </div>
                <hr className='mb-4 border-[#f1e2d1]' />
                <ul 
                    className='
                        md:text-base text-[clamp(11px,2.085vw,16px)]
                        space-y-3 pl-4 list-disc
                '>
                    {/* <li>예시 외 <span className='font-semibold text-gray-900'>난이도가 높은 보정 또는 작업 시간이 많이 소요되는 경우</span> 시간당 <span className='text-[#D0AC88] font-semibold'>5만원</span>입니다.</li> */}
                    <li><span>원고 상태가 너무 흐릿하면 해상도를 높이는데 한계가 있으니 양해 부탁드립니다</span></li>
                    <li><span>난이도가 높은 보정작업은 시간이 소요되며 시간당 5만원의 비용이 발생합니다</span></li>
                    <li><span>보정에 관한 궁금한 사항 있으시면 전화상담 바랍니다 (02-389-5879)</span></li>                    
                </ul>
            </div>

            {showGuestChoice && (
                <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50 z-50">
                    <div className="
                        bg-white p-8 rounded-lg shadow-lg 
                        w-[90%] max-w-md sm:max-w-lg text-center
                    ">
                    <p className="
                        md:text-lg text-[clamp(14px,2.3455vw,18px)]
                        mb-6 font-bold">구매 방식을 선택해주세요</p>

                    <button
                        onClick={() => navigate('/userLogin')}
                        className="
                            md:text-base text-[clamp(12px,2.085vw,16px)]
                            w-full py-3 mb-3 bg-[#D0AC88] text-white rounded-md"
                    >
                        로그인 후 구매하기
                    </button>

                    <button
                        onClick={() => {
                        setShowGuestChoice(false);
                        const orderData = customItems.map(item => {
                            const enabledVal = item.retouch?.enabled ? 1 : 0;
                            const typesStr = item.retouch?.types?.join(', ') ?? '';
                            const noteStr = item.retouch?.note ?? '';

                            return {
                            pid: '-3',
                            title: '맞춤 액자',
                            price: item.price, // 배송비 제외
                            thumbnail: item.imageSrc,
                            size: `${item.width}` + ' X ' + `${item.height}`,
                            category:'customFrames',
                            quantity:'1',

                            retouchEnabled: enabledVal,
                            retouchTypes: enabledVal ? typesStr : null,
                            retouchNote: enabledVal ? noteStr : null,
                            };
                        });

                        navigate('/orderForm', { state : { orderItems: orderData, isGuest: true } });
                        }}
                        className="
                            md:text-base text-[clamp(12px,2.085vw,16px)]
                            w-full py-3 bg-gray-200 rounded-md "
                    >
                        비회원으로 구매하기
                    </button>

                    <button
                        onClick={() => setShowGuestChoice(false)}
                        className="
                            md:text-sm text-[clamp(11px,1.8252vw,14px)]
                            mt-4 text-gray-500 hover:underline"
                    >
                        취소
                    </button>
                    </div>
                </div>
            )}

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
                                            note : e.target.checked ? d.note : '',
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
                                                        return {...d, types: next};
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

export default Main_CustomFrames;