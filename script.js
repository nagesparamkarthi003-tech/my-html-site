var WHATSAPP_NUMBER = "0763452943";
var ALLOWED_DELIVERY = ["Vavuniya Town", "Pandarikulam", "Omanthai", "Nedunkeni", "Cheddikulam"];
var DELIVERY_TIME_TEXT = "2-3 days";
var COMPANY_NAME = "NGGK";
var COMPANY_ADDRESS = "Sivanagar, Nedunkeny, Vavuniya";

var PRODUCTS = [
  { id: "p1", name: "Hair Oil - 100ml", price: 650, currency: "LKR", description: "High-quality herbal hair oil in a 100ml bottle for stronger, healthier, and shinier hair.", image: "https://images.unsplash.com/photo-1608248597279-f99d160bfcbc?auto=format&fit=crop&w=1200&q=70", featured: true },
  { id: "p2", name: "Hair Oil - 250ml", price: 1200, currency: "LKR", description: "High-quality herbal hair oil in a 250ml bottle for stronger, healthier, and shinier hair.", image: "https://images.unsplash.com/photo-1608248597279-f99d160bfcbc?auto=format&fit=crop&w=1200&q=70", featured: true },
  { id: "p3", name: "Hair Oil - 500ml", price: 2300, currency: "LKR", description: "High-quality herbal hair oil in a 500ml bottle for stronger, healthier, and shinier hair.", image: "https://images.unsplash.com/photo-1608248597279-f99d160bfcbc?auto=format&fit=crop&w=1200&q=70", featured: true },
  { id: "p4", name: "Hair Oil - 1 Liter", price: 4300, currency: "LKR", description: "High-quality herbal hair oil in a 1 liter bottle for stronger, healthier, and shinier hair.", image: "https://images.unsplash.com/photo-1608248597279-f99d160bfcbc?auto=format&fit=crop&w=1200&q=70", featured: true },
  { id: "p5", name: "Roasted Salted Peanuts - 250g", price: 650, currency: "LKR", description: "Crunchy roasted salted peanuts in a 250g pack.", image: "https://images.unsplash.com/photo-1599490659213-e2b9527bd087?auto=format&fit=crop&w=1200&q=70", featured: true },
  { id: "p6", name: "Roasted Salted Peanuts - 500g", price: 1200, currency: "LKR", description: "Crunchy roasted salted peanuts in a 500g pack.", image: "https://images.unsplash.com/photo-1599490659213-e2b9527bd087?auto=format&fit=crop&w=1200&q=70", featured: true },
  { id: "p7", name: "Roasted Salted Peanuts - 1kg", price: 2300, currency: "LKR", description: "Crunchy roasted salted peanuts in a 1kg pack.", image: "https://images.unsplash.com/photo-1599490659213-e2b9527bd087?auto=format&fit=crop&w=1200&q=70", featured: true }
];

var els = {
  grid: document.getElementById("productGrid"),
  empty: document.getElementById("emptyState"),
  resultsHint: document.getElementById("resultsHint"),
  search: document.getElementById("searchInput"),
  sort: document.getElementById("sortSelect"),
  year: document.getElementById("year"),
  overlay: document.getElementById("modalOverlay"),
  close: document.getElementById("modalClose"),
  cancel: document.getElementById("cancelBtn"),
  form: document.getElementById("enquiryForm"),
  submitBtn: document.getElementById("submitBtn"),
  customerName: document.getElementById("customerName"),
  phoneNumber: document.getElementById("phoneNumber"),
  orderQty: document.getElementById("orderQty"),
  deliveryArea: document.getElementById("deliveryArea"),
  bankTransferUsed: document.getElementById("bankTransferUsed"),
  paymentRef: document.getElementById("paymentRef"),
  nameError: document.getElementById("nameError"),
  phoneError: document.getElementById("phoneError"),
  qtyError: document.getElementById("qtyError"),
  deliveryError: document.getElementById("deliveryError"),
  paymentError: document.getElementById("paymentError"),
  selectedImg: document.getElementById("selectedImg"),
  selectedName: document.getElementById("selectedName"),
  selectedPrice: document.getElementById("selectedPrice"),
  selectedDesc: document.getElementById("selectedDesc"),
  invoicePanel: document.getElementById("invoicePanel"),
  invoiceNo: document.getElementById("invoiceNo"),
  invoiceContent: document.getElementById("invoiceContent"),
  printInvoiceBtn: document.getElementById("printInvoiceBtn"),
  downloadPdfBtn: document.getElementById("downloadPdfBtn")
};

