// Click-to-enlarge for the dimension drawings. Inlined into family pages by build-product-pages.js.
// One native <dialog>: Esc closes, focus is trapped and restored by the browser. No dependencies.
(function () {
  var grid = document.querySelector('.dim-grid');
  var dlg = document.querySelector('.dim-lightbox');
  if (!grid || !dlg || typeof dlg.showModal !== 'function') return;
  var big = dlg.querySelector('img');
  var cap = dlg.querySelector('.dim-lb-cap');
  var figs = Array.prototype.slice.call(grid.querySelectorAll('figure'));
  var cur = 0;

  function show(i) {
    cur = (i + figs.length) % figs.length;
    var f = figs[cur];
    var img = f.querySelector('img');
    big.src = img.currentSrc || img.src;
    big.alt = img.alt;
    cap.textContent = f.querySelector('figcaption').textContent;
  }
  function open(i) {
    show(i);
    if (!dlg.open) dlg.showModal();
  }

  figs.forEach(function (f, i) {
    f.querySelector('.dim-open').addEventListener('click', function () { open(i); });
  });
  dlg.querySelector('.dim-lb-close').addEventListener('click', function () { dlg.close(); });
  dlg.querySelector('.dim-lb-prev').addEventListener('click', function () { show(cur - 1); });
  dlg.querySelector('.dim-lb-next').addEventListener('click', function () { show(cur + 1); });
  // Click on the backdrop (the dialog element itself, outside its content box) closes.
  dlg.addEventListener('click', function (e) { if (e.target === dlg) dlg.close(); });
  dlg.addEventListener('keydown', function (e) {
    if (e.key === 'ArrowLeft') show(cur - 1);
    else if (e.key === 'ArrowRight') show(cur + 1);
  });
  dlg.addEventListener('close', function () { big.removeAttribute('src'); });
})();
