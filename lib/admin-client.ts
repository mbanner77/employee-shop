type ApiErrorPayload = {
  error?: string
  message?: string
}

export const ADMIN_SESSION_EXPIRED_MESSAGE = "Admin-Sitzung abgelaufen. Bitte Seite neu laden und erneut anmelden."

export async function getAdminApiErrorMessage(response: Response, fallback: string) {
  let message = fallback

  try {
    const data = (await response.clone().json()) as ApiErrorPayload

    if (typeof data?.error === "string" && data.error.trim()) {
      message = data.error
    } else if (typeof data?.message === "string" && data.message.trim()) {
      message = data.message
    }
  } catch {
  }

  if (response.status === 401) {
    return ADMIN_SESSION_EXPIRED_MESSAGE
  }

  return message
}
