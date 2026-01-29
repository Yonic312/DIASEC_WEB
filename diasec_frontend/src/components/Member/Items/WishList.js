import { useEffect, useMemo, useState, useContext } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import { toast } from "react-toastify";
import { MemberContext } from "../../../context/MemberContext"; // 경로가 다르면 아래 주석 참고

// ⚠️ MemberContext 경로가 프로젝트 구조상 다를 수 있음
// 예) 현재 WishList.js 위치가: src/components/Member/Items/WishList.js 라면
// import { MemberContext } from "../../../context/MemberContext"; 가 맞을 가능성 큼.
// 에러나면 이 줄만 경로 맞춰서 바꿔.

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
        // 너가 말한 흐름: WishList에서 “선택 장바구니” -> Cart.jsx 연결
        // 보통은 선택된 pid 목록을 백엔드로 보내서 cart에 insert

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
        <div className="w-full bg-white sm:px-8 px-2 sm:py-10 py-5 shadow-md border border-gray-200 space-y-4 mb-20">
        <div className="flex items-center justify-between">
            <h2 className="xl:text-2xl text-lg font-bold">관심상품</h2>

            <div className="flex gap-2">
                <button
                    className="px-3 py-2 text-sm border border-gray-400 rounded-xl hover:bg-gray-100"
                    onClick={toggleAll}
                >
                    {checkedCount === items.length && items.length > 0 ? "전체해제" : "전체선택"}
                </button>

                <button
                    className="px-3 py-2 text-sm bg-black text-white rounded-xl hover:opacity-90"
                    onClick={addSelectedToCart}
                >
                    선택 장바구니
                </button>

                <button
                    className="px-3 py-2 text-sm border border-red-300 text-red-500 rounded-xl hover:bg-red-500 hover:text-white transition"
                    onClick={deleteSelected}
                >
                    선택삭제
                </button>
            </div>
        </div>

        <div className="text-sm text-gray-500">
            총 {items.length}개 / 선택 {checkedCount}개
        </div>

        {items.length === 0 ? (
            <div className="text-center py-20 text-gray-500">관심상품이 없습니다.</div>
        ) : (
            <div className="h-[430px] overflow-y-scroll space-y-2">
            {items.map((it, idx) => {
                const key = it.wid ?? it.id ?? it.pid;
                const isChecked = checked.has(key);

                return (
                    <div
                        key={key ?? idx}
                        className="flex items-center gap-3 border rounded-xl p-3 bg-gray-50 hover:bg-gray-100 transition cursor-pointer"
                        onClick={() => navigate(`/none_custom_detail?pid=${it.pid}&category=${it.category}`)}
                    >
                        <input
                            type="checkbox"
                            checked={isChecked}
                            onChange={() => toggleOne(key)}
                            className="w-4 h-4"
                        />

                        <img
                            src={it.thumbnail}
                            alt={it.title}
                            className="w-20 h-20 object-cover rounded-lg border bg-white cursor-pointer"
                        />
                        
                        <div className="flex-1 min-w-0">
                            <div className="flex items-start justify-between gap-2">
                                <div className="min-w-0">
                                <p className="font-semibold text-gray-800 truncate">{it.title}</p>
                                <p className="text-sm text-gray-500 mt-1">
                                    {convertCategoryName(it.category || "")} {it.author ? `· ${it.author}` : ""}
                                </p>
                                </div>
                                <button
                                    className="px-2 py-1 text-xs border border-red-300 text-red-500 rounded-lg hover:bg-red-500 hover:text-white transition"
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
        </div>
    );
};

export default WishList;
