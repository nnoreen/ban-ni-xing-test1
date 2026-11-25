"use strict";

const root = document.getElementById("app");
const announcement = document.getElementById("announcement");
const storeKey = "companion-transit-v1";
const supportSpeech = "speechSynthesis" in window && "SpeechSynthesisUtterance" in window;
const icons = {
  external: '<path d="M13 5h6v6m0-6-8 8m7 0v5a1 1 0 0 1-1 1H6a1 1 0 0 1-1-1V7a1 1 0 0 1 1-1h5"/>',
  voice: '<path d="M4 10h4l5-4v12l-5-4H4Zm12-1c2 2 2 4 0 6m3-9c3 3 3 9 0 12"/>',
  stop: '<rect x="6" y="6" width="12" height="12" rx="2"/>',
  back: '<path d="m14 6-6 6 6 6"/>'
};
const icon = name => '<svg aria-hidden="true" class="icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round">' + icons[name] + '</svg>';
const logo = '<img src="assets/brand-logo.webp" alt="">';
const art = name => '<img src="assets/' + name + '.webp" alt="">';
const route = (screen, extra = {}) => ({ screen, ...extra });
const cover = route("cover");
const home = route("home");
const has = (object, key) => Object.prototype.hasOwnProperty.call(object, key);
const bounded = (number, min, max) => Math.max(min, Math.min(max, number));

let data = {};
try { data = JSON.parse(localStorage.getItem(storeKey)) || {}; } catch { /* storage may be unavailable */ }
let settings = {
  size: Number.isFinite(data.size) ? bounded(data.size, 90, 160) : 100,
  voice: data.voice !== false
};
const framesFor = ({ type, flow, stage, direction }) => {
  if (type === "bus" && flow === "arrival" && stage === "plan") return [busRoutePlanFrame];
  const frames = VISUAL_GUIDES[type + "/" + flow]?.[stage === "unreserved" ? "unreservedFrames" : "frames"] ?? [];
  if (stage === "unreserved") return [frames[direction === "reverse" ? 0 : 1], ...frames.slice(2)];
  if (type === "rail" && flow === "buy") {
    const station = VISUAL_GUIDES["rail/buy"].unreservedFrames[direction === "reverse" ? 0 : 1];
    return [frames[0], frames[1], station, ...frames.slice(3)];
  }
  return frames;
};
const isRailMachine = ({ type, flow }) => type === "rail" && flow === "buy";

function hasFrame(value) {
  return Number.isInteger(value.step) && value.step >= 0 && value.step < framesFor(value).length;
}
const restoredRoute = history.state?.companion;
let current = normalizeRoute(restoredRoute?.screen === "home" ? cover : restoredRoute);
let depth = history.state?.depth ?? 0;
let speaking = null;

function normalizeRoute(value) {
  if (!value) return cover;
  if (["cover", "home", "settings", "benefits"].includes(value.screen)) return value;
  if (value.screen === "benefit") {
    return has(TRANSIT, value.item) ? value : route("benefits");
  }
  if (!has(TRANSIT, value.type)) return home;
  if (value.screen === "guide" && has(TRANSIT[value.type].tasks, value.flow)) {
    const { type, flow, stage } = value;
    if (isRailMachine(value)) {
      if (stage === "unreserved") return route("guide", { type, flow, stage, direction: value.direction === "reverse" ? "reverse" : "forward", step: hasFrame(value) ? value.step : 0 });
      if (stage === "choose" || value.step === 1) return route("guide", { type, flow, stage: "choose" });
    }
    if (type === "bus" && flow === "arrival" && stage === "plan") {
      return route("guide", { type, flow, stage: "plan", step: hasFrame(value) ? value.step : 0 });
    }
    return route("guide", { type, flow, ...(isRailMachine(value) ? {direction: value.direction === "reverse" ? "reverse" : "forward"} : {}), step: hasFrame(value) ? value.step : 0 });
  }
  return route("service", { type: value.type });
}

function save() {
  try { localStorage.setItem(storeKey, JSON.stringify(settings)); } catch { /* optional storage */ }
}
function syncScale() {
  document.documentElement.style.setProperty("--scale", settings.size / 100);
}
function navigate(next, replace = false) {
  current = next;
  if (replace) history.replaceState({ companion: next, depth }, "");
  else history.pushState({ companion: next, depth: ++depth }, "");
  render(true);
}
function back() {
  if (depth > 0) history.back();
  else if (current.screen === "guide") navigate(route("service", { type: current.type }), true);
  else if (current.screen === "benefit") navigate(route("benefits"), true);
  else navigate(home, true);
}
window.addEventListener("popstate", event => {
  current = normalizeRoute(event.state?.companion);
  depth = event.state?.depth ?? 0;
  render(true);
});
history.replaceState({ companion: current, depth }, "");

const button = (label, action, value = "", className = "action") =>
  '<button type="button" class="' + className + '" data-action="' + action + '" data-value="' + value + '">' + label + '</button>';
