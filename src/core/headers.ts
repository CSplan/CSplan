export type Headers = {
  [header: string]: string
}

export namespace CSRF {
  const header = 'CSRF-Token'

  export function set(token: string): void {
    localStorage.setItem(header, token)
  }

  export function get(): Headers {
    return {
      [header]: localStorage.getItem(header)!
    }
  }
}

export namespace ContentType {
  const header = 'Content-Type'
  const contentTypes: {
    [type: string]: string
  } = {
    json: 'application/json'
  }

  export function get(type: string): Headers {
    return {
      [header]: contentTypes[type]
    }
  }
}

export function reqHeaders(contentType = 'json'): Headers {
  return {
    ...CSRF.get(),
    ...ContentType.get(contentType)
  }
}