// Funkcja serwerowa Vercel: odbiera żądanie z przeglądarki,
// odczytuje adres IP i zapisuje wpis do bazy danych Supabase.

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    // Vercel przekazuje prawdziwe IP odwiedzającego w tym nagłówku
    const forwarded = req.headers['x-forwarded-for'];
    const ip = forwarded ? forwarded.split(',')[0].trim() : req.socket.remoteAddress;
    const userAgent = req.headers['user-agent'] || '';

    const SUPABASE_URL = process.env.SUPABASE_URL;
    const SUPABASE_KEY = process.env.SUPABASE_KEY;

    if (!SUPABASE_URL || !SUPABASE_KEY) {
      // Brak skonfigurowanych zmiennych środowiskowych — nie wysypujemy strony, tylko logujemy
      console.error('Brak SUPABASE_URL lub SUPABASE_KEY w zmiennych środowiskowych');
      return res.status(200).json({ ok: false, reason: 'not_configured' });
    }

    const response = await fetch(`${SUPABASE_URL}/rest/v1/visits`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'apikey': SUPABASE_KEY,
        'Authorization': `Bearer ${SUPABASE_KEY}`,
        'Prefer': 'return=minimal'
      },
      body: JSON.stringify({
        ip_address: ip,
        user_agent: userAgent
      })
    });

    if (!response.ok) {
      const errText = await response.text();
      console.error('Błąd zapisu do Supabase:', errText);
      return res.status(200).json({ ok: false });
    }

    return res.status(200).json({ ok: true });
  } catch (err) {
    console.error('Błąd funkcji log-visit:', err);
    return res.status(200).json({ ok: false });
  }
}
