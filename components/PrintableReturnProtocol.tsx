import React from 'react';
import { Client, Reservation, Trailer } from '@/lib/store';

interface PrintableReturnProtocolProps {
  reservation: Reservation;
  client: Client;
  trailer: Trailer;
}

const CheckboxCell = ({ label, checked }: { label: string, checked?: boolean }) => (
  <div className="flex items-center gap-1.5 p-1 border-r border-black last:border-r-0">
    <div className={`w-4 h-4 border border-black flex items-center justify-center ${checked ? 'bg-black text-white' : ''}`}>
      {checked && <span className="text-xs">✕</span>}
    </div>
    <span>{label}</span>
  </div>
);

export const PrintableReturnProtocol = React.forwardRef<HTMLDivElement, PrintableReturnProtocolProps>(
  ({ reservation, client, trailer }, ref) => {
    const protocol = reservation.protocol;
    const protocolItems = [
      { label: 'Fahrzeugausstattung', key: 'fahrzeugausstattung' as const },
      { label: 'Plane und Spriegel', key: 'planeUndSpriegel' as const },
      { label: 'Kofferaufbau', key: 'kofferaufbau' as const },
      { label: 'Kupplung, Schlingerkupplung', key: 'kupplung' as const },
      { label: 'Auflaufbremse, ungebremst', key: 'auflaufbremse' as const },
      { label: 'Elektrik, Anschlusskabel, Adapter', key: 'elektrik' as const },
      { label: 'Reifen, Felge, Ersatzrad', key: 'reifen' as const },
      { label: 'Stützrad, Abstellstützen', key: 'stuetzrad' as const },
      { label: 'Bordwände', key: 'bordwaende' as const },
      { label: 'Leuchten', key: 'leuchten' as const },
    ];

    const content = (
      <div ref={ref} className="p-8 bg-white text-black w-full max-w-[800px] mx-auto font-sans" id="print-area-return">
        {/* Header */}
        <div className="flex justify-between items-start border-b-2 border-black pb-4 mb-4">
          <div className="text-sm">
            <ul className="list-disc pl-4">
              <li>Doll Fahrzeugbau oHG / Raudtener Str. 8 / 90475 Nürnberg</li>
              <li>Ust.-Id.-Nr. DE 228 243 158</li>
            </ul>
            <h1 className="text-xl font-bold mt-4 uppercase">Anhänger-Mietvertrag</h1>
            <h2 className="text-lg font-bold">und Rechnung</h2>
          </div>
          <div className="text-right text-sm">
            <div className="text-red-600 font-bold text-4xl tracking-tighter mb-2">DOLLCO</div>
            <p>Tel.-Nr. 0911 /83 05 04</p>
            <p>Fax-Nr. 0911 / 83 23 64</p>
            <p>email: dollco@gmx.de</p>
            <p>web: www.dollco.de</p>
          </div>
        </div>

        <h3 className="text-2xl font-bold text-center mb-6">Übergabe – und Rückgabeprotokoll<br/>PKW Anhänger</h3>

        <table className="w-full border-collapse border border-black text-sm mb-6">
          <tbody>
            <tr>
              <td className="border border-black p-2 w-1/2">Mieter: {client.name}</td>
              <td className="border border-black p-2 w-1/2" colSpan={2}>Fahrzeug: {trailer.plate}</td>
            </tr>
            <tr className="bg-gray-100 font-bold">
              <td className="border border-black p-2">Übergabeprotokoll für Anhänger</td>
              <td className="border border-black p-2 w-1/4">Zustand bei Übergabe</td>
              <td className="border border-black p-2 w-1/4">Zustand bei Rückgabe</td>
            </tr>
            <tr>
              <td className="border border-black p-2 font-medium">Zutreffendes ankreuzen</td>
              <td className="border border-black p-0">
                <div className="flex w-full">
                  <div className="w-1/2"><CheckboxCell label="gut" /></div>
                  <div className="w-1/2"><CheckboxCell label="Mängel*" /></div>
                </div>
              </td>
              <td className="border border-black p-0">
                <div className="flex w-full">
                  <div className="w-1/2"><CheckboxCell label="gut" /></div>
                  <div className="w-1/2"><CheckboxCell label="Mängel*" /></div>
                </div>
              </td>
            </tr>
            {protocolItems.map((item) => (
              <tr key={item.key}>
                <td className="border border-black p-2">{item.label}</td>
                <td className="border border-black p-0">
                   <div className="flex w-full">
                    <div className="w-1/2"><CheckboxCell label="gut" checked={protocol?.[item.key]?.uebergabe === true} /></div>
                    <div className="w-1/2"><CheckboxCell label="Mängel*" checked={protocol?.[item.key]?.uebergabe === false} /></div>
                  </div>
                </td>
                <td className="border border-black p-0">
                   <div className="flex w-full">
                    <div className="w-1/2"><CheckboxCell label="gut" checked={protocol?.[item.key]?.rueckgabe === true} /></div>
                    <div className="w-1/2"><CheckboxCell label="Mängel*" checked={protocol?.[item.key]?.rueckgabe === false} /></div>
                  </div>
                </td>
              </tr>
            ))}
            <tr>
              <td className="border border-black p-2 font-medium bg-gray-50" colSpan={3}>Mängelbeschreibung *</td>
            </tr>
            <tr>
              <td className="border border-black p-2 h-20 align-top" colSpan={3}>
                {protocol?.damageDescription || ''}
              </td>
            </tr>
          </tbody>
        </table>

        {/* Damage Graphic Sketch area mock */}
        <div className="border border-black p-4 mb-6 relative w-full h-48 flex flex-col items-center justify-center">
            <span className="absolute top-2 left-2 text-sm">Karosserie: Festgestellte Schäden (Schaden in Skizze markieren)</span>
            {/* Draw a simple trailer mockup for sketch */}
            <div className="w-3/4 h-24 border-2 border-black flex items-center justify-center bg-gray-100 rounded-sm">
                <span className="text-gray-400">Anhänger Skizze</span>
            </div>
            <div className="w-8 h-8 border-2 border-black rounded-full absolute -ml-24 mt-16 bg-gray-800"></div>
            <div className="w-8 h-8 border-2 border-black rounded-full absolute ml-24 mt-16 bg-gray-800"></div>
            <div className="w-16 h-4 border-2 border-l-0 border-black absolute right-[10%] top-[45%]"></div>
        </div>

        <table className="w-full border-collapse border border-black text-sm">
          <tbody>
            <tr>
              <td className="border border-black p-2 w-1/4">Datum: {protocol?.returnDate || ''}</td>
              <td className="border border-black p-2 w-3/4 font-medium" colSpan={2}>Der Inhalt des vorstehenden Protokolls wird bestätigt:</td>
            </tr>
            <tr>
              <td className="border border-black p-2 h-16"></td>
              <td className="border border-black p-2 h-16 align-bottom w-3/8">Unterschrift Mieter:</td>
              <td className="border border-black p-2 h-16 align-bottom w-3/8">Unterschrift Vermieter:</td>
            </tr>
          </tbody>
        </table>

      </div>
    );

    return content;
  }
);

PrintableReturnProtocol.displayName = 'PrintableReturnProtocol';
