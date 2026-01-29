const Footer = () => {
    return (
        <div className="w-full h-full flex flex-col items-center justify-center bg-[#555555] mt-20">
            <div>
                <span className="
                    lg:text-[35px] md:text-[clamp(30px,3.421vw,35px)] sm:text-[clamp(26px,3.91vw,30px)] text-[clamp(20px,4.067vw,26px)]
                    text-white font-medium"
                    translate="no"
                >
                    DIASEC
                </span>
                <span className="
                    lg:text-[18px] md:text-[clamp(16px,1.759vw,18px)] sm:text-[clamp(14px,2.085vw,16px)] text-[clamp(13px,2.503vw,16px)]
                    text-white ml-[4px] font-normal"
                    translate="no"
                >
                    KOREA
                </span>
            </div>
            <div className="
                lg:text-[13.5px] md:text-[clamp(12.5px,1.319vw,13.5px)] sm:text-[clamp(11.5px,1.629vw,12.5px)] text-[clamp(9.5px,1.7996vw,11.5px)]
                flex flex-col items-center text-gray-300">
                <div className="
                    flex gap-2 mt-[2%]"
                >
                    <span> 상호명 : 쇼핑몰</span>
                    <span> 대표 : 임정원</span>
                </div>

                <div className="flex gap-2">
                    <span> 메일 : d2one@naver.com</span>
                    <span> 고객센터 : 000-0000-0000</span>
                </div>

                <div className="flex gap-2">
                    <span> 통신판매업신고번호 : 000-0000</span>
                    <span> 사업자등록번호 : 232-01-07761</span>
                </div>
                

                <div>
                    <span> 주소 : 경기 고양시 덕양구 통일로 140 (동산동, 삼송테크노밸리) A동 355호</span>
                </div>

                <div className="flex mt-[1%]">
                    <span translate="no">ⓒ2000 <span className="text-white font-semibold">D2ONE</span> All right reserved</span>
                </div>
            </div>
        </div>
    )
}

export default Footer;