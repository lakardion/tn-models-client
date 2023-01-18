import { ChangeEvent, FormEvent, useState } from "react";
import "./App.css";
import {
  QueryClient,
  QueryClientProvider,
  useQuery,
} from "@tanstack/react-query";
import { todoApi } from "./services/todos";

const client = new QueryClient();

const AppInner = () => {
  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
  };
  const [value, setValue] = useState("");
  const onInputChange = (e: ChangeEvent<HTMLInputElement>) => {
    setValue(e.target.value);
  };

  const { data: todos } = useQuery(["todos"], () => {
    //there's something going on with type inference... it's driving me mad
    return todoApi.customEndpoints.list();
  });
  return (
    <>
      <form onSubmit={handleSubmit}>
        <input value={value} onChange={onInputChange} />
      </form>
      <ul
        style={{ display: "flex", flexDirection: "column", gap: "0.5rem" }}
      ></ul>
    </>
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
