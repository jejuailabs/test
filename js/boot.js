const app = document.getElementById('app');
const localHelp = () => {
  app.innerHTML = '<main class="content narrow"><section class="card"><h1>로컬 서버에서 열어 주세요</h1><p>Firebase 로그인은 파일을 직접 여는 방식(file://)에서 실행되지 않습니다.</p><p>프로젝트 폴더에서 아래 명령을 실행한 뒤 브라우저에서 <a href="http://localhost:8000/">http://localhost:8000/</a>을 여세요.</p><pre>node scripts/dev.mjs</pre></section></main>';
};

if (location.protocol === 'file:') {
  localHelp();
} else {
  import(new URL('./auth.js', document.currentScript.src).href).catch(error => {
    app.innerHTML = '<main class="content narrow"><section class="card"><h1>앱을 불러오지 못했습니다</h1><p>.env.local 설정과 브라우저 콘솔을 확인해 주세요.</p><p id="boot-error" class="muted"></p></section></main>';
    document.getElementById('boot-error').textContent = error.message;
    console.error(error);
  });
}
