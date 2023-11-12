interface ImportMetaEnv {
  readonly VITE_DEBUG?: string
}

export function envString(name: keyof ImportMetaEnv, defaultValue?: string) {
  const value = import.meta.env[name] as string | undefined
  if (value !== undefined) {
    return value
  }
  if (defaultValue !== undefined) {
    return defaultValue
  }
  throw new Error(`Environment variable not defined: ${name}`)
}

export function envNumber(name: keyof ImportMetaEnv, defaultValue?: number) {
  const value = import.meta.env[name] as string | undefined
  if (value !== undefined) {
    return Number(value)
  }
  if (defaultValue !== undefined) {
    return defaultValue
  }
  throw new Error(`Environment variable not defined: ${name}`)
}

export function envBoolean(name: keyof ImportMetaEnv, defaultValue?: boolean) {
  const value = import.meta.env[name] as string | undefined
  if (value !== undefined) {
    switch (value.toLowerCase()) {
      case "true":
      case "1":
      case "on":
      case "yes":
        return true
    }
    return false
  }
  if (defaultValue !== undefined) {
    return defaultValue
  }
  throw new Error(`Environment variable not defined: ${name}`)
}
