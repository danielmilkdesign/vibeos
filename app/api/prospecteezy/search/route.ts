import { NextRequest, NextResponse } from "next/server";

export async function POST(req: NextRequest) {
  try {
    const { query, location, limit = 20 } = await req.json();

    const apiKey = process.env.SERPER_API_KEY;
    if (!apiKey) {
      return NextResponse.json(
        { error: "SERPER_API_KEY não configurada no ambiente da Vercel." },
        { status: 500 }
      );
    }

    const searchQuery = location ? `${query} em ${location}` : query;

    const response = await fetch("https://google.serper.dev/places", {
      method: "POST",
      headers: {
        "X-API-KEY": apiKey,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        q: searchQuery,
        gl: "br",
        hl: "pt-br",
        num: limit,
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      return NextResponse.json(
        { error: `Falha na Serper API: ${errorText}` },
        { status: response.status }
      );
    }

    const data = await response.json();
    const places = data.places || [];

    const leads = places.map((place: any) => ({
      id: place.cid || Math.random().toString(36).substring(2, 9),
      name: place.title || "",
      phone: place.phoneNumber || null,
      address: place.address || null,
      website: place.website || null,
      rating: place.rating || null,
      ratingCount: place.ratingCount || place.userRatingsTotal || null,
      category: place.category || "Outbound Serper",
      status: "novo",
    }));

    return NextResponse.json({ success: true, leads, total: leads.length });
  } catch (error: any) {
    return NextResponse.json(
      { error: error.message || "Erro interno do servidor" },
      { status: 500 }
    );
  }
}
