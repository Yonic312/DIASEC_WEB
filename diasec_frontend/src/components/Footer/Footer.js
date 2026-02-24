import { useNavigate } from "react-router-dom";

const Footer = () => {
    const navigate = useNavigate();

    return (
        <div className="w-full h-full flex flex-col items-center justify-center bg-[#b29476] mt-20">
            <div className="
                lg:text-[13.5px] md:text-[clamp(12.5px,1.319vw,13.5px)] sm:text-[clamp(11.5px,1.629vw,12.5px)] text-[clamp(9.5px,1.7996vw,11.5px)]
                flex flex-col items-center text-white">
                <div className="
                    text-[15px]
                    flex gap-2 mt-[2%]"
                >
                    <span> 상호명 : 디아섹코리아</span> | 
                    <span> 대표 : 임정원</span> |
                    <span> 주소 : 경기 고양시 덕양구 통일로 140 삼송테크노밸리 A동 355호</span>
                </div>

                <div className="
                    text-[15px]
                    flex gap-2
                ">
                    <span> 메일 : d2one@naver.com</span>
                    <span> 고객센터 : 02-389-5879</span>
                    <span> 사업자등록번호 : 232-01-07761</span>
                    <span> 통신판매업신고번호 : 000-0000</span>
                </div>

                <div className="flex my-[1%]">
                    <span>Copyright ⓒ2000 DIASEC KOREA All right reserved</span>
                </div>

                <div className="
                    text-[15px]
                    flex gap-2"
                >
                    <button
                        onClick={() => navigate('/')}
                    >
                        홈
                    </button>
                    /
                    <button
                        onClick={() => navigate('/main_CompanyProfile')}
                    >
                        회사소개
                    </button>
                    /
                    <button
                        onClick={() => navigate('/policy/terms')}
                    >
                        이용약관
                    </button>
                    /
                    <button
                        onClick={() => navigate('/policy/privacy')}
                    >
                        개인정보 취급방침
                    </button>
                    /
                    <button
                        onClick={() => navigate('')}
                    >
                        기업컨설팅
                    </button>
                    /
                    <button
                        onClick={() => navigate('')}
                    >
                        제휴문의
                    </button>
                </div>
            </div>
        </div>
    )
}

export default Footer;