const external = (key, label, classes = "action source") => {
  const official = SOURCES[key];
  return '<a class="' + classes + '" href="' + official.url.replaceAll("&", "&amp;") +
    '" target="_blank" rel="noopener noreferrer" aria-label="' + (label || official.label) +
    '（另開分頁）">' + (label || official.label) + ' ' + icon("external") + '</a>';
};
const sourceList = keys => '<div class="sources">' + keys.map(key => external(key)).join("") + "</div>";
const fieldset = (name, labelId, options, value = "") =>
  '<fieldset aria-labelledby="' + labelId + '"><div class="toggle">' + options.map(([key, title]) =>
    '<label><input class="sr-only" type="radio" name="' + name + '" value="' + key + '"' +
    (key === value ? " checked" : "") + '><span>' + title + '</span></label>'
  ).join("") + "</div></fieldset>";
const screen = (title, content, className = "") =>
  '<main id="content" class="page ' + (current.type ? "theme-" + current.type : "") + ' ' + className +
  '"><h1 tabindex="-1">' + title + "</h1>" + content + "</main>";

function header() {
  const previous = current.screen === "home" ? "" :
    '<button type="button" class="nav-button nav-back" data-action="back" aria-label="返回">' + icon("back") + '</button>';
  return '<header class="toolbar">' +
    '<button type="button" class="brand" data-action="home" aria-label="伴你行，返回首頁">' + logo + '伴你行</button>' +
    button("敬老福利專區", "benefits", "", "nav-button") +
    '<button type="button" class="nav-button voice" data-action="voice" aria-label="朗讀" aria-pressed="false">' +
    icon("voice") + '<span>朗讀</span></button>' + previous + '</header>';
}
function coverScreen() {
  return '<main class="cover"><button type="button" class="cover-button" data-action="start">' +
    '<span class="cover-brand">' + logo + '<span class="cover-title">伴你行</span></span>' +
    '<span class="cover-hint">點擊任意處以繼續</span></button></main>';
}
function settingsScreen() {
  const finish = current.onboarding ? button("開始使用", "enter", "", "action primary") :
    button("完成設定", "back", "", "action primary");
  return screen("使用設定",
    '<section class="panel"><h2 id="size-label">文字大小</h2>' +
    '<div class="setting-scale"><span aria-hidden="true">小</span><input aria-labelledby="size-label" id="font-size" type="range" min="90" max="160" step="1" value="' + settings.size +
    '" aria-valuetext="' + settings.size + '%"><span class="sample-large" aria-hidden="true">大</span></div></section>' +
    '<section class="panel"><h2 id="voice-label">語音朗讀</h2>' +
    fieldset("voice-setting", "voice-label", [["on", "開啟"], ["off", "關閉"]], settings.voice ? "on" : "off") +
    (supportSpeech ? "" : '<p class="setting-note">目前的瀏覽器無法使用朗讀，您仍可使用文字指引。</p>') +
    '</section><div class="section-space">' + finish + "</div>"
  );
}
function homeScreen() {
  const cards = Object.entries(TRANSIT).map(([type, service]) =>
    button(art(type) + '<span>' + service.name + '</span>', "service", type, "tile tile-" + type)
  ).join("");
  return screen("需要什麼幫助？", '<div class="home-intro"><section class="panel home-hero"><div class="home-hero-copy"><h2 class="hero-title">快速找到交通答，伴你行 <svg class="hero-heart" viewBox="0 0 24 24" aria-hidden="true"><path fill="white" d="M12 21S2 14.5 2 7.8C2 2.5 8.5 1 12 6c3.5-5 10-3.5 10 1.8C22 14.5 12 21 12 21Z"/></svg></h2><p class="hero-description">您可以直接輸入問題，或從下方選擇交通工具查看圖解教學與官方服務。</p></div><form class="question-box" id="question-form"><label class="sr-only" for="user-question">輸入您的交通問題</label><input id="user-question" name="question" type="text" placeholder="輸入您的交通問題" required maxlength="1000"><button type="button" data-action="qa-submit">送出</button></form><div class="home-suggestions" aria-label="示範提問"><span class="suggestion-chip">公車怎麼查到站？</span><span class="suggestion-chip">捷運機台怎麼買票？</span><span class="suggestion-chip">阿嬤搭火車有優惠嗎？</span><span class="suggestion-chip">高鐵自由座怎麼買？</span></div><div id="question-status" class="question-status" aria-live="polite"></div></section></div><div class="transit-grid">' + cards + '</div>', "home");
}
function serviceScreen(service) {
  const tasks = Object.entries(service.tasks).map(([id, task]) => {
    const extra = task.extra.map(key => external(key)).join("");
    const guide = VISUAL_GUIDES[current.type + "/" + id];
    return '<section class="panel task" aria-labelledby="task-' + id + '"><h2 id="task-' + id + '">' + task.title + '</h2><div class="controls">' +
      external(task.official, task.action, "action primary") +
      button(guide?.buttonLabel ?? guide?.title ?? "查看指引", "guide", id) + '</div>' +
      (extra ? '<div class="task-extra">' + extra + '</div>' : "") + '</section>';
  }).join("");
  const routeMap = current.type === "metro"
    ? '<details class="panel service-disclosure metro-route-map"><summary>台北捷運路網圖</summary>' +
      zoomPreview('<span class="guide-image"><img src="assets/guides/metro-route-map.webp" width="1280" height="1975" ' +
        'alt="大臺北捷運路線與轉乘示意圖" loading="lazy" draggable="false"></span>', "捷運路線圖，可雙指或用加減鍵縮放") +
      '</details>'
    : "";
  return screen(service.name, '<div class="stack">' + routeMap + tasks + '</div>');
}
function zoomPreview(image, label, descriptionId = "") {
  const description = descriptionId ? ' aria-describedby="' + descriptionId + '"' : "";
  return '<div class="guide-preview" role="group" tabindex="0" aria-label="' + label + '"' + description + '>' + image + '</div>';
}
function guideImage(frame, offset, showNotes, hotspot, code) {
  const rings = (frame.rings ?? []).map(([x, y, width, height, label, style]) =>
    '<span class="shot-ring' + (style ? ' ' + style : '') + '" style="left:' + x + '%;top:' + y + '%;width:' + width + '%;height:' + height + '%">' +
    (label ? '<b class="shot-note">' + label + '</b>' : '') + '</span>'
  ).join("");
  const markers = frame.marks.map(([x, y, width, height, label, notePosition], index) =>
    '<span class="shot-mark' + (notePosition ? ' note-' + notePosition : '') + '" style="left:' + x + '%;top:' + y + '%;width:' + width + '%;height:' + height +
    '%"><span>' + (offset + index + 1) + '</span>' + (showNotes ? '<b class="shot-note">' + label + '</b>' : '') + '</span>'
  ).join("");
  const example = code ? '<span class="shot-code">' + code + '</span><span class="shot-code shot-code-entry">' + code + '</span>' : "";
  const inset = frame.inset ? '<span class="shot-inset"><img src="' +
    frame.inset.image + '" width="' + frame.inset.width + '" height="' + frame.inset.height +
    '" alt="" draggable="false"></span><svg class="shot-inset-arrow" viewBox="0 0 ' + frame.width + ' ' + frame.height +
    '"><path d="' + frame.inset.arrowPath + '"></path></svg>' : "";
  const callouts = (frame.callouts ?? []).map(([x, y, label, style]) =>
    '<b class="shot-note shot-callout' + (style ? ' ' + style : '') + '" style="left:' + x + '%;top:' + y + '%">' + label + '</b>'
  ).join("");
  return '<span class="guide-image"><img src="' + frame.image + '" width="' + frame.width + '" height="' + frame.height +
    '" alt="" draggable="false"><span class="shot-overlay' + (showNotes ? ' has-notes' : '') +
    '" aria-hidden="true">' + rings + markers + example + inset + callouts + '</span>' + hotspot + '</span>';
}
function guideScreen(task) {
  const visual = VISUAL_GUIDES[current.type + "/" + current.flow];
  const frames = framesFor(current);
  const frame = frames[current.step];
  const unreserved = current.stage === "unreserved";
  const title = isRailMachine(current) && !unreserved && current.step === 2 ? "選起站與到達站" : unreserved ? (["選起站與到達站", "選票券數量", "確認與付款"][current.step] ?? "非對號列車") : visual?.title ?? task.title;
  const official = external(visual?.official ?? task.official, "前往官方服務", "action primary");
  const officialGuide = task.guideSource !== task.official ? external(task.guideSource, "查看官方說明") : "";
  if (isRailMachine(current) && current.stage === "choose") {
    const picture = zoomPreview(guideImage(visual.frames[1], 0, false, "", ""),
      "台鐵售票機的列車種類畫面，可雙指或用加減鍵縮放");
    return screen("選擇列車種類", picture + '<div class="machine-choices">' +
      button("對號列車", "machine", "reserved") +
      button("非對號列車", "machine", "unreserved") + '</div>' +
      '<div class="guide-actions">' + button("上一步", "machine", "start", "action primary") + '</div>', "visual-guide");
  }
  if (!frame) {
    return screen(title, '<div class="guide-status"><p>截圖指引尚未完成</p>' + officialGuide +
      '</div><div class="sources">' + official + '</div>', "visual-guide");
  }

  const stationStep = isRailMachine(current) && current.step === (unreserved ? 0 : 2);
  const directionChoices = stationStep ? '<div class="machine-choices" style="margin:0 0 14px">' +
    [["forward", "順"], ["reverse", "逆"]].map(([key, label]) => '<button type="button" class="action' + ((current.direction || "forward") === key ? ' primary' : '') + '" data-action="rail-direction" data-value="' + key + '" aria-pressed="' + ((current.direction || "forward") === key) + '">' + label + '</button>').join("") + '</div>' : "";
  const offset = frames.slice(0, current.step).reduce((count, prior) => count + prior.marks.length, unreserved ? 1 : 0);
  const machineStart = isRailMachine(current) && !unreserved && current.step === 0;
  const firstSelectedFrame = isRailMachine(current) && current.step === (unreserved ? 0 : 2);
  const hotspot = machineStart ?
    '<button type="button" class="machine-start-target" data-action="machine" data-value="choose" aria-label="第 1 步，點購買車票"></button>' : "";
  const code = frame.codeExampleStep !== undefined ?
    Math.random().toString(36).slice(2, 6).padEnd(4, "7").toUpperCase() : "";
  const image = guideImage(frame, offset, visual.showNotes, hotspot, code);
  const extraHints = [...(frame.rings ?? []).map(ring => ring[4]), ...(frame.callouts ?? []).map(callout => callout[2])]
    .filter(Boolean).join("。");
  const hints = frame.marks.map((mark, index) => '<li>' + mark[4] +
    (index === frame.codeExampleStep ? '。範例為 ' + code + '，輸入相同的四個字元。' : "") + '</li>').join("");
  const descriptions = [hints && "guide-steps", extraHints && "guide-extra"].filter(Boolean).join(" ");
  const busGuideHome = current.type === "bus" && current.flow === "arrival" && !current.stage && current.step === 0;
  const busGuidePlan = current.type === "bus" && current.flow === "arrival" && current.stage === "plan";
  const isFinal = !busGuideHome && !machineStart && current.step === frames.length - 1;
  const previous = isFinal ? button("我懂了", "back") : busGuideHome ? button("路線搜尋", "step", "1") :
    busGuidePlan ? button("上一步", "bus-guide", "home") :
    firstSelectedFrame ? button("上一步", "machine", "choose") :
    frame.finishLabel ? button(frame.finishLabel, "back") :
    current.step > 0 ? button("上一步", "step", "-1") : button("上一步", "back");
  const next = busGuideHome ? button("路線規劃", "bus-guide", "plan") :
    machineStart ? button("下一步", "machine", "choose") :
    current.step + 1 < frames.length ? button("下一步", "step", "1") : "";
  const pending = !next && visual.partial ? '<p class="guide-pending">後續截圖尚未完成</p>' + officialGuide : "";
  const note = frame.note ? '<p class="guide-note">' + frame.note + '</p>' : "";
  return screen(title,
    '<p class="guide-channel">' + (frame.channel ?? visual.channel) + '</p>' + note + directionChoices +
    zoomPreview(image, "操作圖片，可雙指或用加減鍵縮放", descriptions) +
    (hints ? '<ol id="guide-steps" class="guide-hints sr-only" start="' + (offset + 1) + '">' + hints + '</ol>' : '') +
    (extraHints ? '<p id="guide-extra" class="sr-only">' + extraHints + '</p>' : '') +
    '<div class="controls guide-actions">' + previous + next + '</div><div class="sources">' + official + pending + '</div>',
    "visual-guide" + (frame.height > frame.width ? " phone-guide" : ""));
}
function benefitScreen() {
  if (!current.item) {
    const choices = Object.entries(TRANSIT).map(([key, transport]) =>
      button(art(key) + '<span>' + transport.name + '</span>', "benefit", key, "tile benefit-tile tile-" + key)
    ).join("");
    const cards = BENEFITS.cards;
    return screen("敬老交通福利", '<section class="benefit-cards"><h2>' + cards.title + '</h2>' +
      benefitSections(cards, "h3", "h4", true) + '</section>' +
      '<nav class="benefit-grid" aria-label="各運具敬老優惠">' + choices + '</nav>', "theme-benefits");
  }
  const item = BENEFITS[current.item];
  return screen(item.title, benefitSections(item), "theme-benefits");
}
function benefitSections(item, heading = "h2", subheading = "h3", collapseNamedSections = false) {
  const withoutFinalPeriod = text => text.replace(/。$/, "");
  const paragraph = text => "<p>" + withoutFinalPeriod(text) + "</p>";
  const listItem = point => {
    if (typeof point === "string") return "<li>" + withoutFinalPeriod(point) + "</li>";
    return '<li class="benefit-point-notice">' + withoutFinalPeriod(point.notice) + "</li>";
  };
  const benefitLine = line => Array.isArray(line)
    ? '<ul class="benefit-points" role="list">' + line.map(listItem).join("") + "</ul>"
    : paragraph(line);
  return item.sections.map(([name, paragraphs, sources, more]) => {
    const title = name ? "<" + heading + ">" + name + "</" + heading + ">" : "";
    const entryHeading = name ? subheading : heading;
    const content = paragraphs.map(entry => {
      if (typeof entry === "string") return paragraph(entry);
      const [label, ...lines] = entry;
      return "<div><" + entryHeading + ">" + label + "</" + entryHeading + ">" + lines.map(benefitLine).join("") + "</div>";
    }).join("");
    const links = sourceList(sources);
    const reference = more
      ? '<details class="benefit-details"><summary>' + (more.length ? "更多資訊與來源" : "查看官方說明") +
        '</summary>' + more.map(paragraph).join("") + links + "</details>"
      : links;
    const body = '<div class="detail-content">' + content + "</div>" + reference;
    if (name && collapseNamedSections) {
      return '<details class="panel benefit-details benefit-city"><summary>' + name + "</summary>" + body + "</details>";
    }
    return '<section class="panel">' + title + body + "</section>";
  }).join("");
}
const views = {
  cover: coverScreen,
  settings: settingsScreen,
  home: homeScreen,
  service: () => serviceScreen(TRANSIT[current.type]),
  guide: () => guideScreen(TRANSIT[current.type].tasks[current.flow]),
  benefits: benefitScreen,
  benefit: benefitScreen
};

