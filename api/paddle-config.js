const REQUIRED_ENVIRONMENT = "sandbox";

const readRequiredEnvironmentVariable = (name) => {
  const value = process.env[name]?.trim();
  if (!value) throw new Error(`Missing required environment variable: ${name}`);
  return value;
};

const readCountryCode = (request) => {
  const header = request.headers["x-vercel-ip-country"];
  const value = Array.isArray(header) ? header[0] : header;
  const country = value?.trim().toUpperCase();
  return /^[A-Z]{2}$/.test(country || "") ? country : undefined;
};

export default function handler(request, response) {
  if (request.method !== "GET") {
    response.setHeader("Allow", "GET");
    return response.status(405).json({ error: "Method not allowed" });
  }

  try {
    const environment = readRequiredEnvironmentVariable("PADDLE_ENV");
    const clientToken = readRequiredEnvironmentVariable("PADDLE_CLIENT_TOKEN");

    if (environment !== REQUIRED_ENVIRONMENT) {
      throw new Error(`PADDLE_ENV must be ${REQUIRED_ENVIRONMENT} for this integration`);
    }
    if (!clientToken.startsWith("test_")) {
      throw new Error("PADDLE_CLIENT_TOKEN must be a sandbox client-side token prefixed with test_");
    }

    const payload = {
      environment,
      clientToken,
      prices: {
        starter: {
          month: readRequiredEnvironmentVariable("PADDLE_STARTER_MONTH_PRICE_ID"),
          year: readRequiredEnvironmentVariable("PADDLE_STARTER_YEAR_PRICE_ID"),
        },
        pro: {
          month: readRequiredEnvironmentVariable("PADDLE_PRO_MONTH_PRICE_ID"),
          year: readRequiredEnvironmentVariable("PADDLE_PRO_YEAR_PRICE_ID"),
        },
      },
    };

    const country = readCountryCode(request);
    if (country) payload.country = country;

    response.setHeader("Cache-Control", "private, no-store, max-age=0");
    return response.status(200).json(payload);
  } catch (error) {
    console.error("Paddle configuration error", error);
    response.setHeader("Cache-Control", "no-store");
    return response.status(500).json({ error: "Paddle checkout is not configured" });
  }
}
