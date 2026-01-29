import { useEffect, useState, useContext, useRef } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { MemberContext } from '../../context/MemberContext';
import icon_x from '../../assets/button/icon_x.png';
import ProductDetailTabs from '../ProductDetailTabs/ProductDetailTabs';
import { toast } from 'react-toastify';
import bg from '../../assets/CustomFrames/p.png';

const None_Custom_Detail = () => {
    const API = process.env.REACT_APP_API_BASE;
    const navigate = useNavigate();
    const location = useLocation();
    const {member, setMember} = useContext(MemberContext);
    const queryParams = new URLSearchParams(location.search);
    const [frameType, setFrameType] = useState('wall'); // 액자 타입
    const [selectedSize, setSelectedSize] = useState('');
    const category = queryParams.get("category");
    const pid = queryParams.get("pid");
    const [showGuestChoice, setShowGuestChoice] = useState(false); // 구매시 비회원 구매 상태

    const [product, setProduct] = useState(null);

    const categoryMap = {
        masterPiece : "명화",
        fengShui : "풍수",
        authorCollection: "작가 컬렉션",
        photoIllustration: "사진/일러스트",
    };

    // 주문 항목 구현
    const [selectedItems, setSelectedItems] = useState([]);

    // 상품 상단 이미지 가져오기
    const [topImages, setTopImages] = useState([]);
    const [mainImage, setMainImage] = useState(null);

    // 상품 커스터마이징 상태 (명화 이미지를 여기에 넣어서 활용)
    const [customItems, setCustomItems] = useState([]);
    const [selectedItemId, setSelectedItemId] = useState(null);
    const [selectedItem, setSelectedItem] = useState(null);
    const [imageSrc, setImageSrc] = useState(null);
    const [maxWidth, setMaxWidth] = useState(200.7); // 초기값: 가로 최대
    const [maxHeight, setMaxHeight] = useState(101.6); // 초기값: 세로 최대

    // 사이즈
    const [width, setWidth] = useState('35.6');
    const [height, setHeight] = useState(27.9);

    const MIN_WIDTH = 35.6;

    const [aspectRatio, setAspectRatio] = useState(null);
    const [toastCooldown, setToastCooldown] = useState(false);

    const showToastOnce = (message) => {
        if (!toastCooldown) {
            toast.error(message);
            setToastCooldown(true);
            setTimeout(() => setToastCooldown(false), 1000);
        }
    };

    // 입력 완료 후 반영
    const [widthInput, setWidthInput] = useState(String(Math.floor(width)));

    useEffect(() => {
        setWidthInput(String(Math.floor(width)));
    }, [width]);

    const handleWidthChange = (e) => {
        // if (!selectedItem) return;

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
                showToastOnce(`이미지 비율로 계산된 높이가 최대 높이 ${Math.floor(maxHeight)}cm를 초과하여 자동 조정됩니다.`);
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

    useEffect(() => {
        if (pid) {
            axios.get(`${API}/product/detail?pid=${pid}`)
                .then(res => setProduct(res.data))
                .catch(err => console.error("상품 상세 조회 실패", err));

            axios.get(`${API}/product/top-images?pid=${pid}`)
                .then(res => {
                    setTopImages(res.data);
                    if (res.data.length > 0) {
                        setMainImage(res.data[0]);
                        
                        const img = new Image();
                        img.src = res.data[0];
                        img.onload = () => {
                            const ratio = img.width / img.height;
                            setAspectRatio(ratio);

                            const calcHeight = Math.floor(width / ratio);
                            setHeight(calcHeight);

                            // 불러온 명화를 customItems에 추가 (업로드 대신 초기화)
                            if (ratio >= 1) {
                                setMaxWidth(200.7);
                                setMaxHeight(101.6);
                            } else {
                                setMaxWidth(101.6);
                                setMaxHeight(200.7);
                            }

                            const area = Math.floor(width * calcHeight);
                            const price = calculateCumulativePrice(area);

                            setCustomItems([{
                            id: "main-painting",
                            imageSrc: res.data[0],
                            aspectRatio: ratio,
                            width,
                            height,
                            maxWidth,
                            maxHeight,
                            price
                        }]);
                        setSelectedItemId("main-painting");
                        } 
                    }
                })
                .catch(err => console.error("이미지 목록 조회 실패", err));
        }
    }, [pid]);

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

    if (!product) return <div className="p-10">상품 정보를 불러오는 중입니다...</div>;

    const productInfo = [
        { label: "작가", value: `${product.author}` },
        { label: "배송방법", value: "택배" },
        { label: "배송비", value: "3,000원 (50,000원 이상 구매 시 무료)" },
    ];

    const sizePriceMap = {
        wall: {
            "11 X 14": 45000,
            "12 X 17": 52000,
            "16 X 16": 60000,
            "16 X 20": 68000,
            "16 X 24": 72000,
            "20 X 20": 76000,
            "20 X 24": 90000,
            "24 X 24": 110000,
            "20 X 30": 130000,
            "24 X 32": 160000,
            "24 X 40": 185000,
            "30 X 40": 210000,
            "28 X 47": 240000,
            "40 X 40": 280000,
            "40 X 47": 320000,
            "40 X 71": 450000,
            "40 X 79": 520000
        },
        table: {
            "5 X 7": 25000,
            "7 X 7": 30000,
            "6 X 8": 30000,
            "7 X 8": 32000,
            "7 X 10": 34000,
            "8 X 10": 35000,
        },
        clock: {
            "14 X 14" : 50000
        }
    };

    // 액자 타입 선택 시 실행
    const handleFrameTypeClick = (type) => {
        setFrameType(type);
        setSelectedSize("");
    };

    const handleSizeSelect = (e) => {
        const size = e.target.value;

        if(!frameType) {
            toast.error('액자 타입을 선택해 주세요.');
            return;
        }

        setSelectedSize(size);
        const price = sizePriceMap[frameType][size];

        if (selectedItems.find(item => item.size === size && item.frameType === frameType)) {
            toast.error("이미 선택된 사이즈입니다.");
            return;
        }

        setSelectedItems(prev => [...prev, { size, frameType, quantity: 1, price }]);
    };

    const updateQuantity = (size, delta) => {
        setSelectedItems(prev => 
            prev.map(item =>
                item.size === size
                    ? { ...item, quantity: Math.max(1, item.quantity + delta) }
                    : item
            )
        );
    };

    const removeItem = (size) => {
        setSelectedItems(prev => prev.filter(item => item.size !== size));
    };

    // const totalPrice = selectedItems.reduce((sum, item) => sum + item.quantity * item.price, 0);


    // 위시리스트
    const handleAddToWishlist = () => {
        if (!member || !member.id) {
            toast.warn("로그인 후 이용해주세요.");
            return;
        }

        axios.post(`${API}/wishlist/add-if-not-exists`, {
            id : member.id,
            pid: parseInt(pid),
            category : category,
        })
        .then(() => {
            if (window.confirm('관심상품에 추가되었습니다. 목록을 보러 가시겠습니까?')) {
                navigate('/wishList');
            }
        })
        .catch(err=> {
            if (err.response?.status === 409) {
                toast.info("이미 관심상품에 등록된 상품입니다.");
                return;
            }
            console.error("추가 실패", err);
            toast.error("관심상품 추가에 실패했습니다.");
        });
    };

    // 장바구니 담기
    const handleAddToCart = async () => {
        if (!member?.id) {
            toast.warn("로그인 후 이용해주세요.");
            return;
        }

        if (customItems.length === 0) {
            toast.error("사이즈를 먼저 조정해 주세요.");
            return;
        }

        const payload = customItems.map(item => ({
            id: member.id,
            pid: parseInt(pid),
            title: product.title,
            price: item.price,
            category: category + '_' + frameType,
            thumbnail: item.imageSrc,
            size: `${width} x ${height} (${Math.floor(item.width)}cm x ${Math.floor(item.height)} cm)`,
            quantity: 1,
        }));

        try {
            await axios.post(`${API}/cart/insert`, payload);
                if (window.confirm("장바구니에 추가되었습니다. 장바구니로 이동할까요?")) {
                    navigate('/cart');        
                }
        } catch (err) {
            console.error("장바구니 추가 실패", err);
            toast.error("장바구니 추가에 실패했습니다.");
        }
    };

    // 바로 구매하기 (Buy It Now)
    const handleBuyNow = () => {
        if (!member?.id) {
            setShowGuestChoice(true);
            return;
        }

        const orderData = customItems.map(item => ({
            id: member.id,
            pid: parseInt(pid),
            title: product.title,
            price: item.price,
            thumbnail: item.imageSrc,
            size: `${width} x ${height} (${Math.floor(item.width)}cm x ${Math.floor(item.height)} cm)`,
            category: category + '_' + frameType,
            quantity: 1
        }));
        navigate('/orderForm', { state: { orderItems: orderData } });
    }

    return (
        <div className="flex-col md:mt-10 mt-5">
            {/* 가이드 */}
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
                        src={mainImage}
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
                    <div className="flex flex-col mb-2">

                        {/* 내 의견 */}
                        <div className="flex justify-end gap-1">
                            <button 
                                type="button"
                                className="text-xs bg-gray-100 text-gray-600 border border-gray-500 px-2 py-1 rounded-full w-fit hover:bg-gray-200"
                                onClick={() => {
                                    // 현재 상품 작가로 이동 (작가 작품 목록)
                                    if (category === "masterPiece") {
                                        navigate(`/main_Items?type=${category}&author=${encodeURIComponent(product.author)}`);
                                    } else {
                                        navigate(`/main_Items?type=${category}&label=${encodeURIComponent(product.author)}`);
                                    }
                                    
                                }}
                                >
                                다른 작품보기
                            </button>
                            {category === "masterPiece" && (
                                <button 
                                    type="button"
                                    className="text-xs bg-gray-100 text-gray-600 border border-gray-500 px-2 py-1 rounded-full w-fit hover:bg-gray-200"
                                    onClick={() => {
                                        // 작가 목록(기본 화면)으로 이동
                                        navigate(`/main_Items?type=${category}`);
                                    }}
                                    >
                                    다른 작가보기
                                </button>
                            )}
                        </div>

                        <span className="mt-3 text-base font-bold">{product.title}</span>
                        <div className=" text-sm text-gray-500 mt-1"> {product.author}</div>
                        {/* 내 의견 */}

                        {/* 고모부 의견 */}
                        {/* <div className="flex justify-between"><span className="text-[19px] font-bold">{product.title}</span> <span className="h-6 text-xs bg-gray-100 text-gray-600 px-2 py-1 rounded-full w-fit">다른 그림보기</span></div>
                        <div className="flex justify-between text-sm text-gray-500 mt-1"> {product.author} <span className="text-xs bg-gray-100 text-gray-600 px-2 py-1 rounded-full w-fit">다른 작가보기</span></div> */}
                        {/* 고모부 의견 */}
                    </div>
                        
                    {/* <hr className='border-[1px] border-gray-200 opacity-80' /> */}

                    {/* 사이즈 입력 */}
                    <div className="flex flex-col">
                        <label className="text-base font-semibold mt-2">사이즈 조정</label>
                        {/* <p className="text-sm text-gray-500 mt-2">원하는 사이즈(cm)를 입력해 주세요</p> */}
                        <div className="flex gap-3 items-end mt-[2px]">
                            <div className="flex flex-col w-full">
                                <span className="text-sm text-gray-500 mb-1">가로 (cm)</span>
                                <input 
                                    type="number"
                                    value={widthInput}
                                    onChange={(e) => setWidthInput(e.target.value)}

                                    onKeyDown={(e) => {
                                        if (e.key === 'Enter') {
                                            e.preventDefault();

                                            const v = parseFloat(widthInput);
                                            if (isNaN(v)) {
                                                setWidthInput(String(Math.floor(width)));
                                                return;
                                            }

                                            handleWidthChange({ target: {value: v } });
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
                                    className="w-full border border-gray-500 rounded-md px-3 py-2 text-base focus:outline-none focus:ring-2 focus:ring-[#D0AC88]"
                                />
                            </div>
                            
                            <span className="text-xl font-semibold text-gray-700">x</span>

                            <div className="flex flex-col w-full">
                                <span className="text-sm text-gray-500 mb-1">세로 (cm) </span>
                                <input
                                    type="number" 
                                    value={Math.floor(height)}
                                    readOnly
                                    className="w-full border border-gray-500 rounded px-3 py-2 text-base bg-gray-100 cursor-not-allowed"
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
                                    <div key={item.id} 
                                        onClick={() => setSelectedItemId(item.id)} 
                                        className={`flex items-center gap-3 border rounded-xl p-[10px] shadow-sm cursor-pointer bg-white transition
                                            ${selectedItemId === item.id ? 'border-[#D0AC88] bg-[#fffaf3]' : 'hover:bg-[#fdf4ea]'}`}>
                                        <img 
                                            src={item.imageSrc}
                                            alt={`미리보기 ${idx + 1}`}
                                            className='w-16 h-16 object-cover object-center rounded-md border'
                                        />
                                        <div className='flex-1 text-base text-end'>
                                            <p className='text-sm font-semibold text-gray-800'>{Math.floor(item.width)}cm x {Math.floor(item.height)}cm</p>
                                            <p>{item.price.toLocaleString()}원</p>
                                        </div>
                                        {/* 삭제 버튼 */}
                                        <button
                                            className='w-6 h-6 text-red-500 hover:text-white hover:bg-red-500 border border-red-300 rounded-full flex items-center justify-center transition'
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
                                                })
                                            }}
                                        >
                                            ×
                                        </button>
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
                            <span className="mt-2 text-base font-semibold text-gray-700">
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
                            <div className="flex flex-row">
                            <button 
                                className='flex items-center justify-center w-1/2 xl:h-[66px] lg:h-[clamp(60px,5.16vw,66px)] md:h-[52px] h-[50px] bg-white text-[#D0AC88] border-[#D0AC88] border-[1px]' 
                                onClick={handleAddToCart}>장바구니</button>
                            <button 
                                className='flex items-center justify-center w-1/2 xl:h-[66px] lg:h-[clamp(60px,5.16vw,66px)] md:h-[52px] h-[50px] bg-white text-[#D0AC88] border-[#D0AC88] border-[1px]'
                                onClick={handleAddToWishlist}>관심상품</button>
                        </div>
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
            <div className="flex justify-center mt-20 mb-[200px]">
                {product && <ProductDetailTabs product={product} />}
            </div>

            {/* 구매 버튼 클릭 시 선택지 */}
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

                    const orderData = selectedItems.map(item => ({
                        pid: parseInt(pid),
                        title: product.title,
                        price: item.price,
                        thumbnail: topImages[0],
                        size: item.size,
                        category: category + '_' + frameType,
                        quantity: item.quantity
                    }));

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
        </div>
    );
}

export default None_Custom_Detail;