function render(focus = false) {
  stopSpeech();
  announcement.textContent = "";
  root.innerHTML = (current.screen === "cover" ? "" : header()) + views[current.screen]();
  const preview = root.querySelector(".guide-preview");
  if (preview) {
    enableGuideZoom(preview);
    const alignNotes = () => {
      preview.querySelectorAll(".shot-mark").forEach(mark => {
        const note = mark.querySelector(".shot-note"), number = mark.firstElementChild;
        if (!note || !number) return;
        const image = mark.closest(".guide-image"), w = image.clientWidth;
        if (!w) return;
        const gap = w * .012, size = w * .074;
        const start = Math.max(0, Math.min(mark.offsetLeft - size * .57, w - size - gap - note.offsetWidth - gap));
        number.style.left = (start - mark.offsetLeft) + "px";
        note.style.left = (start - mark.offsetLeft + size + gap) + "px";
      });
    };
    alignNotes();
    if (typeof ResizeObserver !== "undefined") {
      const observer = new ResizeObserver(() => { if (!preview.isConnected) observer.disconnect(); else alignNotes(); });
      observer.observe(preview);
    }
  }
  if (focus) {
    window.scrollTo(0, 0);
    root.querySelector("h1, .cover-button")?.focus({ preventScroll: true });
  }
}

