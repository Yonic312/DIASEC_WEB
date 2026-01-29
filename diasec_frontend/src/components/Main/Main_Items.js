import { useEffect, useState, useRef } from 'react';
import { useLocation, useNavigate } from "react-router-dom";
import axios from 'axios';
import pic_author from '../../assets/collections/author.png';
import pic_photoIllustration from '../../assets/collections/photoIllustration.png'
import pic_fungShui from '../../assets/collections/fungShui.png';

const Main_Items = () => {
    const API = process.env.REACT_APP_API_BASE;
    const location = useLocation();
    const navigate = useNavigate();
    const queryParams = new URLSearchParams(location.search);

    const author = queryParams.get("author");
    const type = queryParams.get("type");

    // 작가 목록 순서 상태
    const [sortMode, setSortMode] = useState('popular'); // 'popular' | 'name'

    let title = "";
    let pic = "";

    // 동양화 상단 미니 셀렉터 바로 들어감
    const DIRECT_AUTHOR_PERIODS = new Set(["기타작가", "민화", "만화", "불교"]);

    // 경로에 따라 제목 변경
    if(type === "masterPiece") {
        title = "명화갤러리";
    } else if (type === "koreanPainting") { 
        title = "동양화";
    } else if(type === "fengShui") {
        title = "풍수";
        pic = pic_fungShui;
    } else if(type === "authorCollection") {
        title = "작가 컬렉션";
        pic = pic_author;
    } else if (type === "photoIllustration") {
        title = "사진/일러스트"
        pic = pic_photoIllustration;
    } else {
        title = "오류"
    }

    // 무한 스크롤
    const PAGE_SIZE = 15;

    // author(작가/전체보기) 상품 무한스크롤
    const [authorProducts, setAuthorProducts] = useState([]);
    const [authorPage, setAuthorPage] = useState(0);
    const [authorHasMore, setAuthorHasMore] = useState(true);
    const [authorLoading, setAuthorLoading] = useState(false);
    const authorReqIdRef = useRef(0);
    const authorLoadMoreRef = useRef(null);

    // 홈(사진/일러스트, 풍수, 작가컬렉션) 상품 무한스크롤
    const [homeProducts, setHomeProducts] = useState([]);
    const [homePage, setHomePage] = useState(0);
    const [homeHasMore, setHomeHasMore] = useState(true);
    const [homeLoading, setHomeLoading] = useState(false);
    const homeReqIdRef = useRef(0);
    const homeLoadMoreRef = useRef(null);

    // 무한 스크롤 sentinel
    const [selectedPeriod, setSelectedPeriod] = useState(''); // 시대
    const [labels, setLabels] = useState([]);
    const [selectedLabel, setSelectedLabel] = useState(author || '');


    const [authorSearch, setAuthorSearch] = useState(''); // 작가 검색창
    const [titleSearch, setTitleSearch] = useState(''); // 제목 검색창

    // 라벨(작가 카드) 무한스크롤
    const [labelPage, setLabelPage] = useState(0);
    const [labelLoading, setLabelLoading] = useState(false);
    const [labelHasMore, setLabelHasMore] = useState(true);
    const labelLoadMoreRef = useRef(null);

    useEffect(() => {
        homeReqIdRef.current += 1;
        authorReqIdRef.current += 1;

        // 라벨 리스트는 type 바뀌면 초기화
        setLabels([]);
        setLabelPage(0);
        setLabelHasMore(true);
        setLabelLoading(false);

        // 홈 상품 무한스크롤 초기화
        setHomeProducts([]);
        setHomePage(0);
        setHomeHasMore(true);
        setHomeLoading(false);

        // author 상품 무한스크롤 초기화
        setAuthorProducts([]);
        setAuthorPage(0);
        setAuthorHasMore(true);
        setAuthorLoading(false);

        window.scrollTo({ top: 0, behavior: "auto" });
    }, [type]);

    useEffect(() => {
        if (!author) return;
        setAuthorProducts([]);
        setAuthorPage(0);
        setAuthorHasMore(true);
        setAuthorLoading(false);
    }, [author]);

    // 상단 미니용 라벨 가져오기
    const [miniLabels, setMiniLabels] = useState([]);

    // 상단 미니 라벨은 항상 전체 로딩
    useEffect(() => {
        if (!type) return;

        axios.get(`${API}/collections/labels`, {
            params: { type, size: 9999, offset: 0 }
        })
        .then(res => setMiniLabels(res.data ?? []))
        .catch(err => {
            console.error("상단 미니 라벨 불러오기 실패", err);
            setMiniLabels([]);
        });
    }, [type]);

    // 상단 미니 라벨 렌더링
    const miniFilteredLabels = miniLabels.filter(item => {
        const matchesPeriod = !selectedPeriod || item.times === selectedPeriod;
        const matchesSearch = item.label.toLowerCase().includes(authorSearch.toLowerCase());
        return matchesPeriod && matchesSearch;
    });

    const miniSortedLabels = [...miniFilteredLabels].sort((a, b) => {
        if (sortMode === 'popular') {
            const ao = Number(a.sortOrder);
            const bo = Number(b.sortOrder);

            const aHas = ao > 0;
            const bHas = bo > 0;

            if (aHas && !bHas) return -1;
            if (!aHas && bHas) return 1;

            if (aHas && bHas && ao !== bo) return ao - bo;

            const c = Number(b.count ?? 0) - Number(a.count ?? 0);
            if (c !== 0) return c;

            return a.label.localeCompare(b.label, 'ko');
        }
        return a.label.localeCompare(b.label, 'ko');
    });

    // 타입이 바뀌면 초기화
    useEffect(() => {
        if (!["masterPiece", "koreanPainting"].includes(type)) return;
        if (author) return;

        setLabelPage(0);
    }, [type, author]);

    const labelReqIdRef = useRef(0);

    useEffect(() => {
        labelReqIdRef.current += 1;
    }, [type]);
 
    // 라벨 목록 가져오기 (page 기반)
    useEffect(() => {
        if (!type) return;

        // 명화 홈(작가 카드)에서만 라벨 무한스크롤
        if (!["masterPiece", "koreanPainting"].includes(type)) return;
        if (author) return;
        if (!labelHasMore) return;

        const reqId = ++labelReqIdRef.current;

        const fetchLabels = async () => {
            setLabelLoading(true);
            try {
                const offset = labelPage * PAGE_SIZE;
                const res = await axios.get(`${API}/collections/labels`, {
                    params: { type, size: PAGE_SIZE, offset }
                });
                
                if (reqId !== labelReqIdRef.current) return;

                const list = res.data ?? [];
                setLabels(prev => [...prev, ...list]);
                if (list.length < PAGE_SIZE) setLabelHasMore(false);
            } catch (e) {;
                setLabelHasMore(false);
            } finally {
                if (reqId === labelReqIdRef.current) setLabelLoading(false);
            }
        };

        fetchLabels();
    }, [type, author, labelPage, labelHasMore, API]);

    useEffect(() => {
        const el = labelLoadMoreRef.current;
        if (!el) return;

        if (!["masterPiece", "koreanPainting"].includes(type)) return;
        if (author) return;

        const obs = new IntersectionObserver(([entry]) => {
            if (!entry.isIntersecting) return;

            if (labelLoading || !labelHasMore) return;
            
            if (labels.length === 0) return;
            
            setLabelPage(p => p + 1);
        }, {threshold: 0.2 });

        obs.observe(el);
        return () => obs.disconnect();
    }, [type, author, labelLoading, labelHasMore, labels.length]);

    // 작가가 선택되면 상품을 가져옴 (page 기반)
    useEffect(() => {
        if (!type || !author) return;
        if (!authorHasMore) return;

        const reqId = ++authorReqIdRef.current;

        const fetchAuthorProducts = async () => {
            setAuthorLoading(true);
        
            try {
                const decoded = decodeURIComponent(author);
                setSelectedLabel(decoded);

                const offset = authorPage * PAGE_SIZE;
                const isAll = decoded === "ALL";

                const url = isAll ? `${API}/product/list/paged` : `${API}/product/filter/paged`;
                const params = isAll
                    ? { category: type, size: PAGE_SIZE, offset }
                    : { category: type, author: decoded, size: PAGE_SIZE, offset };

                const res = await axios.get(url, { params });
            
                if (reqId !== authorReqIdRef.current) return;

                const list = res.data ?? [];

                setAuthorProducts(prev => {
                    const seen = new Set(prev.map(p => p.pid));
                    const next = [...prev];
                    for (const p of list) if (!seen.has(p.pid)) next.push(p);
                    return next;
                });

              if (list.length < PAGE_SIZE) setAuthorHasMore(false);
            } catch (e) {
                if (reqId !== authorReqIdRef.current) return;
                console.error("author 상품(paged) 로드 실패", e);
                setAuthorHasMore(false);
            } finally {
                if (reqId === authorReqIdRef.current) setAuthorLoading(false);
            }
        };
    
        fetchAuthorProducts();
    }, [type, author, API, authorPage, authorHasMore]);

    const handleLabelClick = (label) => {
        setTitleSearch('');
        navigate(`/main_Items?type=${type}&author=${encodeURIComponent(label)}`);
    }

    const q = titleSearch.trim().toLowerCase();

    const filteredAuthorProducts = !q
        ? authorProducts
        : authorProducts.filter(p => (p.title ?? "").toLowerCase().includes(q));

    const filteredHomeProducts = !q
        ? homeProducts
        : homeProducts.filter(p => (p.title ?? "").toLowerCase().includes(q));

    // 검색 중이면 전부 보여주고, 검색 아닐 때만 visibleCount 적용
    const displayProducts = 
        author 
        ? filteredAuthorProducts
        : (["masterPiece", "koreanPainting"].includes(type) ? [] : filteredHomeProducts);

    useEffect(() => {
        setTitleSearch('');
    }, [type]);

    useEffect(() => {
        if (!type || !author) return;

        const el = authorLoadMoreRef.current;
        if (!el) return;

        const obs = new IntersectionObserver(([entry]) => {
            if (!entry.isIntersecting) return;
            if (authorLoading || !authorHasMore) return;
            if (authorProducts.length === 0) return;
                
            setAuthorPage(p => p + 1);
        }, { threshold: 0.2});

        obs.observe(el);
        return () => obs.disconnect();
    }, [type, author, authorLoading, authorHasMore, authorProducts.length]);

    useEffect(() => {
        if (!author) return;
        window.scrollTo({ top: 0, behavior: "auto"});
    }, [author]);

    // 마우스 호버 상태 저장(img)
    const [hoveredPid, setHoveredPid] = useState(null);

    // 작가 목록 가져오기
    const filteredLabels = labels.filter(item => {
        const matchesPeriod = !selectedPeriod || item.times === selectedPeriod;
        const matchesSearch = item.label.toLowerCase().includes(authorSearch.toLowerCase());
        return matchesPeriod && matchesSearch;
    });

    const sortedLabels = [...filteredLabels].sort((a, b) => {
        if (sortMode === 'popular') {
            const ao = Number(a.sortOrder);
            const bo = Number(b.sortOrder);

            const aHas = ao > 0;
            const bHas = bo > 0;

            // sortOrder 있는 것 먼저
            if (aHas && !bHas) return -1;
            if (!aHas && bHas) return 1;

            // 둘 다 있으면 sortOrder 오름차순
            if (aHas && bHas && ao !== bo) return ao - bo;

            // count 내림차순
            const c = Number(b.count ?? 0) - Number(a.count ?? 0);
            if (c !== 0) return c;

            // 가나다
            return a.label.localeCompare(b.label, 'ko');
        }

        return a.label.localeCompare(b.label, 'ko');
    });

    const authorCards = sortedLabels.map(item => ({
        label: item.label,
        img: item.imageUrl,
        link: `/main_Items?type=${type}&author=${encodeURIComponent(item.label)}`,
        count: item.count,
        sortOrder: item.sortOrder
    }));

    // 상품 갯수 가져오기
    const [totalCount, setTotalCount] = useState(0);

    useEffect(() => {
        if (!type || !author) return;

        setLabels([]);
            setLabelPage(0);
            setLabelHasMore(true);
            setLabelLoading(false);

        axios.get(`${API}/product/count/author`, {
            params: { category: type, author: decodeURIComponent(author) }
        })
        .then(res => setTotalCount(res.data ?? 0))
        .catch(() => setTotalCount(0));
    }, [type, author]);

    useEffect(() => {
        if (!author) {
            setSelectedLabel('');
            setTitleSearch('');
            setAuthorSearch('');
            setSelectedPeriod('');
            setSortMode('popular');
        }
    }, [author]);

    useEffect(() => {
        if (!type) return;
        if (author) return;

        // 명화/동양화는 라벨 카드 구조니까 홈상품 로딩 안 함
        if (["masterPiece", "koreanPainting"].includes(type)) return;
        if (!homeHasMore) return;

        const reqId = ++homeReqIdRef.current;

        const fetchHomePaged = async () => {
            setHomeLoading(true);
            try {
                const offset = homePage * PAGE_SIZE;

                const res = await axios.get(`${API}/product/list/paged`, {
                    params: { category: type, size: PAGE_SIZE, offset }
                });

                if (reqId !== homeReqIdRef.current) return;

                const list = res.data ?? [];

                setHomeProducts(prev => {
                    const seen = new Set(prev.map(p => p.pid));
                    const next = [...prev];
                    for (const p of list) if (!seen.has(p.pid)) next.push(p);
                    return next;
                });

                if (list.length < PAGE_SIZE) setHomeHasMore(false);
            } catch (e) {
                if (reqId !== homeReqIdRef.current) return;
                console.error("홈 상품 로드 실패", e);
                setHomeHasMore(false);
            } finally {
                if (reqId === homeReqIdRef.current) setHomeLoading(false);
            }
        };

        fetchHomePaged();
    }, [type, author, API, homePage, homeHasMore]);

    useEffect(() => {
        if (!type) return;
        if (author) return;
        if (["masterPiece", "koreanPainting"].includes(type)) return;

        const el = homeLoadMoreRef.current;
        if(!el) return;

        const obs = new IntersectionObserver(([entry]) => {
            if (!entry.isIntersecting) return;
            if (homeLoading || !homeHasMore) return;
            if (homeProducts.length === 0) return;

            setHomePage(p => p + 1);
        }, { threshold: 0.2 });

        obs.observe(el);
        return () => obs.disconnect();
    }, [type, author, homeLoading, homeHasMore, homeProducts.length]);

    const displayCount = author ? filteredAuthorProducts.length : 0;

    return (
        <div>
            {/* 상단 이미지 + 문구 (명화 제외) */}
            {/* {pic !== "" &&(
                (() => {
                    const HERO_TEXT_MAP = {
                        fengShui: [
                            "벽에 걸린 그림이 단순한 장식이 아닌,",
                            "집안 가득 행운과 풍요를 불러오는 힘이 되어줍니다",
                        ],
                        photoIllustration: [
                            "사진은 기억을, 일러스트는 감성을",
                            "담아내어 당신의 일상에 스며듭니다",
                        ],
                        authorCollection: [
                            "작가의 손끝에서 태어난 영감이",
                            "시간과 공간을 넘어 당신에게 닿습니다"
                        ],
                    };

                    const heroLines = HERO_TEXT_MAP[type];

                    return(
                        <div className='w-full aspect-[1300/400] relative'>
                            {heroLines && (
                                <div 
                                    className='
                                        absolute top-[50%] left-1/2 transform -translate-x-1/2 -translate-y-1/2 text-white text-center font-semibold 
                                        lg:text-4xl md:text-[clamp(24px,3.519vw,36px)] text-[clamp(14px,3.128vw,24px)]'
                                    style={{ textShadow: '3px 3px 8px rgba(0,0,0,0.8)' }}
                                >    
                                    <p className="lg:mb-[8px] md:mb-[clamp(2px,0.782vw,8px)] ">
                                        디아섹 컬렉션
                                    </p>
                                    <div className="
                                        space-y-0 leading-tight
                                        lg:text-[22px] md:text-[clamp(16px,2.15vw,22px)] text-[clamp(9px,2.151vw,16.5px)]">
                                        {heroLines.map((line, idx) => (
                                            <p key={idx}>{line}</p>
                                        ))}
                                    </div>
                                </div>
                            )}
                            <img src={pic} alt="" />
                        </div>
                    );
                })()
            )} */}

            {/* 페이지 제목 */}
            <div className="flex justify-center mt-[40px] text-[#cfab88]">
                <span className="md:text-3xl text-xl font-bold">{selectedLabel ?  selectedLabel : title}</span>
            </div>

            {/* 메인 홈 (명화) */}
            {!author && (
                <>  
                    {/* 상단 미니  (명화) */}
                        <div className="mb:mt-[60px] md:mr-[4px]">
                            <div className='flex items-end justify-between mb-2 pb-1 border-b-[1px]'>
                                <div>
                                    <span
                                        className={`cursor-pointer ${sortMode === 'popular' ? 'font-bold text-black' : 'text-gray-500'}`}
                                        onClick={() => setSortMode('popular')}
                                    >
                                        인기순
                                    </span>
                                    <span 
                                        className={`ml-2 cursor-pointer ${sortMode === 'name' ? 'font-bold text-black' : 'text-gray-500'}`}
                                        onClick={() => setSortMode('name')}    
                                    >
                                        가나다순
                                    </span>
                                </div>
                                <div className='relative md:w-[240px]'>
                                    <input 
                                        type="text"
                                        placeholder="작가 이름을 검색하세요"
                                        value={authorSearch}
                                        onChange={(e) => setAuthorSearch(e.target.value)}
                                        className='
                                            w-full pl-10 pr-4 py-[6px] rounded-full border border-gray-300 
                                            focus:outline-none focus:ring-2 focus:ring-[#D0AC88]
                                            md:text-sm text-[clamp(11px,1.8252vw,14px)]'
                                    />
                                    <svg className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-4.35-4.35m0 0A7.5 7.5 0 103.75 3.75a7.5 7.5 0 0012.9 12.9z"></path>
                                    </svg>
                                </div>
                            </div>
                        {/* 시대 */}
                        {type === "masterPiece" && (
                            <div 
                                className='
                                    sm:text-base text-[clamp(14px,2.503vw,16px)]
                                    flex overflow-x-auto no-scrollbar whitespace-nowrap md:gap-5 gap-3 text-gray-600 mb-1'>
                                {[
                                    "전체", "르네상스", "베네치아파", "바로크", "로코코", "신고전주의", "낭만주의", "사실주의", "인상주의", "신인상주의", "후기인상주의", "근대미술"
                                ].map((period, idx) => (
                                    <button
                                        key={idx}
                                        onClick={() => {
                                            setSelectedPeriod(period === "전체" ? "" : period);
                                            setSelectedLabel('');
                                        }}
                                        className={`pb-[2px] font-medium ${
                                            (selectedPeriod === "" && period === "전체") || selectedPeriod === period 
                                            ? 'text-black border-black border-b-2' 
                                            : 'border-transparent' }
                                            border-b-2 hover:border-black hover:text-black transition`}
                                    >
                                        {period}
                                    </button>
                                ))}
                            </div>
                        )}

                        {type === "koreanPainting" && (
                            <div 
                                className='
                                    sm:text-base text-[clamp(14px,2.503vw,16px)]
                                    flex overflow-x-auto no-scrollbar whitespace-nowrap md:gap-5 gap-3 text-gray-600 mb-1'>
                                {[
                                    "전체", "조선 전기", "조선 후기", "기타작가", "민화", "불교"
                                ].map((period, idx) => (
                                    <button
                                        key={idx}
                                        onClick={() => {
                                            if (DIRECT_AUTHOR_PERIODS.has(period)) {
                                                setSelectedPeriod('');
                                                setSelectedLabel(period);
                                                setAuthorSearch('');
                                                setTitleSearch('');
                                                navigate(`/main_Items?type=${type}&author=${encodeURIComponent(period)}`);
                                                return;
                                            }

                                            setSelectedPeriod(period === "전체" ? "" : period);
                                            setSelectedLabel('');
                                        }}
                                        className={`pb-[2px] font-medium ${
                                            (selectedPeriod === "" && period === "전체") || selectedPeriod === period 
                                            ? 'text-black border-black border-b-2' 
                                            : 'border-transparent' }
                                            border-b-2 hover:border-black hover:text-black transition`}
                                    >
                                        {period}
                                    </button>
                                ))}
                            </div>
                        )}
                        </div>

                    {/* 상단 미니 컬렉션 셀렉터 */}
                    {['masterPiece', 'koreanPainting', 'fengShui', 'authorCollection', 'photoIllustration'].includes(type) && (
                        <div 
                            className='
                                lg:grid-cols-6 md:grid-cols-4 grid-cols-2
                                text-[13px]
                                mt-2 font-normal w-full grid border-t border-l border-black border-opacity-10
                                max-h-[121px] overflow-y-auto scrollbar-thin scrollbar-thumb-gray-300'
                        >
                            {miniSortedLabels.length === 0 ? (
                                <div>라벨이 없습니다.</div>
                            ) : (
                                miniSortedLabels.map((item, index) => (
                                    <div
                                        key={index}
                                        className='flex items-center px-1 justify-start h-10 border-r border-b border-black border-opacity-10 hover:bg-[#555555] hover:text-white'
                                        onClick={() => handleLabelClick(item.label)}
                                    >
                                        {item.label}
                                        <span className='text-gray-400'>&nbsp;({item.count})</span>
                                    </div>
                                ))
                            )}
                        </div>
                    )}
                </>
            )}

            {/* ------------- △ 상단 미니 셀렉터 ------------- */}

            {!["masterPiece", "koreanPainting"].includes(type) && !author && (
                <div className='flex md:justify-end justify-center mt-3'>
                    <div className='relative md:w-[240px] md:mr-[4px]'>
                        <input 
                            type="text"
                            placeholder="상품명을 검색하세요"
                            value={titleSearch}
                            onChange={(e) => setTitleSearch(e.target.value)}
                            className='
                                w-full pl-10 pr-4 py-[6px] rounded-full border border-gray-300 
                                focus:outline-none focus:ring-2 focus:ring-[#D0AC88]
                                md:text-sm text-[clamp(11px,1.8252vw,14px)]'
                        />
                        <svg className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" 
                            fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" 
                                d="M21 21l-4.35-4.35m0 0A7.5 7.5 0 103.75 3.75a7.5 7.5 0 0012.9 12.9z">
                            </path>
                        </svg>
                    </div>
                </div>
            )}
            
            {/* 명화 메인홈 작가 목록 (여기수정)*/}
            {(type === 'masterPiece' || type === 'koreanPainting') && !author && (
                <div className="max-w-[1300px] mx-auto px-2 mt-6 grid xl:grid-cols-5 md:grid-cols-4 sm:grid-cols-3 grid-cols-2 gap-[20px]">
                    {authorCards.map(item => (
                        <div
                            key={item.label}
                            onClick={() => navigate(item.link)}
                            className="flex flex-col items-center border border-gray-300 rounded-xl cursor-pointer overflow-hidden hover:opacity-80 hover:shadow-lg"
                        >
                        <img 
                            src={item.img}
                            alt={item.label}
                            className="w-full aspect-[220/220] object-cover border-b border-gray-200"
                        />
                        <div className="py-2 text-center font-bold text-sm">
                            {item.label}
                            <span className='text-gray-40 font-normal'>({item.count})</span>
                        </div>
                        
                        </div>
                    ))}
                </div>
            )}

            {(type === 'masterPiece' || type === 'koreanPainting') && !author && (
                <>
                    <div ref={labelLoadMoreRef} className="h-10" />
                    {labelLoading && <div className="text-center py-4">로딩중...</div>}
                </>
            )}

            {/* 메인 클릭 리스트 */}
            {author && (
                <>  
                    <div className="flex gap-2">
                        <span className="font-bold">인기순</span>
                        <button
                            onClick={() => {
                                setSelectedLabel('');
                                navigate(`/main_Items?type=${type}`);
                            }}
                        >
                            {(type === "masterPiece" || type === "authorCollection" || type === "koreanPainting") ? "다른작가 보기" : "다른작품 보기"}
                        </button>
                    </div>
                    
                    <div className="flex justify-between mt-1"> 
                        <div 
                            className="
                                md:text-sm text-[clamp(11px,1.8252vw,14px)]
                                text-[#CDC9C3]"> 상품 <span className="text-[#555555]">{displayCount}</span>개
                        </div>
                        
                        <div className='flex md:justify-end justify-center'>
                            <div className='relative md:w-[240px] md:mr-[4px]'>
                                <input 
                                    type="text"
                                    placeholder="상품명을 검색하세요"
                                    value={titleSearch}
                                    onChange={(e) => setTitleSearch(e.target.value)}
                                    className='
                                        w-full pl-10 pr-4 py-[6px] rounded-full border border-gray-300 
                                        focus:outline-none focus:ring-2 focus:ring-[#D0AC88]
                                        md:text-sm text-[clamp(11px,1.8252vw,14px)]'
                                />
                                <svg className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" 
                                    fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" 
                                        d="M21 21l-4.35-4.35m0 0A7.5 7.5 0 103.75 3.75a7.5 7.5 0 0012.9 12.9z">
                                    </path>
                                </svg>
                            </div>
                        </div>
                    </div>
                </>
            )}

            {/* NO 명화홈 클릭 리스트 */}
            {((type=='masterPiece' && author) || type!='masterPiece') && (
                <>
                    <div className="grid lg:grid-cols-4 md:grid-cols-3 grid-cols-2 md:gap-y-10 md:gap-x-[0.1%] gap-x-[5%] mt-5 px-4">
                        {displayProducts.map((product) => {
                            const isHoverd = hoveredPid === product.pid;

                            return (
                                <div
                                    key={product.pid}
                                    onClick={() => navigate(`${type == 'clock' ? '/clock_detail' : '/none_custom_detail'}?pid=${product.pid}&category=${product.category}`)}
                                    className="flex flex-col 
                                            lg:px-4 md:px-2 px-[2px]
                                            w-full/4
                                            h-auto md:mb-10 mb-2 cursor-pointer"
                                    onMouseEnter={() => setHoveredPid(product.pid)}
                                    onMouseLeave={() => setHoveredPid(null)}
                                >   
                                    {/* 기본 이미지 */}
                                    <div className="
                                                flex justify-center items-center w-full aspect-[292/292] overflow-hidden 
                                                bg-white">
                                        <div className="w-full h-full">
                                            <img 
                                                className="h-[100%] w-[100%] object-contain"
                                                style={{ boxShadow: '8px 8px 10px rgba(0,0,0,0.2)'}} 
                                                src={isHoverd ? product.hoverImageUrl : product.imageUrl} 
                                                alt={product.title} 
                                            />
                                        </div>
                                    </div>

                                    <span className="
                                            lg:text-[18px] text-[clamp(16px,1.759vw,18px)]
                                            line-clamp-1
                                            font-bold mt-2">{product.title}</span>
                                        <span className="
                                            lg:text-[14px] text-[clamp(13.5px,1.368vw,14px)]
                                            line-clamp-1
                                            font-bold text-[#83807d]">{product.author}</span>
                                    <hr className="my-1" />
                                </div>
                            );
                        })}
                    </div>
                    {author && (
                        <>
                            <div ref={authorLoadMoreRef} className="h-10" />
                            {authorLoading && <div className="text-center py-4">로딩중...</div>}
                        </>
                    )}
                    
                    {!author && !["masterPiece", "koreanPainting"].includes(type) && (
                        <>
                            <div ref={homeLoadMoreRef} className="h-10" />
                            {homeLoading && <div className="text-center py-4">로딩중...</div>}
                        </>
                    )}
                </>
            )}
        </div>
    );
};

export default Main_Items;
