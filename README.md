# LaunchOps

Google 로그인 사용자는 자신의 프로젝트, 실험, 검증 기준, 보도자료, 언론사 선택과 배포 결과를 Firebase Firestore에 저장합니다. 로그인하지 않은 사용자는 기존 브라우저 저장형 데모를 볼 수 있습니다. 두 데이터는 서로 섞이지 않습니다. 첫 화면은 브라우저에 이전 Google 로그인 세션이 남아 있어도 계정 상태를 보여주며, 사용자가 계속하기를 눌러야 Firestore 작업 공간을 엽니다.

## 로컬 실행

프로젝트 루트의 `.env.local`에 `.env.example`과 같은 이름으로 Firebase 웹 앱 설정을 입력합니다. Firebase 웹 앱 설정은 브라우저에 전달되는 공개 설정입니다. 서비스 계정 키나 광고 플랫폼 비밀 키를 이 파일에 넣지 마세요.

```powershell
node scripts/dev.mjs
```

`http://localhost:8000/`을 엽니다. 서버를 중지할 때는 터미널에서 Ctrl+C를 누릅니다. HTML 원본을 더블클릭해 `file://`로 열면 Firebase 모듈이 동작하지 않습니다.

## Firebase 설정

Firebase Console에서 프로젝트 `test-e27db`의 Authentication > Sign-in method에 Google을 활성화하고, Authentication > Settings > Authorized domains에 사용할 도메인을 등록합니다. Cloud Firestore 데이터베이스를 생성합니다.

프로젝트 루트의 [firestore.rules](firestore.rules)는 로그인한 사용자에게 자신의 `users/{uid}` 아래 문서만 읽고 쓰도록 허용합니다. Firebase CLI로 다음을 한 번 배포해야 로그인 화면에서 저장할 수 있습니다. CLI에서 해당 프로젝트에 권한이 있는 Google 계정으로 로그인하세요.

```powershell
npm install -g firebase-tools
firebase login
firebase deploy --only firestore:rules --project test-e27db
```

이 저장소를 Vercel에 배포하는 것만으로는 Firestore 보안 규칙이 적용되지 않습니다. Vercel 화면에서 `Missing or insufficient permissions`가 나타나면 Firebase Console의 `test-e27db` 프로젝트에서 **Firestore Database > Rules**를 열어 현재 게시된 규칙을 확인하세요. 필요하면 [firestore.rules](firestore.rules)의 `users/{userId}` 규칙을 기존 규칙과 병합해 **Publish**를 누르세요. 기존에 다른 컬렉션을 사용하는 규칙이 있다면 전체 파일로 덮어쓰지 마세요. 규칙 게시 후 새 요청에 적용되는 데 약 1분이 걸릴 수 있습니다.

## Vercel 설정

Vercel 프로젝트의 Settings > Environment Variables에 `.env.example`의 `FIREBASE_*` 변수와 실제 값을 등록하고 해당 환경에 배포하세요. `vercel.json`이 `node scripts/build.mjs`를 실행하고 `dist`를 제공합니다. `.env.local`과 `dist`는 Git에서 제외됩니다.

## 실제 기능과 외부 연동

- 프로젝트 생성·수정·삭제, 가설·검증 기준 편집, 실험 계획과 실제 성과 수치 입력, 점수 계산, 보도자료 작성·저장·텍스트 다운로드, 언론사 검색·선택·수정, 발송 결과와 유입·가입 기록은 로그인 계정의 Firestore에 저장됩니다.
- [js/outlets.js](js/outlets.js)에 공식 사이트가 있는 언론사 30곳을 분류했습니다. 제주 10곳, 전국 20곳입니다. 편집국 이메일은 확인되지 않은 주소를 임의로 넣지 않았습니다. 담당 주소를 확인해 저장하면 메일 앱의 작성 창을 열 수 있습니다.
- Meta, YouTube, Reddit의 광고 계정 연결·집행·자동 성과 수집과 보도자료 자동 발송은 각 서비스의 계정 권한, OAuth/API 설정, 서버 측 비밀 키가 필요합니다. 연결 정보가 제공되면 서버 기능을 추가해야 합니다. 현재 화면은 이를 연결된 것으로 표시하거나 발송 성공으로 기록하지 않습니다.