function enableGuideZoom(preview) {
  const image = preview.querySelector(".guide-image");
  let scale = 1, x = 0, y = 0, gesture;

  function transform(nextScale, nextX, nextY) {
    scale = nextScale;
    x = bounded(nextX, preview.clientWidth * (1 - scale), 0);
    y = bounded(nextY, preview.clientHeight * (1 - scale), 0);
    image.style.transform = 'translate(' + x + 'px, ' + y + 'px) scale(' + scale + ')';
    preview.classList.toggle("is-zoomed", scale > 1);
  }

  function readGesture(touches) {
    if (!touches.length) return null;
    const first = touches[0];
    const second = touches[1];
    const bounds = preview.getBoundingClientRect();
    return {
      fingers: second ? 2 : 1,
      x: (second ? (first.clientX + second.clientX) / 2 : first.clientX) - bounds.left,
      y: (second ? (first.clientY + second.clientY) / 2 : first.clientY) - bounds.top,
      distance: second ? Math.hypot(first.clientX - second.clientX, first.clientY - second.clientY) : 1
    };
  }

  for (const type of ["touchstart", "touchend", "touchcancel"]) {
    preview.addEventListener(type, event => { gesture = readGesture(event.touches); }, { passive: true });
  }
  preview.addEventListener("touchmove", event => {
    const next = readGesture(event.touches);
    if (!next || !gesture || next.fingers !== gesture.fingers || (scale === 1 && next.fingers === 1)) return;
    if (event.cancelable) event.preventDefault();
    const nextScale = bounded(scale * next.distance / Math.max(1, gesture.distance), 1, 4);
    const ratio = nextScale / scale;
    transform(nextScale, next.x + (x - gesture.x) * ratio, next.y + (y - gesture.y) * ratio);
    gesture = next;
  }, { passive: false });

  const panOffsets = new Map([["ArrowLeft", [36, 0]], ["ArrowRight", [-36, 0]], ["ArrowUp", [0, 36]], ["ArrowDown", [0, -36]]]);
  preview.addEventListener("keydown", event => {
    if (event.target !== preview) return;
    const { key } = event;
    const pan = panOffsets.get(key);
    if (["+", "=", "-", "−", "0"].includes(key)) {
      event.preventDefault();
      const nextScale = key === "0" ? 1 : bounded(scale * (key === "+" || key === "=" ? 1.25 : .8), 1, 4);
      const ratio = nextScale / scale;
      const cx = preview.clientWidth / 2;
      const cy = preview.clientHeight / 2;
      transform(nextScale, cx + (x - cx) * ratio, cy + (y - cy) * ratio);
    } else if (scale > 1 && pan) {
      event.preventDefault();
      transform(scale, x + pan[0], y + pan[1]);
    }
  });
}

