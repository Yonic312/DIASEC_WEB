import { useContext, useEffect, useState } from 'react';
import axios from 'axios';
import { MemberContext } from '../../../context/MemberContext';

const CreditHistory = () => {
    const API = process.env.REACT_APP_API_BASE;
    const { member } = useContext(MemberContext);
    const [history, setHistory] = useState([]);

    useEffect(() => {
        if (!member?.id) return;

        axios.get(`${API}/credit/history/${member.id}`)
            .then(res => setHistory(res.data))
            .catch(err => {
                console.error("적립금 내역 불러오기 실패", err);
                setHistory([]);
            });
    }, [member?.id]);

    return (
        <div 
            className="
                md:px-10 px-[clamp(0.25rem,5.215vw,2.5rem)]
                w-full ">
            <h2 
                className="
                    md:text-xl text-[clamp(14px,2.607vw,20px)]
                    md:mb-4 mb-[clamp(0.25rem,1.92vw,1rem)]
                    font-bold
                    ">적립금 내역</h2>

            <div 
                className="
                    md:mb-4 mb-1
                    md:text-sm text-[clamp(9px,1.825vw,14px)]">
                <span className="font-medium">현재 보유 적립금: </span>
                <span className="font-bold">{history[0]?.credit?.toLocaleString()}원</span>
            </div>

            {history.length === 0 ? (
                <div className="text-gray-500">적립금 내역이 없습니다.</div>
            ) : (
                <table 
                    className="
                        md:text-sm text-[clamp(8px,1.825vw,14px)]
                        w-full border">
                    <thead className="bg-gray-100">
                        <tr>
                            <th className="md:py-2 py-1 border">날짜</th>
                            <th className="md:py-2 py-1 border">금액</th>
                            <th className="md:py-2 py-1 border">설명</th>
                            <th className="md:py-2 py-1 border">관련 주문</th>
                        </tr>
                    </thead>
                    <tbody>
                        {history.map(item => (
                            <tr key={item.cid} className="text-center">
                                <td className="md:py-2 py-1 border">{new Date(item.createdAt).toLocaleDateString()}</td>
                                <td className={`md:p-2 py-1 border font-semibold ${item.type === '사용' ? 'text-red-500' : 'text-green-600'}`}>
                                    {item.type === '사용' ? '-' : '+'}{item.amount.toLocaleString()}원
                                </td>
                                <td className="md:py-2 py-1 border">{item.description}</td>
                                <td className="md:py-2 py-1 border">
                                    {item.oid
                                        ? (item.totalCount > 1
                                            ? `${item.title} 외 ${item.totalCount - 1}건`
                                            : `${item.title} (${item.oid})`
                                            )
                                        : '-'
                                    }
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            )}
        </div>
    );
};

export default CreditHistory;