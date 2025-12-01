# 블로그 이메일 구독 기능 PRD (Product Requirements Document)

## 📄 문서 정보

- **프로젝트명**: 개인 블로그 이메일 구독 시스템
- **작성일**: 2025-12-01
- **버전**: v1.0
- **상태**: 설계 완료, 구현 대기 중

---

## 1. 개요 (Overview)

### 1.1 목적 (Purpose)
블로그 독자가 새로운 글이 발행될 때 이메일로 자동 알림을 받을 수 있는 무료 구독 시스템을 구현하여 독자 참여도를 높이고 지속적인 관계를 유지한다.

### 1.2 목표 (Goals)
- 새 글 발행 시 구독자에게 자동 이메일 알림 전송
- 간편한 구독 신청 및 취소 프로세스 제공
- 이중 인증(Double Opt-in)을 통한 스팸 방지 및 보안 강화
- 무료 서비스로 운영 가능한 비용 효율적인 솔루션

### 1.3 범위 (Scope)

**포함 사항**:
- ✅ 이메일 주소 기반 무료 구독 시스템
- ✅ 이중 인증(Double Opt-in) 프로세스
- ✅ 새 글 발행 시 자동 이메일 발송
- ✅ 구독 취소(Unsubscribe) 기능
- ✅ 구독자 관리 데이터베이스

**제외 사항**:
- ❌ 유료 구독 모델
- ❌ 사용자 계정 시스템 (이메일 주소만 수집)
- ❌ 카테고리별 선택 구독 (1차 버전 제외)
- ❌ 구독자 대시보드 (관리자 기능만 구현)

---

## 2. 사용자 시나리오 (User Stories)

### 2.1 독자 (Reader)
```
AS A blog reader
I WANT TO subscribe to email notifications
SO THAT I can be notified when new posts are published
```

**Acceptance Criteria**:
- 이메일 주소만으로 간편하게 구독 신청 가능
- 구독 확인 이메일을 받고 링크 클릭으로 인증 완료
- 새 글 발행 시 이메일 알림 수신
- 언제든지 원클릭으로 구독 취소 가능

### 2.2 블로그 운영자 (Blog Owner)
```
AS A blog owner
I WANT TO send email notifications to subscribers
SO THAT I can engage readers and increase traffic
```

**Acceptance Criteria**:
- 새 글 발행 시 자동으로 구독자에게 이메일 발송
- 구독자 수 및 통계 확인 가능 (선택적)
- 이메일 전달률 모니터링 가능
- 스팸 신고 방지를 위한 검증된 구독자 관리

---

## 3. 기술 아키텍처 (Technical Architecture)

### 3.1 시스템 구성도

```
┌─────────────────────────────────────────────────────────────┐
│                    Frontend (Next.js App)                    │
├─────────────────────────────────────────────────────────────┤
│  • Subscription Form Component                              │
│  • Email Verification Page                                  │
│  • Unsubscribe Page                                         │
└────────────────────┬────────────────────────────────────────┘
                     │
                     ▼
┌─────────────────────────────────────────────────────────────┐
│                API Routes (Next.js Backend)                  │
├─────────────────────────────────────────────────────────────┤
│  • POST /api/subscribe       - 구독 신청                    │
│  • GET  /api/verify          - 이메일 인증                  │
│  • GET  /api/unsubscribe     - 구독 취소                    │
│  • POST /api/notify          - 알림 발송 (내부)            │
└────────────┬───────────────────────────┬────────────────────┘
             │                           │
             ▼                           ▼
┌───────────────────────┐   ┌──────────────────────────┐
│  Database (PostgreSQL)│   │ Email Service (Resend)   │
│  • subscribers table  │   │ • Verification emails    │
│  • notification_logs  │   │ • Notification emails    │
└───────────────────────┘   └──────────────────────────┘
```

### 3.2 기술 스택

