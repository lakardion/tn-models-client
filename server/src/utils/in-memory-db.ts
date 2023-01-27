import { z, ZodRawShape } from "zod";

export const getPaginatedZod = <T extends ZodRawShape>(zodRawShape: T) =>
  z.object({
    count: z.number(),
    next: z.string().nullable(),
    previous: z.string().nullable(),
    results: z.array(z.object(zodRawShape)),
  });

const createZodRaw = {
  completed: z.boolean().default(false),
  content: z.string().min(1),
  completed_date: z.string().datetime().nullable(),
};

const entityZodRaw = { ...createZodRaw, id: z.number() };

export const createZod = z.object(createZodRaw);
export const updateZod = createZod.partial();
export const entityZod = z.object(entityZodRaw);
type Todo = z.infer<typeof entityZod>;
type TodoCreate = z.infer<typeof createZod>;

const DEFAULT_PAGE_SIZE = 25;
const DEFAULT_PAGE = 1;

/**
 * I just want a place where to store todos while I do tests in FE. Definitely not the best solution and not compatible with multiple clients
 */
export class InMemoryDB {
  private _todos: Todo[][] = [];
  private _savedPageSize = DEFAULT_PAGE_SIZE;
  private _idTracking = 0;

  private createId = () => {
    return ++this._idTracking;
  };

  get maxPages() {
    return this._todos.length;
  }

  private findTodoIdx = (
    todoId: number
  ): [page: number, idxWithinPage: number] => {
    for (const [idx, todoPage] of this._todos.entries()) {
      const idxWithinPage = todoPage.findIndex((t) => t.id === todoId);
      const isInThisPage = idxWithinPage !== -1;
      if (!isInThisPage) continue;
      return [idx, idxWithinPage];
    }
    return [-1, -1];
  };

  private redistributeTodos = (pageSize = this._savedPageSize) => {
    const flat = this._todos.flat();
    this._todos = [];
    let currentPage: Todo[] = [];
    let flushed = false;
    for (const [idx, todo] of flat.entries()) {
      if ((idx + 1) % pageSize === 0) {
        currentPage.push(todo);
        this._todos.push(currentPage);
        currentPage = [];
        flushed = true;
        continue;
      }
      flushed = false;
      currentPage.push(todo);
      if (idx === flat.length - 1 && !flushed) {
        this._todos.push(currentPage);
        currentPage = [];
        flushed = true;
      }
    }
  };
  add(todo: TodoCreate) {
    const created = { ...todo, id: this.createId() };
    this._todos[0] = [created, ...(this._todos[0] ?? [])];
    return created;
  }
  remove(todoId: number) {
    //must look up all pages
    const [pageIdx] = this.findTodoIdx(todoId);
    if (pageIdx !== -1) {
      this._todos[pageIdx] = this._todos[pageIdx].filter(
        (t) => t.id !== todoId
      );
    }
    this.redistributeTodos(this._savedPageSize);
  }
  update(todo: Partial<Todo> & { id: number }) {
    const { id, ...rest } = todo;
    const [pageIdx, todoIdx] = this.findTodoIdx(id);
    if (pageIdx === -1 || todoIdx === -1) return null;
    this._todos[pageIdx][todoIdx] = {
      ...this._todos[pageIdx][todoIdx],
      ...rest,
    };
    return this._todos[pageIdx][todoIdx];
  }
  getTodos(params?: {
    page_size?: string;
    page?: string;
  }): z.infer<ReturnType<typeof getPaginatedZod<typeof entityZodRaw>>> {
    const pageAsIndex = parseInt(params?.page ?? DEFAULT_PAGE.toString()) - 1;
    const pageSize = parseInt(
      params?.page_size ?? DEFAULT_PAGE_SIZE.toString()
    );
    this.redistributeTodos(pageSize);

    return {
      count: this._todos.reduce((sum, ts) => sum + ts.length, 0),
      next:
        pageAsIndex >= this._todos.length
          ? null
          : `http://localhost:3000/todos?page=${pageAsIndex + 1}`,
      previous:
        pageAsIndex <= 1
          ? null
          : `http://localhost:3000/todos?page=${pageAsIndex - 1}`,
      results: this._todos[pageAsIndex] ?? [],
    };
  }

  getSingle(todoId: number) {
    const [pageIdx, todoIdx] = this.findTodoIdx(todoId);
    if (pageIdx === -1) return undefined;
    return this._todos[pageIdx][todoIdx];
  }
}
