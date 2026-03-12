# Billi Server — Claude 코딩 룰 (NestJS Game Platform)

---

## 1. 프로젝트 개요

- **Framework**: NestJS
- **Language**: TypeScript
- **Database**: MySQL + TypeORM (`synchronize: false` 엄수)
- **Cache**: Redis (ioredis)
- **Queue**: BullMQ
- **WebSocket**: Socket.IO
- **Logging**: Winston (nest-winston) — `wLogger` 전용
- **View**: Handlebars (hbs) — 어드민 전용
- **Validation**: class-validator + class-transformer
- **Scheduler**: @nestjs/schedule

> 특정 라이브러리 버전에 종속된 코드를 생성하지 않는다. 버전 호환성 이슈가 예상될 경우 주석으로 명시한다.

---

## 2. Claude 응답 원칙

### 2-1. 설명 방식 — 간결함 우선
- 설명은 **핵심 포인트만** 작성한다. 자명한 코드에 장황한 설명을 붙이지 않는다.
- 설명이 필요한 경우: ① 비직관적인 로직, ② 의도적인 트레이드오프, ③ 주의해야 할 부작용.
- 코드 수정 시 **변경 전/후 차이와 이유를 한 줄로** 명시한다.

### 2-2. 불확실한 상황 처리
- 요구사항이 모호하거나 구현 방법이 여러 가지일 경우, **추측으로 코드를 작성하지 않는다.**
- 선택지가 있을 때는 각 방법의 **트레이드오프를 간략히 제시** 하고 확인을 요청한다.
- 기존 코드 맥락이 부족하면 **관련 파일을 먼저 요청** 한다.

### 2-3. 영향 범위 분석 (기존 코드 수정 시)
- 수정 전 **영향 범위(모듈 / DB / 캐시 / 응답 포맷)** 를 먼저 언급한다.
- DB 스키마, 캐시 키, 응답 포맷 변경처럼 파급 효과가 큰 수정은 **⚠️ 경고로 명시** 한다.

### 2-4. 코드 완성도
- 동작하지 않는 placeholder 코드를 제시하지 않는다.
- 프로젝트 컨텍스트 부족으로 완성이 불가한 경우, 그 이유를 명시하고 필요한 정보를 요청한다.
- 예시 코드는 실제 프로젝트 컨벤션(PascalCase DTO, `wLogger` 등)을 그대로 따른다.

### 2-5. 코드 리뷰 시
- 문제점은 **심각도(버그 / 잠재적 위험 / 개선 제안)** 로 구분해서 제시한다.
- 단순 스타일 지적보다 **로직 오류, 보안, 성능** 이슈를 우선한다.

### 2-6. 문서화/주석 작성 시
- "무엇을 하는가"가 아닌 **"왜 이렇게 처리하는가"** 를 설명하는 주석을 작성한다.
- JSDoc은 서비스·리포지토리의 public 메서드에 한해 작성한다.

---

## 2-7. 디버깅 시작 시 자동 절차
디버깅(또는 로컬 실행) 요청이 들어오면 아래 순서를 자동으로 수행한다. 별도 지시 없이도 이 순서를 따른다.

1. **TypeORM 마이그레이션 실행** — 미적용 마이그레이션이 있으면 `typeorm migration:run` 수행
2. **DB 상태 확인** — 마이그레이션 결과를 확인하고 실패 시 서버 실행을 중단하고 오류를 보고
3. **서버 실행** — DB 배포가 완료된 이후에만 애플리케이션을 기동

```bash
# 디버깅 시작 시 권장 실행 순서
npm run migration:run   # 또는 yarn migration:run
npm run start:dev       # 마이그레이션 성공 후에만 실행
```

> 마이그레이션 실패 시 서버를 기동하지 않는다. 실패 원인을 먼저 보고한다.

---

## 3. 디렉토리 구조