| 계층 | 기술 | 선택 이유 |
|------|------|----------|
| **Frontend** | Next.js 14+ (React) | 프로젝트 기존 스택 유지 |
| **Backend** | Next.js API Routes | 서버리스 아키텍처, 간편한 배포 |
| **Database** | PostgreSQL (Vercel Postgres) | 무료 티어, Vercel 통합 |
| **Email Service** | Resend | 무료 3,000통/월, Next.js 파트너 |
| **ORM** | Prisma | TypeScript 지원, 마이그레이션 관리 |
| **Validation** | Zod | TypeScript 타입 안전성 |
| **Rate Limiting** | Upstash Redis 또는 In-memory | DoS 공격 방지 |

### 3.3 데이터베이스 스키마

```sql
-- Subscribers Table
CREATE TABLE subscribers (
  id                 SERIAL PRIMARY KEY,
  email              VARCHAR(254) UNIQUE NOT NULL,
  verified           BOOLEAN DEFAULT FALSE,
  verification_token VARCHAR(64) UNIQUE,
  unsubscribe_token  VARCHAR(64) UNIQUE NOT NULL,
  created_at         TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  verified_at        TIMESTAMP,
  last_notified_at   TIMESTAMP,

  INDEX idx_email (email),
  INDEX idx_verified (verified),
  INDEX idx_verification_token (verification_token),
  INDEX idx_unsubscribe_token (unsubscribe_token)
);

-- Notification Logs Table (Optional)
CREATE TABLE notification_logs (
  id             SERIAL PRIMARY KEY,
  subscriber_id  INTEGER NOT NULL,
  post_slug      VARCHAR(255) NOT NULL,
  sent_at        TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  status         VARCHAR(20), -- 'sent', 'failed', 'bounced'

  FOREIGN KEY (subscriber_id) REFERENCES subscribers(id),
  INDEX idx_post_slug (post_slug),
  INDEX idx_sent_at (sent_at)
);
```

---

## 4. 기능 명세 (Feature Specifications)

### 4.1 구독 신청 (Subscription)

#### UI/UX
- **위치**: 블로그 메인 페이지 하단 또는 사이드바
- **입력 필드**: 이메일 주소 (single input)
- **버튼**: "구독하기" CTA
- **상태 표시**:
  - 처리 중: "처리 중..." (버튼 비활성화)
  - 성공: 녹색 메시지 박스 "인증 이메일을 확인해주세요"
  - 실패: 빨간색 메시지 박스 에러 메시지

#### 비즈니스 로직
1. 이메일 형식 검증 (클라이언트 + 서버)
2. 중복 확인: 이미 구독 중인 경우 안내 메시지
3. 구독자 레코드 생성 (verified=false)
4. 인증 토큰 및 구독 취소 토큰 생성
5. 인증 이메일 발송
6. 성공 응답 반환

#### API 스펙
```typescript
// POST /api/subscribe
Request: {
  email: string  // max 254자
}

Response: {
  success: boolean
  message: string  // "인증 이메일이 발송되었습니다."
}

Error Codes:
- 400: 잘못된 이메일 형식
- 409: 이미 구독 중
- 429: Rate limit 초과
- 500: 서버 오류
```

### 4.2 이메일 인증 (Verification)

#### 사용자 플로우
1. 이메일 수신 (제목: "이메일 구독 인증")
2. "구독 인증하기" 버튼 클릭
3. 브라우저에서 인증 페이지 열림
4. 자동으로 verified=true 업데이트
5. 환영 이메일 발송
6. "구독이 완료되었습니다!" 페이지 표시

#### 비즈니스 로직
1. 토큰 유효성 검증
2. 구독자 레코드 조회
3. verified 필드 업데이트
4. verification_token 삭제 (일회용)
5. 환영 이메일 발송
6. 성공 페이지로 리다이렉트

#### API 스펙
```typescript
// GET /api/verify?token={verification_token}
Parameters: {
  token: string  // URL 파라미터
}

Success: Redirect to /verified
Error: Redirect to /error?message={error_code}

Error Codes:
- invalid_token: 잘못된 인증 링크
- already_verified: 이미 인증 완료
- server_error: 서버 오류
```

### 4.3 구독 취소 (Unsubscribe)

#### 사용자 플로우
1. 이메일 하단 "구독 취소" 링크 클릭
2. 확인 없이 즉시 구독 취소 처리
3. "구독이 취소되었습니다" 페이지 표시
4. DB에서 구독자 레코드 삭제

