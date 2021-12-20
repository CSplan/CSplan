declare type SMSXStore<R extends KeyedObject, D extends unknown> = {
  async init(): Promise<void>
  async create(data: D): Promise<{
    id: string
  }>
  update(id: string, data: Partial<R>): void
  async commit(id: string): Promise<R>|Promise<void>
  async delete(id: string): Promise<void>
}

declare type SingleResourceStore<D extends unknown> = {
  async init(): Promise<void>
  async create(data: D): Promise<void>
  async delete(): Promise<void>
}