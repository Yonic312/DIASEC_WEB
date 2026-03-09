import { useNavigate, useLocation } from 'react-router-dom';

const OrderComplete = () => {
    const navigate = useNavigate();
    const location = useLocation();
    const { oid, paymentMethod, finalPrice, address, guestPassword, bankTransferInfo } = location.state || {};

    return (
        <div className="w-full min-h-[600px] flex flex-col items-center justify-center px-4 py-10">
        <div className="
            md:text-4xl text-[clamp(18px,3.128vw,36px)] font-bold text-center md:mb-4 mb-1">
            주문이 완료되었습니다!
        </div>

        <div className="
            text-gray-600 
            md:text-base text-[clamp(11px,2.085vw,16px)] 
            text-center mb-6">
            주문해주셔서 감사합니다. <br/>
                {guestPassword
                    ? "비회원 주문은 '주문번호 + 비밀번호'로만 조회가 가능합니다."
                    : "주문내역은 [마이페이지 > 주문내역]에서 확인하실 수 있습니다."
                }
        </div>
        

        <div className="
            border rounded-md p-6 bg-white shadow-md w-full max-w-xl
            md:text-base text-[clamp(11px,2.085vw,16px)]
        ">  
            {/* 상단 요약 */}
            <div className="flex items-start justify-between gap-3">
                <div>
                    <p className="text-sm text-gray-500">주문번호</p>
                    <p className="text-lg font-extrabold text-red-600 tracking-tight">{oid}</p>
                </div>

                <div className="text-right">
                    <p className="text-sm text-gray-500">결제금액</p>
                    <p className="text-lg font-bold text-gray-900">
                        {finalPrice?.toLocaleString()}원
                    </p>
                    <p className="mb-2">
                        결제수단: <span className="font-semibold">{paymentMethod}</span>
                    </p>
                </div>
            </div>            
            
            {paymentMethod === "무통장입금" && bankTransferInfo && (
                <div className="mt-5 rounded-xl border border-[#D0AC88] bg-[#fffaf3] p-4">
                    <div className="flex items-start justify-between gap-3">
                        <div>
                            <p className="text-sm font-bold text-[#a57647]">무통장 입금 안내</p>
                            <p className="mt-2 text-sm text-gray-800">
                                <span className="font-semibol">입금계좌:</span> 
                                <span className="mx-2 text-gray-300"> | </span>
                                <span className="font-semibold">{bankTransferInfo.bankAccount}</span>
                            </p>
                            {bankTransferInfo.depositor && (
                                <p className="mt-1 text-sm text-gray-800">
                                    <span className="font-semibold">입금자명</span>
                                    <span className="mx-2 text-gray-300">|</span>
                                    <span className="font-semibold">{bankTransferInfo.depositor}</span>
                                </p>
                            )}
                            {bankTransferInfo.dueText && (
                                <p className="mt-2 text-xs text-gray-600">
                                    {bankTransferInfo.dueText}
                                </p>
                            )}
                        </div>

                        {/* 복사 버튼 */}
                        <div className="flex flex-col gap-2 shrink-0">
                            <button
                                type="button"
                                className="px-3 py-2 rounded-lg border bg-white text-sm hover:bg-gray-50"
                                onClick={() =>navigator.clipboard.writeText(bankTransferInfo.bankAccount)}
                            >
                                계좌 복사
                            </button>

                        </div>
                    </div>
                </div>
            )}

            {/* 배송지 */}
            <div className="mt-5 pt-4 border-t">
                <p className="text-sm text-gray-500 mb-1">배송지</p>
                <p className="text-sm font-medium text-gray-800 leading-relaxed">
                    {address}
                </p>
            </div>


            {/* 비회원 비밀번호 */}
            {guestPassword && (
                <div className="mt-4 rounded-xl border border-red-200 bg-red-50 p-4">
                    <p className="mb-2 text-red-600 font-semibold">비회원 주문 비밀번호</p>
                    <p className="mt-1 text-base font-extrabold text-red-700">
                        {guestPassword}
                    </p>
                    <p className="mt-2 text-sm text-red-600">
                        (주문번호와 비밀번호를 꼭 기억해두세요. 분실 시 고객센터로 문의 바랍니다.)
                    </p>
                </div>
            )}
        </div>

        <div className="
            flex gap-4 mt-8
            md:text-base text-[clamp(11px,2.085vw,16px)]">
            <button
            className="px-4 py-2 bg-black text-white rounded-md"
            onClick={() => navigate('/')}
            >
            메인으로
            </button>
            {guestPassword ? (
                <button
                    className="px-4 py-2 border border-gray-400 text-gray-700 rounded-md"
                    onClick={() => navigate('/guestOrderSearch')}
                >
                    비회원 주문조회
                </button>
            ) : (
                <button
                    className="px-4 py-2 border border-gray-400 text-gray-700 rounded-md"
                    onClick={() => navigate('/orderList')}
                >
                    주문내역 보기
                </button>
            )}  
        </div>
    </div>
    );
};

export default OrderComplete;
