import {
  QueryClient,
  QueryClientProvider,
  useMutation,
  useQuery,
  useQueryClient,
} from "@tanstack/react-query";
import { Pagination } from "@thinknimble/tn-models";
import {
  ChangeEvent,
  ChangeEventHandler,
  FormEvent,
  useCallback,
  useMemo,
  useState,
} from "react";
import { MdClose, MdEdit, MdSave } from "react-icons/md";
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
  const qClient = useQueryClient();
  const { mutate: updatePartial, isLoading: isUpdating } = useMutation({
    mutationFn: todoApi.csc.updatePartial,
    onMutate: ({ id, ...rest }) => {
      //optimistic update
      qClient.setQueryData(["todo", id], (oldData) => {
        const knownOldData = oldData as typeof todoData;
        const mappedEntries = Object.entries(rest).flatMap(([k, v]) => {
          if (v === undefined) return [];
          return [[k, v]];
        });
        const stripUndefValues = Object.fromEntries(mappedEntries);
        return { ...knownOldData, ...stripUndefValues };
      });
    },
    onSuccess: () => {
      qClient.invalidateQueries(["todos"]);
      qClient.invalidateQueries(["todo", id]);
      setIsEditing(false);
      setEditValue("");
      setTouched(false);
    },
  });

  const [isEditing, setIsEditing] = useState(false);
  const handleCheckedChange: ChangeEventHandler<HTMLInputElement> = (e) => {
    // TODO: debounce
    updatePartial({ completed: e.target.checked, id });
  };

  const [touched, setTouched] = useState(false);
  const [editValue, setEditValue] = useState(todoData?.content);
  const handleSaveEdit = () => {
    updatePartial({ content: editValue, id });
  };
  const handleChangeContent: ChangeEventHandler<HTMLInputElement> = (e) => {
    setTouched(true);
    setEditValue(e.target.value);
  };

  if (!todoData) return <></>;

  return (
    <section className="flex flex-col p-4">
      <section className="flex flex-col gap-4 border border-black/30 rounded-lg p-16 relative">
        <section className="absolute top-4 right-4 flex gap-2">
          {isEditing ? (
            <>
              <button
                type="button"
                className="disabled:opacity-50"
                onClick={handleSaveEdit}
                disabled={!editValue || isUpdating}
              >
                <MdSave className="h-6 w-6" />
              </button>
              <button
                type="button"
                onClick={() => {
                  setIsEditing(false);
                  setEditValue(todoData.content);
                }}
              >
                <MdClose className="h-6 w-6" />
              </button>
            </>
          ) : todoData ? (
            <button
              type="button"
              onClick={() => {
                setIsEditing(true);
              }}
            >
              <MdEdit className="h-6 w-6" />
            </button>
          ) : null}
        </section>
        <h1 className="text-3xl text-center">TODO #{todoData?.id}</h1>
        {isEditing ? (
          <input
            className="p-2 bg-slate-300/50 rounded-lg"
            value={!editValue && !touched ? todoData.content : editValue}
            onChange={handleChangeContent}
          />
        ) : (
          <p className="text-base">{todoData?.content}</p>
        )}
        <section className="absolute bottom-4 right-4 ">
          <label className="flex gap-2">
            {todoData.completed ? "Awesome!" : "Done?"}
            <input
              name="completed"
              type="checkbox"
              checked={todoData.completed}
              onChange={handleCheckedChange}
            />
          </label>
        </section>
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
      completedDate: null,
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
      <section className="flex flex-col gap-4 px-4 py-2">
        <form onSubmit={handleSubmit} className="flex gap-4">
          <input
            value={value}
            onChange={onInputChange}
            key={"input-todos"}
            placeholder="Add your TODO"
            autoFocus
            className="p-2 bg-slate-300/50 rounded-lg"
          />
          <button
            disabled={isAddingTodo}
            className="py-1 px-2 bg-slate-800 text-white rounded-lg uppercase text-sm hover:bg-slate-500 disabled:opacity-50"
          >
            add
          </button>
        </form>
        <section className="flex justify-center">
          <PaginationControls
            currentPage={page}
            handleFirst={first}
            handleLast={last}
            handleNext={next}
            handlePrevious={previous}
            maxPage={maxPage}
          />
        </section>
        {paginatedTodos?.results.length ? (
          <ul className="flex flex-col gap-2">
            {paginatedTodos.results.map((t) => (
              <li key={t.id}>
                <div
                  onClick={() => {
                    setSelectedTodo(t.id);
                  }}
                  className="flex gap-2 justify-between items-center hover:cursor-pointer hover:underline"
                >
                  <p
                    style={{
                      textDecoration: t.completed ? "line-through" : undefined,
                      color: t.completed ? "rgba(0,0,0,0.5)" : undefined,
                    }}
                  >
                    {t.content}
                  </p>
                  <div>
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
                      <MdClose className="hover:fill-red-600" />
                    </button>
                  </div>
                </div>
              </li>
            ))}
          </ul>
        ) : (
          <p className="italic text-center"> No todos added yet.</p>
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
