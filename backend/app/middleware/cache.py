from typing import Dict, Any, Optional
from datetime import datetime, timedelta
import json
import hashlib

class SimpleCache:
    """Simple in-memory cache with TTL"""
    
    def __init__(self):
        self.cache: Dict[str, Dict[str, Any]] = {}
    
    def get(self, key: str) -> Optional[Any]:
        """Get cached value if not expired"""
        if key in self.cache:
            entry = self.cache[key]
            if datetime.now() < entry['expires_at']:
                return entry['value']
            else:
                del self.cache[key]
        return None
    
    def set(self, key: str, value: Any, ttl_seconds: int = 60):
        """Set value with TTL"""
        self.cache[key] = {
            'value': value,
            'expires_at': datetime.now() + timedelta(seconds=ttl_seconds)
        }
    
    def clear(self):
        """Clear all cache"""
        self.cache.clear()
    
    def make_key(self, prefix: str, params: Dict[str, Any]) -> str:
        """Create cache key from prefix and params"""
        params_str = json.dumps(params, sort_keys=True)
        hash_digest = hashlib.md5(params_str.encode()).hexdigest()
        return f"{prefix}:{hash_digest}"

# Global cache instance
cache = SimpleCache()