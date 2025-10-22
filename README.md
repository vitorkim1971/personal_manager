# 개인 업무/재정 관리 시스템

Next.js 기반의 개인 업무 및 재정을 통합 관리하는 웹 애플리케이션입니다.

## 주요 기능

### 1. 대시보드
- 주요 지표 실시간 통계
- 오늘의 할 일, 월별 재정 요약
- 수입/지출 추이 차트 (최근 30일)
- 카테고리별 지출 분포 (파이 차트)

### 2. 업무 관리
- 작업 생성, 수정, 삭제
- 우선순위별 색상 표시 (높음/보통/낮음)
- 마감일 관리 및 알림
- 상태 관리 (할 일/진행 중/완료)
- 필터 및 정렬 기능

### 3. 재정 관리
- 수입/지출 거래 기록
- 월별 재정 요약 (수입, 지출, 순수익)
- 카테고리별 분석
- 전월 대비 증감률 표시

### 4. 프로젝트 관리
- 프로젝트 생성, 수정, 삭제
- 진행률 트래킹 (0-100%)
- 프로젝트별 수익 계산
- 작업 및 거래 연결 지원

### 5. 설정 및 백업
- 데이터 백업 (JSON 내보내기)
- 데이터 복원 (JSON 가져오기)
- 사용자 정보 관리

## 기술 스택

- **Frontend**: Next.js 15, React 19, TypeScript 5
- **Styling**: Tailwind CSS 4
- **Database**: SQLite (better-sqlite3)
- **Charts**: Recharts
- **State Management**: Zustand
- **Date Handling**: date-fns

## 설치 및 실행

### 1. 의존성 설치

```bash
npm install
```

### 2. 개발 서버 실행

```bash
npm run dev
```

브라우저에서 [http://localhost:3000](http://localhost:3000) 접속

### 3. 프로덕션 빌드

```bash
npm run build
npm start
```

## 데이터베이스

SQLite 데이터베이스가 자동으로 생성됩니다 (`personal-manager.db`).

### 테이블 구조
- **tasks**: 작업 정보
- **transactions**: 거래 내역
- **projects**: 프로젝트 정보
- **budgets**: 예산 정보
- **settings**: 설정 정보

## API 엔드포인트

### 작업 (Tasks)
- `GET /api/tasks` - 작업 목록
- `POST /api/tasks` - 작업 생성
- `PUT /api/tasks/[id]` - 작업 수정
- `DELETE /api/tasks/[id]` - 작업 삭제

### 거래 (Transactions)
- `GET /api/transactions` - 거래 내역
- `POST /api/transactions` - 거래 기록
- `PUT /api/transactions/[id]` - 거래 수정
- `DELETE /api/transactions/[id]` - 거래 삭제

### 프로젝트 (Projects)
- `GET /api/projects` - 프로젝트 목록
- `POST /api/projects` - 프로젝트 생성
- `PUT /api/projects/[id]` - 프로젝트 수정
- `DELETE /api/projects/[id]` - 프로젝트 삭제

### 통계 (Stats)
- `GET /api/stats?type=today` - 오늘의 할 일 통계
- `GET /api/stats?type=monthly` - 월별 재정 요약
- `GET /api/stats?type=trends` - 최근 30일 추이
- `GET /api/stats?type=categories` - 카테고리별 집계

### 백업 (Backup)
- `GET /api/backup?action=export` - 데이터 내보내기
- `POST /api/backup?action=import` - 데이터 가져오기

## 프로젝트 구조

```
personal-manager/
├── app/                    # Next.js App Router
│   ├── api/               # API Routes
│   ├── dashboard/         # 대시보드 페이지
│   ├── tasks/             # 업무 관리 페이지
│   ├── finance/           # 재정 관리 페이지
│   ├── projects/          # 프로젝트 페이지
│   └── settings/          # 설정 페이지
├── components/
│   ├── ui/               # 기본 UI 컴포넌트
│   ├── layout/           # 레이아웃 컴포넌트
│   └── features/         # 기능별 컴포넌트
├── lib/
│   ├── db.ts            # 데이터베이스 설정
│   └── utils.ts         # 유틸리티 함수
├── types/
│   └── index.ts         # TypeScript 타입 정의
└── store/
    └── index.ts         # 상태 관리
```

## 디자인 시스템

### 색상
- Deep Navy: `#0f1419` (사이드바, 헤더)
- Metal Blue: `#4a6fa5` (액센트, 버튼)
- Accent Cyan: `#70d6ff` (포인트)
- Background: `#f8f9fc` (페이지 배경)

### 상태별 색상
- 수입: 초록 (`#10b981`)
- 지출: 빨강 (`#ef4444`)
- 완료: 초록
- 진행중: 보라
- 할 일: 파랑

## 개발 로드맵

### ✅ Phase 1 (MVP) - 완료
- 기본 UI 레이아웃
- 업무 관리 기능
- 재정 관리 기능
- 대시보드 및 차트
- 프로젝트 관리
- 데이터 백업/복원

### 🚀 Phase 2 (향후 계획)
- 예산 관리 및 알림
- 캘린더 뷰
- 파일 관리
- 리포트 PDF 내보내기
- 다크 모드
- 모바일 반응형 개선

## 라이선스

MIT License
