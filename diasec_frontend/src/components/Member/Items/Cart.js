import { useEffect, useMemo, useState, useContext } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import { toast } from "react-toastify";
import { MemberContext } from "../../../context/MemberContext";

const Cart = () => {
    const API = process.env.REACT_APP_API_BASE;
    const navigate = useNavigate();
    const { member } = useContext(MemberContext);

    const [items, setItems] = useState([]);
    const [loading, setLoading] = useState(true);

    // 체크박스(선택주문용으로만 사용: 백엔드 선택삭제 API 없음)
    const [checked, setChecked] = useState(new Set());

    const getKey = (it) => it.cid; // CartController delete?cid, update CartVo -> cid가 PK

    const fetchCart = async () => {
        if (!member?.id) {
            setItems([]);
            setChecked(new Set());
            setLoading(false);
            return;
        }

        try {
            setLoading(true);
            const res = await axios.get(`${API}/cart/list?id=${member.id}`, {
                withCredentials: true,
        });

        const list = Array.isArray(res.data) ? res.data : (res.data?.list ?? []);
            setItems(list);
            setChecked(new Set());
        } catch (e) {
            console.error(e);
            toast.error("장바구니를 불러오지 못했습니다.");
            setItems([]);
            setChecked(new Set());
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchCart();
        // eslint-disable-next-line
    }, [member?.id]);

    const toggleAll = () => {
        if (items.length === 0) return;

        if (checked.size === items.length) {
            setChecked(new Set());
        } else {
            setChecked(new Set(items.map((it) => getKey(it))));
        }
    };

    const toggleOne = (cid) => {
        setChecked((prev) => {
        const next = new Set(prev);
        if (next.has(cid)) next.delete(cid);
        else next.add(cid);
        return next;
        });
    };

    const selectedItems = useMemo(() => {
        return items.filter((it) => checked.has(getKey(it)));
    }, [items, checked]);

    // ✅ 수량 변경: PUT /api/cart/update  (CartVo: cid, quantity)
    const updateQty = async (it, nextQty) => {
        const cid = getKey(it);
        const qty = Number(nextQty);

        if (!Number.isFinite(qty) || qty < 1) return;

        // UI 먼저 반영
        setItems((prev) => prev.map((x) => (getKey(x) === cid ? { ...x, quantity: qty } : x)));

        try {
        await axios.put(
            `${API}/cart/update`,
            { cid, quantity: qty },
            { withCredentials: true }
        );
        } catch (e) {
            console.error(e);
            toast.error("수량 변경 실패");
            fetchCart(); // 롤백
        }
    };

    // ✅ 단일 삭제: DELETE /api/cart/delete?cid=
    const deleteOne = async (it) => {
        const cid = getKey(it);

        if (!window.confirm("해당 상품을 장바구니에서 삭제할까요?")) return;

        try {
        await axios.delete(`${API}/cart/delete?cid=${cid}`, {
            withCredentials: true,
        });
            toast.success("삭제 완료");
            fetchCart();
        } catch (e) {
            console.error(e);
            toast.error("삭제 실패");
        }
    };

    // ✅ 선택 삭제(백엔드에 API 없으니 반복 DELETE로 처리)
    const deleteSelected = async () => {
        if (selectedItems.length === 0) {
            toast.warn("선택된 상품이 없습니다.");
        return;
        }

        if (!window.confirm(`선택한 ${selectedItems.length}개를 삭제할까요?`)) return;

        try {
        // 순차 삭제 (서버 부담 줄이고 에러 추적 쉬움)
        for (const it of selectedItems) {
            const cid = getKey(it);
            await axios.delete(`${API}/cart/delete?cid=${cid}`, { withCredentials: true });
        }
            toast.success("선택 삭제 완료");
            fetchCart();
        } catch (e) {
            console.error(e);
            toast.error("선택 삭제 실패");
            fetchCart();
        }
    };

    // ✅ 선택 주문: OrderForm으로 state 넘김 (너 프로젝트 방식)
    const orderSelected = () => {
        if (!member?.id) {
            toast.warn("로그인이 필요합니다.");
            navigate("/userLogin");
        return;
        }

        if (selectedItems.length === 0) {
            toast.warn("선택된 상품이 없습니다.");
        return;
        }

        const orderData = selectedItems.map((it) => ({
            id: member.id,
            pid: it.pid,
            title: it.title,
            price: it.price,
            thumbnail: it.thumbnail,
            size: it.size,
            quantity: it.quantity ?? 1,
            category: it.category,
            cid: it.cid, // 필요하면 같이 넘겨
        }));

        navigate("/orderForm", { state: { orderItems: orderData } });
    };

    const totalPrice = useMemo(() => {
        return items.reduce(
        (sum, it) => sum + (Number(it.price) || 0) * (Number(it.quantity) || 1),
        0
        );
    }, [items]);

    if (loading) return <div className="text-center py-20 text-gray-500">로딩 중...</div>;

    if (!member?.id) {
        return <div className="text-center py-20 text-gray-600">로그인 후 장바구니를 확인할 수 있습니다.</div>;
    }

    return (
        <div className="w-full bg-white sm:px-8 px-2 sm:py-10 py-5 shadow-md border border-gray-200 space-y-4 mb-20">
            <div className="flex items-center justify-between">
                <h2 className="xl:text-2xl text-lg font-bold">장바구니</h2>

                <div className="flex gap-2">
                    <button
                        className="px-3 py-2 text-sm border border-gray-400 rounded-xl hover:bg-gray-100"
                        onClick={toggleAll}
                    >
                        {checked.size === items.length && items.length > 0 ? "전체해제" : "전체선택"}
                    </button>

                    <button
                        className="px-3 py-2 text-sm bg-black text-white rounded-xl hover:opacity-90"
                        onClick={orderSelected}
                    >
                        선택주문
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
                총 {items.length}개 / 선택 {checked.size}개
            </div>

            {items.length === 0 ? (
                <div className="text-center py-20 text-gray-500">장바구니가 비었습니다.</div>
            ) : (
                <>
                    <div className="h-[540px] overflow-y-scroll space-y-2">
                        {items.map((it) => {
                            const cid = getKey(it);
                            const isChecked = checked.has(cid);

                            return (
                                <div
                                    key={cid}
                                    className="flex items-center gap-3 border rounded-xl p-3 bg-gray-50 hover:bg-gray-100 transition cursor-pointer"
                                    onClick={() => navigate(`/none_custom_detail?pid=${it.pid}&category=${it.category}`)}
                                >
                                    <input
                                        type="checkbox"
                                        checked={isChecked}
                                        onChange={() => toggleOne(cid)}
                                        onClick={(e) => {
                                            e.stopPropagation();
                                        }}
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
                                                <p className="text-sm text-gray-500 mt-1">{it.size ? `사이즈: ${it.size}` : ""}</p>
                                                <p className="text-sm text-gray-800 font-bold mt-1">
                                                {Number(it.price || 0).toLocaleString()}원
                                                </p>
                                            </div>

                                            <button
                                                className="px-2 py-1 text-xs border border-red-300 text-red-500 rounded-lg hover:bg-red-500 hover:text-white transition"
                                                onClick={(e) => {
                                                    e.stopPropagation();
                                                    deleteOne(it);
                                                }}
                                            >
                                                삭제
                                            </button>
                                        </div>

                                        <div className="mt-2 flex items-center justify-between">
                                            <div className="flex items-center gap-2">
                                                <button
                                                    className="w-8 h-8 border rounded-lg bg-white hover:bg-gray-100"
                                                    onClick={(e) => {
                                                        e.stopPropagation();
                                                        updateQty(it, (Number(it.quantity) || 1) - 1);  
                                                    }}
                                                >
                                                    -
                                                </button>
                                                <span className="w-10 text-center font-semibold">
                                                    {Number(it.quantity) || 1}
                                                </span>
                                                <button
                                                    className="w-8 h-8 border rounded-lg bg-white hover:bg-gray-100"
                                                    onClick={(e) => {
                                                        e.stopPropagation();
                                                        updateQty(it, (Number(it.quantity) || 1) + 1);
                                                    }}
                                                >
                                                    +
                                                </button>
                                            </div>

                                            <div className="text-sm text-gray-700 font-semibold">
                                                {(Number(it.price || 0) * (Number(it.quantity) || 1)).toLocaleString()}원
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            );
                        })}
                    </div>

                    <div className="flex items-center justify-end pt-4 border-t">
                        <div className="text-right">
                            <div className="text-sm text-gray-500">총 결제금액</div>
                            <div className="text-xl font-bold">{totalPrice.toLocaleString()}원</div>
                        </div>
                    </div>
                </>
            )}
        </div>
    );
};

export default Cart;