function updateSpeechButton() {
  const control = root.querySelector('[data-action="voice"]');
  if (!control) return;
  const active = Boolean(speaking);
  const label = active ? "停止朗讀" : "朗讀";
  control.setAttribute("aria-label", label);
  control.setAttribute("aria-pressed", String(active));
  control.innerHTML = icon(active ? "stop" : "voice") + '<span>' + label + "</span>";
}
function stopSpeech() {
  if (supportSpeech && speaking) {
    speaking = null;
    window.speechSynthesis.cancel();
    updateSpeechButton();
  }
}
function speechNotice(message) {
  announcement.textContent = message;
  const main = root.querySelector("main");
  let notice = main.querySelector(".speech-notice");
  if (!notice) {
    notice = document.createElement("p");
    notice.className = "setting-note speech-notice";
    main.append(notice);
  }
  notice.textContent = message;
}
function speakPage() {
  if (speaking) return stopSpeech();
  if (!supportSpeech) return speechNotice("此瀏覽器暫時無法朗讀，您仍可使用文字指引。");
  if (!settings.voice) {
    if (current.screen !== "settings") navigate(route("settings"));
    return speechNotice("朗讀已關閉，可在這裡重新開啟。");
  }
  const guide = current.screen === "guide" && current.stage !== "choose";
  const content = [...root.querySelectorAll(guide ? "main h1, main .guide-channel, main .guide-hints li, main #guide-extra, main .guide-status p" : "main h1, main h2, main h3, main h4, main p, main .benefit-points li, main .guide-hints li, main .choice, main .tile > span, main .action, main summary")]
    .filter(node => !node.closest("[hidden]") && !node.classList.contains("speech-notice"))
    .filter(node => !(node.matches("summary") ? node.parentElement.parentElement : node).closest("details:not([open])"))
    .map(node => (node.getAttribute("aria-valuetext") || node.textContent).trim()).filter(Boolean).join("。");
  const utterance = new SpeechSynthesisUtterance(content);
  const voices = window.speechSynthesis.getVoices();
  const taiwanese = voices.find(voice => /^zh[-_]tw$/i.test(voice.lang)) || voices.find(voice => /繁體|台灣|臺灣/.test(voice.name));
  utterance.lang = "zh-TW";
  if (taiwanese) utterance.voice = taiwanese;
  utterance.rate = 0.89;
  const end = () => {
    if (speaking !== utterance) return false;
    speaking = null;
    updateSpeechButton();
    return true;
  };
  utterance.onend = end;
  utterance.onerror = () => {
    if (end()) speechNotice("這次未能播放語音。您可以再試一次，或使用文字指引。");
  };
  window.speechSynthesis.cancel();
  speaking = utterance;
  updateSpeechButton();
  window.speechSynthesis.speak(utterance);
}

