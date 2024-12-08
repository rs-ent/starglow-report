import { fetchData } from '../app/firebase/fetch';
import { ReportsProvider } from '../context/ReportsData'; 

import "./globals.css";

export const metadata = {
  title: "투자 리포트",
};
export default async function RootLayout({ children }) {
  const reports = await fetchData('Report', null, true);
  
  return (
    <html lang="en">
      <body>
        <ReportsProvider reports={reports}>
          {children}
        </ReportsProvider>
      </body>
    </html>
  );
}