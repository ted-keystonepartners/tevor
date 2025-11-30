"""
신뢰도 기반 피드백 버튼 동적 생성 유틸리티
사용자 피드백 UI를 위한 버튼 구성 로직
"""
from typing import List, Dict, Any

def generate_feedback_buttons(confidence: float, detected_type: str) -> List[Dict[str, Any]]:
    """
    신뢰도에 따라 동적으로 피드백 버튼 생성
    
    Args:
        confidence (float): AI 분석 신뢰도 (0~1)
        detected_type (str): AI가 판별한 타입 (before/after/progress)
        
    Returns:
        List[Dict]: 버튼 정보 배열
    """
    buttons = []
    
    if confidence >= 0.8:
        # 높은 신뢰도: 간단한 확인/거부 버튼
        buttons = [
            {
                "id": "confirm",
                "label": "맞습니다",
                "action": "confirm",
                "color": "success",
                "type": "primary",
                "description": f"AI 분석 결과 '{get_type_label(detected_type)}'가 맞습니다"
            },
            {
                "id": "incorrect", 
                "label": "틀렸어요",
                "action": "incorrect",
                "color": "warning",
                "type": "secondary", 
                "description": "다른 타입으로 수정하겠습니다"
            }
        ]
    else:
        # 낮은 신뢰도: 더 많은 옵션 제공
        buttons = [
            {
                "id": "confirm",
                "label": "맞습니다",
                "action": "confirm", 
                "color": "success",
                "type": "primary",
                "description": f"AI 분석 결과 '{get_type_label(detected_type)}'가 맞습니다"
            },
            {
                "id": "edit_before",
                "label": "시공 전",
                "action": "edit",
                "color": "info", 
                "type": "secondary",
                "corrected_type": "before",
                "description": "시공 전 사진으로 분류"
            },
            {
                "id": "edit_progress", 
                "label": "진행 중",
                "action": "edit",
                "color": "info",
                "type": "secondary", 
                "corrected_type": "progress",
                "description": "시공 진행 중 사진으로 분류"
            },
            {
                "id": "edit_after",
                "label": "시공 후", 
                "action": "edit",
                "color": "info",
                "type": "secondary",
                "corrected_type": "after", 
                "description": "시공 완료 후 사진으로 분류"
            }
        ]
    
    return buttons

def get_type_label(image_type: str) -> str:
    """이미지 타입을 한국어 라벨로 변환"""
    type_labels = {
        "before": "시공 전",
        "progress": "진행 중", 
        "after": "시공 후"
    }
    return type_labels.get(image_type, image_type)

def get_confidence_message(confidence: float) -> str:
    """신뢰도에 따른 메시지 생성"""
    if confidence >= 0.9:
        return "매우 확실합니다"
    elif confidence >= 0.8:
        return "확실합니다" 
    elif confidence >= 0.6:
        return "어느 정도 확실합니다"
    elif confidence >= 0.4:
        return "불확실합니다"
    else:
        return "매우 불확실합니다"

def get_confidence_color(confidence: float) -> str:
    """신뢰도에 따른 색상 반환"""
    if confidence >= 0.8:
        return "success"
    elif confidence >= 0.6: 
        return "warning"
    else:
        return "danger"

def create_analysis_summary(analysis_result: Dict, confidence: float) -> Dict[str, Any]:
    """분석 결과 요약 생성"""
    detected_type = analysis_result.get("detected_type", "progress")
    description = analysis_result.get("description", "")
    elements = analysis_result.get("elements", [])
    issues = analysis_result.get("issues", [])
    
    return {
        "type_label": get_type_label(detected_type),
        "confidence": confidence,
        "confidence_message": get_confidence_message(confidence),
        "confidence_color": get_confidence_color(confidence),
        "description": description,
        "elements": elements,
        "issues": issues,
        "has_issues": len(issues) > 0,
        "element_count": len(elements)
    }