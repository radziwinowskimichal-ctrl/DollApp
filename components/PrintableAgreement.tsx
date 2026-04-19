import React from 'react';
import { Client, Reservation, Trailer, RentalAgreement } from '@/lib/store';
import { format, parseISO } from 'date-fns';
import { translations } from '@/lib/translations';

interface PrintableAgreementProps {
  reservation: Reservation;
  client: Client;
  trailer: Trailer;
  agreement: RentalAgreement;
}

export const PrintableAgreement = React.forwardRef<HTMLDivElement, PrintableAgreementProps>(
  ({ reservation, client, trailer, agreement }, ref) => {
    
    const calculateTotalDeposit = () => {
      let total = Number(agreement.deposits?.general || 0);
      if (agreement.deposits?.lock) total += 35;
      if (agreement.deposits?.straps) total += 60;
      if (agreement.deposits?.adapter) total += 17;
      if (agreement.deposits?.registration) total += 200;
      return total;
    };

    const startDate = parseISO(reservation.startDate);
    const endDate = parseISO(reservation.endDate);
    const days = Math.ceil((endDate.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24));

    const content = (
      <div ref={ref} className="p-8 bg-white text-black w-full max-w-[800px] mx-auto font-sans" id="print-area">
        {/* Header */}
        <div className="flex justify-between items-start border-b-2 border-black pb-4 mb-6">
          <div className="text-sm">
            <ul className="list-disc pl-4">
              <li>Doll Fahrzeugbau oHG / Raudtener Str. 8 / 90475 Nürnberg</li>
              <li>Ust.-Id.-Nr. DE 228 243 158 / Gerichtsstand Nürnberg HRA10504</li>
              <li>Sparkasse Nürnberg IBAN DE16 7605 0101 0380 1607 88</li>
            </ul>
            <h1 className="text-3xl font-bold mt-4">ANHÄNGER-MIETVERTRAG</h1>
            <h2 className="text-2xl font-bold">und Rechnung</h2>
          </div>
          <div className="text-right text-sm">
            <div className="text-red-600 font-bold text-4xl tracking-tighter mb-2">DOLLCO</div>
            <p>Tel.-Nr. 0911 /83 05 04</p>
            <p>Fax-Nr. 0911 / 83 23 64</p>
            <p>email: dollco@gmx.de</p>
            <p>web: www.dollco.de</p>
          </div>
        </div>

        <p className="text-sm mb-4">
          Die Firma Doll Fahrzeugbau oHG, 90475 Nürnberg -nachstehend Vermieter genannt- overlássst den unten aufgeführten Anhänger an den
          nachfolgend genannten Mieter zu den im Einzelnen aufgeführten Bedingungen.
        </p>

        {/* Client Info */}
        <table className="w-full border-collapse border border-black text-sm mb-4">
          <tbody>
            <tr>
              <td className="border border-black p-1 w-2/3">Herr/Frau/Firma: {client.name}</td>
              <td className="border border-black p-1 w-1/3">Tel.: {client.phone || ''}</td>
            </tr>
            <tr>
              <td className="border border-black p-1">Straße: {client.address || ''}</td>
              <td className="border border-black p-1">Mobil: </td>
            </tr>
            <tr>
              <td className="border border-black p-1" colSpan={2}>PLZ, Wohnort: </td>
            </tr>
          </tbody>
        </table>

        {/* License Info */}
        <table className="w-full border-collapse border border-black text-sm mb-2">
          <tbody>
            <tr>
              <td className="border border-black p-1 w-1/3">Führerschein-Klasse: {client.driverLicenseClass || ''}</td>
              <td className="border border-black p-1 w-1/3">Ausgestellt am: {client.driverLicenseIssueDate ? format(parseISO(client.driverLicenseIssueDate), 'dd.MM.yyyy') : ''}</td>
              <td className="border border-black p-1 w-1/3">Ausstellungsort: {client.driverLicenseIssuePlace || ''}</td>
            </tr>
            <tr>
              <td className="border border-black p-1">Ausweis/Reisepass-Nr.: {client.idCardNumber || ''}</td>
              <td className="border border-black p-1">Gültig bis: {client.idCardExpiry ? format(parseISO(client.idCardExpiry), 'dd.MM.yyyy') : ''}</td>
              <td className="border border-black p-1">Ausstellungsort: {client.idCardIssuePlace || ''}</td>
            </tr>
          </tbody>
        </table>

        <p className="text-xs mb-4 text-justify">
          <strong>Führerschein:</strong><br/>
          Der Fahrer des Zugfahrzeugs muss im Besitz einer Fahrerlaubnis der Klasse BE oder, wenn der Führerschein vor 1999 erteilt wurde, Klasse III
          sein. Nur der vorstehend genannte Mieter, dessen Arbeitnehmer oder Familienangehörige sind, sofern sie im Besitz der erforderlichen
          Fahrerlaubnis sind, zur Benutzung des Anhängers hinter einem Zugfahrzeug berechtigt. Bei Anhängern mit einem Gesamtgewicht von nicht
          mehr als 750 kg ist Führerschein Klasse B ausreichend.
        </p>

        {/* Trailer Info */}
        <h3 className="font-bold text-sm mb-1">Mietanhänger:</h3>
        <table className="w-full border-collapse text-sm mb-4">
          <tbody>
            <tr>
              <td className="border border-black p-1 w-1/3">Amtl. Kennzeichen: <span className="font-bold">{trailer.plate}</span></td>
              <td className="w-4"></td>
              <td className="border border-black p-1 w-1/3">Gesamtgewicht: {trailer.capacity}</td>
            </tr>
            <tr>
              <td className="border border-black p-1">Typ: {(translations.de.trailerTypes as any)[trailer.type] || trailer.type}</td>
              <td className="w-4"></td>
              <td className="border border-black p-1">Nutzlast: </td>
            </tr>
          </tbody>
        </table>

        {/* Rental Period */}
        <h3 className="font-bold text-sm mb-1">Mietdauer:</h3>
        <p className="text-sm border border-black border-b-0 p-1">
          Das Mietverhältnis beginnt with der Abholung des Anhängers beim Vermieter und endet with der vereinbarten Rückgabe
        </p>
        <table className="w-full border-collapse border border-black text-sm mb-4">
          <tbody>
            <tr>
              <td className="border border-black p-1 w-1/4">Abholung</td>
              <td className="border border-black p-1 w-1/2">Tag: {format(startDate, 'dd.MM.yyyy')}</td>
              <td className="border border-black p-1 w-1/4">Uhrzeit: {agreement.pickupTime || ''}</td>
            </tr>
            <tr>
              <td className="border border-black p-1">Rückgabe</td>
              <td className="border border-black p-1">Tag: {format(endDate, 'dd.MM.yyyy')}</td>
              <td className="border border-black p-1">Uhrzeit: {agreement.returnTime || ''}</td>
            </tr>
          </tbody>
        </table>

        {/* Pricing Table */}
        <table className="w-full border-collapse border border-black text-sm mb-4">
          <thead>
            <tr className="bg-gray-100">
              <th className="border border-black p-1 text-left">Leistung</th>
              <th className="border border-black p-1 text-left">Kalendertage</th>
              <th className="border border-black p-1 text-left">Einzelpreis</th>
              <th className="border border-black p-1 text-left">Summe</th>
              <th className="border border-black p-1 text-left">MwSt. 19%</th>
              <th className="border border-black p-1 text-left">Brutto</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td className="border border-black p-1">Tagespreis</td>
              <td className="border border-black p-1">{days}</td>
              <td className="border border-black p-1">{agreement.prices?.daily ? `${agreement.prices.daily} €` : ''}</td>
              <td className="border border-black p-1"></td>
              <td className="border border-black p-1"></td>
              <td className="border border-black p-1"></td>
            </tr>
            <tr>
              <td className="border border-black p-1">Wochenendpreis</td>
              <td className="border border-black p-1"></td>
              <td className="border border-black p-1">{agreement.prices?.weekend ? `${agreement.prices.weekend} €` : ''}</td>
              <td className="border border-black p-1"></td>
              <td className="border border-black p-1"></td>
              <td className="border border-black p-1"></td>
            </tr>
            <tr>
              <td className="border border-black p-1">Wochenpreis</td>
              <td className="border border-black p-1"></td>
              <td className="border border-black p-1">{agreement.prices?.weekly ? `${agreement.prices.weekly} €` : ''}</td>
              <td className="border border-black p-1"></td>
              <td className="border border-black p-1"></td>
              <td className="border border-black p-1"></td>
            </tr>
            <tr>
              <td className="border border-black p-1 font-bold">Gesamtpreis</td>
              <td className="border border-black p-1"></td>
              <td className="border border-black p-1"></td>
              <td className="border border-black p-1"></td>
              <td className="border border-black p-1"></td>
              <td className="border border-black p-1 font-bold">{agreement.prices?.total ? `${agreement.prices.total} €` : ''}</td>
            </tr>
            <tr>
              <td className="border border-black p-1">Diebstahlschloss</td>
              <td className="border border-black p-1">Pfand 35 €</td>
              <td className="border border-black p-1 text-center">{agreement.deposits?.lock ? 'X' : ''}</td>
              <td className="border border-black p-1"></td>
              <td className="border border-black p-1"></td>
              <td className="border border-black p-1"></td>
            </tr>
            <tr>
              <td className="border border-black p-1">Gurte</td>
              <td className="border border-black p-1">Pfand 60 €</td>
              <td className="border border-black p-1 text-center">{agreement.deposits?.straps ? 'X' : ''}</td>
              <td className="border border-black p-1"></td>
              <td className="border border-black p-1"></td>
              <td className="border border-black p-1"></td>
            </tr>
            <tr>
              <td className="border border-black p-1">Adapter</td>
              <td className="border border-black p-1">Pfand 17 €</td>
              <td className="border border-black p-1 text-center">{agreement.deposits?.adapter ? 'X' : ''}</td>
              <td className="border border-black p-1"></td>
              <td className="border border-black p-1"></td>
              <td className="border border-black p-1"></td>
            </tr>
            <tr>
              <td className="border border-black p-1">Fahrzeugschein / grüne Karte</td>
              <td className="border border-black p-1">Pfand 200€</td>
              <td className="border border-black p-1 text-center">{agreement.deposits?.registration ? 'X' : ''}</td>
              <td className="border border-black p-1"></td>
              <td className="border border-black p-1"></td>
              <td className="border border-black p-1"></td>
            </tr>
            <tr>
              <td className="border border-black p-1">Kaution</td>
              <td className="border border-black p-1">{agreement.deposits?.general ? `${agreement.deposits.general} €` : ''}</td>
              <td className="border border-black p-1"></td>
              <td className="border border-black p-1"></td>
              <td className="border border-black p-1"></td>
              <td className="border border-black p-1"></td>
            </tr>
            <tr>
              <td className="border border-black p-1 font-bold">Gesamtpreis</td>
              <td className="border border-black p-1"></td>
              <td className="border border-black p-1"></td>
              <td className="border border-black p-1"></td>
              <td className="border border-black p-1"></td>
              <td className="border border-black p-1 font-bold">
                {agreement.prices?.total || calculateTotalDeposit() ? `${(agreement.prices?.total || 0) + calculateTotalDeposit()} €` : ''}
              </td>
            </tr>
          </tbody>
        </table>

        {/* Payment Method */}
        <div className="flex items-center gap-4 text-sm mb-4">
          <span>Der Mietpreis wurde wie folgt gezahlt:</span>
          <div className={`border border-black px-4 py-1 ${agreement.paymentMethod === 'BAR' ? 'bg-gray-200 font-bold' : ''}`}>BAR</div>
          <div className={`border border-black px-4 py-1 ${agreement.paymentMethod === 'EC-Karte' ? 'bg-gray-200 font-bold' : ''}`}>EC-Karte</div>
          <div className={`border border-black px-4 py-1 ${agreement.paymentMethod === 'Kreditkarte' ? 'bg-gray-200 font-bold' : ''}`}>Kreditkarte</div>
        </div>

        {/* Terms */}
        <p className="text-xs text-justify font-bold mb-12">
          Der Anhänger wird dem Mieter in technisch einwandfreiem Zustand übergeben. Optische Beeinträchtigungen wie
          beispielsweise kleine Lackschäden, kleine Dellen, Kratzer oder Parkrempler stellen keine Fahrzeugmängel dar und sind
          vom Mieter zu akzeptieren. Der Mieter kann die Aufnahme vorhandener Mängel in das Übergabeprotokoll verlangen. Die
          allgemeinen Mietbedingungen sind Bestandteil dieses Mietvertrages.<br/>
          Bei Ausfall in Folge technischer Schäden werden keine Kosten u. Folgekosten übernommen. Bei Reifenschäden haftet
          der Mieter und hat die Kosten zu tragen. Der Anhänger ist Haftpflichtversichert mit 1000.- Euro SB im Schadenfall,
          Teilkasko ebenfalls with 1000.- Euro SB.
        </p>

        {/* Signatures */}
        <div className="flex justify-between text-sm mt-8">
          <div className="w-1/3">
            <div className="border-b border-black mb-1">Nürnberg, {format(new Date(), 'dd.MM.yyyy')}</div>
            <div className="text-xs">Nürnberg, Datum</div>
          </div>
          <div className="w-1/3">
            <div className="border-b border-black mb-1 h-5"></div>
            <div className="text-xs text-center">Stempel + Unterschrift des Vermieters</div>
          </div>
          <div className="w-1/3">
            <div className="border-b border-black mb-1 h-5"></div>
            <div className="text-xs text-center">Unterschrift des Mieters</div>
          </div>
        </div>

      </div>
    );

    return content;
  }
);

PrintableAgreement.displayName = 'PrintableAgreement';
