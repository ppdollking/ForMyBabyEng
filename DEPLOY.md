# AWS EC2 배포 가이드

> 대상 환경: AWS EC2 t3.medium / Amazon Linux 2023 / 서울 리전(ap-northeast-2)
> 구성: MySQL + NestJS Backend(4000) + Next.js Frontend(3000) + Nginx(80/443)

---

## 1. EC2 인스턴스 준비

### 보안 그룹 인바운드 규칙

| 포트 | 프로토콜 | 소스 | 용도 |
|------|----------|------|------|
| 22 | TCP | 내 IP | SSH |
| 80 | TCP | 0.0.0.0/0 | HTTP |
| 443 | TCP | 0.0.0.0/0 | HTTPS |

> 3000, 4000 포트는 외부에 열지 않는다. Nginx가 내부에서 프록시한다.

---

## 2. 기본 패키지 및 Node.js 설치

```bash
# 패키지 업데이트
sudo dnf update -y

# Node.js 20 LTS 설치 (nvm 사용)
curl -o- https://raw.githubusercontent.com/nvm-sh/nvm/v0.40.1/install.sh | bash
source ~/.bashrc

nvm install 20
nvm use 20
nvm alias default 20

# 버전 확인
node -v
npm -v
```

---

## 3. MySQL 설치 및 설정

```bash
# MySQL 8.0 공식 repo 추가 (Amazon Linux 2023은 기본 repo에 MySQL 없음)
sudo dnf install -y https://dev.mysql.com/get/mysql84-community-release-el9-1.noarch.rpm
sudo dnf install -y mysql-community-server

# 서비스 시작 및 자동 시작 등록
sudo systemctl start mysqld
sudo systemctl enable mysqld

# 초기 임시 비밀번호 확인 (MySQL 8.x 최초 설치 시 자동 생성됨)
sudo grep 'temporary password' /var/log/mysqld.log

# 초기 보안 설정 (위에서 확인한 임시 비밀번호로 진행, root 비밀번호 변경 등)
sudo mysql_secure_installation

# MySQL 접속
sudo mysql -u root -p

# DB 및 전용 계정 생성
CREATE DATABASE english_db CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
CREATE USER 'english_user'@'localhost' IDENTIFIED BY '강한비밀번호입력';
GRANT ALL PRIVILEGES ON english_db.* TO 'english_user'@'localhost';
FLUSH PRIVILEGES;
EXIT;
```

---

## 4. PM2 설치

```bash
npm install -g pm2

# 서버 재부팅 시 자동 시작 등록
pm2 startup
# 출력된 sudo 명령어를 복사하여 실행
```

---

## 5. Nginx 설치 및 설정

```bash
sudo dnf install -y nginx
sudo systemctl start nginx
sudo systemctl enable nginx
```

### Nginx 설정 파일 작성

```bash
sudo vi /etc/nginx/conf.d/english.conf
```

아래 내용 붙여넣기 (도메인이 없을 경우 `server_name`을 EC2 퍼블릭 IP로 대체):

```nginx
# Frontend (Next.js) - /
server {
    listen 80;
    server_name your-domain.com;  # 또는 EC2 퍼블릭 IP

    # Frontend
    location / {
        proxy_pass http://127.0.0.1:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_cache_bypass $http_upgrade;
    }

    # Backend API
    location /api/ {
        proxy_pass http://127.0.0.1:4000/api/;
        proxy_http_version 1.1;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
    }
}
```

```bash
# 설정 문법 확인
sudo nginx -t

# 재시작
sudo systemctl reload nginx
```

---

## 6. 프로젝트 배포

### 6-1. 코드 다운로드

```bash
cd ~
git clone https://github.com/your-repo/English.git
cd English
```

### 6-2. 환경변수 파일 생성

**Backend**

```bash
vi backend/src/config/env/.live.env
```

```env
PORT=4000
DB_HOST=localhost
DB_PORT=3306
DB_USERNAME=english_user
DB_PASSWORD=강한비밀번호입력
DB_DATABASE=english_db
JWT_SECRET=강한JWT시크릿입력
FRONTEND_URL=http://your-domain.com
```

**Frontend**

```bash
vi frontend/src/config/env/.live.env
```

```env
PORT=3000
NEXT_PUBLIC_API_URL=http://your-domain.com/api
```

### 6-3. 의존성 설치

```bash
cd ~/English/backend && npm ci
cd ~/English/frontend && npm ci
```

### 6-4. Backend 빌드 및 마이그레이션

```bash
cd ~/English/backend

# TypeScript 빌드
npm run build

# dist에 env 파일 복사 (프로덕션 실행 시 dist 경로에서 로드)
mkdir -p dist/config/env
cp src/config/env/.live.env dist/config/env/.live.env

# DB 마이그레이션 실행
npm run migration:run:live
```

### 6-5. Frontend 빌드

```bash
cd ~/English/frontend
npm run build:live
```

---

## 7. PM2로 서비스 실행

```bash
cd ~/English

# live 환경으로 전체 실행
pm2 start ecosystem.config.js --env live

# 현재 PM2 프로세스 목록 저장 (재부팅 후 자동 복구)
pm2 save

# 상태 확인
pm2 status
pm2 logs
```

---

## 8. 재배포 절차 (업데이트)

```bash
cd ~/English
git pull origin main

# Backend 변경 시
cd backend
npm ci
npm run build
cp src/config/env/.live.env dist/config/env/.live.env
npm run migration:run:live
pm2 restart backend

# Frontend 변경 시
cd ../frontend
npm ci
npm run build:live
pm2 restart frontend
```

---

## 9. 자주 쓰는 PM2 명령어

```bash
pm2 status                  # 프로세스 상태
pm2 logs                    # 전체 로그
pm2 logs backend            # 백엔드 로그만
pm2 logs frontend           # 프론트엔드 로그만
pm2 restart backend         # 백엔드 재시작
pm2 restart frontend        # 프론트엔드 재시작
pm2 restart all             # 전체 재시작
pm2 stop all                # 전체 중지
pm2 delete all              # 전체 삭제
```

---

## 10. (선택) HTTPS 설정 - Let's Encrypt

도메인이 있는 경우 무료 SSL 인증서 적용:

```bash
sudo dnf install -y certbot python3-certbot-nginx
sudo certbot --nginx -d your-domain.com

# 자동 갱신 확인
sudo certbot renew --dry-run
```

---

## 트러블슈팅

| 증상 | 확인 명령어 |
|------|-------------|
| 백엔드 응답 없음 | `pm2 logs backend` |
| 프론트엔드 응답 없음 | `pm2 logs frontend` |
| Nginx 502 Bad Gateway | `pm2 status` → 프로세스 살아있는지 확인 |
| DB 연결 실패 | `sudo systemctl status mysqld` |
| 포트 충돌 | `sudo ss -tlnp \| grep -E '3000\|4000'` |
