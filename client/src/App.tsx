import {
  QueryClient,
  QueryClientProvider,
  useMutation,
  useQuery,
  useQueryClient,
} from "@tanstack/react-query";
import { Pagination } from "@thinknimble/tn-models";
import { ChangeEvent, FormEvent, useCallback, useMemo, useState } from "react";
import { PaginationControls } from "./components/pagination-controls";
import { todoApi } from "./services/todos";
import { usePaginatedRequest, usePaginationHandlers } from "./utils";

const client = new QueryClient();

const DEFAULT_PAGE_SIZE = 2;

const SelectedTodo = ({ id }: { id: number }) => {
  const { data: todoData } = useQuery(["todo", id], {
    queryFn: () => {
      return todoApi.retrieve(id.toString());
    },
    enabled: Boolean(id),
    keepPreviousData: true,
  });
  if (!todoData) return <></>;
  return (
    <section
      style={{ display: "flex", flexDirection: "column", padding: "1rem" }}
    >
      <section
        style={{
          borderStyle: "solid",
          borderColor: "rgba(0 0 0 / 30%)",
          borderRadius: "8px",
          borderWidth: 0.5,
          padding: "4rem",
        }}
      >
        <h1 style={{ fontSize: "2rem", textAlign: "center" }}>
          TODO #{todoData?.id}
        </h1>
        <p style={{ fontSize: "1rem" }}>{todoData?.content}</p>
      </section>
    </section>
  );
};

const AppInner = () => {
  const [selectedTodo, setSelectedTodo] = useState(0);
  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    addTodo({
      completed: false,
      content: value,
      completedDate: new Date().toISOString(),
    });
  };
  const [value, setValue] = useState("");
  const onInputChange = (e: ChangeEvent<HTMLInputElement>) => {
    setValue(e.target.value);
  };
  const qClient = useQueryClient();
  const { mutate: addTodo, isLoading: isAddingTodo } = useMutation({
    mutationFn: todoApi.create,
    async onSuccess() {
      await qClient.invalidateQueries(["todos"]);
      setValue("");
    },
  });
  const { mutate: deleteTodo, isLoading: isDeleting } = useMutation({
    mutationFn: todoApi.csc.deleteTodo,
    onSuccess() {
      qClient.invalidateQueries(["todos"]);
    },
  });

  const paginatedRequest = useCallback((page: number) => {
    return todoApi.list({
      pagination: new Pagination({
        page,
        size: DEFAULT_PAGE_SIZE,
      }),
    });
  }, []);

  const {
    data: paginatedTodos,
    setPage,
    page,
  } = usePaginatedRequest(paginatedRequest, "todos");
  const maxPage = useMemo(
    () =>
      paginatedTodos?.count
        ? Math.ceil(paginatedTodos.count / DEFAULT_PAGE_SIZE)
        : 1,

    [paginatedTodos?.count]
  );
  const { first, last, next, previous } = usePaginationHandlers(
    setPage,
    maxPage
  );

  return (
    <main className="flex justify-center gap-4">
      <section>
        <form onSubmit={handleSubmit} className="flex gap-1">
          <input
            value={value}
            onChange={onInputChange}
            key={"input-todos"}
            placeholder="Add your TODO"
            autoFocus
          />
          <button disabled={isAddingTodo}>
            {isAddingTodo ? "Loading" : "Add"}
          </button>
        </form>
        <PaginationControls
          currentPage={page}
          handleFirst={first}
          handleLast={last}
          handleNext={next}
          handlePrevious={previous}
          maxPage={maxPage}
        />
        {paginatedTodos?.results.length ? (
          <ul className="flex flex-col gap-2">
            {paginatedTodos.results.map((t) => (
              <li key={t.id}>
                <div
                  onClick={() => {
                    setSelectedTodo(t.id);
                  }}
                  className="flex gap-2 justify-between items-center"
                >
                  <p
                    style={{
                      textDecoration: t.completed ? "line-through" : undefined,
                      color: t.completed ? "rgba(0,0,0,0.5)" : undefined,
                    }}
                  >
                    {t.content}
                  </p>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      deleteTodo(t.id);
                    }}
                    onMouseEnter={(e) => {
                      e.stopPropagation();
                    }}
                    disabled={isDeleting}
                  >
                    x
                  </button>
                </div>
              </li>
            ))}
          </ul>
        ) : (
          <p className="italic"> No todos added yet.</p>
        )}
      </section>
      <section className="flex-grow">
        <SelectedTodo id={selectedTodo} />
      </section>
    </main>
  );
};

function App() {
  return (
    <QueryClientProvider client={client}>
      <AppInner />
    </QueryClientProvider>
  );
}

export default App;
