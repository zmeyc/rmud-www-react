export function descriptionForCloseEventCode(code: number) {
  switch (code) {
    case 1000: // Normal Closure
      return "Соединение закрыто."
    case 1001: // Going Away
      return "Соединение закрыто удаленной стороной."
    case 1002: // Protocol Error
      return "Соединение закрыто: ошибка протокола."
    case 1003: // Unsupported Data
      return "Соединение закрыто: неподдерживаемый тип данных."
    case 1005: // No Status Recvd
      return "Соединение закрыто: отсутствует статус."
    case 1006: // Abnormal Closure. Bowsers normally return only this code so don't elaborate:
      return "Соединение закрыто."
    case 1007: // Invalid frame payload data
      return "Соединение закрыто: некорректные данные."
    case 1008: // Policy violation
      return "Соединение закрыто: нарушение правил."
    case 1009: // Message too big
      return "Соединение закрыто: данные слишком большие."
    case 1010: // Missing Extension
      return "Соединение закрыто: сервер не поддерживает требуемые расширения."
    case 1011: // Internal Error
      return "Соединение закрыто: внутренняя ошибка сервера."
    case 1012: // Service Restart
      return "Соединение закрыто: сервер перезагружается."
    case 1013: // Try Again Later
      return "Соединение закрыто: сервер перегружен, попробуйте позже."
    case 1014: // Bad Gateway
      return "Соединение закрыто: ошибка связи с основным сервером."
    case 1015: // TLS Handshake
      return "Соединение закрыто: ошибка верификации сертификата."
    default:
      return "Соединение закрыто: неизвестная ошибка."
  }
}
