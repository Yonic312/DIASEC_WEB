import p0 from '../../assets/company/0.jpg'
import p1 from '../../assets/company/1.jpg'
import p2 from '../../assets/company/2.jpg'
import p3 from '../../assets/company/3.jpg'
import p5 from '../../assets/company/5.jpg'
import p6 from '../../assets/company/6.jpg'
import p7 from '../../assets/company/7.png'
import i1 from '../../assets/company/i1.png'
import i2 from '../../assets/company/i2.png'
import i3 from '../../assets/company/i3.png'
import i4 from '../../assets/company/i4.png'

const Main_CompanyProfile = () => {
    const history = [
        {
            year: "2007",
            title: "디아섹액자 개발",
            text: 
                `아크릴 헤어핀 공장으로 출발해 자체 생산을 이어가던 당사는
                차별화된 제품을 만들기 위해 아크릴판의 독창적인 무늬 개발에 
                도전하게 되었습니다 수많은 실험과정을 거쳐 아크릴판과 
                아크릴판 사이에 인쇄물을 넣어 합지하는 방식을 고안했고,
                이를 통해 독특한 디자인의 헤어핀을 제작하여 큰 매출 향상을 
                이루게 되었습니다 이 기술이 훗날 디아섹액자 개발의 단초가 
                되었습니다 2004년부터 3년간 연구 끝에, 2007년 마침내 
                디아섹액자 개발에 성공하였습니다`,
            img:p1
        },
        {
            year: "2008",
            title: "화학시험 성적서 인증",
            text: 
                `디아섹 개발이 완료되던 시점, 지인의 소개로 GS홈쇼핑 
                협력업체를 만나 홈쇼핑 판매 제안을 받게 되었습니다 
                GS홈쇼핑 판매을 위해서는 제품 안전성 검증이 필수였기에 
                국가공인 기관인 한국화학시험연구원에서 유해 성분 검출 여부, 
                본드 성분의 안전성, 접합부 박리 강도 등 다양한 항목에 대한 
                안전성에 대한 인증서를 취득하였습니다 이 과정을 통해 
                GS홈쇼핑 담당자로부터 판매 승인을 받을 수 있었습니다`,
            img:p2
        },
        {
            year: "2009",
            title: "GS홈쇼핑 방송",
            text: 
                `2009년 4월 19일 오후 8시, 수많은 우여곡절 끝에 GS홈쇼핑 
                방송이 성사되었습니다 당시 디아섹액자는 대중에게 
                매우 생소했지만, 마침 클림트 작품이 예술의 전당에서 
                전시 중이었고 오리지널 원고를 사용한 제품이라는 점에서 
                주목을 받았습니다 비교적 고가임에도 불구하고 
                많은 판매 실적을 기록했습니다`,
            video: "https://www.youtube.com/embed/DGXygPEZsf4"
        },
        {
            year:"2016",
            title:"삼송테크노밸리 아파트형 공장",
            text:
                `오랜 기간 역촌동 지하에서 작업을 이어오던 당사는 2016년 6월 
                고양 삼송테크노밸리 아파트형 공장(약 50평)으로 
                이전하였습니다 첨단 설비와 쾌적한 환경을 갖춘 새 공간에서 
                보다 안정적이고 고품질의 디아섹액자를 생산할 수 있게 
                되었습니다`,
            img:p5
        },
        {
            year:"2023",
            title:"대형 액자 프레임 개발 ",
            text:
                `장기 보존성이 특징인 디아섹액자는 일정 크기 이상으로 커질 경우 
                일반적인 프레임만으로는 장기적인 안정성을 확보하기 
                어렵습니다 당사는 오랜 제작 경험을 바탕으로 대형 사이즈에서도 
                안전하게 지탱할 수 있는 전용 대형프레임을 자체 개발하였으며, 
                이를 보호하기 위해 실용신안 출원을 추진하고 있습니다
                이를 통해 초대형 작품도 뒤틀림이나 처짐 없이 오래도록 
                견고하게 보존할 수 있습니다`,
            img:p6
        },
        {
            year:"2025",
            title:"쇼핑몰 개설",
            text:
                `보다 많은 고객이 편리하게 디아섹액자를 만나볼 수 있도록 
                2025년 자체 쇼핑몰을 오픈했습니다`,
            img:p7
        }
    ]

    const strengths = [
        {
            icon: <img src={i1} className="w-32 h-32 text-[#a67a3e]" />,
            title:"초간단 3D 주문시스템",
            desc: 
                `상세페이지에서 이미지등록을 하고나면 인테리어 배경에서 걸려있는 고객님의 액자사이즈를 자유로이 볼수 있으며 동시에 원하는 사이즈와 가격이 실시간으로 함께 표시되어 주문이 간편합니다`
        },
        {
            icon: <img src={i2} className="w-32 h-32 text-[#a67a3e]" />,
            title:"세계명화의 고해상 원본 보유",
            desc:
                `대형액자로 하여도 원본에서 느껴지는 붓터치의 섬세함까지도 살아있는 선명한 화질을 재현합니다`
        },
        {
            icon: <img src={i3} className="w-32 h-32 text-[#a67a3e]" />,
            title:"내구성과 안전에대한 설계",
            desc: 
                `대형 작품도 변형 없이 장기보존할 수 있도록 자체 개발한 프레임을 사용하며 보존성과 안전성에 대한 설계를 하여 맞춘 자재만을 사용합니다`
        },
        {
            icon: <img src={i4} className="w-32 h-32 text-[#a67a3e]" />,
            title:"홍대 시각디자이너의 감성",
            desc: 
                `2007년 디아섹을 개발한 홍대 시각 디자이너가 운영하는 디아섹코리아입니다`
        },
        
        
    ]
    
     return (
    <div className="flex flex-col w-full">
        
        {/* Hero 배너 */}
        <div className="w-full bg-gray-800 flex items-center justify-center relative">
            <img src={p0} />
        </div>

        <span className="
            md:text-[10px] text-[clamp(7px,1.303vw,10px)]
            text-right opacity-50">*위 사진은 이해를 돕기 위한 이미지입니다.</span>

        <h2 className="
            text-[clamp(24px,6.258vw,48px)] md:text-5xl
            text-center text-[#a67a3e] mt-32 font-bold">
            DIASEC KOREA HISTORY
        </h2>

        {/* 연혁 타임라인 */}
        <div className="max-w-6xl mx-auto pt-16 pb-16 px-6 space-y-16">
            {history.map((item, idx) => (
                <div
                    key={idx}
                    className={`flex flex-col md:flex-row ${
                    idx % 2 === 1 ? "md:flex-row-reverse" : ""
                    } items-center justify-center max-w-4xl gap-8`}
                >
                {/* 이미지 자리 */}
                <div className="
                    sm:w-1/2 w-full
                    flex items-center justify-center h-64">
                    
                    {item.video ? (
                        <iframe
                            src={item.video}
                            title="GS홈쇼핑 방송 영상"
                            frameBorder="0"
                            allow="accelerometer; autoplay; clipboard-media; gyroscope; picture-in-picture"
                            allowFullScreen
                            className="w-full h-64 rounded-lg"
                            ></iframe>
                    ) : (
                        <img
                            src={item.img}
                            className="w-auto max-h-full rounded-lg object-contain"
                        />
                    )}
                    {/* <img src={item.img} className="w-auto max-h-full rounded-lg object-contain" /> */}
                </div>

                {/* 텍스트 */}
                <div className="w-full md:w-1/2">
                    <span className="
                        text-[#a67a3e] font-bold 
                        md:text-lg text-[clamp(13px,2.346vw,18px)]">
                        {item.year}s
                    </span>
                    <h2 className="
                        text-[clamp(20px,3.128vw,24px)] md:text-2xl 
                        font-bold">
                            {item.title}
                    </h2>
                    <p className="
                        md:text-base text-[clamp(15px,2.085vw,16px)]
                        
                        mt-[-2px] text-gray-600 break-keep">{item.text}</p>
                </div>
            </div>
        ))}
      </div>

      <div className="bg-gray-50 py-20">
        <div className="max-w-6xl mx-auto px-6 text-center">
            <h2 className="
                text-[clamp(22px,4.693vw,36px)] md:text-4xl 
                font-bold text-gray-800 md:mb-4 mb-1
                "
            >
                디아섹코리아 쇼핑몰의 강점
            </h2>
            <hr className="border-[1px] border-[#a67a3e]"/>

            <div className="
                grid
                sm:grid-cols-2 grid-cols-1
                mt-4
                gap-8">
                {strengths.map((s, idx) => (
                    <div
                        key={idx}
                        className="bg-white rounded-xl shadow hover:shadow-lg transition p-8 flex flex-col items-center text-center"
                    >
                        <div className="">{s.icon}</div>
                        <h3 className="
                            md:text-xl text-[clamp(15px,2.085vw,20px)] 
                            font-semibold text-gray-800">
                            {s.title}
                        </h3>
                        <p className="
                            text-[clamp(12px,2.085vw,16.5px)] md:text-[16.5px]
                            break-keep
                            text-gray-600 whitespace-pre-line leading-relaxed">{s.desc}</p>
                    </div>
                ))}
            </div>
        </div>
      </div>

      {/* 미래 비전 */}
      <div className="py-20 text-[#c99561] text-center">
            <h2 className="
                text-[clamp(17px,4.693vw,36px)] md:text-4xl
                font-bold break-keep">
                오직 디아섹액자만을 위한 최선의 노력으로
            </h2>
            <h2 className="
                text-[clamp(17px,4.693vw,36px)] md:text-4xl 
                break-keep md:mt-3 mt-[2px] text-3xl font-bold">
                    고객에 만족을 드리고자 합니다
            </h2>
      </div>
    </div>
  );
};


export default Main_CompanyProfile;