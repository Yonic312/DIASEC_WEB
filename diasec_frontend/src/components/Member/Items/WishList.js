import { useEffect, useMemo, useState, useContext } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import { toast } from "react-toastify";
import { MemberContext } from "../../../context/MemberContext"; // 경로가 다르면 아래 주석 참고

const WishList = () => {
    const API = process.env.REACT_APP_API_BASE;
    const navigate = useNavigate();
    const { member } = useContext(MemberContext);

    const [items, setItems] = useState([]);
    const [loading, setLoading] = useState(true);

    const convertCategoryName = (category) => {
        if (!category) return "";

        if (category === "masterPiece") {
                return "명화";
            } else if (category === "fengShui") {
                return "풍수";
            } else if (category === "authorCollection") {
                return "작가";
            } else if (category === "photoIllustration") {
                return "사진/일러스트";
            } else if (category === "koreanPainting")  {
                return "동양화";
            } else if (category === "customFrames") {
                return "맞춤액자";  
            } 
    }

    // ✅ 페이징
    const [currentPage, setCurrentPage] = useState(1);
    const itemsPerPage = 5;

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

    // items가 바뀌면(불러오기/삭제 후) 1페이지로
    useEffect(() => {
    setCurrentPage(1);
    }, [items.length]);

    const totalPages = Math.max(1, Math.ceil(items.length / itemsPerPage));
    const currentGroup = Math.floor((currentPage - 1) / pageGroupSize);
    const groupStart = currentGroup * pageGroupSize + 1;
    const groupEnd = Math.min(groupStart + pageGroupSize - 1, totalPages);

    const currentItems = items.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
    );

    // 현재 페이지가 총 페이지보다 커지면 보정(삭제로 페이지 줄어들 때)
    useEffect(() => {
    if (currentPage > totalPages) setCurrentPage(totalPages);
    }, [totalPages, currentPage]);
    // 페이징

    // 체크된 위시 아이템 id들
    const [checked, setChecked] = useState(new Set());

    const checkedCount = checked.size;

    const fetchWishList = async () => {
        if (!member?.id) {
        setLoading(false);
        setItems([]);
        return;
        }

        try {
        setLoading(true);
        const res = await axios.get(`${API}/wishlist/list?id=${member.id}`, {
            withCredentials: true,
        });

        // 백엔드가 {list:[]} 형태면 맞춰줌
        const list = Array.isArray(res.data) ? res.data : (res.data?.list ?? []);
        setItems(list);
        } catch (e) {
        console.error(e);
        toast.error("관심상품을 불러오지 못했습니다.");
        setItems([]);
        } finally {
        setLoading(false);
        setChecked(new Set()); // 새로 불러오면 체크 초기화
        }
    };

    useEffect(() => {
        fetchWishList();
        // eslint-disable-next-line
    }, [member?.id]);

    const toggleAll = () => {
        if (items.length === 0) return;

        if (checked.size === items.length) {
        setChecked(new Set());
        } else {
        setChecked(new Set(items.map((it) => it.wid ?? it.id ?? it.pid)));
        }
    };

    const toggleOne = (key) => {
        setChecked((prev) => {
        const next = new Set(prev);
        if (next.has(key)) next.delete(key);
        else next.add(key);
        return next;
        });
    };

    const selectedItems = useMemo(() => {
        const keys = checked;
        return items.filter((it) => keys.has(it.wid ?? it.id ?? it.pid));
    }, [items, checked]);

    // ✅ 관심상품 삭제
    const deleteWish = async (it) => {
        const wid = it.wid ?? it.id; // 위시리스트 PK
        const pid = it.pid;

        if (!window.confirm("관심상품에서 삭제할까요?")) return;

        try {
            await axios.post(
                `${API}/wishlist/delete`,
                [Number(wid)],
                { 
                    withCredentials: true,
                    headers: { "Content-Type": "application/json" },
                }
            );

            toast.success("삭제되었습니다.");
            fetchWishList();
        } catch (e) {
            console.error(e);
            toast.error("삭제 실패");
        }
    };

    // ✅ 선택 장바구니 담기
    const addSelectedToCart = async () => {
        if (!member?.id) {
            toast.warn("로그인이 필요합니다.");
            navigate("/userLogin");
            return;
        }

        if (selectedItems.length === 0) {
            toast.warn("선택된 상품이 없습니다.");
            return;
        }

        try {
            const payload = {
                id: member.id,
                items: selectedItems.map((it) => ({
                pid: it.pid,
                quantity: 1,
                category: it.category,
                })),
            };

            // 후보1) /cart/insertSelected
            // 후보2) /cart/insert
            // 후보3) /cart/add
            const res = await axios.post(`${API}/cart/insertSelected`, payload, {
                withCredentials: true,
            });

            if (res.data?.success === false) {
                toast.error(res.data?.message || "장바구니 담기 실패");
                return;
            }

            toast.success("선택한 상품을 장바구니에 담았습니다.");
            navigate("/cart");
        } catch (e) {
            console.error(e);
            toast.error("장바구니 담기 실패");
        }
    };

    // ✅ 비었을 때 / 로딩
    if (loading) {
        return <div className="text-center py-20 text-gray-500">로딩 중...</div>;
    }

    if (!member?.id) {
        return (
        <div className="text-center py-20 text-gray-600">
            로그인 후 관심상품을 확인할 수 있습니다.
        </div>
        );
    }

    // 선택 삭제 함수
    const deleteSelected = async () => {
        if (!member?.id) return;

        if (selectedItems.length === 0) {
            toast.warn("선택된 상품이 없습니다.");
            return;
        }

        if (!window.confirm(`선택한 ${selectedItems.length}개를 삭제할까요?`)) return;

        // 백엔드가 List<Integer>만 받으니까 wid 리스트만 보냄
        const widList = selectedItems
            .map((it) => it.wid ?? it.id)
            .map((v) => Number(v))
            .filter((v) => Number.isFinite(v));

        if (widList.length === 0) {
            toast.error("삭제할 wid가 없습니다.");
            return;
        }

        try {
            await axios.post(`${API}/wishlist/delete`, widList, {
                withCredentials: true,
                headers: { "Content-Type" : "application/json" },
            });

            toast.success("선택한 상품을 삭제했습니다.");
            fetchWishList();
        } catch (e) {
            console.error(e);
            toast.error("선택 삭제 실패");
        }
    }

    return (
        <div className="w-full flex flex-col">
            <span className="
                md:text-xl text-[clamp(14px,2.607vw,20px)]
                font-bold pb-6">| 관심상품 조회</span>

            <div className="w-full bg-white sm:px-8 px-2 sm:py-10 py-5 shadow-md border border-gray-200 space-y-4 mb-20">
                <div className="flex items-center">
                    <div className="flex gap-2">
                        <button
                            className="
                                sm:text-sm text-[10px]
                                sm:px-3 px-2
                                sm:py-2 py-1
                                border border-gray-400 rounded-xl hover:bg-gray-100"
                            onClick={toggleAll}
                        >
                            {checkedCount === items.length && items.length > 0 ? "전체해제" : "전체선택"}
                        </button>

                        <button
                            className="
                                sm:text-sm text-[10px]
                                sm:px-3 px-2
                                sm:py-2 py-1 
                                bg-black text-white rounded-xl hover:opacity-90"
                            onClick={addSelectedToCart}
                        >
                            선택 장바구니
                        </button>

                        <button
                            className="
                                sm:text-sm text-[10px]
                                sm:px-3 px-2
                                sm:py-2 py-1 
                                border border-red-300 text-red-500 rounded-xl hover:bg-red-500 hover:text-white transition"
                            onClick={deleteSelected}
                        >
                            선택삭제
                        </button>
                    </div>
                </div>

                <div className="
                    sm:text-sm  text-[11px]
                    text-gray-500">
                    총 {items.length}개 / 선택 {checkedCount}개
                </div>

                {items.length === 0 ? (
                    <div className="text-center py-20 text-gray-500">관심상품이 없습니다.</div>
                ) : (
                    <div className="h-[430px] overflow-y-scroll space-y-2">
                    {currentItems.map((it, idx) => {
                        const key = it.wid ?? it.id ?? it.pid;
                        const isChecked = checked.has(key);

                        return (
                            <div
                                key={key ?? idx}
                                className="
                                    w-full
                                    flex items-center
                                    sm:gap-3 gap-2
                                    sm:p-3 p-2
                                    border rounded-xl bg-gray-50 hover:bg-gray-100 transition cursor-pointer"
                                onClick={() => navigate(`/none_custom_detail?pid=${it.pid}&category=${it.category}`)}
                            >
                                <input
                                    type="checkbox"
                                    checked={isChecked}
                                    onChange={() => toggleOne(key)}
                                    onClick={(e) => {
                                        e.stopPropagation();
                                    }}
                                    className="
                                        sm:w-4 w-3
                                        sm:h-4 h-3
                                    "
                                />

                                <img
                                    src={it.thumbnail}
                                    alt={it.title}
                                    className="
                                        sm:w-20 w-12
                                        sm:h-20 h-12
                                        object-cover rounded-lg border bg-white cursor-pointer"
                                />
                                
                                <div className="flex-1 min-w-0">
                                    <div className="flex items-start justify-between gap-2">
                                        <div className="min-w-0">
                                        {/* 제목 */}
                                        <p className="
                                            sm:text-base text-[12.5px]
                                            font-semibold 
                                            text-gray-800 truncate">{it.title}</p>
                                        {/* 내용 */}
                                        <p className="
                                            sm:text-sm text-[10.5px]
                                            text-gray-500 mt-1">
                                            {convertCategoryName(it.category || "")} {it.author ? `· ${it.author}` : ""}
                                        </p>
                                        </div>
                                        <button
                                            className="
                                                shrink-0
                                                sm:text-xs text-[10px]
                                                px-2 py-1 border border-red-300 text-red-500 rounded-lg hover:bg-red-500 hover:text-white transition"
                                            onClick={(e) => {
                                                e.stopPropagation();
                                                deleteWish(it)
                                            }}
                                        >
                                        삭제
                                        </button>
                                    </div>

                                    <div className="mt-2 flex items-end justify-between">
                                        <div className="text-sm text-gray-600">
                                        {it.size ? `사이즈: ${it.size}` : ""}
                                        </div>
                                        {/* <div className="font-bold text-gray-800">
                                        {Number(it.price || 0).toLocaleString()}원
                                        </div> */}
                                    </div>
                                </div>
                            </div>
                        );
                    })}
                    </div>
                )}
                <div
                    className="
                        md:text-sm text-[clamp(10px,1.8252vw,14px)]
                        flex justify-center items-center sm:gap-2 gap-[1px] mt-6"
                >
                    <button
                        onClick={() => setCurrentPage(Math.max(1, groupStart - pageGroupSize))}
                        disabled={groupStart === 1}
                        className="
                        sm:w-8 w-6
                        sm:h-8 h-6
                        flex items-center justify-center text-gray-500 hover:text-black disabled:opacity-30"
                    >
                        {"<<"}
                    </button>

                    <button
                        onClick={() => setCurrentPage((prev) => Math.max(1, prev - 1))}
                        disabled={currentPage === 1}
                        className="
                        sm:w-8 w-6
                        sm:h-8 h-6
                        flex items-center justify-center text-gray-500 hover:text-black disabled:opacity-30"
                    >
                        {"<"}
                    </button>

                    {Array.from({ length: groupEnd - groupStart + 1 }, (_, i) => groupStart + i).map(
                        (page) => (
                        <button
                            key={page}
                            onClick={() => setCurrentPage(page)}
                            className={`
                            sm:w-8 w-6
                            sm:h-8 h-6
                            flex items-center justify-center rounded-full ${
                                currentPage === page
                                ? "bg-black text-white"
                                : "text-gray-700 hover:bg-gray-100"
                            }`}
                        >
                            {page}
                        </button>
                        )
                    )}

                    <button
                        onClick={() => setCurrentPage((prev) => Math.min(totalPages, prev + 1))}
                        disabled={currentPage === totalPages}
                        className="
                        sm:w-8 w-6
                        sm:h-8 h-6
                        flex items-center justify-center text-gray-500 hover:text-black disabled:opacity-30"
                    >
                        {">"}
                    </button>

                    <button
                        onClick={() => setCurrentPage(Math.min(totalPages, groupStart + pageGroupSize))}
                        disabled={groupEnd === totalPages}
                        className="
                        sm:w-8 w-6
                        sm:h-8 h-6
                        flex items-center justify-center text-gray-500 hover:text-black disabled:opacity-30"
                    >
                        {">>"}
                    </button>
                </div>
            </div>
        </div>
    );
};

export default WishList;
