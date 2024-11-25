import { usePathNavigator } from "./usePathNavigator";

// Mock the window.location object
const originalLocation = window.location;

beforeEach(() => {
  // Mock the initial URL
  delete (window as any).location; // 기존 location 객체 삭제
  window.location = {
    pathname: "/s24/login",
    search: "",
    href: "",
  } as Location;
});

afterEach(() => {
  // Restore the original location after tests
  window.location = originalLocation;
});

describe("routeToPage", () => {
  const { routeToPage } = usePathNavigator();
  test('routeToPage("register") navigates to the correct URL', () => {
    routeToPage("register");

    // 예상 경로 확인
    expect(window.location.href).toBe("/s24/register");
  });
});
