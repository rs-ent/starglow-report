import DefaultLayout from "../../components/server/DefaultLayout";
import ClientManager from "./ClientManager";
import { krw_usd } from "../../../script/exchange";
import { fetchData } from "../../firebase/fetch";

export default async function Page({ params }) {
  const { artist_id, locale } = await params;
  const exchangeRate = locale === "ko" ? 1 : await krw_usd();
  const fixedExchangeRate = await krw_usd();

  // Report 데이터 가져오기
  let sectionVisibility = {
    header: true,
    outline: true,
    introduction: true,
    kpi: true,
    summary: true,
    rewards: true,
    investmentPoints: true,
    history: true,
    risk: true,
    estimation: true,
    riskLevel: true,
  };

  try {
    const reportData = await fetchData("Report", {
      comp: "artist_id",
      sign: "==",
      val: artist_id,
    });
    if (reportData && reportData.sectionVisibility) {
      sectionVisibility = reportData.sectionVisibility;
    }
  } catch (error) {
    console.error("Report 데이터 가져오기 실패:", error);
  }

  return (
    <DefaultLayout>
      <ClientManager
        artist_id={artist_id}
        locale={locale}
        exchangeRate={exchangeRate}
        fixedExchangeRate={fixedExchangeRate}
        sectionVisibility={sectionVisibility}
      />
    </DefaultLayout>
  );
}