```
src/
├── Service_{Name}/            # 도메인별 서비스 모듈
│   ├── {name}.module.ts
│   ├── {name}.controller.ts
│   ├── {name}.service.ts
│   ├── DTO/
│   │   └── {name}.dtos.ts
│   ├── Entity/
│   │   └── {name}.entity.ts
│   └── Repository/
│       └── {Name}.repository.ts
├── GameChat/                  # WebSocket 게이트웨이
├── Pages/                     # 어드민 웹 (TOOL_SERVER=true 일 때만 로드)
│   └── Admin/Filter/
├── Redis/                     # Redis 캐시 서비스
├── DB/                        # DB 매니저, 공통 DTO
├── Json/                      # JSON 데이터 로드 서비스
├── csv/                       # CSV 파싱 유틸리티
├── config/env/                # 환경변수 (.dev / .qa / .docker / .live .env)
├── configs/                   # DB 설정
├── util/
│   ├── logger/
│   ├── exception/
│   └── apikeyguard.guard.ts
├── Views/layouts/
├── app.module.ts
├── main.ts
├── DefsEnum.ts                # 전역 Enum & 상수
└── response.service.ts        # 공통 응답 포맷 & 상태 코드
```

### 새 서비스 추가 규칙
- 폴더명: `Service_{PascalName}` (예: `Service_Payment`)
- Module / Controller / Service / DTO / Entity / Repository 세트 구성
- 어드민/툴 전용 모듈은 `TOOL_SERVER === 'true'` 조건부로 `app.module.ts`에 등록
- `nest g` 사용 시 `--no-spec` 플래그 필수 (금지 사항 참고)

---

## 4. 파일 네이밍 규칙

| 파일 유형 | 패턴 | 예시 |
|-----------|------|------|
| 모듈 | `{name}.module.ts` | `ranking.module.ts` |
| 컨트롤러 | `{name}.controller.ts` | `ranking.controller.ts` |
| 서비스 | `{name}.service.ts` | `ranking.service.ts` |
| 게이트웨이 | `{name}.gateway.ts` | `chat.gateway.ts` |
| DTO | `{name}.dtos.ts` | `rankingDto.dto.ts` |
| 엔티티 | `{name}.entity.ts` | `rankingboard.entity.ts` |
| 리포지토리 | `{Name}.repository.ts` | `RankingBoard.repository.ts` |
| 가드 | `{name}.guard.ts` | `web_auth.guard.ts` |
| 필터 | `{name}filter.ts` | `rabbitexceptionfilter.ts` |
| 미들웨어 | `{name}.middleware.ts` | `logger.middleware.ts` |
| 어댑터 | `{name}.adapter.ts` | `chatIoAdapter.adapter.ts` |

---

## 5. 코딩 컨벤션

### Prettier
```json
{ "printWidth": 150, "singleQuote": true, "trailingComma": "all" }
```

### TypeScript 설정
- `strictNullChecks`: false / `noImplicitAny`: false
- `emitDecoratorMetadata`: true / `experimentalDecorators`: true

---

## 6. 타입 안전성

`noImplicitAny: false` 환경이지만 아래 원칙을 따른다.

- `any` 사용 시 **이유를 주석으로 명시**. 불필요한 남용 금지.
- 서비스·리포지토리 메서드의 **반환 타입은 명시적으로 작성**한다.
- 외부 입력값(DTO, 요청 파라미터)은 `class-validator`로 **반드시 검증**한다.
- 타입 단언(`as SomeType`)은 최소화하고, 사용 시 이유를 주석으로 남긴다.
- `unknown`으로 받은 값은 **타입 가드 또는 검증 후** 사용한다.

```typescript
// ❌ 이유 없는 any
async getUser(idx: any): Promise<any> { ... }

// ✅ 반환 타입 명시, any 이유 주석
// 외부 플랫폼 응답 스펙이 불확정적이므로 any 허용
async getPlatformData(idx: number): Promise<UserEntity | null> { ... }
```

---

## 7. DTO 규칙

- 프로퍼티명: **PascalCase** (`PlatformId`, `GameName`, `PIdx`)
- `class-validator` 데코레이터 필수
- `class-transformer` 변환 필요 시 `@Transform` 사용
- 상속으로 공통 필드 재사용

```typescript
export class SomeDto {
  @IsString()
  GameName: string;

  @IsNumber()
  PIdx: number;

  @IsEnum(OS_TYPE, { message: 'Os는 IOS, AOS, ALL 중 하나여야 합니다.' })
  Os: OS_TYPE;
}
```

---

## 8. 엔티티 규칙

