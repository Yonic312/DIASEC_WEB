import { useEffect, useState } from 'react';
import { useNavigate } from "react-router-dom";
import axios from 'axios';
import { getMinFrameConfigByRatio } from '../../utils/customFramePrice';

// 배너
import customFrame from '../../assets/banner/customFrame.png';
import aboutBanner from '../../assets/images/introduce.png';

// 보정
import faceDot_1 from '../../assets/custom_Frames/faceDot_1.jpg';
import faceDot_2 from '../../assets/custom_Frames/faceDot_2.jpg';
import faceENM_1 from '../../assets/custom_Frames/faceENM_1.jpg';
import faceENM_2 from '../../assets/custom_Frames/faceENM_2.jpg';
import portrait_1 from '../../assets/custom_Frames/portrait_1.jpg';
import portrait_2 from '../../assets/custom_Frames/portrait_2.jpg';
import backlight_1 from '../../assets/custom_Frames/backlight_1.jpg';
import backlight_2 from '../../assets/custom_Frames/backlight_2.jpg';
import bg_1 from '../../assets/custom_Frames/bg_1.jpg';
import bg_2 from '../../assets/custom_Frames/bg_2.jpg';
import blur_1 from '../../assets/custom_Frames/blur_1.jpg';
import blur_2 from '../../assets/custom_Frames/blur_2.jpg';


// 공통 axios get helper
const getData = async (API, url,config = {}) => {
    const res = await axios.get(`${API}${url}`, config);
    return res.data;
}