var selectedProduct = null;
var currentQuery = "";
var currentSort = "featured";
var lastInvoice = null;

function findClosest(node, predicate) {
  var cur = node;
  while (cur && cur !== document) {
    if (cur.nodeType !== 1) {
      cur = cur.parentNode;
      continue;
    }
    if (predicate(cur)) return cur;
    cur = cur.parentNode;
  }
  return null;
}

function showOverlay() { els.overlay.hidden = false; els.overlay.style.display = "grid"; }
function hideOverlay() { els.overlay.hidden = true; els.overlay.style.display = "none"; }
function hideInvoicePanel() { els.invoicePanel.hidden = true; els.invoicePanel.style.display = "none"; }
function showInvoicePanel() { els.invoicePanel.hidden = false; els.invoicePanel.style.display = "block"; }
function isOverlayVisible() { return els.overlay.style.display !== "none"; }

function formatPrice(value, currency) {
  if (value === null || value === undefined || isNaN(Number(value))) return "Price on request";
  try {
    return new Intl.NumberFormat(undefined, { style: "currency", currency: currency || "USD", maximumFractionDigits: 0 }).format(value);
  } catch (e) {
    return String((currency || "") + " " + value).replace(/^\s+|\s+$/g, "");
  }
}

function escapeHtml(str) {
  return String(str).replace(/[&<>"']/g, function (ch) {
    if (ch === "&") return "&amp;";
    if (ch === "<") return "&lt;";
    if (ch === ">") return "&gt;";
    if (ch === '"') return "&quot;";
    return "&#039;";
  });
}

function matchesQuery(product, q) {
  if (!q) return true;
  var hay = (product.name + " " + product.description).toLowerCase();
  return hay.indexOf(String(q).toLowerCase()) !== -1;
}

function compareProducts(a, b) {
  if (currentSort === "priceAsc") {
    var ap = a.price === null || a.price === undefined ? Number.POSITIVE_INFINITY : a.price;
    var bp = b.price === null || b.price === undefined ? Number.POSITIVE_INFINITY : b.price;
    return ap - bp;
  }
  if (currentSort === "priceDesc") {
    var ap2 = a.price === null || a.price === undefined ? Number.NEGATIVE_INFINITY : a.price;
    var bp2 = b.price === null || b.price === undefined ? Number.NEGATIVE_INFINITY : b.price;
    return bp2 - ap2;
  }
  if (currentSort === "nameAsc") return a.name.localeCompare(b.name);
  if (a.featured !== b.featured) return a.featured ? -1 : 1;
  return a.name.localeCompare(b.name);
}

function render() {
  var filtered = PRODUCTS.filter(function (p) { return matchesQuery(p, currentQuery); }).sort(compareProducts);
  var html = "";
  for (var i = 0; i < filtered.length; i++) {
    var p = filtered[i];
    var price = formatPrice(p.price, p.currency);
    var badge = p.featured ? '<div class="badge">Featured</div>' : "";
    html += '<article class="card" data-product-id="' + escapeHtml(p.id) + '"><div class="card__media"><img class="card__img" src="' + escapeHtml(p.image) + '" alt="' + escapeHtml(p.name) + '" loading="lazy" />' + badge + '</div><div class="card__body"><div class="card__top"><h3 class="card__title">' + escapeHtml(p.name) + '</h3><div class="card__price">' + escapeHtml(price) + '</div></div><p class="card__desc">' + escapeHtml(p.description) + '</p><div class="card__actions"><div class="chip">Fast WhatsApp enquiry</div><button class="btn btn--primary" type="button" data-enquire="' + escapeHtml(p.id) + '">Enquire Now</button></div></div></article>';
  }
  els.grid.innerHTML = html;
  els.resultsHint.textContent = String(currentQuery).replace(/^\s+|\s+$/g, "").length > 0 ? "Showing " + filtered.length + " of " + PRODUCTS.length + " products" : "Showing all products (" + PRODUCTS.length + ")";
  els.empty.hidden = filtered.length !== 0;
}

function clearErrors() {
  els.nameError.textContent = "";
  els.phoneError.textContent = "";
  els.qtyError.textContent = "";
  els.deliveryError.textContent = "";
  els.paymentError.textContent = "";
}

function normalizePhone(raw) { return String(raw).replace(/[^\d+]/g, "").trim(); }