- TypeORM `@Entity` 데코레이터 사용
- **`synchronize: false` 절대 변경 금지** — 스키마는 마이그레이션으로만 관리
- 연관 관계 설명은 **한국어 주석** 사용
- DB connection name: `'MainDB'`

---

## 9. 타입 & 인터페이스 파일 관리 규칙

- 전역 인터페이스·타입은 `src/DB/` 하위 또는 관련 도메인 폴더 내 `types.ts` 파일에 정의한다.
- 서비스 간 공유되는 타입은 **서비스 파일에 직접 정의하지 않는다.** 공통 위치로 분리한다.
- 단일 서비스 내에서만 사용하는 로컬 타입은 해당 서비스 폴더 내 정의 허용.
- Enum은 `DefsEnum.ts`, 타입/인터페이스는 도메인 공통 `types.ts`로 역할을 분리한다.

```
src/
├── DB/
│   └── common.types.ts    # 서비스 간 공유 타입·인터페이스
├── DefsEnum.ts            # 전역 Enum & 상수
├── Service_Ranking/
│   └── ranking.types.ts   # Ranking 도메인 로컬 타입 (필요 시)
```

---

## 10. TypeORM DB 관리 규칙

### 기본 원칙
- DB 스키마 변경은 **반드시 TypeORM 마이그레이션으로만** 관리한다.
- `synchronize: true` 는 어떤 환경에서도 사용하지 않는다 (로컬 포함).
- 엔티티 변경(컬럼 추가·수정·삭제, 인덱스 변경 등) 시 **반드시 마이그레이션 파일을 함께 생성**한다.

### 마이그레이션 파일 규칙
- 생성 위치: `src/migrations/`
- 파일명: `{timestamp}-{PascalCaseDescription}.ts` (예: `1710000000000-AddUserNickname.ts`)
- 마이그레이션 파일은 **한 번 커밋된 이후 내용을 수정하지 않는다.** 수정이 필요하면 새 마이그레이션 파일을 생성한다.
- **`up()` 과 `down()` 을 반드시 모두 구현한다.** `down()` 을 빈 메서드로 두는 것을 금지한다.

```typescript
// ✅ up / down 모두 구현
export class AddUserNickname1710000000000 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.addColumn('user', new TableColumn({
      name: 'nickname',
      type: 'varchar',
      length: '50',
      isNullable: true,
    }));
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    // ⚠️ 롤백 시 데이터 손실 가능성이 있으면 주석으로 명시
    await queryRunner.dropColumn('user', 'nickname');
  }
}
```

### 마이그레이션 생성 / 실행 명령어
```bash
# 마이그레이션 파일 자동 생성 (엔티티와 현재 DB 차이를 기반으로)
npm run migration:generate -- src/migrations/MigrationName

# 마이그레이션 수동 생성 (빈 파일)
npm run migration:create -- src/migrations/MigrationName

# 마이그레이션 실행
npm run migration:run

# 마이그레이션 롤백 (1단계)
npm run migration:revert
```

### DataSource 설정
- DB connection name: `'MainDB'`
- 마이그레이션 설정은 `src/configs/` 하위 DataSource 설정 파일에서 관리
- 환경변수(`DB_GAME_*`)를 통해 환경별 접속 정보를 분리한다

```typescript
// 예시: DataSource 설정 구조
export const MainDataSource = new DataSource({
  type: 'mysql',
  name: 'MainDB',
  host: process.env.DB_GAME_HOST,
  // ...
  synchronize: false,       // 절대 true 금지
  migrationsRun: false,     // 자동 실행 금지 — 명시적 실행만 허용
  migrations: ['src/migrations/*.ts'],
});
```

---

## 10. 리포지토리 규칙

- TypeORM `Repository` 상속 커스텀 클래스
- DB 변경 후 **반드시 관련 캐시 무효화**
- `@InjectDataSource('MainDB')` 또는 `@InjectRepository(Entity)` 사용

| 접두사 | 용도 |
|--------|------|
| `get*` | 읽기 (캐시 활용) |
| `insert*` | 생성 |
| `update*` | 수정 |
| `upsert*` | 생성 또는 수정 |
| `delete*` | 삭제 |

---

## 10. 에러 처리 패턴

