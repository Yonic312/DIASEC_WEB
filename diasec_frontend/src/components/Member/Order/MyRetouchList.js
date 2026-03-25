import { useEffect, useMemo, useState, useContext } from "react";
import axios from "axios";
import { toast } from "react-toastify";
import { MemberContext } from "../../../context/MemberContext"; // 경로는 네 프로젝트에 맞게
import { useNavigate } from "react-router-dom";

const TypeChips = ({ value }) => {
        const types = !value
            ? []
            : Array.isArray(value)
                ? value
                : String(value).split(",").map(s => s.trim()).filter(Boolean);
            
        if (types.length === 0) {
            return <span className="text-[11px] text-gray-400">선택 항목 없음</span>;
        }

        return (
            <div className="flex flex-wrap gap-1.5">
                {types.map((t) => (
                    <span
                        key={t}
                        className="inline-flex items-center rounded-full border border-[#ead7c2] bg-[#fffaf3]
                                    px-2 py-0.5 text-[11px] text-[#8a5a2b]"
                    >
                        {t}
                    </span>
                ))}
            </div>
        )
    }

const MyRetouchList = () => {
    const API = process.env.REACT_APP_API_BASE;
    const { member } = useContext(MemberContext);
    const navigate = useNavigate();

    // 승인 / 반려 모달
    const [rejectOpen, setRejectOpen] = useState(false);
    const [rejectItemId, setRejectItemId] = useState(null);
    const [rejectMsg, setRejectMsg] = useState("");
    const [acting, setActing] = useState(false);

    // 미리보기 모달
    const [previewOpen, setPreviewOpen] = useState(false);
    const [previewImg, setPreviewImg] = useState("");

    const [rejectTypes, setRejectTypes] = useState([]);

    const [detailOpen, setDetailOpen] = useState(false);
    const [detailRow, setDetailRow] = useState(null);

    const openDetail = (row) => {
        setDetailRow(row);
        setDetailOpen(true);
    }

    const retouchOptions = [
        '피부 보정',
        '얼굴 디테일 보정',
        '얼굴 라인·피부 결 리터칭',
        '이미지 역광 및 색감보정',
        '불필요한 배경 삭제 및 변경',
        '업스케일링 (흐릿한 사진 선명보정)',
    ];

    const [editOpen, setEditOpen] = useState(false);
    const [editItemId, setEditItemId] = useState(null);
    const [editDraft, setEditDraft] = useState({ types: [], note: ''});

    const [startDate, setStartDate] = useState(() => {
        const d = new Date();
        d.setMonth(d.getMonth() - 3);
        return d.toISOString().slice(0, 10);
    });
    const [endDate, setEndDate] = useState(() => new Date().toISOString().slice(0, 10));

    const [list, setList] = useState([]);
    const [loading, setLoading] = useState(false);

    const canEditRequest = (row) => {
        return !row.previewStatus || row.previewStatus === "REJECTED";
    };

    const parseTypes = (v) => {
        if (!v) return [];
        if (Array.isArray(v)) return v;
        return String(v).split(',').map(s => s.trim()).filter(Boolean);
    };

    const openEdit = (row) => {
        setEditItemId(row.itemId);
        setEditDraft({
            types: parseTypes(row.retouchTypes),
            note: row.retouchNote ?? '',
        });
        setEditOpen(true);
    }

    const toggleRejectType = (t) => {
        setRejectTypes(prev => prev.includes(t) ? prev.filter(x => x !== t) : [...prev, t]);
    }

    const formatDatetime = (dateStr) => {
        if (!dateStr) return "-";

        const d = new Date(dateStr);
        const yyyy = d.getFullYear();
        const mm = String(d.getMonth() + 1).padStart(2, "0");
        const dd = String(d.getDate()).padStart(2, "0");
        const hh = String(d.getHours()).padStart(2, "0");
        const min = String(d.getMinutes()).padStart(2, "0");
        return `${yyyy}.${mm}.${dd} ${hh}:${min}`;
    };

    const formatDateOnly = (dateStr) => {
        if (!dateStr) return "-";
        const d = new Date(dateStr);
        const yyyy = d.getFullYear();
        const mm = String(d.getMonth() + 1).padStart(2, "0");
        const dd = String(d.getDate()).padStart(2, "0");
        return `${yyyy}.${mm}.${dd}`;
    }

    const openPreview = (url) => {
        setPreviewImg(url);
        setPreviewOpen(true);
    };

    const fetchList = async () => {
        if (!member?.id) {
            toast.error("로그인이 필요합니다.");
            navigate("/userLogin");
            return;
        }

        setLoading(true);
        try {
        // 지금 쿼리에는 날짜 필터가 없어서 프론트에서만 기간 UI 유지하고
        // 필요하면 나중에 SQL에 BETWEEN 추가하자.
            const res = await axios.post(
                `${API}/order/retouch/list`,
                { id: member.id },
                { withCredentials: true }
        );

        if (!res.data?.success) throw new Error(res.data?.message || "조회 실패");
            setList(res.data.list || []);
        } catch (e) {
            console.error(e);
            toast.error(e.message || "보정 내역 조회 실패");
        } finally {
            setLoading(false);
        }
    };

    // 기본적인 저장
    const submitDecision = async ({ itemId, decision, feedback, types }) => {
        if (!itemId) return;

        setActing(true);
        try {
            let url = "";
            let body = {};

            if (decision === "APPROVED") {
                url = `${API}/order/retouch/${itemId}/approve`;
                body = {};
            } else if (decision === "REJECTED") {
                url = `${API}/order/retouch/${itemId}/reject`;
                body = { feedback: feedback || "", types: types || [] }
            } else {
                throw new Error("잘못된 decision");
            }

            const res = await axios.post(url, body, { withCredentials: true});

            if (!res.data?.success) throw new Error(res.data?.message || "처리 실패");

            toast.success(decision === "APPROVED" ? "승인 처리 완료" : "반려 처리 완료");
            await fetchList();
        } catch (e) {
            console.error(e);
            toast.error(e.message || "처리 중 오류");
        } finally {
            setActing(false);
        }
    };

    const saveRequestEdit = async () => {
        if (!editItemId) return;
        
        if ((editDraft.types?.length ?? 0) === 0) {
            toast.error("보정 항목을 하나 이상 선택해주세요.");
            return;
        }

        setActing(true);
        try {
            const res = await axios.post(
                `${API}/order/update-retouch`,
                {
                    itemId: editItemId,
                    retouchEnabled:1,
                    retouchTypes: (editDraft.types || []).join(", "),
                    retouchNote: editDraft.note ?? "",
                },
                { withCredentials: true}
            );

            if (!res.data?.success) throw new Error(res.data?.message || "수정 실패");

            toast.success("보정 요청내용이 수정되었습니다.");
            setEditOpen(false);
            setEditItemId(null);
            await fetchList();
        } catch (e) {
            console.error(e);
            toast.error(e.message || "수정 중 오류");
        } finally {
            setActing(false);
        }
    }

    const onApprove = (itemId) => {
        if (acting) return;
        const ok = window.confirm("보정 시안을 승인할까요? 승인 후 제작이 진행됩니다.");
        if (!ok) return;
        submitDecision({ itemId, decision: "APPROVED" });
    };

    const onOpenReject = (row) => {
        setRejectTypes(parseTypes(row.retouchTypes));

        setRejectItemId(row.itemId);
        setRejectMsg("");
        setRejectOpen(true);
    };

    const onRejectSubmit = () => {
        if (!rejectMsg.trim().length < 5) {
            toast.error("반려 사유를 5자 이상 입력해주세요.");
            return;
        }
        submitDecision({ itemId: rejectItemId, decision: "REJECTED", feedback: rejectMsg.trim(), types: rejectTypes });
        setRejectOpen(false);
    }

    const statusBadge = (s) => {
        const base = "inline-flex px-2 py-0.5 rounded-full text-xs border";
        if (!s) return <span className={`${base} bg-gray-50 text-gray-600`}>미업로드</span>;
        if (s === "WAITING_CUSTOMER") return <span className={`${base} bg-yellow-50 text-yellow-700 border-yellow-200`}>승인대기</span>
        if (s === "APPROVED") return <span className={`${base} bg-green-50 text-green-700 border-green-200`}>승인완료</span>;
        if (s === "REJECTED") return <span className={`${base} bg-red-50 text-red-700 border-red-200`}>반려</span>;
        return <span className={`${base} bg-gray-50 text-gray-700`}>{s}</span>;
    };

    useEffect(() => {
        if (member === undefined) return;
        if (member === null) return;

        if (!member?.id) {
            toast.error("로그인이 필요합니다.");
            navigate("/userLogin");
            return;
        }

        fetchList();
        // eslint-disable-next-line
    }, [member]);

    const filtered = useMemo(() => {
        // start/end 기간은 현재 SQL에 반영 안되므로, 프론트에서 itemCreatedAt로 1차 필터
        const s = new Date(startDate + "T00:00:00");
        const e = new Date(endDate + "T23:59:59");
        return (list || []).filter((row) => {
        const t = row.itemCreatedAt ? new Date(row.itemCreatedAt) : null;
        if (!t) return true;
        return t >= s && t <= e;
        });
    }, [list, startDate, endDate]);

    return (
        <div className="w-full">
            <div className="flex items-end justify-between gap-3 mb-4">
                <div>
                    <span className="md:text-xl text-[clamp(14px,2.607vw,20px)] font-bold pb-6">| 보정내역 조회</span>
                    <p className="text-sm text-gray-500">보정 요청한 맞춤액자 주문만 표시됩니다.</p>
                </div>
            </div>

            <div className="
                flex flex-wrap items-center gap-2 mb-4
                md:text-sm text-[clamp(11px,2.085vw,16px)]
            ">
                <div className="flex items-center gap-2">
                <span className="text-gray-600">기간</span>
                <input
                    type="date"
                    className="
                        md:text-base text-[clamp(11px,2.085vw,16px)]
                        border rounded-md px-2 py-1
                        sm:w-[140px] w-[100px] 
                        sm:h-[40px] h-[30px]
                    "
                    value={startDate}
                    onChange={(e) => setStartDate(e.target.value)}
                />
                <span className="text-gray-400">~</span>
                <input
                    type="date"
                    className="
                        md:text-base text-[clamp(11px,2.085vw,16px)]
                        border rounded-md px-2 py-1
                        sm:w-[140px] w-[100px] 
                        sm:h-[40px] h-[30px]"
                    value={endDate}
                    onChange={(e) => setEndDate(e.target.value)}
                />
                </div>
            </div>

            {/* 데스크톱(기존 표) */}
            <div className="hidden md:block">
                <div className="w-full border rounded-lg overflow-hidden">
                    <div className="flex flex-row w-full bg-gray-50 text-sm text-center font-medium px-3 py-2">
                        <div className="w-[10%]">주문번호</div>
                        <div className="w-[10%]">주문상태</div>
                        <div className="w-[12%]">보정상태</div>
                        <div className="w-[38%]">요청내용</div>
                        <div className="w-[15%]">업로드/보관</div>
                        <div className="w-[7%]">보정 이미지</div>
                        <div className="w-[8%]">처리</div>
                    </div>

                    {loading ? (
                        <div className="p-4 text-gray-500">불러오는 중...</div>
                    ) : filtered.length === 0 ? (
                        <div className="p-6 text-gray-500">조회된 보정 내역이 없습니다.</div>
                    ) : (
                        filtered.map((row) => (
                            <div key={row.itemId} className="flex px-3 py-3 border-t text-sm items-center text-center" >
                                <div className="w-[10%]">{row.oid}</div>
                                <div className="w-[10%]">{row.orderStatus}</div>
                                
                                {/* 상태 안내 문장 */}
                                <div className="w-[12%] text-center">
                                    {statusBadge(row.previewStatus)}

                                    {/* 보정상태 안내 문장 */}
                                    {/* <div className="mt-1 text-[11px] text-gray-500">
                                        {row.previewStatus === "WAITING_CUSTOMER" && "승인 또는 반려를 선택해주세요."}
                                        {row.previewStatus === "APPROVED" && "승인 완료."}
                                        {row.previewStatus === "REJECTED" && "반려됨"}
                                        {!row.previewStatus && "프리뷰가 업로드 전"}
                                    </div> */}
                                </div>

                                {/* 요청내용: 타입 + 요청사항 + (반려사유는 여기에 같이) */}
                                <div className="w-[38%] text-left">
                                    <div className="text-[12px] text-gray-700">
                                        {/* 반려 사유 */}
                                        <TypeChips value={row.retouchTypes} />
                                    </div>

                                    {row.retouchNote ? (
                                        <div className="mt-2 text-xs text-gray-700 bg-gray-50 border rounded px-2 py-1 text-left">
                                            요청사항 : {row.retouchNote}
                                        </div>
                                    ) : (
                                        <div className="mt-1 text-[11px] text-gray-400">요청사항 : -</div>
                                    )}

                                    {row.previewStatus === "REJECTED" && row.customerFeedback ? (
                                        <div className="mt-1 text-[11px] text-red-600 line-clamp-2">
                                            반려사유: {row.customerFeedback}
                                        </div>
                                    ) : null}

                                    <div className="mt-2 flex justify-end">
                                        {canEditRequest(row) ? (
                                            <button 
                                                className="px-2 py-1 text-[11px] rounded border hover:bg-gray-50 disabled:opacity-50"
                                                onClick={() => openEdit(row)}
                                                disabled={acting}
                                            >
                                                요청 수정
                                            </button>
                                        ) : (
                                            <span className="text-[11px] text-gray-400">
                                                {row.previewStatus === "WAITING_CUSTOMER" ? "승인/반려로 진행" : "수정 불가"}
                                            </span>
                                        )}
                                    </div>
                                </div>
                                    
                                {/* 업로드/보관 */}
                                <div className="w-[15%] text-center">
                                    {/* 삭제 예정 안내: 승인완료 + deleteScheduledAt 있을때 */}
                                    <div className="text-[11px] text-gray-500">
                                        업로드 : {row.previewCreatedAt ? formatDateOnly(row.previewCreatedAt) : "-"}
                                    </div>
                                    <div className="mt-1 text-[11px] text-gray-500">
                                        보관일 : {row.deleteScheduledAt ? `${formatDateOnly(row.deleteScheduledAt)} ` : "-"}
                                    </div>
                                </div>

                                    {/* 보정 이미지 */}
                                <div className="w-[7%]">
                                    {row.previewUrl ? (
                                        <button type="button" onClick={() => openPreview(row.previewUrl)}>
                                            <img 
                                                src={row.previewUrl}
                                                alt="preview" 
                                                className="w-14 h-14 object-cover rounded border hover:opacity-90" 
                                            />
                                        </button>
                                    ) : (
                                        <span className="text-gray-400">없음</span>
                                    )}
                                </div>

                                {/* 처리 버튼 */}
                                <div className="w-[8%] gap-2">
                                    {row.previewStatus === "WAITING_CUSTOMER" ? (
                                        <>
                                            <button
                                                className="px-2 py-1 text-xs rounded border bg-white hover:bg-gray-50 disabled:opacity-50"
                                                onClick={() => onApprove(row.itemId)}
                                                disabled={acting}
                                            >
                                                {acting ? "처리중..." : "승인"}
                                            </button>
                                            <button
                                                className="px-2 py-1 ml-1 text-xs rounded border bg-white hover:bg-gray-50 disabled:opacity-50"
                                                onClick={() => onOpenReject(row)}
                                                disabled={acting}
                                            >
                                                {acting ? "처리중..." : "반려"}
                                            </button>
                                        </>
                                    ) : (
                                        <span className="text-xs text-gray-400">-</span>
                                    )}
                                </div>
                            </div>
                        ))
                    )}
                </div>
            </div>

            {/* 모바일(카드형) */}
            <div className="md:hidden">
                {loading ? (
                    <div className="p-4 text-gray-500">불러오는 중...</div>
                ) : filtered.length === 0 ? (
                    <div className="p-6 text-gray-500">조회된 보정 내역이 없습니다.</div>
                ) : (
                    filtered.map((row) => {
                        const typesArr = Array.isArray(row.retouchTypes)
                            ? row.retouchTypes
                            : String(row.retouchTypes || '')
                                .split(',')
                                .map(s => s.trim())
                                .filter(Boolean);
                        
                        const topTypes = typesArr.slice(0, 2);
                        const restCount = Math.max(0, typesArr.length - topTypes.length);

                        return (
                            <div key={row.itemId} className="border rounded-lg p-3 mb-3 bg-white">
                                <div className="flex items-center justify-between gap-3">
                                    <div className="min-w-0">
                                        <div className="text-[13px] font-semibold text-gray-800">
                                            주문번호 {row.oid}
                                        </div>
                                        <div className="text-[11px] text-gray-500 mt-1">
                                            {row.orderStatus}
                                        </div>
                                    </div>

                                    <div className="shrink-0">
                                        {statusBadge(row.previewStatus)}
                                    </div>
                                </div>

                                <div className="mt-2">
                                    <div className="text-[11px] font-semibold text-gray-700">대표 보정</div>
                                    <div className="mt-1">
                                        <TypeChips value={topTypes} />
                                    </div>
                                    {restCount > 0 && (
                                        <div className="mt-1 text-[11px] text-gray-400">
                                            +{restCount}개
                                        </div>
                                    )}
                                </div>

                                <div className="mt-3 flex justify-end">
                                    <button
                                        type="button"
                                        className="px-3 py-2 text-[12px] rounded border bg-white hover:bg-gray-50"
                                        onClick={() => openDetail(row)}
                                    >
                                        상세보기
                                    </button>
                                </div>
                            </div>
                        );
                    })
                )}
            </div>

            {detailOpen && detailRow && (
            <div
                className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 p-4"
                onClick={() => setDetailOpen(false)}
            >
                <div
                className="bg-white rounded-xl shadow-xl w-full max-w-[520px] overflow-hidden"
                onClick={(e) => e.stopPropagation()}
                >
                <div className="flex items-center justify-between px-5 py-4 border-b">
                    <div className="font-bold text-gray-800">요청 상세</div>
                    <button
                    type="button"
                    className="text-gray-500 hover:text-black"
                    onClick={() => setDetailOpen(false)}
                    >
                    ✕
                    </button>
                </div>
                <div className="px-5 py-4">
                    <div className="text-[12px] text-gray-600 mb-2">
                    주문번호 {detailRow.oid} / {detailRow.orderStatus}
                    </div>
                    <div className="mb-3">
                    <div className="text-[12px] font-semibold text-gray-700">전체 보정 옵션</div>
                    <div className="mt-1">
                        <TypeChips value={detailRow.retouchTypes} />
                    </div>
                    </div>
                    <div className="mb-3">
                    <div className="text-[12px] font-semibold text-gray-700">요청사항 전체</div>
                    {detailRow.retouchNote ? (
                        <div className="mt-1 text-xs text-gray-700 bg-gray-50 border rounded px-3 py-2 break-words">
                        {detailRow.retouchNote}
                        </div>
                    ) : (
                        <div className="mt-1 text-[11px] text-gray-400">-</div>
                    )}
                    {detailRow.previewStatus === "REJECTED" && detailRow.customerFeedback && (
                        <div className="mt-2 text-[11px] text-red-600">
                        반려사유: {detailRow.customerFeedback}
                        </div>
                    )}
                    </div>
                    <div className="mb-3">
                    <div className="text-[12px] font-semibold text-gray-700">업로드/보관</div>
                    <div className="mt-1 text-[11px] text-gray-600">
                        업로드 : {detailRow.previewCreatedAt ? formatDateOnly(detailRow.previewCreatedAt) : "-"}
                    </div>
                    <div className="text-[11px] text-gray-600">
                        보관일 : {detailRow.deleteScheduledAt ? `${formatDateOnly(detailRow.deleteScheduledAt)} ` : "-"}
                    </div>
                    </div>
                    <div className="mb-4">
                    <div className="text-[12px] font-semibold text-gray-700">보정 이미지</div>
                    {detailRow.previewUrl ? (
                        <div className="mt-2">
                        <button
                            type="button"
                            className="px-3 py-2 text-[12px] rounded border bg-white hover:bg-gray-50"
                            onClick={() => openPreview(detailRow.previewUrl)}
                        >
                            이미지 보기
                        </button>
                        </div>
                    ) : (
                        <div className="mt-2 text-[11px] text-gray-400">없음</div>
                    )}
                    </div>
                    {/* 처리 버튼 영역(데스크톱 로직 그대로 가져오기) */}
                    <div className="flex gap-2">
                    {canEditRequest(detailRow) ? (
                        <button
                        className="flex-1 px-3 py-2 text-[12px] rounded border hover:bg-gray-50 disabled:opacity-50"
                        onClick={() => {
                            setDetailOpen(false);
                            openEdit(detailRow);
                        }}
                        disabled={acting}
                        >
                        요청 수정
                        </button>
                    ) : (
                        <div className="flex-1 px-3 py-2 text-[12px] rounded border text-gray-400 text-center">
                        {detailRow.previewStatus === "WAITING_CUSTOMER" ? "승인/반려로 진행" : "수정 불가"}
                        </div>
                    )}
                    {detailRow.previewStatus === "WAITING_CUSTOMER" && (
                        <>
                        <button
                            className="px-3 py-2 text-[12px] rounded border bg-white hover:bg-gray-50 disabled:opacity-50"
                            onClick={() => {
                            setDetailOpen(false);
                            onApprove(detailRow.itemId);
                            }}
                            disabled={acting}
                        >
                            {acting ? "처리중..." : "승인"}
                        </button>
                        <button
                            className="px-3 py-2 text-[12px] rounded border bg-white hover:bg-gray-50 disabled:opacity-50"
                            onClick={() => {
                            setDetailOpen(false);
                            onOpenReject(detailRow);
                            }}
                            disabled={acting}
                        >
                            {acting ? "처리중..." : "반려"}
                        </button>
                        </>
                    )}
                    </div>
                </div>
                </div>
            </div>
            )}

            {rejectOpen && (
                <div 
                    className="fixed inset-0 bg-black/40 flex items-center justify-center z-50"
                    onClick={() => { if (!acting) setRejectOpen(false); }}
                >
                    <div className="bg-white w-[420px] rounded-lg shadow-lg p-5 relative">
                    <h3 className="text-lg font-bold mb-2">반려 사유 입력</h3>
                    <p className="text-sm text-gray-500 mb-3">
                        어떤 부분을 수정하면 되는지 구체적으로 적어주세요.
                    </p>

                    {/* 6항목 */}
                    <div className="mt-3">
                        <div className="text-sm font-semibold text-gray-700 mb-2">수정이 필요한 항목</div>

                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                            {retouchOptions.map((opt) => {
                                const checked = rejectTypes.includes(opt);
                                return (
                                    <button
                                        key={opt}
                                        type="button"
                                        className={`text-sm px-3 py-2 rounded-xl border transition text-left
                                            ${checked
                                                ? "border-[#D0AC88] bg-[#fffaf3] text-[#a67a3e]"
                                                : "border-gray-200 hover:bg-gray-50 text-gray-700"
                                            }`}
                                        onClick={() => toggleRejectType(opt)}
                                        disabled={acting}
                                    >   
                                        {opt}
                                    </button>   
                                )
                            })}
                        </div>

                        <div className="mt-2 text-[11px] text-gray-500">
                             선택은 선택사항이고, 아래에 상세 사유는 꼭 적어주세요.
                        </div>
                    </div>

                    <textarea
                        className="mt-3 w-full border rounded-md px-3 py-2 text-sm"
                        rows={5}
                        value={rejectMsg}
                        onChange={(e) => setRejectMsg(e.target.value)}
                        placeholder="예) 얼굴 보정이 과해요. 자연스럽게 톤만 정리해주세요."
                    />

                    <div className="flex gap-2 mt-4">
                        <button
                            className="flex-1 py-2 rounded bg-black text-white hover:bg-gray-800 disabled:opacity-50"
                            onClick={onRejectSubmit}
                            disabled={acting}
                        >
                        반려 제출
                        </button>
                        <button
                            className="flex-1 py-2 rounded border hover:bg-gray-50"
                            onClick={() => setRejectOpen(false)}
                            disabled={acting}
                        >
                        취소
                        </button>
                    </div>
                        <button
                            className="absolute top-3 right-3 text-gray-400 hover:text-black disabled:opacity-50"
                            onClick={() => setRejectOpen(false)}
                            disabled
                        >
                            ✕
                        </button>
                    </div>
                </div>
            )}

            {/* 미리보기 모달 */}
            {previewOpen && (
                <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50" onClick={() => setPreviewOpen(false)}>
                    <div className="bg-white rounded-lg p-3 max-w-[90vw] max-h-[90vh]" onClick={(e) => e.stopPropagation()}>
                        <div className="flex justify-between items-center mb-2">
                            <div className="text-sm font-medium">보정 시안 미리보기</div>
                            <button className="text-gray-500 hover:text-black" onClick={() => setPreviewOpen(false)}>✕</button>
                        </div>
                        <img src={previewImg} alt="preview-large" className="max-w-[70vw] max-h-[80vh] object-contain rounded" />
                    </div>
                </div>
            )}

            {editOpen && (
                <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50" onClick={() => setEditOpen(false)}>
                    <div className="bg-white w-[520px] max-w-[92vw] rounded-lg shadow-lg p-5 relative" onClick={(e) => e.stopPropagation()}>
                    <h3 className="text-lg font-bold mb-2">보정 요청 수정</h3>
                    <p className="text-sm text-gray-500 mb-3">
                        프리뷰 업로드 전(또는 반려 상태)에서만 수정 가능합니다.
                    </p>

                    <div className="text-sm font-semibold text-gray-700 mb-2">보정 항목 선택</div>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                        {retouchOptions.map(opt => {
                        const checked = editDraft.types.includes(opt);
                        return (
                            <button
                            key={opt}
                            type="button"
                            className={`text-sm px-3 py-2 rounded-xl border transition text-left
                                ${checked ? 'border-[#D0AC88] bg-[#fffaf3] text-[#a67a3e]' : 'border-gray-200 hover:bg-gray-50 text-gray-700'}
                            `}
                            onClick={() => {
                                setEditDraft(d => {
                                const on = d.types.includes(opt);
                                const next = on ? d.types.filter(t => t !== opt) : [...d.types, opt];
                                return { ...d, types: next };
                                });
                            }}
                            >
                            {opt}
                            </button>
                        );
                        })}
                    </div>

                    <div className="mt-4 text-sm font-semibold text-gray-700 mb-2">요청사항</div>
                    <textarea
                        className="w-full border rounded-md px-3 py-2 text-sm"
                        rows={4}
                        value={editDraft.note}
                        onChange={(e) => setEditDraft(d => ({ ...d, note: e.target.value }))}
                        placeholder="예) 잡티 제거, 피부톤 자연스럽게, 배경 흰색으로, 역광 완화 등"
                    />

                    <div className="flex gap-2 mt-4">
                        <button
                        className="flex-1 py-2 rounded border hover:bg-gray-50 disabled:opacity-50"
                        onClick={() => setEditOpen(false)}
                        disabled={acting}
                        >
                        취소
                        </button>
                        <button
                        className="flex-1 py-2 rounded bg-black text-white hover:bg-gray-800 disabled:opacity-50"
                        onClick={saveRequestEdit}
                        disabled={acting}
                        >
                        저장
                        </button>
                    </div>

                    <button
                        className="absolute top-3 right-3 text-gray-400 hover:text-black"
                        onClick={() => setEditOpen(false)}
                    >
                        ✕
                    </button>
                    </div>
                </div>
            )}
        </div>
    );
};

export default MyRetouchList;