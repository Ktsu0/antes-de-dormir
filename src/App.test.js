import { render, screen } from "@testing-library/react";
import App from "./App";

jest.mock("./lib/supabase", () => {
  const queryBuilder = (result = { data: [], error: null }) => {
    const builder = {
      select: () => builder,
      order: () => builder,
      in: () => builder,
      eq: () => builder,
      limit: () => builder,
      update: () => builder,
      delete: () => builder,
      insert: () => Promise.resolve(result),
      maybeSingle: () => Promise.resolve(result),
      then: (resolve) => resolve(result),
    };
    return builder;
  };

  return {
    supabase: {
      auth: {
        getSession: () => Promise.resolve({ data: { session: null } }),
        getUser: () => Promise.resolve({ data: { user: null } }),
        onAuthStateChange: () => ({
          data: { subscription: { unsubscribe: () => {} } },
        }),
      },
      from: () => queryBuilder(),
      channel: () => {
        const channel = {
          on: () => channel,
          subscribe: () => channel,
        };
        return channel;
      },
      removeChannel: () => {},
    },
  };
});

test("renders the app shell without crashing", async () => {
  render(<App />);
  expect(await screen.findByAltText(/antes de dormir/i)).toBeInTheDocument();
});