const qaGroups = {
 bus: {names:'公車|公交|巴士|客運|bus|站牌|等車|到站|公車站|低地板|幹線|小巴', items:[
 ['路線搜尋','輸入公車路線，查看方向與各站預計到站時間。','guide','bus/arrival/1','找車|找公車|哪班|幾號|哪一班|路線|搜尋|查公車|搭哪|坐哪|哪台|站牌|站名|公車號碼|班次|到站|多久|幾分鐘|等車|即時|何時|什麼時候|往哪|方向'],
 ['路線規劃','輸入起點與終點，比較搭乘方式、時間及車資。','plan','bus','怎麼去|怎麼到|怎麼走|怎麼搭|如何到|如何去|如何搭|怎麼坐|從|到哪|目的地|轉乘|換車|規劃|導航|起點|終點|下車|上車|哪裡搭'],
 ['大臺北公車官網','查詢公車路線及即時到站資訊。','web','bus','官網|網站|線上|即時|查詢|時刻|時間|班次'],
 ['公車刷卡與票價','查看雙北公車刷卡與乘車規定。','web','busFare','刷卡|悠遊卡|一卡通|票價|多少錢|收費|車資|付款|上下車|投幣|現金'],
 ['低地板公車','查看新北低地板公車資訊。','web','busNorth','輪椅|低地板|無障礙|行動不便|推車|助行器'],
 ['公車敬老優惠','查看敬老卡與搭乘優惠。','benefit','bus','老人|長者|敬老|愛心|身障|優惠|免費|點數|半價'],
 ['公車官方資訊','查詢公車相關服務與聯絡資訊。','web','busContact','客服|電話|申訴|遺失|失物|問題|投訴|聯絡'] ]},
 metro:{names:'捷運|地鐵|北捷|新北捷運|mrt|metro|板南線|淡水信義線|松山新店線|中和新蘆線|文湖線|環狀線|紅線|藍線|綠線|橘線|棕線|黃線',items:[
 ['票價與乘車時間指南','用 APP 查看票價及行駛時間。','guide','metro/fare/0','票價|多少錢|車資|時間|多久|幾分鐘|查詢|時刻|班次|愛心票|費用'],
 ['捷運路網圖','查看捷運各站與轉乘路線。','map','metro','路線|地圖|路網|轉乘|換車|怎麼搭|怎麼去|怎麼到|哪站|出口|方向|起點|終點|站名'],
 ['現場機台購票','依照圖解操作售票機、選擇票價與張數。','guide','metro/buy/0','機台|機器|售票機|自動|現場|單程|買票|購票|車票|投幣|現金|張數'],
 ['線上購票','前往北捷網頁購票。','web','metroBuy','網路|線上|網頁|買票|購票|電子票'],
 ['手機購票','查看北捷手機購票官方說明。','web','metroQr','手機|app|qr|電子票|行動支付'],
 ['捷運官方路線與票價','前往北捷官方查詢。','web','metro','官方|官網|網站|票價|路線|時刻|營運'],
 ['敬老與愛心優惠','查看敬老卡扣點及敬老單程票資訊。','benefit','metro','敬老|老人|長者|愛心|身障|優惠|點數|半價|折扣'],
 ['無障礙乘車','查看北捷無障礙服務。','web','metroAccess','輪椅|電梯|無障礙|行動不便|助行器'],
 ['新北捷運資訊','前往新北捷運官網。','web','ntMetro','新北|淡海|安坑|輕軌|環狀線'] ]},
 rail:{names:'台鐵|臺鐵|火車|鐵路|區間|區間快|自強|莒光|普悠瑪|太魯閣|新自強|EMU3000|tra|train',items:[
 ['APP 查詢時刻','選擇出發站、到達站及日期，查看車次。','guide','rail/time/0','時刻|班次|車次|時間|幾點|多久|查車|查詢|app|手機|末班|首班|到站|出發|抵達'],
 ['線上訂票','前往台鐵官方訂票網站。','web','railBook','買票|購票|訂票|網路|線上|預訂|訂位|搶票|預售|車票|座位'],
 ['現場機台購票','查看自動售票機操作圖解。','guide','rail/buy/0','機台|機器|售票機|現場|自動|買票|購票|現金|張數|付款'],
 ['對號列車購票','查看對號列車機台操作。','reserved','rail','對號|指定座位|自強|莒光|普悠瑪|太魯閣|座位'],
 ['非對號列車購票','查看非對號列車機台操作及順逆方向。','unreserved','rail','非對號|不對號|區間|區間快|不劃位|站票|順|逆|北上|南下'],
 ['台鐵官網與時刻','查看官方時刻、車站及相關服務。','web','rail','官網|網站|官方|路線|時刻|班次|查詢|轉乘'],
 ['車站購票說明','查看台鐵車站購票官方資訊。','web','railMachine','臨櫃|窗口|櫃台|櫃檯|現場|人工|取票'],
 ['台鐵敬老票','查看敬老票與社福卡優惠。','benefit','rail','敬老|老人|長者|阿嬤|阿公|長輩|銀髮|愛心|身障|點數|半價|優惠'],
 ['用票規定','查看官方票種與用票規則。','web','railFare','票價|車資|多少錢|退票|改票|補票|票種|規定|票券|刷卡|悠遊卡|行李'],
 ['無障礙服務','查看台鐵無障礙乘車資訊。','web','railAccess','輪椅|電梯|無障礙|行動不便|助行器'],
 ['台鐵客服','前往台鐵官方客服。','web','railHelp','客服|電話|聯絡|遺失|失物|申訴|投訴'] ]},
 hsr:{names:'高鐵|高速鐵路|高鉄|高铁|thsrc|hsr|t-ex|tex|t express|高鐵站',items:[
 ['線上買票','前往高鐵官方線上訂票系統。','web','hsrDirect','買票|購票|訂票|網路|線上|預訂|訂位|搶票|預售|車票|座位|早鳥'],
 ['APP 看車次','使用台北等公車 APP 指南查詢高鐵班次。','guide','hsr/time/0','車次|班次|時刻|時間|幾點|多久|查車|查詢|app|手機|末班|首班|到站|出發|抵達|北上|南下'],
 ['T-EX APP 購票','查看手機訂票及付款操作圖解。','guide','hsr/buy/0','app|手機|t-ex|tex|買票|購票|訂票|付款|驗證碼|取票|電子票|行動票'],
 ['臨櫃買票','查看高鐵售票窗口官方說明。','web','hsrCounter','臨櫃|窗口|櫃台|櫃檯|現場|人工|取票|現金'],
 ['自由座與票種','查看自由座、對號座及各種票券的官方規定。','web','hsrFare','自由座|非對號|站票|對號|票種|票價|車資|多少錢|座位|商務|標準|折扣|優惠|兒童|學生'],
 ['高鐵官網','查詢官方時刻及票價。','web','hsr','官網|網站|官方|時刻|票價|路線|班次|查詢|車站'],
 ['自動售票機','查看高鐵自動售票機官方說明。','web','hsrMachine','機台|機器|售票機|自動|現場|投幣|現金'],
 ['高鐵敬老票','查看敬老票資格及購票說明。','benefit','hsr','敬老|老人|長者|愛心|身障|半價|優惠'],
 ['無障礙服務','查看高鐵無障礙乘車服務。','web','hsrAccess','輪椅|電梯|無障礙|行動不便|助行器'],
 ['高鐵客服','查詢高鐵官方客服與聯絡方式。','web','hsrContact','客服|電話|聯絡|遺失|失物|退票|改票|申訴|投訴|行李'] ]}
};
const qaNorm = s => s.normalize('NFKC').toLowerCase().replace(/\s+/g,'').replace(/臺/g,'台').replace(/髙/g,'高');
const qaMatch = (q, keys) => keys.split('|').filter(k=>q.includes(qaNorm(k)));
const qaEscape = s => s.replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
function qaAnswer(question){
 const q=qaNorm(question); let groups=Object.entries(qaGroups).filter(([k,g])=>qaMatch(q,g.names).length);
 // Do not let the substring 對號 cause a false reserved match for 非對號.
 const query=q.replace(/非對號|不對號/g,'區間');
 const all=Object.entries(qaGroups); const broad=/^(我想|我需要|請問|請教|想知道|想問|我要|我|請|幫我)*(怎麼|如何|要怎樣|怎樣|想|要|可以|能不能|能|該怎麼)*(搭乘|搭|坐|乘坐|使用|去|乘|查)?(高鐵|台鐵|火車|捷運|公車|巴士|地鐵|客運)(怎麼搭|如何搭|怎麼坐|怎麼用|嗎|呢|啊|呀|？|\?|。|！|!)*$/.test(q);
 let heading='', rows=[];
 if(groups.length){
  heading='您可以參考以下'+groups.map(([k])=>TRANSIT[k].name).join('、')+'服務：';
  for(const [k,g] of groups){
   let ranked=g.items.map((a,i)=>({a,i,score:qaMatch(query,a[4]).reduce((n,w)=>n+Math.max(1,w.length-1),0)}));
   const hits=ranked.filter(x=>x.score>0).sort((a,b)=>b.score-a.score||a.i-b.i);
   rows.push(...((broad||!hits.length)?ranked:hits).map(x=>x.a));
  }
 }else if(/敬老卡|愛心卡|社福卡|敬老|長者|老人|身障|點數|65歲|六十五歲/.test(q)){
  heading='您可以查看敬老交通福利及各縣市官方說明：';
  rows=[['敬老交通福利','查看敬老卡、愛心卡及各交通工具優惠。','benefits','', ''],['臺北敬老卡申請','查看官方申請資格。','web','taipei',''],['新北敬老愛心卡','查看官方優惠與申辦資訊。','web','newTaipei','']];
 }else{
  const hits=all.flatMap(([k,g])=>g.items.map(a=>({a,k,score:qaMatch(query,a[4]).reduce((n,w)=>n+Math.max(1,w.length-1),0)}))).filter(x=>x.score>0).sort((a,b)=>b.score-a.score);
  if(hits.length){heading='請選擇您要使用的交通工具或相關服務：'; rows=hits.map(({a,k})=>[TRANSIT[k].name+'｜'+a[0],...a.slice(1)]);}
  else {heading='目前無法判斷您的問題，您可以先使用以下官方網站查詢：'; rows=all.map(([k,g])=>[TRANSIT[k].name+'官網','前往官方服務查詢。','web',({bus:'bus',metro:'metro',rail:'rail',hsr:'hsr'})[k],'']);}
 }
 const seen=new Set(); rows=rows.filter(a=>{const k=a[2]+'|'+a[3];if(seen.has(k))return false;seen.add(k);return true;});
 return '<section class="qa-answer"><p>'+heading+'</p><div class="qa-options">'+rows.map(a=>'<article class="qa-option"><p><strong>'+a[0]+'</strong>：'+a[1]+'</p>'+(a[2]==='web'?external(a[3],'前往官方網站','action'):button('查看'+a[0], 'qa-open',a[2]+':'+a[3],'action'))+'</article>').join('')+'</div><p class="qa-disclaimer">以上為網站現有指引與官方連結，非即時班次或票價回答。</p></section>';
}