function validateOrder() {
  clearErrors();
  var ok = true;
  var name = String(els.customerName.value || "").trim();
  var phone = normalizePhone(els.phoneNumber.value || "");
  var qty = parseInt(els.orderQty.value, 10);
  var delivery = String(els.deliveryArea.value || "");
  var paidByBank = !!els.bankTransferUsed.checked;
  var paymentRef = String(els.paymentRef.value || "").trim();

  if (name.length < 2) { els.nameError.textContent = "Please enter your name."; ok = false; }
  if (phone.replace(/[^\d]/g, "").length < 7) { els.phoneError.textContent = "Please enter a valid phone number."; ok = false; }
  if (isNaN(qty) || qty < 1) { els.qtyError.textContent = "Quantity must be 1 or more."; ok = false; }
  if (ALLOWED_DELIVERY.indexOf(delivery) === -1) { els.deliveryError.textContent = "Delivery is available only in Vavuniya areas."; ok = false; }
  if (paidByBank && paymentRef.length < 4) { els.paymentError.textContent = "Enter a valid payment reference number."; ok = false; }

  return { ok: ok, customerName: name, phoneNumber: phone, quantity: qty, deliveryArea: delivery, paidByBank: paidByBank, paymentRef: paymentRef };
}

function buildMessage(order) {
  var paymentLine = order.paidByBank ? "Bank Transfer Ref: " + order.paymentRef : "Payment: Cash on Delivery";
  return "Hello,\nCustomer Name: " + order.customerName + "\nPhone: " + order.phoneNumber + "\nInterested Product: " + order.productName + "\nQuantity: " + order.quantity + "\nDelivery: " + order.deliveryArea + " (Vavuniya)\nDelivery Time: " + DELIVERY_TIME_TEXT + "\n" + paymentLine;
}

function buildWhatsAppUrl(message) {
  var encoded = encodeURIComponent(message);
  if (WHATSAPP_NUMBER && String(WHATSAPP_NUMBER).length > 0) return "https://wa.me/" + WHATSAPP_NUMBER + "?text=" + encoded;
  return "https://api.whatsapp.com/send?text=" + encoded;
}

function setLoading(isLoading) {
  if (isLoading) {
    els.submitBtn.classList.add("is-loading");
    els.submitBtn.disabled = true;
    els.cancel.disabled = true;
    els.close.disabled = true;
  } else {
    els.submitBtn.classList.remove("is-loading");
    els.submitBtn.disabled = false;
    els.cancel.disabled = false;
    els.close.disabled = false;
  }
}

function makeInvoiceNumber() {
  var d = new Date();
  return "INV-" + d.getFullYear() + String(d.getMonth() + 1) + String(d.getDate()) + "-" + d.getTime();
}

function makeReceiptNumber() {
  var d = new Date();
  return "RCT-" + d.getFullYear() + String(d.getMonth() + 1) + String(d.getDate()) + "-" + d.getTime();
}

function renderInvoice(order) {
  var unitPriceText = formatPrice(selectedProduct.price, selectedProduct.currency);
  var totalText = selectedProduct.price ? formatPrice(selectedProduct.price * order.quantity, selectedProduct.currency) : "Price on request";
  var invoiceNo = makeInvoiceNumber();
  lastInvoice = {
    no: invoiceNo,
    date: new Date().toLocaleString(),
    customerName: order.customerName,
    phoneNumber: order.phoneNumber,
    productName: selectedProduct.name,
    unitPriceText: unitPriceText,
    quantity: order.quantity,
    totalText: totalText,
    deliveryArea: order.deliveryArea,
    deliveryTime: DELIVERY_TIME_TEXT,
    paymentMode: order.paidByBank ? "Bank Transfer" : "Cash on Delivery",
    paymentRef: order.paidByBank ? order.paymentRef : "N/A",
    receiptNo: order.paidByBank ? makeReceiptNumber() : ""
  };

  els.invoiceNo.textContent = invoiceNo;
  els.invoiceContent.innerHTML =
    '<div class="invoice__line"><span>Company</span><strong>' + escapeHtml(COMPANY_NAME) + '</strong></div>' +
    '<div class="invoice__line"><span>Address</span><strong>' + escapeHtml(COMPANY_ADDRESS) + '</strong></div>' +
    '<div class="invoice__line"><span>Date</span><strong>' + escapeHtml(lastInvoice.date) + '</strong></div>' +
    '<div class="invoice__line"><span>Customer</span><strong>' + escapeHtml(lastInvoice.customerName) + '</strong></div>' +
    '<div class="invoice__line"><span>Phone</span><strong>' + escapeHtml(lastInvoice.phoneNumber) + '</strong></div>' +
    '<div class="invoice__line"><span>Product</span><strong>' + escapeHtml(lastInvoice.productName) + '</strong></div>' +
    '<div class="invoice__line"><span>Unit Price</span><strong>' + escapeHtml(lastInvoice.unitPriceText) + '</strong></div>' +
    '<div class="invoice__line"><span>Quantity</span><strong>' + escapeHtml(String(lastInvoice.quantity)) + '</strong></div>' +
    '<div class="invoice__line"><span>Delivery</span><strong>' + escapeHtml(lastInvoice.deliveryArea + ", Vavuniya") + '</strong></div>' +
    '<div class="invoice__line"><span>Delivery Time</span><strong>' + escapeHtml(lastInvoice.deliveryTime) + '</strong></div>' +
    '<div class="invoice__line"><span>Payment Mode</span><strong>' + escapeHtml(lastInvoice.paymentMode) + '</strong></div>' +
    '<div class="invoice__line"><span>Payment Ref</span><strong>' + escapeHtml(lastInvoice.paymentRef) + '</strong></div>' +
    '<div class="invoice__line"><span>Total</span><strong>' + escapeHtml(lastInvoice.totalText) + '</strong></div>' +
    '<div class="invoice__line"><span>Message</span><strong>Thank you</strong></div>';

  showInvoicePanel();
}

