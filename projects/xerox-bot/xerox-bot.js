(function () {
  var commandsList = document.getElementById("commands-list");
  if (!commandsList) return;

  var commands = [
    {
      name: "hello",
      description: "Sends hello to the user.",
      details: "<strong>Examples:</strong><br>• /hello - Get a friendly greeting from the bot",
    },
    {
      name: "anime",
      description: "Fetches an image related to an anime from Reddit.",
      details:
        "<strong>Parameters:</strong><br>anime (string, required) — The name of the anime/topic to search for.<br><strong>Examples:</strong><br>• /anime anime:\"Naruto\"<br>• /anime anime:\"One Piece\"",
    },
    {
      name: "logging",
      description: "Configure server logging settings.",
      details:
        "<strong>Parameters:</strong><br>action (string, required) — What to do with logging settings<br>channel (channel, optional) — Channel to send logs to<br><strong>Examples:</strong><br>• /logging channel:#logs<br>• /logging settings",
    },
    {
      name: "playerstats",
      description: "Fetches player stats from Marvel Rivals.",
      details: "<strong>Examples:</strong><br>• /playerstats",
    },
    {
      name: "userinfo",
      description: "Gets information about a member in this server.",
      details:
        "<strong>Parameters:</strong><br>member (user, optional) — Member to look up<br><strong>Examples:</strong><br>• /userinfo<br>• /userinfo member:@user",
    },
    {
      name: "randomnumber",
      description: "Generates a random number between min and max (inclusive).",
      details:
        "<strong>Parameters:</strong><br>min_value (integer, required)<br>max_value (integer, required)<br><strong>Examples:</strong><br>• /randomnumber min_value:1 max_value:100<br>• /randomnumber min_value:0 max_value:1000",
    },
    {
      name: "toggle_canvas_polling",
      description: "Enable or disable Canvas polling.",
      details: "Toggles Canvas polling for notifications.",
    },
    {
      name: "canvas_status",
      description: "View active Canvas notification settings.",
      details: "Shows current Canvas notification configuration.",
    },
    {
      name: "edit_class_notis",
      description: "Configure Canvas class notifications (Admin only).",
      details:
        "<strong>Parameters:</strong><br>action (string, required)<br>channel (channel, optional)<br>Configure class notifications for Canvas.",
    },
    {
      name: "canvas_test",
      description: "Show recent updates and banners for enabled classes.",
      details: "Displays recent Canvas updates/banners for enabled classes.",
    },
    {
      name: "check_canvas_connection",
      description: "Check connection to Canvas API.",
      details: "Verifies Canvas API connectivity.",
    },
    {
      name: "test_canvas_api",
      description: "Test Canvas API connection and fetch recent assignments (Admin only).",
      details: "<strong>Parameters:</strong><br>course_id (string, required)<br>Fetch recent assignments for a course.",
    },
    {
      name: "refresh_tracked_assignments",
      description: "Clear all tracked assignment data to force re-detection of all items (Admin only).",
      details: "Clears tracked assignment cache and re-detects items.",
    },
    {
      name: "view_tracked_assignments",
      description: "View currently tracked assignments and announcements (Admin only).",
      details: "Lists currently tracked assignments/announcements.",
    },
    {
      name: "refresh_canvas_classes",
      description: "Clear and replace all Canvas classes with fresh data from Canvas API (Admin only).",
      details: "Refreshes all Canvas classes from the API.",
    },
    {
      name: "help",
      description: "View bot commands and usage.",
      details:
        "<strong>Parameters:</strong><br>command (string, optional)<br>category (string, optional)<br><strong>Examples:</strong><br>• /help<br>• /help command:\"commandname\"<br>• /help category:\"categoryname\"",
    },
    {
      name: "meme",
      description: "Fetches a random meme from r/memes.",
      details: "<strong>Examples:</strong><br>• /meme",
    },
    {
      name: "remind",
      description: "Set a reminder.",
      details:
        "<strong>Parameters:</strong><br>time (string, required)<br>message (string, required)<br>recurring (boolean, optional)<br>interval (string, optional if recurring)<br><strong>Examples:</strong><br>• /remind time:\"1h30m\" message:\"Check email\"<br>• /remind time:\"tomorrow 8pm\" message:\"Team meeting\"<br>• /remind time:\"1d\" message:\"Daily task\" recurring:True interval:\"1d\"",
    },
    {
      name: "list_reminders",
      description: "List your active reminders.",
      details: "<strong>Examples:</strong><br>• /list_reminders",
    },
    {
      name: "cancel_reminder",
      description: "Cancel one of your reminders.",
      details:
        "<strong>Parameters:</strong><br>reminder_id (string, required)<br><strong>Examples:</strong><br>• /cancel_reminder reminder_id:\"abc123\"",
    },
    {
      name: "schedule_announcement",
      description: "Schedule a server announcement.",
      details:
        "<strong>Parameters:</strong><br>channel (channel, required)<br>time (string, required)<br>message (string, required)<br>recurring (boolean, optional)<br>interval (string, optional if recurring)<br><strong>Examples:</strong><br>• /schedule_announcement channel:#announcements time:\"1h\" message:\"Server maintenance\"<br>• /schedule_announcement channel:#events time:\"tomorrow 3pm\" message:\"Event starting soon\"<br>• /schedule_announcement channel:#reminders time:\"1d\" message:\"Daily reminder\" recurring:True interval:\"1d\"",
    },
    {
      name: "list_announcements",
      description: "List scheduled announcements for this server.",
      details: "<strong>Examples:</strong><br>• /list_announcements",
    },
    {
      name: "cancel_announcement",
      description: "Cancel a scheduled announcement.",
      details:
        "<strong>Parameters:</strong><br>announcement_id (string, required)<br><strong>Examples:</strong><br>• /cancel_announcement announcement_id:\"abc123\"",
    },
    {
      name: "math",
      description: "Perform basic math operations.",
      details:
        "<strong>Parameters:</strong><br>operation (string, required: add/subtract/multiply/divide)<br>num1 (number, required)<br>num2 (number, required)<br><strong>Examples:</strong><br>• /math operation:add num1:5 num2:3<br>• /math operation:multiply num1:4 num2:6<br>• /math operation:divide num1:10 num2:2",
    },
    {
      name: "timezone",
      description: "Convert time between different timezones.",
      details:
        "<strong>Parameters:</strong><br>time (string, required)<br>from_tz (string, required)<br>to_tz (string, required)<br><strong>Examples:</strong><br>• /timezone time:\"2:30 PM\" from:\"EST\" to:\"PST\"<br>• /timezone time:\"14:30\" from:\"UTC\" to:\"JST\"",
    },
    {
      name: "patchnotes",
      description: "Get the link to Marvel Rivals patch notes.",
      details: "<strong>Examples:</strong><br>• /patchnotes",
    },
    {
      name: "valagent",
      description: "Fetches an image related to a Valorant Agent from Reddit.",
      details:
        "<strong>Parameters:</strong><br>agent (string, required)<br><strong>Examples:</strong><br>• /valagent agent:\"Jett\"<br>• /valagent agent:\"Sage\"",
    },
    {
      name: "spotifyinfo",
      description: "Get detailed information about a song from Spotify.",
      details: "<strong>Parameters:</strong><br>song (string, required)<br><strong>Examples:</strong><br>• /spotifyinfo song:\"song name\"",
    },
    {
      name: "aiart",
      description: "Generate AI artwork from a prompt.",
      details:
        "<strong>Parameters:</strong><br>prompt (string, required)<br>style (string, optional)<br><strong>Examples:</strong><br>• /aiart prompt:\"your prompt\"<br>• /aiart prompt:\"your prompt\" style:\"anime\"",
    },
    {
      name: "play",
      description: "Search and play a song from Spotify.",
      details: "<strong>Parameters:</strong><br>song (string, required)<br><strong>Examples:</strong><br>• /play song:\"song name\"",
    },
    {
      name: "stop",
      description: "Stop the current playback and disconnect from voice channel.",
      details: "<strong>Examples:</strong><br>• /stop",
    },
  ];

  commandsList.innerHTML = commands
    .map(function (cmd, idx) {
      return (
        '\n      <div class="command-category command-card" data-command-index="' +
        idx +
        '">\n        <div class="command-card-header" style="display:flex;justify-content:space-between;align-items:center;gap:12px;">\n          <h3 style="margin:0;">/' +
        cmd.name +
        '</h3>\n          <span class="mini-pill">Click to expand</span>\n        </div>\n        <p style="margin:10px 0 0;">' +
        cmd.description +
        '</p>\n        <div class="command-options">\n          <p style="margin:0 0 8px 0;">' +
        cmd.details +
        "</p>\n        </div>\n      </div>\n    "
      );
    })
    .join("");

  document.querySelectorAll(".command-card").forEach(function (card) {
    card.addEventListener("click", function () {
      card.classList.toggle("expanded");
    });
  });
})();
