import { useEffect, useState, useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import { MemberContext } from '../../../context/MemberContext';
import {DragDropContext, Droppable, Draggable} from '@hello-pangea/dnd';
import axios from 'axios';
import { toast } from 'react-toastify';


const ReviewWrite = () => {
    const API = process.env.REACT_APP_API_BASE;
    const navigate = useNavigate();
    const { member } = useContext(MemberContext);
    const [eligibleProducts, setEligibleProducts] = useState([]);
    const [selectedPid, setSelectedPid] = useState(0);
    const [rating, setRating] = useState(0);
    const [title, setTitle] = useState('');
    const [content, setContent] = useState('');
    const [images, setImages] = useState([]);
    const [selectedItemId, setSelectedItemId] = useState(null);

    useEffect(() => {
        if (member?.id) {
            axios.get(`${API}/review/eligible?id=${member.id}`)
                .then(res => setEligibleProducts(res.data))
                .catch(err => console.error('배송완료 상품 조회 실패', err));
        }
    }, [member]);

    // 업로드 이미지 미리보기 표시
    const [previewImages, setPreviewImages] = useState([]);

    const handleImageChange = (e) => {
        const files = Array.from(e.target.files);

        if (files.length > 5) {
            toast.error("이미지는 최대 5장까지 업로드 가능합니다.");
            return;
        }

        for (const file of files) {
            if (file.size > 2 * 1024 * 1024) {
                toast.error('각 이미지는 2MB 이하만 등록 가능합니다.');
                return;
            }
        }

        setImages(files);
        setPreviewImages(files.map(file => URL.createObjectURL(file)));
    };

    const handleSubmit = async () => {
        if (!selectedPid || rating === 0 || !title.trim() || !content.trim()) {
            toast.error('모든 항목을 작성해주세요.');
            return;
        }

        const formData = new FormData();
        [
            ['id', member.id],
            ['pid', selectedPid],
            ['rating', rating],
            ['title', title],
            ['content', content],
            ['itemId', selectedItemId]
        ].forEach(([key, value]) => formData.append(key, value));
        images.forEach(file => formData.append('images', file));

        try {
            await axios.post(`${API}/review/write`, formData, {
                headers: { 'Content-Type' : 'multipart/form-data' }
            });
            toast.success('리뷰가 등록되었습니다.');
            window.location.reload();
        } catch (err) {
            console.error('리뷰 등록 실패', err);
            toast.error('리뷰 등록에 실패했습니다.');
        }
    };

    const selectedProduct = eligibleProducts.find(item => item.item_id === selectedItemId);

    // 이미지 드래그
    const [thumbnails, setThumbnails] = useState([]);
    const [isDragOverThumb, setIsDragOverThumb] = useState(false);

    return (
        <div 
            className="w-[60%] mx-auto px-2">
            <div 
                className="
                    w-full
                    md:p-7 p-[clamp(0.5rem,3.65vw,1.75rem)]
                    md:space-y-6 space-y-[clamp(8px,7.49vw,24px)]
                    border border-gray-200 shadow-md rounded-lg bg-white">
                <h2 
                    className="
                        md:text-xl text-[clamp(14px,3.128vw,24px)]
                        font-bold text-center">상품 사용 후기</h2>

                { /* 상품 미리보기*/}
                {selectedProduct && (
                    <div 
                        className="
                            flex items-center gap-4 
                            md:p-4 p-[clamp(4px,2.085vw,16px)]
                            border rounded mb-6">
                        <img src={selectedProduct.thumbnail} alt="상품 이미지" 
                            className="
                                md:w-20 w-[clamp(40px,10.43vw,80px)]
                                md:h-20 h-[clamp(40px,10.43vw,80px)]
                                object-cover rounded" />
                        <div>
                            <p 
                                className="
                                    md:text-sm text-[clamp(11px,1.824vw,14px)]
                                    font-semibold">{selectedProduct.title}</p>
                            <p 
                                className="
                                    md:text-xs text-[clamp(10px,1.564vw,12px)]
                                    text-gray-500">{selectedProduct.size}</p>
                        </div>
                    </div>
                )}
                <div>
                    <label 
                        className="
                            block mb-2 
                            md:text-sm text-[clamp(11px,1.824vw,14px)]
                            font-semibold text-gray-700">리뷰 작성할 상품</label>
                    <select 
                        value={selectedItemId || ''}
                        onChange={(e) => {
                            const itemId = parseInt(e.target.value);
                            const selectedItem = eligibleProducts.find(p => p.item_id === itemId);
                            if (selectedItem) {
                                setSelectedItemId(itemId);
                                setSelectedPid(selectedItem.pid);
                            }
                        }}
                        className="
                            w-full 
                            md:text-sm text-[clamp(11px,1.824vw,14px)]
                            border border-gray-300 rounded-md p-3 focus:ring focus:ring-gray-400 focus:outline-none"
                    >
                        <option value="">-- 상품을 선택하세요 --</option>
                        {eligibleProducts.map(item => (
                            <option key={item.item_id} value={item.item_id}>
                                {item.title} / {item.size}
                            </option>
                        ))}
                    </select>
                </div>

                {/* 별점 선택 */}
                <div>
                    <label 
                        className="
                            block mb-2 
                            md:text-sm text-[clamp(11px,1.824vw,14px)]
                            font-semibold text-gray-700">상품은 만족하셨나요?</label>
                    <div className="flex gap-2">
                        {[1, 2, 3, 4, 5].map(star => (
                            <span key={star}
                                onClick={() => setRating(star)}
                                className={`
                                    cursor-pointer 
                                    md:text-2xl text-[clamp(15px,3.128vw,24px)] 
                                    transition ${star <= rating ? 'text-yellow-400' : 'text-gray-300'}`}>★</span>
                        ))}
                    </div>
                </div>

                {/* 후기 제목 */}
                <div>
                    <label className="block mb-2 md:text-sm text-[clamp(11px,1.824vw,14px)] font-semibold text-gray-700">제목</label>
                    <input type="text" value={title} onChange={(e) => setTitle(e.target.value)} placeholder="후기 제목을 입력해주세요"
                        className="w-full border md:text-sm text-[clamp(11px,1.824vw,14px)] border-gray-300 rounded-md p-3 focus:ring focus:ring-gray-400 focus:outline-none" />
                </div>

                {/* 후기 내용 */}
                <div>
                    <label className="block mb-2 md:text-sm text-[11px] font-semibold text-gray-700">후기 내용</label>
                    <textarea
                        value={content}
                        onChange={(e) => setContent(e.target.value)}
                        rows="6"
                        placeholder="구매하신 상품에 대한 솔직한 후기를 남겨주세요."
                        className="w-full md:text-sm text-[clamp(11px,1.824vw,14px)] border border-gray-300 rounded-md p-3 resize-none focus:ring focus:ring-gray-400 focus:outline-none">
                    </textarea>
                    <div className="bg-gray-50 p-1 rounded md:text-xs text-[clamp(10px,1.564vw,12px)] text-gray-600 mb-6">
                    - 상품과 무관한 내용, 욕설, 광고 등은 비공개 처리될 수 있습니다.<br/>
                    - 작성된 리뷰 및 첨부 사진은 운영 및 마케팅에 활용될 수 있습니다.
                    </div>
                </div>
                
                {/* 드래그앤드롭 업로드 영역 */}
                <div
                    className={`relative border px-3 py-6 bg-gray-50 text-center rounded transition ${
                        isDragOverThumb ? 'bg-gray-200 border-black' : 'hover:bg-gray-100'
                    }`}
                    onDragOver={(e) => {
                        e.preventDefault();
                        setIsDragOverThumb(true);
                    }}
                    onDragLeave={() => setIsDragOverThumb(false)}
                    onDrop={(e) => {
                        e.preventDefault();
                        setIsDragOverThumb(false);
                        const files = Array.from(e.dataTransfer.files);
                        if (files.length + images.length > 5) {
                        toast.error("이미지는 최대 5장까지 업로드 가능합니다.");
                        return;
                        }
                        for (const file of files) {
                        if (file.size > 2 * 1024 * 1024) {
                            toast.error('각 이미지는 2MB 이하만 등록 가능합니다.');
                            return;
                        }
                        }
                        const all = [...images, ...files];
                        setImages(all);
                        setPreviewImages(all.map(file => URL.createObjectURL(file)));
                    }}
                    >
                    <label className="cursor-pointer block md:text-sm text-[clamp(11px,1.824vw,14px)]">
                        여기에 이미지를 드래그하거나 클릭하여 선택하세요 <br />
                        <span className="md:text-xs text-[clamp(10px,1.564vw,12px)] text-gray-400">(최대 5장, 각 10MB 이하의 이미지만 업로드 가능합니다)</span>
                        <input
                        type="file"
                        accept="image/png, image/jpeg"
                        multiple
                        onChange={(e) => {
                            const files = Array.from(e.target.files);
                            if (files.length + images.length > 5) {
                            toast.error("이미지는 최대 5장까지 업로드 가능합니다.");
                            return;
                            }
                            for (const file of files) {
                            if (file.size > 10 * 1024 * 1024) {
                                toast.error('각 이미지는 10MB 이하만 등록 가능합니다.');
                                return;
                            }
                            }
                            const all = [...images, ...files];
                            setImages(all);
                            setPreviewImages(all.map(file => URL.createObjectURL(file)));
                        }}
                        className="absolute inset-0 opacity-0 cursor-pointer"
                        />
                    </label>
                </div>


                {images.length > 0 && (
                    <DragDropContext
                        onDragEnd={(result) => {
                        if (!result.destination) return;
                        const newImages = Array.from(images);
                        const [moved] = newImages.splice(result.source.index, 1);
                        newImages.splice(result.destination.index, 0, moved);
                        setImages(newImages);
                        setPreviewImages(newImages.map(file => URL.createObjectURL(file)));
                        }}
                    >
                        <Droppable droppableId="images" direction="horizontal">
                        {(provided) => (
                            <div
                            className="grid grid-cols-5 gap-2 mt-4"
                            {...provided.droppableProps}
                            ref={provided.innerRef}
                            >
                            {images.map((file, index) => (
                                <Draggable key={file.name + index} draggableId={file.name + index} index={index}>
                                {(provided) => (
                                    <div
                                    ref={provided.innerRef}
                                    {...provided.draggableProps}
                                    {...provided.dragHandleProps}
                                    className="relative md:w-20 w-[clamp(40px,10.43vw,80px)]"
                                    >
                                    <img
                                        src={URL.createObjectURL(file)}
                                        alt={`preview-${index}`}
                                        className="
                                            md:w-20 w-[clamp(40px,10.43vw,80px)]
                                            md:h-20 h-[clamp(40px,10.43vw,80px)]
                                            object-cover border"
                                    />
                                    <button
                                        type="button"
                                        onClick={() => {
                                        const updated = [...images];
                                        updated.splice(index, 1);
                                        setImages(updated);
                                        setPreviewImages(updated.map(file => URL.createObjectURL(file)));
                                        }}
                                        className="absolute top-1 right-1 bg-black text-white text-xs px-1"
                                    >
                                        ✕
                                    </button>
                                    <div className="text-xs text-center mt-1">#{index + 1}</div>
                                    </div>
                                )}
                                </Draggable>
                            ))}
                            {provided.placeholder}
                            </div>
                        )}
                        </Droppable>
                    </DragDropContext>
                )}

                {/* 제출 버튼 */}
                <div className="text-center">
                    <button
                        onClick={handleSubmit}
                        className='w-full md:text-sm text-[clamp(11px,1.824vw,14px)] bg-black text-white py-3 px-6 rounded-md font-semibold hover:bg-gray-800 transition'>
                        후기 등록
                    </button>
                </div>
            </div>
        </div>
    )
}

export default ReviewWrite;