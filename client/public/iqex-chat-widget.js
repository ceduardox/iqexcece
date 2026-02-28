(function () {
  if (window.__IQEX_CHAT_WIDGET__) return;
  window.__IQEX_CHAT_WIDGET__ = true;

  var script = document.currentScript || (function () {
    var scripts = document.getElementsByTagName("script");
    return scripts[scripts.length - 1];
  })();

  var baseUrl = (script && script.getAttribute("data-base-url")) || window.location.origin;
  var site = (script && script.getAttribute("data-site")) || window.location.hostname || "external";
  var title = (script && script.getAttribute("data-title")) || "Asesor IQEx";
  var position = (script && script.getAttribute("data-position")) || "right";

  var style = document.createElement("style");
  style.textContent = [
    "@keyframes iqexPulse {",
    "  0% { box-shadow: 0 0 0 0 rgba(58,123,213,0.7); }",
    "  70% { box-shadow: 0 0 0 15px rgba(58,123,213,0); }",
    "  100% { box-shadow: 0 0 0 0 rgba(58,123,213,0); }",
    "}",
    "@keyframes iqexBlinkDot {",
    "  0%, 100% { opacity: 1; }",
    "  50% { opacity: .25; }",
    "}",
    ".iqex-chat-root { position: fixed; bottom: 30px; z-index: 2147483000; font-family: 'Segoe UI', Roboto, sans-serif; }",
    ".iqex-chat-root.right { right: 30px; }",
    ".iqex-chat-root.left { left: 30px; }",
    ".iqex-chat-trigger {",
    "  width: 58px; height: 58px; border: none; border-radius: 50%; cursor: pointer;",
    "  display: grid; place-items: center; font-weight: 700; font-size: 22px; color: #fff;",
    "  background: linear-gradient(135deg, #00d2ff 0%, #3a7bd5 100%);",
    "  box-shadow: 0 8px 20px rgba(58,123,213,0.4); transition: all .3s ease; animation: iqexPulse 2s infinite;",
    "}",
    ".iqex-chat-trigger:hover { transform: scale(1.05) translateY(-5px); box-shadow: 0 12px 25px rgba(58,123,213,0.5); }",
    ".iqex-chat-modal {",
    "  position: absolute; bottom: 70px; width: 380px; max-width: calc(100vw - 24px); height: 550px; max-height: calc(100vh - 110px);",
    "  background: rgba(255,255,255,.9); backdrop-filter: blur(10px); border-radius: 24px; box-shadow: 0 10px 30px rgba(0,0,0,.15);",
    "  overflow: hidden; transform: translateY(20px) scale(.9); opacity: 0; pointer-events: none;",
    "  transition: all .4s cubic-bezier(0.175, 0.885, 0.32, 1.275); border: 1px solid rgba(255,255,255,.3);",
    "}",
    ".iqex-chat-modal.right { right: 0; left: auto; }",
    ".iqex-chat-modal.left { left: 0; right: auto; }",
    ".iqex-chat-modal.active { transform: translateY(0) scale(1); opacity: 1; pointer-events: auto; }",
    ".iqex-chat-modal.keyboard-open { transform: none !important; transition: opacity .2s ease; }",
    ".iqex-chat-header { background: linear-gradient(135deg, #00d2ff 0%, #3a7bd5 100%); padding: 14px 16px; color: #fff; display: flex; align-items: center; justify-content: space-between; }",
    ".iqex-chat-head-info { display: flex; align-items: center; gap: 12px; }",
    ".iqex-chat-avatar { width: 40px; height: 40px; background: rgba(255,255,255,.2); border-radius: 50%; display: grid; place-items: center; font-size: 18px; }",
    ".iqex-chat-head-title { font-weight: 700; font-size: 16px; line-height: 1.1; }",
    ".iqex-chat-head-sub { font-size: 11px; opacity: .85; margin-top: 2px; }",
    ".iqex-chat-head-sub-dot { display: inline-block; margin-right: 4px; animation: iqexBlinkDot 1.2s ease-in-out infinite; }",
    ".iqex-chat-close { background: none; border: none; color: #fff; cursor: pointer; opacity: .85; font-size: 20px; line-height: 1; }",
    ".iqex-chat-close:hover { opacity: 1; }",
    ".iqex-chat-frame-wrap { height: calc(100% - 68px); background: #fff; }",
    ".iqex-chat-frame { width: 100%; height: 100%; border: 0; }",
    "@media (max-width: 640px) {",
    "  .iqex-chat-root.right, .iqex-chat-root.left { right: 12px; left: 12px; bottom: 12px; }",
    "  .iqex-chat-modal { width: 100%; bottom: 64px; }",
    "  .iqex-chat-trigger { width: 58px; height: 58px; }",
    "}",
  ].join("");
  document.head.appendChild(style);

  var root = document.createElement("div");
  root.className = "iqex-chat-root " + (position === "left" ? "left" : "right");

  var trigger = document.createElement("button");
  trigger.type = "button";
  trigger.className = "iqex-chat-trigger";
  trigger.setAttribute("aria-label", "Abrir chat");
  trigger.innerHTML = '<span style="font-size:22px; line-height:1;">💬</span>';

  var modal = document.createElement("div");
  var side = position === "left" ? "left" : "right";
  modal.className = "iqex-chat-modal " + side;

  var header = document.createElement("div");
  header.className = "iqex-chat-header";
  header.innerHTML =
    '<div class="iqex-chat-head-info">' +
    '  <div class="iqex-chat-avatar">🎧</div>' +
    '  <div>' +
    '    <div class="iqex-chat-head-title">' + title + '</div>' +
    '    <div class="iqex-chat-head-sub"><span class="iqex-chat-head-sub-dot">●</span>En línea ahora</div>' +
    "  </div>" +
    "</div>";

  var closeBtn = document.createElement("button");
  closeBtn.type = "button";
  closeBtn.className = "iqex-chat-close";
  closeBtn.setAttribute("aria-label", "Cerrar chat");
  closeBtn.textContent = "×";
  header.appendChild(closeBtn);

  var frameWrap = document.createElement("div");
  frameWrap.className = "iqex-chat-frame-wrap";

  var iframe = document.createElement("iframe");
  iframe.className = "iqex-chat-frame";
  iframe.src =
    baseUrl.replace(/\/$/, "") +
    "/widget/chat?site=" +
    encodeURIComponent(site) +
    "&title=" +
    encodeURIComponent(title);
  iframe.setAttribute("title", "IQEx Chat Widget");

  frameWrap.appendChild(iframe);
  modal.appendChild(header);
  modal.appendChild(frameWrap);

  function keepModalInViewport() {
    if (!modal.classList.contains("active")) return;
    modal.style.left = "";
    modal.style.right = "";
    modal.classList.remove("left", "right");
    modal.classList.add(side);
    modal.style.transform = "";
    modal.style.marginLeft = "0";
    modal.style.marginRight = "0";

    var rect = modal.getBoundingClientRect();
    var margin = 8;
    var shiftX = 0;
    if (rect.right > window.innerWidth - margin) {
      shiftX -= rect.right - (window.innerWidth - margin);
    }
    if (rect.left < margin) {
      shiftX += margin - rect.left;
    }
    if (shiftX !== 0) modal.style.marginLeft = shiftX + "px";
  }

  function isLikelyKeyboardResize() {
    if (!window.visualViewport) return false;
    var viewportH = window.visualViewport.height || 0;
    var fullH = window.innerHeight || 0;
    return fullH > 0 && viewportH > 0 && (fullH - viewportH) > 120;
  }

  function updateKeyboardMode() {
    if (!modal.classList.contains("active")) return;
    if (isLikelyKeyboardResize()) {
      modal.classList.add("keyboard-open");
      modal.style.maxHeight = "58vh";
      modal.style.bottom = "76px";
    } else {
      modal.classList.remove("keyboard-open");
      modal.style.maxHeight = "";
      modal.style.bottom = "";
    }
  }

  function toggleChat(forceOpen) {
    var open = modal.classList.contains("active");
    var next = typeof forceOpen === "boolean" ? forceOpen : !open;
    modal.classList.toggle("active", next);
    if (next) {
      requestAnimationFrame(function () {
        keepModalInViewport();
        updateKeyboardMode();
      });
    }
  }

  trigger.addEventListener("click", function () {
    toggleChat();
  });
  closeBtn.addEventListener("click", function () {
    toggleChat(false);
  });

  window.addEventListener("resize", function () {
    requestAnimationFrame(function () {
      updateKeyboardMode();
      if (!isLikelyKeyboardResize()) keepModalInViewport();
    });
  });
  window.addEventListener("orientationchange", function () {
    requestAnimationFrame(function () {
      keepModalInViewport();
      updateKeyboardMode();
    });
  });
  if (window.visualViewport) {
    window.visualViewport.addEventListener("resize", function () {
      requestAnimationFrame(updateKeyboardMode);
    });
  }

  root.appendChild(modal);
  root.appendChild(trigger);
  document.body.appendChild(root);
})();