function openModal(product) {
  selectedProduct = product;
  els.selectedImg.src = product.image;
  els.selectedImg.alt = product.name;
  els.selectedName.textContent = product.name;
  els.selectedPrice.textContent = formatPrice(product.price, product.currency);
  els.selectedDesc.textContent = product.description;
  els.form.reset();
  els.orderQty.value = "1";
  els.bankTransferUsed.checked = false;
  els.paymentRef.disabled = true;
  clearErrors();
  hideInvoicePanel();
  showOverlay();
  document.body.style.overflow = "hidden";
  setTimeout(function () { els.customerName.focus(); }, 0);
}

function closeModal() {
  hideOverlay();
  document.body.style.overflow = "";
  selectedProduct = null;
  setLoading(false);
}

function printInvoice() {
  if (!lastInvoice) return;
  var win = window.open("", "_blank");
  if (!win) return;
  var html = "<html><head><title>" + lastInvoice.no + "</title><style>body{font-family:Arial,sans-serif;padding:24px;color:#222}.wrap{max-width:760px;margin:0 auto}h1{margin:0 0 4px;font-size:24px}.meta{color:#555;margin-bottom:18px}h2{margin:8px 0 12px;font-size:18px}table{width:100%;border-collapse:collapse}td{padding:8px;border:1px solid #ddd}td:first-child{width:40%;font-weight:700;background:#f5f5f5}.thanks{margin-top:22px;font-weight:700;text-align:center}</style></head><body><div class='wrap'><h1>" + escapeHtml(COMPANY_NAME) + "</h1><div class='meta'>" + escapeHtml(COMPANY_ADDRESS) + "</div><h2>Invoice " + escapeHtml(lastInvoice.no) + "</h2><table>" +
    "<tr><td>Date</td><td>" + escapeHtml(lastInvoice.date) + "</td></tr>" +
    "<tr><td>Customer</td><td>" + escapeHtml(lastInvoice.customerName) + "</td></tr>" +
    "<tr><td>Phone</td><td>" + escapeHtml(lastInvoice.phoneNumber) + "</td></tr>" +
    "<tr><td>Product</td><td>" + escapeHtml(lastInvoice.productName) + "</td></tr>" +
    "<tr><td>Unit Price</td><td>" + escapeHtml(lastInvoice.unitPriceText) + "</td></tr>" +
    "<tr><td>Quantity</td><td>" + escapeHtml(String(lastInvoice.quantity)) + "</td></tr>" +
    "<tr><td>Delivery</td><td>" + escapeHtml(lastInvoice.deliveryArea + ", Vavuniya") + "</td></tr>" +
    "<tr><td>Payment Ref</td><td>" + escapeHtml(lastInvoice.paymentRef) + "</td></tr>" +
    "<tr><td>Total</td><td>" + escapeHtml(lastInvoice.totalText) + "</td></tr></table><div class='thanks'>Thank you</div></div></body></html>";
  win.document.write(html);
  win.document.close();
  win.focus();
  win.print();
}

