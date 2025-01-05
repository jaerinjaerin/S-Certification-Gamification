// left menu types
// 단일 메뉴 항목 타입 정의
type MenuItem = {
  label: string;
  icon?: LucideIcon;
  href?: string;
  children?: MenuItem[];
};

// 메뉴 그룹 타입 정의
type MenuGroup = {
  title: string;
  items: MenuItem[];
};

// 전체 메뉴 타입
type MenuItems = MenuGroup[];
// left menu types
