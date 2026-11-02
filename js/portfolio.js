(function () {
    "use strict";

    const yearElement = document.getElementById("year");
    if (yearElement) {
    yearElement.textContent = new Date().getFullYear();
    }
    

  const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;


// Theme switch

  const root = document.documentElement;
  const themeButton = document.getElementById("theme-toggle");
  const THEME_KEY = "nija-theme";

  function setTheme(theme) {
    const isDark = theme === "dark";
    root.setAttribute("data-theme", theme);
    themeButton.textContent = isDark ? "☀️" : "🌙";
    themeButton.setAttribute("aria-label", isDark ? "Switch to light mode" : "Switch to dark mode");

    try {
      localStorage.setItem(THEME_KEY, theme);
    } catch (error) {
    }
  }

  function getSavedTheme() {
    try {
      return localStorage.getItem(THEME_KEY) || "light";
    } catch (error) {
      return "light";
    }
  }

  setTheme(getSavedTheme());

  themeButton.addEventListener("click", function () {
    const nextTheme = root.getAttribute("data-theme") === "dark" ? "light" : "dark";
    setTheme(nextTheme);
  });


// Mobile menu 

  const menu = document.getElementById("nav-menu");
  const menuButton = document.getElementById("menu-toggle");

  function setMenu(isOpen) {
    menu.classList.toggle("is-open", isOpen);
    menuButton.setAttribute("aria-expanded", String(isOpen));
    menuButton.setAttribute("aria-label", isOpen ? "Close menu" : "Open menu");
  }

  menuButton.addEventListener("click", function () {
    setMenu(!menu.classList.contains("is-open"));
  });

  // Close the menu after a link is tapped
  menu.addEventListener("click", function (event) {
    if (event.target.tagName === "A") {
      setMenu(false);
    }
  });


// Profile photo

  const photo = document.querySelector(".hero__avatar img");

  if (photo) {
    const removePhoto = function () {
      photo.remove();
    };

    if (photo.complete && photo.naturalWidth === 0) {
      removePhoto();
    } else {
      photo.addEventListener("error", removePhoto);
    }
  }


// Bug hunt game

  const bugs = document.querySelectorAll(".bug");
  const bugCounter = document.getElementById("bug-counter");
  const bugCountText = document.getElementById("bug-count");
  const toast = document.getElementById("toast");
  let bugsFound = 0;
  let toastTimer;

  const BUG_ICON = `
    <svg viewBox="0 0 32 32" aria-hidden="true">
      <g stroke="#0F3D3E" stroke-width="1.6" stroke-linecap="round">
        <path d="M9 12 4 9M9 17H3M9 22l-5 3M23 12l5-3M23 17h6M23 22l5 3M13 6l-2-3M19 6l2-3" />
      </g>
      <circle cx="16" cy="9" r="4" fill="#0F3D3E" />
      <ellipse cx="16" cy="18.5" rx="8" ry="9.5" fill="#E8553F" stroke="#0F3D3E" stroke-width="1.6" />
      <path d="M16 9v19" stroke="#0F3D3E" stroke-width="1.6" />
      <circle cx="12.5" cy="16" r="1.6" fill="#0F3D3E" />
      <circle cx="19.5" cy="16" r="1.6" fill="#0F3D3E" />
      <circle cx="12.8" cy="22" r="1.4" fill="#0F3D3E" />
      <circle cx="19.2" cy="22" r="1.4" fill="#0F3D3E" />
    </svg>`;

  const BUG_MESSAGES = [
    "Severity: Low. Bug was napping behind the hero. Logged and fixed.",
    "Steps to reproduce: scroll to About, look closely. Fixed.",
    "Expected: skills only. Actual: one ladybug. Fixed.",
    "Bug found crawling near the project tickets. Moved to Done.",
    "Last one, hiding by the contact ticket. Closed."
  ];

  function showToast(html) {
    toast.innerHTML = html;
    toast.classList.add("is-visible");
    clearTimeout(toastTimer);
    toastTimer = setTimeout(function () {
      toast.classList.remove("is-visible");
    }, 3400);
  }

  function onBugFound(bug, index) {
    if (bug.classList.contains("is-found")) {
      return;
    }

    bug.classList.add("is-found");
    bug.setAttribute("aria-label", "Bug fixed");
    bugsFound += 1;

    if (bugsFound === bugs.length) {
      bugCountText.textContent = "All bugs squashed ✓";
      bugCounter.classList.add("is-complete");
      showToast("<strong>All 5 bugs found.</strong> Great eye for detail. Now let’s talk about your app.");
    } else {
      bugCountText.textContent = `Bugs found: ${bugsFound}/${bugs.length}`;
      showToast(`<strong>Bug #${bugsFound}</strong> ${BUG_MESSAGES[index]}`);
    }
  }

  bugs.forEach(function (bug, index) {
    bug.innerHTML = BUG_ICON;
    bug.addEventListener("click", function () {
      onBugFound(bug, index);
    });
  });


// Interactive terminal

  const terminal = document.querySelector(".terminal");
  const screen = document.getElementById("terminal-screen");
  const output = document.getElementById("terminal-output");
  const form = document.getElementById("terminal-form");
  const input = document.getElementById("terminal-input");

  const EMAIL_LINK = '<a href="mailto:nijamaharjan13@gmail.com">nijamaharjan13@gmail.com</a>';

  // Small helpers to color terminal text
  const dim = (text) => `<span class="t-dim">${text}</span>`;
  const pass = (text) => `<span class="t-pass">${text}</span>`;
  const warn = (text) => `<span class="t-warn">${text}</span>`;
  const strong = (text) => `<span class="t-strong">${text}</span>`;

  let runId = 0;              // Lets a new command stop the one still printing
  const history = [];         // Previous commands, for the arrow keys
  let historyIndex = 0;

  function escapeHtml(text) {
    return String(text).replace(/[&<>"]/g, function (char) {
      return { "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" }[char];
    });
  }

  function printLine(html) {
    const line = document.createElement("p");
    line.innerHTML = html || " ";
    output.appendChild(line);
    screen.scrollTop = screen.scrollHeight;
    return line;
  }

  // Prints lines one after another.
  function printLines(lines, id, onDone) {
    let index = 0;

    function next() {
      if (id !== runId) return;              //new command starts
      if (index >= lines.length) {
        if (onDone) onDone();
        return;
      }

      const [html, delay] = lines[index];
      index += 1;
      printLine(html);

      if (reduceMotion) {
        next();
      } else {
        setTimeout(next, delay || 0);
      }
    }

    next();
  }

  function skillTestLines() {
    return [
      [dim("$") + " pytest tests/test_nija.py -v", 400],
      [dim("collected 6 items"), 300],
      ["", 100],
      ["test_manual_testing ............ " + pass("PASSED"), 220],
      ["test_selenium_python ........... " + pass("PASSED"), 220],
      ["test_appium_mobile ............. " + pass("PASSED"), 220],
      ["test_jira_defect_lifecycle ..... " + pass("PASSED"), 220],
      ["test_scrum_master_duties ....... " + pass("PASSED"), 220],
      ["test_stops_at_one_bug .......... " + warn("XFAIL"), 220],
      [dim("  reason: always finds one more"), 350],
      ["", 100],
      [strong("===== 5 passed, 1 xfailed in 1+ years ====="), 0]
    ];
  }

  function launchConfetti() {
    if (reduceMotion) return;

    const colors = ["#FF6F59", "#43D9AD", "#FFD166", "#0F3D3E", "#5CC8D7"];

    for (let i = 0; i < 44; i += 1) {
      const piece = document.createElement("span");
      piece.className = "confetti";
      piece.style.background = colors[i % colors.length];
      piece.style.setProperty("--dx", Math.round(Math.random() * 420 - 210) + "px");
      piece.style.setProperty("--dy", Math.round(Math.random() * 300 - 200) + "px");
      piece.style.setProperty("--rot", Math.round(Math.random() * 720 - 360) + "deg");
      terminal.appendChild(piece);
      setTimeout(function () {
        piece.remove();
      }, 1500);
    }
  }

  const commands = {
    "help": function (id) {
      printLines([
        [dim("Available commands:"), 0],
        ["  whoami          who is Nija?", 0],
        ["  run skills      run the skill test suite", 0],
        ["  show projects   list closed project tickets", 0],
        ["  find bugs       scan this page for bugs", 0],
        ["  hire nija       deploy Nija to your team", 0],
        ["  contact         ways to reach me", 0],
        ["  clear           clear the screen", 0],
        [dim("  psst… a few secret commands are hiding too."), 0]
      ], id);
    },

    "whoami": function (id) {
      printLines([
        [strong("Nija Maharjan"), 200],
        ["Associate QA Engineer and Scrum Master at PiTech Limited", 200],
        ["Based in Kathmandu, Nepal", 200],
        ["1+ years of breaking things on purpose, so your users never do", 200],
        [dim("Daily tools: Selenium (Python), Appium, JIRA, DBeaver"), 0]
      ], id);
    },

    "run skills": function (id) {
      printLines(skillTestLines(), id);
    },

    "show projects": function (id) {
      printLines([
        [dim("$ jira list --assignee nija --status done"), 350],
        ["NIJA-101  Room Rental Mobile App ....... " + pass("DONE"), 220],
        ["NIJA-102  Stock Market Prediction ...... " + pass("DONE"), 220],
        ["NIJA-103  Database Design .............. " + pass("DONE"), 220],
        [dim("3 tickets closed. ") + '<a href="#projects">See the details</a>', 0]
      ], id);
    },

    "find bugs": function (id) {
      const bugsLeft = bugs.length - bugsFound;
      const result = bugsLeft > 0
        ? [
            [warn(`⚠ ${bugsLeft} bug${bugsLeft > 1 ? "s" : ""} still hiding on this page.`), 250],
            ["Scroll around and tap them to log them.", 0]
          ]
        : [
            [pass("✓ All bugs squashed. Clean build!"), 250],
            ['You’ve got a sharp QA eye. <a href="#contact">Let’s talk</a>', 0]
          ];

      printLines([
        ["Scanning page for bugs…", 600],
        [pass("[██████████] 100%"), 300]
      ].concat(result), id);
    },

    "hire nija": function (id) {
      printLine("Deploying Nija to your team…");
      const progressLine = printLine("");
      let percent = 0;

      function drawProgress() {
        const filled = Math.round(percent / 10);
        progressLine.innerHTML = pass("[" + "█".repeat(filled) + "░".repeat(10 - filled) + "] " + percent + "%");
        screen.scrollTop = screen.scrollHeight;
      }

      function finish() {
        launchConfetti();
        printLines([
          [pass("✓ Deploy complete"), 300],
          ["  Test coverage .......... going up", 220],
          ["  Bugs in production ..... going down", 220],
          ["  Release confidence ..... high", 350],
          ["Next step: say hi at " + EMAIL_LINK, 0]
        ], id);
      }

      if (reduceMotion) {
        percent = 100;
        drawProgress();
        finish();
        return;
      }

      drawProgress();
      const timer = setInterval(function () {
        if (id !== runId) {
          clearInterval(timer);
          return;
        }
        percent += 10;
        drawProgress();
        if (percent >= 100) {
          clearInterval(timer);
          finish();
        }
      }, 150);
    },

    "contact": function (id) {
      printLines([
        ["Email     " + EMAIL_LINK, 150],
        ['LinkedIn  <a href="https://www.linkedin.com/in/nija-maharjan-b0641a356" target="_blank" rel="noopener">nija-maharjan</a>', 150],
        ['GitHub    <a href="https://github.com/nija616" target="_blank" rel="noopener">nija616</a>', 0]
      ], id);
    },

    // Secret commands
    "coffee": function (id) {
      printLines([
        [warn("Error 418: I’m a teapot."), 300],
        ["Try " + strong("chiya") + " instead.", 0]
      ], id);
    },

    "chiya": function (id) {
      printLines([
        ["☕ Brewing chiya…", 700],
        [pass("✓ Done. Bug-finding speed +200%"), 0]
      ], id);
    },

    "sudo hire nija": function (id) {
      printLines([
        [pass("Permission granted. You clearly know what you’re doing."), 400]
      ], id, function () {
        commands["hire nija"](id);
      });
    },

    "rm -rf bugs": function (id) {
      printLines([
        [warn("Nice try. Bugs don’t delete themselves."), 300],
        ["That’s why teams hire QA engineers.", 0]
      ], id);
    }
  };

  // Other words visitors might type for the same command
  const aliases = {
    "pytest": "run skills",
    "run tests": "run skills",
    "skills": "run skills",
    "projects": "show projects",
    "ls": "show projects",
    "hire": "hire nija",
    "bugs": "find bugs",
    "?": "help",
    "tea": "chiya",
    "cls": "clear"
  };

  function runCommand(rawText) {
    const typed = String(rawText).trim();
    let command = typed.toLowerCase().replace(/\s+/g, " ");
    if (!command) return;

    runId += 1;
    const id = runId;

    history.push(typed);
    historyIndex = history.length;

    command = aliases[command] || command;

    if (command === "clear") {
      output.innerHTML = "";
      return;
    }

    printLine(dim("$") + " " + escapeHtml(typed));

    if (commands[command]) {
      commands[command](id);
    } else {
      printLines([
        [warn("command not found: " + escapeHtml(typed)), 150],
        [dim("That bug is in the input, not my code. Type help to see what works."), 0]
      ], id);
    }
  }

  form.addEventListener("submit", function (event) {
    event.preventDefault();
    runCommand(input.value);
    input.value = "";
  });

  // Arrow up/down to reuse previous commands
  input.addEventListener("keydown", function (event) {
    if (!history.length) return;

    if (event.key === "ArrowUp") {
      event.preventDefault();
      historyIndex = Math.max(0, historyIndex - 1);
      input.value = history[historyIndex];
    } else if (event.key === "ArrowDown") {
      event.preventDefault();
      historyIndex = Math.min(history.length, historyIndex + 1);
      input.value = history[historyIndex] || "";
    }
  });

  document.querySelectorAll(".terminal__commands button").forEach(function (button) {
    button.addEventListener("click", function () {
      runCommand(button.dataset.command);
    });
  });

  // Clicking empty space in the terminal focuses the input
  screen.addEventListener("click", function (event) {
    if (event.target === screen || event.target.tagName === "P") {
      input.focus({ preventScroll: true });
    }
  });

  // Intro animation when the page loads
  runId += 1;
  printLines([
    [strong("Welcome to Nija’s QA terminal"), 300],
    [dim("Tap a command below or type your own. Try hire nija."), 500],
    ["", 100]
  ].concat(skillTestLines()), runId);
})();