#### 비즈니스 로직
1. unsubscribe_token 검증
2. 구독자 레코드 조회
3. 레코드 삭제 (GDPR 준수)
4. 성공 페이지로 리다이렉트

#### API 스펙
```typescript
// GET /api/unsubscribe?token={unsubscribe_token}
Parameters: {
  token: string  // URL 파라미터
}

Success: Redirect to /unsubscribed
Error: Redirect to /error?message={error_code}

Error Codes:
- invalid_token: 잘못된 링크
- not_found: 구독자 없음
- server_error: 서버 오류
```

### 4.4 알림 발송 (Notification)

#### 트리거 조건
- 새 블로그 글 발행 시 수동 또는 자동 실행
- 내부 API 호출 (Authorization 헤더 필요)

#### 비즈니스 로직
1. 인증된 구독자 목록 조회 (verified=true)
2. 이메일 배치 처리 (100명씩)
3. 각 구독자에게 알림 이메일 발송
4. last_notified_at 업데이트
5. 전송 결과 반환 (성공/실패 수)

#### API 스펙
```typescript
// POST /api/notify (Internal Only)
Headers: {
  Authorization: Bearer {INTERNAL_API_SECRET}
}

Request: {
  postSlug: string
  postTitle: string
  postExcerpt: string
  postUrl: string
}

Response: {
  sent: number      // 성공한 이메일 수
  failed: number    // 실패한 이메일 수
  total: number     // 총 구독자 수
}

Error Codes:
- 401: Unauthorized (잘못된 시크릿)
- 500: 서버 오류
```

---

## 5. 이메일 템플릿

### 5.1 인증 이메일
```
제목: 이메일 구독 인증

본문:
안녕하세요!

블로그 구독을 완료하려면 아래 버튼을 클릭해주세요.

[구독 인증하기] (버튼)

또는 이 링크를 복사하세요:
{verificationUrl}

---
이 이메일을 요청하지 않으셨다면 무시하셔도 됩니다.
```

### 5.2 환영 이메일
```
제목: 구독이 완료되었습니다!

본문:
구독을 환영합니다!

새로운 블로그 글이 발행되면 이메일로 알려드리겠습니다.

---
구독 취소: {unsubscribeUrl}
```

### 5.3 알림 이메일
```
제목: 새 글: {postTitle}

본문:
{postTitle}

{postExcerpt}

[전체 글 읽기] (버튼 → {postUrl})

---
구독 취소: {unsubscribeUrl}
```

---

## 6. 보안 요구사항 (Security Requirements)

### 6.1 입력 검증
- ✅ 이메일 형식 검증 (RFC 5322)
- ✅ 이메일 길이 제한 (최대 254자)
- ✅ 클라이언트 + 서버 이중 검증
- ✅ SQL Injection 방지 (Prisma ORM)
- ✅ XSS 방지 (React 자동 이스케이핑)

### 6.2 인증 및 권한
- ✅ Double Opt-in 이중 인증
- ✅ 일회용 인증 토큰 (사용 후 삭제)
- ✅ 안전한 토큰 생성 (crypto.randomBytes)
- ✅ 내부 API 시크릿 인증 (Bearer Token)

### 6.3 Rate Limiting
- ✅ 구독 신청: IP당 시간당 5회 제한
- ✅ 이메일 발송: 분당 100통 제한 (Resend)
- ✅ API 엔드포인트: 일반적인 Rate Limit 적용

### 6.4 데이터 프라이버시
- ✅ 최소 정보 수집 (이메일만)
- ✅ 구독 취소 시 즉시 삭제 (GDPR Article 17)
- ✅ 개인정보 처리방침 페이지 제공
- ✅ 이메일 암호화 전송 (TLS)

### 6.5 CSRF 방어
- ✅ SameSite 쿠키 설정 (Strict)
- ✅ Origin 헤더 검증
- ✅ credentials: 'same-origin' 설정

---

## 7. 성능 요구사항 (Performance Requirements)

### 7.1 응답 시간
| API 엔드포인트 | 목표 응답 시간 | 최대 허용 |
|---------------|---------------|----------|
| POST /api/subscribe | < 500ms | 1s |
| GET /api/verify | < 300ms | 500ms |
| GET /api/unsubscribe | < 300ms | 500ms |
| POST /api/notify (100명) | < 10s | 30s |