const commands = {
  "qa-open": value => {
    const [kind,target]=value.split(":");
    if(kind==="guide"){const [type,flow,step]=target.split("/"); navigate(route("guide",{type,flow,step:Number(step)}));}
    else if(kind==="plan") navigate(route("guide",{type:"bus",flow:"arrival",stage:"plan",step:0}));
    else if(kind==="benefit") navigate(route("benefit",{item:target}));
    else if(kind==="benefits") navigate(route("benefits"));
    else if(kind==="map"){navigate(route("service",{type:"metro"})); const d=root.querySelector(".metro-route-map");if(d){d.open=true;d.scrollIntoView({block:"start"});}}
    else if(kind==="reserved") navigate(route("guide",{type:"rail",flow:"buy",step:2,direction:"forward"}));
    else if(kind==="unreserved") navigate(route("guide",{type:"rail",flow:"buy",stage:"unreserved",step:0,direction:"forward"}));
  },
  back,
  start: () => navigate(route("settings", { onboarding: true })),
  enter: () => navigate(home, true),
  home: () => { if (current.screen !== "home") navigate(home); },
  service: type => navigate(route("service", { type })),
  guide: flow => navigate(route("guide", { type: current.type, flow, step: 0 })),
  machine: option => {
    const { type, flow } = current;
    if (option === "choose") {
      navigate(route("guide", { type, flow, stage: "choose" }), true);
    } else if (option === "unreserved") {
      navigate(route("guide", { type, flow, stage: "unreserved", direction: "forward", step: 0 }), true);
    } else {
      navigate(route("guide", { type, flow, step: option === "reserved" ? 2 : 0 }), true);
    }
  },
  "rail-direction": direction => navigate({ ...current, direction }, true),
  "bus-guide": option => {
    if (option === "plan") {
      navigate(route("guide", { type: current.type, flow: current.flow, stage: "plan", step: 0 }), true);
    } else {
      navigate(route("guide", { type: current.type, flow: current.flow, step: 0 }), true);
    }
  },
  step: direction => {
    const changed = { ...current, step: current.step + Number(direction) };
    if (hasFrame(changed)) navigate(changed, true);
  },
  benefits: () => { if (current.screen !== "benefits") navigate(route("benefits")); },
  benefit: item => navigate(route("benefit", { item })),
  voice: speakPage
};

