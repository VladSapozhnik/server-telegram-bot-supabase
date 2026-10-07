import { IExchangeRateProvider } from "../ports/index.ts";

export class GetCurrencyRateUseCase {
  constructor(private rateProvider: IExchangeRateProvider) {}

  async execute(text: string): Promise<{
    found: boolean;
    currency?: string;
    rate?: number | null;
    messageText: string;
  }> {
    const lower = text.trim().toLowerCase();

    if (lower.startsWith("/start")) {
      return {
        found: false,
        messageText:
          "Привет! Отправь мне код любой валюты (например: EUR, GBP, JPY, PLN, CNY), и я пришлю её курс относительно USD.\n\nСписок всех доступных валют: /currencies",
      };
    }

    if (lower === "/currencies" || lower === "/list" || lower === "валюты" || lower === "/help") {
      const supported = await this.rateProvider.getSupportedCurrencies();
      const listStr = supported.sort().join(", ");
      return {
        found: true,
        messageText: `📋 Список всех доступных валют (${supported.length}):\n\n${listStr}\n\nОтправьте любой из этих кодов, чтобы узнать курс к USD.`,
      };
    }

    const detectedCurrency = await this.findCurrencyInText(text);

    if (!detectedCurrency) {
      // Проверяем, возможно пользователь ввёл 3-буквенный код валюты, которой нет в ЕЦБ/Frankfurter (например: BYN, RUB, KZT)
      const potentialCodes = text.match(/\b[a-zA-Z]{3}\b/g);
      if (potentialCodes && potentialCodes.length > 0) {
        const attempted = potentialCodes[0].toUpperCase();
        return {
          found: false,
          messageText: `Валюта ${attempted} не поддерживается европейским сервисом Frankfurter.\n\nПопробуйте одну из доступных: EUR, GBP, JPY, PLN, CNY (все валюты: /currencies).`,
        };
      }

      return {
        found: false,
        messageText:
          "Сообщение принято! Менеджер скоро ответит вам.\n\n(Если вы хотите узнать курс валюты к USD, отправьте её трёхбуквенный код, например: EUR, GBP, JPY, PLN, CNY, либо команду /currencies для полного списка).",
      };
    }

    if (detectedCurrency === "USD") {
      return {
        found: true,
        currency: "USD",
        rate: 1,
        messageText: "1 USD = 1.00 USD (базовая валюта).",
      };
    }

    const rate = await this.rateProvider.getUsdRate(detectedCurrency);
    if (rate === null) {
      return {
        found: true,
        currency: detectedCurrency,
        rate: null,
        messageText: `К сожалению, не удалось получить курс для валюты ${detectedCurrency} через сервис Frankfurter.`,
      };
    }

    const inverse = (1 / rate).toFixed(4);
    return {
      found: true,
      currency: detectedCurrency,
      rate,
      messageText: `Курс ${detectedCurrency} относительно USD:\n• 1 USD = ${rate} ${detectedCurrency}\n• 1 ${detectedCurrency} ≈ ${inverse} USD`,
    };
  }

  private async findCurrencyInText(text: string): Promise<string | null> {
    const supported = await this.rateProvider.getSupportedCurrencies();
    const supportedSet = new Set(supported.map((s) => s.toUpperCase()));

    const matches = text.match(/\b[a-zA-Z]{3}\b/g);
    if (!matches) {
      return null;
    }

    for (const match of matches) {
      const code = match.toUpperCase();
      if (supportedSet.has(code)) {
        return code;
      }
    }

    return null;
  }
}