### 7.2 이메일 전달률
- **목표**: > 95% 전달률
- **바운스율**: < 5%
- **스팸 신고율**: < 0.1%

### 7.3 확장성
- **초기 목표**: 1,000명 구독자 지원
- **중기 목표**: 10,000명 구독자 지원
- **배치 처리**: 100명씩 그룹화하여 순차 전송

---

## 8. 구현 로드맵 (Implementation Roadmap)

### Phase 1: 데이터베이스 설정 (1일)
- [x] Prisma 설정 및 스키마 정의
- [x] PostgreSQL 연결 및 마이그레이션
- [x] Prisma Client 싱글톤 생성
- [ ] 로컬 환경 테스트

**Quality Gate**:
- ✅ Migration 성공
- ✅ Prisma Studio에서 데이터 조작 가능

### Phase 2: 구독 API 구현 (2일)
- [ ] Email validation utils 작성
- [ ] Token generation 함수 구현
- [ ] POST /api/subscribe 엔드포인트
- [ ] GET /api/unsubscribe 엔드포인트
- [ ] Unit tests 작성

**Quality Gate**:
- ✅ API 테스트 통과 (Postman/curl)
- ✅ 중복 이메일 검증 확인
- ✅ 에러 핸들링 검증

### Phase 3: 이메일 인증 플로우 (2일)
- [ ] Resend API 설정
- [ ] 이메일 템플릿 작성
- [ ] sendVerificationEmail 함수
- [ ] sendWelcomeEmail 함수
- [ ] GET /api/verify 엔드포인트
- [ ] 통합 테스트

**Quality Gate**:
- ✅ 인증 이메일 수신 확인
- ✅ 인증 완료 후 DB 업데이트
- ✅ Welcome 이메일 수신

### Phase 4: 알림 시스템 (2일)
- [ ] POST /api/notify 엔드포인트
- [ ] sendNotificationEmail 함수
- [ ] 배치 처리 로직 (100명씩)
- [ ] 에러 핸들링 및 재시도
- [ ] 로깅 시스템

**Quality Gate**:
- ✅ 내부 API 인증 검증
- ✅ 100명 이상 배치 전송 테스트
- ✅ 이메일 전달률 > 95%

### Phase 5: Frontend UI (2일)
- [x] SubscriptionForm 컴포넌트 생성
- [ ] /verified 성공 페이지
- [ ] /unsubscribed 페이지
- [ ] /error 에러 페이지
- [ ] Privacy Policy 페이지
- [ ] 반응형 디자인 적용

**Quality Gate**:
- ✅ 모바일/데스크톱 반응형 확인
- ✅ 접근성 검증 (WCAG 2.1 AA)
- ✅ 다크모드 지원

### Phase 6: 테스팅 및 배포 (2일)
- [ ] Unit tests 작성
- [ ] E2E tests (Playwright)
- [ ] Security review 적용
- [ ] Rate limiting 구현
- [ ] CSP 헤더 설정
- [ ] Vercel 배포
- [ ] 프로덕션 환경 테스트

**Quality Gate**:
- ✅ 모든 테스트 통과
- ✅ Security checklist 완료
- ✅ 프로덕션 환경 검증

---

## 9. 위험 관리 (Risk Management)

### 9.1 기술적 위험

| 위험 | 가능성 | 영향도 | 완화 전략 |
|------|--------|--------|----------|
| 이메일 스팸 필터링 | 중간 | 높음 | SPF/DKIM 설정, 평판 관리 |
| Rate limit 초과 | 낮음 | 중간 | Resend 무료 한도 모니터링 |
| Database 장애 | 낮음 | 높음 | Vercel Postgres 자동 백업 |
| API 성능 저하 | 중간 | 중간 | 배치 처리, 캐싱 |

### 9.2 비즈니스 위험

| 위험 | 가능성 | 영향도 | 완화 전략 |
|------|--------|--------|----------|
| 스팸 신고 | 낮음 | 높음 | Double Opt-in, 명확한 구독 취소 |
| GDPR 위반 | 낮음 | 매우 높음 | Privacy Policy, 즉시 삭제 |
| 낮은 구독률 | 중간 | 낮음 | UX 개선, 가치 제안 명확화 |

