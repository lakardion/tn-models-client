import { ChangeEvent, FormEvent, useRef, useState } from "react";
import "./App.css";
import {
  QueryClient,
  QueryClientProvider,
  useMutation,
  useQuery,
  useQueryClient,
} from "@tanstack/react-query";
import { todoApi } from "./services/todos";

const client = new QueryClient();

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
    <section style={{ display: "flex", flexDirection: "column" }}>
      <h1 style={{ fontSize: "2rem", textAlign: "center" }}>
        TODO #{todoData?.id}
      </h1>
      <p style={{ fontSize: "1rem" }}>{todoData?.content}</p>
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
    onSuccess() {
      qClient.invalidateQueries(["todos"]);
      setValue("");
      if (inputRef.current) {
        inputRef.current.focus();
      }
    },
  });
  const { mutate: deleteTodo, isLoading: isDeleting } = useMutation({
    mutationFn: todoApi.customServiceCalls.delete,
    onSuccess() {
      qClient.invalidateQueries(["todos"]);
    },
  });

  const { data } = useQuery(
    ["todos"],
    () => {
      const result = todoApi.list();
      return result;
    },
    {
      keepPreviousData: true,
    }
  );
  const inputRef = useRef<HTMLInputElement | null>();

  return (
    <main style={{ display: "flex", justifyContent: "center", gap: "1rem" }}>
      <section>
        <form
          onSubmit={handleSubmit}
          style={{ display: "flex", gap: "0.25rem" }}
        >
          <input
            value={value}
            onChange={onInputChange}
            disabled={isAddingTodo}
            ref={(ref) => {
              inputRef.current = ref;
            }}
            key={"input-todos"}
            placeholder="Add your TODO"
          />
          <button disabled={isAddingTodo}>
            {isAddingTodo ? "Loading" : "Add"}
          </button>
        </form>
        {data?.results.length ? (
          <ul
            style={{
              display: "flex",
              flexDirection: "column",
              gap: "0.5rem",
            }}
          >
            {data.results.map((t) => (
              <li key={t.id}>
                <div
                  onClick={() => {
                    setSelectedTodo(t.id);
                  }}
                  style={{
                    display: "flex",
                    gap: "0.5rem",
                    justifyContent: "space-between",
                    alignItems: "center",
                  }}
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
          <p style={{ fontStyle: "italic" }}> No todos added yet.</p>
        )}
      </section>
      <section style={{ flexGrow: 1 }}>
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