### 핵심 원칙
- **빈 `catch` 블록 금지.** 최소한 `wLogger.error`로 기록한다.
- 예상 가능한 실패(유저 없음, 중복 등)는 커스텀 응답 코드로 처리한다. throw 대신 응답 반환을 우선 고려한다.
- 에러 메시지에 **내부 스택 트레이스·민감 정보 노출 금지**.

```typescript
// ❌ 에러 무시
try {
  await this.repo.updateUser(idx);
} catch (e) {}

// ✅ 로깅 + 안전한 응답 반환
try {
  await this.repo.updateUser(idx);
} catch (e) {
  wLogger.error('updateUser 실패: ' + JSON.stringify({ idx, error: e?.message }));
  return { statusCode: SERVER_ERROR, statusMsg: '처리 중 오류가 발생했습니다.' };
}
```

### 외부 연동(Redis / DB / 외부 API) 격리 패턴
- Redis / 외부 API 실패가 **서비스 전체를 중단시키지 않도록** 별도 try-catch로 격리한다.
- 캐시 실패 → `wLogger.warn` 후 DB fallback.
- 재시도가 필요한 작업은 BullMQ 잡 큐로 위임한다.

```typescript
// 캐시 실패 시 DB fallback 패턴
let data = null;
try {
  data = await this.cacheService.get(cacheKey);
} catch (e) {
  wLogger.warn('캐시 조회 실패, DB fallback: ' + cacheKey);
}
if (!data) {
  data = await this.repo.getFromDB(idx);
}
```

---

## 11. 성능 & 캐시 전략

### 캐시 설계 원칙
- 캐시 키는 **도메인 접두사 포함** (예: `ranking:user:${idx}`, `game:config:${gameId}`)
- **TTL 없는 키 생성 금지.** 반드시 만료 시간을 설정한다.
- 캐시 만료 상수 사용: `DB_CACHE_DURATION` (기본 5분), `SEC_ADAY`, `SEC_7DAY`
- DB 변경(insert / update / delete) 후 **연관 캐시 키를 즉시 무효화**한다.

### 캐시 무효화 패턴
```typescript
// 단일 키 삭제 — 특정 레코드 변경 시
await this.cacheService.del(`ranking:user:${userIdx}`);

// 패턴 삭제 — 목록/집계성 데이터 변경 시 (관련 prefix 전체 무효화)
const keys = await this.cacheService.keys(`ranking:season:${seasonId}:*`);
if (keys.length) await this.cacheService.del(...keys);
```

- 단일 레코드 변경 → 해당 키만 삭제
- 목록·집계성 데이터 변경 → 관련 prefix 전체 삭제 또는 TTL 자연 만료 유도
- 캐시 무효화 실패는 서비스를 중단시키지 않는다. `wLogger.warn` 후 계속 진행한다.

### DB 쿼리 최적화
- N+1 쿼리가 발생할 수 있는 관계 조회는 `relations` 옵션 또는 `QueryBuilder`의 `leftJoinAndSelect`를 사용한다.
- 대량 처리는 단건 반복 대신 **bulk insert / update**를 사용한다.
- 페이지네이션이 필요한 목록 조회는 `limit` / `offset` 또는 커서 기반으로 처리한다.

### BullMQ 잡 큐 성능
- 즉시 처리가 불필요한 작업(통계 집계, 알림 발송 등)은 잡 큐로 위임한다.
- 잡 실패 시 **재시도 횟수와 backoff 전략**을 명시적으로 설정한다.
- 잡 큐 서비스: `{Name}QueueService` / 프로세서: `{Name}Processor`

---

## 12. 보안 체크리스트

코드 생성·수정 시 아래 항목을 확인한다.

- [ ] DB 비밀번호, API 키, 시크릿이 코드에 하드코딩되지 않았는가?
- [ ] 모든 외부 입력값이 DTO + `class-validator`로 검증되는가?
- [ ] SQL은 TypeORM QueryBuilder 또는 파라미터 바인딩을 사용하는가? (raw query 문자열 조합 금지)
- [ ] 에러 응답에 내부 스택 트레이스나 민감 정보가 노출되지 않는가?
- [ ] 어드민 라우트에 적절한 Guard(`WebAuthGuard` 등)가 적용되어 있는가?
- [ ] TTL 없는 Redis 키가 생성되지 않는가?
- [ ] `TOOL_SERVER` 조건 없이 어드민 모듈이 항상 로드되지 않는가?

