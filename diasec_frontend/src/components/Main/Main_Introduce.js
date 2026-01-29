import { useState } from 'react';
import { ChevronDownIcon } from '@heroicons/react/24/solid';

import diasec_view from '../../assets/video/diasec_view.mp4';
import P0 from '../../assets/whatDiasec/0.png'
import P1 from '../../assets/whatDiasec/1.jpg'
import P2 from '../../assets/whatDiasec/2.png'
import P3 from '../../assets/whatDiasec/3.jpg'
import P4 from '../../assets/whatDiasec/4.png'
import P5 from '../../assets/whatDiasec/5.png'
import P6 from '../../assets/whatDiasec/6.png'
import P7 from '../../assets/whatDiasec/7.png'
import P8 from '../../assets/whatDiasec/8.png'
import P9 from '../../assets/whatDiasec/9.png'
import P10 from '../../assets/whatDiasec/10.png'
import P11 from '../../assets/whatDiasec/11.png'

const Main_Introduce = () => {

    // 더보기 토글
    const [showMore1, setShowMore1] = useState(false);
    const [showMore2, setShowMore2] = useState(false);
    const [showMore3, setShowMore3] = useState(false);
    const [showMore4, setShowMore4] = useState(false);
    const [showMore5, setShowMore5] = useState(false);
    const [showMore6, setShowMore6] = useState(false);
    const [showMore7, setShowMore7] = useState(false);

    return (
        <div className="w-full flex flex-col  ">
            {/* 메인 이미지 */}
            <img src={P0} className="w-full shadow-lg" />

            <div className="flex flex-col mt-10 md:mx-5 mx-[6px] text-gray-800 md:gap-20 gap-10">
                <div className="flex flex-col items-center md:gap-4 gap-2">
                    <video
                        src={diasec_view}
                        muted
                        autoPlay
                        playsInline
                        loop
                        preload="none"
                        className="
                            w-[800px] mt-10
                            video_product_pc"
                    />
                </div>

                <div className="flex flex-col items-center">
                    <div className="flex items-center justify-center w-full gap-4 mb-5">
                        <div className="flex-1 border-t-2 border-[#D0AC88]"></div>
                        <span className="lg:text-[36px] text-[clamp(13px,3.519vw,36px)] font-bold text-[#D0AC88]">
                            디아섹 액자 구조
                        </span>
                        <div className="flex-1 border-t-2 border-[#D0AC88]"></div>
                    </div>
                    <img src={P9} />
                </div>

                <div className="flex flex-col items-center">
                    <div className="flex items-center justify-center w-full gap-4 mb-5">
                        <div className="flex-1 border-t-2 border-[#D0AC88]"></div>
                        <span className="lg:text-[36px] text-[clamp(13px,3.519vw,36px)] font-bold text-[#D0AC88]">
                            디아섹의 추가 설명
                        </span>
                        <div className="flex-1 border-t-2 border-[#D0AC88]"></div>
                    </div>
                    <img src={P10} />
                </div>

                <div className="flex flex-col items-center">
                    <div className="flex items-center justify-center w-full gap-4 mb-20">
                        <div className="flex-1 border-t-2 border-[#D0AC88]"></div>
                        <span className="lg:text-[36px] text-[clamp(13px,3.519vw,36px)] font-bold text-[#D0AC88]">
                            디아섹의 부분들
                        </span>
                        <div className="flex-1 border-t-2 border-[#D0AC88]"></div>
                    </div>

                    <img src={P11}  className="lg:w-[55%]"/>
                </div>

                <div>
                    <div className="flex flex-col items-center">
                        <div className="flex items-center justify-center w-full gap-4 mb-20">
                            <div className="flex-1 border-t-2 border-[#D0AC88]"></div>
                            <span className="lg:text-[36px] text-[clamp(13px,3.519vw,36px)] font-bold text-[#D0AC88]">
                                디아섹 액자 특징
                            </span>
                            <div className="flex-1 border-t-2 border-[#D0AC88]"></div>
                        </div>
                    </div>

                    <div 
                        className='
                            flex lg:flex-row flex-col justify-between gap-10'>
                        {/* 디아섹 액자 특징 1 */}
                        <section className="lg:w-1/3 w-full flex flex-col items-start gap-4">
                            <div className="object-cover w-full">
                                <img src={P7} className="w-full h-auto object-cover rounded-3xl" />
                            </div>
                            <div className="w-full flex-1 text-black flex flex-col">
                                <h2 
                                    className="flex md:justify-center md:text-[28px] text-[clamp(20px,4.381vw,28px)] font-medium text-gray-900 mb-4 border-b pb-2 border-gray-300">
                                    프레임리스 디자인
                                </h2>
                                <div 
                                    className="
                                    md:text-base text-[clamp(11px,2.085vw,16px)] 
                                    leading-7 text-700 space-y-2 break-keep">
                                    <p className="leading-relaxed">
                                        여러분이 잘알고 계시는 일반적인 액자는 작품의 외곽을 감싸는 프레임이 있는   
                                        액자를 떠올릴 것입니다
                                        그러나 디아섹은 외곽에 테두리가 없는 ‘프레임리스’ 구조입니다.
                                        테두리가 없는 매끄러운 마감은 이미지의 주목률을 극대화 하며 보는 이로 
                                        하여금 작품 안으로 빠져드는 듯한 압도적인 몰입감을 선사합니다
                                        이러한 이유로 전 세계의 사진작가와 예술가들은 자신의 작품이 가진 에너지를 
                                        가장 순수하게 전달하기 위해 디아섹 공법을 선택하며, 이는 곧 최고의 전시 
                                        효과라는 깊은 만족감으로 이어집니다.
                                    </p>
                                </div>
                                <button onClick={() => setShowMore6(!showMore6)}
                                        className="
                                            md:text-sm text-[clamp(11px,1.8252vw,14px)] 
                                            text-blue-600 font-medium hover:underline transition-all duration-150"
                                    >
                                        <div className="flex flex-row items-center">
                                        {showMore6 ? '접기' : '더보기'}
                                        <ChevronDownIcon
                                            className={`
                                                flex
                                                md:w-5 w-[clamp(0.625rem,3.129vw,1.25rem)]
                                                md:h-5 h-[clamp(0.625rem,3.129vw,1.25rem)]
                                                transform transition-transform duration-200 ${showMore6 ? 'rotate-180' : ''}`}
                                        />
                                        </div>
                                    </button>
                                    {showMore6 && (
                                        <div>
                                            <p className="leading-relaxed break-keep">
                                                실제로 예술의 전당 한가람 미술관에서 개최된 ‘내셔널 지오그래픽’ 전시와 같은 
                                                세계적인 수준의 갤러리 현장에서는 디아섹 액자가 표준처럼 사용됩니다. 
                                                이는 디아섹이 지닌 심플하고 모던한 미학이 경이로운 대자연의 기록을 
                                                가장 생생하게 표현할 뿐만 아니라, 시간이 흘러도 변치 않는 탁월한 보존성과
                                                내구성을 지니고 있음을 증명하는 사례입니다.
                                            </p>
                                            
                                            <button onClick={() => setShowMore7(!showMore7)}
                                                className="
                                                    md:text-sm text-[clamp(11px,1.8252vw,14px)]
                                                    text-blue-600 font-medium hover:underline transition-all duration-150"
                                            >
                                                <div className="flex flex-row items-center">
                                                    {showMore7 ? '접기' : '더보기'}
                                                    <ChevronDownIcon
                                                        className={`
                                                            flex
                                                            md:w-5 w-[clamp(0.625rem,3.129vw,1.25rem)]
                                                            md:h-5 h-[clamp(0.625rem,3.129vw,1.25rem)]
                                                            transform transition-transform duration-200 ${showMore7 ? 'rotate-180' : ''}`}
                                                    />
                                                </div>
                                            </button>
                                            {showMore7 && (
                                                <div>
                                                    <p className="leading-relaxed break-keep">
                                                        과거 전문가들의 영역에 머물렀던 디아섹은 이제 우리 일상 속 가장 소중한 
                                                        순간들을 기록하는 액자의 최상위 레벨이라는 인식이 많아지고 있습니다 
                                                        생애 단 한 번뿐인 웨딩 사진을 비롯해 가족, 아기, 그리고 소중한 반려견의 
                                                        모습을 디아섹으로 소장하는 것은, 그 추억을 하나의 ‘작품’으로 완성해
                                                        오랜 세월을 기억하고자 하는 마음입니다
                                                    </p>
                                                </div>
                                            )}
                                        </div>
                                    )}
                            </div>
                        </section>

                        {/* 디아섹 액자 특징 2 */}
                        <section className="lg:w-1/3 w-full flex flex-col items-start gap-4">
                            <div className="w-full object-cover">
                                <img src={P4} className="w-full object-cover rounded-3xl" />
                            </div>
                            <div className="flex-1 w-full text-black flex flex-col">
                                <h2 
                                    className="
                                    flex md:justify-center md:text-[28px] text-[clamp(20px,4.381vw,28px)] font-medium text-gray-900 mb-4 border-b pb-2 border-gray-300">
                                    보존의 과학
                                </h2>
                                <div 
                                    className="
                                        md:text-base text-[clamp(11px,2.085vw,16px)] 
                                        leading-7 text-700 space-y-2">
                                    <p className="leading-relaxed break-keep">
                                        다아섹액자가 전 세계에서 사랑받는 이유는 단순히 아름답기 때문만은 
                                        아닙니다
                                        작품의 생명력을 반영구적으로 유지하는 압도적인 보존기술이라는
                                        바로 그 핵심요소가 있기 때문입니다
                                        디아섹은 전면의 투명 아크릴, 중간의 인쇄물, 그리고 후면의 알루미늄 
                                        복합 패널이라는 세 가지 자재가 특수한 기술로 결합된 정밀한 공법입니다. 
                                        인체에 무해한 수성 본드를 이용해 세가지 자재가 하나의 판재로 완벽하게 
                                        압착 밀봉되는'진공 압착 방식' 공법으로 외부 공기유입의 습기나 
                                        오염물질로부터 인쇄물을 온전히 보호하는 시스템입니다
                                    </p>
                                    <button onClick={() => setShowMore2(!showMore2)}
                                        className="
                                            md:text-sm text-[clamp(11px,1.8252vw,14px)] 
                                            text-blue-600 font-medium hover:underline transition-all duration-150"
                                    >
                                        <div className="flex flex-row items-center">
                                        {showMore2 ? '접기' : '더보기'}
                                        <ChevronDownIcon
                                            className={`
                                                flex
                                                md:w-5 w-[clamp(0.625rem,3.129vw,1.25rem)]
                                                md:h-5 h-[clamp(0.625rem,3.129vw,1.25rem)]
                                                transform transition-transform duration-200 ${showMore2 ? 'rotate-180' : ''}`}
                                        />
                                        </div>
                                    </button>
                                    {showMore2 && (
                                        <div>
                                            <p className="leading-relaxed break-keep">
                                                액자의 뒷면을 받쳐주는 알루미늄 복합 패널은 실제 대형 건축물의
                                                외장재로 사용될 만큼 강도가 높습니다. 이는 일반적인 플라스틱이나 
                                                나무 프레임과 달리 외부 온·습도 변화에도 휘어짐이나 뒤틀림이 
                                                거의 없습니다.         
                                                덕분에 대형 사이즈의 작품이라도 처음 제작된 상태 그대로의 
                                                평활도를 견고하게 유지해 줍니다.
                                            </p>
                                            
                                            <button onClick={() => setShowMore3(!showMore3)}
                                                className="
                                                    md:text-sm text-[clamp(11px,1.8252vw,14px)]
                                                    text-blue-600 font-medium hover:underline transition-all duration-150"
                                            >
                                                <div className="flex flex-row items-center">
                                                    {showMore3 ? '접기' : '더보기'}
                                                    <ChevronDownIcon
                                                        className={`
                                                            flex
                                                            md:w-5 w-[clamp(0.625rem,3.129vw,1.25rem)]
                                                            md:h-5 h-[clamp(0.625rem,3.129vw,1.25rem)]
                                                            transform transition-transform duration-200 ${showMore3 ? 'rotate-180' : ''}`}
                                                    />
                                                </div>
                                            </button>
                                            {showMore3 && (
                                                <div>
                                                    <p className="leading-relaxed break-keep">
                                                        디아섹의 아크릴 전면에는 특수 UV 차단 코팅 처리가 되어 있어 
                                                        두 가지 강력한 보존 효과를 발휘합니다.
                                                        첫째는 태양광이나 실내 조명에서 발생하는 자외선을 효과적으로 
                                                        차단하여 세월에 따른 인쇄물의 변색과 탈색을 막아줍니다.
                                                        두 번째는 UV 차단 코팅은 표면 경도를 높여 일상적인 스크래치로부터 
                                                        작품을 안전하게 보호합니다.
                                                        결과적으로 디아섹은 외부의 물리적 충격과 광학적 손상  모두를 방어하며, 
                                                        처음의 선명하고 화사한 색감을 수십 년이 흘러도 변함없이 유지하게 합니다.
                                                    </p>
                                                </div>
                                            )}
                                        </div>
                                    )}
                                </div>
                            </div>
                        </section>

                        {/* 디아섹 액자 특징 1 */}
                        <section className="lg:w-1/3 w-full flex flex-col items-start gap-4">
                            <div className="w-full object-cover">
                                <img src={P5} className="w-full h-auto object-cover rounded-3xl" />
                            </div>
                            <div className="flex-1 w-full text-black flex flex-col">
                                <h2 className="flex md:justify-center md:text-[28px] text-[clamp(20px,4.381vw,28px)] font-medium text-gray-900 mb-4 pb-2 border-b border-gray-300">액자의 최상위레벨 - 디아섹</h2>
                                <div 
                                    className="
                                        md:text-base text-[clamp(11px,2.085vw,16px)] 
                                        leading-7 text-700 space-y-2">
                                    <p className="break-keep">
                                        인쇄 또한 디아섹 액자의 핵심기술입니다
                                        당사는 독일에서 수입한 전용 용지를 사용하고, 현존하는 최고 수준의 
                                        해상도를 구현하는 EPSON  Stylus Pro로 인쇄합니다.
                                        이 인쇄 방식은  종이에 잉크의 침투성이 뛰어나서 발색이 좋으 
                                        내구성이 높으며, 변색이 매우 적은 전문 인쇄 분야에서 인정받는 
                                        피그먼트(Pigment) 인쇄 방식입니다.
                                    </p>
                                        <button onClick={() => setShowMore4(!showMore4)}
                                            className="
                                                md:text-sm text-[clamp(11px,1.8252vw,14px)] 
                                                text-blue-600 font-medium hover:underline transition-all duration-150"
                                        >
                                            <div className="flex flex-row items-center">
                                                {showMore4 ? '접기' : '더보기'}
                                                <ChevronDownIcon
                                                    className={`
                                                        flex
                                                        md:w-5 w-[clamp(0.625rem,3.129vw,1.25rem)]
                                                        md:h-5 h-[clamp(0.625rem,3.129vw,1.25rem)]
                                                        transform transition-transform duration-200 ${showMore4 ? 'rotate-180' : ''}`}
                                                />
                                            </div>
                                        </button>
                                    {showMore4 && (
                                    <div>
                                        <div className="flex gap-3 w-full h-auto object-cover break-keep">
                                            {/* <img src={P6} className="w-[30%] h-fit object-cover rounded-3xl" /> */}
                                            <div className="flex flex-col">
                                                <p className="leading-relaxed">
                                                    수성이나 염료가 아닌 안료잉크를 사용하는 10색 Ultra Chrome HD
                                                    잉크를 사용하여 원본데이터를 색감을 왜곡 없이 재현하고, 
                                                    그라데이션·명암·미세한 질감까지 섬세하게 표현함으로 합니다.
                                                </p>
                                                
                                            </div>
                                        </div>
                                        <div>
                                            <button onClick={() => setShowMore5(!showMore5)}
                                                className="
                                                    md:text-sm text-[clamp(11px,1.8252vw,14px)] 
                                                    text-blue-600 font-medium hover:underline transition-all duration-150"
                                            >
                                                <div className="flex flex-row items-center">
                                                    {showMore5 ? '접기' : '더보기'}
                                                    <ChevronDownIcon
                                                        className={`
                                                            flex
                                                            md:w-5 w-[clamp(0.625rem,3.129vw,1.25rem)]
                                                            md:h-5 h-[clamp(0.625rem,3.129vw,1.25rem)]
                                                            transform transition-transform duration-200 ${showMore5 ? 'rotate-180' : ''}`}
                                                    />
                                                </div>
                                            </button>
                                            {showMore5 && (
                                                <div>
                                                    <p className="leading-relaxed break-keep">
                                                        이처럼 정밀하게 인쇄된 이미지는 유리보다 높은 투명도를 가진 
                                                        캐미글래스 아크릴과 결합되어 색의 깊이와 선명도를 
                                                        한층 더 끌어올립니다.
                                                        인쇄 기술과 소재의 진공압축 공법의 조화로 이루어지는 디아섹은 
                                                        오랫동안 변함없는 선명한 품질로 감상할 수 있는 액자가 됩니다.
                                                    </p>
                                                </div>
                                            )}
                                        </div>    
                                    </div>
                                    )}
                                </div>
                            </div>
                        </section>
                    </div>
                </div>

                <div className="flex items-center justify-center w-full gap-4 mb-5">
                    <div className="flex-1 border-t-2 border-[#D0AC88]"></div>
                    <span className=" lg:text-[60px] text-[clamp(24px,5.865vw,60px)] font-bold text-[#D0AC88]">
                        DIASEC HISTORY
                    </span>
                    <div className="flex-1 border-t-2 border-[#D0AC88]"></div>
                </div>

                {/* DIASEC History */}
                <section className="flex flex-col lg:flex-row items-start gap-10">
                    <div 
                        className="
                            lg:w-1/2 w-full
                            h-auto
                            flex-shrink-0">
                        <img src={P1} className="w-full object-cover rounded-3xl" />
                    </div>

                    <div className="lg:w-1/2 w-full flex-1 text-black flex flex-col">
                        <h2 className="md:text-[28px] text-[clamp(20px,4.381vw,28px)] font-medium text-gray-900 mb-4 border-b pb-2 border-gray-300">Heinz Sovila와 Brulhart</h2>
                        <div 
                            className="
                                md:text-base text-[clamp(11px,2.085vw,16px)]
                                leading-7 text-700 space-y-2 pr-5">
                            <p className="leading-relaxed break-keep">
                                디아섹(DIASEC)은 스위스의 Heinz Sovilla와 그의 아내 Brulhart 부부가 개발한
                                사진 보존 기술입니다.
                                이들은 시간이 지남에 따라 행복하고 소중한 가족사진이 변색되고 변형되는 것에
                                안타까움을 느끼며, 이를 방지할 방법을 찾기 시작했습니다.
                                개발은 1969년부터 시작되었으며, 완성까지 약 10년간의 연구와 실험이 이어졌습니다.
                                마침내, 사진 위에 아크릴을 진공 상태에서 직접 부착하는 방식으로 사진의 변질을 막고
                                오랜 시간 보존할 수 있는 새로운 형태의 액자가 탄생했습니다.
                                이 기술은 ‘디아섹(DIASEC)’이라는 이름으로 특허 등록되었으며, 새로운 액자의
                                트렌드로 전환점을 마련했습니다.
                            </p>
                        </div>
                    </div>
                </section>

                <section className="flex flex-col lg:flex-row items-start gap-10">
                    <div 
                        className="
                            lg:hidden 
                            lg:w-1/2 w-full
                            h-auto
                            flex-shrink-0">
                        <img src={P2} className="w-full object-cover rounded-3xl" />
                    </div>
                    <div className="flex-1 text-black flex flex-col">
                        <h2 className="md:text-[28px] text-[clamp(20px,4.381vw,28px)] font-medium text-gray-900 mb-4 border-b pb-2 border-gray-300">세계 확산 과정</h2>
                        <div 
                            className="md:text-base text-[clamp(11px,2.085vw,16px)] 
                                break-keep leading-7 text-700 space-y-2">
                            <p className="leading-relaxed">1979년, 네덜란드의 Wilcovak사가 디아섹 기술의 라이선스를 이어받아 본격적인 생산에 나섰습니다.</p>
                            <p className="leading-relaxed ">
                                이후 미국, 캐나다, 독일 등으로 확산되었고, 2000년대 초 독일의 Grieger사가 상표와
                                공법의 허가를 이어받아 대량 생산 체제를 갖추면서 디아섹은 전 세계적으로 널리
                                알려지게 됩니다.</p>
                        </div>
                    </div>
                    <div 
                        className="
                            hidden lg:block 
                            lg:w-1/2 w-full
                            h-auto
                            flex-shrink-0">
                        <img src={P2} className="w-full object-cover rounded-3xl" />
                    </div>
                </section>

                <section className="flex flex-col lg:flex-row items-start gap-10">
                    <div className="lg:w-1/2 w-full 
                    h-auto
                    shrink-0">
                        <img src={P3} className="w-full object-cover rounded-3xl" />
                    </div>
                    <div className="flex-1 text-black flex flex-col">
                        <h2 className="md:text-[28px] text-[clamp(20px,4.381vw,28px)] font-medium text-gray-900 mb-4 border-b pb-2 border-gray-300">국내 도입과 성장</h2>
                        <div 
                            className="
                                md:text-base text-[clamp(11px,2.085vw,16px)] 
                                leading-7 text-700 space-y-2 break-keep">
                            <p className="leading-relaxed">한국에는 2006년경 처음 소개되었으며, 2012년부터 본격적으로 확산되기 시작했습니다.</p>
                            <p className="leading-relaxed">2025년에 디아섹은 사진작가들의 전시용 작품은 물론, 연예인 사진, 웨딩사진, 가족사진 등 다양한 분야에서 
                            각광받는 고급 액자 방식으로 자리잡고 있습니다.</p>
                            
                            <button onClick={() => setShowMore1(!showMore1)}
                                className="
                                    md:text-sm text-[clamp(11px,1.8252vw,14px)]
                                    text-blue-600 font-medium hover:underline transition-all duration-150"
                            >
                                <div className="flex flex-row items-center">
                                    {showMore1 ? '접기' : '더보기'}
                                    <ChevronDownIcon
                                        className={`
                                            flex
                                            md:w-5 w-[clamp(0.625rem,3.129vw,1.25rem)]
                                            md:h-5 h-[clamp(0.625rem,3.129vw,1.25rem)]
                                            transform transition-transform duration-200 ${showMore1 ? 'rotate-180' : ''}`}
                                    />
                                </div>
                            </button>
                            {showMore1 && (
                                <div>
                                    <p className="leading-relaxed break-keep">
                                        디아섹 액자는 뛰어난 보존성과 고급스러운 마감으로 인해 일반 소비자부터 전문가,
                                        기업까지 폭넓게 사용되고 있습니다.</p>
                                    <p className="leading-relaxed">
                                        특히 가족사진, 아기사진, 웨딩사진과 같은 소중한 추억을 간직하려는 일반인들에게
                                        큰 인기를 끌고 있습니다.
                                        그리고 사진작가 전시회, 웨딩샵, 백화점 등에서도 널리 활용됩니다. 또한 항공사, 병원,
                                        대기업 등 다양한 공간에서도 디아섹 특유의 선명함과 내구성을 인정받아 선호되고
                                        있습니다.
                                    </p>
                                    <p className="leading-relaxed">
                                        오랜 시간 변색이나 손상 없이 보관할 수 있는 디아섹만의 품질은 특별한 이유가 있는
                                        선택입니다.
                                    </p>
                                </div>
                            )}
                        </div>
                    </div>
                </section>
            </div>
        </div>
    );
};

export default Main_Introduce;
