import { render, screen } from "@testing-library/react";
import { Header } from "./Header";

describe("Header component", () => {
  it("renders the logo", () => {
    render(<Header />);
    expect(screen.getByText(/EXPLORE/i)).toBeInTheDocument();
  });

  it("renders Sign in and Sign up buttons", () => {
    render(<Header />);
    expect(screen.getByText(/Sign in/i)).toBeInTheDocument();
    expect(screen.getByText(/Sign up/i)).toBeInTheDocument();
  });
});
