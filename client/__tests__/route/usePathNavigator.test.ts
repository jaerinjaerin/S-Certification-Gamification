import { usePathNavigator } from "../../route/usePathNavigator";

// Mock the window.location object
const originalLocation = window.location;

afterEach(() => {
  // Restore the original location after tests
  window.location = originalLocation;
});

describe("routeToPage in /s24", () => {
  beforeEach(() => {
    // Mock the initial URL for /s24
    delete (window as any).location;
    window.location = {
      pathname: "/s25/login",
      search: "",
      href: "",
    } as Location;
  });

  const { routeToPage } = usePathNavigator();

  test('routeToPage("register") navigates to the correct URL', () => {
    routeToPage("register");

    // 예상 경로 확인
    expect(window.location.href).toBe("/s25/register");
  });
});

describe("routeToPage in /quiz", () => {
  beforeEach(() => {
    // Mock the initial URL for /admin
    delete (window as any).location;
    window.location = {
      pathname: "/s25/ORG_502_ff_ko",
      search: "",
      href: "",
    } as Location;
  });

  const { routeToPage } = usePathNavigator();

  test('routeToPage("settings") navigates to the correct URL', () => {
    routeToPage("quiz");

    // 예상 경로 확인
    expect(window.location.href).toBe("/s25/ORG_502_ff_ko/quiz");
  });
});
