import { useEffect,useRef, useState } from 'react';
import { ChevronLeft, ChevronRight } from "lucide-react";
import p1 from '../../assets/p1.jpg'
import p2 from '../../assets/p2.jpg'
import p3 from '../../assets/p3.jpg'
import p4 from '../../assets/p4.jpg'

// 여기만 수정하면됨! ( 사진 위에서 추가하고 아래 추가 )
const images = [
    { src: p1, title: "보존의 철학에서 태어난 디아섹", desc: `50여 년 전, 스위스의 한 부부는\n 가족의 행복한 순간을 오래도록 간직하고자 노력했습니다 \n 그 마음은 지금도 디아섹에 고스란히 담겨 있습니다` },
    { src: p2, title: "디아섹은 테두리에 프레임이 없습니다", desc: `프레임이 없으면, 작품은 더 선명해집니다.` },
    { src: p3, title: "웨딩 액자의 대명사, 디아섹", desc: "오랜 시간이 지나도 변색 없이 사랑의 순간을 영원히 담아냅니다." },
    { src: p4, title: "디아섹코리아의 약속", desc: "액자의 최상위 레벨 \n 디아섹을 거는 순간 달리진 분위기로 고객만족을 약속드립니다." }
  ];

const Main_Image = () => {
    const [currentIndex, setCurrentIndex] = useState(0);
    const intervalRef = useRef(null);

    const startSlider = () => {
        if (intervalRef.current) clearInterval(intervalRef.current);
        intervalRef.current = setInterval(() => {
            setCurrentIndex(prevIndex => (prevIndex + 1) % images.length);
        }, 4000);
    };

    useEffect(() => {
        startSlider();
        return () => {
            if (intervalRef.current) clearInterval(intervalRef.current);
        };
    }, []);

    const handleIndicatorClick = (index) => {
        setCurrentIndex(index);
        startSlider(); // 슬라이더 타이머 초기화
    }

    // 좌우 버튼
    const handlePrev = () => {
        setCurrentIndex(prev => (prev - 1 + images.length) % images.length);
        startSlider();
    }

    const handleNext = () => {
        setCurrentIndex(prev => (prev + 1) % images.length);
        startSlider();
    }

    return (
        <div className="relative w-full aspect-[1300/600] xl:aspect-auto h-auto xl:h-[600px] overflow-hidden flex justify-center">
            {/* 슬라이더 wrapper */}
            <div className="relative w-full h-full overflow-hidden">
                <div className="flex w-full h-full justify-center transition-transform duration-[1100ms] absolute" // ms부분 수정하면 속도 조절 가능
                    style={{ 
                        transform: `translateX(-${currentIndex * 25}%)`, 
                        width: `${images.length * 100}%` }}
                >
                        {images.map((img, idx) => (
                            <div key = {idx} className="flex w-full h-full justify-center">
                                <img 
                                    src = {img.src}
                                    // className="w-auto h-full object-cover mx-auto"
                                    className="w-auto h-full object-cover mx-auto"
                                />
                            </div>
                        ))}
                </div>

                {/* 텍스트 오버레이 (현재 이미지에만 표시됨) */}
                <div className="absolute inset-0 z-10 flex flex-col items-center justify-center text-white text-center px-4 pointer-events-none whitespace-pre-line">
                    <h2
                        key={currentIndex + '-title'}
                        className="
                        lg:text-[44px] md:text-[clamp(38px,2.6vw,44px)] sm:text-[clamp(30px,5.084vw,39px)] text-[clamp(16px,4.694vw,30px)]
                        font-bold opacity-0 animate-fadeIn"
                        style={{ textShadow: '2px 2px 4px rgba(0,0,0,0.6)' }}
                        >
                        {images[currentIndex].title}
                    </h2>

                    <p
                        key={currentIndex + '-desc'}
                        className="xl:mt-4 lg:mt-3 md:mt-2
                        lg:text-[22px] md:text-[clamp(20px,2.15vw,22px)] sm:text-[clamp(17px,2.607vw,20px)] text-[clamp(9px,2.66vw,17px)]
                        font-bold opacity-0 animate-fadeIn delay-200"
                        style={{ textShadow: '2px 2px 5px rgba(0, 0, 0, 0.95)' }}
                        >
                        {images[currentIndex].desc}
                    </p>
                </div>
            </div> 

            {/* 버튼 */}
            <button
                onClick={handlePrev}
                className="absolute left-2 top-1/2 -translate-y-1/2 z-20
                            flex items-center justify-center
                            xl:w-12 lg:w-10 md:w-9 w-7
                            xl:h-12 lg:h-10 md:h-9 h-7
                            rounded-full bg-black/30 
                            md:hover:bg-black/70 active:bg-black/80
                            text-white shadow-lg transition"
            >
                <ChevronLeft className="w-6 h-6 md:w-8 md:h-8"/>
            </button>

            <button
                onClick={handleNext}
                className="absolute right-2 top-1/2 -translate-y-1/2 z-20
                            flex items-center justify-center
                            xl:w-12 lg:w-10 md:w-9 w-7
                            xl:h-12 lg:h-10 md:h-9 h-7
                            rounded-full bg-black/30 
                            md:hover:bg-black/70 active:bg-black/80
                            text-white shadow-lg transition"
            >
                <ChevronRight className="w-6 h-6 md:w-8 md:h-8"/>
            </button>

            {/* 하단 인디케이터*/}
            <div className="absolute bottom-5 left-1/2 transform -translate-x-1/2 flex lg:gap-2 gap-[6px]">
                {images.map((_, i) => (
                    <button
                        key={i}
                        onClick={() => handleIndicatorClick(i)}
                        className={`
                            xl:w-4.5 lg:w-[16px] w-[12px]
                            xl:h-4.5 lg:h-[16px] h-[12px]
                            rounded-full ${i === currentIndex ? 'bg-white' : 'bg-gray-400'} transition-all duration-300`}
                    />
                ))}
            </div>
        </div>
    );
};

export default Main_Image;