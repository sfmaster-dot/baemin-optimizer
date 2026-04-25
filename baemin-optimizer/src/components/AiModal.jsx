import { useState, useRef } from 'react';

// ── 업종 프리셋 데이터 (menuname의 각 필드는 배열 → 매번 랜덤 선택) ──
const PRESETS = {
  chicken: {
    label: '🍗 치킨',
    intro:    { category:['치킨 전문점','수제 치킨집','정통 치킨'], mainMenu:['후라이드, 양념, 반반','간장치킨, 순살, 양념','양념치킨, 후라이드, 치즈볼'], feature:['당일 도계, 국내산 닭만 사용','주문 즉시 튀기는 갓 튀김','3단 바삭 튀김, 특제 소스'], style:['1인 반마리 가능','가족 세트 구성 다양','야간 2시까지 영업'] },
    order:    { category:'치킨', mainMenu:['후라이드, 양념','순살, 반반','반반, 간장치킨'], includes:['치킨무, 소스','치킨무, 콜라','치킨무, 음료'], allergy:'없음', spicy:'가능', peakTime:['20~30분','25~35분'] },
    notice:   { storeName:['치킨나라','바삭치킨','황금올리브 치킨집'], story:['매일 당일 도계한 신선한 국내산 닭만 사용. 오랜 경력 조리팀이 바삭하고 촉촉한 치킨을 준비합니다','주문 즉시 튀겨 갓 튀긴 바삭함을 배달. 3단 튀김 공정으로 겉바속촉 보장','국내산 생닭만 사용, 직접 배합한 튀김가루로 매장 맛 그대로'], event:['리뷰 작성 시 치즈볼 4개 증정','2만원 이상 주문 시 콜라 1.25L 증정','첫 주문 1,500원 쿠폰 발급'], featuredMenu:['반반치킨, 치킨+감튀 세트','양념치킨, 허니갈릭','순살반반, 치즈볼 세트'], extraNotice:['새벽 1시까지 영업','','우천 시 10분 내외 지연'] },
    menuname: { currentName:['후라이드치킨','양념치킨','반반치킨','간장치킨','순살치킨'], category:'치킨', feature:['당일 도계, 국내산','바삭함 극대화','겉바속촉, 육즙 가득','달콤매콤 양념','뼈 없이 편한'], ingredient:['국내산 닭, 직접 배합 튀김가루','국내산 생닭, 수제 양념','국내산 닭 순살, 특제 가루'] },
    menudesc: { menuName:['반반치킨','후라이드치킨','양념치킨','순살치킨'], taste:['바삭하고 촉촉한, 달콤매콤','겉바속촉한, 육즙 가득','달콤하고 쫄깃한, 고소한 양념','부드럽고 바삭한, 뼈 없이 편한'], compose:['한마리 / 치킨무·콜라 포함','반반 / 치킨무·음료 선택','한마리 + 감자튀김 세트','순살 500g / 콜라 1.25L 포함'] },
    reply:    { storeName:'치킨 가게', review:'', rating:'5' },
  },
  chinese: {
    label: '🥡 중식',
    intro:    { category:['중식 전문점','중국집','정통 중화요리'], mainMenu:['짜장면, 짬뽕, 탕수육','짬뽕, 간짜장, 볶음밥','해물짬뽕, 탕수육, 깐풍기'], feature:['수타 면발, 직접 내린 육수','30년 경력 주방장의 불맛','매일 뽑는 수타면, 해물 직접 손질'], style:['2인 코스 가능','단체 주문 환영','점심 특가 운영'] },
    order:    { category:'중식', mainMenu:['짜장면, 짬뽕','해물짬뽕, 탕수육','간짜장, 볶음밥'], includes:['단무지, 양파','단무지, 춘장, 양파','단무지, 양파, 소스'], allergy:'없음', spicy:'가능', peakTime:['20~25분','25~30분'] },
    notice:   { storeName:['향미각','명동반점','성화루'], story:['매일 반죽해 뽑는 수타 면발과 직접 내린 해물 육수. 30년 주방장의 손맛','점심 한끼부터 회식까지, 정통 중화요리 전문점','불맛 가득한 짬뽕과 쫄깃한 수타면, 집에서도 매장 그대로'], event:['리뷰 작성 시 군만두 4개 증정','2인 세트 주문 시 탕수육 소자 증정','점심시간 세트 특가'], featuredMenu:['해물짬뽕, 탕수육 세트','짜장면+탕수육, 간짜장','짬뽕+볶음밥 세트'], extraNotice:['매주 화요일 휴무','','단체 주문 환영'] },
    menuname: { currentName:['짜장면','짬뽕','탕수육','간짜장','볶음밥'], category:'중식', feature:['수타 면발, 불맛','진한 춘장','바삭함 + 달콤한 소스','현지식 볶음'], ingredient:['해물, 수타면, 직접 낸 육수','국내산 돼지등심, 특제 소스','돼지고기, 양파, 춘장'] },
    menudesc: { menuName:['해물짬뽕','짜장면','탕수육','볶음밥'], taste:['얼큰하고 시원한, 불향 가득','진한 춘장, 쫄깃한 수타면','바삭하고 달콤한, 소스 끼얹어','불향 폭발, 계란 고소한'], compose:['1인분 / 단무지·양파 포함','곱빼기 / 단무지 포함','소자 / 2인분 기준','2인 세트 / 짜장+짬뽕+탕수육'] },
    reply:    { storeName:'중국집', review:'', rating:'5' },
  },
  donkatsu: {
    label: '🍱 돈까스·회·일식',
    intro:    { category:['돈까스·일식 전문점','정통 돈까스집','일식 전문'], mainMenu:['등심돈까스, 모둠회, 초밥','등심돈까스, 카츠동, 안심','연어초밥, 모둠회, 회덮밥'], feature:['수제 빵가루, 당일 입고 활어','일본 현지에서 익힌 비법','매일 새벽 직송 활어'], style:['1인 런치 세트','예약 주문 추천'] },
    order:    { category:'돈까스·일식', mainMenu:['등심돈까스','안심돈까스, 카츠동','연어초밥, 모둠회'], includes:['밥, 된장국, 양배추','밥, 미소장국, 단무지','미소된장국, 단무지'], allergy:['갑각류','없음'], spicy:'불가능', peakTime:['15~20분','20~25분'] },
    notice:   { storeName:['카츠야','돈까스공방','스시선'], story:['매일 반죽하는 수제 빵가루와 국내산 돼지고기 등심. 일본 현지에서 익힌 비법','매일 새벽 수산시장 직송 활어와 숙성회. 15년 경력 주방장의 손맛','두툼한 국내산 돼지 등심을 수제 빵가루로 바삭하게'], event:['리뷰 작성 시 계란 장조림 증정','정식 세트 주문 시 미소장국 추가','리뷰 작성 시 계란말이 증정'], featuredMenu:['등심돈까스, 가츠동','모둠회 小, 초밥 12p','히레카츠, 로스카츠 정식'], extraNotice:['일요일 정기 휴무','매일 한정 20그릇','예약 주문 추천'] },
    menuname: { currentName:['등심돈까스','안심돈까스','카츠동','히레카츠','치즈돈까스','연어초밥','모둠회'], category:'돈까스·일식', feature:['수제 빵가루, 국내산 돼지','바삭함 + 두툼함','부드러움','당일 입고 활어'], ingredient:['국내산 등심, 수제 빵가루','국내산 돼지 안심','당일 활어, 숙성 연어'] },
    menudesc: { menuName:['등심돈까스','안심돈까스','카츠동','연어초밥 12pc'], taste:['바삭하고 육즙 가득한','부드럽고 담백한, 겉바속촉','부드러운 계란과 바삭한 카츠의 조화','입에서 녹는, 신선하고 담백한'], compose:['1인분 / 밥·된장국·양배추 포함','1인분 / 밥·단무지·미소장국','12피스 / 미소된장국·단무지 포함'] },
    reply:    { storeName:'돈까스 가게', review:'', rating:'5' },
  },
  pizza: {
    label: '🍕 피자',
    intro:    { category:['피자 전문점','화덕 피자','수제 피자집'], mainMenu:['페퍼로니, 고르곤졸라, 불고기','페퍼로니, 콤비네이션, 치즈','하와이안, 콤비네이션, 페퍼로니'], feature:['화덕 구이, 당일 반죽 수제 도우','매일 아침 반죽하는 생도우','자연치즈 듬뿍, 수제 소스'], style:['2인분부터 주문 가능','라지 사이즈 특가'] },
    order:    { category:'피자', mainMenu:['페퍼로니피자','콤비네이션','고르곤졸라피자'], includes:['피클, 소스','피클, 핫소스','피클, 치즈소스'], allergy:'없음', spicy:'불가능', peakTime:['20~25분','25~30분'] },
    notice:   { storeName:['피자공방','화덕피자하우스','나폴리피자'], story:['매일 아침 반죽하는 수제 도우와 자연치즈. 화덕에서 구워내는 이탈리아 정통 스타일','매일 반죽하는 생도우, 수제 토마토 소스로 정통 나폴리 스타일','화덕 500도에서 60초 구이, 현지 감성 그대로'], event:['리뷰 작성 시 콜라 1.25L 증정','L사이즈 주문 시 치즈스틱 증정','평일 점심 L 15% 할인'], featuredMenu:['페퍼로니 L, 콤비네이션 세트','고르곤졸라, 불고기피자','4치즈 피자, 하와이안'], extraNotice:['매주 월요일 휴무','','Large 2판 주문 시 할인'] },
    menuname: { currentName:['페퍼로니피자','고르곤졸라피자','불고기피자','하와이안피자','콤비네이션','치즈피자'], category:'피자', feature:['화덕 구이, 수제 도우','치즈 듬뿍','달콤한 꿀 디핑','한국인 입맛 맞춤'], ingredient:['자연치즈, 수제 도우','4가지 치즈','페퍼로니 · 모차렐라'] },
    menudesc: { menuName:['페퍼로니피자','고르곤졸라피자','불고기피자','콤비네이션'], taste:['치즈 쭉 늘어나는, 짭조름한','달콤하고 짭짤한, 꿀에 찍어 먹는','한국식 달콤한 양념, 쫄깃한 도우','다양한 토핑의 조화, 한 판에 다 있는'], compose:['Large 31cm / 3~4인분','Regular 25cm / 2인분','L + 사이드 세트','2판 / 콜라 1.25L 포함'] },
    reply:    { storeName:'피자 가게', review:'', rating:'5' },
  },
  fastfood: {
    label: '🍔 패스트푸드',
    intro:    { category:['수제버거·패스트푸드','수제버거 전문점','정통 아메리칸 버거'], mainMenu:['치즈버거, 베이컨버거, 더블패티','시그니처 치즈버거, 새우버거, 감자튀김','불고기버거, 치즈버거, 감자튀김'], feature:['100% 수제 패티, 당일 반죽 번','국내산 한우, 직접 갈아 만드는 패티','매일 구워내는 브리오슈 번'], style:['빠른 조리, 1인 세트 가능','야간 영업 중','세트 메뉴 다양'] },
    order:    { category:'버거·패스트푸드', mainMenu:['시그니처 치즈버거','베이컨버거, 감자튀김','더블패티버거, 감튀'], includes:['감자튀김, 소스','감자튀김, 음료, 소스','감자튀김, 케첩, 마요'], allergy:'없음', spicy:'가능', peakTime:['15~20분','20~25분'] },
    notice:   { storeName:['버거공방','빅버거하우스','수제버거랩'], story:['매일 직접 반죽하는 브리오슈 번과 국내산 한우로 만든 수제 패티. 소스까지 직접 조합','100% 수제 패티, 매일 굽는 번, 직접 조합 소스로 프리미엄 버거','소고기 패티부터 번, 소스까지 모두 수제'], event:['리뷰 작성 시 감자튀김 무료 추가','세트 주문 시 콜라 업그레이드','주말 한정 더블패티 할인'], featuredMenu:['시그니처 치즈버거, 베이컨더블','트러플버거, 베이컨치즈','새우버거, 불고기버거'], extraNotice:['새벽 2시까지 영업','','1인 세트 메뉴 다양'] },
    menuname: { currentName:['시그니처 치즈버거','베이컨버거','더블패티버거','불고기버거','새우버거'], category:'버거·패스트푸드', feature:['수제 패티, 직접 반죽 번','육즙 폭발','짭짤한 베이컨','통새우 3마리, 바삭함'], ingredient:['국내산 한우 패티, 수제 번','브리오슈 번, 베이컨','통새우, 양상추'] },
    menudesc: { menuName:['시그니처 치즈버거','베이컨버거','더블패티버거'], taste:['육즙 가득한, 진한 치즈맛','짭짤하고 고소한, 바삭한 베이컨','패티 두 장의 묵직함, 든든한 한끼'], compose:['1인분 / 감튀·콜라 포함','세트 / 감튀·음료 포함','2인 세트 / 감튀 2개·음료 2개'] },
    reply:    { storeName:'버거 가게', review:'', rating:'5' },
  },
  jjim: {
    label: '🍲 찜·탕·찌개',
    intro:    { category:['찜·탕 전문','찜·찌개 전문점','국물 요리 전문'], mainMenu:['갈비찜, 감자탕, 아구찜','갈비찜, 김치찜, 해물탕','감자탕, 뼈해장국, 닭볶음탕'], feature:['당일 끓이는 진한 육수, 국내산 재료','12시간 고아낸 사골 육수','매일 새벽부터 끓이는 진한 국물'], style:['2인분부터 주문','해장용 1인 뼈해장국 인기'] },
    order:    { category:'찜·탕', mainMenu:['갈비찜','감자탕, 뼈해장국','김치찜, 해물탕'], includes:['공기밥, 김치','공기밥 2개, 김치, 깍두기','공기밥, 김치, 반찬 3종'], allergy:'없음', spicy:'가능', peakTime:['25~35분','30~40분'] },
    notice:   { storeName:['찜마을','갈비찜전문점','감자탕의정석'], story:['매일 새벽부터 고아낸 진한 육수와 푸짐한 고기. 해장부터 술안주까지','12시간 우려낸 사골 육수, 매일 끓이는 국물 요리 전문','국내산 재료만 사용, 매일 당일 조리하는 진한 국물'], event:['리뷰 작성 시 공깃밥 추가 증정','2인 주문 시 소주 1병 할인','해장국 아침 한정 10% 할인'], featuredMenu:['갈비찜 大, 감자탕','뼈해장국, 김치찜','아구찜, 닭볶음탕'], extraNotice:['매주 수요일 휴무','','새벽 해장 주문 가능'] },
    menuname: { currentName:['갈비찜','감자탕','김치찜','해물탕','닭볶음탕','뼈해장국','아구찜'], category:'찜·탕', feature:['당일 끓임, 국내산','해장 최고, 뼈 푸짐','묵은지 깊은 맛','얼큰함'], ingredient:['국내산 갈비, 당근, 밤','돼지등뼈, 묵은지, 감자','국산 아구, 콩나물'] },
    menudesc: { menuName:['갈비찜','감자탕','김치찜','닭볶음탕'], taste:['달콤짭짤한, 살이 살살 녹는','얼큰하고 진한, 해장 최고','묵은지 시큼한, 고기 푸짐','매콤달콤한, 쫀득한 닭고기'], compose:['2~3인분 / 공깃밥 2개·김치 포함','2~3인분 / 공깃밥·소면 포함','2인분 / 공깃밥 2개·반찬','2~3인분 / 공깃밥 포함'] },
    reply:    { storeName:'찜 가게', review:'', rating:'5' },
  },
  jokbal: {
    label: '🍖 족발·보쌈',
    intro:    { category:['족발·보쌈 전문','수제 족발집','정통 보쌈 전문'], mainMenu:['앞다리족발, 보쌈, 막국수','앞다리족발, 매운족발, 불족발','보쌈, 족발, 막국수'], feature:['매일 삶는 당일 족발, 국내산 돼지','10년 경력 사장님 비법 양념','매일 손질한 쌈채소와 묵은지'], style:['야식 가능, 새벽 영업','소·중·대 사이즈 구성'] },
    order:    { category:'족발', mainMenu:['앞다리족발','보쌈, 막국수','매운족발, 앞다리족발'], includes:['쌈채소, 마늘, 새우젓','쌈채소, 묵은지, 마늘','쌈채소, 쌈무, 새우젓'], allergy:'없음', spicy:'가능', peakTime:['20~30분','25~35분'] },
    notice:   { storeName:['족발명가','보쌈공방','장충동족발'], story:['매일 아침 삶는 당일 족발과 직접 담근 묵은지 보쌈. 10년 경력 사장님 비법 양념','매일 삶는 족발, 10시간 숙성 보쌈. 쌈채소·묵은지 매일 준비','국내산 앞다리·뒷다리만 사용, 잡내 없는 깔끔한 맛'], event:['리뷰 작성 시 막국수 1인분 증정','대자 주문 시 소주 1병 할인','야식 시간 10% 할인'], featuredMenu:['앞다리족발 中, 보쌈정식','매운족발, 불족발','족발+보쌈 세트'], extraNotice:['새벽 3시까지 영업','','배달 지역 2km 이내'] },
    menuname: { currentName:['앞다리족발','보쌈','매운족발','불족발','족발+보쌈 세트'], category:'족발·보쌈', feature:['당일 삶기, 국내산 돼지','쫄깃함','묵은지 깊은 맛','매운맛 강함'], ingredient:['국내산 앞다리, 비법 양념','묵은지, 국내산 돼지','신안 천일염, 허브'] },
    menudesc: { menuName:['앞다리족발','보쌈','매운족발'], taste:['쫄깃하고 담백한, 잡내 없는','부드럽고 고소한, 김치와 환상조합','화끈하게 매운, 중독성 있는'], compose:['중자 700g / 쌈채소·마늘·새우젓 포함','중자 / 묵은지·쌈무 포함','대자 / 주먹밥 2개 포함'] },
    reply:    { storeName:'족발 가게', review:'', rating:'5' },
  },
  bunsik: {
    label: '🥟 분식',
    intro:    { category:['분식 전문점','떡볶이·김밥 전문','추억의 분식집'], mainMenu:['떡볶이, 김밥, 순대','떡볶이, 튀김, 순대','로제떡볶이, 차돌떡볶이, 김밥'], feature:['매일 아침 김밥 말기, 국내산 쌀','학교 앞 그 맛 그대로, 엄마 손맛','국내산 떡, 직접 만드는 고추장 양념'], style:['1인 세트 다양','세트 메뉴 가성비'] },
    order:    { category:'분식', mainMenu:['떡볶이, 김밥','떡볶이, 순대, 튀김','로제떡볶이, 김밥'], includes:['국물','국물, 어묵','단무지, 국물'], allergy:'없음', spicy:'가능', peakTime:['15~20분','20~25분'] },
    notice:   { storeName:['분식나라','엄마손분식','추억의떡볶이'], story:['매일 아침 직접 만든 김밥과 떡볶이 소스. 오랜 세월 이어온 엄마 손맛','학교 앞 그 맛 그대로, 매일 아침 김밥 말기부터 소스 만들기까지','국내산 쌀떡, 직접 담근 고추장으로 만드는 옛날 떡볶이'], event:['리뷰 작성 시 순대 1인분 증정','2만원 이상 주문 시 튀김 2개 증정','세트 메뉴 20% 할인'], featuredMenu:['떡볶이+김밥 세트, 로제떡볶이','차돌떡볶이, 튀김모둠','순대+떡볶이 세트'], extraNotice:['평일 오후 3~5시 특가','','주말 가족 세트 인기'] },
    menuname: { currentName:['떡볶이','로제떡볶이','차돌떡볶이','김밥','순대','튀김모둠'], category:'분식', feature:['멸치 육수, 고추장 양념','크리미하고 부드러움','차돌박이 듬뿍','엄마 손맛'], ingredient:['국내산 쌀떡, 어묵, 계란','우유 베이스 로제소스','차돌박이, 떡'] },
    menudesc: { menuName:['떡볶이','로제떡볶이','차돌떡볶이','김밥'], taste:['크리미하고 매콤한, 쫄깃한','달콤매콤한, 국물 진한','차돌박이 고소함, 크림 떡볶이','고소하고 담백한, 엄마표'], compose:['2인분 / 계란·어묵 포함','1인분 / 튀김 2개 포함','떡볶이+김밥 세트 / 국물 포함','1줄 / 반찬 포함'] },
    reply:    { storeName:'분식 가게', review:'', rating:'5' },
  },
  cafe: {
    label: '☕ 카페·디저트',
    intro:    { category:['카페·디저트','스페셜티 카페','수제 디저트 카페'], mainMenu:['아메리카노, 라떼, 케이크','아메리카노, 스무디, 쿠키','라떼, 아인슈페너, 크로플'], feature:['직접 로스팅 원두, 당일 제조 디저트','10년 경력 바리스타, 스페셜티 원두','매일 굽는 수제 디저트'], style:['케이크 예약 주문 가능','1인 디저트 세트 인기'] },
    order:    { category:'카페', mainMenu:['라떼, 아메리카노','스무디, 쿠키, 라떼','아인슈페너, 크로플'], includes:['없음','스틱 설탕 1개','케이크용 포크'], allergy:['유제품(라떼류)','유제품, 견과류'], spicy:'불가능', peakTime:['10~15분','15~20분'] },
    notice:   { storeName:['원두공방','스페셜티라운지','디저트카페'], story:['매일 직접 로스팅한 스페셜티 원두. 바리스타 경력 10년, 매장에서 추출','매일 아침 구워내는 수제 디저트. 프랑스 파티셰 수료 사장님 직접 제조','원두부터 디저트까지 모두 수제, 매일 당일 제조'], event:['리뷰 작성 시 쿠키 1개 증정','음료 2잔 주문 시 디저트 20% 할인','매일 15시 이후 케이크 특가'], featuredMenu:['시그니처 라떼, 딸기스무디','티라미수, 바스크 치즈케이크','아인슈페너, 크로플'], extraNotice:['케이크 예약 주문 가능','신메뉴 출시 — 흑임자 라떼',''] },
    menuname: { currentName:['시그니처 라떼','아메리카노','바닐라라떼','아인슈페너','딸기스무디','흑임자라떼','티라미수','크로플'], category:'카페·디저트', feature:['직접 로스팅, 스페셜티','진한 원두, 매일 로스팅','크림 듬뿍','수제 베이커리'], ingredient:['직접 로스팅 원두, 신선 우유','국내산 딸기, 생우유','국내산 버터, 생크림'] },
    menudesc: { menuName:['시그니처 라떼','아메리카노','아인슈페너','딸기스무디','티라미수'], taste:['부드럽고 고소한, 풍부한 크레마','진하고 쌉싸름한, 묵직한 바디감','진한 에스프레소 + 부드러운 크림','상큼한 딸기 과육, 시원한 식감','부드럽고 진한, 달콤쌉싸름한'], compose:['Regular 355ml / Hot·Ice 선택','Large 500ml / 생딸기 사용','ICE 400ml / 크림 듬뿍','1조각 120g'] },
    reply:    { storeName:'카페', review:'', rating:'5' },
  },
  korean: {
    label: '🍚 한식',
    intro:    { category:['한식 전문점','집밥 한식','정통 한식당'], mainMenu:['제육볶음, 김치찌개, 비빔밥','제육덮밥, 김치찌개, 순두부찌개','비빔밥, 육개장, 불고기 정식'], feature:['직접 담근 김치, 당일 조리','사장님 직접 담근 묵은지, 집밥 정성','매일 아침 끓이는 국, 국내산 재료'], style:['1인분 주문 가능','곱빼기 추가 가능'] },
    order:    { category:'한식', mainMenu:['제육볶음','제육덮밥, 김치찌개','비빔밥, 불고기 정식'], includes:['공기밥, 국, 김치, 반찬','공기밥, 국, 반찬 4종','공기밥, 반찬 3종, 된장국'], allergy:'없음', spicy:'가능', peakTime:['20~30분','25~30분'] },
    notice:   { storeName:['엄마의밥상','집밥공방','한식당'], story:['사장님이 직접 담근 묵은지와 매일 아침 끓이는 국. 집밥 같은 정성으로 준비','매일 아침 조리하는 반찬과 국, 당일 조리 원칙','국내산 재료만 사용, 영양사 감수 균형 식단'], event:['리뷰 작성 시 계란후라이 추가 증정','정식 주문 시 반찬 1종 추가','점심 특가 운영 중'], featuredMenu:['제육덮밥, 김치찌개 백반','불고기 정식, 비빔밥','순두부찌개, 육개장'], extraNotice:['매주 일요일 정기 휴무','','점심 11~14시 특가'] },
    menuname: { currentName:['제육덮밥','김치찌개 정식','순두부찌개','비빔밥','불고기 정식','육개장'], category:'한식', feature:['직화, 국내산 돼지','직접 담근 묵은지','얼큰함','집밥 정성'], ingredient:['국내산 돼지고기, 직접 담근 김치','묵은지, 국산 콩','국내산 나물 7가지'] },
    menudesc: { menuName:['제육덮밥','김치찌개','순두부찌개','비빔밥'], taste:['불향 가득한, 매콤달콤한','묵은지 진한, 얼큰한 국물','부드럽고 얼큰한, 해장에 좋은','나물 향 그윽한, 고추장 매콤한'], compose:['1인분 / 공깃밥·국·김치 포함','2인분 / 공깃밥 2개·반찬 3종','1인 정식 / 밥·반찬4종·국','곱빼기 / 반찬 3종 포함'] },
    reply:    { storeName:'한식 가게', review:'', rating:'5' },
  },
  gogi: {
    label: '🥩 고기·구이',
    intro:    { category:['고기구이 전문','숙성육 전문점','정통 삼겹살집'], mainMenu:['삼겹살, 목살, 갈비','숙성삼겹살, 목살, 양념갈비','삼겹살, 대패, 갈비'], feature:['저온 숙성 냉장육, 직접 구워 배달','매일 직접 썰어내는 1++ 한우','저온 숙성으로 풍미 극대화'], style:['2인분부터 주문','세트 가족 구성 다양'] },
    order:    { category:'고기구이', mainMenu:['삼겹살','목살, 삼겹살','양념갈비, 대패삼겹살'], includes:['쌈채소, 된장, 마늘','쌈채소, 된장국, 마늘','쌈채소, 김치, 된장'], allergy:'없음', spicy:'불가능', peakTime:['20~30분','25~30분'] },
    notice:   { storeName:['숙성고기집','삼겹살마을','한우갈비전문'], story:['저온 숙성 후 직접 구워 포장하는 삼겹살. 집에서도 매장 맛 그대로','매일 직접 썰어내는 1++ 한우, 저온 숙성으로 풍미 극대화','국내산 냉장 삼겹살·목살, 직접 구워 포장 배달'], event:['리뷰 작성 시 된장찌개 증정','2인 세트 주문 시 김치찌개 증정','매일 한정 30인분 — 숙성 삼겹살'], featuredMenu:['숙성삼겹살, 목살구이','한우갈비, 양념갈비','대패삼겹살, 삼겹+목살 세트'], extraNotice:['주말 가족 세트 20% 할인','','당일 조리 당일 포장'] },
    menuname: { currentName:['숙성삼겹살','목살구이','한우갈비','양념갈비','대패삼겹살'], category:'고기구이', feature:['저온 숙성, 직화 구이','기름 적고 담백','육즙 폭발','달콤한 양념'], ingredient:['국내산 냉장 삼겹살','국내산 목살','한우 갈비살, 비법 양념'] },
    menudesc: { menuName:['숙성삼겹살','목살구이','양념갈비'], taste:['쫀득하고 고소한, 육즙 가득','담백하고 부드러운, 기름 적은','달콤짭짤한, 부드러운 식감'], compose:['300g / 쌈채소·된장·마늘 포함','600g / 김치·쌈·된장국 포함','500g / 공깃밥·된장찌개'] },
    reply:    { storeName:'삼겹살 가게', review:'', rating:'5' },
  },
  western: {
    label: '🍝 양식',
    intro:    { category:['양식·파스타 전문','이탈리안 레스토랑','정통 양식당'], mainMenu:['크림파스타, 토마토파스타, 스테이크','트러플파스타, 로제, 스테이크','알리오올리오, 봉골레, 라자냐'], feature:['생면 사용, 수제 소스','이탈리아 유학파 셰프, 24시간 우린 토마토 소스','매일 뽑는 생면, 직접 만든 크림 소스'], style:['런치 세트 운영','2인 코스 추천'] },
    order:    { category:'파스타·양식', mainMenu:['크림파스타','토마토파스타, 봉골레','스테이크 세트'], includes:['빵, 피클','빵, 샐러드','피클, 소스'], allergy:['견과류','견과류, 유제품'], spicy:'불가능', peakTime:['15~20분','20~25분'] },
    notice:   { storeName:['파스타공방','이탈리아노','올리브레스토랑'], story:['매일 뽑아내는 생면 파스타와 24시간 끓인 토마토 소스. 이탈리아 유학파 셰프','매일 반죽하는 생면, 직접 만든 크림 소스로 정통 양식','현지 조리법 그대로, 생면부터 소스까지 모두 수제'], event:['리뷰 작성 시 갈릭브레드 증정','런치 세트 20% 할인','디너 2인 코스 예약 특가'], featuredMenu:['트러플크림파스타, 토마토로제','알리오올리오, 봉골레','스테이크 세트, 라자냐'], extraNotice:['매주 월요일 휴무','런치 11~15시','디너 예약 추천'] },
    menuname: { currentName:['트러플크림파스타','토마토로제','알리오올리오','봉골레','스테이크 세트','라자냐'], category:'양식', feature:['생면, 수제 소스','진한 풍미','담백한 마늘향','안심 스테이크, 프리미엄'], ingredient:['생면, 직접 만든 크림 소스','토마토, 생크림','바지락, 마늘'] },
    menudesc: { menuName:['트러플크림파스타','토마토로제','알리오올리오','봉골레'], taste:['진하고 고소한, 향 가득한','상큼하고 크리미한, 부드러운','마늘향 가득한, 담백한 오일','조개 우린 시원한, 화이트와인 향'], compose:['1인분 / 빵·피클 포함','런치 세트 / 샐러드·음료','1인분 / 빵·피클 포함'] },
    reply:    { storeName:'파스타 가게', review:'', rating:'5' },
  },
  asian: {
    label: '🍜 아시안',
    intro:    { category:['쌀국수·아시안 전문','베트남·태국 음식 전문','아시안 푸드 전문'], mainMenu:['쌀국수, 팟타이, 분짜','소고기쌀국수, 팟타이, 반미','팟타이, 똠양꿍, 그린커리'], feature:['12시간 우려낸 육수, 현지 재료 사용','현지 셰프 비법, 직수입 향신료','매일 우려내는 사골 육수, 현지식 조리'], style:['1인 세트 운영','매운맛 조절 가능'] },
    order:    { category:'아시안', mainMenu:['소고기 쌀국수','팟타이, 반미','분짜, 똠양꿍'], includes:['숙주, 라임, 소스','숙주, 라임, 고수','숙주, 라임, 고수, 칠리소스'], allergy:['없음','갑각류'], spicy:'가능', peakTime:['15~20분','20~25분'] },
    notice:   { storeName:['사이공쌀국수','방콕키친','현지반미'], story:['매일 12시간 우려내는 사골 육수와 현지에서 직수입한 향신료. 현지 셰프 비법 그대로','베트남·태국 현지 셰프가 만드는 정통 아시안 요리','매일 우려내는 사골 육수, 직수입 향신료로 현지 맛 재현'], event:['리뷰 작성 시 짜조 2개 증정','쌀국수 주문 시 반미 20% 할인','신메뉴 — 팟타이 시즐러'], featuredMenu:['소고기 쌀국수, 팟타이','분짜, 똠양꿍','그린커리, 반미'], extraNotice:['매주 화요일 휴무','','매운맛 조절 가능'] },
    menuname: { currentName:['소고기쌀국수','팟타이','분짜','똠양꿍','그린커리','반미'], category:'아시안', feature:['12시간 육수, 현지 재료','현지 그대로','새콤달콤','부드러운 코코넛'], ingredient:['사골 육수, 현지 향신료','쌀국수, 땅콩','코코넛 밀크, 현지 커리 페이스트'] },
    menudesc: { menuName:['소고기쌀국수','팟타이','분짜','그린커리'], taste:['시원하고 진한, 담백한','달콤짭짤한, 고소한 땅콩','새콤달콤한, 쫄깃한 국수','부드럽고 매콤한, 코코넛 향'], compose:['1인분 / 숙주·라임·고수 포함','1인분 / 숙주·라임 포함','1인분 / 야채·쌀국수 포함','1인분 / 밥·난 선택'] },
    reply:    { storeName:'아시안 가게', review:'', rating:'5' },
  },
  jokjang: {
    label: '🍻 야식·안주',
    intro:    { category:['야식·안주 전문','심야 포차','안주 전문점'], mainMenu:['닭발, 곱창, 막창, 먹태','국물닭발, 모듬곱창, 먹태','곱창, 막창, 오돌뼈'], feature:['매일 손질 국내산, 심야 운영','국내산 곱창, 매일 손질','직접 손질한 닭발, 비법 양념'], style:['새벽까지 영업','야식 세트 구성 다양'] },
    order:    { category:'야식·안주', mainMenu:['국물닭발','모듬곱창, 막창','무뼈닭발, 먹태'], includes:['주먹밥, 계란찜','공기밥, 김치','주먹밥 2개'], allergy:'없음', spicy:'가능', peakTime:['20~30분','25~35분'] },
    notice:   { storeName:['야식공장','심야포차','밤의맛집'], story:['매일 손질하는 국내산 곱창과 닭발. 술집 특유의 맛을 집에서도 그대로','20년 술집 경력 사장님, 매일 당일 손질 곱창과 비법 닭발 양념','새벽까지 영업하는 야식 전문점, 매일 국내산 재료 직접 손질'], event:['리뷰 작성 시 먹태 1봉 증정','야식 시간 10% 할인','신메뉴 — 매운 불족발'], featuredMenu:['국물닭발, 모듬곱창','무뼈닭발, 막창구이','오돌뼈볶음, 먹태'], extraNotice:['새벽 4시까지 영업','','해장 메뉴 아침까지'] },
    menuname: { currentName:['국물닭발','무뼈닭발','모듬곱창','막창구이','먹태 구이','오돌뼈볶음'], category:'야식·안주', feature:['매일 손질, 국내산','매운맛 강함, 술안주','뼈 없이 편한','곱 가득'], ingredient:['국내산 닭발, 비법 양념','소 곱창, 양념','살 두툼한 막창'] },
    menudesc: { menuName:['국물닭발','무뼈닭발','모듬곱창'], taste:['화끈하게 매운, 쫄깃한','매콤달콤한, 뼈 없이 편한','고소한 곱, 쫀득한 식감'], compose:['2인분 / 주먹밥·계란찜 포함','1인분 / 주먹밥 2개','3~4인분 / 볶음밥 포함'] },
    reply:    { storeName:'야식 가게', review:'', rating:'5' },
  },
  dosirak: {
    label: '🍙 도시락·죽·간편식',
    intro:    { category:['도시락 전문','수제 도시락','집밥 도시락'], mainMenu:['제육도시락, 불고기도시락, 돈까스도시락','제육도시락, 치킨마요, 스팸김치','불고기도시락, 참치마요, 돈까스'], feature:['당일 조리, 균형 잡힌 구성','매일 아침 조리, 밥·메인·반찬·국 구성','국내산 재료만 사용, 집밥 정성'], style:['1인분 합리적 가격','정기 주문 고객 추가 할인'] },
    order:    { category:'도시락', mainMenu:['제육도시락','치킨마요, 불고기도시락','참치마요, 돈까스도시락'], includes:['밥, 반찬3종, 국','밥, 반찬4종','밥, 단무지, 계란'], allergy:'없음', spicy:'가능', peakTime:['15~20분','20~25분'] },
    notice:   { storeName:['한끼도시락','집밥도시락','오늘도시락'], story:['매일 아침 조리하는 당일 도시락. 밥·메인·반찬 3종·국까지 균형 구성','직장인·학생 타깃 한끼 도시락, 매일 아침 공급 당일 조리 원칙','영양사 감수 균형 식단, 합리적 가격에 푸짐한 구성'], event:['리뷰 작성 시 계란후라이 추가 증정','주 5일 정기 주문 10% 할인','점심 특가 배달비 할인'], featuredMenu:['제육도시락, 치킨마요','불고기도시락, 돈까스','참치마요, 스팸김치'], extraNotice:['매주 일요일 휴무','','정기 주문 고객 우선 조리'] },
    menuname: { currentName:['제육도시락','치킨마요','불고기도시락','돈까스도시락','참치마요','스팸김치'], category:'도시락', feature:['당일 조리, 균형 구성','푸짐함','고소한 마요','간편한 한끼'], ingredient:['국내산 돼지, 직접 담근 김치','닭가슴살, 특제 마요네즈','국내산 돼지, 불고기 양념'] },
    menudesc: { menuName:['제육도시락','치킨마요','불고기도시락'], taste:['매콤달콤한, 푸짐한','고소하고 부드러운, 아이들 최애','달콤짭짤한, 부드러운 소고기'], compose:['1인분 550g / 밥·반찬3종·국 포함','1인분 / 밥·계란·단무지','1인분 / 밥·반찬4종 포함'] },
    reply:    { storeName:'도시락 가게', review:'', rating:'5' },
  },
};
const DEFAULT_FORM = {
  category:'', mainMenu:'', feature:'', style:'',
  includes:'공기밥, 김치', allergy:'', spicy:'가능', peakTime:'20~30분',
  storeName:'', story:'', event:'', featuredMenu:'', extraNotice:'',
  currentName:'', ingredient:'',
  menuName:'', taste:'', compose:'',
  review:'', rating:'5',
};

