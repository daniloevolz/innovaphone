window.wecomChatWidget = {
  init: function (options) {
    function getQueryParam(name) {
      var match = window.location.search.match(new RegExp("([?&])" + name + "=([^&]+)"));
      return match ? decodeURIComponent(match[2]) : null;
    }

    var chatIconSVG = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 800 800" height="28px" width="28px" role="img" alt="Chat icon" aria-labelledby="openIconTitle openIconDesc" class="tawk-min-chat-icon"><title id="openIconTitle">Opens Chat</title><desc id="openIconDesc">This icon Opens the chat window.</desc><path fill-rule="evenodd" clip-rule="evenodd" d="M400 26.2c-193.3 0-350 156.7-350 350 0 136.2 77.9 254.3 191.5 312.1 15.4 8.1 31.4 15.1 48.1 20.8l-16.5 63.5c-2 7.8 5.4 14.7 13 12.1l229.8-77.6c14.6-5.3 28.8-11.6 42.4-18.7C672 630.6 750 512.5 750 376.2c0-193.3-156.7-350-350-350zm211.1 510.7c-10.8 26.5-41.9 77.2-121.5 77.2-79.9 0-110.9-51-121.6-77.4-2.8-6.8 5-13.4 13.8-11.8 76.2 13.7 147.7 13 215.3.3 8.9-1.8 16.8 4.8 14 11.7z" fill="#FFFFFF"></path></svg>`;

    var closeIconSVG = `
      <svg xmlns="http://www.w3.org/2000/svg" width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="#ffffff" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
        <line x1="18" y1="6" x2="6" y2="18" />
        <line x1="6" y1="6" x2="18" y2="18" />
      </svg>`;

    var inboxId = getQueryParam("id");
    var iframeUrl = options.wecallUrl //options.baseUrl
    var id = options.id;
    if(id){
      iframeUrl += "?id=" + encodeURIComponent(id);
    }
    if (inboxId) {
      iframeUrl += "?id=" + encodeURIComponent(inboxId);
    }
    var btn = document.createElement("button");
    btn.innerHTML = chatIconSVG; //`<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 800 800" height="32px" width="32px" role="img" alt="Chat icon" aria-labelledby="openIconTitle openIconDesc" class="tawk-min-chat-icon"><title id="openIconTitle">Opens Chat</title><desc id="openIconDesc">This icon Opens the chat window.</desc><path fill-rule="evenodd" clip-rule="evenodd" d="M400 26.2c-193.3 0-350 156.7-350 350 0 136.2 77.9 254.3 191.5 312.1 15.4 8.1 31.4 15.1 48.1 20.8l-16.5 63.5c-2 7.8 5.4 14.7 13 12.1l229.8-77.6c14.6-5.3 28.8-11.6 42.4-18.7C672 630.6 750 512.5 750 376.2c0-193.3-156.7-350-350-350zm211.1 510.7c-10.8 26.5-41.9 77.2-121.5 77.2-79.9 0-110.9-51-121.6-77.4-2.8-6.8 5-13.4 13.8-11.8 76.2 13.7 147.7 13 215.3.3 8.9-1.8 16.8 4.8 14 11.7z" fill="#FFFFFF"></path></svg>`;
    btn.style.position = "fixed";
    btn.style.bottom = "20px";
    btn.style.right = "20px";
    btn.style.zIndex = "99999";
    btn.style.padding = "15px";
    btn.style.background = "#1e3a8a";
    btn.style.color = "white";
    btn.style.borderRadius = "50%";
    btn.style.border = "none";
    btn.style.cursor = "pointer";
    // Efeito de hover
    btn.addEventListener("mouseenter", function () {
      btn.style.boxShadow = "0 10px 32px rgba(0, 0, 0, 0.4)";
    });
    btn.addEventListener("mouseleave", function () {
      btn.style.boxShadow = "none";
    });

    var iframe = document.createElement("iframe");
    iframe.src = iframeUrl;
    iframe.style.position = "fixed";
    iframe.style.bottom = "80px";
    iframe.style.right = "20px";
    iframe.style.width = "400px";
    iframe.style.height = "500px";
    iframe.style.border = "none";
    iframe.style.zIndex = "99998";
    iframe.style.display = "none";
    iframe.style.borderRadius = "12px";
    iframe.style.boxShadow = "0 0 10px rgba(0,0,0,0.3)";

    // btn.onclick = function () {
    //   iframe.style.display = iframe.style.display === "none" ? "block" : "none";
    // };

    btn.onclick = function () {
      const isVisible = iframe.style.display !== "block";
      iframe.style.display = isVisible ? "block" : "none";

      // Alterna o ícone
      btn.innerHTML = isVisible ? closeIconSVG : chatIconSVG;

      // Envia postMessage para o iframe
      if (isVisible) {
        iframe.contentWindow.postMessage({ type: "chat-opened" }, "*");
      }else{
        iframe.contentWindow.postMessage({ type: "chat-closed" }, "*");
      }
    };
    document.body.appendChild(btn);
    document.body.appendChild(iframe);
  }
};
