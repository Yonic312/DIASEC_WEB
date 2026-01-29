package com.diasec.diasec_backend.service;

import java.util.List;

import org.springframework.stereotype.Service;

import com.diasec.diasec_backend.dao.CollectionMapper;
import com.diasec.diasec_backend.dao.ProductMapper;
import com.diasec.diasec_backend.vo.CollectionItemVo;
import com.diasec.diasec_backend.vo.CollectionVo;

import jakarta.transaction.Transactional;
import lombok.RequiredArgsConstructor;

@Service
@RequiredArgsConstructor
public class CollectionService {
    private final CollectionMapper mapper;
    private final ProductMapper productMapper;

    public List<CollectionVo> getAllCollections() {
        return mapper.getAllCollections();
    }

    public void insertCollection(CollectionVo vo) {
        mapper.insertCollection(vo);
    }

    public void deleteCollection(int id) {
        mapper.deleteCollection(id);
    }

    public void updateCollection(CollectionVo vo) {
        mapper.updateCollection(vo);
    }

    @Transactional
    public void updateCollectionItems(CollectionItemVo vo) {
        // 라벨 이동
        mapper.updateCollectionItems(vo);

        // 타겟 컬렉션 정보 조회
        CollectionVo targetCollection = mapper.selectCollectionById(vo.getCollectionId());

        // 해당 라벨을 쓰는 상품도 이동
        productMapper.updateProductsByLabel(
            targetCollection.getName(),
            vo.getOldLabel()
        );
    }


    public List<CollectionItemVo> getItemsByCollectionId(int collectionId) {
        return mapper.getItemsByCollectionId(collectionId);
    }

    public List<CollectionItemVo> getAllItems() {
        return mapper.getAllItems();
    }

    // 헤더 드롭다운 무한스크롤
    public List<CollectionItemVo> getAllItemsPaged(String type, int size, int offset) {
        return mapper.getAllItemsPaged(type, size, offset);
    }

    public void insertItem(CollectionItemVo vo) {
        mapper.insertItem(vo);
    }

    public void deleteItem(int id) {
        mapper.deleteItem(id);
    }

    public CollectionItemVo getItemById(int id) {
        return mapper.selectItemById(id);
    }

    // 메인 상단 미니 컬렉션
    public List<CollectionItemVo> getLabelsWithCount(String type, int size, int offset) {
        return mapper.selectLabelWithCount(type, size, offset);
    }
}
