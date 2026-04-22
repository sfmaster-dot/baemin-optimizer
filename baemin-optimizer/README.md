# 배민 가게정보 최적화 체크리스트

배달의민족 셀프서비스 가게정보 9개 항목 체크리스트 + AI 문구 생성 도구

## 배포 (Vercel)

1. GitHub에 push
2. Vercel에서 프로젝트 연결
3. Environment Variables에 `ANTHROPIC_API_KEY` 추가
4. 자동 배포

## 로컬 개발

```bash
npm install
# .env.local 파일 생성 후 ANTHROPIC_API_KEY=sk-... 추가
npm run dev
```