// 인기작품, 신규작품 포함
const Main = () => {
    const API = process.env.REACT_APP_API_BASE;
    const navigate = useNavigate();
    const [bestCategory, setBestCategory] = useState('masterPiece'); // 인기상품 선택된 카테고리
    const [newCategory, setNewCategory] = useState('masterPiece'); // 신규상품 선택된 카테고리
    const [best_Items, setBest_Items] = useState([]);
    const [new_Items, setNew_Items] = useState([]);
    const [categoryList, setCategoryList] = useState([]);
    const [bestPriceMap, setBestPriceMap] = useState({});
    const [newPriceMap, setNewPriceMap] = useState({});

    // 작가 카테고리는 빼기
    const filteredCategoryList = categoryList.filter(c => c.name !== 'authorCollection');
    const [reviewIndex, setReviewIndex] = useState(0); // 리뷰 슬라이드

    // 마우스 호버 상태 저장(img)
    const [bestHoveredPid, setBestHoveredPid] = useState(null);
    const [newHoveredPid, setNewHoveredPid] = useState(null);

    // [BEST 목록] 가져오기
    useEffect(() => {
        const controller = new AbortController();
        
        (async () => {
            try {
                const data = await getData(API, "/product/best", {
                    params: { category : bestCategory },
                    signal: controller.signal,
                });
                setBest_Items(data ?? []);
            } catch (err) {
                if (err?.name === "CanceledError") return;
                console.error("BEST 로딩 실패:", err);
                setBest_Items([]);
            }
        })();

        return () => controller.abort();
    }, [API, bestCategory]);

    // [New 목록] 가져오기
    useEffect(() => {
        const controller = new AbortController();
        
        (async () => {
            try {
                const data = await getData(API, "/product/new", {
                    params: { category : newCategory },
                    signal: controller.signal,
                });
                setNew_Items(data ?? []);
            } catch (err) {
                if (err?.name === "CanceledError") return;
                console.error("NEW 로딩 실패:", err);
                setNew_Items([]);
            }
        })();

        return () => controller.abort();
    }, [API, newCategory]);

    // 컬렉션 가져오기
    useEffect(() => {
        const controller = new AbortController();

        (async () => {
            try {
                const data = await getData(API, "/collections", { signal: controller.signal });
                setCategoryList(data ?? []);
            } catch (err) {
                if (err?.name === "CanceledError") return;
                console.error("카테고리 로딩 실패:", err);
                setCategoryList([]);
            }
        })();

        return () => controller.abort();
    }, [API]);

    // 이미지 실제 크기 읽는 함수
    const loadImageSize = (src) => {
        return new Promise((resolve, reject) => {
            if (!src) {
                reject(new Error("이미지 URL 없음"));
                return;
            }

            const img = new Image();
            img.onload = () => resolve({ width: img.width, height: img.height });
            img.onerror = reject;
            img.src = src;
        })
    }

    // 인기 상품 가격 계산
    useEffect(() => {
        let cancelled = false;

        const run = async () => {
            try {
                const entries = await Promise.all(
                    best_Items.map(async (item) => {
                        try {
                            const { width, height } = await loadImageSize(item.imageUrl);
                            const ratio = width / height;
                            const cfg = getMinFrameConfigByRatio(ratio);
                            return [item.pid, cfg.price];
                        } catch (e) {
                            console.error("인기작품 가격 map 생성 실패:", item.pid, e);
                            return [item.pid, null];
                        }
                    })
                );

                if (cancelled) return;
                setBestPriceMap(Object.fromEntries(entries));
            } catch (e) {
                console.error("인기작품 가격 map 생성 실패:", e);
                if (!cancelled) setBestPriceMap({});
            }
        };

        if (best_Items.length > 0) {
            run();
        } else {
            setBestPriceMap({});
        }

        return () => {
            cancelled = true;
        };
    }, [best_Items]);

    // 신규 상품 가격 계산
    useEffect(() => {
        let cancelled = false;

        const run = async () => {
            try {
                const entries = await Promise.all(
                    new_Items.map(async (item) => {
                        try {
                            const { width, height } = await loadImageSize(item.imageUrl);
                            const ratio = width / height;
                            const cfg = getMinFrameConfigByRatio(ratio);

                            console.log('신규 가격 계산', {
                                pid: item.pid,
                                title: item.title,
                                imageUrl: item.imageUrl,
                                naturalWidth: width,
                                naturalHeight: height,
                                ratio,
                                minWidth: cfg.width,
                                minHeight: cfg.height,
                                price: cfg.price,
                            });

                            return [item.pid, cfg.price];
                        } catch (e) {
                            console.error("신규작품 가격 map 생성 실패:", item.pid, e);
                            return [item.pid, null];
                        }
                    })
                );

                if (cancelled) return;
                setNewPriceMap(Object.fromEntries(entries));
            } catch (e) {
                console.error("신규작품 가격 map 생성 실패:", e);
                if (!cancelled) setNewPriceMap({});
            }
        };

        if (new_Items.length > 0) {
            run();
        } else {
            setNewPriceMap({});
        }

        return () => {
            cancelled = true;
        };
    }, [new_Items]);
    
    // [보정] 사진 befor / after
    const beforeAfterData = [
        { title: '피부 보정', before: faceDot_1, after: faceDot_2},
        { title: '얼굴 디테일 보정', before: faceENM_1, after: faceENM_2},
        { title: '얼굴 라인·피부 결 리터칭', before: portrait_1, after: portrait_2},
        { title: '이미지 역광 및 색감보정', before: backlight_1, after: backlight_2},
        { title: '불필요한 배경 삭제 및 변경', before: bg_1, after: bg_2},
        { title: '업스케일링 (흐릿한 사진 선명보정)', before: blur_1, after: blur_2},
    ]

    const [activeIndex, setActiveIndex] = useState(0);
    const [showAfter, setShowAfter] = useState(false);

    const current = beforeAfterData[activeIndex];


    // [리뷰] 상단 리뷰 슬라이더
    const [topThumbnailReviews, setTopThumbnailReviews] = useState([]);
    const [selectedReview, setSelectedReview] = useState(null);

    // 리뷰 상세 페이지 이미지 슬라이드
    const [selectedImageIndex, setSelectedImageIndex] = useState(0);

    // 최근 리뷰 가져오기
    useEffect(() => {
        const controller = new AbortController();

        (async () => {
            try {
                const data = await getData(API, "/review/recent", {
                    params: { limit: 20 },
                    withCredentials: true,
                    signal: controller.signal,    
                });
                setTopThumbnailReviews(data ?? []);
            } catch (err) {
                if (err?.name === "CanceledError") return;
                console.error("리뷰 로딩 실패:", err);
                setTopThumbnailReviews([]);
            }
        })();

        return () => controller.abort();
    }, [API]);

    // [이벤트] 
    const [events, setEvents] = useState([]);

    useEffect(() => {
        const controller = new AbortController();

        (async () => {
            try {
                const data = await getData(API, "/event", {
                    params: { status: "ongoing" },
                    signal: controller.signal,    
                });
                setEvents(data ?? []);
            } catch (err) {
                if (err?.name === "CanceledError") return;
                console.error("이벤트 로딩 실패:", err);
                setEvents([]);
            }
        })();

        return () => controller.abort();
    }, [API]);

    const [currentIndex, setCurrentIndex] = useState(0); // 이벤트 슬라이더


    return (
        <div className='
            flex flex-col w-full h-fit 
            xl:gap-36
            lg:gap-32
            md:gap-28
            gap-24'>
            {/* 인기작품 */}
            <div>
                <div className='
                    xl:mb-8 lg:mb-6 mb-2
                    text-center'>
                    <span className='
                        md:text-3xl text-[clamp(18px,3.911vw,30px)]
                        font-bold tracking-wide text-[#b29476] inline-block'
                    >
                        인기작품
                    </span>
                    {/* <p className='
                        md:text-base text-[clamp(11px,2.086vw,16px)]
                        xl:mt-3 lg:mt-2 mt-1 
                        text-gray-600'>
                        현재 가장 주목받는 인기작품을 만나보세요.
                    </p> */}
                </div>
                
                <div className='flex flex-wrap justify-center items-center 
                    xl:gap-4 lg:gap-3 md:gap-2 gap-[2px]'>
                    {filteredCategoryList.map((item) => {
                        const isActive = bestCategory === item.name;
                        return (
                            <div
                                className={`hover:text-[#a67a3e] cursor-pointer`}
                                key={item.id}
                                onClick={() => setBestCategory(item.name)}
                            >
                                <span className={`
                                    md:text-base text-[clamp(12px,2.2vw,16px)]
                                    relative px-4 py-1 rounded-full transition-all duration-300 font-medium
                                    ${isActive
                                        ? 'text-white bg-[#d0ac88]'
                                        : 'text-gray-700 hover:text-[#d0ac88] hover:bg-gray-100'}
                                    `}
                                >
                                    <span className='relative inline-block'>
                                        {item.displayName}
                                    </span>
                                </span>
                            </div>
                        )
                    })}
                </div>

                <div className="grid md:grid-cols-4 grid-cols-2 md:gap-y-10 md:gap-x-[0.1%] gap-x-[5%] mt-5 px-4">
                    {best_Items.map((item) => {
                        const isHoverd = bestHoveredPid === item.pid;

                        return(
                            <div
                                key={item.pid}
                                className="flex flex-col 
                                    lg:px-4 md:px-2 px-[2px]
                                    w-full/4
                                    h-auto md:mb-10 mb-2 cursor-pointer"
                                onMouseEnter={() => setBestHoveredPid(item.pid)}
                                onMouseLeave={() => setBestHoveredPid(null)}
                                onClick={() => navigate(`/none_custom_detail?pid=${item.pid}&category=${item.category}`)}
                            >   
                                {/* 기본 이미지 */}
                                <div className="
                                        flex justify-center items-center w-full aspect-[292/292] overflow-hidden 
                                        bg-white">
                                    <div className="w-full h-full">
                                        <img 
                                            className="h-[100%] w-[100%] object-contain"
                                            style={{ boxShadow: '8px 8px 10px rgba(0,0,0,0.2)'}} 
                                            src={isHoverd ? item.hoverImageUrl : item.imageUrl} 
                                            alt={item.title} 
                                        />
                                    </div>
                                </div>

                                <span className="
                                    lg:text-[18px] text-[clamp(16px,1.759vw,18px)]
                                    line-clamp-1
                                    font-bold mt-4">{item.title}</span>
                                <span className="
                                    lg:text-[14px] text-[clamp(13.5px,1.368vw,14px)]
                                    line-clamp-1
                                    font-bold text-[#CDC9C3]">
                                        {item.author}
                                </span>

                                <span className="
                                    text-[15px]
                                    font-semibold text-[#a67a3e] mt-[2px]">
                                    {bestPriceMap[item.pid] ? `${bestPriceMap[item.pid].toLocaleString()}원~` : ''}

                                </span>
                                <hr className="my-1" />
                            </div>
                        )
                    })}
                </div>
            </div>
           {/* /인기작품 */}

           {/* 신규작품 */}
            <div>
                <div className='
                    xl:mb-8 lg:mb-6 mb-2
                    text-center'>
                    <span className='
                        md:text-3xl text-[clamp(18px,3.911vw,30px)]
                        font-bold tracking-wide text-[#d0ac88] inline-block'>
                        신규작품
                    </span>
                    {/* <p className='
                        md:text-base text-[clamp(11px,2.086vw,16px)]
                        xl:mt-3 lg:mt-2 mt-1 
                        text-gray-600'>
                        새롭게 등록된 최신 작품들을 확인해보세요.
                    </p> */}
                </div>
                
                <div className='flex flex-wrap justify-center items-center 
                xl:gap-4 lg:gap-3 md:gap-2 gap-[2px]'>
                    {filteredCategoryList.map((item) => {
                        const isActive = newCategory === item.name;
                        return (
                            <div
                                className={`hover:text-[#a67a3e] cursor-pointer`}
                                key={item.id}
                                onClick={() => setNewCategory(item.name)}
                            >
                                <span className={`
                                    md:text-base text-[clamp(12px,2.2vw,16px)]
                                    relative px-4 py-1 rounded-full transition-all duration-300 font-medium
                                    ${isActive
                                        ? 'text-white bg-[#d0ac88]'
                                        : 'text-gray-700 hover:text-[#a67a3e] hover:bg-gray-100'}
                                    `}
                                >
                                    <span className='relative inline-block'>
                                        {item.displayName}
                                    </span>
                                </span>
                            </div>
                        )
                    })}
                </div>

                <div className="grid md:grid-cols-4 grid-cols-2 md:gap-y-10 md:gap-x-[0.1%] gap-x-[5%] mt-5 px-4">
                    {new_Items.map((item) => {
                        const isHoverd = newHoveredPid === item.pid;

                        return(
                            <div
                                key={item.pid}
                                className="flex flex-col 
                                    lg:px-4 md:px-2 px-[2px]
                                    w-full/4
                                    h-auto mb-10 cursor-pointer"
                                onMouseEnter={() => setNewHoveredPid(item.pid)}
                                onMouseLeave={() => setNewHoveredPid(null)}
                                onClick={() => navigate(`/none_custom_detail?pid=${item.pid}&category=${item.category}`)}
                            >   
                                {/* 기본 이미지 */}
                                <div className="
                                        flex justify-center items-center w-full aspect-[292/292] overflow-hidden
                                        bg-white">
                                    <div className="w-full h-full">
                                        <img 
                                            className="h-[100%] w-[100%] object-contain"
                                            style={{ boxShadow: '8px 8px 10px rgba(0,0,0,0.2)'}} 
                                            src={isHoverd ? item.hoverImageUrl : item.imageUrl} 
                                            alt={item.title} 
                                        />
                                    </div>
                                </div>

                                <span className="
                                    lg:text-[18px] text-[clamp(16px,1.759vw,18px)]
                                    line-clamp-1
                                    font-bold mt-4">{item.title}</span>

                                <span className="
                                    lg:text-[14px] text-[clamp(13.5px,1.368vw,14px)]
                                    font-bold text-[#CDC9C3]">
                                    {item.author}
                                </span>

                                <span className="
                                    text-[15px]
                                    font-semibold text-[#a67a3e] mt-[2px]">
                                    {newPriceMap[item.pid] ? `${newPriceMap[item.pid].toLocaleString()}원~` : ''}
                                </span>

                                <hr className="my-1" />
                            </div>
                        )
                    })}
                </div>
            </div>
            {/* /신규작품 */}
            
            {/*                     
                {false && (맞춤액자 배너 )}
                <div>
                    <img src={customFrame} className='w-full aspect-[1300/240] cursor-pointer' onClick={() => navigate('/customFrames')}/>
                </div>
                {false && (맞춤액자 배너 )}
            */}

            {/*             
                {false && (보정)}
                <div>
                    <div className="text-center mt-20 mb-3">
                        <h2 className='
                            md:text-[30px] sm:text-[clamp(24px,3.911vw,30px)] text-[18px]
                            font-bold text-gray-800'>보정 서비스 미리보기</h2>
                    </div>
                    <div>
                        {false && (보정 비교
                            xl:w-[550px] lg:w-[clamp(380px,33.62vw,430px)] md:w-[clamp(250px,32.257vw,330px)] sm:w-[clamp(230px,32.59vw,250px)] w-[250px]
                        )}
                        <div className='
                            max-w-[550px] w-[61%]
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
                                    className='rounded-xl transition duration-500 shadow-lg max-w-full aspect-[699/918]'
                                />
                                <div className='absolute bottom-4 flex gap-3 px-4 py-2'> {false &&  (transform -translate-x-1/2 너비의 절반만큼 왼쪽으로 간다)}
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

                            {false && (페이지 네이션)}
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
                                flex flex-col justify-center items-center
                                mt-4
                                md:text-sm text-[clamp(11px,1.8252vw,14px)]
                                font-medium tracking-wide
                                text-gray-600
                                px-4
                            "
                            >
                            원본사진과 보정사진을 <div><span className="text-[#a67a3e] ml-1 font-semibold">클릭</span>해 비교해보세요!</div>
                        </span>
                        </div>
                    </div>
                </div>
                {false && (보정)}
            */}

            {/* 이벤트 배너 */}
            {/* <div>
                <h2 className="
                    md:text-[30px] sm:text-[clamp(24px,3.911vw,30px)] text-[18px]
                    font-bold text-center mb-2">고객님을 위한 이벤트</h2>
                <p className="
                    md:text-base text-[clamp(11px,2.086vw,16px)]
                    text-center text-gray-600">
                    지금 참여할 수 있는 다양한 이벤트를 소개합니다!
                </p>
                <div className="overflow-hidden relative mt-3">
                    <div className='flex w-full py-1 transition-transform duration-500 ease-in-out'
                        style={{ transform: `translateX(-${currentIndex * 33.3333}%)` }}
                    >
                        {(events.length >= 4 ? events.concat(events) : events).map((event, i) => (
                            <div
                                key={`${event?.eventId}-${i}`} 
                                className="
                                    w-1/2 md:w-1/3 flex-shrink-0 px-[1.5%]">
                                <div
                                    key={`${event?.eventId}-${i}`}
                                    className='bg-white rounded-lg overflow-hidden shadow-md cursor-pointer hover:shadow-lg transition hover:scale-105'
                                    onClick={() => navigate(`/mainEventDetail/${event.eventId}`)}
                                >
                                    <div className="w-full aspect-[407/197] bg-gray-100 overflow-hidden">
                                        <img 
                                            src={event.thumbnailUrl}
                                            alt={event.title}
                                            className='w-full h-full object-cover'
                                        />
                                        
                                    </div>

                                    <div className='p-4'>
                                        <span className="text-sm">{event.period}</span>
                                        <h3 className='
                                            lg:text-[18px] text-[clamp(16px,1.759vw,18px)]
                                            font-bold text-gray-800 line-clamp-1 mb-1 '>
                                            {event.title}
                                        </h3>
                                        <p className="
                                            lg:text-[14px] text-[clamp(13.5px,1.368vw,14px)]
                                            text-gray-500 line-clamp-2"> {false && (clamp-2는 최대 2줄까지만 텍스트 출력)}
                                            {event.description || '이벤트에 참여하고 혜택을 받아보세요.'}
                                        </p>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>

                    {false && (좌우 버튼)}
                    {events.length > 3 && (
                        <div className="absolute top-1/3 -translate-y-1/2 w-full flex justify-between px-4 z-10">
                            <button
                                onClick={() =>
                                    setCurrentIndex((prev) => (prev - 1 + events.length) % events.length)
                                }
                                className="
                                xl:w-10 lg:w-9 md:w-7 w-5
                                xl:h-10 lg:h-9 md:h-7 h-5
                                xl:text-xl lg:text-[18px] md:text-[16px] text-[13px]
                                bg-white shadow-md rounded-full  
                                flex justify-center items-center font-bold hover:bg-gray-100"
                            >
                                🡐
                            </button>
                            <button
                                onClick={() =>
                                    setCurrentIndex((prev) => (prev + 1) % events.length)
                                }
                                className="
                                xl:w-10 lg:w-9 md:w-7 w-5
                                xl:h-10 lg:h-9 md:h-7 h-5
                                xl:text-xl lg:text-[18px] md:text-[16px] sm:text-[13px]
                                bg-white shadow-md rounded-full 
                                flex justify-center items-center font-bold hover:bg-gray-100"
                            >
                                🡒
                            </button>
                        </div>
                    )}
                </div>
            </div> */}
            {/* /이벤트 배너 */}

            {/* 🔶 리뷰 썸네일 슬라이더 영역 */}
            <div>
                <h2 className='
                    md:text-[30px] sm:text-[clamp(24px,3.911vw,30px)] text-[18px]
                    font-bold mb-2 text-center'>고객 리뷰</h2>
                <p className="
                    md:text-base text-[clamp(11px,2.086vw,16px)]
                    text-center text-gray-600 ">
                    실제 고객님들의 생생한 후기를 확인해보세요.
                </p>
                <div className="relative overflow-hidden mt-3">
                    <div className="flex transition-transform duration-500 ease-in-out"
                        style={{ transform: `translateX(-${reviewIndex * 33.33333}%)` }} // 4등분(25%)씩 이동
                    >
                        {topThumbnailReviews.map((review, i) => (
                            <div key={i} className="w-1/3 flex-shrink-0 px-3 cursor-pointer"
                                onClick={() => setSelectedReview(review)}
                            >
                                <img
                                    src={review.images?.[0]}
                                    alt="리뷰 이미지"
                                    className="w-full aspect-[300/240] object-cover"
                                />
                                <div className="p-3">
                                    <div className="
                                        md:text-base text-[clamp(11px,2.085vw,16px)]
                                        text-orange-400 mb-1">
                                        {'★'.repeat(review.rating)}{'☆'.repeat(5 - review.rating)}
                                    </div>
                                    <div className="
                                        md:text-lg text-[clamp(11px,2.3455vw,18px)]
                                        font-semibold truncate mb-0.5">
                                        {review.title}
                                    </div>
                                    <div className="
                                        md:text-base text-[clamp(11px,2.085vw,16px)]
                                        text-gray-500 truncate">
                                        {review.content}
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>

                    {topThumbnailReviews.length > 4 && (
                        <div className="absolute top-1/3 -translate-y-1/2 w-full flex justify-between px-2 z-10">
                            <button
                                onClick={() => {
                                        const visible = 4;
                                        const maxIndex = Math.max(0, topThumbnailReviews.length - visible);
                                        setReviewIndex((prev) => (prev === 0 ? maxIndex : prev -1 ));
                                    }
                                }
                                className="
                                xl:w-10 lg:w-9 md:w-7 w-5
                                xl:h-10 lg:h-9 md:h-7 h-5
                                text-[clamp(13px,1.538vw,20px)]
                                bg-white shadow-md rounded-full  
                                flex justify-center items-center font-bold hover:bg-gray-100"
                            >
                                🡐
                            </button>
                            <button
                                onClick={() => {
                                        const visible = 4;
                                        const maxIndex = Math.max(0, topThumbnailReviews.length - visible);
                                        setReviewIndex((prev) => (prev === maxIndex ? 0 : prev +1 ));
                                    }
                                }
                                className="
                                xl:w-10 lg:w-9 md:w-7 w-5
                                xl:h-10 lg:h-9 md:h-7 h-5
                                text-[clamp(13px,1.538vw,20px)]
                                bg-white shadow-md rounded-full 
                                flex justify-center items-center font-bold hover:bg-gray-100"
                            >
                                🡒
                            </button>
                        </div>
                    )}
                </div>

                <button className="
                    md:text-base text-[clamp(11px,2.085vw,16px)]
                    xl:px-10 lg:px-6 md:px-4 px-3
                    xl:py-3 lg:py-2 py-1
                    flex mt-2 mx-auto font-semibold text-white bg-[#303030] rounded hover:bg-opacity-80"
                    onClick={() => navigate('/reviewBoard')}
                >
                    리뷰 더보기 +
                </button>
            </div>
            
            {/* 모달창 */}
            {selectedReview && (
                <div 
                    className="fixed inset-0 bg-black bg-opacity-30 flex justify-center items-center z-50"
                    onClick={() => {
                        setSelectedReview(null);
                        setSelectedImageIndex(0);
                    }}
                >
                    <div 
                        className="bg-white w-[44%] sm:p-8 p-2 rounded shadow-lg relative"
                        onClick={(e) => e.stopPropagation()}
                    >
                        <button
                            className="
                                absolute 
                                text-[clamp(12px,2.5vw,18px)]
                                top-2 right-3 text-gray-500 hover:text-black"
                            onClick={() => {
                                setSelectedReview(null);
                                setSelectedImageIndex(0);
                            }}
                        >
                            ✕
                        </button>
                        <div className="w-full aspect-[508/384] flex items-center justify-center bg-black bg-opacity-5 roudned">
                            <img 
                                src={selectedReview.images?.[selectedImageIndex]}
                                alt={`상세 이미지 ${selectedImageIndex}`}
                                className="
                                    max-w-full max-h-full object-contain rounded"
                            />
                        </div>

                        {/* 썸네일 */}
                        <div className="
                            flex gap-2 
                            sm:mt-4 mt-2 justify-center">
                            {selectedReview.images?.map((img, idx) => (
                                <img 
                                    key={idx}
                                    src={img}
                                    alt={`썸네일 ${idx}`}
                                    className={`
                                        w-[clamp(24px,4.923vw,64px)]
                                        h-[clamp(24px,4.923vw,64px)]
                                        object-cover border round cursor-pointer ${
                                        idx === selectedImageIndex ? 'sm:ring-2 ring-1 ring-black' : ''
                                    }`}
                                    onClick={() => setSelectedImageIndex(idx)}
                                />
                            ))}
                        </div>

                        <h2 
                            className="
                                text-[clamp(10px,2.5vw,20px)]
                                font-bold sm:mt-2 mt-1">{selectedReview.title}</h2>
                        {/* 16 */}
                        <div className="text-[clamp(7.5px,1.23vw,16px)]">
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
                </div>
            )}
            {/* /🔶 리뷰 썸네일 슬라이더 영역 */}

            {/* 회사 소개 및 디아섹이란 배너 (사진 배경형) */}
            <div
                className="w-full aspect-[1300/280] bg-cover bg-center relative flex items-center justify-center"
                style={{
                    backgroundImage: `url(${aboutBanner})`
                }}
            >
                <div className="absolute inset-0 bg-black bg-opacity-40" /> {/* 어두운 오버레이 */}
                
                <div className="flex flex-col items-center justify-center w-full z-10 text-center text-white lg:gap-4 md:gap-2 gap-1">
                    <h2 className="
                        md:text-3xl text-[clamp(15px,3.911vw,30px)]
                        font-bold">
                        디아섹에 대해 더 알고 싶으신가요?
                    </h2>
                    <div className="flex justify-center gap-4">
                        <button
                            // onClick={() => navigate('/about')}
                            className="
                                md:text-lg text-[clamp(11px,2.3455vw,18px)]
                                lg:px-6 md:px-4 px-2
                                xl:py-3 md:py-2 py-1
                                rounded-full bg-white text-[#333] font-semibold hover:bg-gray-400 transition"
                        >
                            회사 소개
                        </button>
                        <button
                            onClick={() => navigate('/introduce')}
                            className="
                                md:text-lg text-[clamp(11px,2.3455vw,18px)]
                                lg:px-6 md:px-4 px-2
                                xl:py-3 md:py-2 py-1
                                rounded-full bg-white text-[#333] font-semibold hover:bg-gray-400 transition"
                        >
                            디아섹이란?
                        </button>
                    </div>
                </div>
            </div>
            {/* /회사 소개, 디아섹이란 */}
        </div>
    );
};

export default Main;