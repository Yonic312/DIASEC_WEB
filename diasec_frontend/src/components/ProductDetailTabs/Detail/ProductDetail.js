import { useEffect, useState } from 'react';
import axios from 'axios';
import diasec_old from '../../../assets/video/diasec_old.mp4';
import diasec_hang from '../../../assets/video/diasec_hang.mp4';

const ProductDetail = ({ pid }) => {
    const API = process.env.REACT_APP_API_BASE;
    const [images, setImages] = useState([]);

    useEffect(() => {
        axios.get(`${API}/product/images?pid=${pid}`)
            .then(res => setImages(res.data))
            .catch(err => console.error("상세 이미지 불러오기 실패", err));
    }, [pid]);

    return (
        <div className="w-full flex flex-col items-center py-10 bg-white">
            {images && images.length > 0 ? (
                images.map((url, idx) => (
                    <img key={idx}
                        src={url}
                        alt={`상세 이미지 ${idx + 1}`}
                        className="w-full max-w-[800px] rounded"
                    />
                ))
            ) : (
                <p className="text-gray-400 text-sm">등록된 상세 이미지가 없습니다.</p>
            )}

            <video
                src={diasec_old}
                muted
                autoPlay
                playsInline
                loop
                preload="none"
                className="
                    w-[800px] mt-[200px]
                    video_product_pc"
            />

            <video
                src={diasec_hang}
                muted
                autoPlay
                playsInline
                loop
                preload="none"
                className="
                    w-[800px] mt-[200px]
                    video_product_pc"
            />
        </div>
    )
}

export default ProductDetail;