(function () {
  var config = window.aiChatConfig || {};
  var decode = function (value) {
    return typeof atob === "function" ? atob(value) : value;
  };
  var defaultEndpoint = decode(
    "aHR0cHM6Ly9uOG4uYWl6ZW5rYWktaHViLmNvbS93ZWJob29rL1dlYi1haS1DaGF0"
  );
  var defaultStatsEndpoint = decode(
    "aHR0cHM6Ly93ZWJob29rcy52ZWlsYm9ybi1odWIuY29tL2JvdC1zdGF0cz9wYXNzd29yZD1UZXN0UGFzc3dvcmQxMjM0NQ=="
  );
  var aiChat = {
    endpoint: config.endpoint || defaultEndpoint,
    statsEndpoint: config.statsEndpoint || defaultStatsEndpoint,
    corsProxy: config.corsProxy || "",
    sessionId:
      localStorage.getItem("aiChatSession") ||
      "web-" + Math.random().toString(36).slice(2),
  };
  localStorage.setItem("aiChatSession", aiChat.sessionId);

  var chatBubble = document.getElementById("aiChatBubble");
  var chatPanel = document.getElementById("aiChatPanel");
  var chatMessages = document.getElementById("aiChatMessages");
  var chatInput = document.getElementById("aiChatInput");
  var chatSend = document.getElementById("aiChatSend");
  var chatAvatar = document.getElementById("aiChatAvatar");
  var chatBotName = document.getElementById("aiChatBotName");

  function toggleChat(open) {
    if (!chatPanel) return;
    var willOpen =
      open === undefined ? !chatPanel.classList.contains("open") : open;
    if (willOpen) {
      chatPanel.classList.add("open");
      chatInput?.focus();
    } else {
      chatPanel.classList.remove("open");
    }
  }

  chatBubble?.addEventListener("click", () => toggleChat());

  function appendMessage(text, type = "ai", images) {
    if (!chatMessages) return;
    var node = document.createElement("div");
    node.className = `ai-chat-msg ${type}`;
    node.textContent = text;

    if (images && images.length) {
      var list = document.createElement("div");
      list.style.display = "flex";
      list.style.flexWrap = "wrap";
      list.style.gap = "8px";
      list.style.marginTop = "8px";
      images.forEach(function (src) {
        var img = document.createElement("img");
        img.src = src;
        img.style.maxWidth = "220px";
        img.style.borderRadius = "8px";
        img.style.border = "1px solid rgba(255,255,255,0.08)";
        list.appendChild(img);
      });
      node.appendChild(list);
    }

    chatMessages.appendChild(node);
    chatMessages.scrollTop = chatMessages.scrollHeight;
  }

  function showTypingIndicator() {
    if (!chatMessages) return { remove: function () {} };
    var node = document.createElement("div");
    node.className = "ai-chat-msg system";
    var dots = document.createElement("span");
    dots.textContent = ".";
    node.appendChild(dots);
    chatMessages.appendChild(node);
    chatMessages.scrollTop = chatMessages.scrollHeight;

    var frame = 1;
    var interval = setInterval(function () {
      frame = (frame % 3) + 1;
      dots.textContent = ".".repeat(frame);
    }, 400);

    return {
      remove: function () {
        clearInterval(interval);
        node.remove();
      },
    };
  }

  async function fetchWithProxy(url) {
    try {
      return await axios.get(url, { headers: { Accept: "application/json" } });
    } catch (err) {
      if (!aiChat.corsProxy) {
        throw err;
      }
      return axios.get(aiChat.corsProxy + encodeURIComponent(url), {
        headers: { Accept: "application/json" },
      });
    }
  }

  async function hydrateBotMeta() {
    if (!aiChat.statsEndpoint) return;
    try {
      var { data } = await fetchWithProxy(aiChat.statsEndpoint);
      if (data?.info) {
        if (data.info.avatar && chatAvatar) {
          chatAvatar.src = data.info.avatar;
          chatAvatar.alt = `${data.info.name || "Bot"} avatar`;
        }
        if (data.info.name && chatBotName) {
          chatBotName.textContent = data.info.name;
        }
      }
    } catch (err) {
      console.warn("Bot stats fetch failed; using fallback avatar.", err);
    }
  }
  hydrateBotMeta();

  async function sendChat() {
    if (!chatInput || !chatSend) return;
    var prompt = chatInput.value.trim();
    if (!prompt) return;

    appendMessage(prompt, "user");
    chatInput.value = "";
    chatSend.disabled = true;
    var typing = showTypingIndicator();
    var timeoutId = setTimeout(function () {
      typing.remove();
      var name = chatBotName?.textContent || "AI";
      appendMessage(name + " is taking a while to respond.", "system");
    }, 20000);

    try {
      var { data } = await axios.post(
        aiChat.endpoint,
        {
          prompt: prompt,
          sessionId: aiChat.sessionId,
          username: "Website Visitor",
        },
        {
          headers: {
            "Content-Type": "application/json",
          },
        }
      );

      if (data?.reply) {
        clearTimeout(timeoutId);
        typing.remove();
        appendMessage(data.reply, "ai", data.images);
      } else if (data?.output) {
        clearTimeout(timeoutId);
        typing.remove();
        appendMessage(String(data.output), "ai");
      } else {
        clearTimeout(timeoutId);
        typing.remove();
        appendMessage("No reply this time.", "system");
      }
    } catch (err) {
      console.error("AI chat error:", err);
      clearTimeout(timeoutId);
      typing.remove();
      appendMessage("Error contacting AI. Please try again.", "system");
    } finally {
      chatSend.disabled = false;
      chatInput.focus();
    }
  }

  chatSend?.addEventListener("click", sendChat);
  chatInput?.addEventListener("keydown", (e) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      sendChat();
    }
  });
})();
