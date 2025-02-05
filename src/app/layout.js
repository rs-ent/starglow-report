import { ReportsProvider } from '../context/ReportsData'; 
import { Analytics } from "@vercel/analytics/react"

import "./globals.css";

export const dynamic = 'force-dynamic';

export const metadata = {
  title: "STARGLOW REPORT",
};
export default async function RootLayout({ children }) {
  const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000';

  const res = await fetch(`${baseUrl}/api/firestore`, {
    method: 'POST',
    next: { revalidate: 60 },
    body: JSON.stringify({
      method: 'fetchData',
      args: {
        collectionName: 'Report',
        queryObj: { comp: '', sign: '==', val: '' },
        fetchMultiples: true
      }
    })
  });
  const reports = await res.json();
  
  return (
    <html>
      <body>
        <Analytics />
        <ReportsProvider reports={reports}>
            {children}
        </ReportsProvider>
      </body>
    </html>
  );
}