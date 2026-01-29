import { useNavigate, useLocation } from 'react-router-dom';

const OrderComplete = () => {
    const navigate = useNavigate();
    const location = useLocation();
    const { oid, paymentMethod, finalPrice, address, guestPassword } = location.state || {};

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
            md:text-base text-[clamp(11px,2.085vw,16px)]">
            <p className="mb-2 text-red-600"><strong>주문번호:</strong> {oid}</p>
            <p className="mb-2"><strong>결제수단:</strong> {paymentMethod}</p>
            <p className="mb-2"><strong>결제금액:</strong> {finalPrice?.toLocaleString()}원</p>
            <p className="mb-2"><strong>배송지:</strong> {address}</p>
            {guestPassword && (
                <>
                    <hr className="my-3"/>
                    <p className="mb-2 text-red-600 font-semibold">
                        ※비회원 주문 비밀번호: {guestPassword}
                    </p>
                    <p className="text-gray-500 text-sm">
                        (주문번호와 비밀번호를 꼭 기억해두세요. 분실 시 고객센터로 문의 바랍니다.)
                    </p>
                </>
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