// 배열이면 랜덤 pick, 문자열이면 그대로
const pick = (v) => Array.isArray(v) ? v[Math.floor(Math.random() * v.length)] : v;

export default function AiModal({ item, onClose }) {
  const [form, setForm]       = useState({ ...DEFAULT_FORM });
  const [preset, setPreset]   = useState('');
  const [flash, setFlash]     = useState(0); // 필드 깜빡임 트리거
  const [result, setResult]   = useState('');
  const [loading, setLoading] = useState(false);
  const [copied, setCopied]   = useState(false);
  const type = item.aiType;
  const set  = (k, v) => setForm(f => ({ ...f, [k]: v }));

  function applyPresetWithRandom(key) {
    if (!key) return;
    const p = PRESETS[key]?.[type];
    if (!p) return;
    const next = {};
    Object.entries(p).forEach(([k, v]) => { next[k] = pick(v); });
    setForm(f => ({ ...f, ...next }));
    setFlash(n => n + 1);
  }

  function onPresetChange(key) {
    setPreset(key);
    applyPresetWithRandom(key);
  }

  function reroll() {
    if (!preset) { alert('먼저 업종을 선택해주세요.'); return; }
    applyPresetWithRandom(preset);
  }

  async function generate() {
    const required = {
      intro:    ['category','mainMenu'],
      order:    ['category','mainMenu'],
      notice:   ['storeName','story'],
      menuname: ['currentName','category'],
      menudesc: ['menuName','taste'],
      reply:    ['storeName','review','rating'],
    }[type] || [];
    if (required.some(k => !form[k])) { alert('필수 항목(*)을 모두 입력해주세요.'); return; }
    setLoading(true); setResult('');
    try {
      const res = await fetch('/api/generate', {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ type, storeInfo: form }),
      });
      const data = await res.json();
      setResult(data.result || data.error || '오류가 발생했습니다.');
    } catch { setResult('서버 연결 오류가 발생했습니다.'); }
    setLoading(false);
  }

  function copy() {
    navigator.clipboard.writeText(result);
    setCopied(true); setTimeout(() => setCopied(false), 2000);
  }

  const showPreset = ['intro','order','notice','menuname','menudesc'].includes(type);
  const flashStyle = { background: flash ? 'rgba(61,186,111,.18)' : '#0d0f10', transition: 'background .4s' };

  // 결과 출력 후 사장님 정체성 안내문 노출 여부
  // — 창작 영역(intro·notice·menuname·menudesc)에만 노출
  // — reply는 톤·구조가 이미 매우 구체적이라 제외, order는 항목 13에서 사용 안 함
  const showIdentityHint = ['intro','notice','menuname','menudesc'].includes(type);

  return (
    <div style={S.overlay} onClick={onClose}>
      <div style={S.modal} onClick={e => e.stopPropagation()}>
        <div style={S.mhead}>
          <div>
            <div style={S.mtitle}>✨ {item.aiLabel}</div>
            <div style={S.msub}>가게 정보를 입력하면 AI가 문구를 생성해드립니다</div>
          </div>
          <button style={S.closeBtn} onClick={onClose}>✕</button>
        </div>
        <div style={S.mbody}>

          {showPreset && (
            <div style={S.presetWrap}>
              <label style={S.presetLabel}>⚡ 업종 프리셋 <span style={{color:'#607570',fontWeight:400}}>(선택 시 자동 채움 · 🎲로 다른 조합)</span></label>
              <div style={S.presetRow}>
                <select style={S.presetSel} value={preset} onChange={e => onPresetChange(e.target.value)}>
                  <option value=''>직접 입력</option>
                  {Object.entries(PRESETS).map(([k,v]) => (
                    <option key={k} value={k}>{v.label}</option>
                  ))}
                </select>
                <button style={S.rerollBtn} onClick={reroll} title='같은 업종의 다른 예시로 다시 채우기' className='rerollBtn'>
                  <span className='diceIcon' style={{display:'inline-block',transition:'transform .4s'}}>🎲</span>
                  <span style={{fontSize:'13px',fontWeight:600}}>다시</span>
                </button>
              </div>
            </div>
          )}

          {type==='intro' && <>
            <div style={S.row}>
              <Field label="업종 *" placeholder="예: 제육볶음 전문점, 치킨집" value={form.category} onChange={v=>set('category',v)} flash={flashStyle} />
              <Field label="대표 메뉴 *" placeholder="예: 직화 제육볶음, 후라이드" value={form.mainMenu} onChange={v=>set('mainMenu',v)} flash={flashStyle} />
            </div>
            <Field label="특징/차별점" placeholder="예: 직화 불맛, 15년 전통, 국내산 재료" value={form.feature} onChange={v=>set('feature',v)} flash={flashStyle} />
            <Field label="운영 특이사항" placeholder="예: 1인분 주문 가능, 새벽 영업, 단체 주문 환영" value={form.style} onChange={v=>set('style',v)} flash={flashStyle} />
          </>}

          {type==='order' && <>
            <div style={S.row}>
              <Field label="업종 *" placeholder="예: 한식, 치킨, 분식" value={form.category} onChange={v=>set('category',v)} flash={flashStyle} />
              <Field label="대표 메뉴 *" placeholder="예: 제육볶음, 후라이드" value={form.mainMenu} onChange={v=>set('mainMenu',v)} flash={flashStyle} />
            </div>
            <div style={S.row}>
              <Field label="기본 제공 구성" placeholder="예: 공기밥, 김치, 수저" value={form.includes} onChange={v=>set('includes',v)} flash={flashStyle} />
              <Field label="알레르기 유발 식재료" placeholder="예: 견과류, 갑각류" value={form.allergy} onChange={v=>set('allergy',v)} flash={flashStyle} />
            </div>
            <div style={S.row}>
              <SelectField label="맵기 조절" value={form.spicy} onChange={v=>set('spicy',v)} options={['가능','불가능']} />
              <Field label="피크타임 조리 시간" placeholder="예: 20~30분" value={form.peakTime} onChange={v=>set('peakTime',v)} flash={flashStyle} />
            </div>
          </>}

          {type==='notice' && <>
            <Field label="가게명·업종 *" placeholder="예: 영일이아구찜 김해점 (아구찜 전문점)" value={form.storeName} onChange={v=>set('storeName',v)} flash={flashStyle} />
            <Field label="매장 스토리·비법·정성 *" placeholder="예: 15년 경력 사장님이 매일 새벽 어시장에서 직접 손질한 국산 아구만 사용" value={form.story} onChange={v=>set('story',v)} textarea flash={flashStyle} />
            <Field label="진행 중인 이벤트" placeholder="예: 리뷰이벤트 (수제만두 4개 증정), 첫 주문 2,000원 쿠폰" value={form.event} onChange={v=>set('event',v)} textarea flash={flashStyle} />
            <Field label="강조할 대표메뉴" placeholder="예: 된장술밥+제육 세트, 아구찜 中" value={form.featuredMenu} onChange={v=>set('featuredMenu',v)} flash={flashStyle} />
            <Field label="추가 안내사항" placeholder="예: 매주 월요일 정기휴무, 배달 지연 양해 부탁" value={form.extraNotice} onChange={v=>set('extraNotice',v)} textarea flash={flashStyle} />
          </>}

          {type==='menuname' && <>
            <div style={S.row}>
              <Field label="현재 메뉴명 *" placeholder="예: 제육볶음" value={form.currentName} onChange={v=>set('currentName',v)} flash={flashStyle} />
              <Field label="업종/음식 종류 *" placeholder="예: 한식, 볶음류" value={form.category} onChange={v=>set('category',v)} flash={flashStyle} />
            </div>
            <div style={S.row}>
              <Field label="조리 방식·특징" placeholder="예: 직화, 수제, 당일 손질" value={form.feature} onChange={v=>set('feature',v)} flash={flashStyle} />
              <Field label="주요 재료" placeholder="예: 국내산 돼지고기, 청양고추" value={form.ingredient} onChange={v=>set('ingredient',v)} flash={flashStyle} />
            </div>
          </>}

          {type==='menudesc' && <>
            <Field label="메뉴명 *" placeholder="예: 직화 불향 제육볶음" value={form.menuName} onChange={v=>set('menuName',v)} flash={flashStyle} />
            <Field label="맛·식감 *" placeholder="예: 불향 가득한 촉촉한 제육, 매콤달콤" value={form.taste} onChange={v=>set('taste',v)} flash={flashStyle} />
            <Field label="구성·용량" placeholder="예: 공기밥 포함, 350g, 1~2인분" value={form.compose} onChange={v=>set('compose',v)} flash={flashStyle} />
          </>}

          {type==='reply' && <>
            <Field label="가게명 *" placeholder="예: 영일이아구찜 창원점" value={form.storeName} onChange={v=>set('storeName',v)} />
            <Field label="고객 리뷰 *" placeholder="리뷰 본문을 붙여넣으세요" value={form.review} onChange={v=>set('review',v)} textarea />
            <SelectField label="별점 *" value={form.rating} onChange={v=>set('rating',v)} options={['1','2','3','4','5']} />
          </>}

          <button style={{ ...S.genBtn, opacity: loading ? 0.6 : 1 }} onClick={generate} disabled={loading}>
            {loading ? '생성 중...' : '✨ 문구 생성하기'}
          </button>

          {result && (
            <div style={S.resultWrap}>
              <div style={S.resultLabel}>생성된 문구</div>
              <pre style={S.resultText}>{result}</pre>

              {/* 사장님 정체성 안내문 — 창작 영역에만 자동 노출 */}
              {showIdentityHint && (
                <div style={S.resultHint}>
                  💡 이 제안에서 영감과 힌트를 얻어 사장님만의 정체성을 더해주세요
                </div>
              )}

              <div style={S.resultActions}>
                <button style={S.copyBtn} onClick={copy}>{copied ? '✓ 복사됨' : '복사하기'}</button>
                <button style={S.regenBtn} onClick={generate}>다시 생성</button>
              </div>
            </div>
          )}
        </div>
      </div>

      <style>{`
        .rerollBtn:hover { background: rgba(61,186,111,.12) !important; }
        .rerollBtn:hover .diceIcon { transform: rotate(180deg); }
        .rerollBtn:active { transform: scale(0.95); }
      `}</style>
    </div>
  );
}

