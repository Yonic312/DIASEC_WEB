import { useEffect, useState } from "react";

const Main_Event = () => {
    const API = process.env.REACT_APP_API_BASE;
    const [activeTab, setActiveTab] = useState("ongoing");
    const [events, setEvents] = useState([]);

    useEffect(() => {
        fetch(`${API}/event?status=${activeTab}`)
        .then((res) => res.json())
        .then((data) => setEvents(data))
        .catch((err) => console.error("이벤트 불러오기 실패", err));
    }, [activeTab]);

    // 페이징 관련 상태
    const [currentPage, setCurrentPage] = useState(1);
    const itemsPerPage = 10;

    const totalPages = Math.max(1, Math.ceil(events.length / itemsPerPage));
    const currentPosts = events.slice(
        (currentPage - 1) * itemsPerPage,
        currentPage * itemsPerPage
    );

    // ✅ OrderList 기준 반영
    const [pageGroupSize, setPageGroupSize] = useState(
        window.innerWidth < 640 ? 5 : 10
    );

    useEffect(() => {
    const handleResize = () => {
        setPageGroupSize(window.innerWidth < 640 ? 5 : 10);
    };
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
    }, []);

    const currentGroup = Math.floor((currentPage - 1) / pageGroupSize);
    const groupStart = currentGroup * pageGroupSize + 1;
    const groupEnd = Math.min(groupStart + pageGroupSize - 1, totalPages);

    return(
        <div className="max-full mx-auto px-4 py-20">
            {/* 탭 */}
            <div 
                className="
                    flex justify-center gap-4 border-b border-gray-200 mb-6
                    md:text-base text-[clamp(11px,2.085vw,16px)]
                    ">
                <button
                    onClick={() => setActiveTab("ongoing")}
                    className={`pb-2 px-4 font-semibold ${
                        activeTab === "ongoing"
                            ? "border-b-2 border-black text-black" 
                            : "text-gray-400"
                    }`}
                >
                    진행중인 이벤트
                </button>
                <button
                    onClick={() => setActiveTab("ended")}
                    className={`pb-2 px-4 font-semibold ${
                        activeTab === "ended"
                            ? "border-b-2 border-black text-black" 
                            : "text-gray-400"
                    }`}
                >
                    종료된 이벤트
                </button>
            </div>

            {/* 이벤트 카드 */}
            <div 
                className="
                    justify-center grid md:grid-cols-2 gap-12
                    md:text-base text-[clamp(11px,2.085vw,16px)]
                    ">
                {currentPosts.map((event, index) => (
                    <div
                        key={`${event.eventId}-${index}`}
                        onClick={() => window.location.href = `/mainEventDetail/${event.eventId}`}
                        className="max-w-[582px] cursor-pointer rounded-b-xl hover:shadow-xl"
                    >
                        <div
                            className="w-full max-h-[291px] rounded-lg overflow-hidden shadow border border-gray-100 cursor-pointer"
                        >   
                            <img
                                src={event.thumbnailUrl}
                                alt={event.title}
                                className=" w-full h-full object-cover"
                            />
                        </div>
                        <div className="p-4">
                                <h3 className="font-semibold text-gray-800">{event.title}</h3>
                                <p className="text-sm text-gray-500 mt-1">{event.period}</p>
                        </div>
                    </div>
                ))}
            </div>

            {/* 페이징 UI */}
            <div 
                className="
                    md:text-sm text-[clamp(10px,1.8252vw,14px)]
                    flex justify-center items-center sm:gap-2 gap-[1px] mt-10 mb-10">
                <button 
                    onClick={() => setCurrentPage(Math.max(1, groupStart - pageGroupSize))}
                    disabled={groupStart === 1}
                    className="
                        sm:w-8 w-6
                        sm:h-8 h-6     
                        flex items-center justify-center text-gray-500 hover:text-black"
                >
                    {'<<'}
                </button>

                <button 
                    onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
                    disabled={currentPage === 1}
                    className="
                        sm:w-8 w-6
                        sm:h-8 h-6 
                        flex items-center justify-center text-gray-500 hover:text-black"
                >
                    {'<'}
                </button>

                {Array.from({ length: groupEnd - groupStart + 1 }, (_, i) => groupStart + i).map(page => (
                    <button key={page}
                            onClick={() => setCurrentPage(page)}
                            className={`
                                sm:w-8 w-6
                                sm:h-8 h-6
                                flex items-center justify-center rounded-full ${
                            currentPage === page ? 'bg-black text-white' : 'text-gray-700 hover:bg-gray-100'
                            }`}>
                    {page}
                    </button>
                ))}

                <button onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
                    disabled={currentPage === totalPages}
                    className="
                        sm:w-8 w-6
                        sm:h-8 h-6 
                        flex items-center justify-center text-gray-500 hover:text-black"
                >
                    {'>'}
                </button>

                <button onClick={() => setCurrentPage(Math.min(totalPages, groupStart + pageGroupSize))}
                    disabled={groupEnd === totalPages}
                    className="
                        sm:w-8 w-6
                        sm:h-8 h-6 
                        flex items-center justify-center text-gray-500 hover:text-black"
                >
                    {'>>'}
                </button>
            </div>
        </div>
    )
}

export default Main_Event;