(function () {
  var endpoint = "https://webhooks.veilborn-hub.com/bot-stats?password=TestPassword12345";
  var corsProxy = "https://corsproxy.io/?";

  var statusPill = document.getElementById("status-pill");
  var botName = document.getElementById("bot-name");
  var botDescription = document.getElementById("bot-description");
  var botId = document.getElementById("bot-id");
  var overviewText = document.getElementById("overview-text");
  var presenceText = document.getElementById("presence-text");
  var uptimeText = document.getElementById("uptime-text");
  var memoryText = document.getElementById("memory-text");
  var botAvatar = document.getElementById("bot-avatar");
  var serverCount = document.getElementById("server-count");
  var ticketCount = document.getElementById("ticket-count");
  var openTickets = document.getElementById("open-tickets");
  var commandCount = document.getElementById("command-count");
  var eventCount = document.getElementById("event-count");
  var extraCount = document.getElementById("extra-count");
  var commandsList = document.getElementById("commands-list");
  var serversList = document.getElementById("servers-list");
  var loadersList = document.getElementById("loaders-list");
  var eventsList = document.getElementById("events-list");
  var extrasList = document.getElementById("extras-list");

  var renderStatus = function (status) {
    statusPill.textContent = status ? status.toUpperCase() : "Unknown";
    statusPill.style.background = status === "online" ? "var(--success-color)" : "var(--warning-color)";
  };

  var describeOptions = function (options) {
    options = options || [];
    return options
      .map(function (opt) {
        var children =
          opt.options && opt.options.length
            ? "<ul>" + describeOptions(opt.options) + "</ul>"
            : "";
        return (
          "<li><strong>" +
          opt.name +
          "</strong> — " +
          (opt.description || "No description.") +
          ' <span class="mini-pill">Type ' +
          opt.type +
          "</span> " +
          (opt.required ? '<span class="mini-pill">Required</span>' : "") +
          " " +
          children +
          "</li>"
        );
      })
      .join("");
  };

  var renderCommands = function (commands) {
    commands = commands || [];
    if (!commands.length) {
      commandsList.innerHTML = "<p>No commands reported.</p>";
      return;
    }

    var topCommands = commands.slice(0, 12);
    commandsList.innerHTML = topCommands
      .map(function (cmd, idx) {
        return (
          '\n            <div class="command-category command-card" data-command-index="' +
          idx +
          '">\n              <div class="command-card-header" style="display:flex;justify-content:space-between;align-items:center;gap:12px;">\n                <h3 style="margin:0;">' +
          cmd.name +
          '</h3>\n                <span class="mini-pill">' +
          (cmd.options && cmd.options.length ? cmd.options.length : 0) +
          ' options</span>\n              </div>\n              <p style="margin:10px 0 0;">' +
          (cmd.description || "No description provided.") +
          '</p>\n              <div class="command-options">\n                <ul>\n                  ' +
          (describeOptions(cmd.options || []) || "<li>No options</li>") +
          "\n                </ul>\n              </div>\n            </div>\n          "
        );
      })
      .join("");

    document.querySelectorAll(".command-card").forEach(function (card) {
      card.addEventListener("click", function () {
        card.classList.toggle("expanded");
      });
    });
  };

  var renderServers = function (servers) {
    servers = servers || [];
    if (!servers.length) {
      serversList.innerHTML = "<p>No servers reported.</p>";
      return;
    }

    serversList.innerHTML = servers
      .map(function (srv) {
        return (
          '\n            <div class="command-category">\n              <h3>' +
          srv.name +
          '</h3>\n              <ul>\n                <li><strong>ID:</strong> ' +
          srv.id +
          "</li>\n                <li><strong>Members:</strong> " +
          srv.memberCount +
          "</li>\n              </ul>\n            </div>\n          "
        );
      })
      .join("");
  };

  var renderLoaders = function (loaders) {
    loaders = loaders || [];
    if (!loaders.length) {
      loadersList.innerHTML = "<p>No loaders reported.</p>";
      return;
    }

    loadersList.innerHTML = loaders
      .map(function (loader) {
        var name = loader && loader.name ? loader.name : loader;
        var description =
          loader && loader.description ? loader.description : "Bootstrap module active";
        return (
          '\n            <div class="command-category">\n              <h3>' +
          name +
          "</h3>\n              <ul>\n                <li>" +
          description +
          "</li>\n              </ul>\n            </div>\n          "
        );
      })
      .join("");
  };

  var renderEvents = function (events) {
    events = events || [];
    if (!events.length) {
      eventsList.innerHTML = "<p>No events reported.</p>";
      return;
    }

    eventsList.innerHTML = events
      .map(function (ev) {
        var name = ev && ev.name ? ev.name : ev;
        var description =
          ev && ev.description ? ev.description : "Active gateway event listener";
        return (
          '\n            <div class="command-category">\n              <h3>' +
          name +
          "</h3>\n              <ul>\n                <li>" +
          description +
          "</li>\n              </ul>\n            </div>\n          "
        );
      })
      .join("");
  };

  var renderExtras = function (extras) {
    extras = extras || [];
    if (!extras.length) {
      extrasList.innerHTML = "<p>No extras reported.</p>";
      return;
    }

    extrasList.innerHTML = extras
      .map(function (ex) {
        var name = ex && ex.name ? ex.name : ex;
        var description =
          ex && ex.description ? ex.description : "Additional module loaded";
        return (
          '\n            <div class="command-category">\n              <h3>' +
          name +
          "</h3>\n              <ul>\n                <li>" +
          description +
          "</li>\n              </ul>\n            </div>\n          "
        );
      })
      .join("");
  };

  var hydrate = function (data) {
    if (!data) {
      return;
    }
    var info = data.info || {};
    var status = data.status || "unknown";
    var servers = data.servers || [];
    var commands = data.commands || [];
    var events = data.events || [];
    var extras = data.extra || [];
    var loaders = data.loaders || [];
    var ticketStats = data.ticketStats || {};
    var memory = data.memoryUsage || {};

    botName.textContent = info.name || "JavaScript Bot";
    botDescription.textContent =
      info.description || "Self-hosted Discord automation built with JavaScript.";
    overviewText.textContent = info.description || overviewText.textContent;
    botId.textContent =
      "ID: " +
      (info.id || "N/A") +
      " | Created: " +
      (info.createdAt ? new Date(info.createdAt).toDateString() : "N/A");

    var hero = document.querySelector(".project-hero");
    if (info.banner) {
      hero.style.backgroundImage =
        "linear-gradient(rgba(5,7,13,0.7), rgba(5,7,13,0.7)), url('" + info.banner + "')";
    } else if (info.avatar) {
      hero.style.backgroundImage =
        "linear-gradient(rgba(5,7,13,0.7), rgba(5,7,13,0.7)), url('" + info.avatar + "')";
    }
    if (info.avatar) {
      botAvatar.src = info.avatar;
      botAvatar.alt = (info.name || "Bot") + " avatar";
    }

    renderStatus(status);
    presenceText.textContent = status;
    uptimeText.textContent = data.uptime || "Live";
    memoryText.textContent =
      memory.heapUsed && memory.rss
        ? memory.heapUsed + " heap | " + memory.rss + " rss"
        : "Live";

    serverCount.textContent = servers.length;
    ticketCount.textContent = ticketStats.guildSettings ?? 0;
    openTickets.textContent =
      (ticketStats.openTickets ?? 0) + " / " + (ticketStats.closedTickets ?? 0);

    commandCount.textContent = commands.length;
    eventCount.textContent = events.length;
    extraCount.textContent = extras.length;

    renderCommands(commands);
    renderServers(servers);
    renderLoaders(loaders);
    renderEvents(events);
    renderExtras(extras);
  };

  var storageKey = "jsbot:bot-stats-cache";
  var saveCache = function (data) {
    try {
      localStorage.setItem(
        storageKey,
        JSON.stringify({ data: data, cachedAt: new Date().toISOString() })
      );
    } catch (e) {
      // Ignore cache failures (private mode, storage limits).
    }
  };

  var loadCache = function () {
    try {
      var raw = localStorage.getItem(storageKey);
      if (!raw) return null;
      return JSON.parse(raw);
    } catch (e) {
      return null;
    }
  };

  var applyOfflineFallback = function () {
    var cached = loadCache();
    if (cached && cached.data) {
      var fallback = Object.assign({}, cached.data, {
        status: "offline"
      });
      hydrate(fallback);
      return;
    }
    renderStatus("offline");
  };

  var showFailure = function (msg) {
    statusPill.textContent = "Bot offline";
    statusPill.style.background = "var(--warning-color)";
    var failure =
      '\n          <div class="command-category">\n            <h3>Could not load live data</h3>\n            <ul>\n              <li>' +
      msg +
      "</li>\n            </ul>\n          </div>";
    commandsList.innerHTML = failure;
    serversList.innerHTML = failure;
  };

  var loadData = function (url, attempt) {
    if (attempt === void 0) {
      attempt = "direct";
    }
    return axios
      .get(url, { headers: { Accept: "application/json" } })
      .then(function (_ref) {
        var data = _ref.data;
        hydrate(data);
        saveCache(data);
        return;
      })
      .catch(function (err) {
        if (attempt === "direct") {
          return loadData(corsProxy + encodeURIComponent(url), "proxied");
        }
        applyOfflineFallback();
        showFailure(
          "Live data unavailable. Showing cached stats when possible. Please refresh to retry."
        );
        console.error("Live data load failed:", err);
      });
  };

  var cached = loadCache();
  if (cached && cached.data) {
    hydrate(cached.data);
  }
  loadData(endpoint);
})();


