export async function krw_usd() {
    try {
      const response = await fetch('https://api.exchangerate.host/convert?from=KRW&to=USD');
      const data = await response.json();
      console.log('krw-usd data: ', data);
      if (data && data.info && data.info.rate) {
        return data.info.rate;
      } else {
        console.error('krw_usd() error');
      }
    } catch (error) {
      return null;
    }
}