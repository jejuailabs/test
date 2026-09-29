// Verified publisher homepages (2026-09-29). Editorial email addresses are intentionally blank
// unless the user confirms the correct desk or submission route.
const rows = [
  ['jeju-ihalla', '한라일보', '제주 지역', '제주', '지역 종합', 'https://www.ihalla.com'],
  ['jeju-jemin', '제민일보', '제주 지역', '제주', '지역 종합', 'https://www.jemin.com'],
  ['jeju-ilbo', '제주일보', '제주 지역', '제주', '지역 종합', 'https://www.jejunews.com'],
  ['jeju-maeil', '제주매일', '제주 지역', '제주', '지역 종합', 'https://www.jejumaeil.net'],
  ['jeju-headline', '헤드라인제주', '제주 지역', '제주', '지역 현안', 'https://www.headlinejeju.co.kr'],
  ['jeju-sori', '제주의소리', '제주 지역', '제주', '지역 현안', 'https://www.jejusori.net'],
  ['jeju-media', '미디어제주', '제주 지역', '제주', '지역 종합', 'https://www.mediajeju.com'],
  ['jeju-jibs', 'JIBS제주방송', '제주 지역', '제주', '지역 방송', 'https://www.jibs.co.kr'],
  ['jeju-mbc', '제주MBC', '제주 지역', '제주', '지역 방송', 'https://www.jejumbc.com'],
  ['jeju-kctv', 'KCTV제주방송', '제주 지역', '제주', '지역 방송', 'https://www.kctvjeju.com'],
  ['national-yna', '연합뉴스', '전국 종합', '전국', '종합·통신', 'https://www.yna.co.kr'],
  ['national-newsis', '뉴시스', '전국 종합', '전국', '종합·통신', 'https://www.newsis.com'],
  ['national-news1', '뉴스1', '전국 종합', '전국', '종합·통신', 'https://www.news1.kr'],
  ['national-hani', '한겨레', '전국 종합', '전국', '종합', 'https://www.hani.co.kr'],
  ['national-khan', '경향신문', '전국 종합', '전국', '종합', 'https://www.khan.co.kr'],
  ['national-chosun', '조선일보', '전국 종합', '전국', '종합', 'https://www.chosun.com'],
  ['national-joongang', '중앙일보', '전국 종합', '전국', '종합', 'https://www.joongang.co.kr'],
  ['national-donga', '동아일보', '전국 종합', '전국', '종합', 'https://www.donga.com'],
  ['business-hankyung', '한국경제', '경제·산업', '전국', '경제·기업', 'https://www.hankyung.com'],
  ['business-mk', '매일경제', '경제·산업', '전국', '경제·기업', 'https://www.mk.co.kr'],
  ['business-sedaily', '서울경제', '경제·산업', '전국', '경제·기업', 'https://www.sedaily.com'],
  ['business-edaily', '이데일리', '경제·산업', '전국', '경제·기업', 'https://www.edaily.co.kr'],
  ['business-fnnews', '파이낸셜뉴스', '경제·산업', '전국', '경제·기업', 'https://www.fnnews.com'],
  ['tech-zdnet', '지디넷코리아', '기술·스타트업', '전국', 'IT·기술', 'https://zdnet.co.kr'],
  ['tech-bloter', '블로터', '기술·스타트업', '전국', 'IT·경제', 'https://www.bloter.net'],
  ['tech-etnews', '전자신문', '기술·스타트업', '전국', 'IT·산업', 'https://www.etnews.com'],
  ['tech-platum', '플래텀', '기술·스타트업', '전국', '스타트업', 'https://platum.kr'],
  ['tech-venturesquare', '벤처스퀘어', '기술·스타트업', '전국', '스타트업', 'https://www.venturesquare.net'],
  ['tech-itchosun', 'IT조선', '기술·스타트업', '전국', 'IT·비즈니스', 'https://it.chosun.com'],
  ['travel-times', '여행신문', '여행·관광', '전국', '여행·관광', 'https://www.traveltimes.co.kr']
];

export const OUTLETS = rows.map(([id, name, category, region, topic, url]) => ({
  id, name, category, region, topic, url, sourceUrl: url,
  type: '언론사', language: '한국어', contact: '', selected: false,
  excluded: false, lastContact: '', relation: '미접촉', verifiedAt: '2026-09-29'
}));
