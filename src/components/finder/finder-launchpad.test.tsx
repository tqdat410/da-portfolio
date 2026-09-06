import { fireEvent, render, screen } from "@testing-library/react";
import "@testing-library/jest-dom";
import { FinderLaunchpad } from "./finder-launchpad";

const mockPush = jest.fn();

jest.mock("next/navigation", () => ({
  __esModule: true,
  useRouter: () => ({
    push: mockPush,
  }),
}));

describe("FinderLaunchpad", () => {
  beforeAll(() => {
    Object.defineProperty(window, "matchMedia", {
      writable: true,
      value: jest.fn().mockImplementation(() => ({
        matches: false,
        media: "",
        onchange: null,
        addListener: jest.fn(),
        removeListener: jest.fn(),
        addEventListener: jest.fn(),
        removeEventListener: jest.fn(),
        dispatchEvent: jest.fn(),
      })),
    });
  });

  beforeEach(() => {
    mockPush.mockClear();
  });

  it("renders all launch items", () => {
    render(<FinderLaunchpad />);
    expect(screen.getByRole("button", { name: /da-portfolio\.exe/i })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: /projects/i })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: /certificates/i })).toBeInTheDocument();
  });

  it("opens projects in current tab on double click", () => {
    render(<FinderLaunchpad />);
    fireEvent.doubleClick(screen.getByRole("button", { name: /projects/i }));
    expect(mockPush).toHaveBeenCalledWith("/tqdat410/projects");
  });

  it("opens portfolio in current tab on double click", () => {
    render(<FinderLaunchpad />);
    fireEvent.doubleClick(screen.getByRole("button", { name: /da-portfolio\.exe/i }));
    expect(mockPush).toHaveBeenCalledWith("/");
  });

  it("opens selected item with Enter key", () => {
    render(<FinderLaunchpad />);
    const container = screen.getByLabelText("Finder workspace");

    fireEvent.keyDown(container, { key: "ArrowRight" });
    fireEvent.keyDown(container, { key: "Enter" });

    expect(mockPush).toHaveBeenCalledWith("/tqdat410/projects");
  });

  it("clears selection on background click and arrow keys can reselect", () => {
    render(<FinderLaunchpad />);
    const workspace = screen.getByLabelText("Finder workspace");

    fireEvent.click(workspace);
    fireEvent.keyDown(workspace, { key: "Enter" });
    expect(mockPush).not.toHaveBeenCalled();

    fireEvent.keyDown(workspace, { key: "ArrowLeft" });
    fireEvent.keyDown(workspace, { key: "Enter" });
    expect(mockPush).toHaveBeenCalledWith("/tqdat410/certificates");
  });
});
