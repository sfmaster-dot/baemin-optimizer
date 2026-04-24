export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });
  const { type, storeInfo } = req.body;

  const prompts = {
    intro: `배달의민족 가게소개 문구를 작성합니다. 아래 [작성 원칙]과 [예시]를 반드시 따르세요.

[입력 정보]
업종/대표메뉴: ${storeInfo.category} / ${storeInfo.mainMenu}
차별점: ${storeInfo.feature}
운영 특이사항: ${storeInfo.style || '없음'}

[작성 원칙]
1. 200~400자 스토리형 문장
2. 재료 신선도·조리 방식 등 신뢰를 주는 구체적 사실 포함
3. 특정 고객(혼밥·직장인·가족 등) 또는 상황을 자연스럽게 저격
4. 시그니처 메뉴나 추천 포인트 1가지 언급
5. 마지막 줄은 따뜻하고 짧은 마무리 한 문장
6. 인사말(안녕하세요·감사합니다)로 시작 금지
7. 입력 정보에 없는 내용 추가 금지
8. 느낌표는 최대 1개

[예시 1 — 고기구이]
직접 농가에서 받아오는 냉장 삼겹살만 씁니다. 냉동 없이, 당일 입고된 고기만 판매하기 때문에 매일 수량이 정해져 있어요. 육즙이 살아있는 두툼한 컷, 직접 담근 된장찌개와 함께라면 오늘 저녁은 걱정 없습니다. 쌈 채소는 넉넉히 드려요. 오늘도 맛있는 하루 되세요!

[예시 2 — 치킨]
주문 들어오면 바로 튀깁니다. 미리 튀겨두지 않아서 조리 시간이 조금 걸리지만, 갓 튀긴 바삭함은 보장드려요. 우리 가게 시그니처는 청양 허니콤보 — 달콤하고 알싸한 맛의 조화를 꼭 한번 경험해보세요. 뼈 없이 드시고 싶다면 순살로 변경도 가능합니다.

[예시 3 — 국밥]
새벽 4시부터 끓이기 시작합니다. 사골과 잡뼈를 12시간 이상 고아낸 국물은 별다른 첨가물 없이도 진합니다. 해장이 필요한 아침, 추운 날 몸을 녹이고 싶은 저녁, 어느 때든 환영합니다. 공기밥·깍두기는 기본 제공, 수육 추가도 가능해요. 오늘 하루도 든든하게!

문구만 출력. 제목·번호·설명 없이.`,

    order: `배달의민족 "주문안내" 문구를 작성합니다.

[입력 정보]
업종: ${storeInfo.category} / 대표 메뉴: ${storeInfo.mainMenu}
기본 제공: ${storeInfo.includes || '공기밥, 김치'}
알레르기 유발 식재료: ${storeInfo.allergy || '없음'}
맵기 조절 가능: ${storeInfo.spicy || '가능'}
피크타임 조리 소요 시간: ${storeInfo.peakTime || '20~30분'}

[작성 원칙]
1. 항목별 글머리 기호(·) 사용
2. 기본 제공 구성, 맵기 조절, 피크타임 안내, 알레르기 정보 포함
3. 간결하고 명확하게
4. 고객이 주문 전에 알아야 할 내용 중심

문구만 출력하세요.`,

    notice: `배달의민족 "사장님공지" 문구를 작성합니다.

공지 유형: ${storeInfo.noticeType}
세부 내용: ${storeInfo.noticeDetail}
가게 업종: ${storeInfo.category}

[작성 원칙]
1. 첫 줄에 핵심 내용 (이모지 활용)
2. 2~4줄 이내로 간결하게
3. 행동 유도 문구 포함
4. 따뜻하고 신뢰감 있는 톤

문구만 출력하세요.`,

    menuname: `배달의민족 메뉴명을 3가지 제안합니다.

[입력 정보]
현재 메뉴명: ${storeInfo.currentName}
업종/음식 종류: ${storeInfo.category}
조리 방식·특징: ${storeInfo.feature || '없음'}
주요 재료: ${storeInfo.ingredient || '없음'}

[작성 원칙]
1. 15자 이내
2. 조리법·재료 특징을 앞에 배치 (직화, 수제, 국내산, 당일 등)
3. 검색에 걸리는 구체적 키워드 포함
4. "맛있는", "최고의" 같은 추상적 형용사 금지
5. 3가지 각각 다른 방향으로 제안

형식:
① [메뉴명] — [한 줄 설명]
② [메뉴명] — [한 줄 설명]
③ [메뉴명] — [한 줄 설명]

위 형식만 출력. 다른 설명 없이.`,

    menudesc: `배달의민족 메뉴 설명 문구를 작성합니다.

[입력 정보]
메뉴명: ${storeInfo.menuName}
맛·식감: ${storeInfo.taste}
구성·용량: ${storeInfo.compose || '없음'}

[작성 원칙]
1. 60자 이내
2. 맛·식감 묘사 → 구성·용량 순서
3. 숫자로 구성 명시 (g, 인분, 개 등)
4. 먹고 싶게 만드는 구체적 묘사
5. 구어체 OK ("강추", "드세요" 등)

문구만 출력. 설명·따옴표 없이.`,

    reply: `배달의민족 리뷰 답변을 작성합니다.

[입력 정보]
가게명: ${storeInfo.storeName}
고객 리뷰: ${storeInfo.review}
별점: ${storeInfo.rating}점

[작성 원칙]
1. 100자 이내
2. 가게명 1회 자연스럽게 포함
3. 별점 3점 이하: 진심 어린 사과 + 구체적 개선 약속 (변명 금지)
4. 별점 4점 이상: 감사 + 재주문 유도
5. 공손하되 기계적이지 않은 어조
6. 이모지 1개 이내

답변만 출력. 설명·따옴표 없이.`
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
        model: 'claude-sonnet-4-5',
        max_tokens: 800,
        messages: [{ role: 'user', content: prompts[type] }]
      })
    });
    const data = await response.json();
    if (data.error) return res.status(500).json({ error: data.error.message || JSON.stringify(data.error) });
    const text = data.content?.[0]?.text || '';
    res.status(200).json({ result: text });
  } catch (err) {
    res.status(500).json({ error: '생성 실패: ' + err.message });
  }
}
