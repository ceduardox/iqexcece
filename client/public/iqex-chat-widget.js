(function () {
  if (window.__IQEX_CHAT_WIDGET__) return;
  window.__IQEX_CHAT_WIDGET__ = true;

  var script = document.currentScript || (function () {
    var scripts = document.getElementsByTagName("script");
    return scripts[scripts.length - 1];
  })();

  var baseUrl = (script && script.getAttribute("data-base-url")) || window.location.origin;
  var site = (script && script.getAttribute("data-site")) || window.location.hostname || "external";
  var title = (script && script.getAttribute("data-title")) || "Asesor IA";
  var position = (script && script.getAttribute("data-position")) || "right";

  var container = document.createElement("div");
  container.style.position = "fixed";
  container.style.bottom = "20px";
  container.style.zIndex = "2147483000";
  container.style[position === "left" ? "left" : "right"] = "20px";
  container.style.fontFamily = "system-ui,-apple-system,Segoe UI,Roboto,sans-serif";

  var frameWrap = document.createElement("div");
  frameWrap.style.width = "360px";
  frameWrap.style.maxWidth = "calc(100vw - 24px)";
  frameWrap.style.height = "560px";
  frameWrap.style.maxHeight = "calc(100vh - 96px)";
  frameWrap.style.borderRadius = "14px";
  frameWrap.style.overflow = "hidden";
  frameWrap.style.boxShadow = "0 12px 36px rgba(0,0,0,0.22)";
  frameWrap.style.background = "#fff";
  frameWrap.style.display = "none";

  var iframe = document.createElement("iframe");
  iframe.src = baseUrl.replace(/\/$/, "") + "/widget/chat?site=" + encodeURIComponent(site) + "&title=" + encodeURIComponent(title);
  iframe.style.width = "100%";
  iframe.style.height = "100%";
  iframe.style.border = "0";
  iframe.setAttribute("title", "IQEx Chat Widget");

  frameWrap.appendChild(iframe);

  var button = document.createElement("button");
  button.type = "button";
  button.setAttribute("aria-label", "Abrir chat");
  button.textContent = "Chat";
  button.style.height = "52px";
  button.style.padding = "0 18px";
  button.style.borderRadius = "999px";
  button.style.border = "0";
  button.style.cursor = "pointer";
  button.style.color = "#fff";
  button.style.fontWeight = "700";
  button.style.fontSize = "14px";
  button.style.background = "linear-gradient(135deg,#06b6d4,#7c3aed)";
  button.style.boxShadow = "0 8px 24px rgba(124,58,237,0.35)";

  var open = false;
  button.addEventListener("click", function () {
    open = !open;
    frameWrap.style.display = open ? "block" : "none";
    button.textContent = open ? "Cerrar" : "Chat";
  });

  container.appendChild(frameWrap);
  container.appendChild(button);
  document.body.appendChild(container);
})();

