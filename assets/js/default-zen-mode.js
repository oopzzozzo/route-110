document.addEventListener('DOMContentLoaded', function() {
  const b = document.getElementById("zen-mode-button");
  _toogleZenMode(b);
});
function _toogleZenMode(e) {
      const n = document.querySelector("body")
        , s = document.querySelector(".toc-right")
        , o = document.querySelector(".toc-inside")
        , i = document.querySelector(".article-content")
        , t = document.querySelector("#single_header");
      n.classList.toggle("zen-mode-enable"),
        s && s.classList.toggle("lg:block"),
        o && o.classList.toggle("lg:hidden"),
        i.classList.toggle("max-w-fit"),
        i.classList.toggle("max-w-prose"),
        t.classList.toggle("max-w-full"),
        t.classList.toggle("max-w-prose");
      const a = e.getAttribute("data-title-i18n-disable")
        , r = e.getAttribute("data-title-i18n-enable");
      n.classList.contains("zen-mode-enable") ? (e.setAttribute("title", r),
            window.scrollTo(window.scrollX, t.getBoundingClientRect().top - 90)) : (e.setAttribute("title", a),
                  document.querySelector("body").scrollIntoView())
}