---

## 10. 성공 지표 (Success Metrics)

### 10.1 기술 지표
- **시스템 가용성**: > 99.5%
- **API 응답 시간**: < 500ms (P95)
- **이메일 전달률**: > 95%
- **에러율**: < 1%

### 10.2 비즈니스 지표
- **구독 전환율**: 방문자의 3-5% 구독 신청
- **인증 완료율**: 구독 신청의 70% 이상 인증 완료
- **이메일 오픈율**: > 20%
- **구독 취소율**: < 5%

---

## 11. 배포 체크리스트 (Deployment Checklist)

### 11.1 환경 변수 설정
```bash
RESEND_API_KEY=re_xxxxxxxxxxxxx
NEXT_PUBLIC_BASE_URL=https://yourdomain.com
DATABASE_URL=postgresql://...
INTERNAL_API_SECRET=xxxxxxxxxxxxx
NODE_ENV=production
```

### 11.2 인프라 설정
- [ ] Vercel 프로젝트 생성
- [ ] Vercel Postgres 데이터베이스 연결
- [ ] Resend 도메인 인증 (SPF/DKIM)
- [ ] 환경 변수 설정 (Production)
- [ ] Custom domain 설정 (선택)

### 11.3 보안 설정
- [ ] CSP 헤더 설정
- [ ] Rate limiting 활성화
- [ ] HTTPS 강제 적용
- [ ] Security headers 검증

### 11.4 모니터링 설정
- [ ] Resend Dashboard 확인
- [ ] Vercel Analytics 설정
- [ ] Error tracking (Sentry 선택적)
- [ ] 이메일 전달률 모니터링

---

## 12. 향후 개선 사항 (Future Enhancements)

### v2.0 (중기)
- [ ] 카테고리별 선택 구독
- [ ] 주간 다이제스트 옵션
- [ ] 관리자 대시보드 (구독자 통계)
- [ ] A/B 테스팅 (이메일 제목)

### v3.0 (장기)
- [ ] RSS to Email 자동 변환
- [ ] 구독자 세그먼테이션
- [ ] 개인화된 추천 콘텐츠
- [ ] 분석 및 인사이트 대시보드

---

## 13. 참고 문서 (References)

### 내부 문서
- [Technical Design Document](/claudedocs/email-subscription-technical-design.md)
- [Security Review Report](/claudedocs/email-subscription-security-review.md)
- [API Specification](/claudedocs/email-subscription-api-spec.md)

### 외부 리소스
- [Resend Documentation](https://resend.com/docs)
- [Prisma Documentation](https://www.prisma.io/docs)
- [Next.js API Routes](https://nextjs.org/docs/api-routes/introduction)
- [GDPR Guidelines](https://gdpr.eu/)
- [Email Best Practices](https://sendgrid.com/resource/email-best-practices/)

---

## 부록 A: 용어 정리 (Glossary)

- **Double Opt-in**: 이중 인증 방식. 구독 신청 후 이메일 인증까지 완료해야 정식 구독자로 등록
- **SPF/DKIM**: 이메일 인증 프로토콜. 스팸 필터링 회피를 위한 도메인 인증
- **Rate Limiting**: 특정 시간 내 요청 횟수 제한. DoS 공격 방지
- **GDPR**: EU 개인정보 보호 규정. 사용자 데이터 삭제 권리 보장
- **CSP**: Content Security Policy. XSS 공격 방지를 위한 HTTP 헤더

---

## 변경 이력 (Change Log)

| 버전 | 날짜 | 변경 내용 | 작성자 |
|------|------|----------|--------|
| v1.0 | 2025-12-01 | 최초 문서 작성 | System Architect |
| | | - 기본 기능 명세 완료 | |
| | | - 보안 요구사항 정의 | |
| | | - 6단계 구현 로드맵 수립 | |

---

**문서 승인**:
- [ ] 프로덕트 매니저
- [ ] 시니어 개발자
- [ ] 보안 담당자
- [ ] UI/UX 디자이너
