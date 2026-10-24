(function () {
  "use strict";

  var clock = document.getElementById("welcome-heading");
  var date = document.getElementById("date");
  var year = document.getElementById("year");
  var canvas = document.getElementById("signal-canvas");
  var context = canvas && canvas.getContext("2d");
  var reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)");
  var animationFrame;
  var phase = 0;
  var resizeObserver;

  function updateClock() {
    var now = new Date();
    clock.textContent = new Intl.DateTimeFormat(undefined, {
      hour: "2-digit",
      minute: "2-digit",
      hour12: false
    }).format(now);
    date.textContent = new Intl.DateTimeFormat(undefined, {
      weekday: "long",
      month: "short",
      day: "numeric",
      year: "numeric"
    }).format(now);
    year.textContent = now.getFullYear();
  }

  function resizeCanvas() {
    if (!context) return;
    var scale = Math.min(window.devicePixelRatio || 1, 2);
    var bounds = canvas.getBoundingClientRect();
    canvas.width = Math.max(1, Math.floor(bounds.width * scale));
    canvas.height = Math.max(1, Math.floor(bounds.height * scale));
    context.setTransform(scale, 0, 0, scale, 0, 0);
    drawSignal();
  }

  function drawSignal() {
    if (!context) return;
    var bounds = canvas.getBoundingClientRect();
    var width = bounds.width;
    var height = bounds.height;
    context.clearRect(0, 0, width, height);
    context.beginPath();
    context.lineWidth = 1;
    context.strokeStyle = "rgba(183, 255, 98, 0.58)";

    for (var x = 0; x <= width; x += 3) {
      var progress = x / Math.max(width, 1);
      var wave = Math.sin(progress * 8.5 + phase) * height * 0.035;
      var drift = Math.sin(progress * 2.2 + phase * 0.4) * height * 0.11;
      var rise = Math.pow(progress, 1.6) * height * 0.2;
      var y = height * 0.57 - drift - rise - wave;
      if (x === 0) context.moveTo(x, y);
      else context.lineTo(x, y);
    }
    context.stroke();
  }

  function animate() {
    if (document.hidden || reducedMotion.matches) return;
    phase += 0.006;
    drawSignal();
    animationFrame = window.requestAnimationFrame(animate);
  }

  function stopAnimation() {
    if (animationFrame) window.cancelAnimationFrame(animationFrame);
    animationFrame = null;
  }

  function startAnimation() {
    stopAnimation();
    drawSignal();
    if (!reducedMotion.matches && !document.hidden) animationFrame = window.requestAnimationFrame(animate);
  }

  updateClock();
  window.setInterval(updateClock, 1000);

  if (context) {
    resizeObserver = new ResizeObserver(resizeCanvas);
    resizeObserver.observe(canvas);
    document.addEventListener("visibilitychange", startAnimation);
    reducedMotion.addEventListener("change", startAnimation);
    startAnimation();
  }
}());