function Field({ label, placeholder, value, onChange, textarea, flash }) {
  const inputStyle = { ...S.finput, ...(flash || {}) };
  return (
    <div style={S.field}>
      <label style={S.flabel}>{label}</label>
      {textarea
        ? <textarea style={{ ...inputStyle, height:'80px', resize:'vertical' }} placeholder={placeholder} value={value} onChange={e => onChange(e.target.value)} />
        : <input style={inputStyle} placeholder={placeholder} value={value} onChange={e => onChange(e.target.value)} />
      }
    </div>
  );
}

function SelectField({ label, value, onChange, options }) {
  return (
    <div style={S.field}>
      <label style={S.flabel}>{label}</label>
      <select style={S.finput} value={value} onChange={e => onChange(e.target.value)}>
        {options.map(o => <option key={o} value={o}>{o}</option>)}
      </select>
    </div>
  );
}

const S = {
  overlay: { position:'fixed', inset:0, background:'rgba(0,0,0,.78)', display:'flex', alignItems:'center', justifyContent:'center', zIndex:1000, padding:'16px' },
  modal: { background:'#16191a', border:'1px solid #2a2f30', borderRadius:'14px', width:'100%', maxWidth:'580px', maxHeight:'90vh', overflow:'auto', boxShadow:'0 24px 64px rgba(0,0,0,.6)' },
  mhead: { display:'flex', alignItems:'flex-start', justifyContent:'space-between', padding:'20px 20px 16px', borderBottom:'1px solid #2a2f30' },
  mtitle: { fontSize:'16px', fontWeight:700, color:'#e8ede8' },
  msub: { fontSize:'12px', color:'#607570', marginTop:'3px' },
  closeBtn: { background:'none', border:'none', color:'#607570', fontSize:'18px', cursor:'pointer', padding:'2px 6px' },
  mbody: { padding:'20px' },

  presetWrap: { marginBottom:'18px' },
  presetLabel: { display:'block', fontSize:'12px', fontWeight:500, color:'#3dba6f', marginBottom:'8px' },
  presetRow: { display:'flex', gap:'8px' },
  presetSel: { flex:1, background:'#1c2021', border:'1px solid rgba(61,186,111,.3)', borderRadius:'8px', padding:'10px 12px', fontSize:'14px', color:'#e8ede8', outline:'none', cursor:'pointer', fontFamily:'inherit' },
  rerollBtn: { flexShrink:0, padding:'0 14px', minWidth:'68px', background:'#1c2021', border:'1px solid rgba(61,186,111,.3)', borderRadius:'8px', color:'#3dba6f', fontSize:'16px', cursor:'pointer', display:'flex', alignItems:'center', justifyContent:'center', gap:'4px', whiteSpace:'nowrap', transition:'background .2s, transform .1s' },

  row: { display:'flex', gap:'12px' },
  field: { flex:1, marginBottom:'14px' },
  flabel: { display:'block', fontSize:'12px', fontWeight:600, color:'#9aada6', marginBottom:'6px' },
  finput: { width:'100%', background:'#0d0f10', border:'1px solid #2a2f30', borderRadius:'7px', padding:'9px 12px', fontSize:'13px', color:'#e8ede8', outline:'none', boxSizing:'border-box', fontFamily:'inherit' },

  genBtn: { width:'100%', background:'#3dba6f', border:'none', borderRadius:'8px', padding:'12px', fontSize:'14px', fontWeight:700, color:'#fff', cursor:'pointer', marginTop:'4px' },
  resultWrap: { marginTop:'16px', background:'#0d0f10', border:'1px solid #2a2f30', borderLeft:'3px solid #e8a020', borderRadius:'8px', padding:'14px' },
  resultLabel: { fontSize:'10px', fontWeight:700, color:'#e8a020', letterSpacing:'.07em', textTransform:'uppercase', marginBottom:'8px' },
  resultText: { fontSize:'13px', color:'#e8ede8', lineHeight:1.7, whiteSpace:'pre-wrap', margin:0, fontFamily:'inherit' },

  // AI 결과 출력 후 사장님 정체성 안내문
  resultHint: {
    marginTop: '12px',
    padding: '10px 12px',
    background: 'rgba(61,186,111,.08)',
    border: '1px solid rgba(61,186,111,.25)',
    borderRadius: '6px',
    fontSize: '12px',
    color: '#7acf9a',
    lineHeight: 1.6,
  },

  resultActions: { display:'flex', gap:'8px', marginTop:'12px' },
  copyBtn: { background:'#1e4a32', border:'1px solid #3dba6f', borderRadius:'6px', padding:'7px 14px', fontSize:'12px', fontWeight:600, color:'#3dba6f', cursor:'pointer' },
  regenBtn: { background:'none', border:'1px solid #2a2f30', borderRadius:'6px', padding:'7px 14px', fontSize:'12px', color:'#9aada6', cursor:'pointer' },
};