### Global API Key Guard
- 모든 API: `Authorization` 헤더로 API Key 검증
- 화이트리스트: `/`, `/HealthCheck`, `/pages/*`, `/AdminPage`, `/platform_auth/ios-*`

### ValidationPipe 전역 설정
```typescript
new ValidationPipe({
  whitelist: true,
  transform: true,
  transformOptions: { enableImplicitConversion: true },
  disableErrorMessages: false,
})
```

---

## 13. 응답 포맷 규칙

```typescript
// 성공
return { statusCode: STATUS_SUCC, statusMsg: 'ok', data: { ... } };

// 실패
return { statusCode: NOT_FOUND_USER, statusMsg: '유저를 찾을 수 없습니다.' };
```

- 상태 코드는 `response.service.ts`에 상수로 등록 (100000번대: 커스텀 에러)
- `ResponseService.createResponse(data, statusCode, statusMsg)` 사용 가능
- HTTP 상태 코드는 원칙적으로 200으로 통일, 비즈니스 에러는 커스텀 코드로 구분

---

## 14. Enum & 상수 규칙

- **모든 전역 Enum과 상수**는 `src/DefsEnum.ts`에 중앙 관리
- 서비스 로컬 Enum은 해당 서비스 폴더 내 정의 허용
- 시간 상수: 초(SEC) 단위 (예: `SEC_7DAY`, `SEC_ADAY`)
- **새 전역 Enum을 서비스 파일에 직접 정의 금지**

---

## 15. 로깅 규칙

- **`wLogger` 전용** (`src/util/logger/logger.winston.util.ts`)
- `console.log` 사용 금지 (부트스트랩 초기 로그 제외)
- 로그에는 **관련 식별자(유저 idx, 요청 파라미터)** 를 함께 남긴다.

| 레벨 | 사용 시점 |
|------|----------|
| `log` | 정상 처리, 주요 흐름 |
| `warn` | 예상 가능한 이상 상황 (캐시 미스, 재시도 등) |
| `error` | 처리 실패, 예외 발생 |

```typescript
wLogger.log(`랭킹 업데이트 완료 | userIdx: ${userIdx}`);
wLogger.warn(`캐시 미스, DB fallback | key: ${cacheKey}`);
wLogger.error('랭킹 저장 실패: ' + JSON.stringify({ userIdx, error: e?.message }));
```

---

## 16. 주석 규칙

- 비즈니스 로직, 엔티티 관계, 복잡한 알고리즘: **한국어 주석**
- 외부 라이브러리 API·프로토콜 설명: 영어 허용
- TODO: `// TODO:` 형식
- **"무엇을"이 아닌 "왜"를 설명한다.**

```typescript
// ❌ 코드와 동어반복
// userIdx로 유저를 찾는다
const user = await this.userRepo.getByIdx(userIdx);

// ✅ 의도 설명
// 탈퇴 유저도 랭킹 조회는 가능하므로 상태 필터 없이 조회
const user = await this.userRepo.getByIdx(userIdx);
```

---

## 17. 환경 설정

- 환경 파일: `src/config/env/.{NODE_ENV}.env` (`dev` / `qa` / `docker` / `live`)
- Joi로 환경변수 스키마 검증 (`app.module.ts`)
- 필수 환경변수: `SERVER_PORT`, `REDIS_*`, `DB_GAME_*`, `API_KEY`, `TOOL_SERVER`

---

## 18. 금지 사항

| 항목 | 이유 |
|------|------|
| `synchronize: true` (TypeORM) | 운영 DB 스키마 자동 변경 → 데이터 손실 위험 |
| `console.log` 직접 사용 | 로그 레벨 관리 불가 |
| DB 비밀번호·API 키 하드코딩 | 보안 사고 위험 |
| 새 전역 Enum을 서비스 파일에 직접 정의 | DefsEnum.ts 중앙 관리 원칙 위반 |
| `nest g` 시 spec 파일 생성 | 테스트 없는 spec 파일 방치 (`--no-spec` 플래그 사용) |
| 빈 `catch` 블록 | 에러 무시 → 디버깅 불가 |
| TTL 없는 Redis 키 생성 | 메모리 누수 위험 |
| SQL raw query 문자열 조합 | SQL Injection 위험 |