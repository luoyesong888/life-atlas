export async function GET(request: Request) {
  const searchParams = new URL(request.url).searchParams;
  const query = searchParams.get("q")?.trim();
  const latitude = Number(searchParams.get("lat"));
  const longitude = Number(searchParams.get("lng"));
  const isReverse = Number.isFinite(latitude) && Number.isFinite(longitude) && searchParams.has("lat") && searchParams.has("lng");
  if (!query && !isReverse) return Response.json({ results: [] });
  try {
    const url = new URL(isReverse ? "https://nominatim.openstreetmap.org/reverse" : "https://nominatim.openstreetmap.org/search");
    if (isReverse) {
      url.searchParams.set("lat", String(latitude));
      url.searchParams.set("lon", String(longitude));
      url.searchParams.set("zoom", "18");
    } else {
      url.searchParams.set("q", query!);
      url.searchParams.set("limit", "5");
    }
    url.searchParams.set("format", "jsonv2");
    url.searchParams.set("accept-language", "zh-CN");
    const response = await fetch(url, { headers: { "User-Agent": "LifeAtlas/1.0 (local personal app)" } });
    if (!response.ok) throw new Error("Geocoder unavailable");
    if (isReverse) {
      const item = await response.json() as { display_name: string; lat: string; lon: string; type: string };
      return Response.json({ results: [{ name: item.display_name, lat: Number(item.lat), lng: Number(item.lon), type: item.type }] });
    }
    const data = await response.json() as Array<{ display_name: string; lat: string; lon: string; type: string }>;
    return Response.json({ results: data.map(item => ({ name: item.display_name, lat: Number(item.lat), lng: Number(item.lon), type: item.type })) });
  } catch {
    return Response.json({ results: [], error: "地点搜索暂时不可用，可直接填写经纬度" }, { status: 502 });
  }
}
