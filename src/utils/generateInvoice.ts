import type { GymProfile, MemberInvoice } from '@/api/types';

function formatDate(dateStr: string): string {
  const d = new Date(dateStr);
  const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
  return `${d.getDate()} ${months[d.getMonth()]} ${d.getFullYear()}`;
}

interface InvoiceData {
  invoice: MemberInvoice;
  memberName: string;
  planName: string;
  planType: string;
  purchaseDate?: string;
  expiryDate?: string;
  gym: GymProfile;
}

export function generateInvoiceHTML(data: InvoiceData): string {
  const { invoice, memberName, planName, planType, purchaseDate, expiryDate, gym } = data;

  return `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8" />
  <title>Invoice ${invoice.invoiceNumber}</title>
  <style>
    * { margin: 0; padding: 0; box-sizing: border-box; }
    body { font-family: 'Segoe UI', Arial, sans-serif; color: #333; background: #fff; padding: 40px; }
    .invoice { max-width: 700px; margin: 0 auto; }
    .header { display: flex; justify-content: space-between; align-items: flex-start; margin-bottom: 32px; padding-bottom: 20px; border-bottom: 2px solid #006064; }
    .gym-name { font-size: 22px; font-weight: 700; color: #006064; }
    .gym-details { font-size: 12px; color: #666; margin-top: 4px; }
    .invoice-title { font-size: 28px; font-weight: 700; color: #006064; text-align: right; }
    .invoice-number { font-size: 13px; color: #666; text-align: right; margin-top: 4px; }
    .details-row { display: flex; justify-content: space-between; margin-bottom: 24px; }
    .detail-block h4 { font-size: 11px; text-transform: uppercase; color: #999; letter-spacing: 0.5px; margin-bottom: 4px; }
    .detail-block p { font-size: 14px; font-weight: 500; }
    table { width: 100%; border-collapse: collapse; margin: 24px 0; }
    th { background: #006064; color: #fff; padding: 10px 14px; text-align: left; font-size: 12px; text-transform: uppercase; letter-spacing: 0.5px; }
    td { padding: 10px 14px; border-bottom: 1px solid #eee; font-size: 13px; }
    tr:last-child td { border-bottom: none; }
    .totals { margin-left: auto; width: 280px; }
    .totals-row { display: flex; justify-content: space-between; padding: 6px 0; font-size: 13px; }
    .totals-row.total { border-top: 2px solid #006064; padding-top: 10px; margin-top: 6px; font-size: 15px; font-weight: 700; color: #006064; }
    .totals-row.pending { color: #E57373; font-weight: 600; }
    .footer { margin-top: 40px; padding-top: 16px; border-top: 1px solid #eee; text-align: center; font-size: 11px; color: #999; }
    .actions { display: flex; gap: 10px; justify-content: center; margin-bottom: 24px; }
    .actions button { padding: 10px 20px; border: none; border-radius: 8px; font-size: 13px; font-weight: 600; cursor: pointer; display: flex; align-items: center; gap: 6px; }
    .btn-print { background: #006064; color: #fff; }
    .btn-print:hover { background: #00838F; }
    .btn-pdf { background: #E57373; color: #fff; }
    .btn-pdf:hover { background: #EF5350; }
    .btn-whatsapp { background: #25D366; color: #fff; }
    .btn-whatsapp:hover { background: #1EB854; }
    .btn-share { background: #1976D2; color: #fff; }
    .btn-share:hover { background: #1565C0; }
    @media print { body { padding: 20px; } .no-print { display: none !important; } }
  </style>
</head>
<body>
  <div class="actions no-print">
    <button class="btn-print" onclick="window.print()">&#128424; Print</button>
    <button class="btn-pdf" onclick="downloadPDF()">&#128196; Download PDF</button>
    <button class="btn-whatsapp" onclick="shareWhatsApp()">&#128172; WhatsApp</button>
    <button class="btn-share" onclick="shareNative()" id="shareBtn" style="display:none">&#128228; Share</button>
  </div>

  <div class="invoice" id="invoice-content">
    <div class="header">
      <div>
        <div class="gym-name">${escapeHTML(gym.subName)}</div>
        <div class="gym-details">
          ${gym.email ? escapeHTML(gym.email) : ''}
          ${gym.mobile ? `${gym.email ? ' | ' : ''}${gym.callingCode ? '+' + escapeHTML(gym.callingCode) + ' ' : ''}${escapeHTML(gym.mobile)}` : ''}
        </div>
      </div>
      <div>
        <div class="invoice-title">INVOICE</div>
        <div class="invoice-number">#${escapeHTML(invoice.invoiceNumber)}</div>
      </div>
    </div>

    <div class="details-row">
      <div class="detail-block">
        <h4>Billed To</h4>
        <p>${escapeHTML(memberName)}</p>
      </div>
      <div class="detail-block">
        <h4>Payment Date</h4>
        <p>${formatDate(invoice.paymentDate)}</p>
      </div>
      <div class="detail-block">
        <h4>Plan Type</h4>
        <p>${escapeHTML(planType)}</p>
      </div>
    </div>

    <table>
      <thead>
        <tr>
          <th>Description</th>
          ${purchaseDate ? '<th>Start Date</th>' : ''}
          ${expiryDate ? '<th>Expiry Date</th>' : ''}
          <th style="text-align:right">Amount</th>
        </tr>
      </thead>
      <tbody>
        <tr>
          <td>${escapeHTML(planName)}</td>
          ${purchaseDate ? `<td>${formatDate(purchaseDate)}</td>` : ''}
          ${expiryDate ? `<td>${formatDate(expiryDate)}</td>` : ''}
          <td style="text-align:right">₹${invoice.totalAmount}</td>
        </tr>
      </tbody>
    </table>

    <div class="totals">
      <div class="totals-row">
        <span>Total Amount</span>
        <span>₹${invoice.totalAmount}</span>
      </div>
      <div class="totals-row">
        <span>Paid Amount</span>
        <span>₹${invoice.paidAmount}</span>
      </div>
      ${invoice.pendingAmount > 0 ? `
      <div class="totals-row pending">
        <span>Pending Amount</span>
        <span>₹${invoice.pendingAmount}</span>
      </div>
      ` : ''}
      <div class="totals-row total">
        <span>Amount Paid</span>
        <span>₹${invoice.paidAmount}</span>
      </div>
    </div>

    <div class="footer">
      Thank you for your payment! | Generated by ${escapeHTML(gym.subName)}
    </div>
  </div>

  <script>
    // Show native share button if supported
    if (navigator.share) {
      document.getElementById('shareBtn').style.display = 'flex';
    }

    function downloadPDF() {
      // Hide action buttons, print as PDF, restore
      var actions = document.querySelector('.actions');
      actions.style.display = 'none';
      window.print();
      setTimeout(function() { actions.style.display = 'flex'; }, 500);
    }

    function shareWhatsApp() {
      var text = 'Invoice #${escapeHTML(invoice.invoiceNumber)}' +
        '\\nMember: ${escapeHTML(memberName)}' +
        '\\nPlan: ${escapeHTML(planName)} (${escapeHTML(planType)})' +
        '\\nPayment Date: ${formatDate(invoice.paymentDate)}' +
        '\\nTotal: ₹${invoice.totalAmount}' +
        '\\nPaid: ₹${invoice.paidAmount}' +
        ${invoice.pendingAmount > 0 ? `'\\nPending: ₹${invoice.pendingAmount}' +` : ''}
        '\\n\\nGenerated by ${escapeHTML(gym.subName)}';
      window.open('https://wa.me/?text=' + encodeURIComponent(text), '_blank');
    }

    async function shareNative() {
      try {
        await navigator.share({
          title: 'Invoice #${escapeHTML(invoice.invoiceNumber)}',
          text: 'Invoice for ${escapeHTML(memberName)} - ${escapeHTML(planName)}\\nTotal: ₹${invoice.totalAmount} | Paid: ₹${invoice.paidAmount}'
        });
      } catch(e) { /* user cancelled */ }
    }
  </script>
</body>
</html>`;
}

function escapeHTML(str: string): string {
  return str
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}

export function openInvoice(data: InvoiceData) {
  const html = generateInvoiceHTML(data);
  const win = window.open('', '_blank');
  if (win) {
    win.document.write(html);
    win.document.close();
  }
}