function submitQuestion() {
  const input = root.querySelector("#user-question");
  const status = root.querySelector("#question-status");
  if (!input || !status) return;
  const question = input.value.trim();
  if (!question) { status.textContent = "請先輸入您的問題。"; return; }
  try { status.innerHTML = qaAnswer(question); }
  catch (error) { console.error(error); status.innerHTML = '<p>暫時無法辨識問題，請參考以下官方網站：</p>' + sourceList(["bus","metro","rail","hsr"]); }
}
commands["qa-submit"] = submitQuestion;
root.addEventListener("submit", event => {
  if (event.target.id !== "question-form") return;
  event.preventDefault(); submitQuestion();
});
root.addEventListener("keydown", event => {
  if (event.target.id === "user-question" && event.key === "Enter" && !event.isComposing) { event.preventDefault(); submitQuestion(); }
});
root.addEventListener("click", event => {
  const element = event.target.closest("[data-action]");
  if (element) commands[element.dataset.action]?.(element.dataset.value);
});
root.addEventListener("input", event => {
  if (event.target.id !== "font-size") return;
  settings.size = Number(event.target.value);
  event.target.setAttribute("aria-valuetext", settings.size + "%");
  syncScale();
  save();
});
root.addEventListener("change", event => {
  if (event.target.name === "voice-setting") {
    settings.voice = event.target.value === "on";
    if (!settings.voice) stopSpeech();
    root.querySelector(".speech-notice")?.remove();
    announcement.textContent = "";
    save();
  }
});

syncScale();
render();
