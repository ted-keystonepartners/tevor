"""
응답 캐싱 서비스
- LRU (Least Recently Used) 캐시 구현
- 유사 질문 매칭
- 메모리 효율적 관리
"""

import hashlib
import time
from typing import Dict, Optional, Any, List
from collections import OrderedDict
import difflib
import logging

logger = logging.getLogger(__name__)

class ResponseCache:
    """응답 캐시 관리 클래스"""
    
    def __init__(self, max_size: int = 100, ttl: int = 3600):
        """
        Args:
            max_size: 최대 캐시 크기
            ttl: Time To Live (초)
        """
        self.cache: OrderedDict = OrderedDict()
        self.max_size = max_size
        self.ttl = ttl
        self.hits = 0
        self.misses = 0
        
    def _generate_key(self, message: str, context: Optional[Dict] = None) -> str:
        """캐시 키 생성"""
        # 메시지 정규화
        normalized = message.lower().strip()
        
        # 컨텍스트 포함
        if context:
            context_str = str(sorted(context.items()))
            normalized += context_str
            
        # MD5 해시로 키 생성
        return hashlib.md5(normalized.encode()).hexdigest()
    
    def _is_similar(self, msg1: str, msg2: str, threshold: float = 0.85) -> bool:
        """두 메시지의 유사도 체크"""
        ratio = difflib.SequenceMatcher(None, msg1.lower(), msg2.lower()).ratio()
        return ratio >= threshold
    
    def get(self, message: str, context: Optional[Dict] = None) -> Optional[Dict[str, Any]]:
        """캐시에서 응답 조회"""
        # 정확한 매칭 먼저 시도
        key = self._generate_key(message, context)
        
        if key in self.cache:
            entry = self.cache[key]
            
            # TTL 체크
            if time.time() - entry['timestamp'] < self.ttl:
                # LRU: 최근 사용으로 이동
                self.cache.move_to_end(key)
                self.hits += 1
                
                logger.info(f"Cache HIT for: {message[:50]}...")
                return {
                    **entry['response'],
                    'from_cache': True,
                    'cache_age': int(time.time() - entry['timestamp'])
                }
            else:
                # 만료된 엔트리 제거
                del self.cache[key]
        
        # 유사 메시지 검색
        for cached_key, entry in list(self.cache.items()):
            if time.time() - entry['timestamp'] < self.ttl:
                if self._is_similar(message, entry['original_message']):
                    self.cache.move_to_end(cached_key)
                    self.hits += 1
                    
                    logger.info(f"Cache HIT (similar) for: {message[:50]}...")
                    return {
                        **entry['response'],
                        'from_cache': True,
                        'cache_age': int(time.time() - entry['timestamp']),
                        'similar_match': True
                    }
        
        self.misses += 1
        return None
    
    def set(self, message: str, response: Dict[str, Any], context: Optional[Dict] = None):
        """캐시에 응답 저장"""
        key = self._generate_key(message, context)
        
        # 캐시 크기 제한
        if len(self.cache) >= self.max_size:
            # LRU: 가장 오래된 항목 제거
            self.cache.popitem(last=False)
        
        self.cache[key] = {
            'original_message': message,
            'response': response,
            'timestamp': time.time(),
            'context': context
        }
        
        logger.info(f"Cached response for: {message[:50]}...")
    
    def clear(self):
        """캐시 초기화"""
        self.cache.clear()
        self.hits = 0
        self.misses = 0
        
    def get_stats(self) -> Dict[str, Any]:
        """캐시 통계"""
        total = self.hits + self.misses
        hit_rate = (self.hits / total * 100) if total > 0 else 0
        
        return {
            'size': len(self.cache),
            'max_size': self.max_size,
            'hits': self.hits,
            'misses': self.misses,
            'hit_rate': f"{hit_rate:.1f}%",
            'ttl': self.ttl
        }
    
    def get_popular_queries(self, limit: int = 10) -> List[str]:
        """인기 쿼리 목록"""
        # 최근 사용 순으로 정렬되어 있음 (OrderedDict)
        queries = []
        for _, entry in self.cache.items():
            queries.append(entry['original_message'])
            if len(queries) >= limit:
                break
        return queries


# 싱글톤 인스턴스
_cache_instance: Optional[ResponseCache] = None

def get_cache() -> ResponseCache:
    """캐시 인스턴스 가져오기"""
    global _cache_instance
    if _cache_instance is None:
        _cache_instance = ResponseCache(
            max_size=200,  # 최대 200개 캐싱
            ttl=1800  # 30분 TTL
        )
    return _cache_instance