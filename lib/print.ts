export function printDocument(elementId: string, title: string = 'Dokument') {
  const printContent = document.getElementById(elementId);
  if (!printContent) return false;

  const printWindow = window.open('', '_blank');
  if (!printWindow) return false;

  const styles = Array.from(document.querySelectorAll('style, link[rel="stylesheet"]'))
    .map(el => {
      if (el.tagName.toLowerCase() === 'link') {
        const href = el.getAttribute('href');
        if (href) {
          const absoluteHref = new URL(href, window.location.origin).href;
          return `<link rel="stylesheet" href="${absoluteHref}">`;
        }
      }
      return el.outerHTML;
    })
    .join('\n');

  printWindow.document.write(`
    <!DOCTYPE html>
    <html>
      <head>
        <title>${title}</title>
        <base href="${window.location.origin}">
        ${styles}
        <style>
          body { background: white; margin: 0; padding: 20px; color: black; }
          #${elementId} { display: block !important; position: static !important; visibility: visible !important; width: 100%; max-width: 100%; margin: 0 auto; }
          /* Zapewnienie, że podczas drukowania nic nie ukryje głównego kontenera */
          @media print {
            @page { margin: 1cm; }
            body { -webkit-print-color-adjust: exact; print-color-adjust: exact; }
            html, body { height: auto !important; overflow: visible !important; }
            #${elementId} { visibility: visible !important; }
          }
        </style>
      </head>
      <body>
        ${printContent.outerHTML}
        <script>
          window.onload = () => {
             // Oczekujemy chwilę zanim style z linków zewnętrznych zastaną pobrane
            setTimeout(() => {
              window.print();
              setTimeout(() => {
                window.close();
              }, 500);
            }, 600);
          };
        </script>
      </body>
    </html>
  `);
  printWindow.document.close();
  return true;
}
