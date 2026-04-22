export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { type, storeInfo } = req.body;

  const prompts = {
    intro: `당신은 배달앱 음식점 마케팅 전문가입니다.
아래 가게 정보를 바탕으로 배달의민족 앱 "가게소개" 문구를 작성해주세요.

가게 정보:
- 업종: ${storeInfo.category}
- 대표 메뉴: ${storeInfo.mainMenu}
- 특징/차별점: ${storeInfo.feature}
- 운영 방식: ${storeInfo.style || '일반'}

작성 규칙:
1. 100~200자 이내
2. 첫 줄에 핵심 차별점 (업종, 특징) 먼저
3. 인사말(안녕하세요 등)로 시작하지 말 것
4. 기본 제공 구성, 1인 주문 가능 여부 포함
5. 검색 노출에 유리한 키워드 자연스럽게 포함
6. 배달 음식 느낌 살릴 것

문구만 출력하세요. 설명이나 부가 내용 없이.`,

    order: `당신은 배달앱 음식점 운영 전문가입니다.
아래 가게 정보를 바탕으로 배달의민족 "주문안내" 문구를 작성해주세요.

가게 정보:
- 업종: ${storeInfo.category}
- 대표 메뉴: ${storeInfo.mainMenu}
- 기본 제공: ${storeInfo.includes || '공기밥, 김치'}
- 알레르기 유발 식재료: ${storeInfo.allergy || '없음'}
- 맵기 조절 가능: ${storeInfo.spicy || '가능'}
- 피크타임 조리 소요 시간: ${storeInfo.peakTime || '20~30분'}

작성 규칙:
1. 항목별 글머리 기호(·) 사용
2. 기본 제공 구성, 맵기 조절, 피크타임 안내, 알레르기 정보 포함
3. 간결하고 명확하게
4. 고객이 주문 전에 알아야 할 내용 중심

문구만 출력하세요.`,

    notice: `당신은 배달앱 음식점 마케팅 전문가입니다.
아래 정보를 바탕으로 배달의민족 "사장님공지" 문구를 작성해주세요.

공지 유형: ${storeInfo.noticeType}
세부 내용: ${storeInfo.noticeDetail}
가게 업종: ${storeInfo.category}

작성 규칙:
1. 첫 줄에 핵심 내용 (이모지 활용)
2. 2~4줄 이내로 간결하게
3. 행동 유도 문구 포함 (요청사항 기재, 기간 내 주문 등)
4. 따뜻하고 신뢰감 있는 톤

문구만 출력하세요.`
  };

  try {
    const response = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': process.env.ANTHROPIC_API_KEY,
        'anthropic-version': '2023-06-01'
      },
      body: JSON.stringify({
        model: 'claude-haiku-4-5-20251001',
        max_tokens: 500,
        messages: [{ role: 'user', content: prompts[type] }]
      })
    });

    const data = await response.json();
    const text = data.content?.[0]?.text || '';
    res.status(200).json({ result: text });
  } catch (err) {
    res.status(500).json({ error: '생성 실패: ' + err.message });
  }
}