function buildInvoiceText(invoice) {
  return (
    "INVOICE " + invoice.no + "\n" +
    "Date: " + invoice.date + "\n" +
    "Customer: " + invoice.customerName + "\n" +
    "Phone: " + invoice.phoneNumber + "\n" +
    "Product: " + invoice.productName + "\n" +
    "Unit Price: " + invoice.unitPriceText + "\n" +
    "Quantity: " + invoice.quantity + "\n" +
    "Delivery: " + invoice.deliveryArea + ", Vavuniya\n" +
    "Delivery Time: " + invoice.deliveryTime + "\n" +
    "Payment Mode: " + invoice.paymentMode + "\n" +
    "Payment Ref: " + invoice.paymentRef + "\n" +
    "Total: " + invoice.totalText + "\n"
  );
}

function downloadTextInvoiceFallback() {
  if (!lastInvoice) return;
  var text = buildInvoiceText(lastInvoice);
  var blob = new Blob([text], { type: "text/plain;charset=utf-8" });
  var link = document.createElement("a");
  link.href = URL.createObjectURL(blob);
  link.download = lastInvoice.no + ".txt";
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  setTimeout(function () {
    URL.revokeObjectURL(link.href);
  }, 0);
}

function downloadPdf() {
  if (!lastInvoice) return;
  if (!window.jspdf || !window.jspdf.jsPDF) {
    // Fallback for iOS/macOS/tablets/Android: text invoice + print dialog
    downloadTextInvoiceFallback();
    printInvoice();
    alert("PDF is unavailable on this device right now. Downloaded a text invoice and opened Print (choose Save as PDF).");
    return;
  }
  try {
    var jsPDF = window.jspdf.jsPDF;
    var doc = new jsPDF();
    doc.setFontSize(16);
    doc.text("Invoice " + lastInvoice.no, 14, 18);
    doc.setFontSize(11);
    var y = 30;
    function row(label, value) { doc.text(label + ": " + value, 14, y); y += 8; }
    row("Date", lastInvoice.date);
    row("Customer", lastInvoice.customerName);
    row("Phone", lastInvoice.phoneNumber);
    row("Product", lastInvoice.productName);
    row("Unit Price", lastInvoice.unitPriceText);
    row("Quantity", String(lastInvoice.quantity));
    row("Delivery", lastInvoice.deliveryArea + ", Vavuniya");
    row("Delivery Time", lastInvoice.deliveryTime);
    row("Payment Mode", lastInvoice.paymentMode);
    row("Payment Ref", lastInvoice.paymentRef);
    row("Total", lastInvoice.totalText);
    doc.save(lastInvoice.no + ".pdf");
  } catch (err) {
    downloadTextInvoiceFallback();
    printInvoice();
    alert("PDF generation failed. Downloaded a text invoice and opened Print (choose Save as PDF).");
  }
}

els.grid.addEventListener("click", function (e) {
  var btn = findClosest(e.target, function (n) { return n && n.getAttribute && n.getAttribute("data-enquire"); });
  if (!btn) return;
  var id = btn.getAttribute("data-enquire");
  for (var i = 0; i < PRODUCTS.length; i++) if (PRODUCTS[i].id === id) { openModal(PRODUCTS[i]); return; }
});

els.search.addEventListener("input", function (e) { currentQuery = e.target.value || ""; render(); });
els.sort.addEventListener("change", function (e) { currentSort = e.target.value || "featured"; render(); });
els.close.addEventListener("click", closeModal);
els.cancel.addEventListener("click", closeModal);
els.bankTransferUsed.addEventListener("change", function () {
  var enabled = !!els.bankTransferUsed.checked;
  els.paymentRef.disabled = !enabled;
  if (!enabled) {
    els.paymentRef.value = "";
    els.paymentError.textContent = "";
  } else {
    setTimeout(function () { els.paymentRef.focus(); }, 0);
  }
});
els.printInvoiceBtn.addEventListener("click", printInvoice);
els.downloadPdfBtn.addEventListener("click", downloadPdf);
els.overlay.addEventListener("click", function (e) { if (e.target === els.overlay) closeModal(); });
document.addEventListener("keydown", function (e) { var key = e.key || e.keyCode; if ((key === "Escape" || key === "Esc" || key === 27) && isOverlayVisible()) closeModal(); });

els.form.addEventListener("submit", function (e) {
  e.preventDefault();
  if (!selectedProduct) return;
  var order = validateOrder();
  if (!order.ok) return;
  setLoading(true);
  order.productName = selectedProduct.name;
  var url = buildWhatsAppUrl(buildMessage(order));
  window.open(url, "_blank");
  renderInvoice(order);
  setTimeout(function () { setLoading(false); }, 350);
});

hideOverlay();
hideInvoicePanel();
els.year.textContent = String(new Date().getFullYear());
render();

