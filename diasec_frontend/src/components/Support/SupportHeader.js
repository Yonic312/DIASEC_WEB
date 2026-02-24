import { useNavigate, useLocation } from 'react-router-dom';

const tabs = [
    // '고객센터홈', 
    '자주 묻는 질문', '1:1 문의','공지사항', '후기게시판', '기업컨설팅', '업무제휴'];

const routes = {
    // '고객센터홈': '/supportMain',
    '자주 묻는 질문' : '/faqMain',
    '공지사항' : '/noticeList',
    '후기게시판' : '/reviewBoard',
    '1:1 문의' : '/supportMyInquiryList',
    '업무제휴' : '1',
    '기업컨설팅' : '2',
};

const SupportHeader = () => {
    const navigate = useNavigate();
    const location = useLocation();

    const currentPath = Object.values(routes).find(path => location.pathname.startsWith(path));
    const activeTab = Object.keys(routes).find(tab => routes[tab] === currentPath);

    return (
        <>
            <h1 
                className='
                    w-fit md:text-3xl text-[clamp(16px,3.91vw,30px)]
                    font-bold mb-10 cursor-pointer'
                onClick={() => {navigate("/supportMain")}}
            >
                고객센터
            </h1>
            <div 
                className="
                    flex font-medium
                    md:gap-6 gap-2 
                    md:text-sm text-[clamp(11px,1.825vw,14px)]">
                {tabs.map((tab, idx) => (
                    <button 
                        key={idx} 
                        onClick={() => {
                            navigate(routes[tab]);
                        }}
                        className={`relative pb-2 ${
                            activeTab === tab
                                ? 'text-black after:absolute after:left-0 md:after:-bottom-1 after:bottom-[6px] after:w-full after:h-0.5 after:bg-[#555555]'
                                : 'text-black'
                        }`}
                    >
                        {tab}
                    </button>
                ))}
            </div>

        </>
    )
}

export default SupportHeader;