import { getApp } from 'https://www.gstatic.com/firebasejs/12.19.0/firebase-app.js';
import { getFirestore, collection, doc, getDoc, getDocs, setDoc, deleteDoc } from 'https://www.gstatic.com/firebasejs/12.19.0/firebase-firestore.js';
import { OUTLETS } from './outlets.js';

const user = window.LAUNCHOPS_AUTH.user;
const V = window.LaunchValidation;
const db = getFirestore(getApp());
const root = document.getElementById('app');
const page = document.body.dataset.page || 'login';
const query = new URLSearchParams(location.search);
const projectsRef = collection(db, 'users', user.uid, 'projects');
const settingsRef = doc(db, 'users', user.uid, 'settings', 'workspace');
const currentKey = `launchops-current-${user.uid}`;
const keys = ['impressions', 'engagements', 'clicks', 'landingSessions', 'signups', 'activations', 'purchases', 'spend'];
const emptyMetrics = () => Object.fromEntries(keys.map(key => [key, 0]));
const now = () => new Date().toISOString();
const esc = value => String(value ?? '').replace(/[&<>"']/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const num = value => Number(value || 0).toLocaleString('ko-KR');
const money = value => `${num(value)}원`;
const validUrl = value => /^https?:\/\//i.test(value || '') ? value : '';
const field = (label, name, value = '', type = 'text', extra = '') => `<label class="field"><span>${label}</span><input name="${name}" type="${type}" value="${esc(value)}" ${extra}></label>`;
const area = (label, name, value = '', rows = 4) => `<label class="field"><span>${label}</span><textarea name="${name}" rows="${rows}">${esc(value)}</textarea></label>`;
const select = (label, name, options, selected) => `<label class="field"><span>${label}</span><select name="${name}">${options.map(option => { const value = typeof option === 'string' ? option : option.value; const text = typeof option === 'string' ? option : option.label; return `<option value="${esc(value)}" ${value === selected ? 'selected' : ''}>${esc(text)}</option>`; }).join('')}</select></label>`;
const card = (html, cls = '') => `<section class="card ${cls}">${html}</section>`;
const actions = html => `<div class="actions">${html}</div>`;
const notice = (message, type = 'info') => `<div class="notice ${type}">${message}</div>`;
const badge = status => `<span class="badge ${esc(status)}">${esc({planned:'계획',running:'진행 중',completed:'완료',draft:'초안',ready:'준비됨',not_sent:'미발송',sent:'발송 기록',replied:'응답 기록',published:'기사화 기록',disconnected:'미연결'}[status] || V.statusLabels[status] || status)}</span>`;

let projects = [], channels = [], project = null;
try {
  const [projectDocs, settings] = await Promise.all([getDocs(projectsRef), getDoc(settingsRef)]);
  projects = projectDocs.docs.map(snapshot => ({...snapshot.data(), id: snapshot.id})).sort((a, b) => (b.updatedAt || '').localeCompare(a.updatedAt || ''));
  const saved = settings.exists() ? settings.data().channels || [] : [];
  const savedById = new Map(saved.map(channel => [channel.id, channel]));
  channels = [...OUTLETS.map(channel => ({...channel, ...savedById.get(channel.id)})), ...saved.filter(channel => !OUTLETS.some(item => item.id === channel.id))];
} catch (error) {
  root.innerHTML = `<main class="content narrow">${card(`<h1>작업공간을 불러오지 못했습니다</h1><p>${error.code === 'permission-denied' ? '로그인은 완료됐지만 Firestore에서 계정 데이터 읽기를 거부했습니다. Firebase 프로젝트의 Firestore 보안 규칙을 배포해 주세요.' : 'Firestore 데이터베이스와 사용자별 보안 규칙을 확인해 주세요.'}</p><p class="muted">${esc(error.code || error.message)}</p><a class="button" href="login.html">로그인 화면</a>`)}</main>`;
  throw error;
}

const requestedId = query.get('project') || localStorage.getItem(currentKey);
project = projects.find(item => item.id === requestedId) || projects[0] || null;
if (project) localStorage.setItem(currentKey, project.id);
const projectQuery = () => project ? `?project=${encodeURIComponent(project.id)}` : '';
const link = file => `${file}.html${['projects', 'new-project', 'login', 'pr-channels'].includes(file) ? '' : projectQuery()}`;
const buttonLink = (label, file, kind = 'secondary') => `<a class="button ${kind}" href="${link(file)}">${label}</a>`;
const result = () => V.evaluate(project);
const saveProject = async () => {
  project.updatedAt = now();
  await setDoc(doc(projectsRef, project.id), project);
  if (!projects.some(item => item.id === project.id)) projects.unshift(project);
  localStorage.setItem(currentKey, project.id);
};
const saveChannels = () => setDoc(settingsRef, {channels, updatedAt: now()});
const go = file => { location.href = link(file); };
const formSubmit = (id, fn) => document.getElementById(id)?.addEventListener('submit', async event => {
  event.preventDefault();
  const submit = event.currentTarget.querySelector('[type="submit"]');
  if (submit) submit.disabled = true;
  try { await fn(new FormData(event.currentTarget)); }
  catch (error) { alert(`저장하지 못했습니다: ${error.message}`); if (submit) submit.disabled = false; }
});

function shell(title, subtitle, content, step = '') {
  const nav = [['projects', '프로젝트'], ['dashboard', '대시보드'], ['new-experiment', '새 실험'], ['validation-result', '검증 결과'], ['pr-channels', 'PR 채널']];
  root.innerHTML = `<div class="app-shell"><aside class="sidebar"><a class="brand" href="projects.html"><span class="brand-mark">L</span><span>LaunchOps<small>Market validation</small></span></a><div class="sidebar-label">WORKSPACE</div><nav>${nav.map(([file, label]) => `<a href="${link(file)}" class="${page === file ? 'active' : ''}">${label}</a>`).join('')}</nav><div class="sidebar-foot">내 작업공간<strong>${esc(project?.name || '프로젝트 없음')}</strong><small>Firebase에 저장됩니다.</small></div></aside><div class="main-wrap"><header class="topbar"><span>LaunchOps <span class="slash">/</span> ${esc(project?.name || '프로젝트')}</span><span class="topbar-right">${esc(user.email)} <button class="logout-button" type="button" id="logout">로그아웃</button></span></header><main class="content">${step ? `<div class="eyebrow">${step}</div>` : ''}<div class="page-heading"><div><h1>${title}</h1><p>${subtitle}</p></div></div>${content}</main></div></div>`;
  document.getElementById('logout').onclick = async () => { await window.LAUNCHOPS_AUTH.signOut(); location.replace('login.html'); };
}

function requireProject() {
  if (project) return true;
  shell('프로젝트가 없습니다', '먼저 제품을 등록해 주세요.', actions(buttonLink('제품 등록', 'new-project', 'primary')));
  return false;
}

function projectList() {
  shell('프로젝트', '로그인한 계정의 제품과 검증 결과입니다.', `${actions(buttonLink('새 프로젝트 만들기', 'new-project', 'primary'))}<div class="project-grid">${projects.map(item => {
    const evaluation = V.evaluate(item);
    return card(`<div class="project-top">${badge(evaluation.status)} <span>${esc(item.category)}</span></div><h2>${esc(item.name)}</h2><p>${esc(item.description)}</p><p class="muted">Validation Score ${evaluation.score} · ${esc(item.updatedAt?.slice(0, 10))}</p>${actions(`<a class="button primary" href="dashboard.html?project=${encodeURIComponent(item.id)}">열기</a><a class="button secondary" href="new-project.html?project=${encodeURIComponent(item.id)}&edit=1">수정</a><button class="button secondary" data-delete-project="${esc(item.id)}">삭제</button>`)}`, 'project-card');
  }).join('') || card('<h2>등록된 프로젝트가 없습니다.</h2><p>새 프로젝트를 만들면 이 계정에 저장됩니다.</p>')}</div>`);
  root.querySelectorAll('[data-delete-project]').forEach(button => button.onclick = async () => {
    const item = projects.find(value => value.id === button.dataset.deleteProject);
    if (!item || !confirm(`${item.name} 프로젝트와 실험 기록을 삭제할까요?`)) return;
    try { await deleteDoc(doc(projectsRef, item.id)); projects = projects.filter(value => value.id !== item.id); if (project?.id === item.id) project = projects[0] || null; if (project) localStorage.setItem(currentKey, project.id); else localStorage.removeItem(currentKey); projectList(); }
    catch (error) { alert(`삭제하지 못했습니다: ${error.message}`); }
  });
}

function projectForm() {
  const editing = query.get('edit') === '1' && project?.id === query.get('project');
  const item = editing ? project : {};
  shell(editing ? '제품 수정' : '새 제품 등록', '제품 정보를 계정에 저장합니다.', card(`<form id="project-form" class="form-stack">${field('제품명', 'name', item.name, 'text', 'required')}${field('제품 URL', 'url', item.url, 'url', 'required placeholder="https://"')}<div class="form-grid">${field('카테고리', 'category', item.category, 'text', 'required')}${field('목표 시장', 'targetMarket', item.targetMarket, 'text', 'required')}</div>${area('제품 설명', 'description', item.description)}${actions(`${buttonLink('목록', 'projects')}<button class="button primary" type="submit">저장</button>`)}</form>`), '제품 정보');
  formSubmit('project-form', async form => {
    const name = String(form.get('name')).trim();
    if (!name) throw Error('제품명을 입력해 주세요.');
    project = editing ? project : {
      id: crypto.randomUUID(), createdAt: now(), experiments: [],
      criteria: structuredClone(window.LAUNCHOPS_MOCK.projects[0].criteria),
      hypothesis: {audience: '', problem: '', value: '', message: ''},
      pr: {status: 'draft', ko: {}, en: {}}, distribution: {results: []}
    };
    Object.assign(project, {name, url: String(form.get('url')).trim(), category: String(form.get('category')).trim(), targetMarket: String(form.get('targetMarket')).trim(), description: String(form.get('description')).trim()});
    if (!project.hypothesis.audience) project.hypothesis.audience = project.targetMarket;
    await saveProject(); go('validation-setup');
  });
}

function validationSetup() {
  if (!requireProject()) return;
  const h = project.hypothesis;
  shell('검증 가설과 기준', '실험 전에 목표와 최소 표본을 정합니다.', `<form id="setup-form" class="form-stack">${card(`<h2>검증 가설</h2><div class="form-grid">${field('고객군', 'audience', h.audience, 'text', 'required')}${field('고객 문제', 'problem', h.problem, 'text', 'required')}</div>${field('핵심 가치 제안', 'value', h.value, 'text', 'required')}${area('테스트 메시지', 'message', h.message)}`)}${card(`<h2>검증 기준</h2>${project.criteria.map((criterion, index) => `<div class="criteria-item"><strong>기준 ${index + 1}</strong><div class="criteria-fields">${select('지표', `metric-${index}`, Object.entries(V.labels).map(([value, label]) => ({value, label})), criterion.metric)}${select('비교', `operator-${index}`, ['>=', '<='], criterion.operator)}${field('목표 %', `target-${index}`, criterion.target, 'number', 'min="0" step="0.1" required')}${field('최소 표본', `sample-${index}`, criterion.minimumSample, 'number', 'min="0" required')}${field('가중치', `weight-${index}`, criterion.weight, 'number', 'min="0" required')}<label class="check-field"><input name="required-${index}" type="checkbox" ${criterion.required ? 'checked' : ''}> 필수 기준</label></div></div>`).join('')}`)}${actions(`<button class="button primary" type="submit">저장</button>`)}</form>`, '검증 설정');
  formSubmit('setup-form', async form => {
    project.hypothesis = Object.fromEntries(['audience', 'problem', 'value', 'message'].map(name => [name, String(form.get(name) || '').trim()]));
    project.criteria = project.criteria.map((criterion, index) => ({...criterion, metric: form.get(`metric-${index}`), operator: form.get(`operator-${index}`), target: Number(form.get(`target-${index}`)), minimumSample: Number(form.get(`sample-${index}`)), weight: Number(form.get(`weight-${index}`)), required: form.has(`required-${index}`)}));
    await saveProject(); go('dashboard');
  });
}

function integrations() {
  if (!requireProject()) return;
  shell('채널 연결', '광고 플랫폼 계정 연결 상태를 확인합니다.', `${notice('계정 권한과 API 설정이 제공되면 OAuth 연결과 성과 자동 수집을 활성화할 수 있습니다. 현재는 실제 연결이 없으며 실험 결과를 직접 입력할 수 있습니다.', 'warning')}<div class="integration-list">${['Meta', 'YouTube', 'Reddit'].map(name => card(`<div class="integration-row"><div class="channel-logo ${name.toLowerCase()}">${name[0]}</div><div class="grow"><h2>${name}</h2><p>연결 정보 미설정 · 자동 수집 불가</p></div>${badge('disconnected')}<button class="button secondary" disabled>설정 대기</button></div>`)).join('')}</div>${actions(buttonLink('실험 계획 만들기', 'new-experiment', 'primary'))}`, '외부 연동');
}

function experimentForm() {
  if (!requireProject()) return;
  const today = now().slice(0, 10);
  shell('새 검증 실험', '광고 집행 없이 실험 계획을 저장합니다. 실제 성과는 실험 상세에서 입력합니다.', card(`<form id="experiment-form" class="form-stack"><div class="form-grid">${field('고객군', 'audience', project.hypothesis.audience, 'text', 'required')}${select('채널', 'channel', ['Meta', 'YouTube', 'Reddit', '직접 유입', '기타'], '직접 유입')}</div>${area('테스트 메시지', 'message', project.hypothesis.message)}<div class="form-grid">${field('예산 (원)', 'budget', 0, 'number', 'min="0" required')}${field('Attribution 기간 (일)', 'attributionDays', 7, 'number', 'min="1" required')}${field('시작일', 'start', today, 'date', 'required')}${field('종료일', 'end', today, 'date', 'required')}</div>${actions(`<button class="button primary" type="submit">실험 계획 저장</button>`)}</form>`), '실험 계획');
  formSubmit('experiment-form', async form => {
    if (form.get('end') < form.get('start')) throw Error('종료일은 시작일 이후여야 합니다.');
    const experiment = {id: crypto.randomUUID(), audience: String(form.get('audience')).trim(), channel: form.get('channel'), message: String(form.get('message')).trim(), budget: Number(form.get('budget')), attributionDays: Number(form.get('attributionDays')), start: form.get('start'), end: form.get('end'), status: 'planned', updatedAt: now(), metrics: emptyMetrics(), evidence: ''};
    project.experiments.unshift(experiment);
    await saveProject(); location.href = `experiment-detail.html?project=${encodeURIComponent(project.id)}&experiment=${encodeURIComponent(experiment.id)}`;
  });
}

function metricGrid(metrics) {
  return `<div class="metric-grid">${[['노출', 'impressions'], ['관심', 'engagements'], ['클릭', 'clicks'], ['방문', 'landingSessions'], ['가입', 'signups'], ['활성화', 'activations'], ['결제', 'purchases']].map(([label, key]) => `<div class="metric"><span>${label}</span><strong>${num(metrics[key])}</strong></div>`).join('')}</div>`;
}

function dashboard() {
  if (!requireProject()) return;
  const evaluation = result();
  shell(`${esc(project.name)} 대시보드`, '입력한 실험 결과를 기준으로 계산합니다.', `<div class="hero-status">${card(`<div class="eyebrow">CURRENT VALIDATION</div><div class="status-line">${badge(evaluation.status)}<h2>${V.statusLabels[evaluation.status]}</h2></div><p>통과 기준 ${evaluation.passed}/${evaluation.total}</p>${actions(buttonLink('검증 결과', 'validation-result', 'primary'))}`)}${card(`<div class="eyebrow">VALIDATION SCORE</div><div class="score">${evaluation.score}<span>/ 100</span></div><div class="progress"><i style="width:${evaluation.score}%"></i></div>`)}</div>${card(`<div class="section-heading"><h2>실험 기록</h2>${buttonLink('새 실험', 'new-experiment')}</div>${project.experiments.map(experiment => `<a class="list-row" href="experiment-detail.html?project=${encodeURIComponent(project.id)}&experiment=${encodeURIComponent(experiment.id)}"><span><strong>${esc(experiment.channel)} · ${esc(experiment.audience)}</strong><small>${esc(experiment.start)} ~ ${esc(experiment.end)}</small></span>${badge(experiment.status)}</a>`).join('') || '<p class="muted">아직 실험이 없습니다.</p>'}`)}${card(`<h2>누적 성과</h2>${metricGrid(evaluation.metrics)}<p class="muted">연결된 광고 계정의 자동 수집 값이 아닌 직접 입력한 기록의 합계입니다.</p>`)}${actions(`${buttonLink('가설과 기준 수정', 'validation-setup')}${buttonLink('PR 채널', 'pr-channels')}`)}`, '대시보드');
}

function experimentDetail() {
  if (!requireProject()) return;
  const experiment = project.experiments.find(item => item.id === query.get('experiment')) || project.experiments[0];
  if (!experiment) { shell('실험 상세', '실험을 먼저 만들어 주세요.', actions(buttonLink('새 실험', 'new-experiment', 'primary'))); return; }
  shell('실험 상세', `${esc(experiment.channel)} · ${esc(experiment.audience)}`, `<div class="summary-strip"><span>상태 ${badge(experiment.status)}</span><span>예산 <strong>${money(experiment.budget)}</strong></span><span>기간 <strong>${esc(experiment.start)} ~ ${esc(experiment.end)}</strong></span></div>${card(`<h2>성과 입력</h2><p class="muted">실제 분석 도구에서 확인한 수치만 입력하세요. 출처를 함께 기록할 수 있습니다.</p><form id="metrics-form" class="form-stack"><div class="form-grid">${keys.map(key => field(({impressions:'노출',engagements:'관심',clicks:'클릭',landingSessions:'방문',signups:'가입',activations:'활성화',purchases:'결제',spend:'지출액 (원)'})[key], key, experiment.metrics?.[key] ?? 0, 'number', 'min="0" required')).join('')}</div>${select('상태', 'status', ['planned', 'running', 'completed'], experiment.status)}${area('데이터 출처·근거', 'evidence', experiment.evidence)}${actions('<button class="button primary" type="submit">성과 저장</button>')}</form>`)}${card(`<h2>현재 집계</h2>${metricGrid(experiment.metrics || emptyMetrics())}<p>${esc(experiment.message)}</p>`)}${actions(`${buttonLink('대시보드', 'dashboard')}${buttonLink('검증 결과', 'validation-result')}`)}`, '실험 분석');
  formSubmit('metrics-form', async form => {
    experiment.metrics = Object.fromEntries(keys.map(key => [key, Number(form.get(key))]));
    experiment.status = form.get('status'); experiment.evidence = String(form.get('evidence')).trim(); experiment.updatedAt = now();
    await saveProject(); location.reload();
  });
}

function validationResult() {
  if (!requireProject()) return;
  const evaluation = result();
  shell('검증 결과', '저장된 실험 수치와 사전에 설정한 기준을 비교합니다.', `${card(`<div class="result-head"><div><div class="eyebrow">CURRENT DECISION</div><h2>${V.statusLabels[evaluation.status]}</h2><p>신뢰 수준 ${evaluation.confidence} · 통과 기준 ${evaluation.passed}/${evaluation.total}</p></div><div class="result-score"><strong>${evaluation.score}</strong><span>Validation Score</span></div></div>`)}${card(`<h2>기준별 판정</h2><div class="table-wrap"><table><thead><tr><th>지표</th><th>현재값</th><th>목표</th><th>표본 / 최소</th><th>결과</th></tr></thead><tbody>${evaluation.criteria.map(criterion => `<tr><td>${esc(V.labels[criterion.metric])}</td><td>${criterion.value.toFixed(1)}%</td><td>${esc(criterion.operator)} ${num(criterion.target)}%</td><td>${num(criterion.sample)} / ${num(criterion.minimumSample)}</td><td>${criterion.sample < criterion.minimumSample ? badge('insufficient_evidence') : criterion.passed ? '<span class="positive">통과</span>' : '<span class="negative">미달</span>'}</td></tr>`).join('')}</tbody></table></div>`)}${card(`<h2>입력된 근거 수치</h2>${metricGrid(evaluation.metrics)}<p class="muted">수치는 실험 상세에서 직접 입력한 값입니다.</p>`)}${actions(`${buttonLink('실험 기록', 'experiment-detail')}${buttonLink('PR 준비', 'pr-channels', 'primary')}`)}`, '검증 결과');
}

function prChannels() {
  const categories = ['전체', ...new Set(channels.map(channel => channel.category || '기타'))];
  shell('PR 채널 관리', '확인된 언론사 30곳입니다. 편집국 연락처는 직접 확인한 뒤 입력하세요.', `${card(`<div class="section-heading"><div><h2>언론사 목록</h2><p>제주 10곳 · 전국 20곳</p></div><button class="button primary" id="add-channel">채널 추가</button></div><div class="filter-row"><input id="channel-search" placeholder="언론사·주제 검색" aria-label="채널 검색"><select id="channel-filter" aria-label="카테고리">${categories.map(category => `<option>${esc(category)}</option>`).join('')}</select></div><div class="table-wrap"><table><thead><tr><th>선택</th><th>언론사</th><th>카테고리</th><th>지역</th><th>공식 사이트</th><th>연락처</th><th>제외</th><th></th></tr></thead><tbody id="channels-body"></tbody></table></div>`)}${actions(project ? buttonLink('보도자료 작성', 'release-editor', 'primary') : buttonLink('프로젝트 등록', 'new-project', 'primary'))}<dialog id="channel-dialog"><form id="channel-form" class="form-stack"><h2>채널 정보</h2><input type="hidden" name="id">${field('언론사명', 'name', '', 'text', 'required')}<div class="form-grid">${select('카테고리', 'category', categories.filter(item => item !== '전체').concat('기타'), '제주 지역')}${field('주제', 'topic')}${field('지역', 'region')}</div>${field('공식 사이트', 'url', '', 'url')}${field('편집국 이메일 (확인 후 입력)', 'contact', '', 'email')}${field('최근 접촉일', 'lastContact', '', 'date')}${field('관계 상태', 'relation', '미접촉')}${actions('<button class="button secondary" type="button" id="close-dialog">취소</button><button class="button primary" type="submit">저장</button>')}</form></dialog>`, 'PR 준비');
  const draw = () => {
    const search = document.getElementById('channel-search').value.toLowerCase();
    const category = document.getElementById('channel-filter').value;
    const matches = channels.filter(channel => (category === '전체' || (channel.category || '기타') === category) && [channel.name, channel.topic, channel.region].join(' ').toLowerCase().includes(search));
    document.getElementById('channels-body').innerHTML = matches.map(channel => `<tr><td><input type="checkbox" data-select="${esc(channel.id)}" ${channel.selected ? 'checked' : ''} ${channel.excluded ? 'disabled' : ''}></td><td><strong>${esc(channel.name)}</strong><small>${esc(channel.topic)}</small></td><td>${esc(channel.category)}</td><td>${esc(channel.region)}</td><td><a href="${esc(validUrl(channel.url))}" target="_blank" rel="noopener noreferrer">공식 사이트 ↗</a></td><td>${esc(channel.contact || '미확인')}</td><td><input type="checkbox" data-exclude="${esc(channel.id)}" ${channel.excluded ? 'checked' : ''}></td><td><button class="text-button" data-edit="${esc(channel.id)}">수정</button></td></tr>`).join('') || '<tr><td colspan="8">검색 결과가 없습니다.</td></tr>';
  };
  draw(); document.getElementById('channel-search').oninput = draw; document.getElementById('channel-filter').onchange = draw;
  const dialog = document.getElementById('channel-dialog'), form = document.getElementById('channel-form');
  document.getElementById('add-channel').onclick = () => { form.reset(); form.elements.id.value = ''; dialog.showModal(); };
  document.getElementById('close-dialog').onclick = () => dialog.close();
  root.addEventListener('click', event => {
    const channel = channels.find(item => item.id === event.target.dataset.edit);
    if (!channel) return;
    for (const name of ['id', 'name', 'category', 'topic', 'region', 'url', 'contact', 'lastContact', 'relation']) if (form.elements[name]) form.elements[name].value = channel[name] || '';
    dialog.showModal();
  });
  root.addEventListener('change', async event => {
    const id = event.target.dataset.select || event.target.dataset.exclude;
    if (!id) return;
    const channel = channels.find(item => item.id === id);
    if (event.target.dataset.select) channel.selected = event.target.checked;
    else { channel.excluded = event.target.checked; if (channel.excluded) channel.selected = false; }
    try { await saveChannels(); draw(); } catch (error) { alert(`저장 실패: ${error.message}`); location.reload(); }
  });
  formSubmit('channel-form', async data => {
    const id = data.get('id') || crypto.randomUUID();
    const previous = channels.find(item => item.id === id);
    const updated = {...previous, id, name: String(data.get('name')).trim(), category: data.get('category'), topic: String(data.get('topic')).trim(), region: String(data.get('region')).trim(), url: String(data.get('url')).trim(), contact: String(data.get('contact')).trim(), lastContact: data.get('lastContact'), relation: String(data.get('relation')).trim(), type: '언론사', language: '한국어', selected: previous?.selected || false, excluded: previous?.excluded || false};
    if (previous) Object.assign(previous, updated); else channels.push(updated);
    await saveChannels(); dialog.close(); draw();
  });
}

function releaseEditor() {
  if (!requireProject()) return;
  project.pr ||= {status: 'draft', ko: {}, en: {}};
  project.pr.ko ||= {}; project.pr.en ||= {};
  let language = 'ko';
  const selected = () => channels.filter(channel => channel.selected && !channel.excluded);
  shell('보도자료 작성', '실제 사실과 확인된 수치를 입력해 저장하세요.', `<div class="editor-toolbar"><div class="eyebrow">PRESS RELEASE</div><div class="segmented"><button id="lang-ko" type="button">한국어</button><button id="lang-en" type="button">English</button></div></div><div class="two-column editor-layout">${card(`<form id="release-form" class="form-stack"><div id="editor-fields"></div>${actions('<button class="button secondary" id="download-release" type="button">텍스트 다운로드</button><button class="button primary" type="submit">초안 저장</button>')}</form>`)}${card(`<h2>입력된 검증 수치</h2>${metricGrid(result().metrics)}<p class="muted">수치를 주장에 사용할 때 실험 근거를 확인하세요.</p><h2>선택한 언론사</h2><p>${selected().map(channel => esc(channel.name)).join(', ') || '없음'}</p>`)}</div>${actions(buttonLink('발송·성과 기록', 'distribution-results', 'primary'))}`, 'PR 콘텐츠');
  const form = document.getElementById('release-form');
  const render = () => {
    const draft = project.pr[language];
    document.getElementById('editor-fields').innerHTML = `${field('제목', 'title', draft.title || `${project.name} 보도자료`, 'text', 'required')}${area('요약', 'summary', draft.summary)}${area('본문', 'body', draft.body, 10)}${area('회사 소개', 'company', draft.company)}${field('담당자 연락처', 'contact', draft.contact)}`;
    for (const code of ['ko', 'en']) document.getElementById(`lang-${code}`).classList.toggle('active', code === language);
  };
  const collect = () => { const data = new FormData(form); project.pr[language] = Object.fromEntries(['title', 'summary', 'body', 'company', 'contact'].map(name => [name, String(data.get(name) || '').trim()])); };
  render();
  for (const code of ['ko', 'en']) document.getElementById(`lang-${code}`).onclick = async () => { collect(); try { await saveProject(); language = code; render(); } catch (error) { alert(`저장 실패: ${error.message}`); } };
  formSubmit('release-form', async () => { collect(); project.pr.status = project.pr[language].title && project.pr[language].body ? 'ready' : 'draft'; await saveProject(); alert('보도자료 초안을 저장했습니다.'); });
  document.getElementById('download-release').onclick = () => {
    collect(); const draft = project.pr[language];
    const text = [draft.title, draft.summary, draft.body, draft.company, draft.contact].filter(Boolean).join('\n\n');
    const url = URL.createObjectURL(new Blob([text], {type: 'text/plain;charset=utf-8'}));
    const anchor = document.createElement('a'); anchor.href = url; anchor.download = `${project.name}-release-${language}.txt`; anchor.click(); setTimeout(() => URL.revokeObjectURL(url), 1000);
  };
}

function distributionResults() {
  if (!requireProject()) return;
  project.distribution ||= {results: []};
  const selected = channels.filter(channel => channel.selected && !channel.excluded);
  const draft = project.pr?.ko || {};
  const existing = new Map(project.distribution.results.map(item => [item.channelId, item]));
  for (const channel of selected) if (!existing.has(channel.id)) project.distribution.results.push({channelId: channel.id, status: 'not_sent', reply: '', article: '', visits: 0, signups: 0, contactedAt: ''});
  shell('발송·성과 기록', '확인한 언론사에 직접 발송하고 실제 응답을 기록합니다.', `${notice('메일 작성 버튼은 메일 앱을 엽니다. 발송 여부는 자동으로 확인하지 않으며 기록은 직접 저장해야 합니다. 자동 발송은 발송 서비스 연결 후 사용할 수 있습니다.', 'warning')}${card(`<h2>선택한 언론사 ${selected.length}곳</h2>${selected.map(channel => {
    const result = project.distribution.results.find(item => item.channelId === channel.id);
    const subject = encodeURIComponent(draft.title || `${project.name} 보도자료`);
    const body = encodeURIComponent([draft.summary, draft.body, draft.company, draft.contact].filter(Boolean).join('\n\n'));
    return `<div class="list-row"><span><strong>${esc(channel.name)}</strong><small>${esc(channel.contact || '편집국 이메일 미입력')}</small></span>${badge(result.status)} ${channel.contact ? `<a class="button secondary" href="mailto:${encodeURIComponent(channel.contact)}?subject=${subject}&body=${body}">메일 작성</a>` : `<a class="button secondary" href="${esc(validUrl(channel.url))}" target="_blank" rel="noopener noreferrer">공식 사이트</a>`}</div>`;
  }).join('') || '<p class="muted">PR 채널 화면에서 언론사를 선택해 주세요.</p>'}`)}${card(`<h2>발송·응답 기록</h2><div class="table-wrap"><table><thead><tr><th>언론사</th><th>상태</th><th>접촉일</th><th>응답 메모</th><th>기사 URL</th><th>방문</th><th>가입</th></tr></thead><tbody>${project.distribution.results.filter(item => selected.some(channel => channel.id === item.channelId)).map(item => `<tr data-result="${esc(item.channelId)}"><td>${esc(channels.find(channel => channel.id === item.channelId)?.name)}</td><td><select name="status">${['not_sent', 'sent', 'replied', 'published'].map(status => `<option value="${status}" ${item.status === status ? 'selected' : ''}>${({not_sent:'미발송',sent:'발송',replied:'응답',published:'기사화'})[status]}</option>`).join('')}</select></td><td><input name="contactedAt" type="date" value="${esc(item.contactedAt)}"></td><td><input name="reply" value="${esc(item.reply)}"></td><td><input name="article" type="url" value="${esc(item.article)}" placeholder="https://"></td><td><input name="visits" type="number" min="0" value="${Number(item.visits) || 0}"></td><td><input name="signups" type="number" min="0" value="${Number(item.signups) || 0}"></td></tr>`).join('')}</tbody></table></div>${actions('<button class="button primary" id="save-results" type="button">기록 저장</button>')}`)}${actions(`${buttonLink('PR 채널', 'pr-channels')}${buttonLink('보도자료 수정', 'release-editor')}`)}`, 'PR 배포');
  document.getElementById('save-results').onclick = async () => {
    for (const row of root.querySelectorAll('[data-result]')) {
      const item = project.distribution.results.find(result => result.channelId === row.dataset.result);
      for (const name of ['status', 'contactedAt', 'reply', 'article']) item[name] = row.querySelector(`[name="${name}"]`).value;
      for (const name of ['visits', 'signups']) item[name] = Number(row.querySelector(`[name="${name}"]`).value);
    }
    try { await saveProject(); alert('실제 발송·성과 기록을 저장했습니다.'); }
    catch (error) { alert(`저장 실패: ${error.message}`); }
  };
}

switch (page) {
  case 'login': location.replace('projects.html'); break;
  case 'projects': projectList(); break;
  case 'new-project': projectForm(); break;
  case 'validation-setup': validationSetup(); break;
  case 'integrations': integrations(); break;
  case 'new-experiment': experimentForm(); break;
  case 'dashboard': dashboard(); break;
  case 'experiment-detail': experimentDetail(); break;
  case 'validation-result': validationResult(); break;
  case 'pr-channels': prChannels(); break;
  case 'release-editor': releaseEditor(); break;
  case 'distribution-results': distributionResults(); break;
  default: projectList();
}
